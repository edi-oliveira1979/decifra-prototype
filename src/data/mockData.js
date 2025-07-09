// src/data/mockData.js

// Define nossos usuários fictícios: Ana (aluna) e Carlos (professor)
export const users = {
  'ana@decifra.com': { name: 'Ana', role: 'student', id: 1 },
  'carlos@decifra.com': { name: 'Carlos', role: 'teacher', id: 2 },
};

// Define as atividades do protótipo
export const activities = [
  {
    id: 'act01',
    title: 'Decomposição: Planejando uma Festa',
    description: 'Divida o grande problema de "organizar uma festa" em 5 passos menores e gerenciáveis.',
    question: 'Quais são os 5 passos principais para organizar uma festa de aniversário?',
    // Dicas offline contextuais para esta atividade
    hints: [
      'Pense no que vem primeiro. O que você precisa antes de convidar as pessoas?',
      'E a comida? E a diversão?',
      'Não se esqueça do lugar e da data!',
    ],
  },
  {
    id: 'act02',
    title: 'Abstração: Desenhando um Ícone de "Salvar"',
    description: 'Pense no conceito de "salvar um documento". Qual é o objeto mais icônico que representa essa ideia, ignorando detalhes desnecessários?',
    question: 'Qual objeto do mundo real melhor representa a ação de "salvar" um arquivo em um computador?',
    hints: [
        'Pense em como as pessoas guardavam informações antes dos computadores modernos.',
        'Era um objeto físico, pequeno e quadrado.',
        'O disquete!',
    ],
  },
];

// Dados fictícios do progresso da turma para o dashboard do professor
export const mockProgress = [
    { studentName: 'Ana', activityTitle: 'Decomposição: Planejando uma Festa', status: 'Concluído', interactions: 3 },
    { studentName: 'João', activityTitle: 'Decomposição: Planejando uma Festa', status: 'Em Progresso', interactions: 5 },
    { studentName: 'Maria', activityTitle: 'Decomposição: Planejando uma Festa', status: 'Não Iniciado', interactions: 0 },
    { studentName: 'Pedro', activityTitle: 'Abstração: Desenhando um Ícone de "Salvar"', status: 'Concluído', interactions: 1 },
];