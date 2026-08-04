/* ============================================================
   catalogo.js — página catalogo.html
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  carregarLivros();

  document.getElementById('btn-mostrar-form').addEventListener('click', () => abrirFormNovo());
  document.getElementById('btn-cancelar-form').addEventListener('click', fecharForm);
  document.getElementById('form-livro').addEventListener('submit', guardarLivro);
  document.getElementById('btn-pesquisar').addEventListener('click', pesquisar);
  document.getElementById('btn-limpar').addEventListener('click', () => {
    document.getElementById('pesquisa').value = '';
    carregarLivros();
  });
  document.getElementById('pesquisa').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); pesquisar(); }
  });
});

async function carregarLivros() {
  const contentor = document.getElementById('lista-livros');
  contentor.innerHTML = '<p class="loading">A carregar catálogo…</p>';
  try {
    const livros = await apiGet('getLivros');
    renderizarLivros(livros);
  } catch (err) {
    contentor.innerHTML = '';
    mostrarMensagem('mensagem', 'Erro ao carregar livros: ' + err.message, 'erro');
  }
}

async function pesquisar() {
  const termo = document.getElementById('pesquisa').value.trim();
  if (!termo) return carregarLivros();

  const contentor = document.getElementById('lista-livros');
  contentor.innerHTML = '<p class="loading">A pesquisar…</p>';
  try {
    const livros = await apiGet('pesquisarLivros', { termo });
    renderizarLivros(livros);
  } catch (err) {
    contentor.innerHTML = '';
    mostrarMensagem('mensagem', 'Erro na pesquisa: ' + err.message, 'erro');
  }
}

function renderizarLivros(livros) {
  const contentor = document.getElementById('lista-livros');
  if (livros.length === 0) {
    contentor.innerHTML = '<p class="vazio">Nenhum livro encontrado.</p>';
    return;
  }

  contentor.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Título</th><th>Autor</th><th>Categoria</th>
          <th>Disponíveis</th><th>Localização</th><th></th>
        </tr>
      </thead>
      <tbody>
        ${livros.map(l => `
          <tr>
            <td><strong>${escaparHtml(l.Titulo)}</strong></td>
            <td>${escaparHtml(l.Autor)}</td>
            <td>${escaparHtml(l.Categoria) || '—'}</td>
            <td>${l.Disponiveis} / ${l.NumExemplares}</td>
            <td class="mono">${escaparHtml(l.Localizacao) || '—'}</td>
            <td>
              <button class="btn secundario pequeno" onclick="abrirFormEditar(${JSON.stringify(l).replace(/"/g, '&quot;')})">Editar</button>
              <button class="btn perigo pequeno" onclick="removerLivro(${l.ID})">Remover</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function abrirFormNovo() {
  document.getElementById('form-titulo').textContent = 'Adicionar livro';
  document.getElementById('form-livro').reset();
  document.getElementById('livro-id').value = '';
  document.getElementById('livro-exemplares').value = 1;
  document.getElementById('form-livro-card').style.display = 'block';
  document.getElementById('livro-titulo').focus();
}

function abrirFormEditar(livro) {
  document.getElementById('form-titulo').textContent = 'Editar livro';
  document.getElementById('livro-id').value = livro.ID;
  document.getElementById('livro-titulo').value = livro.Titulo;
  document.getElementById('livro-autor').value = livro.Autor;
  document.getElementById('livro-categoria').value = livro.Categoria || '';
  document.getElementById('livro-isbn').value = livro.ISBN || '';
  document.getElementById('livro-exemplares').value = livro.NumExemplares;
  document.getElementById('livro-localizacao').value = livro.Localizacao || '';
  document.getElementById('form-livro-card').style.display = 'block';
  document.getElementById('livro-titulo').focus();
}

function fecharForm() {
  document.getElementById('form-livro-card').style.display = 'none';
}

async function guardarLivro(evento) {
  evento.preventDefault();
  const id = document.getElementById('livro-id').value;
  const dados = {
    titulo: document.getElementById('livro-titulo').value.trim(),
    autor: document.getElementById('livro-autor').value.trim(),
    categoria: document.getElementById('livro-categoria').value.trim(),
    isbn: document.getElementById('livro-isbn').value.trim(),
    numExemplares: document.getElementById('livro-exemplares').value,
    localizacao: document.getElementById('livro-localizacao').value.trim()
  };

  try {
    if (id) {
      dados.id = id;
      await apiPost('editarLivro', dados);
      mostrarMensagem('mensagem', 'Livro atualizado com sucesso.', 'sucesso');
    } else {
      await apiPost('adicionarLivro', dados);
      mostrarMensagem('mensagem', 'Livro adicionado com sucesso.', 'sucesso');
    }
    fecharForm();
    carregarLivros();
  } catch (err) {
    mostrarMensagem('mensagem', 'Erro ao guardar: ' + err.message, 'erro');
  }
}

async function removerLivro(id) {
  if (!confirm('Tens a certeza que queres remover este livro?')) return;
  try {
    await apiPost('removerLivro', { id });
    mostrarMensagem('mensagem', 'Livro removido.', 'sucesso');
    carregarLivros();
  } catch (err) {
    mostrarMensagem('mensagem', 'Erro ao remover: ' + err.message, 'erro');
  }
}
