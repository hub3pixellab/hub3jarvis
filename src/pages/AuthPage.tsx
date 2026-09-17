import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Sparkle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signupSchema = z.object({
  display_name: z.string().trim().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const { t, i18n } = useTranslation();
  const { user, initializing, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { display_name: "", email: "", password: "" },
  });

  const mapError = (err: unknown) => {
    const message = (err as { message?: string })?.message ?? "";
    if (/invalid login credentials/i.test(message)) return t("auth.errorInvalid");
    if (/already registered|already been registered/i.test(message))
      return t("auth.errorEmailExists");
    if (/password/i.test(message) && /weak/i.test(message))
      return t("auth.errorPassword");
    return t("auth.errorGeneric");
  };

  const onLogin = async (values: LoginValues) => {
    try {
      await signIn(values.email, values.password);
      toast.success(t("auth.loginSuccess"));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      loginForm.setError("password", { message: mapError(err) });
    }
  };

  const onSignup = async (values: SignupValues) => {
    try {
      await signUp(
        values.email,
        values.password,
        values.display_name,
        i18n.resolvedLanguage ?? "pt-BR",
      );
      toast.success(t("auth.signupSuccess"));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      signupForm.setError("password", { message: mapError(err) });
    }
  };

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-deep">
        <Loader2 className="h-8 w-8 animate-spin text-gold" strokeWidth={1.25} />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  const cardCls =
    "w-full rounded-lg border border-gold/25 bg-navy/85 shadow-[0_30px_80px_-30px_hsl(0_0%_0%/0.85)] backdrop-blur-xl supports-[backdrop-filter]:bg-navy/60";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-navy to-navy-deep px-6 py-20">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="starfield absolute inset-0 opacity-25" />
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-royal/25 blur-[140px]" />
        <div className="absolute -bottom-24 right-10 h-80 w-80 rounded-full bg-gold/10 blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/50 bg-royal/40 shadow-[0_0_30px_hsl(var(--gold)/0.25)]">
            <Sparkle className="h-5 w-5 text-gold" strokeWidth={1.5} />
          </span>
          <p className="font-cinzel text-2xl uppercase tracking-[0.3em] text-gold-gradient">
            Mestre Agnes
          </p>
          <p className="font-jost text-[10px] uppercase tracking-[0.45em] text-cream/60">
            {t("auth.eyebrow")}
          </p>
        </div>

        <div className={cardCls}>
          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 border-b border-gold/15 bg-transparent p-0">
              <TabsTrigger
                value="login"
                className="rounded-none py-3 font-jost text-xs uppercase tracking-[0.25em] text-cream/60 data-[state=active]:bg-transparent data-[state=active]:text-gold data-[state=active]:shadow-none data-[state=active]:[box-shadow:inset_0_-2px_0_hsl(var(--gold))]"
              >
                {t("auth.loginTab")}
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-none py-3 font-jost text-xs uppercase tracking-[0.25em] text-cream/60 data-[state=active]:bg-transparent data-[state=active]:text-gold data-[state=active]:shadow-none data-[state=active]:[box-shadow:inset_0_-2px_0_hsl(var(--gold))]"
              >
                {t("auth.signupTab")}
              </TabsTrigger>
            </TabsList>

            <div className="p-6 md:p-8">
              <TabsContent value="login" className="mt-0">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="flex flex-col gap-5">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.emailLabel")}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              autoComplete="email"
                              placeholder={t("auth.emailPlaceholder")}
                              className="border-gold/25 bg-navy/60 text-cream placeholder:text-cream/35 focus:border-gold"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.passwordLabel")}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              autoComplete="current-password"
                              placeholder={t("auth.passwordPlaceholder")}
                              className="border-gold/25 bg-navy/60 text-cream placeholder:text-cream/35 focus:border-gold"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={loginForm.formState.isSubmitting}
                      className="mt-1 w-full bg-gold py-6 font-jost text-xs uppercase tracking-[0.3em] text-navy-deep shadow-[0_0_24px_hsl(var(--gold)/0.3)] hover:bg-gold-light"
                    >
                      {loginForm.formState.isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                      ) : null}
                      {loginForm.formState.isSubmitting
                        ? t("auth.loading")
                        : t("auth.loginSubmit")}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignup)} className="flex flex-col gap-5">
                    <FormField
                      control={signupForm.control}
                      name="display_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.displayNameLabel")}</FormLabel>
                          <FormControl>
                            <Input
                              autoComplete="name"
                              placeholder={t("auth.displayNamePlaceholder")}
                              className="border-gold/25 bg-navy/60 text-cream placeholder:text-cream/35 focus:border-gold"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.emailLabel")}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              autoComplete="email"
                              placeholder={t("auth.emailPlaceholder")}
                              className="border-gold/25 bg-navy/60 text-cream placeholder:text-cream/35 focus:border-gold"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.passwordLabel")}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              autoComplete="new-password"
                              placeholder={t("auth.passwordPlaceholder")}
                              className="border-gold/25 bg-navy/60 text-cream placeholder:text-cream/35 focus:border-gold"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-[11px] text-cream/45">
                            {t("auth.passwordHint")}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={signupForm.formState.isSubmitting}
                      className="mt-1 w-full bg-gold py-6 font-jost text-xs uppercase tracking-[0.3em] text-navy-deep shadow-[0_0_24px_hsl(var(--gold)/0.3)] hover:bg-gold-light"
                    >
                      {signupForm.formState.isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                      ) : null}
                      {signupForm.formState.isSubmitting
                        ? t("auth.loading")
                        : t("auth.signupSubmit")}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
