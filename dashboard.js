/* ============================================================
   dashboard.js — página index.html
   ============================================================ */

document.addEventListener('DOMContentLoaded', carregarDashboard);

async function carregarDashboard() {
  await Promise.all([carregarEstatisticas(), carregarAtrasados()]);
}

async function carregarEstatisticas() {
  const contentor = document.getElementById('stats');
  try {
    const s = await apiGet('getEstatisticas');
    contentor.innerHTML = `
      <div class="stat-card">
        <span class="valor">${s.totalTitulos}</span>
        <span class="rotulo">Títulos no catálogo</span>
      </div>
      <div class="stat-card">
        <span class="valor">${s.totalDisponiveis} / ${s.totalExemplares}</span>
        <span class="rotulo">Exemplares disponíveis</span>
      </div>
      <div class="stat-card">
        <span class="valor">${s.emprestimosAtivos}</span>
        <span class="rotulo">Empréstimos ativos</span>
      </div>
      <div class="stat-card ${s.emprestimosAtrasados > 0 ? 'alerta' : ''}">
        <span class="valor">${s.emprestimosAtrasados}</span>
        <span class="rotulo">Empréstimos atrasados</span>
      </div>
      <div class="stat-card">
        <span class="valor">${s.utilizadoresAtivos} / ${s.totalUtilizadores}</span>
        <span class="rotulo">Utilizadores ativos</span>
      </div>
    `;
  } catch (err) {
    contentor.innerHTML = '';
    mostrarMensagem('mensagem', 'Não foi possível carregar as estatísticas: ' + err.message, 'erro');
  }
}

async function carregarAtrasados() {
  const contentor = document.getElementById('atrasados-lista');
  try {
    const atrasados = await apiGet('getEmprestimosAtrasados');
    if (atrasados.length === 0) {
      contentor.innerHTML = '<p class="vazio">Sem empréstimos atrasados. 🎉</p>';
      return;
    }
    contentor.innerHTML = `
      <table>
        <thead>
          <tr><th>Livro</th><th>Utilizador</th><th>Devolução prevista</th></tr>
        </thead>
        <tbody>
          ${atrasados.map(e => `
            <tr>
              <td>${escaparHtml(e.TituloLivro)}</td>
              <td>${escaparHtml(e.NomeUtilizador)}</td>
              <td><span class="etiqueta atrasado">${formatarData(e.Data_Prevista_Devolucao)}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    contentor.innerHTML = '';
    mostrarMensagem('mensagem', 'Não foi possível carregar os atrasos: ' + err.message, 'erro');
  }
}
