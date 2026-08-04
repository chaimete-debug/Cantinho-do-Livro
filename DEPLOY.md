# Guia de Instalação — Frontend (GitHub + Vercel)

**Nota:** esta versão usa uma estrutura plana (todos os ficheiros na raiz,
sem subpastas `css/`, `js/`, `icons/`) porque foi pensada para se enviar
via "Add file → Upload files" no GitHub, que não preserva subpastas de
forma fiável quando se arrastam ficheiros pelo browser.

## Passo 1 — Configurar o URL do backend
Abre `api.js` e substitui:
```js
const API_URL = 'COLOCA_AQUI_O_URL_DA_TUA_WEB_APP';
```
pelo URL da Web App do Google Apps Script.

## Passo 2 — Enviar para o GitHub
No teu repositório (`Cantinho-do-Livro`), usa **Add file → Upload files**
e arrasta **todos os ficheiros desta pasta** de uma vez (não pastas — os
ficheiros individuais). Confirma que aparecem todos na raiz do
repositório, ao mesmo nível de `index.html`.

Substitui os ficheiros antigos se o GitHub perguntar.

## Passo 3 — Publicar no Vercel
Se já tens o projeto ligado ao repositório, o Vercel faz redeploy
automaticamente assim que fizeres o commit no GitHub (normalmente
demora menos de um minuto). Não precisas de configurar Build Command
nem Output Directory — é HTML/CSS/JS puro.

## Passo 4 — Confirmar que funcionou
Abre o site publicado e faz **hard refresh** (Ctrl+Shift+R ou Cmd+Shift+R)
para garantir que o navegador não está a mostrar uma versão em cache.
Deves ver a barra lateral verde-escura com tipografia própria, não uma
lista simples com marcadores.

---

## Estrutura de ficheiros (plana)

```
index.html, catalogo.html, emprestimos.html, utilizadores.html, relatorios.html
style.css
api.js, dashboard.js, catalogo.js, emprestimos.js, utilizadores.js, relatorios.js, pwa.js
manifest.json, sw.js
icon-192.png, icon-512.png, icon-180.png, favicon-32.png
```

## PWA — instalação como aplicação
- `manifest.json` define nome, cores e ícones da aplicação.
- `sw.js` faz cache dos ficheiros estáticos para abertura rápida e uso
  offline — os dados da biblioteca continuam sempre a vir da rede.
- `pwa.js` regista o service worker e mostra o botão **"Instalar
  aplicação"** na barra lateral quando o navegador permite.

⚠️ PWAs só funcionam em **HTTPS** — o Vercel já trata disso. No iOS
(Safari), a instalação é manual: Partilhar → "Adicionar ao ecrã principal".

## Notas de design
- O **carimbo circular tracejado** nos empréstimos (ativo/atrasado/devolvido)
  é o elemento visual de assinatura do sistema.
- Cores e tipografia estão centralizadas em `style.css` como variáveis CSS
  (`:root`).
