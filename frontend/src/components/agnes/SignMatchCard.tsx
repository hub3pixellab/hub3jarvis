import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart, Loader2, Lock, Sparkle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ZODIAC_SIGNS, type ZodiacSignKey } from "@/domain/models";
import { useAuth } from "@/hooks/auth-context";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useSignMatch } from "@/hooks/useSignMatch";
import { useAnalysisDelivery } from "@/hooks/useAnalysisDelivery";
import { ShareCardRow } from "@/components/agnes/ShareCardRow";

interface SignMatchCardProps {
  /** "member" mostra a sinastria completa conforme o plano; "public" só o CTA. */
  variant?: "member" | "public";
  /** Id do container (para ancorar em páginas de campanha). */
  id?: string;
}

/** Lê o par de signos de um deep-link `?match=aries-leo`. */
function readMatchParam(): [ZodiacSignKey, ZodiacSignKey] | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("match");
  if (!raw) return null;
  const [a, b] = raw.toLowerCase().split("-");
  const known = ZODIAC_SIGNS as readonly string[];
  if (a && b && known.includes(a) && known.includes(b)) {
    return [a as ZodiacSignKey, b as ZodiacSignKey];
  }
  return null;
}

/**
 * Combinação dos signos (amor): leitura "por signo" gratuita gerada pela IA
 * do Mestre Agnes e a sinastria completa liberada conforme o plano.
 * Reutilizável em qualquer página (área de membros e campanhas de marketing).
 */
