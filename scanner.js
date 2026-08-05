/* ============================================================
   scanner.js — leitura de ISBN via câmara + preenchimento
   automático de título/autor através da Google Books API.
   Requer a biblioteca html5-qrcode (carregada via CDN no HTML).
   ============================================================ */

let leitorAtivo = null;

document.addEventListener('DOMContentLoaded', () => {
  const btnScan = document.getElementById('btn-scan');
  const btnCancelar = document.getElementById('btn-cancelar-scan');
  if (!btnScan) return; // só existe na página do catálogo

  btnScan.addEventListener('click', iniciarScanner);
  btnCancelar.addEventListener('click', pararScanner);
});

async function iniciarScanner() {
  // Fecha o formulário de livro, caso esteja aberto, para não sobrepor
  const formCard = document.getElementById('form-livro-card');
  if (formCard) formCard.style.display = 'none';

  document.getElementById('scanner-card').style.display = 'block';
  mostrarEstadoScanner('A pedir acesso à câmara…');

  try {
    leitorAtivo = new Html5Qrcode('leitor-scanner');
    const config = {
      fps: 10,
      qrbox: { width: 260, height: 140 },
      formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8]
    };

    await leitorAtivo.start(
      { facingMode: 'environment' }, // câmara traseira
      config,
      codigoDetetado => processarCodigoDetetado(codigoDetetado),
      () => { /* erro de leitura por frame — ignorado, é normal */ }
    );

    mostrarEstadoScanner('A câmara está ativa. Aponta ao código de barras (ISBN).');
  } catch (err) {
    mostrarEstadoScanner(
      'Não foi possível aceder à câmara: ' + err.message +
      '. Verifica se deste permissão de câmara ao site.',
      'erro'
    );
  }
}

async function pararScanner() {
  if (leitorAtivo) {
    try { await leitorAtivo.stop(); await leitorAtivo.clear(); } catch (e) { /* já parado */ }
    leitorAtivo = null;
  }
  document.getElementById('scanner-card').style.display = 'none';
  document.getElementById('leitor-scanner').innerHTML = '';
}

async function processarCodigoDetetado(isbn) {
  // Evita processar o mesmo código várias vezes seguidas
  if (leitorAtivo && leitorAtivo._processando) return;
  if (leitorAtivo) leitorAtivo._processando = true;

  mostrarEstadoScanner('Código detetado: ' + isbn + ' — a procurar informação do livro…');
  await pararScanner();

  try {
    const info = await procurarLivroPorIsbn(isbn);
    abrirFormNovo();
    document.getElementById('livro-isbn').value = isbn;
    if (info) {
      document.getElementById('livro-titulo').value = info.titulo || '';
      document.getElementById('livro-autor').value = info.autor || '';
      mostrarMensagem('mensagem', 'Livro encontrado automaticamente — confirma os dados e guarda.', 'sucesso');
    } else {
      mostrarMensagem('mensagem', 'ISBN lido (' + isbn + '), mas não encontrei os dados automaticamente. Preenche manualmente.', 'info');
    }
  } catch (err) {
    abrirFormNovo();
    document.getElementById('livro-isbn').value = isbn;
    mostrarMensagem('mensagem', 'ISBN lido (' + isbn + '). Preenche os restantes dados manualmente.', 'info');
  }
}

/**
 * Consulta a Google Books API (pública, sem chave necessária) para
 * obter título e autor a partir do ISBN digitalizado.
 */
async function procurarLivroPorIsbn(isbn) {
  const url = 'https://www.googleapis.com/books/v1/volumes?q=isbn:' + encodeURIComponent(isbn);
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error('Falha ao consultar base de dados de livros');

  const dados = await resposta.json();
  if (!dados.items || dados.items.length === 0) return null;

  const volume = dados.items[0].volumeInfo;
  return {
    titulo: volume.title || '',
    autor: (volume.authors || []).join(', ')
  };
}

function mostrarEstadoScanner(texto, tipo = 'info') {
  const el = document.getElementById('scanner-estado');
  el.style.display = 'block';
  el.className = 'msg ' + tipo;
  el.textContent = texto;
}
