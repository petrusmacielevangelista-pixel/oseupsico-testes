// PUBLICAÇÃO do projeto de TESTES PSICOLÓGICOS — o jeito de levar código para produção.
//   npm run publicar
// Este projeto publica sozinho quando há push na branch master (GitHub Actions → Cloudflare). Então o
// "portão" fica ANTES do push:
//   1. sintaxe
//   2. exige tudo commitado
//   3. regressão local completa (qa/regressao.mjs) — se falhar, NÃO faz push
//   4. git push origin master (dispara o deploy automático)
//   5. espera o deploy aparecer e roda a fumaça de produção (qa/fumaca.mjs)
// Se a fumaça falhar depois do deploy, o script avisa e mostra como desfazer (npx wrangler rollback).
import { execSync, spawnSync } from 'node:child_process';

const sh = (cmd) => execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const rodar = (cmd, args) => spawnSync(cmd, args, { stdio: 'inherit', shell: true });
const etapa = t => console.log(`\n━━━ ${t} ━━━`);
const parar = msg => { console.error(`\n⛔ ${msg}\n   Nada foi publicado.`); process.exit(1); };

etapa('1/5 Sintaxe');
for (const f of ['src/worker.js', 'qa/regressao.mjs', 'qa/fumaca.mjs']) {
  if (rodar('node', ['--check', f]).status !== 0) parar(`Erro de sintaxe em ${f}.`);
}
console.log('ok');

etapa('2/5 Código commitado');
const sujo = sh('git status --porcelain --untracked-files=no').trim();
if (sujo) parar(`Há alterações não commitadas:\n${sujo}\n   Faça o commit antes (o push publica o que está no git).`);
console.log('ok — ' + sh('git log --oneline -1').trim());

etapa('3/5 Regressão local');
if (rodar('node', ['qa/regressao.mjs']).status !== 0) parar('A regressão falhou. Corrija antes de publicar.');

etapa('4/5 Push (dispara o deploy automático)');
if (rodar('git', ['push', 'origin', 'master']).status !== 0) parar('Falha no git push.');

etapa('5/5 Fumaça em produção');
let f = { status: 1 };
for (let tentativa = 1; tentativa <= 6 && f.status !== 0; tentativa++) {
  console.log(`(aguardando o deploy — tentativa ${tentativa}/6)`);
  await new Promise(r => setTimeout(r, tentativa === 1 ? 60000 : 30000));
  f = rodar('node', ['qa/fumaca.mjs']);
}
if (f.status !== 0) {
  console.error('\n🚨 A fumaça falhou depois do push. Veja a aba Actions do GitHub; para desfazer o deploy:\n   npx wrangler rollback --message "fumaca falhou" --yes');
  process.exit(1);
}
console.log('\n✅ Publicado em produção e verificado. ' + sh('git log --oneline -1').trim());
