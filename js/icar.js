/* ============================================================
   Teste de Raciocínio Lógico — matrizes de padrões
   Inspirado no formato de "Matrix Reasoning" do ICAR (Condon &
   Revelle, 2014), mas com ITENS ORIGINAIS desenhados com formas
   geométricas simples — não reproduz o banco de imagens oficial
   do ICAR, para evitar qualquer questão de direitos sobre o
   estímulo visual específico.

   IMPORTANTE (achado de auditoria): como os itens são originais,
   as propriedades psicométricas publicadas do ICAR (alfa, correlação
   com QI) NÃO se aplicam aqui — não têm amostra de calibração própria.
   O resultado é tratado como contagem de acertos, sem conversão pra
   percentil ou QI equivalente.
   ============================================================ */

'use strict';

function celulaSVG(cell, cx, cy, tamanho) {
  if (!cell) return '';
  const cores = { azul: '#378ADD', coral: '#D85A30', verde: '#639922' };
  const cor = cores[cell.cor] || cores.azul;
  const s = { p: tamanho * 0.35, m: tamanho * 0.5, g: tamanho * 0.65 }[cell.tamanho] || tamanho * 0.5;

  if (cell.forma === 'circulo') {
    return `<circle cx="${cx}" cy="${cy}" r="${s / 2}" fill="${cor}" />`;
  }
  if (cell.forma === 'quadrado') {
    return `<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" fill="${cor}" rx="3" />`;
  }
  if (cell.forma === 'triangulo') {
    const rot = cell.rotacao || 0;
    return `<g transform="rotate(${rot} ${cx} ${cy})"><polygon points="${cx},${cy - s / 2} ${cx - s / 2},${cy + s / 2} ${cx + s / 2},${cy + s / 2}" fill="${cor}" /></g>`;
  }
  if (cell.forma === 'pontos') {
    const n = cell.n || 1;
    const raio = tamanho * 0.09;
    const espaco = raio * 2.6;
    const inicioX = cx - ((n - 1) * espaco) / 2;
    let out = '';
    for (let i = 0; i < n; i++) {
      out += `<circle cx="${inicioX + i * espaco}" cy="${cy}" r="${raio}" fill="${cor}" />`;
    }
    return out;
  }
  return '';
}

function grade3x3SVG(matriz, tamanhoCelula = 90) {
  const gap = 12;
  let svg = '';
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const x = c * (tamanhoCelula + gap);
      const y = r * (tamanhoCelula + gap);
      const cell = matriz[r][c];
      svg += `<rect x="${x}" y="${y}" width="${tamanhoCelula}" height="${tamanhoCelula}" rx="8" fill="#F1EFE8" stroke="none" />`;
      if (cell === null) {
        svg += `<text x="${x + tamanhoCelula / 2}" y="${y + tamanhoCelula / 2 + 8}" text-anchor="middle" font-size="28" font-weight="700" fill="#888">?</text>`;
      } else {
        svg += celulaSVG(cell, x + tamanhoCelula / 2, y + tamanhoCelula / 2, tamanhoCelula);
      }
    }
  }
  const totalSize = 3 * tamanhoCelula + 2 * gap;
  return `<svg viewBox="0 0 ${totalSize} ${totalSize}" width="100%" style="max-width:340px;">${svg}</svg>`;
}

function opcaoSVG(cell, tamanho = 70) {
  let svg = `<rect x="0" y="0" width="${tamanho}" height="${tamanho}" rx="8" fill="#F1EFE8" />`;
  svg += celulaSVG(cell, tamanho / 2, tamanho / 2, tamanho);
  return `<svg viewBox="0 0 ${tamanho} ${tamanho}" width="70" height="70">${svg}</svg>`;
}

/* ── Banco de itens (originais) ──
   Cada item define a matriz 3x3 (última célula = null, é a lacuna),
   as 4 opções de resposta, e o índice da opção correta. ── */
const c = (forma, tamanho, cor, extra = {}) => ({ forma, tamanho, cor, ...extra });

