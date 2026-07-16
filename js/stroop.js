/* ============================================================
   Teste de Atenção Seletiva — Stroop (nomeação de cor)
   Baseado no paradigma clássico de Stroop (1935), na variante
   computadorizada de tentativa única (não a versão em papel de
   colunas cronometradas de Golden, 1978) — mede tempo de reação
   e acurácia por tentativa, não tempo total de leitura.

   A pessoa vê uma palavra (nome de cor) escrita em uma tinta de
   cor às vezes igual (congruente), às vezes diferente (incongruente)
   da palavra. Deve clicar na COR DA TINTA, ignorando a palavra.

   Escore: efeito de interferência = TR médio (incongruente) −
   TR médio (congruente), em ms. Efeito típico na literatura ≈ 180ms
   (não é um ponto de corte clínico, é uma referência de magnitude
   de efeito — usado aqui apenas descritivamente).
   ============================================================ */

'use strict';

const CORES = [
  { nome: 'vermelho', hex: '#EF4444' },
  { nome: 'azul', hex: '#3B82F6' },
  { nome: 'verde', hex: '#22C55E' },
  { nome: 'amarelo', hex: '#EAB308' },
];

const N_TENTATIVAS = 24; // 12 congruentes + 12 incongruentes, embaralhadas

function gerarTentativas() {
  const tentativas = [];
  for (let i = 0; i < N_TENTATIVAS / 2; i++) {
    const palavra = CORES[Math.floor(Math.random() * CORES.length)];
    tentativas.push({ palavra: palavra.nome, tinta: palavra, congruente: true });
  }
  for (let i = 0; i < N_TENTATIVAS / 2; i++) {
    const palavra = CORES[Math.floor(Math.random() * CORES.length)];
    let tinta;
    do { tinta = CORES[Math.floor(Math.random() * CORES.length)]; } while (tinta.nome === palavra.nome);
    tentativas.push({ palavra: palavra.nome, tinta, congruente: false });
  }
  // embaralha
  for (let i = tentativas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tentativas[i], tentativas[j]] = [tentativas[j], tentativas[i]];
  }
  return tentativas;
}

const tentativas = gerarTentativas();
let indiceAtual = 0;
let tInicioTentativa = 0;
const respostas = [];

function renderTentativa() {
  const t = tentativas[indiceAtual];
  const palavraEl = document.getElementById('palavra-estimulo');
  palavraEl.textContent = t.palavra.toUpperCase();
  palavraEl.style.color = t.tinta.hex;

  document.getElementById('progresso').textContent = `${indiceAtual + 1} / ${tentativas.length}`;
  tInicioTentativa = performance.now();
}

function responder(corEscolhidaNome) {
  const t = tentativas[indiceAtual];
  const rt = performance.now() - tInicioTentativa;
  const correto = corEscolhidaNome === t.tinta.nome;
  respostas.push({ congruente: t.congruente, correto, rt });

  indiceAtual++;
  if (indiceAtual < tentativas.length) {
    renderTentativa();
  } else {
    finalizarTarefa();
  }
}

function calcularResultado() {
  const congruentesCorretas = respostas.filter(r => r.congruente && r.correto);
  const incongruentesCorretas = respostas.filter(r => !r.congruente && r.correto);
  const acertos = respostas.filter(r => r.correto).length;

  const mediaRT = arr => arr.length ? arr.reduce((s, r) => s + r.rt, 0) / arr.length : 0;
  const rtCongruente = mediaRT(congruentesCorretas);
  const rtIncongruente = mediaRT(incongruentesCorretas);
  const interferencia = Math.round(rtIncongruente - rtCongruente);

  let classe, faixa;
  if (interferencia < 100) { classe = 'minimal'; faixa = 'Interferência baixa'; }
  else if (interferencia <= 250) { classe = 'moderate'; faixa = 'Interferência dentro do típico'; }
  else { classe = 'severe'; faixa = 'Interferência acima do típico'; }

  return {
    score: interferencia, faixa, classe,
    acuracia: Math.round((acertos / respostas.length) * 100),
    rtCongruente: Math.round(rtCongruente),
    rtIncongruente: Math.round(rtIncongruente),
  };
}

async function finalizarTarefa() {
  const resultado = calcularResultado();
  const dados = JSON.parse(sessionStorage.getItem('psico_cadastro') || '{}');
  sessionStorage.setItem('psico_stroop_resultado', JSON.stringify({ ...dados, ...resultado }));

  if (typeof emBateria === 'function' && emBateria()) {
    await avancarBateria('stroop', { score: resultado.score, faixa: resultado.faixa, classe: resultado.classe });
    return;
  }

  try {
    await fetch('/testes/api/resultado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: dados.nome, email: dados.email, telefone: dados.telefone, idade: dados.idade,
        tipo: 'desempenho', identificador: 'stroop',
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
    console.error('Erro ao enviar resultado do Stroop:', e);
  }

  window.location.href = '/testes/stroop-resultado.html';
}

let tentativaDescartada = false;
let timeoutSaidaTela = null;
function tratarTrocaDeAba() {
  // Espera a tela ficar oculta por mais de 1.5s antes de descartar —
  // evita falso positivo quando outra janela sobrepõe momentaneamente
  // o navegador (comum em setups com 2 monitores).
  if (document.hidden) {
    if (indiceAtual > 0 && !tentativaDescartada) {
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
  renderTentativa();
  document.addEventListener('visibilitychange', tratarTrocaDeAba);
});
