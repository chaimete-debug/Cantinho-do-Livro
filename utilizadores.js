/* ============================================================
   utilizadores.js — página utilizadores.html
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  carregarUtilizadores();

  document.getElementById('btn-mostrar-form').addEventListener('click', () => {
    document.getElementById('form-utilizador-card').style.display = 'block';
    document.getElementById('user-nome').focus();
  });
  document.getElementById('btn-cancelar-form').addEventListener('click', () => {
    document.getElementById('form-utilizador-card').style.display = 'none';
  });
  document.getElementById('form-utilizador').addEventListener('submit', guardarUtilizador);
});

async function carregarUtilizadores() {
  const contentor = document.getElementById('lista-utilizadores');
  contentor.innerHTML = '<p class="loading">A carregar…</p>';
  try {
    const utilizadores = await apiGet('getUtilizadores');
    renderizarUtilizadores(utilizadores);
  } catch (err) {
    contentor.innerHTML = '';
    mostrarMensagem('mensagem', 'Erro ao carregar utilizadores: ' + err.message, 'erro');
  }
}

function renderizarUtilizadores(utilizadores) {
  const contentor = document.getElementById('lista-utilizadores');
  if (utilizadores.length === 0) {
    contentor.innerHTML = '<p class="vazio">Nenhum utilizador registado ainda.</p>';
    return;
  }

  contentor.innerHTML = `
    <table>
      <thead>
        <tr><th>Nome</th><th>Email</th><th>Tipo</th><th>Estado</th><th>Registado em</th><th></th></tr>
      </thead>
      <tbody>
        ${utilizadores.map(u => `
          <tr>
            <td><strong>${escaparHtml(u.Nome)}</strong></td>
            <td class="mono">${escaparHtml(u.Email)}</td>
            <td>${escaparHtml(u.Tipo)}</td>
            <td><span class="etiqueta ${u.Estado === 'suspenso' ? 'atrasado' : ''}">${escaparHtml(u.Estado)}</span></td>
            <td>${formatarData(u.DataRegisto)}</td>
            <td>
              ${u.Estado === 'ativo'
                ? `<button class="btn perigo pequeno" onclick="suspender(${u.ID})">Suspender</button>`
                : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function guardarUtilizador(evento) {
  evento.preventDefault();
  const dados = {
    nome: document.getElementById('user-nome').value.trim(),
    email: document.getElementById('user-email').value.trim(),
    tipo: document.getElementById('user-tipo').value
  };

  try {
    await apiPost('adicionarUtilizador', dados);
    mostrarMensagem('mensagem', 'Utilizador adicionado com sucesso.', 'sucesso');
    document.getElementById('form-utilizador').reset();
    document.getElementById('form-utilizador-card').style.display = 'none';
    carregarUtilizadores();
  } catch (err) {
    mostrarMensagem('mensagem', 'Erro ao guardar: ' + err.message, 'erro');
  }
}

async function suspender(id) {
  if (!confirm('Suspender este utilizador? Deixa de poder requisitar livros.')) return;
  try {
    await apiPost('suspenderUtilizador', { id });
    mostrarMensagem('mensagem', 'Utilizador suspenso.', 'sucesso');
    carregarUtilizadores();
  } catch (err) {
    mostrarMensagem('mensagem', 'Erro: ' + err.message, 'erro');
  }
}
