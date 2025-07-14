// src/pages/StudentDashboard.js
import React from 'react';
import { pillars, levels } from '../data/mockData';
import { getPillarLevels, resetProgress } from '../services/progressService';

// Novo componente para o visual do "Reator"
const ReactorOrb = ({ level }) => {
  // Define a cor da borda com base no nível
  const orbClass = `reactor-orb level-${level}`;
  // O que é exibido dentro do orbe (ex: o nível numérico)
  const displayLevel = level > 0 ? `N${level}` : '-';
  return (
    <div className={orbClass}>
      {displayLevel}
    </div>
  );
};

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
      <div className="header">
        <p>Logado como: <strong>{user.name}</strong> ({user.role})</p>
        <button onClick={handleResetProgress} className="reset-button">
          Reiniciar Progresso
        </button>
      </div>
      <h1>Seu Progresso</h1>
      <h2>Colete "Átomos" e domine os "Elementos" do Pensamento Computacional!</h2>
      
      <div className="pillar-grid">
        {pillars.map(pillar => {
          const currentLevel = pillarLevels[pillar.id];
          const isClickable = pillar.id === 'decomposicao';
          const pillarClass = isClickable ? 'pillar-card clickable highlight' : 'pillar-card disabled';

          return (
            <div 
              key={pillar.id} 
              onClick={() => isClickable && onSelectPillar(pillar.id)}
              className={pillarClass}
            >
              <h3>{pillar.name}</h3>
              {/* Usando o novo componente Reator */}
              <ReactorOrb level={currentLevel} />
              <p className="level-text">{levels[currentLevel]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StudentDashboard;