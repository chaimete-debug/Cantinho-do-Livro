/* ============================================================
   sw.js — Service Worker
   Faz cache dos ficheiros estáticos (HTML/CSS/JS/ícones) para
   que o app abra rapidamente e funcione offline. Os dados da
   biblioteca (livros, empréstimos) continuam a vir sempre da
   rede, para nunca mostrarem informação desatualizada.
   ============================================================ */

const CACHE_NOME = 'biblioteca-v1';

const FICHEIROS_ESTATICOS = [
  'index.html',
  'catalogo.html',
  'emprestimos.html',
  'utilizadores.html',
  'relatorios.html',
  'manifest.json',
  'css/style.css',
  'js/api.js',
  'js/dashboard.js',
  'js/catalogo.js',
  'js/emprestimos.js',
  'js/utilizadores.js',
  'js/relatorios.js',
  'js/pwa.js',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(CACHE_NOME).then(cache => cache.addAll(FICHEIROS_ESTATICOS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys().then(nomes =>
      Promise.all(nomes.filter(n => n !== CACHE_NOME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', evento => {
  const url = new URL(evento.request.url);

  // Nunca fazer cache de pedidos ao backend (Google Apps Script) —
  // os dados da biblioteca têm de vir sempre atualizados da rede.
  if (url.hostname.includes('script.google.com')) {
    return; // deixa passar diretamente para a rede
  }

  // Para ficheiros estáticos: cache-first, com atualização em segundo plano.
  evento.respondWith(
    caches.match(evento.request).then(respostaCache => {
      const pedidoRede = fetch(evento.request).then(respostaRede => {
        if (respostaRede && respostaRede.status === 200) {
          const clone = respostaRede.clone();
          caches.open(CACHE_NOME).then(cache => cache.put(evento.request, clone));
        }
        return respostaRede;
      }).catch(() => respostaCache);

      return respostaCache || pedidoRede;
    })
  );
});
