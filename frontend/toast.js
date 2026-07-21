/**
 * JARVIS v4.2 — Sistema de Toast Notifications
 * Hub3 Pixel Lab
 *
 * Uso: Toast.success('Mensagem'), Toast.error('Erro'), Toast.warning('Aviso')
 */

const Toast = (() => {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
        position:fixed;top:20px;right:20px;z-index:9999;
        display:flex;flex-direction:column;gap:8px;
        pointer-events:none;max-width:400px;
    `;
    document.body.appendChild(container);

    const icons = {
        success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️',
    };
    const bgColors = {
        success: 'var(--green, #00e676)',
        error: 'var(--red, #ff4444)',
        warning: 'var(--orange, #ff8c00)',
        info: 'var(--cyan, #00d4ff)',
    };

    function show(type, message, duration = 4000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            background:var(--bg-card,#0f1d3a);border:1px solid ${bgColors[type]};
            border-radius:10px;padding:14px 18px;font-size:14px;color:var(--text,#e0e7f0);
            display:flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,0.4);
            pointer-events:auto;animation:toastIn 0.3s ease-out;
            backdrop-filter:blur(8px);
        `;
        toast.innerHTML = `<span style="font-size:18px">${icons[type]}</span><span style="flex:1">${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes toastIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
            @keyframes toastOut { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(40px); } }
        `;
        document.head.appendChild(style);
    }

    return {
        success: (msg, dur) => show('success', msg, dur),
        error: (msg, dur) => show('error', msg, dur),
        warning: (msg, dur) => show('warning', msg, dur),
        info: (msg, dur) => show('info', msg, dur),
    };
})();

window.Toast = Toast;
