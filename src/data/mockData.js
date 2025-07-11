// src/data/mockData.js

export const users = {
  'ana@decifra.com': { name: 'Ana', role: 'student', id: 1 },
  'carlos@decifra.com': { name: 'Carlos', role: 'teacher', id: 2 },
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
  { 
    id: 'dec_01', 
    pillar: 'decomposicao', 
    level: 1, 
    title: 'Organizando a Rotina para Chegar na Hora', 
    description: 'Decompor sua rotina matinal em passos sequenciais é o primeiro passo para gerenciar seu tempo.',
    question: 'Para não se atrasar para a escola, você precisa sair de casa às 06:30. Liste 5 tarefas essenciais que você precisa fazer ANTES disso, na ordem correta.',
    ajuda: {
      dica_contextual: "Pense no que você faz assim que acorda. Qual é a primeira coisa?",
      pergunta_socaratica: "Se você se vestir antes de tomar banho, o que acontece? A ordem das tarefas importa?",
      exemplo_pratico: "Exemplo de uma tarefa: 1. Despertar. 2. Tomar banho..."
    },
    analiseResposta: {
      keywords: ['acordar', 'despertar', 'banho', 'banhar', 'vestir', 'roupa', 'café', 'comer', 'dente', 'escovar', 'mochila', 'sair'], // <-- CORREÇÃO: Adicionada a vírgula
      feedbacks: {
        completo: "Excelente! Sua resposta mostra que você entende bem como quebrar uma rotina em passos lógicos e ordenados. Isso é decomposição na prática!",
        parcial: "Bom começo! Você listou algumas tarefas importantes. Tente pensar em mais alguns passos essenciais, como 'tomar café' ou 'escovar os dentes', para tornar sua lista mais completa.",
        baixo: "Entendi seu ponto. Para este desafio, tente listar as ações como uma sequência de passos, como uma receita de bolo. Por exemplo: '1. Acordar às 06:00'."
      }
    }
  },
  { 
    id: 'dec_02', 
    pillar: 'decomposicao', 
    level: 2, 
    title: 'Montando um Time para o Jogo na Quadra',
    description: 'Um bom time não é feito só com um tipo de jogador. Decompor o time em funções é a chave para a estratégia.',
    question: 'Você é o capitão do time de futebol do intervalo. Para montar um time equilibrado, você precisa de jogadores para quais 5 funções ou áreas principais?',
    ajuda: {
      dica_contextual: "Pense nas áreas do campo ou da quadra. Onde cada jogador atua?",
      pergunta_socaratica: "O que acontece se um time só tiver jogadores de ataque e ninguém para defender?",
      exemplo_pratico: "Pense no vôlei, que tem levantador, atacante e líbero. Cada um tem uma função clara."
    },
    analiseResposta: {
      keywords: ['defesa', 'goleiro', 'zagueiro', 'ataque', 'atacante', 'meio', 'meio-campo', 'linha', 'fundo', 'frente', 'lateral', 'ala', 'centro-avante'], // <-- CORREÇÃO: Adicionada a vírgula
      feedbacks: {
        completo: "Perfeito! Você decompôs o time em funções estratégicas claras. Entender que um sistema (como um time) é feito de partes com funções diferentes é uma habilidade poderosa.",
        parcial: "Você está no caminho certo! 'Ataque' é definitivamente uma função essencial. Quais outras áreas são necessárias para que o time funcione bem e não sofra gols?",
        baixo: "Para este desafio, tente pensar não nos nomes dos jogadores, mas nas 'funções' que eles exercem em campo. Por exemplo, qual a função de quem fica perto do gol?"
      }
    }
  },
  { 
    id: 'dec_03', 
    pillar: 'decomposicao', 
    level: 3, 
    title: 'Planejando o Orçamento do Mês com R$ 50',
    description: 'Decompor um orçamento ajuda a entender para onde o dinheiro vai e a fazer escolhas inteligentes.',
    question: 'Você tem R$ 50 para seus gastos do mês. Divida esse valor em 5 categorias de despesas principais e estime quanto você pode gastar em cada uma.',
    ajuda: {
        dica_contextual: "Agrupe seus gastos. 'Comida' pode ser uma categoria. 'Transporte' pode ser outra.",
        pergunta_socaratica: "Se você listar cada gasto individualmente, fica fácil saber o total? Agrupar ajuda a simplificar?",
        exemplo_pratico: "Exemplo de categoria: TRANSPORTE - R$ 20. LANCHES - R$ 15. CRÉDITO CELULAR - R$ 15."
    },
    analiseResposta: {
        keywords: ['categoria', 'transporte', 'lanche', 'comida', 'celular', 'credito', 'dividir', 'gasto', 'despesa'], // <-- CORREÇÃO: Adicionada a vírgula
        feedbacks: {
            completo: "Seu planejamento está excelente! Decompor um valor total em categorias de gastos é a base de qualquer orçamento bem-sucedido. Ótimo trabalho!",
            parcial: "Você identificou categorias importantes! Para refinar, tente atribuir um valor estimado para cada uma, garantindo que a soma não passe de R$ 50.",
            baixo: "A ideia é agrupar os possíveis gastos em categorias maiores. Por exemplo, em vez de 'coxinha' e 'refrigerante', você pode criar a categoria 'Lanches'."
        }
    }
  },
  { 
    id: 'dec_04', 
    pillar: 'decomposicao', 
    level: 4, 
    title: 'Criando um Tutorial: "Como Usar o Wi-Fi da Praça"',
    description: 'Para ensinar algo complexo, primeiro precisamos decompor o processo em passos simples que qualquer pessoa possa seguir.',
    question: 'Muitos na sua comunidade não sabem como usar o Wi-Fi público. Crie um guia passo a passo (no mínimo 5 passos) explicando o processo, desde "ligar o Wi-Fi no celular" até "conseguir navegar".',
    ajuda: {
        dica_contextual: "O que uma pessoa que nunca fez isso antes precisa saber primeiro? Comece pelo básico.",
        pergunta_socaratica: "E se a rede Wi-Fi pedir um cadastro ou login? Esse seria um passo importante no seu tutorial?",
        exemplo_pratico: "Um passo poderia ser: '3. Na lista de redes, procure pelo nome 'WI-FI-DA-PRACA' e clique nele'."
    },
    analiseResposta: {
        keywords: ['passo', 'ligar', 'ativar', 'wi-fi', 'selecionar', 'rede', 'conectar', 'senha', 'login', 'cadastro', 'navegar'], // <-- CORREÇÃO: Adicionada a vírgula
        feedbacks: {
            completo: "Fantástico! Seu tutorial é claro, sequencial e fácil de seguir. Você fez um ótimo trabalho decompondo um processo técnico em passos simples para ajudar outras pessoas.",
            parcial: "Seus passos são bons e claros! Um detalhe importante: muitas redes públicas pedem um cadastro ou login após a conexão. Adicionar esse passo tornaria seu tutorial ainda mais completo.",
            baixo: "Tente estruturar sua resposta em uma lista numerada, como 'Passo 1: ...', 'Passo 2: ...'. Isso ajuda a organizar as ideias de forma sequencial."
        }
    }
  },
  { 
    id: 'dec_05', 
    pillar: 'decomposicao', 
    level: 5, 
    title: 'Mapeando um Problema do Bairro',
    description: 'Problemas grandes como o lixo na rua parecem impossíveis de resolver. Decompor o problema em suas causas e consequências é o primeiro passo para encontrar uma solução.',
    question: 'Pense em um problema real do seu bairro (ex: lixo acumulado, falta de iluminação). Decomponha este grande problema em 3 causas principais e 2 consequências diretas.',
    ajuda: {
        dica_contextual: "Causa é o 'porquê' do problema acontecer. Consequência é 'o que acontece por causa' do problema.",
        pergunta_socaratica: "A 'falta de lixeiras' seria uma causa ou uma consequência do lixo acumulado? E 'ruas sujas'?",
        exemplo_pratico: "Exemplo para 'transporte demorado': Causa 1: Poucos ônibus na linha. Causa 2: Trânsito intenso. Consequência 1: Atrasos para o trabalho/escola."
    },
    analiseResposta: {
        keywords: ['causa', 'motivo', 'porque', 'consequencia', 'resultado', 'gera', 'lixo', 'iluminacao', 'transporte', 'buraco', 'seguranca'], // <-- CORREÇÃO: Adicionada a vírgula
        feedbacks: {
            completo: "Análise impressionante! Você demonstrou uma capacidade de decompor um problema social complexo em suas causas e efeitos, o que é uma habilidade de pensamento crítico de altíssimo nível.",
            parcial: "Você identificou pontos muito relevantes. Para aprimorar, tente separar claramente o que é uma 'causa' (a raiz do problema) de uma 'consequência' (o que o problema gera).",
            baixo: "Ótima escolha de problema. Agora, tente pensar no 'porquê' de ele existir (as causas) e no 'impacto' que ele gera na vida das pessoas (as consequências)."
        }
    }
  },
];

export const mockTeacherData = [
    { studentName: 'João', progress: { decomposicao: 2, padroes: 1, abstracao: 1, algoritmos: 0 } },
    { studentName: 'Maria', progress: { decomposicao: 3, padroes: 2, abstracao: 2, algoritmos: 1 } },
];