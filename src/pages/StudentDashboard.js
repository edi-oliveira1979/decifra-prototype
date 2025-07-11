// src/pages/StudentDashboard.js
import React from 'react';
import { pillars, levels } from '../data/mockData';
import { getPillarLevels, resetProgress } from '../services/progressService';

function StudentDashboard({ user, onSelectPillar }) {
  const pillarLevels = getPillarLevels();

  const handleResetProgress = () => {
    if (window.confirm('Tem certeza que deseja apagar todo o seu progresso?')) {
      resetProgress();
      window.location.reload();
    }
  };

  return (
    <div className="container">
      <div className="header-bar">
        <h1>Olá, {user.name}!</h1>
        <button onClick={handleResetProgress} className="reset-button">
          Reiniciar Progresso
        </button>
      </div>
      <h2>Seu Progresso em Pensamento Computacional</h2>

      <div className="pillar-grid">
        {pillars.map(pillar => {
          const currentLevel = pillarLevels[pillar.id];
          const isClickable = pillar.id === 'decomposicao';
          // A classe 'highlight' fará o destaque visual no card clicável
          const pillarClass = isClickable ? 'pillar-card clickable highlight' : 'pillar-card disabled';

          return (
            <div 
              key={pillar.id} 
              onClick={() => isClickable && onSelectPillar(pillar.id)}
              className={pillarClass}
            >
              <h3>{pillar.name}</h3>
              <p>Seu nível atual:</p>
              <span className="level-text">{levels[currentLevel]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StudentDashboard;