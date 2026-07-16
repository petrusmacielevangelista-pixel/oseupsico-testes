/* ============================================================
   Teste de Memória de Trabalho — N-Back (2-back)
   Protocolo padrão de 2-back (Kirchner, 1958; Jaeger, 2014): uma
   letra aparece por vez; a pessoa clica "É igual" quando a letra
   atual é igual à que apareceu 2 posições atrás.

   Escore: d' (d-prime), medida de detecção de sinal — d' = z(taxa de
   acertos) − z(taxa de falsos alarmes). Métrica padrão da literatura
   pra tarefas n-back (Haatveit et al., 2010). Usa correção de Hautus
   (1995) pra evitar z-score infinito quando a taxa é 0% ou 100%.
   ============================================================ */

'use strict';

const LETRAS = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K'];
const N_TENTATIVAS = 22; // 20 avaliáveis (as 2 primeiras não têm referência 2-back)
const N_BACK = 2;

function gerarSequencia() {
  const seq = [];
  const alvosPlanejados = new Set(); // índices que devem ser match proposital
  // ~35% das posições avaliáveis (a partir do índice N_BACK) são match
  for (let i = N_BACK; i < N_TENTATIVAS; i++) {
    if (Math.random() < 0.35) alvosPlanejados.add(i);
  }

  for (let i = 0; i < N_TENTATIVAS; i++) {
    if (i >= N_BACK && alvosPlanejados.has(i)) {
      seq.push(seq[i - N_BACK]);
    } else {
      let letra;
      do { letra = LETRAS[Math.floor(Math.random() * LETRAS.length)]; }
      while (i >= N_BACK && letra === seq[i - N_BACK]); // evita match acidental
      seq.push(letra);
    }
  }
  return seq;
}

const sequencia = gerarSequencia();
let indiceAtual = 0;
let respostas = []; // { ehMatch: bool, respondeu: bool }
let jaRespondeuEssaTentativa = false;
let timeoutProximo = null;

function ehMatch(i) {
  return i >= N_BACK && sequencia[i] === sequencia[i - N_BACK];
}

function renderTentativa() {
  jaRespondeuEssaTentativa = false;
  document.getElementById('letra-estimulo').textContent = sequencia[indiceAtual];
  document.getElementById('progresso').textContent = `${indiceAtual + 1} / ${sequencia.length}`;

  timeoutProximo = setTimeout(() => {
    registrarResposta(false); // não respondeu a tempo
  }, 2200);
}

function responderMatch() {
  if (jaRespondeuEssaTentativa || indiceAtual < N_BACK) return;
  registrarResposta(true);
}

function registrarResposta(respondeuMatch) {
  if (jaRespondeuEssaTentativa) return;
  jaRespondeuEssaTentativa = true;
  clearTimeout(timeoutProximo);

  if (indiceAtual >= N_BACK) {
    respostas.push({ ehMatch: ehMatch(indiceAtual), respondeu: respondeuMatch });
  }

  indiceAtual++;
  if (indiceAtual < sequencia.length) {
    setTimeout(renderTentativa, 300);
  } else {
    finalizarTarefa();
  }
}

function zScore(p) {
  // Aproximação de Acklam para a função inversa da normal padrão
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pLow = 0.02425;
  if (p <= 0) return -8; if (p >= 1) return 8;
  let q, r;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= 1 - pLow) {
    q = p - 0.5; r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

function calcularResultado() {
  const alvos = respostas.filter(r => r.ehMatch);
  const naoAlvos = respostas.filter(r => !r.ehMatch);
  const hits = alvos.filter(r => r.respondeu).length;
  const falsosAlarmes = naoAlvos.filter(r => r.respondeu).length;

  // Correção de Hautus (1995): +0.5 / N+1 evita taxa 0 ou 1 (z infinito)
  const taxaHits = (hits + 0.5) / (alvos.length + 1);
  const taxaFA = (falsosAlarmes + 0.5) / (naoAlvos.length + 1);
  const dPrime = Math.round((zScore(taxaHits) - zScore(taxaFA)) * 100) / 100;

  let classe, faixa;
  if (dPrime < 1) { classe = 'severe'; faixa = 'Abaixo da média de referência'; }
  else if (dPrime <= 2.5) { classe = 'moderate'; faixa = 'Dentro da média de referência'; }
  else { classe = 'minimal'; faixa = 'Acima da média de referência'; }

  return {
    score: dPrime, faixa, classe,
    hits, falsosAlarmes, totalAlvos: alvos.length, totalNaoAlvos: naoAlvos.length,
  };
}

async function finalizarTarefa() {
  const resultado = calcularResultado();
  const dados = JSON.parse(sessionStorage.getItem('psico_cadastro') || '{}');
  sessionStorage.setItem('psico_nback_resultado', JSON.stringify({ ...dados, ...resultado }));

  if (typeof emBateria === 'function' && emBateria()) {
    await avancarBateria('nback', { score: resultado.score, faixa: resultado.faixa, classe: resultado.classe });
    return;
  }

  try {
    await fetch('/testes/api/resultado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: dados.nome, email: dados.email, telefone: dados.telefone, idade: dados.idade,
        tipo: 'desempenho', identificador: 'nback',
        faixaGeral: resultado.classe,
        resultados: {
          score: resultado.score, faixa: resultado.faixa, classe: resultado.classe,
          metricas: { hits: resultado.hits, falsos_alarmes: resultado.falsosAlarmes, total_alvos: resultado.totalAlvos },
        },
        consentimentoDados: !!dados.consentimentoDadosEm,
        consentimentoInstrumento: !!dados.consentimentoInstrumentoEm,
      }),
    });
  } catch (e) {
    console.error('Erro ao enviar resultado do N-Back:', e);
  }

  window.location.href = '/testes/nback-resultado.html';
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
