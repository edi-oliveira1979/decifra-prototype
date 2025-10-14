// src/pages/ActivityPage.js
import React, { useState, useEffect } from 'react';
import { analyzeActivityAnswer, analyzeWithAI, saveActivityProgress } from '../services/progressService';

function ActivityPage({ activityId, allActivities, user, onProgressUpdate, onBack }) {
  const activity = allActivities.find(a => a.id === activityId);
  
  const [answer, setAnswer] = useState('');
  const [helpLevel, setHelpLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState(null);
  
  const [showCollabPopup, setShowCollabPopup] = useState(false);

  useEffect(() => {
    setAnswer('');
    setHelpLevel(0);
  }, [activityId]);

  const handleSubmit = async () => {
    if (!answer) {
      alert('Por favor, digite uma resposta.');
      return;
    }
    setIsLoading(true);

    let analysis;

    // --- LÓGICA DO MENTOR HÍBRIDO ---
    if (navigator.onLine) {
      console.log("Online: Usando análise com IA.");
      analysis = await analyzeWithAI(activityId, answer);
    } else {
      console.log("Offline: Usando análise semântica local.");
      analysis = await analyzeActivityAnswer(activityId, answer);
    }

    //const analysis = await analyzeActivityAnswer(activityId, answer);
    
    setFeedbackResult(analysis);
    setShowFeedbackModal(true);
    setIsLoading(false);
  };

  const handleCloseFeedback = async () => {
    setShowFeedbackModal(false);

    if (feedbackResult) {
      const progressDetails = {
        status: feedbackResult.status,
        helpLevel: helpLevel,
        answer: answer,
        feedback: feedbackResult.feedback,
      };

      if (typeof onProgressUpdate === 'function') {
        onProgressUpdate(activityId, progressDetails);
      }

      await saveActivityProgress({
        activity_id: activityId,
        status: progressDetails.status,
        help_level: progressDetails.helpLevel,
        student_answer: progressDetails.answer,
        feedback_given: progressDetails.feedback,
      });

      if (feedbackResult.status === 'done') {
        onBack();
      }
    }
    setFeedbackResult(null);
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
        {helpLevel >= 1 && <p><strong>Dica Contextual:</strong> {activity?.ajuda?.dica_contextual}</p>}
        {helpLevel >= 2 && <p><strong>Pergunta para Refletir:</strong> {activity?.ajuda?.pergunta_socaratica || activity?.ajuda?.pergunta_socratica}</p>}
        {helpLevel >= 3 && <p><strong>Exemplo Prático:</strong> {activity?.ajuda?.exemplo_pratico}</p>}
      </div>
    );
  };

  if (!activity) {
    return (
      <div className="container">
        <h1>Atividade não encontrada.</h1>
        {/* CORREÇÃO: Garantimos que o botão de voltar tenha a classe correta mesmo na tela de erro. */}
        <button onClick={onBack} className="back-button">&larr; Voltar</button>
      </div>
    );
  }

  return (
    <div className="container">
      {showFeedbackModal && feedbackResult && (
        <div className="feedback-popup-overlay">
          <div className="feedback-popup">
            <h2>Feedback do Mentor</h2>
            <p dangerouslySetInnerHTML={{ __html: feedbackResult.feedback.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
            <button onClick={handleCloseFeedback}>Entendi, continuar!</button>
          </div>
        </div>
      )}

      {/* CORREÇÃO: A classe do botão de voltar foi explicitamente definida para 'back-button'. */}
      <button onClick={onBack} className="back-button">&larr; Voltar para a Lista</button>
      <h1>{activity.title}</h1>
      <p>{activity.description}</p>
      <h2>{activity.question}</h2>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows="5"
        placeholder="Digite sua resposta aqui..."
        disabled={isLoading}
      />
      
      <div className="activity-controls">
        <button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Analisando...' : 'Enviar Resposta'}
        </button>
        <button onClick={handleHelpClick} className="help-button" disabled={isLoading}>
          Preciso de ajuda
        </button>
      </div>

      {renderHelpContent()}

      {showCollabPopup && (
        <div className="collab-popup-overlay">
          <div className="collab-popup">
            <h2>Peça uma Perspectiva!</h2>
            <p>Você já usou todas as dicas. Às vezes, uma segunda opinião ajuda a ver o problema de um novo ângulo. Que tal discutir sua ideia com um colega?</p>
            <button onClick={() => setShowCollabPopup(false)}>Entendi!</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityPage;