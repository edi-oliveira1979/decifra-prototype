// Função auxiliar para normalizar o texto, igual à do backend
const normalizeText = (text) => {
  if (!text) return '';
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

/**
 * Analisa a resposta de um aluno localmente, com lógica de feedback parcial aprimorada.
 */
export function analyzeOffline(studentAnswerText, activity) {
  const studentAnswer = normalizeText(studentAnswerText);
  const { 
    minRequiredConcepts, 
    conceptGroups, 
    feedbacks, 
    validation, 
    socratic_hints 
  } = activity.analise_resposta;

  const foundConcepts = new Set();

  conceptGroups.forEach(group => {
    // Usamos normalizeText na keyword também para uma comparação justa
    if (group.keywords.some(keyword => studentAnswer.includes(normalizeText(keyword)))) {
      foundConcepts.add(group.name);
    }
  });

  const isValid = foundConcepts.size >= minRequiredConcepts;

  // --- LÓGICA DE FEEDBACK REFINADA (INTEGRADA DO PROTÓTIPO) ---
  if (isValid) {
    return { status: "done", feedback: feedbacks.completo };
  } 

  if (foundConcepts.size > 0) {
    // FEEDBACK PARCIAL
    const concepts = Array.from(foundConcepts).map(c => `<strong>${c}</strong>`);
    const praise = `Excelente! Você já identificou conceitos importantes como ${concepts.join(', ')}. `;
    
    let nextHint = "";
    // Define a ordem de busca pela próxima dica socrática
    const searchOrder = validation?.type === 'sequence' 
      ? validation.orderedConcepts 
      : conceptGroups.map(g => g.name);
    
    // Encontra o primeiro conceito esperado que ainda não foi encontrado
    for (const conceptName of searchOrder) {
      if (!foundConcepts.has(conceptName)) {
        if (socratic_hints[conceptName]) {
          nextHint = socratic_hints[conceptName];
          break;
        }
      }
    }
    
    if (!nextHint) { // Fallback se não encontrar uma dica específica
      nextHint = feedbacks.parcial || feedbacks.baixo;
    }

    return { status: "pending", feedback: praise + nextHint };

  } else {
    // FEEDBACK BAIXO (nenhum acerto)
    return { status: "pending", feedback: feedbacks.baixo };
  }
}