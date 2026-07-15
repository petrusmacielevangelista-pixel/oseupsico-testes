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
  sonoenergia: {
    id: 'sonoenergia',
    icon: '😴',
    nome: 'Sono, Energia e Foco',
    descricao: 'Como seu sono e disposição afetam sua atenção no dia a dia.',
    itens: [
      { tipo: 'rastreio', escalaId: 'isi', nome: 'Insônia' },
      { tipo: 'desempenho', instrumentoId: 'pvt', nome: 'Teste de Atenção Sustentada' },
      { tipo: 'rastreio', escalaId: 'mbigs', nome: 'Esgotamento (Burnout)' },
    ],
  },
  autoestimasatisfacao: {
    id: 'autoestimasatisfacao',
    icon: '🌱',
    nome: 'Autoestima e Satisfação com a Vida',
    descricao: 'Como você se vê e avalia sua qualidade de vida hoje.',
    itens: [
      { tipo: 'rastreio', escalaId: 'rosenberg', nome: 'Autoestima' },
      { tipo: 'rastreio', escalaId: 'swls', nome: 'Satisfação com a vida' },
      { tipo: 'rastreio', escalaId: 'whoqolbref', nome: 'Qualidade de vida' },
    ],
  },
  atencaoexecutiva: {
    id: 'atencaoexecutiva',
    icon: '🎯',
    nome: 'Atenção e Funções Executivas',
    descricao: 'Sua atenção, controle de impulsos e agilidade mental.',
    itens: [
      { tipo: 'rastreio', escalaId: 'asrs', nome: 'Desatenção e impulsividade' },
      { tipo: 'desempenho', instrumentoId: 'tmt', nome: 'Teste de Velocidade Mental' },
      { tipo: 'desempenho', instrumentoId: 'flanker', nome: 'Teste de Concentração' },
    ],
  },
  memoriasonoestresse: {
    id: 'memoriasonoestresse',
    icon: '🧩',
    nome: 'Memória, Sono e Estresse',
    descricao: 'Um panorama mais completo: memória, sono e nível de estresse.',
    itens: [
      { tipo: 'desempenho', instrumentoId: 'corsi', nome: 'Teste de Memória Espacial' },
      { tipo: 'desempenho', instrumentoId: 'nback', nome: 'Teste de Memória de Trabalho' },
      { tipo: 'rastreio', escalaId: 'isi', nome: 'Insônia' },
      { tipo: 'rastreio', escalaId: 'pss10', nome: 'Estresse' },
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
  corsi: 'corsi-tarefa.html',
  nback: 'nback-tarefa.html',
  flanker: 'flanker-tarefa.html',
  pvt: 'pvt-tarefa.html',
};

/* Retorna a URL do próximo item de uma bateria */
function paginaParaItemBateria(item) {
  if (item.tipo === 'rastreio') return `teste.html?escalas=${item.escalaId}`;
  return PAGINA_INSTRUMENTO[item.instrumentoId];
}
