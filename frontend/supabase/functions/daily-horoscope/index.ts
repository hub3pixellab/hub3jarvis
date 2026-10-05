import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const AGNES_API_URL = Deno.env.get('AGNES_API_URL') ?? 'https://agnes-backend.onrender.com';
const AGNES_API_KEY = Deno.env.get('AGNES_API_KEY') ?? 'agnes-secreta-2026';

// Nosso identificador de signo -> chave usada pelo backend do Mestre Agnes
const AGNES_SIGN: Record<string, string> = {
  aries: 'aries', taurus: 'touro', gemini: 'gemeos', cancer: 'cancer',
  leo: 'leao', virgo: 'virgem', libra: 'libra', scorpio: 'escorpiao',
  sagittarius: 'sagitario', capricorn: 'capricornio', aquarius: 'aquario',
  pisces: 'peixes',
};

const LANG_NAMES: Record<string, string> = {
  'pt-BR': 'português do Brasil', pt: 'português', en: 'English',
  es: 'español', fr: 'français', it: 'italiano',
};

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
    const sign = String(body?.sign ?? '').toLowerCase();
    const lang = LANG_NAMES[body?.lang] ? String(body.lang) : 'pt-BR';
    if (!AGNES_SIGN[sign]) return json({ error: 'Signo inválido' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const today = new Date().toISOString().slice(0, 10);
    const { data: cached } = await admin
      .from('daily_horoscopes')
      .select('*')
      .eq('sign', sign)
      .eq('lang', lang)
      .eq('day', today)
      .maybeSingle();
    if (cached) return json({ ...cached, cached: true, source: 'Mestre Agnes' });

    // 1) Fonte principal: horóscopo do dia do Mestre Agnes (essência, número e cor)
    let essence = '';
    let number = '';
    let color = '';
    try {
      const res = await fetch(
        `${AGNES_API_URL}/api/agnes/horoscopo?signo=${AGNES_SIGN[sign]}`,
        { headers: { 'x-api-key': AGNES_API_KEY } },
      );
      if (res.ok) {
        const d = await res.json();
        essence = String(d?.mensagem ?? '');
        number = String(d?.numero_do_dia ?? '');
        color = String(d?.cor_do_dia ?? '');
      }
    } catch (e) {
      console.warn('agnes horoscopo failed', (e as Error).message);
    }

    // 2) Seções na língua pedida, ancoradas na mensagem do Mestre Agnes
    const prompt = [
      'Você é o Mestre Agnes, astrólogo brasileiro, caloroso e sábio.',
      `Com base nesta leitura do dia: "${essence}".`,
      `Escreva o horóscopo de hoje em ${LANG_NAMES[lang]}.`,
      'Responda SOMENTE com um objeto JSON válido, sem markdown, com exatamente estas chaves:',
      '{"panorama": "2 a 3 frases sobre o dia", "love": "1 a 2 frases sobre amor", "career": "1 a 2 frases sobre carreira", "advice": "1 frase de conselho", "lucky_numbers": [três números de 1 a 60]}',
    ].join(' ');

    const callChat = (apiKey: string) =>
      fetch(`${AGNES_API_URL}/api/agnes/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ mensagem: prompt, signo: AGNES_SIGN[sign], foco: 'geral' }),
      });

    let parsed: Record<string, unknown> | null = null;
    try {
      let res = await callChat(AGNES_API_KEY);
      if (res.status === 401 && AGNES_API_KEY !== 'agnes-secreta-2026') {
        res = await callChat('agnes-secreta-2026');
      }
      if (res.ok) {
        const d = await res.json();
        parsed = parseReading(d?.resposta ?? '');
      }
    } catch (e) {
      console.warn('agnes chat failed', (e as Error).message);
    }

    const numbers: string[] = [];
    if (number) numbers.push(number);
    for (const n of (parsed?.lucky_numbers as unknown[]) ?? []) {
      const t = String(n).trim();
      if (t && !numbers.includes(t)) numbers.push(t);
    }

    const reading = {
      sign,
      lang,
      day: today,
      essence,
      panorama: String(parsed?.panorama ?? ''),
      love: String(parsed?.love ?? ''),
      career: String(parsed?.career ?? ''),
      advice: String(parsed?.advice ?? ''),
      lucky_numbers: numbers.slice(0, 3),
      lucky_color: color,
    };

    if (essence && parsed) {
      const { error } = await admin
        .from('daily_horoscopes')
        .upsert(reading, { onConflict: 'sign,lang,day' });
      if (error) console.warn('daily horoscope cache write failed', error.message);
    }

    return json({ ...reading, cached: false, source: 'Mestre Agnes' });
  } catch (error) {
    console.error('daily-horoscope error', (error as Error).message);
    return json({ error: 'Erro interno' }, 500);
  }
});
