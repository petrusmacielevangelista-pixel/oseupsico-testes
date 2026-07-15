/* ============================================================
   Teste de Atenção Sustentada — PVT-B (Brief Psychomotor
   Vigilance Task)
   Baseado em Basner et al. (2011): versão breve do PVT clássico
   (Dinges & Powell, 1985). Duração de 3 minutos, intervalo entre
   estímulos aleatório de 1-4s, limiar de lapso de 355ms (ajustado
   pra versão breve — o PVT completo de 10 min usa 500ms).

   Mede atenção sustentada, não "velocidade" isolada — por isso o
   nome do teste evita a palavra "reação" (ver decisão de produto
   registrada na conversa: revelar que o foco é velocidade convida
   a pessoa a antecipar cliques, o que destrói a medida).
   ============================================================ */

'use strict';

const DURACAO_TOTAL_MS = 3 * 60 * 1000; // 3 minutos
const ISI_MIN_MS = 1000, ISI_MAX_MS = 4000;
const LIMIAR_LAPSO_MS = 355;

// Sem resposta em 10s = lapso por omissão (protocolo padrão do PVT
// trata não-resposta como lapso) — sem isso o teste travaria no verde.
const TIMEOUT_SEM_RESPOSTA_MS = 10000;

let inicioTeste = 0;
let estimuloAtivo = false;
let tEstimuloMostrado = 0;
let timeoutProximoEstimulo = null;
let timeoutSemResposta = null;
const respostasPVT = []; // { rt, lapso, falsoInicio }

function agendarProximoEstimulo() {
  if (Date.now() - inicioTeste >= DURACAO_TOTAL_MS) {
    finalizarTarefaPVT();
    return;
  }
  const isi = ISI_MIN_MS + Math.random() * (ISI_MAX_MS - ISI_MIN_MS);
  document.getElementById('pvt-area').style.background = '#1A1A1A';
  document.getElementById('pvt-msg').textContent = 'Aguarde...';
  timeoutProximoEstimulo = setTimeout(mostrarEstimulo, isi);
}

function mostrarEstimulo() {
  estimuloAtivo = true;
  tEstimuloMostrado = performance.now();
  document.getElementById('pvt-area').style.background = '#22C55E';
  document.getElementById('pvt-msg').textContent = 'CLIQUE!';
  timeoutSemResposta = setTimeout(() => {
    estimuloAtivo = false;
    respostasPVT.push({ rt: null, lapso: true, falsoInicio: false });
    agendarProximoEstimulo();
  }, TIMEOUT_SEM_RESPOSTA_MS);
}

function clicarPVT() {
  const agora = performance.now();
  const progresso = Math.min(100, Math.round(((Date.now() - inicioTeste) / DURACAO_TOTAL_MS) * 100));
  document.getElementById('progresso').textContent = `${progresso}%`;

  if (!estimuloAtivo) {
    // Clique antecipado — falso início, não conta como resposta válida
    respostasPVT.push({ rt: null, lapso: false, falsoInicio: true });
    return;
  }

  const rt = Math.round(agora - tEstimuloMostrado);
  estimuloAtivo = false;
  clearTimeout(timeoutSemResposta);
  respostasPVT.push({ rt, lapso: rt > LIMIAR_LAPSO_MS, falsoInicio: false });
  agendarProximoEstimulo();
}

function calcularResultadoPVT() {
  const validas = respostasPVT.filter(r => !r.falsoInicio);
  const falsosInicios = respostasPVT.filter(r => r.falsoInicio).length;
  const lapsos = validas.filter(r => r.lapso).length;
  const comRT = validas.filter(r => r.rt !== null); // exclui lapsos por omissão (sem clique)
  const rtMedio = comRT.length ? Math.round(comRT.reduce((s, r) => s + r.rt, 0) / comRT.length) : 0;

  // Sem ponto de corte clínico validado — classificação descritiva
  // pela proporção de lapsos (desatenção) sobre o total de respostas.
  const proporcaoLapsos = validas.length ? lapsos / validas.length : 0;
  let classe, faixa;
  if (proporcaoLapsos < 0.1) { classe = 'minimal'; faixa = 'Poucos lapsos de atenção'; }
  else if (proporcaoLapsos <= 0.25) { classe = 'moderate'; faixa = 'Lapsos dentro do esperado'; }
  else { classe = 'severe'; faixa = 'Lapsos de atenção acima do esperado'; }

  return { score: lapsos, faixa, classe, rtMedio, totalRespostas: validas.length, falsosInicios };
}

async function finalizarTarefaPVT() {
  clearTimeout(timeoutProximoEstimulo);
  clearTimeout(timeoutSemResposta);
  estimuloAtivo = false;
  document.getElementById('pvt-area').style.background = '#1A1A1A';
  document.getElementById('pvt-msg').textContent = 'Concluído!';

  const resultado = calcularResultadoPVT();
  const dados = JSON.parse(sessionStorage.getItem('psico_cadastro') || '{}');
  sessionStorage.setItem('psico_pvt_resultado', JSON.stringify({ ...dados, ...resultado }));

  if (typeof emBateria === 'function' && emBateria()) {
    await avancarBateria('pvt', { score: resultado.score, faixa: resultado.faixa, classe: resultado.classe });
    return;
  }

  try {
    await fetch('/testes/api/resultado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: dados.nome, email: dados.email, telefone: dados.telefone, idade: dados.idade,
        tipo: 'desempenho', identificador: 'pvt',
        faixaGeral: resultado.classe,
        resultados: {
          score: resultado.score, faixa: resultado.faixa, classe: resultado.classe,
          metricas: { rt_medio_ms: resultado.rtMedio, total_respostas: resultado.totalRespostas, falsos_inicios: resultado.falsosInicios },
        },
        consentimentoDados: !!dados.consentimentoDadosEm,
        consentimentoInstrumento: !!dados.consentimentoInstrumentoEm,
      }),
    });
  } catch (e) {
    console.error('Erro ao enviar resultado do PVT:', e);
  }

  window.location.href = '/testes/pvt-resultado.html';
}

let tentativaDescartadaPVT = false;
function tratarTrocaDeAbaPVT() {
  if (document.hidden && respostasPVT.length > 0 && !tentativaDescartadaPVT) {
    tentativaDescartadaPVT = true;
    clearTimeout(timeoutProximoEstimulo);
    clearTimeout(timeoutSemResposta);
    alert('Você saiu da tela durante o teste. Por isso, esta tentativa foi descartada — recomece quando puder ficar sem interrupções.');
    window.location.href = '/testes/';
  }
}

function iniciarPVT() {
  inicioTeste = Date.now();
  agendarProximoEstimulo();
  document.addEventListener('visibilitychange', tratarTrocaDeAbaPVT);
}
