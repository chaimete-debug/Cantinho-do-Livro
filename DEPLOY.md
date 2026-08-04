# Guia de Instalação — Frontend (GitHub + Vercel)

## Passo 1 — Configurar o URL do backend
Antes de tudo, abre `js/api.js` e substitui:
```js
const API_URL = 'COLOCA_AQUI_O_URL_DA_TUA_WEB_APP';
```
pelo URL da Web App do Google Apps Script (obtido no passo 5 da instalação do backend).

## Passo 2 — Criar o repositório no GitHub
```bash
cd frontend
git init
git add .
git commit -m "Primeira versão do sistema de gestão de biblioteca"
```
Depois cria um repositório novo no GitHub (github.com/new) e liga-o:
```bash
git remote add origin https://github.com/O_TEU_USER/biblioteca.git
git branch -M main
git push -u origin main
```

## Passo 3 — Publicar no Vercel
1. Vai a [vercel.com](https://vercel.com) e inicia sessão com a tua conta GitHub.
2. Clica em **Add New → Project**.
3. Seleciona o repositório que acabaste de criar.
4. Como é HTML/CSS/JS puro (sem build), deixa as definições por defeito:
   - **Framework Preset:** Other
   - **Build Command:** (vazio)
   - **Output Directory:** (vazio / raiz)
5. Clica em **Deploy**.

Em menos de um minuto tens um URL público (`https://biblioteca-xxxx.vercel.app`).

## Passo 4 — Atualizações futuras
Sempre que fizeres `git push` para o `main`, o Vercel faz redeploy automaticamente.

---

## Estrutura de ficheiros

```
frontend/
├── index.html          → Painel (dashboard)
├── catalogo.html         → Catálogo de livros
├── emprestimos.html       → Empréstimos e devoluções
├── utilizadores.html      → Gestão de leitores
├── relatorios.html        → Estatísticas
├── css/
│   └── style.css          → Estilos partilhados (tokens de design)
└── js/
    ├── api.js              → Comunicação com o backend GAS
    ├── dashboard.js
    ├── catalogo.js
    ├── emprestimos.js
    ├── utilizadores.js
    └── relatorios.js
```

## Testar localmente antes do deploy
Não precisas de servidor especial — basta abrir `index.html` diretamente no navegador,
ou correr um servidor simples:
```bash
cd frontend
python3 -m http.server 8000
```
E abrir `http://localhost:8000`.

⚠️ **Nota sobre CORS:** o `api.js` já está configurado para evitar problemas de CORS
(usa `Content-Type: text/plain` nos pedidos POST). Se mesmo assim tiveres erros de CORS,
confirma que a implementação do GAS está configurada com "Quem tem acesso: Qualquer pessoa".

## Notas de design
- O **carimbo circular tracejado** nos empréstimos (ativo/atrasado/devolvido) é o elemento
  visual de assinatura do sistema — inspirado nos carimbos de data de devolução das
  bibliotecas tradicionais.
- Cores e tipografia estão centralizadas em `css/style.css` como variáveis CSS (`:root`),
  fácil de ajustar globalmente se quiseres mudar a identidade visual.
