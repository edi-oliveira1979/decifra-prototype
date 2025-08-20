// src/pages/StudentDashboard.js

import React from 'react';

// Componente para a "órbita" que mostra o nível de progresso.
const ReactorOrb = ({ level }) => {
  const orbClass = `reactor-orb level-${level}`;
  const displayLevel = level > 0 ? `N${level}` : '-';
  return ( <div className={orbClass}>{displayLevel}</div> );
};

function StudentDashboard({ user, pillars, levels, allActivities, progress, onSelectPillar, onReset }) {
  
  const getPillarLevels = () => {
    const pillarLevels = {};
    if (!pillars || !allActivities) return {};
    
    pillars.forEach(pillar => {
      // --- CORREÇÃO APLICADA AQUI (1/2) ---
      // O campo no objeto de atividade agora é 'pillar_id'.
      const pillarActivities = allActivities.filter(a => a.pillar_id === pillar.id);
      
      const completed = pillarActivities.filter(a => progress?.activityData?.[a.id]?.status === 'done');
      let maxLevel = 0;
      if (completed.length > 0) {
        // --- CORREÇÃO APLICADA AQUI (2/2) ---
        // O campo no objeto de atividade agora é 'level_id'.
        maxLevel = Math.max(...completed.map(a => a.level_id));
      }
      pillarLevels[pillar.id] = maxLevel;
    });
    return pillarLevels;
  };
  const pillarLevels = getPillarLevels();

  return (
    <div className="container">
      {/* O cabeçalho foi movido para App.js para ser global, esta seção pode ser removida se não houver botões específicos da página */}
      {/* <div className="header">
        <p>Logado como: <strong>{user.name}</strong> ({user.role})</p>
        <button onClick={onReset} className="reset-button">
          Reiniciar Progresso
        </button>
      </div>
      */}
      <h1>Olá, {user.name}!</h1>
      <h2>Seu Progresso em Pensamento Computacional</h2>
      
      <div className="pillar-grid">
        {pillars.map(p => {
          const currentLevel = pillarLevels[p.id] || 0;
          
          const pillarClass = 'pillar-card clickable';

          return (
            <div 
              key={p.id} 
              onClick={() => onSelectPillar(p.id)}
              className={pillarClass}
            >
              <h3>{p.name}</h3>
              <ReactorOrb level={currentLevel} />
              <p className="level-text">{levels[currentLevel] || 'Não Iniciado'}</p>
            </div>
          );
        })}
      </div>
       {/* Botão de reset movido para um local mais proeminente no dashboard */}
       <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <button onClick={onReset} className="reset-button secondary">
          Reiniciar Progresso
        </button>
      </div>
    </div>
  );
}

export default StudentDashboard;