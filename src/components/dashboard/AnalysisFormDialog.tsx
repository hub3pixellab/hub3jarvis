import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileUp, Loader2, Sparkle, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/auth-context";
import {
  DOCUMENTS_BUCKET,
  DOCUMENT_MAX_BYTES,
  DOCUMENT_MIME_TYPES,
  uploadDocument,
} from "@/services/deliveries";

type FieldType = "text" | "date" | "time" | "textarea";

interface FieldDef {
  name: string;
  type: FieldType;
  required?: boolean;
}

/** Campos pedidos em cada análise (os básicos + os específicos do saber). */
const FORM_FIELDS: Record<string, FieldDef[]> = {
  s1: [
    { name: "nome_completo", type: "text", required: true },
    { name: "data_nascimento", type: "date", required: true },
    { name: "hora_nascimento", type: "time" },
    { name: "cidade_nascimento", type: "text" },
    { name: "observacoes", type: "textarea" },
  ],
  s2: [
    { name: "nome_completo", type: "text", required: true },
    { name: "nome_nascimento", type: "text" },
    { name: "data_nascimento", type: "date", required: true },
    { name: "observacoes", type: "textarea" },
  ],
  s3: [
    { name: "nome_completo", type: "text", required: true },
    { name: "data_nascimento", type: "date", required: true },
    { name: "hora_nascimento", type: "time" },
    { name: "observacoes", type: "textarea" },
  ],
  s4: [
    { name: "nome_completo", type: "text", required: true },
    { name: "data_nascimento", type: "date", required: true },
    { name: "hora_nascimento", type: "time" },
    { name: "cidade_nascimento", type: "text" },
    { name: "parceiro_nome", type: "text", required: true },
    { name: "parceiro_data_nascimento", type: "date", required: true },
    { name: "parceiro_hora_nascimento", type: "time" },
    { name: "parceiro_cidade_nascimento", type: "text" },
    { name: "observacoes", type: "textarea" },
  ],
  s5: [
    { name: "nome_completo", type: "text", required: true },
    { name: "data_nascimento", type: "date", required: true },
    { name: "pergunta", type: "textarea", required: true },
    { name: "observacoes", type: "textarea" },
  ],
};

interface AnalysisFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisKey: string;
  title: string;
  onSubmitted: (formData: Record<string, unknown>, documentPath: string | null) => void;
}

/**
 * Pop-up com o formulário de dados de cada análise. Permite anexar a
 * certidão de nascimento para quem não sabe todas as informações.
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
  const [values, setValues] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fields = FORM_FIELDS[analysisKey] ?? FORM_FIELDS.s1;

  const setValue = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const reset = () => {
    setValues({});
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
    if (!user) return;
    setIsUploading(true);
    try {
      let documentPath: string | null = null;
      if (file) {
        documentPath = await uploadDocument(user.id, file);
      }
      onSubmitted(
        { ...values, tem_documento: Boolean(file) },
        documentPath,
      );
      reset();
      onOpenChange(false);
    } catch {
      toast.error(t("deliveryForm.errorUpload"));
    } finally {
      setIsUploading(false);
    }
  };

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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={`flex flex-col gap-2 ${
                  field.type === "textarea" ? "sm:col-span-2" : ""
                }`}
              >
                <Label htmlFor={`f-${field.name}`}>
                  {t(`deliveryForm.f.${field.name}`)}
                  {field.required && <span className="text-gold"> *</span>}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={`f-${field.name}`}
                    rows={3}
                    value={values[field.name] ?? ""}
                    onChange={(e) => setValue(field.name, e.target.value)}
                    className="border-gold/25 bg-navy/60 text-cream placeholder:text-cream/35 focus:border-gold"
                  />
                ) : (
                  <Input
                    id={`f-${field.name}`}
                    type={field.type}
                    value={values[field.name] ?? ""}
                    onChange={(e) => setValue(field.name, e.target.value)}
                    className="border-gold/25 bg-navy/60 text-cream placeholder:text-cream/35 focus:border-gold [color-scheme:dark]"
                  />
                )}
              </div>
            ))}
          </div>

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

export { DOCUMENTS_BUCKET };
export default AnalysisFormDialog;
