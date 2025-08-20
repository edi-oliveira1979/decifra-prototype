// src/pages/ActivityPage.js
import React, { useState } from 'react';
import { saveActivityProgress } from '../services/progressService';

function ActivityPage({ activityId, allActivities, user, onProgressUpdate, onBack }) {
  const activity = allActivities.find(a => a.id === activityId);
  const [answer, setAnswer] = useState('');
  const [helpLevel, setHelpLevel] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [showCollabPopup, setShowCollabPopup] = useState(false);

  // Estados do protótipo mantidos
  const [currentStatus, setCurrentStatus] = useState('pending'); // pending | done | skipped
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const analyzeAndSetFeedback = async (studentAnswerText) => {
    const computedFeedback =
      (studentAnswerText && studentAnswerText.trim().length > 0)
        ? 'Obrigado! Sua resposta foi registrada e será analisada.'
        : 'Resposta vazia — preencha para prosseguir.';

    setFeedback(computedFeedback);
    setFeedbackStatus('completo');

    if (typeof onProgressUpdate === 'function') {
      onProgressUpdate(activityId, {
        status: currentStatus,
        helpLevel,
        answer: studentAnswerText,
        feedback: feedbackMessage || computedFeedback,
      });
    }

    try {
      await saveActivityProgress({
        activity_id: activityId,
        status: currentStatus,
        help_level: helpLevel,
        student_answer: studentAnswerText,
        feedback_given: feedbackMessage || computedFeedback,
      });
    } catch (e) {
      console.error('Falha ao salvar progresso no backend:', e);
    }
  };

  const handleSubmit = async () => {
    if (!answer) {
      alert('Por favor, digite uma resposta.');
      return;
    }
    await analyzeAndSetFeedback(answer);
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
    // A verificação inicial já é segura com `activity?.ajuda`
    if (helpLevel === 0 || !activity?.ajuda) return null;
    
    // --- CORREÇÃO ADICIONADA AQUI ---
    // Adicionamos optional chaining (`?.`) em cada acesso para garantir que
    // o código não quebre se o objeto `ajuda` existir, mas não tiver uma das
    // propriedades esperadas (dica_contextual, etc.).
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
        <button onClick={onBack} className="back-button">&larr; Voltar</button>
      </div>
    );
  }

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

      <button onClick={onBack} className="back-button">&larr; Voltar para a Lista</button>
      <h1>{activity.title}</h1>
      <p>{activity.description}</p>
      <h2>{activity.question}</h2>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows="5"
        placeholder="Digite sua resposta aqui..."
      />

      <div style={{ marginTop: '1rem' }}>
        <label>
          Status:{' '}
          <select value={currentStatus} onChange={(e) => setCurrentStatus(e.target.value)}>
            <option value="pending">Pendente</option>
            <option value="done">Concluída</option>
            <option value="skipped">Pular</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label>
          Feedback:{' '}
          <textarea
            value={feedbackMessage}
            onChange={(e) => setFeedbackMessage(e.target.value)}
            rows="3"
            placeholder="Escreva um feedback (opcional)..."
            style={{ width: '100%' }}
          />
        </label>
      </div>

      <div className="activity-controls" style={{ marginTop: '1rem' }}>
        <button onClick={handleSubmit}>Enviar Resposta</button>
        <button onClick={handleHelpClick} className="help-button">Preciso de ajuda</button>
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