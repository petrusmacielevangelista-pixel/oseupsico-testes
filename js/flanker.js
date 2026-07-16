/* ============================================================
   Teste de Concentração — Eriksen Flanker Task
   Baseado em Eriksen & Eriksen (1974): uma seta central é flanqueada
   por 4 setas (2 de cada lado), todas na mesma direção (congruente)
   ou em direção oposta à central (incongruente). A pessoa indica a
   direção da SETA CENTRAL, ignorando as flanqueadoras.

   Escore: efeito flanker = TR médio (incongruente) − TR médio
   (congruente), em ms — mesmo paradigma de interferência do Stroop,
   aplicado ao controle inibitório espacial/atencional.
   ============================================================ */

'use strict';

const N_TENTATIVAS_FLANKER = 48; // 24 congruentes + 24 incongruentes — dentro da faixa comum usada em tarefas flanker computadorizadas, evitando o extremo baixo de versões de triagem rápida

function gerarTentativasFlanker() {
  const tentativas = [];
  for (let i = 0; i < N_TENTATIVAS_FLANKER / 2; i++) {
    const dir = Math.random() < 0.5 ? 'esquerda' : 'direita';
    tentativas.push({ direcaoCentral: dir, congruente: true, flancos: dir });
  }
  for (let i = 0; i < N_TENTATIVAS_FLANKER / 2; i++) {
    const dir = Math.random() < 0.5 ? 'esquerda' : 'direita';
    const oposta = dir === 'esquerda' ? 'direita' : 'esquerda';
    tentativas.push({ direcaoCentral: dir, congruente: false, flancos: oposta });
  }
  for (let i = tentativas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tentativas[i], tentativas[j]] = [tentativas[j], tentativas[i]];
  }
  return tentativas;
}

const tentativasFlanker = gerarTentativasFlanker();
let indiceFlanker = 0;
let tInicioFlanker = 0;
const respostasFlanker = [];

function setaSVG(direcao) {
  return direcao === 'esquerda' ? '←' : '→';
}

function renderTentativaFlanker() {
  const t = tentativasFlanker[indiceFlanker];
  const seta = setaSVG(t.flancos);
  const setaCentral = setaSVG(t.direcaoCentral);
  document.getElementById('flanker-estimulo').innerHTML =
    `${seta}${seta}<span style="color:#F97316;">${setaCentral}</span>${seta}${seta}`;
  document.getElementById('progresso').textContent = `${indiceFlanker + 1} / ${tentativasFlanker.length}`;
  tInicioFlanker = performance.now();
}

function responderFlanker(direcao) {
  const t = tentativasFlanker[indiceFlanker];
  const rt = performance.now() - tInicioFlanker;
  const correto = direcao === t.direcaoCentral;
  respostasFlanker.push({ congruente: t.congruente, correto, rt });

  indiceFlanker++;
  if (indiceFlanker < tentativasFlanker.length) {
    renderTentativaFlanker();
  } else {
    finalizarTarefaFlanker();
  }
}

function calcularResultadoFlanker() {
  const congruentesCorretas = respostasFlanker.filter(r => r.congruente && r.correto);
  const incongruentesCorretas = respostasFlanker.filter(r => !r.congruente && r.correto);
  const acertos = respostasFlanker.filter(r => r.correto).length;

  const mediaRT = arr => arr.length ? arr.reduce((s, r) => s + r.rt, 0) / arr.length : 0;
  const rtCongruente = mediaRT(congruentesCorretas);
  const rtIncongruente = mediaRT(incongruentesCorretas);
  const efeitoFlanker = Math.round(rtIncongruente - rtCongruente);

  let classe, faixa;
  if (efeitoFlanker < 50) { classe = 'minimal'; faixa = 'Interferência baixa'; }
  else if (efeitoFlanker <= 150) { classe = 'moderate'; faixa = 'Interferência dentro do típico'; }
  else { classe = 'severe'; faixa = 'Interferência acima do típico'; }

  return {
    score: efeitoFlanker, faixa, classe,
    acuracia: Math.round((acertos / respostasFlanker.length) * 100),
    rtCongruente: Math.round(rtCongruente), rtIncongruente: Math.round(rtIncongruente),
  };
}

async function finalizarTarefaFlanker() {
  const resultado = calcularResultadoFlanker();
  const dados = JSON.parse(sessionStorage.getItem('psico_cadastro') || '{}');
  sessionStorage.setItem('psico_flanker_resultado', JSON.stringify({ ...dados, ...resultado }));

  if (typeof emBateria === 'function' && emBateria()) {
    await avancarBateria('flanker', { score: resultado.score, faixa: resultado.faixa, classe: resultado.classe });
    return;
  }

  try {
    await fetch('/testes/api/resultado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: dados.nome, email: dados.email, telefone: dados.telefone, idade: dados.idade,
        tipo: 'desempenho', identificador: 'flanker',
        faixaGeral: resultado.classe,
        resultados: {
          score: resultado.score, faixa: resultado.faixa, classe: resultado.classe,
          metricas: { acuracia: resultado.acuracia, rt_congruente_ms: resultado.rtCongruente, rt_incongruente_ms: resultado.rtIncongruente },
        },
        consentimentoDados: !!dados.consentimentoDadosEm,
        consentimentoInstrumento: !!dados.consentimentoInstrumentoEm,
      }),
    });
  } catch (e) {
    console.error('Erro ao enviar resultado do Flanker:', e);
  }

  window.location.href = '/testes/flanker-resultado.html';
}

let tentativaDescartadaFlanker = false;
let timeoutSaidaTelaFlanker = null;
function tratarTrocaDeAbaFlanker() {
  // Espera a tela ficar oculta por mais de 1.5s antes de descartar —
  // evita falso positivo quando outra janela sobrepõe momentaneamente
  // o navegador (comum em setups com 2 monitores).
  if (document.hidden) {
    if (indiceFlanker > 0 && !tentativaDescartadaFlanker) {
      timeoutSaidaTelaFlanker = setTimeout(() => {
        if (document.hidden && !tentativaDescartadaFlanker) {
          tentativaDescartadaFlanker = true;
          alert('Você saiu da tela durante o teste. Por isso, esta tentativa foi descartada — recomece quando puder ficar sem interrupções.');
          window.location.href = '/testes/';
        }
      }, 1500);
    }
  } else {
    clearTimeout(timeoutSaidaTelaFlanker);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderTentativaFlanker();
  document.addEventListener('visibilitychange', tratarTrocaDeAbaFlanker);
});
