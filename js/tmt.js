/* ============================================================
   Teste de Velocidade Mental — Trail Making Test (TMT)
   Baseado no protocolo de Reitan (Army Individual Test Battery,
   1944; Reitan, 1958): Parte A (conectar 1→25 em ordem) e Parte B
   (alternar número-letra: 1-A-2-B-3-C...-12-L-13), 25 círculos cada.

   Escore: tempo da Parte A, tempo da Parte B, e B−A (custo de
   alternância/flexibilidade cognitiva — a métrica mais usada
   clinicamente). Faixas de referência usam médias amplamente citadas
   na literatura (~29s Parte A, ~75s Parte B em adultos saudáveis),
   NÃO as normas completas estratificadas por idade/escolaridade
   (que exigem tabela normativa própria não disponível aqui) —
   isso é explicitado no resultado.
   ============================================================ */

'use strict';

const N_CIRCULOS = 25;
const LARGURA = 600;
const ALTURA = 420;
const RAIO = 22;

function gerarPosicoes(n) {
  // Grade com jitter — evita sobreposição sem precisar de detecção de colisão custosa
  const cols = 6, rows = 5;
  const celulaW = LARGURA / cols, celulaH = ALTURA / rows;
  const celulas = [];
  for (let r = 0; r < rows; r++) for (let cCol = 0; cCol < cols; cCol++) celulas.push({ r, cCol });
  // embaralha células
  for (let i = celulas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [celulas[i], celulas[j]] = [celulas[j], celulas[i]];
  }
  return celulas.slice(0, n).map(({ r, cCol }) => {
    const jitterX = (Math.random() - 0.5) * (celulaW - RAIO * 2.4);
    const jitterY = (Math.random() - 0.5) * (celulaH - RAIO * 2.4);
    return {
      x: cCol * celulaW + celulaW / 2 + jitterX,
      y: r * celulaH + celulaH / 2 + jitterY,
    };
  });
}

function sequenciaParteA() {
  return Array.from({ length: N_CIRCULOS }, (_, i) => String(i + 1));
}

function sequenciaParteB() {
  const seq = [];
  const letras = 'ABCDEFGHIJKL';
  for (let i = 1; i <= 13; i++) {
    seq.push(String(i));
    if (i <= 12) seq.push(letras[i - 1]);
  }
  return seq; // 1,A,2,B,...,12,L,13 = 25 itens
}

let parte = 'A';
let sequencia = [];
let posicoes = [];
let proximoIndice = 0;
let inicioTempo = 0;
let erros = 0;
const resultadoParcial = {};

function iniciarParte(p) {
  parte = p;
  sequencia = p === 'A' ? sequenciaParteA() : sequenciaParteB();
  posicoes = gerarPosicoes(N_CIRCULOS);
  proximoIndice = 0;
  erros = 0;
  renderTrilha();
  inicioTempo = performance.now();
}

function renderTrilha() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('trilha-svg');
  svg.innerHTML = '';
  svg.setAttribute('viewBox', `0 0 ${LARGURA} ${ALTURA}`);

  sequencia.forEach((label, i) => {
    const pos = posicoes[i];
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', pos.x);
    circle.setAttribute('cy', pos.y);
    circle.setAttribute('r', RAIO);
    circle.setAttribute('fill', i < proximoIndice ? '#22C55E' : '#fff');
    circle.setAttribute('stroke', '#1A1A1A');
    circle.setAttribute('stroke-width', '2');
    circle.style.cursor = 'pointer';
    circle.dataset.indice = i;
    circle.addEventListener('click', () => clicarCirculo(i));
    svg.appendChild(circle);

    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', pos.x);
    text.setAttribute('y', pos.y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '15');
    text.setAttribute('font-weight', '700');
    text.setAttribute('fill', i < proximoIndice ? '#fff' : '#1A1A1A');
    text.style.pointerEvents = 'none';
    text.textContent = label;
    svg.appendChild(text);
  });

  // Linhas já conectadas
  for (let i = 1; i < proximoIndice; i++) {
    const a = posicoes[i - 1], b = posicoes[i];
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    line.setAttribute('stroke', '#22C55E');
    line.setAttribute('stroke-width', '3');
    svg.insertBefore(line, svg.firstChild);
  }
}

