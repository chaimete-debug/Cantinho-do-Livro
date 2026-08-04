/* ============================================================
   emprestimos.js — página emprestimos.html
   ============================================================ */

let filtroAtual = 'ativos';

document.addEventListener('DOMContentLoaded', () => {
  carregarEmprestimos();

  document.getElementById('btn-mostrar-form').addEventListener('click', abrirForm);
  document.getElementById('btn-cancelar-form').addEventListener('click', fecharForm);
  document.getElementById('form-emprestimo').addEventListener('submit', confirmarEmprestimo);

  document.getElementById('btn-filtro-ativos').addEventListener('click', () => mudarFiltro('ativos'));
  document.getElementById('btn-filtro-atrasados').addEventListener('click', () => mudarFiltro('atrasados'));
});

function mudarFiltro(filtro) {
  filtroAtual = filtro;
  document.getElementById('btn-filtro-ativos').classList.toggle('btn', filtro !== 'ativos');
  ['ativos', 'atrasados'].forEach(f => {
    document.getElementById('btn-filtro-' + f).className =
      'btn pequeno ' + (f === filtro ? '' : 'secundario');
  });
  carregarEmprestimos();
}

async function carregarEmprestimos() {
  const contentor = document.getElementById('lista-emprestimos');
  contentor.innerHTML = '<p class="loading">A carregar…</p>';
  try {
    const acao = filtroAtual === 'ativos' ? 'getEmprestimosAtivos' : 'getEmprestimosAtrasados';
    const emprestimos = await apiGet(acao);
    renderizarEmprestimos(emprestimos);
  } catch (err) {
    contentor.innerHTML = '';
    mostrarMensagem('mensagem', 'Erro ao carregar empréstimos: ' + err.message, 'erro');
  }
}

function renderizarEmprestimos(emprestimos) {
  const contentor = document.getElementById('lista-emprestimos');
  if (emprestimos.length === 0) {
    contentor.innerHTML = '<p class="vazio">Sem empréstimos nesta categoria.</p>';
    return;
  }

  contentor.innerHTML = emprestimos.map(e => `
    <div class="card" style="display:flex; align-items:center; gap:1.25rem;">
      <div class="carimbo carimbo--${escaparHtml(e.Estado)}">${e.Estado}</div>
      <div style="flex:1;">
        <h3 style="margin-bottom:0.2rem;">${escaparHtml(e.TituloLivro)}</h3>
        <p style="margin:0; color:var(--color-ink-soft); font-size:0.88rem;">
          Requisitado por <strong>${escaparHtml(e.NomeUtilizador)}</strong><br>
          Emprestado em <span class="mono">${formatarData(e.Data_Emprestimo)}</span> ·
          Devolução prevista <span class="mono">${formatarData(e.Data_Prevista_Devolucao)}</span>
        </p>
      </div>
      <button class="btn secundario pequeno" onclick="devolver(${e.ID})">Registar devolução</button>
    </div>
  `).join('');
}

async function abrirForm() {
  document.getElementById('form-emprestimo-card').style.display = 'block';
  const selectLivro = document.getElementById('emp-livro');
  const selectUtilizador = document.getElementById('emp-utilizador');
  selectLivro.innerHTML = '<option>A carregar…</option>';
  selectUtilizador.innerHTML = '<option>A carregar…</option>';

  try {
    const [livros, utilizadores] = await Promise.all([
      apiGet('getLivros'),
      apiGet('getUtilizadores')
    ]);

    const livrosDisponiveis = livros.filter(l => l.Disponiveis > 0);
    selectLivro.innerHTML = livrosDisponiveis.length
      ? livrosDisponiveis.map(l => `<option value="${l.ID}">${escaparHtml(l.Titulo)} (${l.Disponiveis} disp.)</option>`).join('')
      : '<option value="">Sem livros disponíveis</option>';

    const utilizadoresAtivos = utilizadores.filter(u => u.Estado === 'ativo');
    selectUtilizador.innerHTML = utilizadoresAtivos.length
      ? utilizadoresAtivos.map(u => `<option value="${u.ID}">${escaparHtml(u.Nome)}</option>`).join('')
      : '<option value="">Sem utilizadores ativos</option>';
  } catch (err) {
    mostrarMensagem('mensagem', 'Erro ao carregar dados do formulário: ' + err.message, 'erro');
  }
}

function fecharForm() {
  document.getElementById('form-emprestimo-card').style.display = 'none';
}

async function confirmarEmprestimo(evento) {
  evento.preventDefault();
  const idLivro = document.getElementById('emp-livro').value;
  const idUtilizador = document.getElementById('emp-utilizador').value;

  if (!idLivro || !idUtilizador) {
    mostrarMensagem('mensagem', 'Seleciona um livro e um utilizador.', 'erro');
    return;
  }

  try {
    await apiPost('emprestarLivro', { idLivro, idUtilizador });
    mostrarMensagem('mensagem', 'Empréstimo registado com sucesso.', 'sucesso');
    fecharForm();
    carregarEmprestimos();
  } catch (err) {
    mostrarMensagem('mensagem', 'Erro ao registar empréstimo: ' + err.message, 'erro');
  }
}

async function devolver(idEmprestimo) {
  if (!confirm('Confirmar devolução deste livro?')) return;
  try {
    await apiPost('devolverLivro', { idEmprestimo });
    mostrarMensagem('mensagem', 'Devolução registada com sucesso.', 'sucesso');
    carregarEmprestimos();
  } catch (err) {
    mostrarMensagem('mensagem', 'Erro ao registar devolução: ' + err.message, 'erro');
  }
}
