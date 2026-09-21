import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Set do SoundCloud ("Unreleased" — Massive Jack) tocando em loop no top bar.
 * Usa a API oficial de widgets do SoundCloud (SC.Widget): o iframe fica oculto
 * e o usuário controla apenas mudo/volume, como pedido.
 *
 * Nota: o widget exige a URL da API do playlist + secret_token (formato que o
 * oEmbed do SoundCloud devolve), não a URL pública do set — sem o secret_token
 * o player retorna 404 e nada toca.
 */
const SOUNDCLOUD_PLAYLIST_URL =
  "https://api.soundcloud.com/playlists/2225068514";
const SOUNDCLOUD_SECRET_TOKEN = "s-xH8mqZ5tU1d";

const WIDGET_URL =
  "https://w.soundcloud.com/player/?" +
  new URLSearchParams({
    url: SOUNDCLOUD_PLAYLIST_URL,
    secret_token: SOUNDCLOUD_SECRET_TOKEN,
    auto_play: "true",
    hide_related: "true",
    show_comments: "false",
    show_user: "false",
    show_reposts: "false",
    visual: "false",
    show_artwork: "false",
    show_playcount: "false",
    show_teaser: "false",
    sharing: "false",
    download: "false",
    buying: "false",
    liking: "false",
  }).toString();

interface SoundCloudWidget {
  play: () => void;
  setVolume: (volume: number) => void;
  bind: (event: string, callback: () => void) => void;
}

interface SoundCloudAPI {
  Widget: (iframe: HTMLIFrameElement) => SoundCloudWidget;
}

declare global {
  interface Window {
    SC?: SoundCloudAPI;
  }
}

const SoundCloudPlayer = () => {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SoundCloudWidget | null>(null);
  const lastVolumeRef = useRef(80);

  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(() => Boolean(window.SC));

  // Carrega a API de widgets do SoundCloud uma única vez.
  useEffect(() => {
    if (window.SC) {
      setApiLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://w.soundcloud.com/player/api.js";
    script.async = true;
    script.onload = () => setApiLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Inicializa o widget quando iframe + API estiverem disponíveis.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !apiLoaded || !window.SC) return;

    const widget = window.SC.Widget(iframe);
    widgetRef.current = widget;
    widget.setVolume(volume);

    const onReady = () => {
      setReady(true);
      // Tenta o autoplay assim que o widget carrega; se o navegador bloquear,
      // o primeiro toque em mudo/volume ativa a reprodução.
      widget.play();
    };
    // Recomeça ao terminar a faixa — loop contínuo.
    widget.bind("finish", () => widget.play());
    widget.bind("ready", onReady);

    return () => {
      widgetRef.current = null;
    };
  }, [apiLoaded, volume]);

  const applyVolume = useCallback((next: number, silent = false) => {
    const clamped = Math.max(0, Math.min(100, next));
    lastVolumeRef.current = clamped;
    setVolume(clamped);
    widgetRef.current?.setVolume(clamped);
    if (silent && clamped > 0) setMuted(false);
  }, []);

  const toggleMute = () => {
    const widget = widgetRef.current;
    if (!widget) return;
    // Garante que a reprodução comece no primeiro clique (autoplay costuma ser
    // bloqueado pelo navegador até uma interação do usuário).
    if (!started) {
      widget.play();
      setStarted(true);
    }
    if (muted) {
      widget.setVolume(lastVolumeRef.current);
      setVolume(lastVolumeRef.current);
      setMuted(false);
    } else {
      widget.setVolume(0);
      setMuted(true);
    }
  };

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label={t("player.ariaLabel")}
    >
      <iframe
        ref={iframeRef}
        src={WIDGET_URL}
        title={t("player.ariaLabel")}
        className="pointer-events-none absolute h-px w-px opacity-0"
        tabIndex={-1}
        aria-hidden
      />

      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? t("player.unmuteAria") : t("player.muteAria")}
        title={muted ? t("player.unmuteAria") : t("player.muteAria")}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold transition hover:bg-gold/15 hover:shadow-[0_0_14px_hsl(var(--gold)/0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        {muted || volume === 0 ? (
          <VolumeX className="h-4 w-4" strokeWidth={1.5} />
        ) : (
          <Volume2 className="h-4 w-4" strokeWidth={1.5} />
        )}
      </button>

      <input
        type="range"
        min={0}
        max={100}
        value={muted ? 0 : volume}
        onChange={(e) => applyVolume(Number(e.target.value))}
        aria-label={t("player.volumeLabel")}
        style={{ "--volume": `${muted ? 0 : volume}%` } as CSSProperties}
        className="volume-slider w-20 md:w-24"
      />
    </div>
  );
};

export default SoundCloudPlayer;
