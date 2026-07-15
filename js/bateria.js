/* ============================================================
   Orquestrador de baterias — controla a sequência de instrumentos
   quando a pessoa está fazendo uma bateria (não um teste avulso).

   Cada instrumento (rastreio ou desempenho) chama `avancarBateria`
   em vez de submeter individualmente quando `emBateria()` é true.
   A bateria é apenas um agrupador: cada resultado é registrado
   separadamente dentro de `resultados`, sem tentar uma "faixa geral"
   combinada — item de decisão explícito do produto.
   ============================================================ */

'use strict';

const BATERIA_KEY = 'psico_bateria';

function emBateria() {
  return !!sessionStorage.getItem(BATERIA_KEY);
}

function bateriaAtual() {
  const raw = sessionStorage.getItem(BATERIA_KEY);
  return raw ? JSON.parse(raw) : null;
}

function iniciarBateria(bateriaId) {
  sessionStorage.setItem(BATERIA_KEY, JSON.stringify({
    bateriaId, indiceAtual: 0, resultados: {},
  }));
}

async function avancarBateria(itemId, resultado) {
  const bat = bateriaAtual();
  if (!bat) return;

  bat.resultados[itemId] = resultado;
  bat.indiceAtual++;
  sessionStorage.setItem(BATERIA_KEY, JSON.stringify(bat));

  const bateria = BATERIAS[bat.bateriaId];
  if (bat.indiceAtual < bateria.itens.length) {
    const proximoItem = bateria.itens[bat.indiceAtual];
    window.location.href = paginaParaItemBateria(proximoItem);
  } else {
    await finalizarBateria(bat, bateria);
  }
}

async function finalizarBateria(bat, bateria) {
  const dados = JSON.parse(sessionStorage.getItem('psico_cadastro') || '{}');

  sessionStorage.setItem('psico_bateria_resultado', JSON.stringify({
    nome: dados.nome, bateriaId: bat.bateriaId, resultados: bat.resultados,
  }));

  try {
    await fetch('/testes/api/resultado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: dados.nome, email: dados.email, telefone: dados.telefone, idade: dados.idade,
        tipo: 'bateria', identificador: bat.bateriaId,
        resultados: bat.resultados,
        faixaGeral: null, // bateria é só agrupador — sem faixa geral combinada
        consentimentoDados: !!dados.consentimentoDadosEm,
        consentimentoInstrumento: !!dados.consentimentoInstrumentoEm,
      }),
    });
  } catch (e) {
    console.error('Erro ao enviar resultado da bateria:', e);
  }

  sessionStorage.removeItem(BATERIA_KEY);
  window.location.href = '/testes/bateria-resultado.html';
}
