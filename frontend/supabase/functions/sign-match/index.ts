import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Backend de IA do Mestre Agnes
const AGNES_API_URL = Deno.env.get('AGNES_API_URL') ?? 'https://agnes-backend.onrender.com';
const AGNES_API_KEY = Deno.env.get('AGNES_API_KEY') ?? 'agnes-secreta-2026';

const SIGNS: Record<string, string> = {
  aries: 'Áries', taurus: 'Touro', gemini: 'Gêmeos', cancer: 'Câncer',
  leo: 'Leão', virgo: 'Virgem', libra: 'Libra', scorpio: 'Escorpião',
  sagittarius: 'Sagitário', capricorn: 'Capricórnio', aquarius: 'Aquário',
  pisces: 'Peixes',
};

// Elemento de cada signo (usado no cálculo reserva do score)
const ELEMENT: Record<string, string> = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water',
};

const LANG_NAMES: Record<string, string> = {
  'pt-BR': 'português do Brasil', pt: 'português', en: 'English',
  es: 'español', fr: 'français', it: 'italiano',
};

/** Score reserva (determinístico) caso a IA não devolva um número. */
function fallbackScore(a: string, b: string): number {
  const ea = ELEMENT[a];
  const eb = ELEMENT[b];
  if (!ea || !eb) return 60;
  if (ea === eb) return 82;
  const pair = [ea, eb].sort().join('-');
  if (pair === 'air-fire' || pair === 'earth-water') return 78;
  if (pair === 'fire-water' || pair === 'air-earth') return 52;
  return 64;
}

/** Extrai um objeto JSON de um texto que pode vir com prosa em volta. */
function parseReading(raw: string): Record<string, unknown> | null {
  const text = (raw || '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
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
    const body = await req.json();
    const sign1 = String(body?.sign1 ?? '').toLowerCase();
    const sign2 = String(body?.sign2 ?? '').toLowerCase();
    const lang = LANG_NAMES[body?.lang] ? String(body.lang) : 'pt-BR';

    if (!SIGNS[sign1] || !SIGNS[sign2]) {
      return json({ error: 'Signo inválido' }, 400);
    }

    const name1 = SIGNS[sign1];
    const name2 = SIGNS[sign2];
    const pair = [sign1, sign2].sort().join('-');

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Cache: cada par+idioma é gerado uma única vez.
    const { data: cached } = await admin
      .from('compat_readings')
      .select('*')
      .eq('pair', pair)
      .eq('lang', lang)
      .maybeSingle();
    if (cached) {
      return json({ ...cached, cached: true, source: 'Mestre Agnes' });
    }

    const prompt = [
      'Você é o Mestre Agnes, astrólogo brasileiro, caloroso e sábio, especialista em compatibilidade amorosa.',
      `Analise a compatibilidade amorosa entre ${name1} e ${name2}.`,
      `Responda em ${LANG_NAMES[lang]}. Responda SOMENTE com um objeto JSON válido, sem markdown, sem texto antes ou depois, com exatamente estas chaves:`,
      '{"score": número inteiro de 0 a 100, "summary": "2 frases de visão geral", "strengths": "1 a 2 frases sobre o que funciona", "challenges": "1 a 2 frases sobre o que observar", "advice": "1 frase calorosa de orientação"}',
    ].join(' ');

    const callAgnes = (apiKey: string) =>
      fetch(`${AGNES_API_URL}/api/agnes/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({
          mensagem: prompt,
          nome: '',
          data_nascimento: '',
          signo: sign1,
          foco: 'compatibilidade',
        }),
      });

    let iaRes = await callAgnes(AGNES_API_KEY);
    if (iaRes.status === 401 && AGNES_API_KEY !== 'agnes-secreta-2026') {
      iaRes = await callAgnes('agnes-secreta-2026');
    }
    if (!iaRes.ok) {
      const text = await iaRes.text();
      console.error('agnes compat failed', iaRes.status, text.slice(0, 300));
      return json({ error: 'Falha ao gerar a combinação' }, 502);
    }

    const iaData: { resposta?: string } = await iaRes.json();
    const parsed = parseReading(iaData.resposta ?? '');
    const rawScore = Number(parsed?.score);
    const score = Number.isFinite(rawScore)
      ? Math.max(0, Math.min(100, Math.round(rawScore)))
      : fallbackScore(sign1, sign2);

    const reading = {
      pair,
      lang,
      sign1,
      sign2,
      score,
      summary: String(parsed?.summary ?? iaData.resposta ?? '').slice(0, 1200),
      strengths: String(parsed?.strengths ?? '').slice(0, 800),
      challenges: String(parsed?.challenges ?? '').slice(0, 800),
      advice: String(parsed?.advice ?? '').slice(0, 400),
    };

    // Só guarda no cache quando o JSON veio estruturado (evita cachear lixo).
    if (parsed) {
      const { error: cacheError } = await admin
        .from('compat_readings')
        .upsert(reading, { onConflict: 'pair,lang' });
      if (cacheError) console.warn('compat cache write failed', cacheError.message);
    }

    return json({ ...reading, cached: false, source: 'Mestre Agnes' });
  } catch (error) {
    console.error('sign-match error', error.message);
    return json({ error: 'Erro interno' }, 500);
  }
});
