import Stripe from 'https://esm.sh/stripe@13.0.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

/**
 * Confirma uma compra concluída no Stripe e concede os direitos do plano.
 * Serve de reforço ao webhook: ao voltar do checkout, o frontend chama esta
 * função com o session_id; ela valida o pagamento no Stripe e registra a
 * compra + os direitos (idempotente, usando o id da sessão como chave).
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return json({ error: 'Nao autenticado' }, 401);
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return json({ error: 'Sessao invalida' }, 401);
    }
    const userId = userData.user.id;

    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== 'string') {
      return json({ error: 'sessionId obrigatorio' }, 400);
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return json({ error: 'Sessao nao encontrada' }, 404);
    }
    if (session.payment_status !== 'paid') {
      return json({ received: true, paid: false });
    }

    const metadata = session.metadata ?? {};
    const productId = metadata.product_id ?? null;
    const productName = metadata.product_name ?? 'Consulta';
    // O dono é o usuário autenticado (a sessão de checkout foi criada por ele).
    const ownerId = metadata.user_id ?? userId;

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // registra a compra (idempotente pelo id da sessão)
    const { error: recordError } = await admin.rpc('record_checkout_completion', {
      p_event_id: `cs_${session.id}`,
      p_session_id: session.id,
      p_user_id: ownerId,
      p_product_name: productName,
      p_price_centavos: session.amount_total ?? 0,
      p_product_id: productId,
    });
    if (recordError) {
      console.error('record_checkout_completion failed', recordError.message);
      return json({ error: 'Falha ao registrar a compra' }, 500);
    }

    // concede os direitos do plano
    if (productId) {
      const { error: grantError } = await admin.rpc('grant_plan_entitlements', {
        p_user_id: ownerId,
        p_product_id: productId,
      });
      if (grantError) {
        console.error('grant_plan_entitlements failed', grantError.message);
        return json({ error: 'Falha ao conceder o plano' }, 500);
      }
    }

    return json({ received: true, paid: true, productId, productName });
  } catch (error) {
    console.error('confirm-checkout error', error.message);
    return json({ error: 'Erro interno' }, 500);
  }
});