const ITENS = [
  { // 1: tamanho cresce da esquerda pra direita, em todas as linhas
    matriz: [
      [c('circulo','p','azul'), c('circulo','m','azul'), c('circulo','g','azul')],
      [c('circulo','p','azul'), c('circulo','m','azul'), c('circulo','g','azul')],
      [c('circulo','p','azul'), c('circulo','m','azul'), null],
    ],
    opcoes: [c('circulo','g','azul'), c('circulo','m','azul'), c('quadrado','g','azul'), c('circulo','p','azul')],
    correta: 0,
  },
  { // 2: tamanho decresce da esquerda pra direita
    matriz: [
      [c('quadrado','g','coral'), c('quadrado','m','coral'), c('quadrado','p','coral')],
      [c('quadrado','g','coral'), c('quadrado','m','coral'), c('quadrado','p','coral')],
      [c('quadrado','g','coral'), c('quadrado','m','coral'), null],
    ],
    opcoes: [c('quadrado','p','coral'), c('quadrado','g','coral'), c('circulo','p','coral'), c('quadrado','m','coral')],
    correta: 0,
  },
  { // 3: forma muda por linha (círculo, quadrado, triângulo), tamanho constante
    matriz: [
      [c('circulo','m','verde'), c('circulo','m','verde'), c('circulo','m','verde')],
      [c('quadrado','m','verde'), c('quadrado','m','verde'), c('quadrado','m','verde')],
      [c('triangulo','m','verde'), c('triangulo','m','verde'), null],
    ],
    opcoes: [c('triangulo','m','verde'), c('circulo','m','verde'), c('quadrado','m','verde'), c('triangulo','p','verde')],
    correta: 0,
  },
  { // 4: quantidade de pontos cresce por coluna (1, 2, 3)
    matriz: [
      [c('pontos','m','azul',{n:1}), c('pontos','m','azul',{n:2}), c('pontos','m','azul',{n:3})],
      [c('pontos','m','azul',{n:1}), c('pontos','m','azul',{n:2}), c('pontos','m','azul',{n:3})],
      [c('pontos','m','azul',{n:1}), c('pontos','m','azul',{n:2}), null],
    ],
    opcoes: [c('pontos','m','azul',{n:3}), c('pontos','m','azul',{n:2}), c('pontos','m','azul',{n:4}), c('pontos','m','azul',{n:1})],
    correta: 0,
  },
  { // 5: rotação do triângulo aumenta 90° por coluna
    matriz: [
      [c('triangulo','m','coral',{rotacao:0}), c('triangulo','m','coral',{rotacao:90}), c('triangulo','m','coral',{rotacao:180})],
      [c('triangulo','m','coral',{rotacao:0}), c('triangulo','m','coral',{rotacao:90}), c('triangulo','m','coral',{rotacao:180})],
      [c('triangulo','m','coral',{rotacao:0}), c('triangulo','m','coral',{rotacao:90}), null],
    ],
    opcoes: [c('triangulo','m','coral',{rotacao:180}), c('triangulo','m','coral',{rotacao:90}), c('triangulo','m','coral',{rotacao:270}), c('triangulo','m','coral',{rotacao:0})],
    correta: 0,
  },
  { // 6: padrão alternado (círculo, quadrado) tipo tabuleiro
    matriz: [
      [c('circulo','m','verde'), c('quadrado','m','verde'), c('circulo','m','verde')],
      [c('quadrado','m','verde'), c('circulo','m','verde'), c('quadrado','m','verde')],
      [c('circulo','m','verde'), c('quadrado','m','verde'), null],
    ],
    opcoes: [c('circulo','m','verde'), c('quadrado','m','verde'), c('triangulo','m','verde'), c('circulo','g','verde')],
    correta: 0,
  },
];

let itemAtual = 0;
let acertos = 0;
const respostas = [];

function renderItem() {
  const item = ITENS[itemAtual];
  document.getElementById('matriz-container').innerHTML = grade3x3SVG(item.matriz);
  document.getElementById('contador-item').textContent = `Item ${itemAtual + 1} de ${ITENS.length}`;

  const opcoesEl = document.getElementById('opcoes-container');
  opcoesEl.innerHTML = '';
  const letras = ['A', 'B', 'C', 'D'];
  item.opcoes.forEach((op, i) => {
    const btn = document.createElement('button');
    btn.className = 'icar-opcao';
    btn.innerHTML = opcaoSVG(op) + `<span>${letras[i]}</span>`;
    btn.onclick = () => escolherOpcao(i);
    opcoesEl.appendChild(btn);
  });
}

function escolherOpcao(indice) {
  const item = ITENS[itemAtual];
  const correto = indice === item.correta;
  if (correto) acertos++;
  respostas.push({ item: itemAtual, correto });

  if (itemAtual < ITENS.length - 1) {
    itemAtual++;
    renderItem();
  } else {
    finalizarTarefa();
  }
}

async function finalizarTarefa() {
  const total = ITENS.length;
  const proporcao = acertos / total;

  // Sem norma/percentil (itens originais, sem amostra de calibração) —
  // classificação puramente descritiva pela proporção de acertos.
  let classe, faixa;
  if (proporcao >= 0.75) { classe = 'severe'; faixa = 'Alto desempenho'; }
  else if (proporcao >= 0.4) { classe = 'moderate'; faixa = 'Desempenho intermediário'; }
  else { classe = 'minimal'; faixa = 'Desempenho abaixo do esperado neste conjunto de itens'; }

  const resultado = { score: acertos, scoreMax: total, faixa, classe };
  const dados = JSON.parse(sessionStorage.getItem('psico_cadastro') || '{}');
  sessionStorage.setItem('psico_icar_resultado', JSON.stringify({ ...dados, ...resultado }));

  if (typeof emBateria === 'function' && emBateria()) {
    await avancarBateria('icar', { score: acertos, scoreMax: total, faixa, classe });
    return;
  }

  try {
    await fetch('/testes/api/resultado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: dados.nome, email: dados.email, telefone: dados.telefone, idade: dados.idade,
        tipo: 'desempenho', identificador: 'icar',
        faixaGeral: resultado.classe,
        resultados: { score: acertos, faixa, classe, metricas: { total_itens: total } },
        consentimentoDados: !!dados.consentimentoDadosEm,
        consentimentoInstrumento: !!dados.consentimentoInstrumentoEm,
      }),
    });
  } catch (e) {
    console.error('Erro ao enviar resultado do ICAR:', e);
  }

  window.location.href = '/testes/icar-resultado.html';
}

document.addEventListener('DOMContentLoaded', renderItem);
