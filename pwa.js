/* ============================================================
   pwa.js — registo do service worker e prompt de instalação
   Incluído em todas as páginas. Mostra um botão "Instalar app"
   na barra lateral quando o navegador permite a instalação.
   ============================================================ */

// Regista o service worker (cache offline dos ficheiros estáticos)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.warn('Falha ao registar o service worker:', err);
    });
  });
}

// Guarda o evento de instalação para disparar quando o utilizador clicar
let promptDeInstalacao = null;

window.addEventListener('beforeinstallprompt', evento => {
  evento.preventDefault();
  promptDeInstalacao = evento;
  mostrarBotaoInstalar();
});

window.addEventListener('appinstalled', () => {
  promptDeInstalacao = null;
  esconderBotaoInstalar();
});

function mostrarBotaoInstalar() {
  const existente = document.getElementById('btn-instalar-app');
  if (existente) { existente.style.display = 'flex'; return; }

  const nav = document.querySelector('.sidebar__nav');
  if (!nav) return;

  const item = document.createElement('li');
  item.style.marginTop = '1.25rem';
  item.innerHTML = `
    <button id="btn-instalar-app" class="btn-instalar">
      <span class="btn-instalar__icone">⬇</span> Instalar aplicação
    </button>
  `;
  nav.appendChild(item);

  document.getElementById('btn-instalar-app').addEventListener('click', instalarApp);
}

function esconderBotaoInstalar() {
  const botao = document.getElementById('btn-instalar-app');
  if (botao) botao.closest('li').remove();
}

async function instalarApp() {
  if (!promptDeInstalacao) return;
  promptDeInstalacao.prompt();
  await promptDeInstalacao.userChoice;
  promptDeInstalacao = null;
  esconderBotaoInstalar();
}
