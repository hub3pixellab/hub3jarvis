/**
 * Mestre Agnes v4.2 — Configuração Centralizada
 * Hub3 Pixel Lab
 *
 * Detecta automaticamente ambiente local vs produção
 * e expõe os endpoints corretos para o frontend.
 */

const hostname = window.location.hostname;
const isLocal = hostname === '127.0.0.1' || hostname === 'localhost';

const API_URL = isLocal
    ? 'http://127.0.0.1:8000'
    : 'https://agnes-backend.onrender.com';
const API_KEY = 'agnes-secreta-2026';

async function agnesFetch(path, body) {
    const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
        },
        body: JSON.stringify(body),
    });
    return res.json();
}

const CONFIG = {
    env: isLocal ? 'local' : 'production',
    API_BASE: API_URL,
    API_KEY,
    TIMEOUT: 30000,
    HEALTH_CHECK_INTERVAL: 30000,
    DEFAULT_MODEL: 'llama3.2:1b',
    VOICE_LANG: 'pt-BR',
    VOICE_RATE: 1.05,
    VOICE_PITCH: 1.0,
};

window.CONFIG = CONFIG;
window.agnesFetch = agnesFetch;
console.log(`[Mestre Agnes] Ambiente: ${CONFIG.env} | API: ${CONFIG.API_BASE}`);
