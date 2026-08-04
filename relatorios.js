/* ============================================================
   relatorios.js — página relatorios.html
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  carregarEstatisticas();
  carregarPopulares();
});

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
        <span class="valor">${s.totalExemplares}</span>
        <span class="rotulo">Exemplares totais</span>
      </div>
      <div class="stat-card">
        <span class="valor">${s.totalEmprestimosHistorico}</span>
        <span class="rotulo">Empréstimos (histórico total)</span>
      </div>
      <div class="stat-card ${s.emprestimosAtrasados > 0 ? 'alerta' : ''}">
        <span class="valor">${s.emprestimosAtrasados}</span>
        <span class="rotulo">Atrasados atualmente</span>
      </div>
      <div class="stat-card">
        <span class="valor">${s.totalUtilizadores}</span>
        <span class="rotulo">Utilizadores registados</span>
      </div>
    `;
  } catch (err) {
    contentor.innerHTML = '';
    mostrarMensagem('mensagem', 'Erro ao carregar estatísticas: ' + err.message, 'erro');
  }
}

async function carregarPopulares() {
  const contentor = document.getElementById('lista-populares');
  try {
    const populares = await apiGet('getLivrosMaisRequisitados', { limite: 10 });
    if (populares.length === 0) {
      contentor.innerHTML = '<p class="vazio">Ainda não há dados suficientes de empréstimos.</p>';
      return;
    }
    contentor.innerHTML = `
      <table>
        <thead><tr><th>#</th><th>Título</th><th>Autor</th><th>Nº de empréstimos</th></tr></thead>
        <tbody>
          ${populares.map((l, i) => `
            <tr>
              <td class="mono">${i + 1}</td>
              <td><strong>${escaparHtml(l.titulo)}</strong></td>
              <td>${escaparHtml(l.autor)}</td>
              <td>${l.totalEmprestimos}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    contentor.innerHTML = '';
    mostrarMensagem('mensagem', 'Erro ao carregar ranking: ' + err.message, 'erro');
  }
}