function clicarCirculo(indice) {
  if (indice === proximoIndice) {
    proximoIndice++;
    renderTrilha();
    if (proximoIndice >= sequencia.length) {
      finalizarParte();
    }
  } else if (indice > proximoIndice) {
    erros++;
    const svg = document.getElementById('trilha-svg');
    const circ = svg.querySelector(`circle[data-indice="${indice}"]`);
    if (circ) {
      circ.setAttribute('fill', '#FEE2E2');
      setTimeout(() => circ.setAttribute('fill', '#fff'), 300);
    }
  }
}

function finalizarParte() {
  const tempoMs = performance.now() - inicioTempo;
  resultadoParcial[parte] = { tempoMs, erros };

  if (parte === 'A') {
    document.getElementById('transicao-titulo').textContent = 'Parte A concluída!';
    document.getElementById('transicao-msg').textContent = 'Agora a Parte B: alterne entre números e letras (1, A, 2, B, 3, C...).';
    mostrarTransicao(() => iniciarParte('B'));
  } else {
    calcularEEnviarResultado();
  }
}

function mostrarTransicao(onContinuar) {
  document.getElementById('tela-trilha').style.display = 'none';
  const tela = document.getElementById('tela-transicao');
  tela.style.display = 'block';
  document.getElementById('btn-continuar-parte').onclick = () => {
    tela.style.display = 'none';
    document.getElementById('tela-trilha').style.display = 'block';
    onContinuar();
  };
}

async function calcularEEnviarResultado() {
  const tempoA = Math.round(resultadoParcial.A.tempoMs / 1000 * 10) / 10;
  const tempoB = Math.round(resultadoParcial.B.tempoMs / 1000 * 10) / 10;
  const custoBA = Math.round((tempoB - tempoA) * 10) / 10;

  // Faixas de referência descritivas (médias amplamente citadas na
  // literatura para adultos saudáveis: Parte A ~29s, Parte B ~75s) —
  // não são normas estratificadas por idade/escolaridade.
  let classe, faixa;
  if (tempoB <= 60) { classe = 'minimal'; faixa = 'Tempo abaixo da média de referência'; }
  else if (tempoB <= 100) { classe = 'moderate'; faixa = 'Tempo dentro da média de referência'; }
  else { classe = 'severe'; faixa = 'Tempo acima da média de referência'; }

  const resultado = {
    score: tempoB, faixa, classe,
    tempoA, tempoB, custoBA,
    errosA: resultadoParcial.A.erros, errosB: resultadoParcial.B.erros,
  };

  const dados = JSON.parse(sessionStorage.getItem('psico_cadastro') || '{}');
  sessionStorage.setItem('psico_tmt_resultado', JSON.stringify({ ...dados, ...resultado }));

  try {
    await fetch('/testes/api/resultado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: dados.nome, email: dados.email, telefone: dados.telefone, idade: dados.idade,
        tipo: 'desempenho', identificador: 'tmt',
        faixaGeral: resultado.classe,
        resultados: {
          score: tempoB, faixa, classe,
          metricas: { tempo_parte_a_s: tempoA, tempo_parte_b_s: tempoB, custo_b_menos_a_s: custoBA, erros_a: resultado.errosA, erros_b: resultado.errosB },
        },
        consentimentoDados: !!dados.consentimentoDadosEm,
        consentimentoInstrumento: !!dados.consentimentoInstrumentoEm,
      }),
    });
  } catch (e) {
    console.error('Erro ao enviar resultado do TMT:', e);
  }

  window.location.href = '/testes/tmt-resultado.html';
}

let tentativaDescartada = false;
function tratarTrocaDeAba() {
  if (document.hidden && proximoIndice > 0 && !tentativaDescartada) {
    tentativaDescartada = true;
    alert('Você saiu da tela durante o teste. Por isso, esta tentativa foi descartada — recomece quando puder ficar sem interrupções.');
    window.location.href = '/testes/';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  iniciarParte('A');
  document.addEventListener('visibilitychange', tratarTrocaDeAba);
});
