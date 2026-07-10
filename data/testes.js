/* ============================================================
   O SEU PSICO — Testes · Banco de Escalas
   Todas as escalas são de domínio público e validadas no Brasil.
   Não são instrumentos de diagnóstico — apenas rastreio.
   ============================================================ */

const TEMAS = {

  depressao: {
    id: 'depressao',
    nome: 'Depressão',
    icon: '🌧️',
    descricao: 'Rastreio de sintomas depressivos em adultos, adolescentes e crianças.',
    escalas: ['phq9', 'phqa'],
  },

  ansiedade: {
    id: 'ansiedade',
    nome: 'Ansiedade',
    icon: '😰',
    descricao: 'Rastreio de ansiedade em adultos, adolescentes e crianças.',
    escalas: ['bai', 'scared'],
  },

  tdah: {
    id: 'tdah',
    nome: 'TDAH',
    icon: '⚡',
    descricao: 'Rastreio de Transtorno de Déficit de Atenção e Hiperatividade em adultos e crianças.',
    escalas: ['asrs', 'snapiv'],
  },

  tea: {
    id: 'tea',
    nome: 'TEA / Autismo',
    icon: '🧩',
    descricao: 'Rastreio do Transtorno do Espectro Autista com escalas validadas para cada faixa etária.',
    escalas: ['aq10', 'mchatr'],
  },

  trauma: {
    id: 'trauma',
    nome: 'Trauma / TEPT',
    icon: '🛡️',
    descricao: 'Rastreio de sintomas de Transtorno de Estresse Pós-Traumático.',
    escalas: ['pcl5'],
  },

  insonia: {
    id: 'insonia',
    nome: 'Insônia',
    icon: '🌙',
    descricao: 'Avaliação da gravidade e impacto de sintomas de insônia.',
    escalas: ['isi'],
  },

  burnout: {
    id: 'burnout',
    nome: 'Burnout',
    icon: '🔥',
    descricao: 'Rastreio de esgotamento profissional e sintomas de burnout.',
    escalas: ['mbigs'],
  },

  bipolaridade: {
    id: 'bipolaridade',
    nome: 'Bipolaridade',
    icon: '🎭',
    descricao: 'Rastreio de sintomas de Transtorno Bipolar e episódios de humor.',
    escalas: ['mdq'],
  },

  estresse: {
    id: 'estresse',
    nome: 'Estresse',
    icon: '💢',
    descricao: 'Avaliação do nível de estresse percebido nas últimas 4 semanas.',
    escalas: ['pss10'],
  },

  vicios: {
    id: 'vicios',
    nome: 'Vícios & Compulsões',
    icon: '🎰',
    descricao: 'Rastreio de comportamentos compulsivos e vícios comportamentais.',
    escalas: ['pgsi', 'audit', 'iat'],
  },

  qualidade: {
    id: 'qualidade',
    nome: 'Qualidade de Vida',
    icon: '🌱',
    descricao: 'Avaliação ampla da qualidade de vida nos domínios físico, psicológico, social e ambiental.',
    escalas: ['whoqolbref'],
  },
};

/* ============================================================
   ESCALAS
   ============================================================ */

