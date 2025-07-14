// src/data/mockData.js

export const users = {
  'ana@decifra.com': { name: 'Ana', role: 'Estudante', id: 1 },
  'carlos@decifra.com': { name: 'Carlos', role: 'Professor', id: 2 },
};

export const pillars = [
  { id: 'decomposicao', name: 'Decomposição' },
  { id: 'padroes', name: 'Reconhecimento de Padrões' },
  { id: 'abstracao', name: 'Abstração' },
  { id: 'algoritmos', name: 'Algoritmos' },
];

export const levels = {
  0: 'Não Iniciado', 1: 'Iniciante', 2: 'Em Desenvolvimento', 3: 'Proficiente', 4: 'Avançado', 5: 'Mestre'
};

export const activities = [
  // --- NÍVEL 1: INICIANTE (Foco: Identificar Partes de um Todo) ---
  { 
    id: 'dec_01_a', 
    pillar: 'decomposicao', 
    level: 1, 
    title: 'Organizando a Rotina Matinal', 
    description: 'Toda tarefa grande é formada por pequenos passos. Vamos identificar os passos da sua manhã.',
    question: 'Liste pelo menos 4 ações ou etapas principais que você faz desde quando acorda até sair de casa.',
    ajuda: {
      dica_contextual: "Comece pela primeira coisa que você faz ao acordar. O que vem depois? Pense na sequência lógica.",
      pergunta_socaratica: "Se você se vestir antes de tomar banho, o que acontece? A ordem das tarefas faz diferença no resultado final?",
      exemplo_pratico: "Exemplo de uma tarefa: 1. Despertar. 2. Tomar banho..."
    },
    analiseResposta: {
      minRequiredConcepts: 4,
      conceptGroups: [
        { name: 'Despertar', keywords: ['acordar', 'despertar', 'levantar', 'levanto', 'acordo', 'saio da cama'] },
        { name: 'Higiene', keywords: ['banho', 'banhar', 'tomar banho', 'dente', 'dentes', 'escovar', 'rosto', 'lavar', 'higiene', 'pentear', 'cabelo'] },
        { name: 'Vestuário', keywords: ['vestir', 'roupa', 'uniforme', 'farda', 'calçar', 'sapato', 'tênis', 'me visto'] },
        { name: 'Alimentação', keywords: ['café', 'comer', 'lanche', 'pão', 'leite', 'fruta', 'rango', 'tomo café', 'tapioca', 'cuscuz'] },
        { name: 'Preparação', keywords: ['mochila', 'arrumar', 'material', 'livro', 'caderno', 'organizar', 'pegar'] },
      ],
      socratic_hints: {
        'Despertar': "Qual é a primeira ação que inicia todo o seu dia?",
        'Higiene': "Depois de levantar, qual o próximo grande grupo de tarefas que fazemos para cuidar do nosso corpo?",
        'Vestuário': "Após o banho e a higiene, o que precisamos fazer para estarmos prontos para sair?",
        'Alimentação': "Para ter energia para estudar, qual refeição importante não pode faltar na sua manhã?",
        'Preparação': "Antes de sair pela porta, o que você precisa conferir ou pegar para levar para a escola?",
      },
      feedbacks: {
        completo: "Excelente! Sua resposta mostra que você entende como quebrar uma rotina complexa em passos lógicos e bem organizados. Isso é decomposição na prática!",
        baixo: "Vamos tentar novamente! Pense na sua manhã como uma receita. Qual seria o Passo 1? E o Passo 2?"
      }
    }
  },
  {
    id: 'dec_01_b',
    pillar: 'decomposicao',
    level: 1,
    title: 'Laboratório do Sabor: Decompondo um Lanche',
    description: 'Um lanche delicioso é a soma de suas partes. Vamos identificar quais são os componentes essenciais.',
    question: 'Para fazer um misto quente perfeito na chapa, quais são os 4 ingredientes ou componentes principais que você precisa separar?',
    ajuda: {
        dica_contextual: "Pense na base, no recheio e no que dá o toque final para ele ficar douradinho.",
        pergunta_socaratica: "Se você esquecer o queijo, ainda seria um misto quente? Qual a função de cada ingrediente?",
        exemplo_pratico: "Um componente essencial é o PÃO. O que mais vai dentro e fora dele?"
    },
    analiseResposta: {
        minRequiredConcepts: 4,
        conceptGroups: [
            { name: 'Pão', keywords: ['pão', 'pao', 'pães', 'pao de forma'] },
            { name: 'Queijo', keywords: ['queijo', 'mussarela', 'muçarela', 'prato', 'cheddar'] },
            { name: 'Presunto', keywords: ['presunto', 'fiambre', 'peito de peru', 'mortadela'] },
            { name: 'Gordura', keywords: ['manteiga', 'margarina', 'maionese', 'requeijão', 'requeijao'] },
            { name: 'Finalização', keywords: ['chapa', 'sanduicheira', 'frigideira', 'forno', 'assar', 'prensar'] },
        ],
        socratic_hints: {
            'Pão': "Qual é a base, a estrutura principal do nosso sanduíche?",
            'Queijo': "O que derrete e deixa o lanche bem puxa-puxa?",
            'Presunto': "Qual é o outro ingrediente principal do recheio, que geralmente acompanha o queijo?",
            'Gordura': "Para dourar o pão por fora e não grudar na chapa, o que passamos nele?",
            'Finalização': "Depois de montado, qual é o último passo para o misto quente ficar pronto?"
        },
        feedbacks: {
            completo: "Isso mesmo! Você decompôs o lanche em seus ingredientes fundamentais. Ótimo trabalho!",
            baixo: "Vamos começar pelo básico. Qual o ingrediente principal que 'segura' todo o recheio de um sanduíche?"
        }
    }
  },
  {
    id: 'dec_01_c',
    pillar: 'decomposicao',
    level: 1,
    title: 'Kit de Primeiros Socorros',
    description: 'Um pequeno corte aconteceu. Um kit de primeiros socorros bem montado resolve a situação rapidamente.',
    question: 'Você precisa montar um kit de primeiros socorros para pequenos ferimentos. Liste 3 itens essenciais que não podem faltar nele.',
    ajuda: {
        dica_contextual: "Pense no processo: primeiro limpar, depois proteger. O que você usa para cada etapa?",
        pergunta_socaratica: "Se você só colocar o curativo sem limpar o machucado antes, o que pode acontecer?",
        exemplo_pratico: "Um item seria algo para limpar o ferimento, como um antisséptico."
    },
    analiseResposta: {
        minRequiredConcepts: 3,
        conceptGroups: [
            { name: 'Limpeza/Antisséptico', keywords: ['antisséptico', 'antisseptico', 'alcool', 'álcool', 'merthiolate', 'agua oxigenada', 'soro', 'limpar', 'sabão', 'sabonete'] },
            { name: 'Curativo/Proteção', keywords: ['curativo', 'band-aid', 'bandaid', 'esparadrapo', 'gaze', 'algodão', 'algodao'] },
            { name: 'Medicação/Pomada', keywords: ['pomada', 'remedio', 'remédio', 'nebacetin', 'analgésico', 'analgesico'] },
        ],
        socratic_hints: {
            'Limpeza/Antisséptico': "Para evitar infecções, qual é o primeiro cuidado que temos com um machucado?",
            'Curativo/Proteção': "Depois de limpo, o que usamos para cobrir o ferimento e protegê-lo de sujeira?",
            'Medicação/Pomada': "Existe algum creme ou remédio que podemos passar para ajudar na cicatrização?"
        },
        feedbacks: {
            completo: "Perfeito! Com esses itens, seu kit de primeiros socorros está pronto para lidar com pequenos acidentes. Você soube decompor o cuidado em etapas!",
            baixo: "Pense no passo a passo do cuidado. O que você usa para limpar um arranhão? E para cobrir depois?"
        }
    }
  },

  // --- NÍVEL 2: EM DESENVOLVIMENTO (Foco: Organizar em Sequência) ---
  {
    id: 'dec_02_a',
    pillar: 'decomposicao',
    level: 2,
    title: 'Show do Conhecimento: Partes de uma Apresentação',
    description: 'Uma boa apresentação de trabalho tem começo, meio e fim. Vamos identificar essas seções.',
    question: 'Decomponha uma apresentação escolar em suas 3 seções principais, na ordem correta em que elas devem aparecer.',
    ajuda: {
      dica_contextual: "Pense em como uma história é contada. Primeiro você apresenta os personagens e o cenário...",
      pergunta_socaratica: "Se você começar falando das conclusões antes de explicar o problema, seus colegas vão entender?",
      exemplo_pratico: "A primeira parte é a 'Introdução', onde você apresenta o tema. Quais são as outras duas?"
    },
    analiseResposta: {
      minRequiredConcepts: 3,
      validation: { type: 'sequence', orderedConcepts: ['Introdução', 'Desenvolvimento', 'Conclusão'] },
      conceptGroups: [
        { name: 'Introdução', keywords: ['introdução', 'introducao', 'contextualização', 'abertura', 'apresentação', 'apresentacao', 'começo', 'inicio'] },
        { name: 'Desenvolvimento', keywords: ['desenvolvimento', 'conteudo', 'conteúdo', 'meio', 'explicação', 'explicacao', 'corpo','análise', 'informação'] },
        { name: 'Conclusão', keywords: ['conclusão', 'conclusao', 'fechamento', 'final', 'fim', 'resumo', 'considerações'] },
      ],
      socratic_hints: {
        'Introdução': "No início da apresentação, qual é o nome da seção onde você apresenta o tema?",
        'Desenvolvimento': "Qual é a parte principal onde você explica todo o conteúdo detalhadamente?",
        'Conclusão': "Para terminar bem, qual é a seção onde você resume os pontos principais?"
      },
      feedbacks: {
        completo: "Excelente! Você identificou a estrutura básica de uma apresentação na ordem correta. Essa organização é fundamental para a comunicação!",
        baixo: "Pense nas três grandes seções: uma para começar, outra para desenvolver o conteúdo, e uma para finalizar."
      }
    }
  },
  { 
    id: 'dec_02_b', 
    pillar: 'decomposicao', 
    level: 2, 
    title: 'Viralizando: As Etapas de um Vídeo de Sucesso',
    description: 'Criar um vídeo para o TikTok ou Reels não é só apertar o REC. Vamos decompor o processo.',
    question: 'Decomponha o processo de criar um vídeo de sucesso em 4 etapas principais, da ideia inicial até a publicação.',
    ajuda: {
      dica_contextual: "Pense na sequência: planejar, gravar, editar e postar.",
      pergunta_socaratica: "Se você postar o vídeo sem editar, ele terá o mesmo impacto? E se gravar sem ter uma ideia do que falar?",
      exemplo_pratico: "A última etapa é 'Postar'. Quais são as três etapas que vêm ANTES disso?"
    },
    analiseResposta: {
      minRequiredConcepts: 4,
      validation: { type: 'sequence', orderedConcepts: ['Planejamento', 'Gravação', 'Edição', 'Publicação'] },
      conceptGroups: [
        { name: 'Planejamento', keywords: ['planejar', 'roteiro', 'ideia', 'escrever', 'pensar', 'tema'] },
        { name: 'Gravação', keywords: ['gravar', 'filmar', 'câmera', 'camera', 'celular', 'capturar'] },
        { name: 'Edição', keywords: ['editar', 'cortar', 'musica', 'efeito', 'legenda', 'capcut', 'inshot'] },
        { name: 'Publicação', keywords: ['postar', 'publicar', 'compartilhar', 'subir', 'reels', 'tiktok', 'youtube'] }
      ],
      socratic_hints: {
        'Planejamento': "Antes de ligar a câmera, qual é a primeira coisa que um criador de conteúdo faz?",
        'Gravação': "Com a ideia pronta, qual é a próxima ação para transformar a ideia em imagens?",
        'Edição': "Depois de gravar, como você pode deixar seu vídeo mais dinâmico e interessante?",
        'Publicação': "Com o vídeo pronto e editado, qual é o último passo para que seus amigos possam assisti-lo?"
      },
      feedbacks: {
        completo: "Isso aí! Você decompor o processo de criação de conteúdo como um profissional. A ordem e as etapas estão perfeitas!",
        baixo: "Vamos pensar no fluxo. Antes de postar, você precisa ter um vídeo pronto, certo? E para ter um vídeo pronto, o que você precisa fazer antes?"
      }
    }
  },

  // --- NÍVEL 3: PROFICIENTE (Foco: Analisar e Planejar com Restrições) ---
  { 
    id: 'dec_03_a',
    pillar: 'decomposicao',
    level: 3,
    title: 'Planejando o Orçamento do Evento da Turma',
    description: 'Sua turma arrecadou R$ 150 para uma festa. Para o dinheiro render, você precisa dividi-lo em categorias de gastos.',
    question: 'Divida os R$ 150 em pelo menos 3 categorias principais de gastos para a festa. Para cada uma, escreva o nome e o valor, garantindo que a soma não ultrapasse o total.',
    ajuda: {
        dica_contextual: "Agrupe seus gastos. 'Comida' pode ser uma categoria. O que mais um evento precisa?",
        pergunta_socaratica: "Se você comprar tudo sem planejar, como pode garantir que o dinheiro será suficiente para as coisas mais importantes?",
        exemplo_pratico: "Exemplo de categoria: BEBIDAS (refrigerante, suco) - R$ 40."
    },
    analiseResposta: {
        minRequiredConcepts: 3,
        validation: { type: 'sum', target: 150 },
        conceptGroups: [
            { name: 'Alimentação', keywords: ['comida', 'lanche', 'salgado', 'bolo', 'doce', 'rango', 'petisco'] },
            { name: 'Bebidas', keywords: ['bebida', 'refrigerante', 'refri', 'suco', 'agua'] },
            { name: 'Decoração/Utensílios', keywords: ['decoração', 'enfeite', 'balão', 'prato', 'copo', 'guardanapo'] },
            { name: 'Entretenimento', keywords: ['música', 'som', 'jogo', 'diversão'] },
        ],
        socratic_hints: {
          'Alimentação': "O que os convidados irão comer na festa?",
          'Bebidas': "E para beber, o que seria servido?",
          'Decoração/Utensílios': "Para que o ambiente fique bonito e as pessoas possam comer, que tipo de itens precisamos comprar?",
          'Entretenimento': "Além de comer e beber, o que as pessoas farão para se divertir na festa?"
        },
        feedbacks: {
            completo: "Ótimo planejamento financeiro! Você decompôs os custos em categorias claras e respeitou o orçamento.",
            baixo: "A ideia é agrupar os possíveis gastos em categorias maiores. Por exemplo, 'Comidas' seria uma ótima categoria para começar."
        }
    }
  },
  {
    id: 'dec_03_b',
    pillar: 'decomposicao',
    level: 3,
    title: 'Missão Fim de Semana: Plano de Estudos',
    description: 'Você tem 6 horas livres no sábado para estudar para as provas. Para ser eficiente, precisa dividir esse tempo entre as matérias.',
    question: 'Decomponha suas 6 horas de estudo, distribuindo o tempo entre pelo menos 3 matérias diferentes.',
    ajuda: {
        dica_contextual: "Pense em quais matérias você tem mais dificuldade. Talvez elas precisem de mais tempo.",
        pergunta_socaratica: "Se você dedicar 5 horas só para uma matéria, terá tempo suficiente para revisar as outras?",
        exemplo_pratico: "Exemplo: Matemática - 3 horas. História - 2 horas. Inglês - 1 hora."
    },
    analiseResposta: {
        minRequiredConcepts: 3,
        validation: { type: 'sum', target: 6 },
        conceptGroups: [
          { name: 'Matemática', keywords: ['matemática', 'matematica', 'mat'] },
          { name: 'Português', keywords: ['português', 'portugues', 'port', 'redação', 'redacao'] },
          { name: 'Ciências', keywords: ['ciências', 'ciencias', 'biologia', 'física', 'fisica', 'química', 'quimica'] },
          { name: 'História/Geografia', keywords: ['história', 'historia', 'geografia', 'geo', 'humanas'] },
          { name: 'Inglês/Línguas', keywords: ['inglês', 'ingles', 'english', 'idioma', 'espanhol'] },
        ],
        socratic_hints: {
          'Matemática': "Para a matéria que envolve mais cálculos, quanto tempo você acha necessário?",
          'Português': "E para ler textos e praticar a escrita, quanto tempo você reservaria?",
          'Ciências': "As matérias de ciências costumam ter bastante conteúdo. Quanto tempo para elas?",
        },
        feedbacks: {
            completo: "Excelente! Você distribuiu seu tempo de estudo de forma equilibrada. Isso mostra um ótimo planejamento!",
            baixo: "Vamos organizar melhor: pense em pelo menos 3 matérias e quanto tempo cada uma precisa. Lembre-se que o total deve ser 6 horas."
        }
    }
  },

  // --- NÍVEL 4: AVANÇADO (Foco: Criar e Estruturar Processos para Outros) ---
  { 
    id: 'dec_04_a', 
    pillar: 'decomposicao', 
    level: 4, 
    title: 'Tutorial: Como Criar um Perfil Profissional Online',
    description: 'Muitos jovens buscam o primeiro emprego. Um perfil profissional online pode ajudar. Sua tarefa é ensinar um colega a criar um.',
    question: 'Crie um guia passo a passo (no mínimo 4 passos) para um colega sobre como criar um perfil atraente em uma rede profissional como o LinkedIn.',
    ajuda: {
        dica_contextual: "Pense no processo: o que vem primeiro? Criar a conta, adicionar uma foto, escrever sobre si mesmo...",
        pergunta_socaratica: "Se você adicionar suas experiências antes de criar a conta, onde essa informação ficaria salva?",
        exemplo_pratico: "Um passo seria: '3. Escreva um resumo sobre seus objetivos e habilidades na seção 'Sobre''."
    },
    analiseResposta: {
        minRequiredConcepts: 4,
        validation: { 
          type: 'sequence',
          orderedConcepts: ['Criar Conta', 'Adicionar Informações Básicas', 'Detalhar Experiências', 'Conectar-se']
        },
        conceptGroups: [
          { name: 'Criar Conta', keywords: ['criar', 'cadastrar', 'registrar', 'conta', 'perfil', 'login'] },
          { name: 'Adicionar Informações Básicas', keywords: ['foto', 'imagem', 'titulo', 'título', 'resumo', 'sobre'] },
          { name: 'Detalhar Experiências', keywords: ['experiência', 'experiencia', 'habilidade', 'curso', 'formação', 'educação'] },
          { name: 'Conectar-se', keywords: ['conectar', 'adicionar', 'rede', 'contato', 'seguir'] },
        ],
        socratic_hints: {
          'Criar Conta': "Qual é o primeiro passo absoluto para ter um perfil em qualquer rede social?",
          'Adicionar Informações Básicas': "Depois de criar a conta, quais são as primeiras coisas que as pessoas veem no seu perfil e que você deve preencher?",
          'Detalhar Experiências': "Para mostrar o que você sabe fazer, qual seção do perfil você preencheria com detalhes sobre seus estudos e habilidades?",
          'Conectar-se': "Com o perfil pronto, qual é a ação que faz sua rede profissional crescer?"
        },
        feedbacks: {
            completo: "Excelente guia! Com esses passos, qualquer pessoa consegue criar um perfil profissional forte. Você estruturou muito bem o processo.",
            baixo: "Vamos começar do início. Para ter um perfil, o que é preciso fazer antes de tudo? Depois, quais informações você adicionaria nele?"
        }
    }
  },
   {
    id: 'dec_04_b',
    pillar: 'decomposicao',
    level: 4,
    title: 'Comissão de Frente: Organizando a Gincana',
    description: 'Sua turma vai organizar a gincana anual. Para que tudo funcione, o trabalho precisa ser dividido em equipes com responsabilidades claras.',
    question: 'Decomponha a organização da gincana em 4 "comissões" ou equipes de trabalho diferentes. Dê um nome para cada equipe e descreva sua principal responsabilidade.',
    ajuda: {
        dica_contextual: "Pense nas grandes áreas de um evento: quem cuida da divulgação? E da comida? E das provas?",
        pergunta_socaratica: "Se a 'Equipe de Provas' e a 'Equipe de Divulgação' não conversarem, o que pode dar errado?",
        exemplo_pratico: "Exemplo de equipe: 'Comissão de Logística', responsável por conseguir mesas, cadeiras e equipamentos de som."
    },
    analiseResposta: {
        minRequiredConcepts: 4,
        conceptGroups: [
          { name: 'Divulgação', keywords: ['divulgação', 'divulgar', 'marketing', 'comunicação', 'cartaz', 'redes sociais'] },
          { name: 'Inscrições/Organização', keywords: ['inscrição', 'inscricao', 'regras', 'times', 'equipes', 'organizar'] },
          { name: 'Provas/Atividades', keywords: ['prova', 'atividade', 'desafio', 'brincadeira', 'juiz', 'árbitro'] },
          { name: 'Infraestrutura/Logística', keywords: ['logística', 'logistica', 'material', 'espaço', 'som', 'limpeza', 'comida'] }
        ],
        socratic_hints: {
          'Divulgação': "Como as outras turmas ficarão sabendo da gincana?",
          'Inscrições/Organização': "Quem será responsável por montar as equipes e garantir que todos saibam as regras?",
          'Provas/Atividades': "Quem vai criar e fiscalizar as provas no dia do evento?",
          'Infraestrutura/Logística': "Quem vai cuidar de tudo que é material, como o som, a decoração e a limpeza depois?"
        },
        feedbacks: {
            completo: "Ótima estrutura de gestão de projetos! Dividir a organização em comissões claras é a forma mais eficiente de realizar um grande evento.",
            baixo: "Tente pensar em grandes 'departamentos'. Um seria responsável por cuidar das provas, por exemplo. Que outros departamentos você criaria?"
        }
    }
  },

  // --- NÍVEL 5: MESTRE (Foco: Analisar Problemas Complexos e Projetar Soluções) ---
  {
    id: 'dec_05_a',
    pillar: 'decomposicao',
    level: 5,
    title: 'Mapeando um Problema do Bairro',
    description: 'Para entender um problema, precisamos identificar suas CAUSAS (por que acontece) e CONSEQUÊNCIAS (o que ele gera).',
    question: 'Escolha um problema real do seu bairro (lixo, falta de iluminação, etc). Identifique 3 CAUSAS e 2 CONSEQUÊNCIAS.',
    ajuda: {
      dica_contextual: "CAUSA responde 'por que o problema existe?'. CONSEQUÊNCIA responde 'o que o problema gera ou causa?'",
      pergunta_socaratica: "Se o problema é 'lixo nas ruas', 'falta de lixeiras' seria uma causa ou uma consequência? E 'mau cheiro'?",
      exemplo_pratico: "Exemplo: Problema: Transporte demorado. CAUSA 1: Poucos ônibus. CONSEQUÊNCIA 1: Alunos chegam atrasados."
    },
    analiseResposta: {
      minRequiredConcepts: 5,
      conceptGroups: [
        { name: 'Causa 1', keywords: ['causa', 'motivo', 'porque', 'razão'] },
        { name: 'Causa 2', keywords: ['outra causa', 'além disso'] },
        { name: 'Causa 3', keywords: ['terceira causa', 'também porque'] },
        { name: 'Consequência 1', keywords: ['consequencia', 'resultado', 'gera'] },
        { name: 'Consequência 2', keywords: ['outra consequencia', 'impacto'] },
        { name: 'Contexto', keywords: ['lixo', 'iluminacao', 'transporte', 'buraco'] }
      ],
      socratic_hints: {
        'Causa 1': "Tente pensar em uma razão principal pela qual o problema acontece.",
        'Consequência 1': "Ok, e o que este problema causa no dia a dia das pessoas?",
      },
      feedbacks: {
        completo: "Ótima análise! Você identificou causas e consequências de forma clara. Isso mostra sua capacidade de decompor problemas complexos.",
        parcial: "Bom início! Você apresentou algumas causas e consequências. Para aprofundar, tente detalhar e separar claramente 3 causas e 2 consequências.",
        baixo: "Vamos separar melhor: escreva as causas (por que acontece) e as consequências (o que gera na comunidade)."
      }
    }
  },
   {
    id: 'dec_05_b',
    pillar: 'decomposicao',
    level: 5,
    title: 'Decifrando o Futuro: Meu Projeto de Vida',
    description: 'Grandes conquistas começam com pequenos passos. Vamos decompor um objetivo pessoal em ações práticas.',
    question: 'Escolha uma grande meta para o seu futuro (ex: conseguir um emprego, entrar na faculdade). Decomponha essa meta em 4 grandes etapas ou fases que você precisa cumprir para chegar lá.',
    ajuda: {
        dica_contextual: "Pense em etapas como pesquisar, planejar, praticar e buscar apoio.",
        pergunta_socaratica: "Se você não souber por onde começar, como pode dar o primeiro passo? O que precisa aprender primeiro?",
        exemplo_pratico: "Meta: Ser um desenvolvedor de jogos. Etapa 1: Aprender a programar. Etapa 2: Criar pequenos jogos como portfólio."
    },
    analiseResposta: {
        minRequiredConcepts: 4,
        validation: {
            type: 'sequence',
            orderedConcepts: ['Pesquisa/Aprendizado', 'Planejamento/Preparação', 'Ação/Execução', 'Validação/Conquista']
        },
        conceptGroups: [
            { name: 'Pesquisa/Aprendizado', keywords: ['pesquisar', 'aprender', 'estudar', 'descobrir', 'curso', 'informação'] },
            { name: 'Planejamento/Preparação', keywords: ['planejar', 'organizar', 'plano', 'estratégia', 'preparar', 'currículo', 'curriculo'] },
            { name: 'Ação/Execução', keywords: ['praticar', 'fazer', 'trabalhar', 'estagiar', 'executar', 'criar', 'vestibular', 'prova', 'entrevista'] },
            { name: 'Validação/Conquista', keywords: ['conseguir', 'passar', 'entrar', 'emprego', 'faculdade', 'conquistar', 'resultado'] }
        ],
        socratic_hints: {
            'Pesquisa/Aprendizado': "Qual é a primeira coisa que você precisa saber ou aprender para começar a perseguir seu sonho?",
            'Planejamento/Preparação': "Depois de entender o caminho, como você se organiza e se prepara para a jornada?",
            'Ação/Execução': "Qual é a principal ação que você precisa fazer repetidamente para alcançar sua meta?",
            'Validação/Conquista': "Qual é o evento final que confirma que você atingiu seu objetivo?"
        },
        feedbacks: {
            completo: "Incrível! Você transformou um sonho em um projeto real, dividido em etapas práticas e lógicas. Ter um plano é o melhor caminho para o sucesso.",
            baixo: "Tente pensar na jornada como uma escada. Qual é o primeiro degrau? E o segundo? Liste os grandes passos para chegar ao topo."
        }
    }
  },
];

export const mockTeacherData = [
    { studentName: 'João', progress: { decomposicao: 2, padroes: 1, abstracao: 1, algoritmos: 0 } },
    { studentName: 'Maria', progress: { decomposicao: 3, padroes: 2, abstracao: 2, algoritmos: 1 } },
];