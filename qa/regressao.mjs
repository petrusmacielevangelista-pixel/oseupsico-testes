// REGRESSÃO do projeto de TESTES PSICOLÓGICOS (oseupsico.com.br/testes) — independente da plataforma e do blog.
//   npm run testar                       sobe o Worker local (banco D1 simulado e descartável), testa e desliga
//   node qa/regressao.mjs <url-base>     testa um servidor que já está de pé (ex.: http://127.0.0.1:8788)
// Não toca produção. Não usa o banco real. (Único contato externo: o envio de e-mail do resultado tenta a
// API da Resend com chave vazia e é recusado — nenhum e-mail sai.)
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const RAIZ = path.resolve(import.meta.dirname, '..');
const PORTA = 8798;
const externo = process.argv[2];
const BASE = (externo || `http://127.0.0.1:${PORTA}`).replace(/\/$/, '');
const ADMIN = { usuario: 'admin-qa', senha: 'senha-qa-local' }; // = wrangler.teste.jsonc

let ok = 0, falhas = 0;
const falhasLista = [];
const check = (nome, cond, detalhe = '') => {
  if (cond) { ok++; console.log(`  ✔ ${nome}`); }
  else { falhas++; falhasLista.push(nome); console.log(`  ✘ ${nome}${detalhe ? ' → ' + detalhe : ''}`); }
};
const secao = t => console.log(`\n== ${t} ==`);
const req = async (metodo, caminho, { corpo, token } = {}) => {
  const headers = {};
  if (corpo !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = 'Bearer ' + token;
  const r = await fetch(BASE + caminho, { method: metodo, headers, body: corpo !== undefined ? JSON.stringify(corpo) : undefined, redirect: 'manual' });
  const texto = await r.text();
  let j = null; try { j = JSON.parse(texto); } catch {}
  return { status: r.status, loc: r.headers.get('location') || '', tipo: r.headers.get('content-type') || '', texto, j };
};

/* ───────── servidor local ───────── */
let servidor = null;
const encerrar = () => {
  if (!servidor) return;
  try { execSync(`taskkill /PID ${servidor.pid} /T /F`, { stdio: 'ignore' }); } catch { try { servidor.kill('SIGKILL'); } catch {} }
  servidor = null;
};
process.on('exit', encerrar);
process.on('SIGINT', () => { encerrar(); process.exit(130); });

if (!externo) {
  const estado = path.join(RAIZ, '.wrangler', 'qa-state');
  fs.rmSync(estado, { recursive: true, force: true }); // banco limpo a cada execução
  servidor = spawn('npx', ['wrangler', 'dev', '--config', 'wrangler.teste.jsonc', '--local', '--port', String(PORTA), '--persist-to', estado],
    { cwd: RAIZ, shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  servidor.stdout.on('data', d => { log += d; });
  servidor.stderr.on('data', d => { log += d; });
  let pronto = false;
  for (let i = 0; i < 60 && !pronto; i++) {
    await new Promise(r => setTimeout(r, 1500));
    try { pronto = (await fetch(`${BASE}/testes/robots.txt`)).ok; } catch {}
  }
  if (!pronto) { console.error('Servidor local não subiu.\n' + log.slice(-1500)); encerrar(); process.exit(1); }
  console.log(`Servidor local de teste no ar em ${BASE}`);
}

/* ───────── arquivos do projeto ───────── */
const paginasRaiz = fs.readdirSync(RAIZ).filter(f => f.endsWith('.html'));
const lerHtml = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');

secao('1. Páginas e rotas');
{
  let r = await req('GET', '/testes/');
  check('/testes/ abre (200, HTML, com <title>)', r.status === 200 && /text\/html/.test(r.tipo) && /<title>[^<]+<\/title>/.test(r.texto), `${r.status}`);
  r = await req('GET', '/testes');
  check('/testes sem barra → 301 para /testes/', r.status === 301 && r.loc.endsWith('/testes/'), `${r.status} ${r.loc}`);
  r = await req('GET', '/testes/excluir-dados');
  check('link antigo /excluir-dados → 301 para /meusdados (dentro de /testes)', r.status === 301 && /\/testes\/meusdados$/.test(r.loc), `${r.status} ${r.loc}`);

  const quebradas = [];
  for (const f of paginasRaiz) {
    const nome = f.replace(/\.html$/, '');
    const x = await req('GET', `/testes/${nome === 'index' ? '' : nome}`);
    if (x.status !== 200 || !/<title>[^<]+<\/title>/.test(x.texto)) quebradas.push(`${nome} (${x.status})`);
  }
  check(`todas as ${paginasRaiz.length} páginas abrem em /testes/<página> (200 + título)`, quebradas.length === 0, quebradas.join(', '));

  r = await req('GET', '/testes/cadastro.html');
  check('redirect interno de .html mantém o prefixo /testes (não joga para fora)', r.status >= 300 && r.status < 400 && r.loc.startsWith('/testes/'), `${r.status} ${r.loc}`);

  const expostos = [];
  for (const c of ['/testes/src/worker.js', '/testes/package.json', '/testes/wrangler.jsonc', '/testes/wrangler.teste.jsonc', '/testes/qa/regressao.mjs', '/testes/.gitignore', '/testes/CLAUDE.md', '/testes/SCHEMA_UNIFICADO.md']) {
    const x = await req('GET', c);
    if (x.status === 200 && !/<!doctype html/i.test(x.texto)) expostos.push(c);
  }
  check('arquivos internos (código do Worker, configs, docs, qa) não são servidos', expostos.length === 0, expostos.join(', '));
}

secao('2. Integridade dos arquivos do site');
{
  const faltando = [];
  const existe = rel => {
    const limpo = rel.split('#')[0].split('?')[0];
    if (!limpo) return true;
    const abs = path.join(RAIZ, limpo);
    return fs.existsSync(abs) || fs.existsSync(abs + '.html') || fs.existsSync(path.join(abs, 'index.html'));
  };
  for (const f of paginasRaiz) {
    for (const m of lerHtml(f).matchAll(/(?:src|href)="([^"]+)"/g)) {
      const v = m[1];
      if (/^(https?:|\/\/|mailto:|tel:|#|data:|javascript:)/i.test(v) || v.includes('${') || v.includes("'+")) continue;
      const rel = v.startsWith('/testes/') ? v.slice('/testes/'.length) : v.startsWith('/') ? null : v;
      if (rel === null) continue; // link absoluto para outro lugar do domínio
      if (!existe(rel)) faltando.push(`${f} → ${v}`);
    }
  }
  check('todo src/href local das páginas aponta para um arquivo que existe', faltando.length === 0, faltando.slice(0, 4).join(' | '));

  const tarefas = paginasRaiz.filter(f => /-tarefa\.html$/.test(f)).map(f => f.replace('-tarefa.html', ''));
  const semPar = tarefas.filter(t => !fs.existsSync(path.join(RAIZ, `${t}-resultado.html`)) || !fs.existsSync(path.join(RAIZ, 'js', `${t}.js`)));
  check(`cada instrumento (${tarefas.length}) tem página de tarefa + de resultado + js/<instrumento>.js`, semPar.length === 0, semPar.join(', '));
  const config = (() => { try { return JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', 'config.json'), 'utf8')); } catch { return null; } })();
  check('data/config.json é JSON válido com WhatsApp e marca', !!config?.brand?.whatsapp && !!config?.brand?.name);
}

secao('3. Escalas, temas e baterias (dados clínicos)');
{
  const carregar = (arquivo) => {
    const ctx = vm.createContext({ window: {}, document: {}, localStorage: {} }); // os arquivos rodam no navegador
    vm.runInContext(fs.readFileSync(path.join(RAIZ, 'data', arquivo), 'utf8') + '\n;globalThis.__x = { ' +
      (arquivo === 'testes.js' ? 'TEMAS, ESCALAS' : 'BATERIAS, PAGINA_INSTRUMENTO, paginaParaItemBateria') + ' };', ctx);
    return ctx.__x;
  };
  let TEMAS, ESCALAS, BATERIAS, PAGINA_INSTRUMENTO, paginaParaItemBateria;
  try { ({ TEMAS, ESCALAS } = carregar('testes.js')); ({ BATERIAS, PAGINA_INSTRUMENTO, paginaParaItemBateria } = carregar('baterias.js')); } catch (e) { check('data/testes.js e data/baterias.js carregam sem erro', false, e.message); }

  if (ESCALAS) {
    check('data/testes.js e data/baterias.js carregam sem erro', true);
    const escalas = Object.values(ESCALAS);
    const problemas = { campos: [], faixas: [], opcoes: [], idade: [], pontuacao: [] };
    // opções podem ser da escala toda (e.opcoes) ou de cada pergunta (perguntas[i].opcoes: AQ-10, ISI, AUDIT)
    const opcoesDe = (e, i) => (e.perguntas[i] && typeof e.perguntas[i] === 'object' && e.perguntas[i].opcoes) || e.opcoes || [];
    for (const e of escalas) {
      const n = (e.perguntas || []).length;
      const semOpcoes = n === 0 || Array.from({ length: n }, (_, i) => opcoesDe(e, i)).some(o => !o.length);
      if (!e.id || !e.nome || !e.instrucao || !n || semOpcoes || !Array.isArray(e.faixas) || !e.faixas.length) problemas.campos.push(e.id || '(sem id)');
      if (ESCALAS[e.id] !== e) problemas.campos.push(`${e.id}: id diferente da chave`);
      let minPossivel = 0, maxPossivel = 0, opcaoRuim = false;
      for (let i = 0; i < n; i++) {
        const ops = opcoesDe(e, i);
        const valores = ops.map(o => o.valor);
        if (valores.some(v => !Number.isFinite(v)) || ops.some(o => !o.label)) opcaoRuim = true;
        else if (valores.length) { minPossivel += Math.min(...valores); maxPossivel += Math.max(...valores); }
      }
      if (opcaoRuim) problemas.opcoes.push(e.id);
      if (!(e.minAge >= 0) || !(e.maxAge >= e.minAge)) problemas.idade.push(e.id);
      // faixas: ordenadas, sem sobreposição, sem buracos, do menor escore possível até scoreMax
      const fx = e.faixas || [];
      let erroFaixa = '';
      fx.forEach((f, i) => {
        if (!f.label || !f.classe || !f.texto) erroFaixa ||= `faixa ${i} sem label/classe/texto`;
        if (!(f.max >= f.min)) erroFaixa ||= `faixa ${i} com max < min`;
        if (i > 0 && f.min !== fx[i - 1].max + 1) erroFaixa ||= `faixa ${i} começa em ${f.min}, anterior terminou em ${fx[i - 1].max}`;
      });
      if (fx.length) {
        if (fx[0].min !== minPossivel) erroFaixa ||= `primeira faixa começa em ${fx[0].min}, mas o menor escore possível é ${minPossivel}`;
        if (fx[fx.length - 1].max !== e.scoreMax) erroFaixa ||= `última faixa termina em ${fx[fx.length - 1].max}, scoreMax é ${e.scoreMax}`;
      }
      if (erroFaixa) problemas.faixas.push(`${e.id}: ${erroFaixa}`);
      // (não exige igualdade: PHQ-9, ASRS, MDQ etc. não pontuam todos os itens como soma simples)
      if (!(e.scoreMax > minPossivel) || e.scoreMax > maxPossivel) problemas.pontuacao.push(`${e.id}: scoreMax ${e.scoreMax} fora do intervalo possível (${minPossivel}–${maxPossivel})`);
    }
    check(`${escalas.length} escalas: campos obrigatórios (id, nome, instrução, perguntas, opções, faixas)`, problemas.campos.length === 0, problemas.campos.join(', '));
    check('escalas: todas as opções têm rótulo e valor numérico', problemas.opcoes.length === 0, problemas.opcoes.join(', '));
    check('escalas: faixa etária válida (minAge ≤ maxAge)', problemas.idade.length === 0, problemas.idade.join(', '));
    check('escalas: faixas de resultado contíguas, sem buraco nem sobreposição, de 0 até scoreMax (todo escore cai em exatamente uma faixa)', problemas.faixas.length === 0, problemas.faixas.slice(0, 3).join(' | '));
    check('escalas: scoreMax dentro do intervalo de escores possíveis das respostas', problemas.pontuacao.length === 0, problemas.pontuacao.join(', '));

    const tem = Object.values(TEMAS || {});
    const temasRuins = [];
    for (const t of tem) { for (const id of t.escalas || []) if (!ESCALAS[id]) temasRuins.push(`${t.id}→${id}`); if (!t.nome || !(t.escalas || []).length) temasRuins.push(`${t.id}: sem nome/escalas`); }
    check(`${tem.length} temas apontam só para escalas que existem`, tem.length > 0 && temasRuins.length === 0, temasRuins.join(', '));

    const batRuins = [];
    for (const b of Object.values(BATERIAS || {})) {
      if (!b.nome || !(b.itens || []).length) batRuins.push(`${b.id}: sem nome/itens`);
      for (const it of b.itens || []) {
        if (it.tipo === 'rastreio' && !ESCALAS[it.escalaId]) batRuins.push(`${b.id}: escala ${it.escalaId} não existe`);
        if (it.tipo === 'desempenho') {
          const pg = PAGINA_INSTRUMENTO[it.instrumentoId];
          if (!pg || !fs.existsSync(path.join(RAIZ, pg))) batRuins.push(`${b.id}: instrumento ${it.instrumentoId} sem página (${pg})`);
        }
        const dest = paginaParaItemBateria(it);
        if (!dest) batRuins.push(`${b.id}: item sem destino`);
      }
    }
    check(`${Object.keys(BATERIAS || {}).length} baterias: cada item aponta para escala/instrumento/página que existe`, batRuins.length === 0, batRuins.join(' | '));
    const pgInstr = Object.entries(PAGINA_INSTRUMENTO || {}).filter(([, pg]) => !fs.existsSync(path.join(RAIZ, pg)));
    check('PAGINA_INSTRUMENTO: toda página de instrumento existe', pgInstr.length === 0, pgInstr.map(x => x[1]).join(', '));
  }
}

secao('4. API: resultado, admin e direitos do titular (LGPD)');
{
  const suf = Date.now().toString(36);
  const A = { nome: 'QA Alfa', email: `qa-${suf}-a@teste.local`, telefone: '11900000001' };
  const B = { nome: 'QA Beta', email: `qa-${suf}-b@teste.local`, telefone: '11900000002' };
  const corpo = (p, extra = {}) => ({ ...p, idade: 30, tipo: 'rastreio', identificador: 'depressao', resultados: { phq9: { score: 7 } }, faixaGeral: 'Leve', consentimentoDados: true, consentimentoInstrumento: true, ...extra });

  let r = await req('POST', '/testes/api/resultado', { corpo: corpo(A, { consentimentoDados: false }) });
  check('sem consentimento de dados → 400, nada gravado', r.status === 400 && r.j?.ok === false, `${r.status}`);
  r = await req('POST', '/testes/api/resultado', { corpo: corpo(A, { consentimentoInstrumento: false }) });
  check('sem consentimento do instrumento → 400', r.status === 400, `${r.status}`);
  r = await req('POST', '/testes/api/resultado', { corpo: corpo({ ...A, nome: '' }) });
  check('sem nome → 400', r.status === 400, `${r.status}`);
  r = await req('POST', '/testes/api/resultado', { corpo: { ...corpo(A), tipo: undefined } });
  check('sem tipo → 400', r.status === 400, `${r.status}`);

  r = await req('POST', '/testes/api/admin/login', { corpo: { usuario: ADMIN.usuario, senha: 'errada' } });
  check('login admin com senha errada → 401', r.status === 401 && !r.j?.token);
  r = await req('POST', '/testes/api/admin/login', { corpo: ADMIN });
  const token = r.j?.token;
  check('login admin correto → token', r.status === 200 && !!token);
  r = await req('GET', '/testes/api/admin/dados');
  check('dados admin sem token → 401', r.status === 401);
  r = await req('GET', '/testes/api/admin/dados', { token: Buffer.from('x:1:y').toString('base64') });
  check('dados admin com token forjado → 401', r.status === 401);
  r = await req('DELETE', '/testes/api/admin/dados/1');
  check('excluir registro sem token → 401', r.status === 401);
  r = await req('POST', '/testes/api/admin/dados/excluir-lote', { corpo: { ids: [1] } });
  check('excluir em lote sem token → 401', r.status === 401);

  r = await req('POST', '/testes/api/resultado', { corpo: corpo(A) });
  check('resultado válido (A) é aceito', r.status === 200 && r.j?.ok === true, `${r.status} ${r.texto.slice(0, 120)}`);
  r = await req('POST', '/testes/api/resultado', { corpo: corpo(B, { identificador: 'ansiedade', resultados: { bai: { score: 12 } }, faixaGeral: 'Moderada' }) });
  check('resultado válido (B) é aceito', r.status === 200 && r.j?.ok === true, `${r.status}`);

  r = await req('GET', '/testes/api/admin/dados', { token });
  const mine = (r.j?.registros || []).filter(x => x.email.startsWith(`qa-${suf}`));
  const regA = mine.find(x => x.email === A.email);
  check('admin lista os dois registros gravados', r.status === 200 && mine.length === 2, `${mine.length}`);
  check('registro guarda consentimentos com data e os resultados em JSON', !!regA?.consentimento_dados_em && !!regA?.consentimento_instrumento_em && JSON.parse(regA.resultados).phq9.score === 7 && regA.faixa_geral === 'Leve');

  const hoje = new Date().toISOString().slice(0, 10);
  r = await req('GET', `/testes/api/admin/dados?de=${hoje}&ate=${hoje}`, { token });
  check('filtro por data (hoje) traz os registros de hoje', (r.j?.registros || []).some(x => x.email === A.email));
  r = await req('GET', '/testes/api/admin/dados?de=2999-01-01', { token });
  check('filtro por data futura não traz nada', (r.j?.registros || []).length === 0);

  r = await req('POST', '/testes/api/consulta', { corpo: { email: A.email } });
  check('consulta LGPD sem telefone → 400', r.status === 400);
  r = await req('POST', '/testes/api/consulta', { corpo: { email: A.email, telefone: A.telefone } });
  check('consulta LGPD devolve só os registros de quem pediu (A, nunca B)', r.j?.ok && r.j.registros.length === 1 && r.j.registros.every(x => x.email === A.email));
  r = await req('POST', '/testes/api/consulta', { corpo: { email: A.email, telefone: B.telefone } });
  check('consulta com e-mail de A e telefone de B não devolve nada', r.j?.ok && r.j.registros.length === 0);

  r = await req('POST', '/testes/api/exclusao-solicitada', { corpo: { email: A.email } });
  check('exclusão LGPD sem telefone → 400', r.status === 400);
  r = await req('POST', '/testes/api/exclusao-solicitada', { corpo: { email: 'ninguem@teste.local', telefone: '11911111111' } });
  const respInexistente = r.texto;
  check('exclusão de quem não existe responde ok (não revela se o e-mail existe)', r.status === 200 && r.j?.ok === true);
  r = await req('POST', '/testes/api/exclusao-solicitada', { corpo: { email: A.email, telefone: A.telefone } });
  check('exclusão de A: mesma resposta genérica do caso inexistente', r.status === 200 && r.texto === respInexistente);
  r = await req('POST', '/testes/api/consulta', { corpo: { email: A.email, telefone: A.telefone } });
  check('depois da exclusão, A não tem mais registros', r.j?.registros?.length === 0);
  r = await req('POST', '/testes/api/consulta', { corpo: { email: B.email, telefone: B.telefone } });
  check('exclusão de A não apagou os registros de B', r.j?.registros?.length === 1);

  r = await req('DELETE', '/testes/api/admin/dados/abc', { token });
  check('excluir com id inválido → 400', r.status === 400);
  const idB = (await req('GET', '/testes/api/admin/dados', { token })).j.registros.find(x => x.email === B.email)?.id;
  r = await req('DELETE', `/testes/api/admin/dados/${idB}`, { token });
  check('admin exclui um registro por id', r.status === 200 && r.j?.ok === true);
  r = await req('POST', '/testes/api/admin/dados/excluir-lote', { token, corpo: { ids: [] } });
  check('lote com lista vazia → 400', r.status === 400);
  r = await req('POST', '/testes/api/admin/dados/excluir-lote', { token, corpo: { ids: ['1; DROP TABLE participantes'] } });
  check('lote com id não numérico → 400', r.status === 400);
  await req('POST', '/testes/api/resultado', { corpo: corpo({ ...A, email: `qa-${suf}-c@teste.local` }) });
  await req('POST', '/testes/api/resultado', { corpo: corpo({ ...A, email: `qa-${suf}-d@teste.local` }) });
  const ids = (await req('GET', '/testes/api/admin/dados', { token })).j.registros.filter(x => /-[cd]@teste\.local$/.test(x.email)).map(x => x.id);
  r = await req('POST', '/testes/api/admin/dados/excluir-lote', { token, corpo: { ids } });
  check('admin exclui em lote', r.status === 200 && r.j?.excluidos === 2 && ids.length === 2);
  r = await req('GET', '/testes/api/admin/dados', { token });
  check('ao final não sobra nenhum registro de teste', (r.j?.registros || []).filter(x => x.email.startsWith(`qa-${suf}`)).length === 0);
}

console.log(`\n${ok} verificações ok, ${falhas} falha(s)`);
encerrar();
if (falhas) { console.log('FALHAS:\n - ' + falhasLista.join('\n - ')); process.exit(1); }
