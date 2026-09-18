/* E2E check for the global analysis counter (Increment 3).
 * Verifies, against the live Cloud:
 *  1. Baseline seed matches the landing copy ("4.200+" consultas realizadas)
 *  2. Public read: anonymous and authenticated users can read the count
 *  3. Private write: NO client role can update the counter (service-role only)
 *  4. purchased_analyses stays clean for a fresh user
 * Run: node scripts/e2e-counter-check.mjs
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://spb-t4ng9l0640q82en1.supabase.opentrust.net";
const ANON_KEY =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsInJlZiI6InNwYi10NG5nOWwwNjQwcTgyZW4xIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODg4NzY2NDAsImV4cCI6MjEwNDQ1MjY0MH0.chC7MOFk05VJBh5U3eAFSnT1fN4DxOuLNd7_RqDF8xM";
const BASELINE = 4200;

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"} — ${name}${detail ? ` (${detail})` : ""}`);
};

// 1. Anonymous can read the public counter and it matches the baseline seed
const anon = createClient(SUPABASE_URL, ANON_KEY);
const { data: stats, error: statsError } = await anon
  .from("global_stats")
  .select("analysis_count")
  .eq("id", 1)
  .maybeSingle();
check(
  "baseline seed readable anonymously",
  !statsError && stats?.analysis_count === BASELINE,
  statsError?.message ?? `count=${stats?.analysis_count}`,
);

// 2. Anonymous cannot write the counter (RLS returns no rows — value must be unchanged)
await anon
  .from("global_stats")
  .update({ analysis_count: 999999 })
  .eq("id", 1);
const { data: afterAnonWrite } = await anon
  .from("global_stats")
  .select("analysis_count")
  .eq("id", 1)
  .maybeSingle();
check(
  "anonymous write blocked (RLS)",
  afterAnonWrite?.analysis_count === BASELINE,
  `count=${afterAnonWrite?.analysis_count}`,
);

// 2b. Client roles cannot execute the service-role increment/counter functions
const { error: anonRpcError } = await anon.rpc("increment_analysis_counter", { p_count: 1 });
check(
  "anonymous cannot call increment function",
  anonRpcError !== null,
  anonRpcError?.message ?? "RPC unexpectedly allowed",
);

// 3. A signed-in user can also read the counter but cannot write it
const email = `counter-e2e-${Date.now()}@mestreagnes.test`;
const password = "senha-e2e-123";
const { data: signUp, error: signUpError } = await anon.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: "http://localhost:3000/", data: { display_name: "Counter E2E", locale: "pt-BR" } },
});
check("signup succeeds", !signUpError && !!signUp.session, signUpError?.message);

if (!signUpError && signUp.session) {
  const authed = createClient(SUPABASE_URL, ANON_KEY);
  await authed.auth.setSession(signUp.session);

  const { data: authedStats, error: authedReadError } = await authed
    .from("global_stats")
    .select("analysis_count")
    .eq("id", 1)
    .maybeSingle();
  check(
    "authenticated read allowed",
    !authedReadError && authedStats?.analysis_count === BASELINE,
    authedReadError?.message ?? `count=${authedStats?.analysis_count}`,
  );

  await authed
    .from("global_stats")
    .update({ analysis_count: 999999 })
    .eq("id", 1);
  const { data: afterAuthedWrite } = await authed
    .from("global_stats")
    .select("analysis_count")
    .eq("id", 1)
    .maybeSingle();
  check(
    "authenticated write blocked (RLS)",
    afterAuthedWrite?.analysis_count === BASELINE,
    `count=${afterAuthedWrite?.analysis_count}`,
  );

  const { data: purchases, error: purchasesError } = await authed
    .from("purchased_analyses")
    .select("*");
  check("purchases empty for fresh user", !purchasesError && (purchases ?? []).length === 0, purchasesError?.message);

  await authed.auth.signOut();
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed > 0 ? 1 : 0);
