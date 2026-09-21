import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileUp, Loader2, Sparkle, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/auth-context";
import {
  DOCUMENTS_BUCKET,
  DOCUMENT_MAX_BYTES,
  DOCUMENT_MIME_TYPES,
  uploadDocument,
} from "@/services/deliveries";
import {
  ENNEAGRAM_ITEMS,
  scoreEnneagram,
  type LikertValue,
} from "@/domain/enneagram";
import { QUESTIONNAIRES, type QField } from "@/domain/questionnaires";

const SCALE: LikertValue[] = [1, 2, 3, 4, 5];

interface AnalysisFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisKey: string;
  title: string;
  onSubmitted: (formData: Record<string, unknown>, documentPath: string | null) => void;
}

/**
 * Questionário profissional de cada análise, com anexo de certidão e,
 * para o Eneagrama, um teste de 27 afirmativas que calcula o tipo.
 */
export function AnalysisFormDialog({
  open,
  onOpenChange,
  analysisKey,
  title,
  onSubmitted,
}: AnalysisFormDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const fields = QUESTIONNAIRES[analysisKey] ?? QUESTIONNAIRES.s1;
  const isEneagrama = analysisKey === "s3";

  const [values, setValues] = useState<Record<string, string>>({});
  const [likert, setLikert] = useState<Record<string, LikertValue>>({});
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const enneagramScore = useMemo(
    () => (isEneagrama ? scoreEnneagram(likert) : null),
    [isEneagrama, likert],
  );

  const answeredCount = ENNEAGRAM_ITEMS.filter((i) => likert[i.id]).length;

  const setValue = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const reset = () => {
    setValues({});
    setLikert({});
    setFile(null);
  };

  const pickFile = (selected: File | null) => {
    if (!selected) return;
    if (selected.size > DOCUMENT_MAX_BYTES) {
      toast.error(t("deliveryForm.errorFileSize"));
      return;
    }
    if (selected.type && !DOCUMENT_MIME_TYPES.has(selected.type)) {
      toast.error(t("deliveryForm.errorFileType"));
      return;
    }
    setFile(selected);
  };

  const submit = async () => {
    const missing = fields.find((f) => f.required && !values[f.name]?.trim());
    if (missing) {
      toast.error(t("deliveryForm.errorRequired"));
      return;
    }
    // Eneagrama: exige o questionário completo
    if (isEneagrama && answeredCount < ENNEAGRAM_ITEMS.length) {
      toast.error(t("deliveryForm.errorEneagrama"));
      return;
    }
    if (!user) return;

    const formData: Record<string, unknown> = {
      ...values,
      tem_documento: Boolean(file),
    };
    if (enneagramScore) {
      formData.eneagrama_tipo = enneagramScore.dominant;
      formData.eneagrama_asa = enneagramScore.wing;
      formData.eneagrama_respostas = likert;
      formData.eneagrama_pontuacao = enneagramScore.byType;
    }

    setIsUploading(true);
    try {
      let documentPath: string | null = null;
      if (file) {
        documentPath = await uploadDocument(user.id, file);
      }
      onSubmitted(formData, documentPath);
      reset();
      onOpenChange(false);
    } catch {
      toast.error(t("deliveryForm.errorUpload"));
    } finally {
      setIsUploading(false);
    }
  };

  // Agrupa campos por seção, mantendo a ordem
  const sections = useMemo(() => {
    const map = new Map<string, QField[]>();
    for (const f of fields) {
      const key = f.sectionKey ?? "questionnaire.section.birth";
      const list = map.get(key) ?? [];
      list.push(f);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [fields]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto border-gold/30 bg-navy p-0 text-cream">
        <div className="flex flex-col gap-5 p-6 md:p-8">
          <div className="flex items-center gap-3 border-b border-gold/15 pb-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-royal/40 text-gold">
              <Sparkle className="h-5 w-5" strokeWidth={1.25} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-jost text-[10px] uppercase tracking-[0.35em] text-gold/70">
                {t("deliveryForm.eyebrow")}
              </p>
              <DialogTitle className="mt-1 font-cinzel text-2xl text-cream md:text-3xl">
                {title}
              </DialogTitle>
            </div>
          </div>

          <p className="font-jost text-sm leading-relaxed text-cream/60">
            {t("deliveryForm.subtitle")}
          </p>

          {sections.map(([sectionKey, sectionFields]) => (
            <div key={sectionKey} className="flex flex-col gap-4">
              <SectionTitle>{t(sectionKey)}</SectionTitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sectionFields.map((field) => (
                  <Field
                    key={field.name}
                    field={field}
                    value={values[field.name] ?? ""}
                    onChange={(v) => setValue(field.name, v)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Teste do Eneagrama */}
          {isEneagrama && (
            <div className="flex flex-col gap-4 border-t border-gold/15 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <SectionTitle>{t("questionnaire.section.eneagramaTeste")}</SectionTitle>
                <Badge className="border-gold/40 bg-gold/5 px-2 py-0.5 font-jost text-[9px] uppercase tracking-[0.2em] text-gold">
                  {answeredCount}/{ENNEAGRAM_ITEMS.length}
                </Badge>
              </div>
              <p className="font-jost text-xs leading-relaxed text-cream/50">
                {t("questionnaire.eneagramaHint")}
              </p>

              <div className="flex flex-col gap-3">
                {ENNEAGRAM_ITEMS.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-md border border-gold/15 bg-navy/40 p-3"
                  >
                    <p className="font-jost text-sm leading-relaxed text-cream/85">
                      <span className="mr-2 font-cinzel text-gold/70">
                        {String(idx + 1).padStart(2, "0")}.
                      </span>
                      {t(`eneagrama.q.${item.id}`)}
                    </p>
                    <RadioGroup
                      value={String(likert[item.id] ?? "")}
                      onValueChange={(v) =>
                        setLikert((prev) => ({
                          ...prev,
                          [item.id]: Number(v) as LikertValue,
                        }))
                      }
                      className="flex flex-wrap items-center gap-1"
                    >
                      {SCALE.map((n) => (
                        <div
                          key={n}
                          className="flex flex-col items-center gap-1"
                        >
                          <RadioGroupItem
                            value={String(n)}
                            id={`${item.id}-${n}`}
                            className="border-gold/40 text-gold data-[state=checked]:border-gold"
                          />
                          <label
                            htmlFor={`${item.id}-${n}`}
                            className="font-jost text-[9px] uppercase tracking-wider text-cream/45"
                          >
                            {t(`eneagrama.scale.${n}`)}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>

              {enneagramScore && answeredCount === ENNEAGRAM_ITEMS.length && (
                <div className="rounded-md border border-gold/40 bg-royal/30 p-4">
                  <p className="font-jost text-[10px] uppercase tracking-[0.3em] text-gold">
                    {t("questionnaire.eneagramaResultado")}
                  </p>
                  <p className="mt-2 font-cinzel text-2xl text-gold-gradient">
                    {t(`eneagrama.tipo.${enneagramScore.dominant}`)}
                    {enneagramScore.wing &&
                      ` – ${t(`eneagrama.tipo.${enneagramScore.wing}`)}`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Anexo: certidão de nascimento */}
          <div className="flex flex-col gap-2 border-t border-gold/15 pt-4">
            <Label>{t("deliveryForm.attachLabel")}</Label>
            <p className="font-jost text-xs leading-relaxed text-cream/50">
              {t("deliveryForm.attachHint")}
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="flex items-center gap-3 rounded-md border border-gold/25 bg-navy/40 px-3 py-2">
                <FileUp className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                <span className="min-w-0 flex-1 truncate font-jost text-xs text-cream/80">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  aria-label={t("deliveryForm.removeFile")}
                  className="shrink-0 text-cream/50 transition hover:text-destructive"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/50 px-4 py-2 font-jost text-[10px] uppercase tracking-[0.25em] text-gold transition hover:bg-gold/10"
              >
                <FileUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                {t("deliveryForm.attachCta")}
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gold/15 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="text-cream/60 hover:bg-gold/5 hover:text-cream"
            >
              {t("deliveryForm.cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => void submit()}
              disabled={isUploading}
              className="bg-gold text-navy-deep shadow-[0_0_24px_hsl(var(--gold)/0.3)] hover:bg-gold-light"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <Sparkle className="h-4 w-4" strokeWidth={1.5} />
              )}
              {isUploading ? t("deliveryForm.submitting") : t("deliveryForm.submit")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const SectionTitle = ({ children }: { children: string }) => (
  <h4 className="flex items-center gap-2 font-cinzel text-sm uppercase tracking-[0.3em] text-gold/90">
    <span className="h-px w-5 bg-gold/60" />
    {children}
  </h4>
);

function Field({
  field,
  value,
  onChange,
}: {
  field: QField;
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useTranslation();
  if (field.type === "select") {
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={`q-${field.name}`}>
          {t(field.labelKey)}
          {field.required && <span className="text-gold"> *</span>}
        </Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger
            id={`q-${field.name}`}
            className="w-full border-gold/25 bg-navy/60 text-cream focus:border-gold"
          >
            <SelectValue placeholder="…" />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {t(`questionnaire.opt.${opt}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {field.hintKey && (
          <p className="text-[11px] text-cream/45">{t(field.hintKey)}</p>
        )}
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor={`q-${field.name}`}>
          {t(field.labelKey)}
          {field.required && <span className="text-gold"> *</span>}
        </Label>
        <Textarea
          id={`q-${field.name}`}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-gold/25 bg-navy/60 text-cream placeholder:text-cream/35 focus:border-gold"
        />
        {field.hintKey && (
          <p className="text-[11px] text-cream/45">{t(field.hintKey)}</p>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`q-${field.name}`}>
        {t(field.labelKey)}
        {field.required && <span className="text-gold"> *</span>}
      </Label>
      <Input
        id={`q-${field.name}`}
        type={field.type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-gold/25 bg-navy/60 text-cream placeholder:text-cream/35 focus:border-gold [color-scheme:dark]"
      />
      {field.hintKey && (
        <p className="text-[11px] text-cream/45">{t(field.hintKey)}</p>
      )}
    </div>
  );
}

export { DOCUMENTS_BUCKET };
export default AnalysisFormDialog;
