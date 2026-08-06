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
 * Se não encontrar nada, tenta a Open Library como alternativa —
 * costuma ter melhor cobertura para livros fora do mercado anglófono.
 */
async function procurarLivroPorIsbn(isbn) {
  const viaGoogleBooks = await procurarNoGoogleBooks(isbn);
  if (viaGoogleBooks) return viaGoogleBooks;

  const viaOpenLibrary = await procurarNaOpenLibrary(isbn);
  if (viaOpenLibrary) return viaOpenLibrary;

  return null;
}

/* 🔧 Chave de API gratuita do Google Books (opcional, mas recomendada —
   sem chave, o Google Books bloqueia pedidos anónimos com erro 429).
   Obter em: console.cloud.google.com → ativar "Books API" → Credenciais
   → Criar credenciais → Chave de API. Deixa vazio ('') para saltar o
   Google Books e usar só o Open Library. */
const GOOGLE_BOOKS_API_KEY = 'COLOCA_AQUI_A_TUA_CHAVE_OU_DEIXA_VAZIO';

async function procurarNoGoogleBooks(isbn) {
  if (!GOOGLE_BOOKS_API_KEY) return null; // sem chave configurada, salta esta fonte

  try {
    const url = 'https://www.googleapis.com/books/v1/volumes?q=isbn:' +
      encodeURIComponent(isbn) + '&key=' + encodeURIComponent(GOOGLE_BOOKS_API_KEY);
    const resposta = await fetch(url);
    if (!resposta.ok) return null;

    const dados = await resposta.json();
    if (!dados.items || dados.items.length === 0) return null;

    const volume = dados.items[0].volumeInfo;
    if (!volume.title) return null;

    return {
      titulo: volume.title,
      autor: (volume.authors || []).join(', ')
    };
  } catch (err) {
    return null; // falha silenciosa — tenta a fonte seguinte
  }
}

async function procurarNaOpenLibrary(isbn) {
  try {
    const url = 'https://openlibrary.org/api/books?bibkeys=ISBN:' + encodeURIComponent(isbn) + '&format=json&jscmd=data';
    const resposta = await fetch(url);
    if (!resposta.ok) return null;

    const dados = await resposta.json();
    const chave = 'ISBN:' + isbn;
    const livro = dados[chave];
    if (!livro || !livro.title) return null;

    return {
      titulo: livro.title,
      autor: (livro.authors || []).map(a => a.name).join(', ')
    };
  } catch (err) {
    return null;
  }
}

function mostrarEstadoScanner(texto, tipo = 'info') {
  const el = document.getElementById('scanner-estado');
  el.style.display = 'block';
  el.className = 'msg ' + tipo;
  el.textContent = texto;
}
