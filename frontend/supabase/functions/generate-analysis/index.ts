import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Backend de IA do Mestre Agnes (Python/FastAPI + Groq)
const AGNES_API_URL = Deno.env.get('AGNES_API_URL') ?? 'https://agnes-backend.onrender.com';
const AGNES_API_KEY = Deno.env.get('AGNES_API_KEY') ?? 'agnes-secreta-2026';

// Como pedir cada análise na linguagem da AGNES
const FOCOS: Record<string, { mensagem: string; foco: string; productName: string }> = {
  s1: {
    mensagem: 'Preciso do meu Mapa Natal completo, com profundidade sobre minha essência, talentos, desafios e caminho de vida.',
    foco: 'mapa_natal',
    productName: 'Mapa Natal',
  },
  s2: {
    mensagem: 'Preciso da minha análise de Numerologia completa: números do destino, ciclos e anos favoráveis.',
    foco: 'numerologia',
    productName: 'Numerologia',
  },
  s3: {
    mensagem: 'Preciso da minha análise de Eneagrama: qual é o meu tipo de personalidade e os padrões que se repetem na minha história.',
    foco: 'eneagrama',
    productName: 'Eneagrama',
  },
  s4: {
    mensagem: 'Preciso da minha análise de Compatibilidade completa, lendo a sintonia entre dois mapas.',
    foco: 'compatibilidade',
    productName: 'Compatibilidade',
  },
  s5: {
    mensagem: 'Preciso do Conselho dos Mestres: orientação direta e profunda para minhas dúvidas e decisões.',
    foco: 'conselho',
    productName: 'Conselho dos Mestres',
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const json = (body, status = 200) =>
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return json({ error: 'Sessao invalida' }, 401);
    }
    const userId = userData.user.id;

    const { analysisKey } = await req.json();
    const spec = FOCOS[analysisKey as string];
    if (!spec) {
      return json({ error: 'Analise desconhecida' }, 400);
    }

    // Já entregue? Retorna sem regerar.
    const { data: existing } = await supabase
      .from('delivered_analyses')
      .select('*')
      .eq('user_id', userId)
      .eq('analysis_key', analysisKey)
      .maybeSingle();
    if (existing) {
      return json({ delivered: true, analysis: existing });
    }

    // Busca dados do perfil para contextualizar a IA
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, birth_date, zodiac_sign')
      .eq('id', userId)
      .maybeSingle();

    // Verifica se o usuário tem direito a esta análise
    const { data: entitlements } = await supabase
      .from('user_entitlements')
      .select('plan_key, analyses_avulsas')
      .eq('user_id', userId)
      .maybeSingle();
    const hasAvulsa = (entitlements?.analyses_avulsas ?? []).includes(analysisKey);
    const isCiclo = entitlements?.plan_key === 'ciclo97';
    if (!hasAvulsa && !isCiclo) {
      return json({ error: 'Voce nao tem direito a esta analise' }, 403);
    }

    const nome = profile?.display_name ?? '';
    const dataNascimento = profile?.birth_date ?? '';
    const signo = profile?.zodiac_sign ?? '';

    const payload = {
      mensagem: spec.mensagem,
      nome,
      data_nascimento: dataNascimento,
      signo,
      foco: spec.foco,
    };

    const iaRes = await fetch(`${AGNES_API_URL}/api/agnes/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AGNES_API_KEY,
      },
      body: JSON.stringify(payload),
    });
    if (!iaRes.ok) {
      const text = await iaRes.text();
      console.error('agnes chat failed', iaRes.status, text.slice(0, 500));
      return json({ error: 'Falha ao gerar analise com a IA' }, 502);
    }
    const iaData = await iaRes.json();

    const { data: inserted, error: insertError } = await supabase
      .from('delivered_analyses')
      .insert({
        user_id: userId,
        analysis_key: analysisKey,
        plan_key: entitlements?.plan_key ?? null,
        product_name: spec.productName,
        content: iaData.resposta ?? '',
        provider: iaData.provider ?? null,
        model: iaData.model ?? null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('insert delivered_analyses failed', insertError.message);
      return json({ error: 'Falha ao salvar analise' }, 500);
    }

    return json({ delivered: false, analysis: inserted });
  } catch (error) {
    console.error('generate-analysis error', error.message);
    return json({ error: 'Erro interno' }, 500);
  }
});
