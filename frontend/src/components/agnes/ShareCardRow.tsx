import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Download, Instagram, Link2, Share2 } from "lucide-react";
import {
  compatCardFile,
  downloadCompatCard,
  type CompatCardData,
} from "@/lib/cardImage";

interface ShareCardRowProps {
  data: CompatCardData;
  /** URL pública do card (para o link compartilhado). */
  shareUrl: string;
}

/**
 * Compartilhamento do card: imagem para post e story do Instagram,
 * compartilhamento nativo e cópia do link.
 */
export function ShareCardRow({ data, shareUrl }: ShareCardRowProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      /* clipboard indisponível */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const file = await compatCardFile(data, "post");
      const shareData: ShareData = {
        title: "Mestre Agnes",
        text: t("signMatch.shareText", { a: data.name1, b: data.name2 }),
        url: shareUrl,
      };
      if (file && navigator.canShare?.({ files: [file] })) {
        shareData.files = [file];
      }
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await copy();
      }
    } catch {
      /* compartilhamento cancelado */
    } finally {
      setBusy(false);
    }
  };

  const btn =
    "inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 font-jost text-[10px] uppercase tracking-[0.25em] text-gold transition hover:bg-gold/10";

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-gold/15 pt-4">
      <span className="inline-flex items-center gap-2 font-jost text-[10px] uppercase tracking-[0.3em] text-cream/45">
        <Instagram className="h-3.5 w-3.5 text-gold/70" strokeWidth={1.5} />
        {t("signMatch.shareLabel")}
      </span>

      <button type="button" onClick={() => void nativeShare()} disabled={busy} className={btn}>
        <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        {t("signMatch.share")}
      </button>

      <button
        type="button"
        onClick={() => downloadCompatCard(data, "post")}
        className={btn}
      >
        <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
        {t("signMatch.downloadPost")}
      </button>

      <button
        type="button"
        onClick={() => downloadCompatCard(data, "story")}
        className={btn}
      >
        <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
        {t("signMatch.downloadStory")}
      </button>

      <button type="button" onClick={() => void copy()} className={btn}>
        {copied ? (
          <Check className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
        ) : (
          <Link2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        )}
        {copied ? t("signMatch.copied") : t("signMatch.copyLink")}
      </button>
    </div>
  );
}

export default ShareCardRow;
