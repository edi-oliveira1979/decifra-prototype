// src/pages/ActivityPage.js
import React, { useState, useEffect } from 'react';
import { activities } from '../data/mockData';

// A página onde a mágica acontece!
function ActivityPage({ activityId, onBack }) {
  // Encontra a atividade selecionada nos nossos dados
  const activity = activities.find(a => a.id === activityId);
  
  // Estados para gerenciar a interação do usuário
  const [answer, setAnswer] = useState('');
  const [hintCount, setHintCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showCollabPopup, setShowCollabPopup] = useState(false);

  // Lógica para o botão "Preciso de Ajuda"
  const handleHelpClick = () => {
    // Simula a Camada 2: Cache Preditivo (dicas offline)
    if (hintCount < activity.hints.length) {
      setShowHint(true);
      setHintCount(hintCount + 1);
    } else {
      // Simula a Camada 3: Tutor Colaborativo Gamificado
      setShowCollabPopup(true);
    }
  };

  // Lógica para submeter a resposta
  const handleSubmit = () => {
    // No protótipo, apenas salvamos no localStorage para simular o progresso
    // localStorage é um pequeno "banco de dados" dentro do próprio navegador
    localStorage.setItem(`progress_${activityId}`, JSON.stringify({
      answer,
      hintsUsed: hintCount,
      collaborationUsed: showCollabPopup,
      status: 'Concluído',
    }));
    alert('Atividade enviada! Seu progresso foi salvo.');
    onBack(); // Volta para o dashboard
  };

  return (
    <div className="container">
      <button onClick={onBack}>&larr; Voltar para Atividades</button>
      <h1>{activity.title}</h1>
      <p>{activity.description}</p>
      <h2>{activity.question}</h2>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows="5"
        style={{ width: 'calc(100% - 22px)', padding: '10px' }}
        placeholder="Digite sua resposta aqui..."
      />
      <br />
      <button onClick={handleHelpClick}>Preciso de ajuda</button>
      <button onClick={handleSubmit} style={{ marginLeft: '10px' }}>Enviar Resposta</button>

      {/* Caixa de Dica */}
      {showHint && hintCount > 0 && (
        <div className="hint-box">
          <strong>Dica #{hintCount}:</strong> {activity.hints[hintCount - 1]}
        </div>
      )}

      {/* Popup de Colaboração */}
      {showCollabPopup && (
        <div className="collab-popup">
          <h2>Desafio em Dupla!</h2>
          <p>Parece que esta é uma questão difícil! Que tal discutir com um colega? A colaboração é uma parte importante do aprendizado.</p>
          <button onClick={() => setShowCollabPopup(false)}>Entendi!</button>
        </div>
      )}
    </div>
  );
}

export default ActivityPage;