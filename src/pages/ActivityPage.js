// src/pages/ActivityPage.js

import React, { useState } from 'react';
import { activities } from '../data/mockData';
import { completeActivity } from '../services/progressService';

function ActivityPage({ activityId, onBack }) {
  // Encontra a atividade correta com base no ID recebido
  const activity = activities.find(a => a.id === activityId);
  
  // --- Estados do Componente ---

  // Guarda a resposta que o aluno está digitando
  const [answer, setAnswer] = useState('');
  // Guarda o nível de ajuda que o aluno já solicitou (0, 1, 2, 3)
  const [helpLevel, setHelpLevel] = useState(0);
  // Controla a visibilidade do popup de colaboração
  const [showCollabPopup, setShowCollabPopup] = useState(false);
  // NOVO ESTADO: Guarda a mensagem de feedback da IA para exibir no popup
  const [feedback, setFeedback] = useState(null);

  // --- Funções de Lógica ---

  // Função para normalizar texto (facilita a comparação de palavras-chave)
  const normalizeText = (text) => {
    if (!text) return '';
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // NOVA FUNÇÃO: Simula a IA analisando a resposta do aluno
  const handleCritique = () => {
    const studentAnswer = normalizeText(answer);
    const { keywords, feedbacks } = activity.analiseResposta;
    
    let matchCount = 0;
    // Conta quantas palavras-chave foram encontradas na resposta
    keywords.forEach(keyword => {
      if (studentAnswer.includes(keyword)) {
        matchCount++;
      }
    });

    const matchPercentage = keywords.length > 0 ? (matchCount / keywords.length) : 0;
    let feedbackMessage;

    // Define qual feedback usar com base na porcentagem de acertos
    if (matchPercentage > 0.6) {
      feedbackMessage = feedbacks.completo;
    } else if (matchPercentage > 0.3) {
      feedbackMessage = feedbacks.parcial;
    } else {
      feedbackMessage = feedbacks.baixo;
    }

    // Define a mensagem de feedback no estado, o que fará o popup aparecer
    setFeedback(feedbackMessage);
    // Salva o progresso completo, incluindo a resposta e o feedback dado
    completeActivity(activity.id, helpLevel, answer, feedbackMessage);
  };

  // Função chamada ao clicar no botão "Enviar Resposta"
  const handleSubmit = () => {
    if (!answer) {
        alert('Por favor, digite uma resposta.');
        return;
    }
    // Em vez de só concluir, agora chamamos nossa função de crítica
    handleCritique();
  };

  // Função para o botão "Preciso de ajuda", com lógica em camadas
  const handleHelpClick = () => {
    const nextHelpLevel = helpLevel + 1;
    setHelpLevel(nextHelpLevel);

    // Se todas as 3 dicas já foram exibidas, sugere a colaboração
    if (nextHelpLevel > 3) {
      setShowCollabPopup(true);
    }
  };

  // Função para renderizar o box de dicas de forma progressiva
  const renderHelpContent = () => {
    if (helpLevel === 0) return null;

    return (
      <div className="hint-box">
        {helpLevel >= 1 && <p><strong>Dica Contextual:</strong> {activity.ajuda.dica_contextual}</p>}
        {helpLevel >= 2 && <p><strong>Pergunta para Refletir:</strong> {activity.ajuda.pergunta_socaratica}</p>}
        {helpLevel >= 3 && <p><strong>Exemplo Prático:</strong> {activity.ajuda.exemplo_pratico}</p>}
      </div>
    );
  };

  // --- Renderização do Componente (O que aparece na tela) ---

  return (
    <div className="container">
      {/* O NOVO POPUP DE FEEDBACK DA IA */}
      {/* Ele só aparece se o estado 'feedback' não for nulo */}
      {feedback && (
        <div className="feedback-popup-overlay">
          <div className="feedback-popup">
            <h2>Feedback do Mentor</h2>
            <p>{feedback}</p>
            {/* O botão "Entendi" agora te leva de volta para a lista de atividades */}
            <button onClick={onBack}>Entendi, continuar!</button>
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

      {/* O popup de colaboração continua funcionando como antes */}
      {showCollabPopup && (
        <div className="collab-popup">
          <h2>Peça uma Perspectiva!</h2>
          <p>Você já usou todas as dicas. Às vezes, uma segunda opinião ajuda a ver o problema de um novo ângulo. Que tal discutir sua ideia com um colega antes de responder?</p>
          <button onClick={() => setShowCollabPopup(false)}>Entendi!</button>
        </div>
      )}
    </div>
  );
}

export default ActivityPage;