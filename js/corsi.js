/* ============================================================
   Teste de Memória Espacial — Corsi Block-Tapping Task
   Baseado em Corsi (1972) / Kessels et al. (2000): 9 blocos em
   posições fixas pseudo-aleatórias. Sequências começam em
   comprimento 2, aumentam progressivamente, 2 tentativas por
   comprimento. Para após 2 erros seguidos no mesmo comprimento.

   Escore: "span" — o maior comprimento de sequência reproduzido
   corretamente. Referência da literatura: span médio em adultos
   saudáveis ≈ 5; span ≥ 6 é considerado acima da média — não é
   um ponto de corte clínico validado, é uma referência descritiva.
   ============================================================ */

'use strict';

const N_BLOCOS = 9;
const POSICOES_BLOCOS = [
  { x: 60,  y: 220 }, { x: 140, y: 80 },  { x: 230, y: 260 },
  { x: 310, y: 40 },  { x: 380, y: 180 }, { x: 460, y: 100 },
  { x: 520, y: 300 }, { x: 200, y: 160 }, { x: 440, y: 260 },
];

let comprimentoAtual = 2;
let tentativaNoComprimento = 0; // 0 ou 1 (2 tentativas por comprimento)
let errosNoComprimento = 0;
let sequenciaAlvo = [];
let sequenciaJogador = [];
let mostrandoSequencia = false;
let maiorSpanAlcancado = 0;

function gerarSequencia(comprimento) {
  const indices = Array.from({ length: N_BLOCOS }, (_, i) => i);
  const seq = [];
  for (let i = 0; i < comprimento; i++) {
    const idx = Math.floor(Math.random() * indices.length);
    seq.push(indices[idx]);
    indices.splice(idx, 1);
  }
  return seq;
}

function renderBlocos() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('corsi-svg');
  svg.innerHTML = '';
  svg.setAttribute('viewBox', '0 0 580 340');

  POSICOES_BLOCOS.forEach((pos, i) => {
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', pos.x);
    rect.setAttribute('y', pos.y);
    rect.setAttribute('width', 48);
    rect.setAttribute('height', 48);
    rect.setAttribute('rx', 8);
    rect.setAttribute('fill', '#1A1A1A');
    rect.setAttribute('data-indice', i);
    rect.id = `bloco-${i}`;
    rect.style.cursor = mostrandoSequencia ? 'default' : 'pointer';
    if (!mostrandoSequencia) rect.addEventListener('click', () => clicarBloco(i));
    svg.appendChild(rect);
  });
}

function piscarBloco(i, callback) {
  const bloco = document.getElementById(`bloco-${i}`);
  bloco.setAttribute('fill', '#F5C518');
  setTimeout(() => {
    bloco.setAttribute('fill', '#1A1A1A');
    setTimeout(callback, 250);
  }, 600);
}

function mostrarSequencia() {
  mostrandoSequencia = true;
  sequenciaJogador = [];
  document.getElementById('corsi-status').textContent = 'Observe a sequência...';
  renderBlocos();

  let i = 0;
  function proximo() {
    if (i >= sequenciaAlvo.length) {
      mostrandoSequencia = false;
      document.getElementById('corsi-status').textContent = 'Agora repita a sequência clicando nos blocos, na mesma ordem.';
      renderBlocos();
      return;
    }
    piscarBloco(sequenciaAlvo[i], () => { i++; proximo(); });
  }
  proximo();
}

function clicarBloco(i) {
  if (mostrandoSequencia) return;
  sequenciaJogador.push(i);

  const bloco = document.getElementById(`bloco-${i}`);
  bloco.setAttribute('fill', '#378ADD');
  setTimeout(() => bloco.setAttribute('fill', '#1A1A1A'), 300);

  const idx = sequenciaJogador.length - 1;
  if (sequenciaJogador[idx] !== sequenciaAlvo[idx]) {
    // Erro imediato
    processarResultadoTentativa(false);
    return;
  }

  if (sequenciaJogador.length === sequenciaAlvo.length) {
    processarResultadoTentativa(true);
  }
}

function processarResultadoTentativa(acertou) {
  if (acertou) {
    maiorSpanAlcancado = Math.max(maiorSpanAlcancado, comprimentoAtual);
    errosNoComprimento = 0;
    comprimentoAtual++;
    tentativaNoComprimento = 0;
    if (comprimentoAtual > N_BLOCOS) { finalizarTarefa(); return; }
    setTimeout(iniciarTentativa, 800);
  } else {
    errosNoComprimento++;
    tentativaNoComprimento++;
    if (errosNoComprimento >= 2) { finalizarTarefa(); return; }
    if (tentativaNoComprimento >= 2) {
      // 2ª tentativa também falhou mas já contabilizada acima — encerra
      finalizarTarefa();
      return;
    }
    setTimeout(iniciarTentativa, 800);
  }
}

function iniciarTentativa() {
  sequenciaAlvo = gerarSequencia(comprimentoAtual);
  mostrarSequencia();
}

async function finalizarTarefa() {
  const span = maiorSpanAlcancado;

  // Referência descritiva (span médio adulto ≈ 5), não ponto de corte clínico
  let classe, faixa;
  if (span < 4) { classe = 'severe'; faixa = 'Abaixo da média de referência'; }
  else if (span <= 5) { classe = 'moderate'; faixa = 'Dentro da média de referência'; }
  else { classe = 'minimal'; faixa = 'Acima da média de referência'; }

  const resultado = { score: span, faixa, classe };
  const dados = JSON.parse(sessionStorage.getItem('psico_cadastro') || '{}');
  sessionStorage.setItem('psico_corsi_resultado', JSON.stringify({ ...dados, ...resultado }));

  if (typeof emBateria === 'function' && emBateria()) {
    await avancarBateria('corsi', { score: span, faixa, classe });
    return;
  }

  try {
    await fetch('/testes/api/resultado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: dados.nome, email: dados.email, telefone: dados.telefone, idade: dados.idade,
        tipo: 'desempenho', identificador: 'corsi',
        faixaGeral: classe,
        resultados: { score: span, faixa, classe, metricas: { span_alcancado: span } },
        consentimentoDados: !!dados.consentimentoDadosEm,
        consentimentoInstrumento: !!dados.consentimentoInstrumentoEm,
      }),
    });
  } catch (e) {
    console.error('Erro ao enviar resultado do Corsi:', e);
  }

  window.location.href = '/testes/corsi-resultado.html';
}

let tentativaDescartada = false;
let timeoutSaidaTela = null;
function tratarTrocaDeAba() {
  // Espera a tela ficar oculta por mais de 1.5s antes de descartar —
  // evita falso positivo quando outra janela sobrepõe momentaneamente
  // o navegador (comum em setups com 2 monitores).
  if (document.hidden) {
    if (maiorSpanAlcancado > 0 && !tentativaDescartada) {
      timeoutSaidaTela = setTimeout(() => {
        if (document.hidden && !tentativaDescartada) {
          tentativaDescartada = true;
          alert('Você saiu da tela durante o teste. Por isso, esta tentativa foi descartada — recomece quando puder ficar sem interrupções.');
          window.location.href = '/testes/';
        }
      }, 1500);
    }
  } else {
    clearTimeout(timeoutSaidaTela);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderBlocos();
  document.addEventListener('visibilitychange', tratarTrocaDeAba);
});
