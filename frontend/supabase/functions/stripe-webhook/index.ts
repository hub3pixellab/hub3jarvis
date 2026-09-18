import Stripe from 'https://esm.sh/stripe@13.0.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const SUPPORTED_EVENT = 'checkout.session.completed';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
  if (!secret) {
    return json({ error: 'STRIPE_WEBHOOK_SECRET nao configurada' }, 500);
  }

  // Verify the Stripe signature BEFORE touching the body. An unsigned or
  // tampered payload is rejected outright and never processed.
  const signature = req.headers.get('stripe-signature');
  let event;
  try {
    const body = await req.text();
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient()
    });
    event = await stripe.webhooks.constructEventAsync(body, signature ?? '', secret);
  } catch (error) {
    console.error('Invalid webhook signature:', error.message);
    return json({ error: 'Assinatura invalida' }, 400);
  }

  if (event.type !== SUPPORTED_EVENT) {
    return json({ received: true, ignored: event.type });
  }

  const session = event.data.object;
  if (session.payment_status !== 'paid') {
    return json({ received: true, ignored: 'not paid' });
  }

  const metadata = session.metadata ?? {};
  const userId = metadata.user_id ?? null;
  const productName = metadata.product_name ?? 'Consulta';

  // Delegate to the database function: it inserts the purchased analysis when a
  // valid owner exists and increments the global counter — keyed by the Stripe
  // event id so a replayed delivery never double-counts or duplicates.
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );
  const { data: isNew, error: rpcError } = await supabase.rpc(
    'record_checkout_completion',
    {
      p_event_id: event.id,
      p_session_id: session.id,
      p_user_id: userId,
      p_product_name: productName,
      p_price_centavos: session.amount_total ?? 0,
      p_product_id: metadata.product_id ?? null
    }
  );

  if (rpcError) {
    console.error('record_checkout_completion failed:', rpcError.message);
    return json({ error: 'Falha ao registrar compra' }, 500);
  }

  return json({ received: true, new: isNew === true });
});