const ESCALAS = {

  /* ── PHQ-9 ── */
  phq9: {
    id: 'phq9',
    nome: 'PHQ-9',
    nomeCompleto: 'Patient Health Questionnaire-9',
    publico: 'Adultos',
    minAge: 18,
    maxAge: 999,
    instrucao: 'Durante as <strong>últimas 2 semanas</strong>, com que frequência você foi incomodado pelos problemas abaixo?',
    opcoes: [
      { label: 'Nenhuma vez', valor: 0 },
      { label: 'Menos de 1 dia por semana', valor: 1 },
      { label: 'Mais da metade dos dias', valor: 2 },
      { label: 'Quase todos os dias', valor: 3 },
    ],
    perguntas: [
      'Pouco interesse ou pouco prazer em fazer as coisas',
      'Se sentir "para baixo", deprimido(a) ou sem perspectiva',
      'Dificuldade para adormecer ou permanecer dormindo, ou dormir mais do que de costume',
      'Se sentir cansado(a) ou com pouca energia',
      'Falta de apetite ou comer demais',
      'Se sentir mal consigo mesmo(a) — ou achar que é um fracasso ou que decepcionou sua família ou você mesmo(a)',
      'Dificuldade para se concentrar nas coisas, como ler jornal ou ver televisão',
      'Lentidão para se movimentar ou falar, a ponto de outras pessoas perceberem? Ou ao contrário — estar tão agitado(a) ou inquieto(a) que você fica andando de um lado para outro mais do que de costume',
      'Pensar em se ferir de alguma maneira ou que seria melhor estar morto(a)',
      'Se os problemas acima existirem, eles dificultaram seu trabalho, cuidados em casa ou seu relacionamento com outras pessoas?',
    ],
    scoreMax: 27,
    faixas: [
      { min: 0,  max: 4,  label: 'Mínima',               classe: 'minimal',  texto: 'Seus sintomas indicam depressão mínima ou ausente. Continue cuidando da sua saúde mental.' },
      { min: 5,  max: 9,  label: 'Leve',                  classe: 'mild',     texto: 'Sintomas leves de depressão foram identificados. Atenção ao seu bem-estar emocional é recomendada.' },
      { min: 10, max: 14, label: 'Moderada',              classe: 'moderate', texto: 'Seus sintomas sugerem depressão moderada. Considere buscar apoio de um profissional de saúde mental.' },
      { min: 15, max: 19, label: 'Moderadamente grave',   classe: 'severe',   texto: 'Sintomas moderadamente graves de depressão identificados. Avaliação profissional é fortemente recomendada.' },
      { min: 20, max: 27, label: 'Grave',                 classe: 'severe',   texto: 'Sintomas graves de depressão foram identificados. Busque ajuda profissional urgentemente.' },
    ],
  },

  /* ── PHQ-A (Adolescentes 12–17) ── */
  phqa: {
    id: 'phqa',
    nome: 'PHQ-A',
    nomeCompleto: 'Patient Health Questionnaire — Versão Adolescente',
    publico: 'Adolescentes (12–17 anos)',
    minAge: 12,
    maxAge: 17,
    instrucao: 'Durante as <strong>últimas 2 semanas</strong>, com que frequência você foi incomodado(a) pelos seguintes problemas?',
    opcoes: [
      { label: 'Nenhuma vez', valor: 0 },
      { label: 'Menos de 1 dia por semana', valor: 1 },
      { label: 'Mais da metade dos dias', valor: 2 },
      { label: 'Quase todos os dias', valor: 3 },
    ],
    perguntas: [
      'Pouco interesse ou pouco prazer em fazer as coisas',
      'Se sentir triste, deprimido(a) ou sem esperança',
      'Dificuldade para adormecer, permanecer dormindo ou dormir demais',
      'Se sentir cansado(a) ou com pouca energia',
      'Falta de apetite ou comer demais',
      'Se sentir mal consigo mesmo(a), ou achar que é um(a) fracasso(a) ou que decepcionou sua família',
      'Dificuldade em se concentrar em coisas como dever de casa, leitura ou televisão',
      'Estar tão agitado(a) ou lento(a) que outras pessoas podem ter percebido',
      'Pensar que seria melhor estar morto(a), ou se machucar de alguma forma',
      'Esses problemas tornaram mais difícil para você realizar seu trabalho, tarefas em casa ou se relacionar com outras pessoas?',
    ],
    scoreMax: 27,
    faixas: [
      { min: 0,  max: 4,  label: 'Mínima',             classe: 'minimal',  texto: 'Nenhum indicativo significativo de sintomas depressivos.' },
      { min: 5,  max: 9,  label: 'Leve',                classe: 'mild',     texto: 'Sintomas leves presentes. Acompanhamento por um adulto de confiança ou profissional é recomendado.' },
      { min: 10, max: 14, label: 'Moderada',            classe: 'moderate', texto: 'Sintomas moderados. Recomenda-se avaliação por psicólogo ou médico.' },
      { min: 15, max: 19, label: 'Moderadamente grave', classe: 'severe',   texto: 'Sintomas moderadamente graves. Avaliação profissional é fortemente recomendada.' },
      { min: 20, max: 27, label: 'Grave',               classe: 'severe',   texto: 'Sintomas graves. Avaliação profissional urgente é fortemente recomendada.' },
    ],
  },

  /* ── BAI (Beck Anxiety Inventory) ── */
  bai: {
    id: 'bai',
    nome: 'BAI',
    nomeCompleto: 'Beck Anxiety Inventory',
    publico: 'Adultos (18+)',
    minAge: 18,
    maxAge: 999,
    instrucao: 'Abaixo está uma lista de sintomas comuns de ansiedade. Por favor, leia cada item com atenção e indique o quanto você foi <strong>incomodado(a) por cada sintoma na última semana</strong>, incluindo hoje.',
    opcoes: [
      { label: 'Absolutamente não', valor: 0 },
      { label: 'Levemente — não me incomodou muito', valor: 1 },
      { label: 'Moderadamente — foi muito desagradável, mas pude suportar', valor: 2 },
      { label: 'Gravemente — mal pude suportar', valor: 3 },
    ],
    perguntas: [
      'Dormência ou formigamento',
      'Sensação de calor',
      'Tremor nas pernas',
      'Incapaz de relaxar',
      'Medo que aconteça o pior',
      'Sensação de desmaio ou tontura',
      'Palpitação ou aceleração do coração',
      'Sem equilíbrio',
      'Aterrorizado(a)',
      'Nervoso(a)',
      'Sensação de sufocamento',
      'Tremores nas mãos',
      'Inseguro(a)',
      'Medo de perder o controle',
      'Dificuldade de respirar',
      'Medo de morrer',
      'Assustado(a)',
      'Indigestão ou desconforto no estômago',
      'Sensação de desmaio',
      'Rosto afogueado',
      'Suor (não relacionado ao calor)',
    ],
    scoreMax: 63,
    faixas: [
      { min: 0,  max: 9,  label: 'Mínima',  classe: 'minimal',  texto: 'Ansiedade mínima ou ausente.' },
      { min: 10, max: 18, label: 'Leve',    classe: 'mild',     texto: 'Ansiedade leve. Técnicas de relaxamento e autocuidado podem ajudar.' },
      { min: 19, max: 29, label: 'Moderada',classe: 'moderate', texto: 'Ansiedade moderada. Recomenda-se avaliação por profissional.' },
      { min: 30, max: 63, label: 'Grave',   classe: 'severe',   texto: 'Ansiedade grave. Busque apoio profissional o quanto antes.' },
    ],
  },

  /* ── SCARED (versão criança/adolescente) ── */
  scared: {
    id: 'scared',
    nome: 'SCARED',
    nomeCompleto: 'Screen for Child Anxiety Related Disorders',
    publico: 'Crianças e Adolescentes (8–18 anos)',
    minAge: 8,
    maxAge: 18,
    instrucao: 'Indique como você se sentiu <strong>nas últimas 3 semanas</strong>. Não há resposta certa ou errada.',
    opcoes: [
      { label: 'Não é verdade ou quase nunca', valor: 0 },
      { label: 'Às vezes é verdade', valor: 1 },
      { label: 'Muitas vezes ou sempre é verdade', valor: 2 },
    ],
    perguntas: [
      'Quando fico com medo, fica difícil respirar',
      'Tenho dores de cabeça quando estou na escola',
      'Não gosto de estar com pessoas que não conheço bem',
      'Fico com medo quando durmo fora de casa',
      'Fico preocupado(a) com as pessoas que gosto',
      'Fico com medo quando sei que tenho que entrar numa situação nova',
      'Fico nervoso(a)',
      'Sigo minha mãe ou meu pai para todos os lugares que eles vão',
      'As pessoas dizem que pareço nervoso(a)',
      'Fico nervoso(a) com pessoas que não conheço',
      'Tenho dores de estômago na escola',
      'Quando fico com medo, sinto que estou enlouquecendo',
      'Fico preocupado(a) quando durmo só',
      'Fico preocupado(a) em ser tão bom(boa) quanto os outros',
      'Quando fico com medo, sinto que as coisas não são reais',
      'Tenho pesadelos de que algo ruim vai acontecer com meus pais',
      'Fico preocupado(a) quando vou à escola',
      'Quando fico com medo, meu coração bate muito forte',
      'Tenho tremores',
      'Tenho pesadelos de que algo ruim vai me acontecer',
      'Fico preocupado(a) que as coisas dêem errado',
      'Quando fico com medo, sudo muito',
      'Fico preocupado(a) sem razão',
      'Tenho medo de ficar sozinho(a) em casa',
      'Tenho medo de ir à escola',
      'Fico com medo de ficar com estômago embrulhado na frente das pessoas',
      'Meu coração dispara',
      'Fico preocupado(a) com meus pais',
      'Fico com medo de ter ataques de pânico',
      'Fico preocupado(a) que algo ruim vá me acontecer',
      'Quando fico com medo, sinto que vou ficar louco(a)',
      'Me preocupo que vá acontecer algo ruim com a minha família',
      'Fico envergonhado(a) perto de pessoas que não conheço',
      'Tenho medo do futuro',
      'Tenho medo de situações em que sinto que posso entrar em pânico',
      'Não gosto de ir a festas ou a lugares onde haverá muita gente',
      'Me preocupo com o quanto sou bom(boa) nas coisas',
      'Fico assustado(a) facilmente',
      'Tenho medo de fazer coisas na frente das pessoas',
      'Fico nervoso(a) com pessoas que não conheço',
      'Me sinto nervoso(a) quando estou longe de casa',
    ],
    scoreMax: 82,
    faixas: [
      { min: 0,  max: 24, label: 'Baixo',   classe: 'minimal',  texto: 'Sem indicativo significativo de transtorno de ansiedade.' },
      { min: 25, max: 39, label: 'Moderado',classe: 'mild',     texto: 'Sintomas moderados. Recomenda-se acompanhamento.' },
      { min: 40, max: 82, label: 'Alto',    classe: 'severe',   texto: 'Sintomas elevados. Avaliação por profissional especializado é recomendada.' },
    ],
  },

  /* ── ASRS-v1.1 ── */
  asrs: {
    id: 'asrs',
    nome: 'ASRS-v1.1',
    nomeCompleto: 'Adult ADHD Self-Report Scale v1.1',
    publico: 'Adultos (18+)',
    minAge: 18,
    maxAge: 999,
    instrucao: 'Com que frequência você experienciou cada um dos seguintes sintomas <strong>nos últimos 6 meses</strong>? As <strong>6 primeiras perguntas</strong> compõem a Parte A e determinam o resultado do rastreio. As demais fornecem informação clínica complementar.',
    opcoes: [
      { label: 'Nunca', valor: 0 },
      { label: 'Raramente', valor: 1 },
      { label: 'Às vezes', valor: 2 },
      { label: 'Frequentemente', valor: 3 },
      { label: 'Muito frequentemente', valor: 4 },
    ],
    perguntas: [
      'Com que frequência você comete erros por descuido, deixa de prestar atenção aos detalhes ou não verifica o seu trabalho?',
      'Com que frequência você tem dificuldade de manter a atenção quando está realizando tarefas maçantes ou repetitivas?',
      'Com que frequência você tem dificuldade de se concentrar no que as pessoas dizem para você, mesmo quando estão falando diretamente com você?',
      'Com que frequência você deixa um projeto pela metade depois de ter dificuldade para completar as partes mais difíceis?',
      'Com que frequência você tem dificuldade de executar tarefas que exigem organização?',
      'Com que frequência você evita ou adia o início de tarefas que requerem muita reflexão?',
      'Com que frequência você perde ou não consegue achar coisas em casa ou no trabalho?',
      'Com que frequência você é facilmente distraído(a) por atividades ou barulhos ao redor?',
      'Com que frequência você tem dificuldade de lembrar de compromissos ou obrigações?',
      'Com que frequência você se agita ou contorce na cadeira quando precisa ficar sentado(a) por um longo período?',
      'Com que frequência você se levanta da cadeira em reuniões ou outras situações onde deveria ficar sentado(a)?',
      'Com que frequência você se sente inquieto(a) ou agitado(a)?',
      'Com que frequência você tem dificuldade de descansar ou relaxar quando tem tempo livre?',
      'Com que frequência você se sente muito ativo(a) e compelido(a) a fazer coisas, como se tivesse ligado numa tomada?',
      'Com que frequência você fala demais em situações sociais?',
      'Com que frequência você se pega completando as frases dos outros antes que eles terminem de falar?',
      'Com que frequência você tem dificuldade de esperar quando há uma fila?',
      'Com que frequência você interrompe outros quando eles estão ocupados?',
    ],
    scoreMax: 6,
    faixas: [
      { min: 0, max: 3, label: 'Improvável', classe: 'minimal', texto: 'Rastreio Parte A não sugestivo de TDAH. Sintomas inconsistentes com o transtorno.' },
      { min: 4, max: 6, label: 'Provável',   classe: 'severe',  texto: 'Rastreio Parte A sugestivo de TDAH. Recomenda-se avaliação especializada por profissional habilitado.' },
    ],
  },

  /* ── SNAP-IV (crianças/adolescentes) ── */
  snapiv: {
    id: 'snapiv',
    nome: 'SNAP-IV',
    nomeCompleto: 'Swanson, Nolan and Pelham Rating Scale IV',
    publico: 'Crianças e Adolescentes (6–17 anos) — respondido pelo responsável',
    minAge: 6,
    maxAge: 17,
    instrucao: 'Como responsável, indique o quanto cada afirmação abaixo <strong>descreve a criança/adolescente</strong>.',
    opcoes: [
      { label: 'Nem um pouco', valor: 0 },
      { label: 'Um pouco', valor: 1 },
      { label: 'Bastante', valor: 2 },
      { label: 'Demais', valor: 3 },
    ],
    perguntas: [
      'Não consegue prestar atenção em detalhes ou comete erros por descuido',
      'Tem dificuldade em manter atenção em tarefas ou atividades lúdicas',
      'Parece não estar ouvindo quando se fala com ela diretamente',
      'Não segue instruções e não termina tarefas escolares ou obrigações',
      'Tem dificuldade em organizar tarefas e atividades',
      'Evita, não gosta ou reluta em se envolver em tarefas que exigem esforço mental',
      'Perde coisas necessárias para tarefas ou atividades',
      'É facilmente distraída por estímulos externos',
      'É esquecida em atividades do dia a dia',
      'Agita as mãos ou os pés ou se remexe na cadeira',
      'Deixa seu lugar na sala de aula ou em outras situações em que deveria permanecer sentada',
      'Corre ou sobe nas coisas em situações em que isso é inapropriado',
      'Tem dificuldade em brincar ou se envolver em atividades de lazer silenciosamente',
      'Age como se estivesse a "todo vapor"',
      'Fala excessivamente',
      'Responde perguntas antes de terem sido formuladas completamente',
      'Tem dificuldade em aguardar sua vez',
      'Interrompe ou se intromete em conversas ou jogos dos outros',
    ],
    scoreMax: 30,
    faixas: [
      { min: 0,  max: 13, label: 'Improvável', classe: 'minimal', texto: 'Sintomas não sugestivos de TDAH nesta avaliação (média combinada abaixo do limiar clínico).' },
      { min: 14, max: 16, label: 'Possível',   classe: 'mild',    texto: 'Alguns sintomas presentes, próximos ao limiar clínico. Avaliação por especialista pode ser útil.' },
      { min: 17, max: 30, label: 'Provável',   classe: 'severe',  texto: 'Média combinada igual ou acima do ponto de corte clínico (Swanson, 1992, versão Responsável ≥1,67). Avaliação especializada é recomendada.' },
    ],
  },

  /* ── AQ-10 ── */
  aq10: {
    id: 'aq10',
    nome: 'AQ-10',
    nomeCompleto: 'Autism Spectrum Quotient — 10 itens',
    publico: 'Adultos (16+)',
    minAge: 16,
    maxAge: 999,
    instrucao: 'Indique o quanto cada afirmação se aplica a você.',
    perguntas: [
      { texto: 'Frequentemente percebo pequenos sons quando os outros não percebem',
        opcoes: [{label:'Concordo totalmente',valor:1},{label:'Concordo um pouco',valor:1},{label:'Discordo um pouco',valor:0},{label:'Discordo totalmente',valor:0}] },
      { texto: 'Em geral, concentro-me mais no quadro geral do que nos pequenos detalhes',
        opcoes: [{label:'Concordo totalmente',valor:0},{label:'Concordo um pouco',valor:0},{label:'Discordo um pouco',valor:1},{label:'Discordo totalmente',valor:1}] },
      { texto: 'Acho fácil fazer mais de uma coisa ao mesmo tempo',
        opcoes: [{label:'Concordo totalmente',valor:0},{label:'Concordo um pouco',valor:0},{label:'Discordo um pouco',valor:1},{label:'Discordo totalmente',valor:1}] },
      { texto: 'Se houver uma interrupção, posso voltar ao que estava fazendo muito rapidamente',
        opcoes: [{label:'Concordo totalmente',valor:0},{label:'Concordo um pouco',valor:0},{label:'Discordo um pouco',valor:1},{label:'Discordo totalmente',valor:1}] },
      { texto: 'Acho fácil "ler nas entrelinhas" quando alguém está falando comigo',
        opcoes: [{label:'Concordo totalmente',valor:0},{label:'Concordo um pouco',valor:0},{label:'Discordo um pouco',valor:1},{label:'Discordo totalmente',valor:1}] },
      { texto: 'Sei como dizer se alguém que está me ouvindo está ficando entediado',
        opcoes: [{label:'Concordo totalmente',valor:0},{label:'Concordo um pouco',valor:0},{label:'Discordo um pouco',valor:1},{label:'Discordo totalmente',valor:1}] },
      { texto: 'Quando estou lendo uma história, tenho dificuldade de perceber as intenções dos personagens',
        opcoes: [{label:'Concordo totalmente',valor:1},{label:'Concordo um pouco',valor:1},{label:'Discordo um pouco',valor:0},{label:'Discordo totalmente',valor:0}] },
      { texto: 'Gosto de colecionar informações sobre categorias de coisas (como tipos de carros, pássaros, trens, plantas)',
        opcoes: [{label:'Concordo totalmente',valor:1},{label:'Concordo um pouco',valor:1},{label:'Discordo um pouco',valor:0},{label:'Discordo totalmente',valor:0}] },
      { texto: 'Acho fácil descobrir o que alguém está pensando ou sentindo apenas olhando para o rosto da pessoa',
        opcoes: [{label:'Concordo totalmente',valor:0},{label:'Concordo um pouco',valor:0},{label:'Discordo um pouco',valor:1},{label:'Discordo totalmente',valor:1}] },
      { texto: 'Acho difícil descobrir as regras de cortesia sociais',
        opcoes: [{label:'Concordo totalmente',valor:1},{label:'Concordo um pouco',valor:1},{label:'Discordo um pouco',valor:0},{label:'Discordo totalmente',valor:0}] },
    ],
    scoreMax: 10,
    faixas: [
      { min: 0, max: 5, label: 'Baixo',    classe: 'minimal', texto: 'Rastreio não sugestivo de TEA.' },
      { min: 6, max: 10, label: 'Elevado', classe: 'severe',  texto: 'Rastreio sugestivo de TEA. Avaliação por especialista é recomendada.' },
    ],
  },

  /* ── M-CHAT-R ── */
  mchatr: {
    id: 'mchatr',
    nome: 'M-CHAT-R',
    nomeCompleto: 'Modified Checklist for Autism in Toddlers — Revisado',
    publico: 'Crianças (16–30 meses) — respondido pelos pais',
    minAge: 0,
    maxAge: 2,
    instrucao: 'Responda às perguntas abaixo sobre o comportamento atual do seu filho(a). Por favor, tente basear suas respostas no comportamento típico, não em situações incomuns.',
    opcoes: [
      { label: 'Sim', valor: 0 },
      { label: 'Não', valor: 1 },
    ],
    perguntas: [
      'Se você apontar para algo que está do outro lado do quarto, seu filho(a) olha para isso?',
      { texto: 'Você já se perguntou se seu filho(a) é surdo(a)?', opcoes: [{label:'Sim',valor:1},{label:'Não',valor:0}] },
      'Seu filho(a) brinca de faz-de-conta ou de fingir (por exemplo, fingir que está bebendo de um copo vazio, ou que está falando ao telefone, ou fingir que está alimentando uma boneca)?',
      'Seu filho(a) gosta de subir em coisas?',
      { texto: 'Seu filho(a) faz movimentos com os dedos de forma incomum perto dos olhos?', opcoes: [{label:'Sim',valor:1},{label:'Não',valor:0}] },
      'Seu filho(a) aponta com um dedo para pedir alguma coisa ou para conseguir ajuda?',
      'Seu filho(a) aponta com um dedo para mostrar algo interessante?',
      'Seu filho(a) tem interesse em outras crianças?',
      'Seu filho(a) mostra coisas para você, trazendo objetos para você ou erguendo-os para que você veja (não para pedir ajuda, mas apenas para compartilhar o interesse)?',
      'Seu filho(a) responde quando você chama pelo nome dele(a)?',
      'Quando você sorri para seu filho(a), ele(a) sorri de volta para você?',
      { texto: 'Seu filho(a) fica perturbado(a) por barulhos comuns do cotidiano?', opcoes: [{label:'Sim',valor:1},{label:'Não',valor:0}] },
      'Seu filho(a) anda?',
      'Seu filho(a) olha nos seus olhos quando você fala com ele(a), brinca com ele(a) ou veste-o(a)?',
      'Seu filho(a) tenta imitar o que você faz?',
      'Se você olhar para alguma coisa, seu filho(a) também olha para verificar o que você está olhando?',
      'Seu filho(a) tenta fazer com que você o(a) olhe?',
      'Seu filho(a) entende quando você lhe pede para fazer algo?',
      'Quando seu filho(a) se sente perturbado(a) ou triste, ele(a) olha para você?',
      'Seu filho(a) gosta de atividades que envolvem movimento, como andar no colo de alguém ou balançar?',
    ],
    scoreMax: 20,
    faixas: [
      { min: 0,  max: 2,  label: 'Baixo risco',   classe: 'minimal',  texto: 'Rastreio não sugestivo de TEA. Repetir em próxima consulta de rotina.' },
      { min: 3,  max: 7,  label: 'Risco moderado', classe: 'moderate', texto: 'Risco moderado. Aplicar a segunda parte do M-CHAT-R/F. Considerar encaminhamento.' },
      { min: 8,  max: 20, label: 'Alto risco',     classe: 'severe',   texto: 'Alto risco de TEA. Encaminhamento urgente para avaliação especializada.' },
    ],
  },

  /* ── PCL-5 ── */
  pcl5: {
    id: 'pcl5',
    nome: 'PCL-5',
    nomeCompleto: 'PTSD Checklist for DSM-5',
    publico: 'Adultos',
    minAge: 18,
    maxAge: 999,
    instrucao: 'Nos <strong>últimos 30 dias</strong>, o quanto você foi incomodado(a) por cada um dos seguintes problemas relacionados a uma experiência estressante?',
    opcoes: [
      { label: 'Nada', valor: 0 },
      { label: 'Um pouco', valor: 1 },
      { label: 'Moderadamente', valor: 2 },
      { label: 'Muito', valor: 3 },
      { label: 'Extremamente', valor: 4 },
    ],
    perguntas: [
      'Memórias repetidas, perturbadoras e indesejadas da experiência estressante',
      'Sonhos perturbadores e repetidos da experiência estressante',
      'De repente sentir ou agir como se a experiência estressante estivesse acontecendo novamente (como se você estivesse de volta ao passado, revivendo-a)',
      'Sentir-se muito perturbado(a) quando algo o(a) lembra da experiência estressante',
      'Ter fortes reações físicas quando algo o(a) lembra da experiência estressante',
      'Evitar memórias, pensamentos ou sentimentos relacionados à experiência estressante',
      'Evitar lembretes externos da experiência estressante (pessoas, lugares, conversas, atividades, objetos ou situações)',
      'Dificuldade em lembrar partes importantes da experiência estressante',
      'Ter fortes crenças negativas sobre si mesmo(a), outras pessoas ou o mundo',
      'Culpar-se ou culpar outros pela experiência estressante ou pelo que aconteceu depois',
      'Ter sentimentos negativos fortes como medo, horror, raiva, culpa ou vergonha',
      'Perda de interesse em atividades das quais costumava gostar',
      'Sentir-se distante ou isolado(a) das outras pessoas',
      'Dificuldade em sentir emoções positivas',
      'Comportamento irritável, explosões de raiva ou agir agressivamente',
      'Tomar riscos ou fazer coisas que poderiam te prejudicar',
      'Estar "superalerta", vigilante ou de guarda',
      'Sentir-se sobressaltado(a) ou assustado(a) facilmente',
      'Dificuldade de concentração',
      'Dificuldade para adormecer ou permanecer dormindo',
    ],
    scoreMax: 80,
    faixas: [
      { min: 0,  max: 32, label: 'Abaixo do limiar', classe: 'minimal',  texto: 'Rastreio não sugestivo de TEPT no momento.' },
      { min: 33, max: 80, label: 'Sugestivo de TEPT', classe: 'severe',  texto: 'Rastreio sugestivo de TEPT. Avaliação clínica é fortemente recomendada.' },
    ],
  },

  /* ── PC-PTSD-5 ── */
  pcptsd5: {
    id: 'pcptsd5',
    nome: 'PC-PTSD-5',
    nomeCompleto: 'Primary Care PTSD Screen for DSM-5',
    publico: 'Adultos — rastreio rápido',
    minAge: 18,
    maxAge: 999,
    instrucao: 'Às vezes, as pessoas têm problemas após experiências estressantes extremas. Nos <strong>últimos mês</strong>, você teve pesadelos, pensamentos recorrentes ou se lembrou de uma experiência estressante do passado? <br><br>Se sim, responda às perguntas abaixo:',
    opcoes: [
      { label: 'Não', valor: 0 },
      { label: 'Sim', valor: 1 },
    ],
    perguntas: [
      'Teve pesadelos sobre isso ou pensou sobre isso quando não queria?',
      'Tentou não pensar sobre isso ou fez um esforço para evitar situações que o(a) lembrava disso?',
      'Estava constantemente alerta, vigilante ou facilmente assustado(a)?',
      'Sentiu-se anestesiado(a) ou distante das outras pessoas, das atividades ou do seu ambiente?',
      'Sentiu-se culpado(a) ou incapaz de parar de se culpar por isso ou pelo que aconteceu depois?',
    ],
    scoreMax: 5,
    faixas: [
      { min: 0, max: 2, label: 'Negativo',  classe: 'minimal', texto: 'Rastreio negativo para TEPT.' },
      { min: 3, max: 5, label: 'Positivo',  classe: 'severe',  texto: 'Rastreio positivo. Avaliação clínica para TEPT é recomendada.' },
    ],
  },

  /* ── ISI (Insomnia Severity Index) ── */
  isi: {
    id: 'isi',
    nome: 'ISI',
    nomeCompleto: 'Insomnia Severity Index',
    publico: 'Adultos (18+)',
    minAge: 18,
    maxAge: 999,
    instrucao: 'Para cada uma das perguntas abaixo, indique o nível de dificuldade que você teve nas <strong>últimas 2 semanas</strong>.',
    perguntas: [
      {
        texto: 'Dificuldade em adormecer',
        opcoes: [
          { label: 'Nenhuma', valor: 0 }, { label: 'Leve', valor: 1 }, { label: 'Moderada', valor: 2 }, { label: 'Grave', valor: 3 }, { label: 'Muito grave', valor: 4 },
        ],
      },
      {
        texto: 'Dificuldade em permanecer dormindo',
        opcoes: [
          { label: 'Nenhuma', valor: 0 }, { label: 'Leve', valor: 1 }, { label: 'Moderada', valor: 2 }, { label: 'Grave', valor: 3 }, { label: 'Muito grave', valor: 4 },
        ],
      },
      {
        texto: 'Problema de acordar muito cedo',
        opcoes: [
          { label: 'Nenhum', valor: 0 }, { label: 'Leve', valor: 1 }, { label: 'Moderado', valor: 2 }, { label: 'Grave', valor: 3 }, { label: 'Muito grave', valor: 4 },
        ],
      },
      {
        texto: 'Quão satisfeito(a) você está com o seu padrão de sono atual?',
        opcoes: [
          { label: 'Muito satisfeito(a)', valor: 0 }, { label: 'Satisfeito(a)', valor: 1 }, { label: 'Neutro(a)', valor: 2 }, { label: 'Insatisfeito(a)', valor: 3 }, { label: 'Muito insatisfeito(a)', valor: 4 },
        ],
      },
      {
        texto: 'O quanto os problemas de sono interferem no seu funcionamento diário (ex.: cansaço, humor, concentração, produtividade)?',
        opcoes: [
          { label: 'Nada', valor: 0 }, { label: 'Um pouco', valor: 1 }, { label: 'Moderadamente', valor: 2 }, { label: 'Muito', valor: 3 }, { label: 'Extremamente', valor: 4 },
        ],
      },
      {
        texto: 'O quanto as dificuldades de sono são percebidas pelas pessoas ao seu redor no seu funcionamento?',
        opcoes: [
          { label: 'De forma alguma', valor: 0 }, { label: 'Um pouco', valor: 1 }, { label: 'Moderadamente', valor: 2 }, { label: 'Muito', valor: 3 }, { label: 'Extremamente', valor: 4 },
        ],
      },
      {
        texto: 'Quão preocupado(a) ou angustiado(a) você está com os seus problemas atuais de sono?',
        opcoes: [
          { label: 'Nada', valor: 0 }, { label: 'Um pouco', valor: 1 }, { label: 'Moderadamente', valor: 2 }, { label: 'Muito', valor: 3 }, { label: 'Extremamente', valor: 4 },
        ],
      },
    ],
    scoreMax: 28,
    faixas: [
      { min: 0,  max: 7,  label: 'Ausência de insônia', classe: 'minimal',  texto: 'Sem indicativo clínico de insônia. Qualidade de sono adequada.' },
      { min: 8,  max: 14, label: 'Insônia leve',         classe: 'mild',     texto: 'Insônia subclínica leve. Atenção à higiene do sono é recomendada.' },
      { min: 15, max: 21, label: 'Insônia moderada',     classe: 'moderate', texto: 'Insônia clínica moderada. Avaliação por profissional é recomendada.' },
      { min: 22, max: 28, label: 'Insônia grave',        classe: 'severe',   texto: 'Insônia clínica grave. Busque avaliação e tratamento especializado.' },
    ],
  },

  /* ── MBI-GS (versão simplificada de domínio público) ── */
  mbigs: {
    id: 'mbigs',
    nome: 'MBI-GS',
    nomeCompleto: 'Maslach Burnout Inventory — General Survey (versão reduzida)',
    publico: 'Adultos em atividade profissional',
    minAge: 18,
    maxAge: 999,
    instrucao: 'Com que frequência você tem os sentimentos descritos abaixo em relação ao seu trabalho?',
    opcoes: [
      { label: 'Nunca', valor: 0 },
      { label: 'Raramente (algumas vezes ao ano)', valor: 1 },
      { label: 'Às vezes (mensalmente)', valor: 2 },
      { label: 'Frequentemente (algumas vezes por mês)', valor: 3 },
      { label: 'Muito frequentemente (semanalmente)', valor: 4 },
      { label: 'Sempre (todos os dias)', valor: 5 },
    ],
    perguntas: [
      'Sinto-me emocionalmente esgotado(a) pelo meu trabalho',
      'Sinto-me esgotado(a) ao final de um dia de trabalho',
      'Sinto-me cansado(a) quando me levanto de manhã e tenho de encarar mais um dia de trabalho',
      'Trabalhar o dia inteiro é realmente um esforço para mim',
      'Posso resolver eficazmente os problemas que surgem no meu trabalho',
      'Sinto que estou a contribuir eficazmente para o que esta organização faz',
      'Na minha opinião, sou bom(boa) no meu trabalho',
      'Sinto-me estimulado(a) quando consigo alcançar alguma coisa no trabalho',
      'Tornei-me menos interessado(a) no meu trabalho desde que comecei nele',
      'Tornei-me menos entusiasmado(a) com o meu trabalho',
      'Na minha opinião, o meu trabalho não é muito significativo para a organização',
      'Tenho dúvidas acerca do valor do meu trabalho',
    ],
    scoreMax: 60,
    faixas: [
      { min: 0,  max: 18, label: 'Baixo',    classe: 'minimal',  texto: 'Baixo nível de burnout. Continue cuidando do equilíbrio entre trabalho e vida pessoal.' },
      { min: 19, max: 35, label: 'Moderado', classe: 'moderate', texto: 'Nível moderado de burnout. Atenção ao autocuidado e aos limites no trabalho.' },
      { min: 36, max: 60, label: 'Alto',     classe: 'severe',   texto: 'Alto nível de burnout. Busque apoio profissional e considere mudanças no ambiente de trabalho.' },
    ],
  },

  /* ── MDQ ── */
  mdq: {
    id: 'mdq',
    nome: 'MDQ',
    nomeCompleto: 'Mood Disorder Questionnaire',
    publico: 'Adultos',
    minAge: 18,
    maxAge: 999,
    instrucao: 'Já aconteceu alguma vez na sua vida um período em que você não estava no seu estado habitual e...',
    opcoes: [
      { label: 'Não', valor: 0 },
      { label: 'Sim', valor: 1 },
    ],
    perguntas: [
      'Você se sentia tão bem ou tão animado(a) que outras pessoas achavam que você não estava em seu estado normal, ou você estava tão animado(a) que chegou a se meter em problemas?',
      'Você estava tão irritado(a) que gritava com as pessoas ou iniciava brigas ou discussões?',
      'Você se sentia muito mais confiante do que o habitual?',
      'Você dormia muito menos do que o habitual e ainda assim se sentia bem descansado(a)?',
      'Você estava muito mais comunicativo(a) ou falava mais rápido do que o habitual?',
      'Seus pensamentos passavam pela sua cabeça muito mais rápido do que o habitual?',
      'Você ficava facilmente distraído(a) por coisas à sua volta e tinha dificuldade de se concentrar ou de manter o foco?',
      'Você tinha muito mais energia do que o habitual?',
      'Você era muito mais ativo(a) ou fazia muito mais coisas do que o habitual?',
      'Você era muito mais sociável ou comunicativo(a) do que o habitual, por exemplo, telefonava para amigos no meio da noite?',
      'Você estava muito mais interessado(a) em sexo do que o habitual?',
      'Você fazia coisas que eram incomuns para você ou que outras pessoas poderiam achar tolas, extravagantes ou arriscadas?',
      'Gastar dinheiro de uma forma que causou problemas para você ou para sua família?',
      { texto: 'Se marcou SIM em mais de uma afirmação acima — vários desses comportamentos ocorreram durante o MESMO período de tempo?',
        opcoes: [{ label: 'Não', valor: 0 }, { label: 'Sim', valor: 1 }] },
      { texto: 'Esses comportamentos causaram algum problema em sua vida (no trabalho, em casa ou nos seus relacionamentos)?',
        opcoes: [{ label: 'Nenhum problema', valor: 0 }, { label: 'Problema leve', valor: 0 }, { label: 'Problema moderado', valor: 1 }, { label: 'Problema grave', valor: 1 }] },
    ],
    scoreMax: 1,
    faixas: [
      { min: 0, max: 0, label: 'Negativo', classe: 'minimal', texto: 'Rastreio não sugestivo de Transtorno Bipolar. Os três critérios do MDQ não foram atendidos simultaneamente.' },
      { min: 1, max: 1, label: 'Positivo', classe: 'severe',  texto: 'Rastreio positivo para Transtorno Bipolar. Avaliação psiquiátrica é fortemente recomendada.' },
    ],
  },

  /* ── PSS-10 ── */
  pss10: {
    id: 'pss10',
    nome: 'PSS-10',
    nomeCompleto: 'Perceived Stress Scale — 10 itens',
    publico: 'Adultos',
    minAge: 18,
    maxAge: 999,
    instrucao: 'As perguntas a seguir referem-se a seus sentimentos e pensamentos durante o <strong>último mês</strong>. Indique com que frequência você se sentiu da forma descrita.',
    opcoes: [
      { label: 'Nunca', valor: 0 },
      { label: 'Quase nunca', valor: 1 },
      { label: 'Às vezes', valor: 2 },
      { label: 'Com certa frequência', valor: 3 },
      { label: 'Com muita frequência', valor: 4 },
    ],
    perguntas: [
      'Com que frequência você ficou chateado(a) por causa de algo que aconteceu inesperadamente?',
      'Com que frequência você se sentiu incapaz de controlar coisas importantes em sua vida?',
      'Com que frequência você se sentiu nervoso(a) e "estressado(a)"?',
      'Com que frequência você se sentiu confiante em relação à sua capacidade de lidar com seus problemas pessoais? (invertida)',
      'Com que frequência você sentiu que as coisas estavam indo do seu jeito? (invertida)',
      'Com que frequência você achou que não conseguiria lidar com todas as coisas que você tinha que fazer?',
      'Com que frequência você foi capaz de controlar as irritações em sua vida? (invertida)',
      'Com que frequência você sentiu que estava por cima das dificuldades? (invertida)',
      'Com que frequência você ficou com raiva por causa de coisas que fugiram ao seu controle?',
      'Com que frequência você sentiu que as dificuldades se acumulavam tanto que você não conseguia superá-las?',
    ],
    scoreMax: 40,
    faixas: [
      { min: 0,  max: 13, label: 'Baixo',    classe: 'minimal',  texto: 'Nível baixo de estresse percebido.' },
      { min: 14, max: 26, label: 'Moderado', classe: 'moderate', texto: 'Nível moderado de estresse. Atenção ao autocuidado é recomendada.' },
      { min: 27, max: 40, label: 'Alto',     classe: 'severe',   texto: 'Nível alto de estresse percebido. Considere buscar apoio profissional.' },
    ],
  },

  /* ── PGSI ── */
  pgsi: {
    id: 'pgsi',
    nome: 'PGSI',
    nomeCompleto: 'Problem Gambling Severity Index',
    publico: 'Adultos',
    minAge: 18,
    maxAge: 999,
    instrucao: 'Pensando nos <strong>últimos 12 meses</strong>, com que frequência você...',
    opcoes: [
      { label: 'Nunca', valor: 0 },
      { label: 'Às vezes', valor: 1 },
      { label: 'Na maioria das vezes', valor: 2 },
      { label: 'Quase sempre', valor: 3 },
    ],
    perguntas: [
      'Apostou mais do que realmente podia se dar ao luxo de perder?',
      'Precisou apostar quantias cada vez maiores para obter a mesma sensação de excitação?',
      'Voltou no outro dia para tentar recuperar o dinheiro que perdeu?',
      'Pediu dinheiro emprestado ou vendeu alguma coisa para obter dinheiro para apostar?',
      'Sentiu que pode ter um problema com o jogo?',
      'Outros criticaram suas apostas ou disseram que você tem um problema com jogo, mesmo que você não concordasse?',
      'Sentiu-se culpado(a) por causa do seu jogo ou pelo que acontece quando você joga?',
      'O jogo causou problemas de saúde, incluindo estresse ou ansiedade?',
      'O jogo causou qualquer problema financeiro para você ou para sua família?',
      'Escondeu seus comportamentos de jogo de familiares, amigos ou outras pessoas?',
    ],
    scoreMax: 27,
    faixas: [
      { min: 0,  max: 0,  label: 'Sem problema',           classe: 'minimal',  texto: 'Sem problemas com jogo identificados.' },
      { min: 1,  max: 2,  label: 'Jogador de baixo risco', classe: 'mild',     texto: 'Risco baixo. Poucas consequências negativas.' },
      { min: 3,  max: 7,  label: 'Jogador moderado',       classe: 'moderate', texto: 'Risco moderado. Algumas consequências negativas presentes.' },
      { min: 8,  max: 27, label: 'Jogador problemático',   classe: 'severe',   texto: 'Jogo problemático identificado. Busque apoio especializado.' },
    ],
  },

  /* ── AUDIT ── */
  audit: {
    id: 'audit',
    nome: 'AUDIT',
    nomeCompleto: 'Alcohol Use Disorders Identification Test',
    publico: 'Adultos',
    minAge: 18,
    maxAge: 999,
    instrucao: 'Responda às perguntas abaixo sobre o consumo de bebidas alcoólicas no <strong>último ano</strong>.',
    perguntas: [
      {
        texto: 'Com que frequência você consome bebidas alcoólicas?',
        opcoes: [
          { label: 'Nunca', valor: 0 }, { label: 'Mensalmente ou menos', valor: 1 }, { label: '2 a 4 vezes por mês', valor: 2 }, { label: '2 a 3 vezes por semana', valor: 3 }, { label: '4 ou mais vezes por semana', valor: 4 },
        ],
      },
      {
        texto: 'Quando você bebe, quantas doses consome em um dia típico?',
        opcoes: [
          { label: '1 ou 2', valor: 0 }, { label: '3 ou 4', valor: 1 }, { label: '5 ou 6', valor: 2 }, { label: '7 a 9', valor: 3 }, { label: '10 ou mais', valor: 4 },
        ],
      },
      {
        texto: 'Com que frequência você consome 6 ou mais doses em uma única ocasião?',
        opcoes: [
          { label: 'Nunca', valor: 0 }, { label: 'Menos de uma vez por mês', valor: 1 }, { label: 'Mensalmente', valor: 2 }, { label: 'Semanalmente', valor: 3 }, { label: 'Todos ou quase todos os dias', valor: 4 },
        ],
      },
      {
        texto: 'Com que frequência, nos últimos 12 meses, você achou que não conseguiria parar de beber uma vez que havia começado?',
        opcoes: [
          { label: 'Nunca', valor: 0 }, { label: 'Menos de uma vez por mês', valor: 1 }, { label: 'Mensalmente', valor: 2 }, { label: 'Semanalmente', valor: 3 }, { label: 'Todos ou quase todos os dias', valor: 4 },
        ],
      },
      {
        texto: 'Com que frequência, nos últimos 12 meses, por causa do álcool você deixou de fazer algo que era esperado de você?',
        opcoes: [
          { label: 'Nunca', valor: 0 }, { label: 'Menos de uma vez por mês', valor: 1 }, { label: 'Mensalmente', valor: 2 }, { label: 'Semanalmente', valor: 3 }, { label: 'Todos ou quase todos os dias', valor: 4 },
        ],
      },
      {
        texto: 'Com que frequência, nos últimos 12 meses, você precisou beber pela manhã para se sentir bem depois de uma pesada bebedeira?',
        opcoes: [
          { label: 'Nunca', valor: 0 }, { label: 'Menos de uma vez por mês', valor: 1 }, { label: 'Mensalmente', valor: 2 }, { label: 'Semanalmente', valor: 3 }, { label: 'Todos ou quase todos os dias', valor: 4 },
        ],
      },
      {
        texto: 'Com que frequência, nos últimos 12 meses, você se sentiu culpado(a) ou com remorso depois de beber?',
        opcoes: [
          { label: 'Nunca', valor: 0 }, { label: 'Menos de uma vez por mês', valor: 1 }, { label: 'Mensalmente', valor: 2 }, { label: 'Semanalmente', valor: 3 }, { label: 'Todos ou quase todos os dias', valor: 4 },
        ],
      },
      {
        texto: 'Com que frequência, nos últimos 12 meses, você não conseguiu lembrar do que havia acontecido na noite anterior por causa de ter bebido?',
        opcoes: [
          { label: 'Nunca', valor: 0 }, { label: 'Menos de uma vez por mês', valor: 1 }, { label: 'Mensalmente', valor: 2 }, { label: 'Semanalmente', valor: 3 }, { label: 'Todos ou quase todos os dias', valor: 4 },
        ],
      },
      {
        texto: 'Você ou alguma outra pessoa já se machucou por causa do seu comportamento quando você estava bebendo?',
        opcoes: [
          { label: 'Não', valor: 0 }, { label: 'Sim, mas não nos últimos 12 meses', valor: 2 }, { label: 'Sim, nos últimos 12 meses', valor: 4 },
        ],
      },
      {
        texto: 'Um parente, amigo, médico ou outro profissional de saúde já se mostrou preocupado com seu comportamento em relação à bebida ou sugeriu que você parasse?',
        opcoes: [
          { label: 'Não', valor: 0 }, { label: 'Sim, mas não nos últimos 12 meses', valor: 2 }, { label: 'Sim, nos últimos 12 meses', valor: 4 },
        ],
      },
    ],
    scoreMax: 40,
    faixas: [
      { min: 0,  max: 7,  label: 'Uso de baixo risco',  classe: 'minimal',  texto: 'Consumo de baixo risco ou abstinência.' },
      { min: 8,  max: 15, label: 'Uso de risco',        classe: 'mild',     texto: 'Consumo arriscado. Orientação sobre redução é recomendada.' },
      { min: 16, max: 19, label: 'Uso nocivo',          classe: 'moderate', texto: 'Uso nocivo de álcool identificado. Avaliação profissional recomendada.' },
      { min: 20, max: 40, label: 'Dependência provável', classe: 'severe',  texto: 'Dependência provável. Busque avaliação e tratamento especializado urgentemente.' },
    ],
  },

  /* ── IAT (Internet Addiction Test) ── */
  iat: {
    id: 'iat',
    nome: 'IAT',
    nomeCompleto: 'Internet Addiction Test (Kimberly Young)',
    publico: 'Adultos e Adolescentes (13+)',
    minAge: 13,
    maxAge: 999,
    instrucao: 'Para cada uma das afirmações abaixo, use a escala de 1 a 5 para indicar com que frequência o comportamento descrito ocorre. Responda considerando apenas o tempo em que você usa a internet (redes sociais, jogos, streaming, etc.).',
    opcoes: [
      { label: 'Raramente', valor: 1 },
      { label: 'Ocasionalmente', valor: 2 },
      { label: 'Frequentemente', valor: 3 },
      { label: 'Com muita frequência', valor: 4 },
      { label: 'Sempre', valor: 5 },
    ],
    perguntas: [
      'Com que frequência você fica online por mais tempo do que pretendia?',
      'Com que frequência você negligencia as tarefas domésticas para ficar mais tempo online?',
      'Com que frequência você prefere a emoção da internet a estar com seu(sua) parceiro(a)?',
      'Com que frequência você forma novos relacionamentos com pessoas que conheceu online?',
      'Com que frequência outras pessoas em sua vida reclamam da quantidade de tempo que você passa online?',
      'Com que frequência seus estudos ou trabalho são prejudicados porque você passou muito tempo online?',
      'Com que frequência você verifica seus e-mails, redes sociais ou mensagens antes de fazer outras coisas que precisa fazer?',
      'Com que frequência seu desempenho no trabalho ou nos estudos é prejudicado pela internet?',
      'Com que frequência você fica na defensiva ou guarda segredo quando alguém pergunta o que você faz online?',
      'Com que frequência você bloqueia pensamentos perturbadores sobre sua vida com pensamentos reconfortantes sobre a internet?',
      'Com que frequência você se vê antecipando a próxima vez que ficará online?',
      'Com que frequência você tem medo de que sua vida sem a internet seja entediante, vazia e sem graça?',
      'Com que frequência você fica irritado(a), grita ou fica ranzinza se alguém o(a) incomoda enquanto está online?',
      'Com que frequência você perde sono por ficar online até tarde da noite?',
      'Com que frequência você se sente preocupado(a) com a internet quando está offline ou pensa em estar online?',
      'Com que frequência você se pega dizendo "só mais alguns minutos" enquanto está online?',
      'Com que frequência você tenta reduzir o tempo que passa online e fracassa?',
      'Com que frequência você tenta esconder quanto tempo passa online?',
      'Com que frequência você opta por passar mais tempo online em vez de sair com outras pessoas?',
      'Com que frequência você se sente deprimido(a), mal-humorado(a) ou nervoso(a) quando está offline e esse sentimento desaparece quando volta a ficar online?',
    ],
    scoreMax: 100,
    faixas: [
      { min: 20, max: 49, label: 'Uso comum',       classe: 'minimal',  texto: 'Uso normal da internet. Sem indicativo de dependência.' },
      { min: 50, max: 79, label: 'Uso problemático', classe: 'moderate', texto: 'A internet está causando problemas em sua vida. Considere estabelecer limites e buscar apoio.' },
      { min: 80, max: 100,label: 'Dependência',      classe: 'severe',   texto: 'Uso da internet indicativo de dependência. Busque avaliação profissional.' },
    ],
  },

  /* ── WHOQOL-BREF (versão curta simplificada) ── */
  whoqolbref: {
    id: 'whoqolbref',
    nome: 'WHOQOL-BREF',
    nomeCompleto: 'World Health Organization Quality of Life — Bref',
    publico: 'Adultos',
    minAge: 18,
    maxAge: 999,
    instrucao: 'As perguntas a seguir referem-se a como você se sentiu sobre aspectos de sua vida nas <strong>últimas 2 semanas</strong>.',
    opcoes: [
      { label: 'Muito ruim / Muito insatisfeito(a) / Nunca', valor: 1 },
      { label: 'Ruim / Insatisfeito(a) / Raramente', valor: 2 },
      { label: 'Nem bom(a) nem ruim / Nem satisfeito(a) nem insatisfeito(a) / Às vezes', valor: 3 },
      { label: 'Bom(a) / Satisfeito(a) / Frequentemente', valor: 4 },
      { label: 'Muito bom(a) / Muito satisfeito(a) / Sempre', valor: 5 },
    ],
    perguntas: [
      'Como você avaliaria sua qualidade de vida?',
      'Quão satisfeito(a) você está com a sua saúde?',
      'Em que medida você acha que sua dor (física) impede você de fazer o que você precisa?',
      'O quanto você precisa de algum tratamento médico para levar sua vida diária?',
      'O quanto você aproveita a vida?',
      'Em que medida você acha que a sua vida tem sentido?',
      'O quanto você consegue se concentrar?',
      'Quão seguro(a) você se sente em sua vida diária?',
      'Quão saudável é o seu ambiente físico (clima, barulho, poluição, atrativos)?',
      'Você tem energia suficiente para o seu dia a dia?',
      'Você é capaz de aceitar sua aparência física?',
      'Você tem dinheiro suficiente para satisfazer suas necessidades?',
      'Quão disponíveis para você estão as informações que precisa no seu dia a dia?',
      'Em que medida você tem oportunidades de atividade de lazer?',
      'Quão bem você é capaz de se locomover?',
      'Quão satisfeito(a) você está com o seu sono?',
      'Quão satisfeito(a) você está com sua capacidade de desempenhar as atividades do seu dia a dia?',
      'Quão satisfeito(a) você está com sua capacidade para o trabalho?',
      'Quão satisfeito(a) você está consigo mesmo(a)?',
      'Quão satisfeito(a) você está com suas relações pessoais?',
      'Quão satisfeito(a) você está com sua vida sexual?',
      'Quão satisfeito(a) você está com o apoio que você recebe de seus amigos?',
      'Quão satisfeito(a) você está com as condições do local onde mora?',
      'Quão satisfeito(a) você está com o seu acesso aos serviços de saúde?',
      'Quão satisfeito(a) você está com o seu meio de transporte?',
      'Com que frequência você tem sentimentos negativos tais como mau humor, desespero, ansiedade, depressão?',
    ],
    scoreMax: 130,
    faixas: [
      { min: 26,  max: 64,  label: 'Baixa',      classe: 'severe',   texto: 'Qualidade de vida percebida como baixa. Avaliação em múltiplas áreas é recomendada.' },
      { min: 65,  max: 90,  label: 'Moderada',   classe: 'moderate', texto: 'Qualidade de vida moderada. Há espaço para melhoria em alguns domínios.' },
      { min: 91,  max: 110, label: 'Boa',        classe: 'mild',     texto: 'Boa qualidade de vida percebida.' },
      { min: 111, max: 130, label: 'Muito boa',  classe: 'minimal',  texto: 'Ótima qualidade de vida percebida.' },
    ],
  },

};

/* Exporta para uso global */
if (typeof module !== 'undefined') {
  module.exports = { TEMAS, ESCALAS };
} else {
  window.TEMAS = TEMAS;
  window.ESCALAS = ESCALAS;
}
