// src/pages/ActivityPage.js
import React, { useState } from 'react';
import { activities } from '../data/mockData';
import { completeActivity } from '../services/progressService';

function ActivityPage({ activityId, onBack }) {
  const activity = activities.find(a => a.id === activityId);
  
  const [answer, setAnswer] = useState('');
  const [helpLevel, setHelpLevel] = useState(0);
  const [showCollabPopup, setShowCollabPopup] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState('');

  const normalizeText = (text) => {
    if (!text) return '';
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // --- MOTOR DE ANÁLISE SEMÂNTICA v4.0 ---
  const analyzeAndSetFeedback = (studentAnswerText) => {
    const studentAnswer = normalizeText(studentAnswerText);
    const { conceptGroups, minRequiredConcepts, feedbacks, validation, socratic_hints } = activity.analiseResposta;
    
    // 1. Análise de Conceitos
    const foundConcepts = new Set();
    const foundConceptsInOrder = [];
    const duplicateConcepts = new Set();
    
    conceptGroups.forEach(group => {
      if (group.keywords.some(keyword => studentAnswer.includes(normalizeText(keyword)))) {
        if (foundConcepts.has(group.name)) {
          duplicateConcepts.add(group.name);
        } else {
          foundConcepts.add(group.name);
          // A ordem só é relevante para a validação de sequência
          if (validation?.type === 'sequence') {
            foundConceptsInOrder.push(group.name);
          }
        }
      }
    });
    
    let feedbackMessage = '';
    let currentStatus = 'baixo';
    let isValid = foundConcepts.size >= minRequiredConcepts;
    let validationError = '';

    // 2. Validações Específicas
    if (validation) {
      if (validation.type === 'sum') {
        const numbers = studentAnswerText.match(/-?\d+/g)?.map(Number) || [];
        const totalSum = numbers.reduce((sum, num) => sum + num, 0);
        if (isValid && totalSum > validation.target) {
          validationError = `Suas categorias estão ótimas! Mas notei que a soma dos valores (R$ ${totalSum}) ultrapassou o orçamento de R$ ${validation.target}. Que tal ajustar os custos?`;
          isValid = false;
        }
      } else if (validation.type === 'sequence') {
        let lastFoundIndex = -1;
        let isSequenceCorrect = true;
        for (const concept of foundConceptsInOrder) {
          const currentIndex = validation.orderedConcepts.indexOf(concept);
          if (currentIndex === -1) continue;
          if (currentIndex < lastFoundIndex) { isSequenceCorrect = false; break; }
          lastFoundIndex = currentIndex;
        }
        if (!isSequenceCorrect) {
          validationError = "Os passos que você listou são todos importantes, mas a ordem parece um pouco trocada. Lembre-se, o que precisa acontecer primeiro para que o próximo passo seja possível?";
          isValid = false;
        }
      }
    }

    // 3. Construção do Feedback Dinâmico e Final
    if (isValid && !validationError) {
      currentStatus = 'completo';
      feedbackMessage = feedbacks.completo;
    } else {
      currentStatus = 'parcial';
      if (validationError) {
        feedbackMessage = validationError;
      } else {
        let praise = '';
        if (foundConcepts.size > 0) {
          praise = `Excelente! Você já identificou conceitos importantes como **${Array.from(foundConcepts).join(', ')}**. `;
        }
        
        let hint = '';
        const missingConcept = (validation?.type === 'sequence' ? validation.orderedConcepts : conceptGroups).find(c => !foundConcepts.has(c.name || c));

        if (missingConcept) {
          const conceptName = missingConcept.name || missingConcept;
          hint = socratic_hints[conceptName] || `Para chegar aos ${minRequiredConcepts} conceitos, que outra área importante ainda não foi coberta?`;
        } else if (duplicateConcepts.size > 0) {
          hint = `Notei que você usou termos diferentes para o mesmo conceito de **'${Array.from(duplicateConcepts).join(' e ')}'**. Que tal substituir um deles por uma ideia totalmente nova?`;
        } else {
          hint = "Sua análise está quase perfeita, continue refinando!";
        }
        feedbackMessage = praise + hint;
      }
    }

    setFeedback(feedbackMessage);
    setFeedbackStatus(currentStatus);
    completeActivity(activity.id, helpLevel, studentAnswerText, feedbackMessage, currentStatus);
  };

  
  const handleSubmit = () => {
    if (!answer) {
        alert('Por favor, digite uma resposta.');
        return;
    }
    analyzeAndSetFeedback(answer);
  };
  
  const handleCloseFeedback = () => {
    setFeedback(null);
    if (feedbackStatus === 'completo') {
      onBack();
    }
  };
  
  const handleHelpClick = () => {
    const nextHelpLevel = helpLevel + 1;
    setHelpLevel(nextHelpLevel);
    if (nextHelpLevel > 3) {
      setShowCollabPopup(true);
    }
  };
  
  const renderHelpContent = () => {
    if (helpLevel === 0 || !activity?.ajuda) return null;

    return (
      <div className="hint-box">
        {helpLevel >= 1 && <p><strong>Dica Contextual:</strong> {activity.ajuda.dica_contextual}</p>}
        {helpLevel >= 2 && <p><strong>Pergunta para Refletir:</strong> {activity.ajuda.pergunta_socaratica}</p>}
        {helpLevel >= 3 && <p><strong>Exemplo Prático:</strong> {activity.ajuda.exemplo_pratico}</p>}
      </div>
    );
  };

  if (!activity) {
    return <div className="container"><h1>Atividade não encontrada.</h1><button onClick={onBack} className="back-button">&larr; Voltar</button></div>;
  }

  // --- Renderização do Componente ---
  return (
    <div className="container">
      {feedback && (
        <div className="feedback-popup-overlay">
          <div className="feedback-popup">
            <h2>Feedback do Mentor</h2>
            <p dangerouslySetInnerHTML={{ __html: feedback }}></p>
            <button onClick={handleCloseFeedback}>Entendi, continuar!</button>
          </div>
        </div>
      )}

      <button onClick={onBack} className="back-button">&larr; Voltar</button>
      <h1>{activity.title}</h1>
      <p>{activity.description}</p>
      <h2>{activity.question}</h2>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows="5"
        placeholder="Digite sua resposta aqui..."
      />
      <br />
      <button onClick={handleHelpClick}>Preciso de ajuda</button>
      <button onClick={handleSubmit} style={{ marginLeft: '10px' }}>Enviar Resposta</button>

      {renderHelpContent()}

      {showCollabPopup && (
        <div className="collab-popup-overlay">
            <div className="collab-popup">
            <h2>Peça uma Perspectiva!</h2>
            <p>Você já usou todas as dicas. Às vezes, uma segunda opinião ajuda a ver o problema de um novo ângulo. Que tal discutir sua ideia com um colega antes de responder?</p>
            <button onClick={() => setShowCollabPopup(false)}>Entendi!</button>
            </div>
        </div>
      )}
    </div>
  );
}

export default ActivityPage;