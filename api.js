/* ============================================================
   api.js — comunicação com o backend (Google Apps Script)
   ============================================================
   Todas as páginas usam as funções deste ficheiro para falar
   com a Web App do GAS. Centralizar aqui facilita mudar o URL
   ou a forma de comunicação sem tocar no resto do código.
   ============================================================ */

// 🔧 Substitui pelo URL da tua Web App do Google Apps Script
// (Implementar → Nova implementação → Aplicação Web → copiar URL)
const API_URL = 'COLOCA_AQUI_O_URL_DA_TUA_WEB_APP';

/**
 * Chama o backend para leituras (GET).
 * @param {string} action - nome da ação (ex: "getLivros")
 * @param {object} params - parâmetros extra (ex: { categoria: "Ficção" })
 */
async function apiGet(action, params = {}) {
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  Object.keys(params).forEach(k => {
    if (params[k] !== undefined && params[k] !== null) {
      url.searchParams.set(k, params[k]);
    }
  });

  const resposta = await fetch(url.toString());
  return tratarResposta(resposta);
}

/**
 * Chama o backend para escritas (POST).
 * Usa Content-Type text/plain para evitar pedidos "preflight" CORS,
 * que o Google Apps Script não trata corretamente.
 * @param {string} action - nome da ação (ex: "adicionarLivro")
 * @param {object} dados - dados a enviar
 */
async function apiPost(action, dados = {}) {
  const corpo = Object.assign({ action }, dados);

  const resposta = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(corpo)
  });
  return tratarResposta(resposta);
}

async function tratarResposta(resposta) {
  if (!resposta.ok) {
    throw new Error('Erro de rede: ' + resposta.status);
  }
  const json = await resposta.json();
  if (!json.sucesso) {
    throw new Error(json.erro || 'Erro desconhecido no servidor');
  }
  return json.dados;
}

/* ---------- Auxiliares de UI partilhados ---------- */

/**
 * Mostra uma mensagem de feedback (sucesso/erro/info) num contentor.
 */
function mostrarMensagem(idContentor, texto, tipo = 'info') {
  const el = document.getElementById(idContentor);
  if (!el) return;
  el.innerHTML = `<div class="msg ${tipo}">${escaparHtml(texto)}</div>`;
  if (tipo === 'sucesso') {
    setTimeout(() => { el.innerHTML = ''; }, 4000);
  }
}

/**
 * Escapa texto para evitar injeção de HTML ao inserir dados dinâmicos.
 */
function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto === null || texto === undefined ? '' : String(texto);
  return div.innerHTML;
}

/**
 * Formata uma data (string ISO ou Date) para dd/mm/aaaa.
 */
function formatarData(data) {
  if (!data) return '—';
  const d = new Date(data);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-PT');
}

/**
 * Marca o link ativo na barra lateral consoante a página atual.
 */
function marcarNavAtiva() {
  const pagina = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar__nav a').forEach(a => {
    if (a.getAttribute('href') === pagina) a.classList.add('active');
  });
}
document.addEventListener('DOMContentLoaded', marcarNavAtiva);