export function SignMatchCard({ variant = "member", id }: SignMatchCardProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data: entitlements } = useEntitlements(Boolean(user));
  const match = useSignMatch();
  const { startDelivery, dialogs } = useAnalysisDelivery();

  const initial = readMatchParam();
  const [sign1, setSign1] = useState<ZodiacSignKey>(initial?.[0] ?? "aries");
  const [sign2, setSign2] = useState<ZodiacSignKey>(initial?.[1] ?? "leo");
  const [tab, setTab] = useState<"sign" | "synastry">("sign");
  const [open, setOpen] = useState(false);

  const lang = i18n.resolvedLanguage ?? "pt-BR";
  const result = match.data;

  // Sinastria completa: liberada pelos planos (avulsa s4 ou crédito de compatibilidade).
  const hasSynastry =
    Boolean(entitlements?.analyses_avulsas?.includes("s4")) ||
    (entitlements?.compatibility_remaining ?? 0) > 0 ||
    entitlements?.plan_key === "ciclo97";

  const analyse = async () => {
    setOpen(true);
    try {
      await match.mutateAsync({ sign1, sign2, lang });
    } catch {
      setOpen(false);
    }
  };

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/horoscopo?match=${[sign1, sign2].sort().join("-")}`
      : "";

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-2 font-jost text-[10px] uppercase tracking-[0.25em] transition ${
      active
        ? "bg-gold text-navy-deep"
        : "border border-gold/30 text-cream/60 hover:text-gold"
    }`;

  return (
    <div id={id} className="rounded-sm border border-gold/25 bg-card p-6 md:p-8">
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-gold" strokeWidth={1.5} />
        <span className="font-jost text-[10px] uppercase tracking-[0.45em] text-gold">
          {t("signMatch.tag")}
        </span>
      </div>
      <h3 className="mt-3 font-cinzel text-3xl text-cream md:text-4xl">
        {t("signMatch.title")}
      </h3>
      <p className="mt-2 max-w-xl font-jost text-sm font-light leading-relaxed text-cream/60">
        {t("signMatch.subtitle")}
      </p>

      {/* Abas */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" className={tabClass(tab === "sign")} onClick={() => setTab("sign")}>
          {t("signMatch.tabSign")}
        </button>
        <button
          type="button"
          className={tabClass(tab === "synastry")}
          onClick={() => setTab("synastry")}
        >
          {t("signMatch.tabSynastry")}
        </button>
      </div>

      {tab === "sign" ? (
        <>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={sign1} onValueChange={(v) => setSign1(v as ZodiacSignKey)}>
              <SelectTrigger
                aria-label={t("signMatch.sign1")}
                className="w-full border-gold/25 bg-navy/60 text-cream focus:border-gold"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ZODIAC_SIGNS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`zodiac.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="hidden shrink-0 font-cinzel text-2xl text-gold sm:block">+</span>

            <Select value={sign2} onValueChange={(v) => setSign2(v as ZodiacSignKey)}>
              <SelectTrigger
                aria-label={t("signMatch.sign2")}
                className="w-full border-gold/25 bg-navy/60 text-cream focus:border-gold"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ZODIAC_SIGNS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`zodiac.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              type="button"
              onClick={() => void analyse()}
              disabled={match.isPending}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 font-jost text-[11px] uppercase tracking-[0.3em] text-navy-deep shadow-[0_0_24px_hsl(var(--gold)/0.3)] transition hover:bg-gold-light disabled:opacity-60"
            >
              {match.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
              ) : (
                <Sparkle className="h-3.5 w-3.5" strokeWidth={1.5} />
              )}
              {t("signMatch.action")}
            </button>
          </div>

          {match.isError && (
            <p className="mt-3 font-jost text-xs text-destructive" role="alert">
              {t("signMatch.error")}
            </p>
          )}
        </>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          <p className="max-w-xl font-jost text-sm font-light leading-relaxed text-cream/60">
            {t("signMatch.synastryHint")}
          </p>
          {variant === "member" && hasSynastry ? (
            <button
              type="button"
              onClick={() => startDelivery("s4", t("services.s4Name"))}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-gold px-6 py-3 font-jost text-[11px] uppercase tracking-[0.3em] text-navy-deep shadow-[0_0_24px_hsl(var(--gold)/0.3)] transition hover:bg-gold-light"
            >
              <Sparkle className="h-3.5 w-3.5" strokeWidth={1.5} />
              {t("signMatch.startSynastry")}
            </button>
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-md border border-gold/25 bg-navy/40 p-4">
              <span className="inline-flex items-center gap-2 font-jost text-[10px] uppercase tracking-[0.3em] text-gold/80">
                <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                {t("signMatch.synastryLocked")}
              </span>
              <p className="max-w-md font-jost text-xs leading-relaxed text-cream/55">
                {t("signMatch.synastryPlans")}
              </p>
              <a
                href="/#pagamento"
                className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 font-jost text-[10px] uppercase tracking-[0.3em] text-gold transition hover:bg-gold/10"
              >
                {t("signMatch.seePlans")}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Pop-up com o resultado da combinação */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto border-gold/30 bg-navy p-0 text-cream">
          <div className="flex flex-col gap-5 p-6 md:p-8">
            <div className="flex items-center gap-3 border-b border-gold/15 pb-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-royal/40 text-gold">
                <Heart className="h-5 w-5" strokeWidth={1.25} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-jost text-[10px] uppercase tracking-[0.35em] text-gold/70">
                  {t("signMatch.tag")}
                </p>
                <DialogTitle className="mt-1 font-cinzel text-2xl text-cream md:text-3xl">
                  {t(`zodiac.${sign1}`)} <span className="text-gold">+</span>{" "}
                  {t(`zodiac.${sign2}`)}
                </DialogTitle>
              </div>
            </div>

            {match.isPending || !result ? (
              <div className="flex flex-col items-center gap-4 py-14 text-center">
                <Loader2 className="h-7 w-7 animate-spin text-gold" strokeWidth={1.5} />
                <p className="font-jost text-sm text-cream/60">
                  {t("signMatch.generating")}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <span className="font-cinzel text-4xl text-gold-gradient">
                    {result.score}%
                  </span>
                  <Badge className="border-gold/40 bg-gold/5 font-jost text-[9px] uppercase tracking-[0.2em] text-gold">
                    {t("signMatch.scoreLabel")}
                  </Badge>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-navy/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-royal to-gold transition-[width] duration-500"
                    style={{ width: `${result.score}%` }}
                  />
                </div>

                {result.summary && (
                  <p className="whitespace-pre-line font-jost text-sm leading-relaxed text-cream/85">
                    {result.summary}
                  </p>
                )}

                {(result.strengths || result.challenges) && (
                  <div className="grid grid-cols-1 gap-4 border-t border-gold/15 pt-4 sm:grid-cols-2">
                    {result.strengths && (
                      <div>
                        <p className="font-jost text-[9px] uppercase tracking-[0.3em] text-cream/45">
                          {t("signMatch.strengths")}
                        </p>
                        <p className="mt-1.5 font-jost text-sm leading-relaxed text-cream/75">
                          {result.strengths}
                        </p>
                      </div>
                    )}
                    {result.challenges && (
                      <div>
                        <p className="font-jost text-[9px] uppercase tracking-[0.3em] text-cream/45">
                          {t("signMatch.challenges")}
                        </p>
                        <p className="mt-1.5 font-jost text-sm leading-relaxed text-cream/75">
                          {result.challenges}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {result.advice && (
                  <p className="border-t border-gold/15 pt-4 font-cinzel text-base italic text-gold-gradient">
                    “{result.advice}”
                  </p>
                )}

                <ShareCardRow
                  data={{
                    name1: t(`zodiac.${sign1}`),
                    name2: t(`zodiac.${sign2}`),
                    score: result.score,
                    summary: result.summary,
                    advice: result.advice,
                  }}
                  shareUrl={shareUrl}
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {dialogs}
    </div>
  );
}

export default SignMatchCard;
