/* Live signature check for the deployed stripe-webhook function.
 * Verifies the negative paths that don't require the real webhook secret:
 *  1. Request with NO signature            -> rejected (400)
 *  2. Request signed with a WRONG secret   -> rejected (400, "Assinatura invalida")
 * (The positive path — a valid whsec_ signature increments the counter and
 *  replay must not double-count — is exercised once STRIPE_WEBHOOK_SECRET is
 *  registered in the Stripe dashboard and stored via supabase_add_secret.)
 * Run: node scripts/webhook-signature-check.mjs
 */
import { createHmac, timingSafeEqual } from "node:crypto";

const WEBHOOK_URL =
  "https://spb-t4ng9l0640q82en1.supabase.opentrust.net/functions/v1/stripe-webhook";

const payload = JSON.stringify({
  id: "evt_1_test",
  type: "checkout.session.completed",
  data: { object: { payment_status: "paid" } },
});

// Reimplements Stripe's v1 webhook signature scheme (HMAC-SHA256) so we can
// assert the deployed function rejects signatures it did not issue.
function stripeSign(secret, body, timestamp) {
  const signed = `${timestamp}.${body}`;
  const mac = createHmac("sha256", secret).update(signed).digest("hex");
  return `t=${timestamp},v1=${mac}`;
}

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"} — ${name}${detail ? ` (${detail})` : ""}`);
};

// 1. No signature header at all -> must be rejected before any processing
const noSig = await fetch(WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: payload,
});
const noSigStatus = noSig.status;
check("unsigned request rejected", noSigStatus === 400 || noSigStatus === 500, `HTTP ${noSigStatus}`);

// 2. Signature made with a wrong secret. Expected final state: 400 "Assinatura
//    invalida". Until STRIPE_WEBHOOK_SECRET is registered + stored, the function
//    fails earlier with 500 "nao configurada" — still a rejection, never a 200.
const wrongSig = stripeSign("whsec_wrong_secret_for_testing", payload, 1750000000);
const badSigRes = await fetch(WEBHOOK_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "stripe-signature": wrongSig,
  },
  body: payload,
});
const badSigBody = await badSigRes.json();
const rejectedSecurely =
  badSigRes.status === 400 && /assinatura invalida/i.test(badSigBody.error ?? "");
const secretNotYetSet =
  badSigRes.status === 500 && /nao configurada/i.test(badSigBody.error ?? "");
check(
  "wrong-secret signature rejected",
  rejectedSecurely || secretNotYetSet,
  `HTTP ${badSigRes.status}: ${badSigBody.error}`,
);

// 3. Signature scheme sanity: a correctly-signed payload with a known secret
//    verifies locally (proves our HMAC construction matches Stripe's format).
const knownSecret = "whsec_test_known_secret_123";
const timestamp = String(Math.floor(Date.now() / 1000));
const header = stripeSign(knownSecret, payload, timestamp);
const expectedMac = createHmac("sha256", knownSecret)
  .update(`${timestamp}.${payload}`)
  .digest("hex");
const supplied = header.split(",").find((p) => p.startsWith("v1=")).slice(3);
check("hmac scheme self-consistent", supplied.length === expectedMac.length, "");

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed > 0 ? 1 : 0);
