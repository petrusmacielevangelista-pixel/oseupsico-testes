// FUMAÇA do projeto de TESTES PSICOLÓGICOS em PRODUÇÃO — somente leitura, não grava nada.
//   npm run fumaca   (ou: node qa/fumaca.mjs [url-base])   padrão: https://oseupsico.com.br
// Independente da plataforma e do blog.
import fs from 'node:fs';
import path from 'node:path';

const BASE = (process.argv[2] || 'https://oseupsico.com.br').replace(/\/$/, '');
const RAIZ = path.resolve(import.meta.dirname, '..');
let falhas = 0;
const ok = (nome, cond, det = '') => { console.log(`  ${cond ? '✔' : '✘'} ${nome}${cond || !det ? '' : ' → ' + det}`); if (!cond) falhas++; };
const req = async (metodo, caminho, corpo) => {
  const r = await fetch(BASE + caminho, { method: metodo, headers: corpo ? { 'Content-Type': 'application/json' } : {}, body: corpo ? JSON.stringify(corpo) : undefined, redirect: 'manual' });
  const texto = await r.text(); let j = null; try { j = JSON.parse(texto); } catch {}
  return { status: r.status, loc: r.headers.get('location') || '', texto, j };
};

console.log(`\nFumaça dos testes psicológicos em ${BASE}`);
let r = await req('GET', '/testes/');
ok('/testes/ abre com título', r.status === 200 && /<title>[^<]+<\/title>/.test(r.texto), String(r.status));
r = await req('GET', '/testes');
ok('/testes → 301 para /testes/', r.status === 301 && r.loc.endsWith('/testes/'), `${r.status} ${r.loc}`);
r = await req('GET', '/testes/excluir-dados');
ok('link antigo /excluir-dados → 301 para /meusdados', r.status === 301 && /\/testes\/meusdados$/.test(r.loc), `${r.status} ${r.loc}`);

const paginas = fs.readdirSync(RAIZ).filter(f => f.endsWith('.html')).map(f => f.replace(/\.html$/, ''));
const quebradas = [];
for (const p of paginas) { const x = await req('GET', `/testes/${p === 'index' ? '' : p}`); if (x.status !== 200) quebradas.push(`${p} (${x.status})`); }
ok(`as ${paginas.length} páginas do site abrem`, quebradas.length === 0, quebradas.join(', '));
for (const j of ['data/testes.js', 'data/baterias.js', 'data/config.json']) {
  const x = await req('GET', `/testes/${j}`);
  ok(`dados públicos carregam: ${j}`, x.status === 200 && x.texto.length > 200, String(x.status));
}

// Rotas que só leem ou recusam (nenhuma grava): validam o Worker no ar sem sujar o banco real.
r = await req('POST', '/testes/api/resultado', { nome: 'x', email: 'x@x.com', tipo: 'rastreio', identificador: 'depressao' });
ok('resultado sem consentimento é recusado (400) — e nada é gravado', r.status === 400, String(r.status));
r = await req('POST', '/testes/api/consulta', { email: 'fumaca@teste.invalid' });
ok('consulta de dados sem telefone → 400', r.status === 400, String(r.status));
r = await req('GET', '/testes/api/admin/dados');
ok('dados do admin sem token → 401', r.status === 401, String(r.status));
r = await req('POST', '/testes/api/admin/login', { usuario: 'fumaca', senha: 'errada' });
ok('login admin com credencial errada → 401', r.status === 401, String(r.status));
r = await req('DELETE', '/testes/api/admin/dados/1');
ok('excluir registro sem token → 401', r.status === 401, String(r.status));

for (const c of ['/testes/src/worker.js', '/testes/package.json', '/testes/wrangler.jsonc', '/testes/qa/regressao.mjs', '/testes/.gitignore']) {
  const x = await req('GET', c);
  ok(`arquivo interno não exposto: ${c}`, x.status === 404 || (x.status === 200 && /<!doctype html/i.test(x.texto)), String(x.status));
}

console.log(falhas ? `\n${falhas} falha(s) na fumaça.` : '\nFumaça ok.');
process.exit(falhas ? 1 : 0);
