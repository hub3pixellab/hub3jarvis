import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Challenge {
  a: number;
  b: number;
  op: "+" | "−";
  answer: number;
}

function makeChallenge(): Challenge {
  const a = Math.floor(Math.random() * 8) + 2; // 2..9
  const b = Math.floor(Math.random() * 8) + 2; // 2..9
  // Mistura soma e subtração, sempre com resultado positivo.
  if (Math.random() < 0.5) {
    return { a, b, op: "+", answer: a + b };
  }
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return { a: hi, b: lo, op: "−", answer: hi - lo };
}

/**
 * Verificação de segurança simples (desafio aritmético) aplicada ao login e
 * ao cadastro, para barrar envios automatizados de bots.
 */
export function CaptchaField({
  onValidChange,
}: {
  onValidChange: (valid: boolean) => void;
}) {
  const { t } = useTranslation();
  const [challenge, setChallenge] = useState<Challenge>(() => makeChallenge());
  const [answer, setAnswer] = useState("");
  const valid = answer.trim() !== "" && Number(answer) === challenge.answer;

  // Mantém o callback em ref para não recriar o efeito a cada render.
  const cbRef = useRef(onValidChange);
  cbRef.current = onValidChange;
  useEffect(() => {
    cbRef.current(valid);
  }, [valid]);

  const refresh = () => {
    setChallenge(makeChallenge());
    setAnswer("");
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="captcha" className="flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
        {t("auth.captchaLabel")}
      </Label>
      <div className="flex items-center gap-3">
        <span className="flex min-h-10 select-none items-center rounded-md border border-gold/25 bg-navy/60 px-4 font-cinzel text-lg tracking-widest text-gold">
          {challenge.a} {challenge.op} {challenge.b} = ?
        </span>
        <Input
          id="captcha"
          inputMode="numeric"
          autoComplete="off"
          value={answer}
          onChange={(e) => setAnswer(e.target.value.replace(/[^0-9-]/g, ""))}
          placeholder={t("auth.captchaPlaceholder")}
          className="border-gold/25 bg-navy/60 text-cream placeholder:text-cream/35 focus:border-gold"
        />
        <button
          type="button"
          onClick={refresh}
          aria-label={t("auth.captchaRefresh")}
          title={t("auth.captchaRefresh")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gold/25 text-gold/80 transition hover:border-gold hover:text-gold"
        >
          <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
      {answer.trim() !== "" && !valid && (
        <p className="text-xs text-destructive">{t("auth.captchaError")}</p>
      )}
    </div>
  );
}

export default CaptchaField;
