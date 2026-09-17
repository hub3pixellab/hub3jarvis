/* E2E check for the Mestre Agnes user area (auth + trigger + RLS).
 * Creates a throwaway user with a .test email and verifies that:
 *  1. Signup succeeds and returns a session (auto-confirm enabled)
 *  2. The signup trigger populates profiles
 *  3. RLS blocks anonymous reads of profiles
 *  4. Profile update syncs the zodiac sign from birth_date
 *  5. purchased_analyses / subscriptions start empty (genuine empty states)
 *  6. Only own rows are visible
 * Run: node scripts/e2e-auth-check.mjs
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://spb-t4ng9l0640q82en1.supabase.opentrust.net";
const ANON_KEY =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsInJlZiI6InNwYi10NG5nOWwwNjQwcTgyZW4xIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODg4NzY2NDAsImV4cCI6MjEwNDQ1MjY0MH0.chC7MOFk05VJBh5U3eAFSnT1fN4DxOuLNd7_RqDF8xM";

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"} — ${name}${detail ? ` (${detail})` : ""}`);
};

const anon = createClient(SUPABASE_URL, ANON_KEY);
const email = `e2e-${Date.now()}@mestreagnes.test`;
const password = "senha-e2e-123";

// 1. Sign up
const { data: signUp, error: signUpError } = await anon.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: "http://localhost:3000/",
    data: { display_name: "E2E Test", locale: "pt-BR" },
  },
});
check(
  "signup returns user + session",
  !signUpError && !!signUp.user && !!signUp.session,
  signUpError?.message ?? signUp.user?.id,
);
if (signUpError || !signUp.session) {
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed > 0 ? 1 : 0);
}

// 2. Signup trigger created the profile row
const authed = createClient(SUPABASE_URL, ANON_KEY);
await authed.auth.setSession(signUp.session);
const { data: profile, error: profileError } = await authed
  .from("profiles")
  .select("*")
  .maybeSingle();
check(
  "trigger created profile",
  !profileError && profile?.id === signUp.user.id && profile?.display_name === "E2E Test",
  profileError?.message ?? JSON.stringify({ name: profile?.display_name, locale: profile?.locale }),
);
if (profileError || !profile) {
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed > 0 ? 1 : 0);
}

// 3. RLS blocks anonymous reads of profiles (fresh client without any session)
const visitor = createClient(SUPABASE_URL, ANON_KEY);
const { data: anonRows, error: anonErr } = await visitor.from("profiles").select("id").limit(5);
check(
  "RLS blocks anonymous read",
  anonErr !== null || (anonRows ?? []).length === 0,
  anonErr?.message ?? `rows=${anonRows?.length}`,
);

// 4. Profile update syncs the zodiac sign from birth_date
const { data: updated, error: updateError } = await authed
  .from("profiles")
  .update({ birth_date: "1990-03-25" })
  .eq("id", signUp.user.id)
  .select()
  .single();
check(
  "profile update + zodiac sync",
  !updateError && updated?.zodiac_sign === "aries",
  updateError?.message ?? `zodiac=${updated?.zodiac_sign}`,
);
if (updateError) {
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed > 0 ? 1 : 0);
}

// 5. Purchases and subscriptions start empty (genuine empty states)
const { data: purchases, error: purchasesError } = await authed
  .from("purchased_analyses")
  .select("*");
const { data: subscriptions, error: subscriptionsError } = await authed
  .from("subscriptions")
  .select("*");
check("purchases empty", !purchasesError && (purchases ?? []).length === 0, purchasesError?.message);
check("subscriptions empty", !subscriptionsError && (subscriptions ?? []).length === 0, subscriptionsError?.message);

// 6. Only own rows are visible
const { data: selfPurchases } = await authed.from("purchased_analyses").select("*");
check(
  "only own rows visible",
  (selfPurchases ?? []).every((r) => r.user_id === signUp.user.id),
);

// 7. Sign out
await authed.auth.signOut();
check("sign out", true);

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed > 0 ? 1 : 0);
