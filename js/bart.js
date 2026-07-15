/* ============================================================
   BART — Balloon Analogue Risk Task
   Baseado em Lejuez et al. (2002), J Exp Psychol Appl, 8(2), 75-84.

   Protocolo: 20 balões, probabilidade de estouro 1/(129-bombaAtual)
   (breakpoint 1-128, ponto médio de estouro = 64 bombas).
   Cada bomba vale R$ 0,05. Ganhos de um balão só são "guardados" se
   a pessoa parar antes de estourar; balão estourado perde os ganhos
   daquele balão (mas não os já guardados de balões anteriores).

   Escore: "adjusted average pumps" — média de bombas apenas nos
   balões que NÃO estouraram (padrão da literatura, Lejuez et al.
   2002). IMPORTANTE: não existem pontos de corte clínicos validados
   pra esse instrumento — a interpretação usada aqui é descritiva,
   comparando com a faixa típica publicada (26-35 bombas ajustadas),
   não uma classificação de risco clínico.
   ============================================================ */

'use strict';

const TOTAL_BALOES = 20;
const MAX_BOMBAS = 128;
const VALOR_BOMBA = 0.05;

const state = {
  baloAtual: 1,
  bombaAtual: 0,
  ganhoTemporario: 0,
  saldo: 0,
  estourado: false,
  historico: [], // [{bombas, estourou, ganho}]
  bloqueado: false,
};

function probabilidadeEstouro(bomba) {
  // P(estourar nesta bomba | sobreviveu até aqui) = 1/(129 - bomba)
  return 1 / (MAX_BOMBAS + 1 - bomba);
}

function bombear() {
  if (state.bloqueado || state.estourado) return;
  if (state.bombaAtual >= MAX_BOMBAS) return;

  state.bloqueado = true;
  state.bombaAtual++;

  const estourouAgora = Math.random() < probabilidadeEstouro(state.bombaAtual);

  if (estourouAgora) {
    state.estourado = true;
    state.historico.push({ bombas: state.bombaAtual, estourou: true, ganho: 0 });
    mostrarFeedback('estourou');
    setTimeout(proximoBalaoOuFim, 1400);
  } else {
    state.ganhoTemporario = state.bombaAtual * VALOR_BOMBA;
    atualizarUI();
    setTimeout(() => { state.bloqueado = false; }, 250);
  }
}

function guardar() {
  if (state.bloqueado || state.estourado || state.bombaAtual === 0) return;
  state.bloqueado = true;

  state.saldo += state.ganhoTemporario;
  state.historico.push({ bombas: state.bombaAtual, estourou: false, ganho: state.ganhoTemporario });
  mostrarFeedback('guardou');
  setTimeout(proximoBalaoOuFim, 1200);
}

function proximoBalaoOuFim() {
  if (state.baloAtual >= TOTAL_BALOES) {
    finalizarTarefa();
    return;
  }
  state.baloAtual++;
  state.bombaAtual = 0;
  state.ganhoTemporario = 0;
  state.estourado = false;
  state.bloqueado = false;
  atualizarUI();
}

function atualizarUI() {
  const balaoEl = document.getElementById('balao-visual');
  if (balaoEl) {
    const escala = 1 + (state.bombaAtual / MAX_BOMBAS) * 2.2;
    balaoEl.style.transform = `scale(${escala})`;
  }
  const contadorEl = document.getElementById('contador-balao');
  if (contadorEl) contadorEl.textContent = `Balão ${state.baloAtual} de ${TOTAL_BALOES}`;
  const bombasEl = document.getElementById('bombas-count');
  if (bombasEl) bombasEl.textContent = state.bombaAtual;
  const ganhoEl = document.getElementById('ganho-temp');
  if (ganhoEl) ganhoEl.textContent = `R$ ${state.ganhoTemporario.toFixed(2)}`;
  const saldoEl = document.getElementById('saldo-total');
  if (saldoEl) saldoEl.textContent = `R$ ${state.saldo.toFixed(2)}`;
  const btnGuardar = document.getElementById('btn-guardar');
  if (btnGuardar) btnGuardar.disabled = state.bombaAtual === 0 || state.estourado;
}

function mostrarFeedback(tipo) {
  const el = document.getElementById('feedback-msg');
  if (!el) return;
  if (tipo === 'estourou') {
    el.textContent = '💥 Estourou!';
    el.style.color = '#EF4444';
  } else {
    el.textContent = `✅ Guardado: R$ ${state.ganhoTemporario.toFixed(2)}`;
    el.style.color = '#22C55E';
  }
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1000);
}

function calcularResultado() {
  const naoEstourados = state.historico.filter(h => !h.estourou);
  const adjustedAvg = naoEstourados.length
    ? naoEstourados.reduce((s, h) => s + h.bombas, 0) / naoEstourados.length
    : 0;

  const nEstourados = state.historico.filter(h => h.estourou).length;

  // Faixa típica publicada (Lejuez et al., 2002): 26-35 bombas ajustadas.
  // Descritivo, não é ponto de corte clínico validado.
  let classe, faixa;
  if (adjustedAvg < 26) {
    classe = 'minimal'; faixa = 'Abaixo da faixa típica';
  } else if (adjustedAvg <= 35) {
    classe = 'moderate'; faixa = 'Dentro da faixa típica';
  } else {
    classe = 'severe'; faixa = 'Acima da faixa típica';
  }

  return {
    score: Math.round(adjustedAvg * 10) / 10,
    faixa, classe,
    nEstourados,
    saldoFinal: Math.round(state.saldo * 100) / 100,
  };
}

async function finalizarTarefa() {
  const resultado = calcularResultado();
  const dados = JSON.parse(sessionStorage.getItem('psico_cadastro') || '{}');

  sessionStorage.setItem('psico_bart_resultado', JSON.stringify({ ...dados, ...resultado }));

  if (typeof emBateria === 'function' && emBateria()) {
    await avancarBateria('bart', { score: resultado.score, faixa: resultado.faixa, classe: resultado.classe });
    return;
  }

  try {
    await fetch('/testes/api/resultado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: dados.nome, email: dados.email, telefone: dados.telefone, idade: dados.idade,
        tipo: 'desempenho', identificador: 'bart',
        faixaGeral: resultado.classe,
        resultados: {
          score: resultado.score, faixa: resultado.faixa, classe: resultado.classe,
          metricas: { n_estourados: resultado.nEstourados, saldo_final: resultado.saldoFinal, total_baloes: TOTAL_BALOES },
        },
        consentimentoDados: !!dados.consentimentoDadosEm,
        consentimentoInstrumento: !!dados.consentimentoInstrumentoEm,
      }),
    });
  } catch (e) {
    console.error('Erro ao enviar resultado do BART:', e);
  }

  window.location.href = '/testes/bart-resultado.html';
}

let tentativaDescartada = false;
function tratarTrocaDeAba() {
  if (document.hidden && state.baloAtual > 1 && !tentativaDescartada) {
    tentativaDescartada = true;
    alert('Você saiu da tela durante a tarefa. Por isso, esta tentativa foi descartada — recomece quando puder ficar sem interrupções.');
    window.location.href = '/testes/';
  }
}

function initBART() {
  atualizarUI();
  document.addEventListener('visibilitychange', tratarTrocaDeAba);
}

document.addEventListener('DOMContentLoaded', initBART);
