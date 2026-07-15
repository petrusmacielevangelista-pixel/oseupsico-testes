/* ============================================================
   Catálogo de baterias — combinações de instrumentos específicos
   (não temas inteiros). Cada item aponta pra uma escala exata
   (rastreio) ou um instrumento exato (desempenho).
   ============================================================ */

'use strict';

const BATERIAS = {
  emocional: {
    id: 'emocional',
    icon: '❤️',
    nome: 'Check-up Emocional',
    descricao: 'Um retrato rápido de como você está emocionalmente.',
    itens: [
      { tipo: 'rastreio', escalaId: 'phq9', nome: 'Depressão' },
      { tipo: 'rastreio', escalaId: 'bai', nome: 'Ansiedade' },
      { tipo: 'rastreio', escalaId: 'pss10', nome: 'Estresse' },
    ],
  },
  cognitivo: {
    id: 'cognitivo',
    icon: '🧠',
    nome: 'Perfil Cognitivo',
    descricao: 'Raciocínio, velocidade mental e atenção em um só lugar.',
    itens: [
      { tipo: 'desempenho', instrumentoId: 'icar', nome: 'Teste de Raciocínio Lógico' },
      { tipo: 'desempenho', instrumentoId: 'tmt', nome: 'Teste de Velocidade Mental' },
      { tipo: 'desempenho', instrumentoId: 'stroop', nome: 'Teste de Atenção Seletiva' },
    ],
  },
  risco: {
    id: 'risco',
    icon: '🎲',
    nome: 'Perfil de Risco e Impulsividade',
    descricao: 'Como você toma decisões e lida com risco.',
    itens: [
      { tipo: 'desempenho', instrumentoId: 'igt', nome: 'Teste de Julgamento' },
      { tipo: 'desempenho', instrumentoId: 'bart', nome: 'Decisão Progressiva' },
      { tipo: 'rastreio', escalaId: 'pgsi', nome: 'Jogo' },
    ],
  },
};

/* Mapa instrumentoId → página de tarefa (desempenho) */
const PAGINA_INSTRUMENTO = {
  igt: 'igt-instrucoes.html',
  bart: 'bart-instrucoes.html',
  icar: 'icar-tarefa.html',
  stroop: 'stroop-tarefa.html',
  tmt: 'tmt-tarefa.html',
};

/* Retorna a URL do próximo item de uma bateria */
function paginaParaItemBateria(item) {
  if (item.tipo === 'rastreio') return `teste.html?escalas=${item.escalaId}`;
  return PAGINA_INSTRUMENTO[item.instrumentoId];
}
