# O Seu Psico — Testes psicológicos (oseupsico.com.br/testes)

Projeto **separado** da plataforma (`..\oseupsico`) e do blog: Worker próprio (`src/worker.js`), banco próprio
(`oseupsico-testes-db`) e **suíte de testes própria**. Este arquivo vale para toda sessão/aba que mexer aqui.

## Testes e publicação (obrigatório) — independentes da plataforma e do blog
- `npm run testar` — **regressão** (`qa/regressao.mjs`): sobe o Worker **local** com banco D1 simulado e descartável,
  testa e desliga. Não toca produção nem o banco real. Cobre: páginas e rotas, integridade dos arquivos, **dados clínicos**
  (escalas, faixas de resultado, temas, baterias) e a API (resultado, admin, consulta/exclusão LGPD).
- `npm run fumaca` — **fumaça** em produção (`qa/fumaca.mjs`), somente leitura, não grava nada.
- `npm run publicar` — o jeito de publicar: sintaxe → exige commit → regressão local → `git push` → fumaça.
  (Aqui o push publica sozinho via GitHub Actions; por isso o portão da regressão fica **antes** do push.)
  Não dar `git push` direto nem `wrangler deploy` direto.
- Rode **só esta suíte** quando mexer neste projeto, e **nunca** as da plataforma/blog por causa dele (elas não se
  conversam). Cada suíte usa o seu próprio ambiente de teste, então podem rodar ao mesmo tempo em abas diferentes.
- **Toda funcionalidade ou correção nova ganha teste** em `qa/regressao.mjs` (e, se der para checar em produção sem gravar
  nada, também em `qa/fumaca.mjs`). **Escala nova ou alterada** = o teste "Escalas, temas e baterias" já valida: faixas
  contíguas do menor escore possível até `scoreMax`, opções com rótulo/valor, temas e baterias apontando para o que existe.
- Arquivo de bastidor novo (testes, configs, docs) → conferir o `.assetsignore` (hoje já inclui `qa/` e
  `wrangler.teste.jsonc`); a regressão e a fumaça checam que nada interno é servido.

## Cuidados
- Dados de participantes são pessoais (LGPD): nunca logar nem copiar dados reais; testes usam e-mails `@teste.local`.
- O resultado envia e-mail pela Resend; na regressão local a chave é vazia (nenhum e-mail sai).
- Datas sempre em DD/MM/AAAA para o usuário. Não usar o termo "Avaliação Psicológica" para os testes autoaplicáveis.
