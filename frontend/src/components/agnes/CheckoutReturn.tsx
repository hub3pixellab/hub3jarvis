import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth-context";
import { useInvalidateEntitlements } from "@/hooks/useEntitlements";

/**
 * Ao voltar do checkout do Stripe, confirma a sessão no backend e concede os
 * direitos do plano. Serve de reforço ao webhook: garante que a compra seja
 * registrada mesmo que o evento demore (ou não chegue).
 */
export function CheckoutReturn() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const invalidate = useInvalidateEntitlements();
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !user) return;

    const hash = window.location.hash;
    const qIndex = hash.indexOf("?");
    const params = new URLSearchParams(
      qIndex >= 0 ? hash.slice(qIndex + 1) : window.location.search,
    );
    const status = params.get("status");
    const sessionId = params.get("session_id");
    if (status !== "success" || !sessionId) return;

    started.current = true;

    const clean = () => {
      window.history.replaceState(null, "", `${window.location.pathname}#pagamento`);
    };

    void (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("confirm-checkout", {
          body: { sessionId },
        });
        if (error) throw error;
        if (data?.paid) {
          invalidate();
          toast.success(t("checkout.successTitle"), {
            description: t("checkout.successDesc"),
          });
        }
      } catch {
        toast.error(t("checkout.errorTitle"), {
          description: t("checkout.errorDesc"),
        });
      } finally {
        clean();
      }
    })();
  }, [user, invalidate, t]);

  return null;
}

export default CheckoutReturn;
