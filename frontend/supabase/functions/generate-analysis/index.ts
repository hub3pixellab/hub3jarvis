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
    mensagem: 'O cliente respondeu ao teste do Eneagrama. Use o tipo e a asa indicados como base e cruze com a astrologia e a numerologia para entregar o perfil eneagramático completo, profundo e acolhedor.',
    foco: 'eneagrama',
    productName: 'Eneagrama',
  },
  s4: {
    mensagem: 'Preciso do Mapa Astral Combinado (sinastria) entre mim e a outra pessoa: a sintonia dos dois mapas, pontos fortes e desafios da união.',
    foco: 'compatibilidade',
    productName: 'Compatibilidade',
  },
  s5: {
    mensagem: 'Preciso do Conselho dos Mestres: orientação direta e profunda para minhas dúvidas e decisões.',
    foco: 'conselho',
    productName: 'Conselho dos Mestres',
  },
};

/** Monta o bloco de contexto com os dados enviados no formulário. */
function buildContext(form: Record<string, unknown> | null): string {
  if (!form) return '';
  const labels: Record<string, string> = {
    nome_completo: 'Nome completo',
    nome_nascimento: 'Nome de nascimento',
    data_nascimento: 'Data de nascimento',
    hora_nascimento: 'Hora de nascimento',
    cidade_nascimento: 'Cidade/país de nascimento',
    parceiro_nome: 'Nome do outro (compatibilidade)',
    parceiro_data_nascimento: 'Data de nascimento do outro',
    parceiro_hora_nascimento: 'Hora de nascimento do outro',
    parceiro_cidade_nascimento: 'Cidade/país de nascimento do outro',
    pergunta: 'Dúvida/decisão do cliente',
    observacoes: 'Observações',
  };
  const lines: string[] = [];
  for (const [key, label] of Object.entries(labels)) {
    const value = form[key];
    if (typeof value === 'string' && value.trim()) {
      lines.push(`- ${label}: ${value.trim()}`);
    }
  }
  if (form.tem_documento === true) {
    lines.push('- O cliente anexou a certidão de nascimento (documento enviado).');
  }
  // Eneagrama: envia o resultado do questionário (tipo, asa e pontuação)
  if (form.eneagrama_tipo !== undefined) {
    lines.push(`- Resultado do teste de Eneagrama: Tipo ${form.eneagrama_tipo}`);
    if (form.eneagrama_asa !== undefined && form.eneagrama_asa !== null) {
      lines.push(`- Asa: Tipo ${form.eneagrama_asa}`);
    }
    if (form.eneagrama_pontuacao) {
      lines.push(`- Pontuação por tipo: ${JSON.stringify(form.eneagrama_pontuacao)}`);
    }
  }
  return lines.length ? `\nDados informados pelo cliente:\n${lines.join('\n')}\n` : '';
}

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

    // Cliente do usuário: apenas para validar a sessão.
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

    // Cliente de serviço: leituras internas e gravações confiáveis.
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    const analysisKey = body?.analysisKey as string;
    const formData = (body?.formData ?? null) as Record<string, unknown> | null;
    const documentPath = (body?.documentPath ?? null) as string | null;

    const spec = FOCOS[analysisKey];
    if (!spec) {
      return json({ error: 'Analise desconhecida' }, 400);
    }

    // Já entregue? Retorna sem regerar.
    const { data: existing } = await admin
      .from('delivered_analyses')
      .select('*')
      .eq('user_id', userId)
      .eq('analysis_key', analysisKey)
      .maybeSingle();
    if (existing) {
      return json({ delivered: true, analysis: existing });
    }

    // Direito do usuário
    const { data: entitlements } = await admin
      .from('user_entitlements')
      .select('plan_key, analyses_avulsas')
      .eq('user_id', userId)
      .maybeSingle();
    const hasAvulsa = (entitlements?.analyses_avulsas ?? []).includes(analysisKey);
    const isCiclo = entitlements?.plan_key === 'ciclo97';
    if (!hasAvulsa && !isCiclo) {
      return json({ error: 'Voce nao tem direito a esta analise' }, 403);
    }

    // Perfil como base (o formulário tem prioridade)
    const { data: profile } = await admin
      .from('profiles')
      .select('display_name, birth_date, zodiac_sign')
      .eq('id', userId)
      .maybeSingle();

    const nome =
      (typeof formData?.nome_completo === 'string' && formData.nome_completo) ||
      profile?.display_name ||
      '';
    const dataNascimento =
      (typeof formData?.data_nascimento === 'string' && formData.data_nascimento) ||
      profile?.birth_date ||
      '';

    const payload = {
      mensagem:
        spec.mensagem + buildContext(formData),
      nome,
      data_nascimento: dataNascimento,
      signo: profile?.zodiac_sign ?? '',
      foco: spec.foco,
    };

    // Chama a IA. Se a chave configurada no secret estiver divergente (401),
    // tenta a chave padrão do backend antes de desistir.
    const callAgnes = (apiKey: string) =>
      fetch(`${AGNES_API_URL}/api/agnes/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

    let iaRes = await callAgnes(AGNES_API_KEY);
    if (iaRes.status === 401 && AGNES_API_KEY !== 'agnes-secreta-2026') {
      console.warn('agnes chat 401 with configured key; retrying with default key');
      iaRes = await callAgnes('agnes-secreta-2026');
    }
    if (!iaRes.ok) {
      const text = await iaRes.text();
      console.error('agnes chat failed', iaRes.status, text.slice(0, 500));
      return json({ error: 'Falha ao gerar analise com a IA' }, 502);
    }
    const iaData: { resposta?: string; provider?: string; model?: string } =
      await iaRes.json();
    if (!iaData.resposta) {
      console.error('agnes chat empty response');
      return json({ error: 'A IA nao retornou conteudo' }, 502);
    }

    const { data: inserted, error: insertError } = await admin
      .from('delivered_analyses')
      .insert({
        user_id: userId,
        analysis_key: analysisKey,
        plan_key: entitlements?.plan_key ?? null,
        product_name: spec.productName,
        content: iaData.resposta,
        provider: iaData.provider ?? null,
        model: iaData.model ?? null,
        form_data: formData,
        document_path: documentPath,
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
