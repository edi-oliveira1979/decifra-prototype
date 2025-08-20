// src/pages/StudentDashboard.js

import React from 'react';

// Componente para a "órbita" que mostra o nível de progresso.
const ReactorOrb = ({ level }) => {
  const orbClass = `reactor-orb level-${level}`;
  const displayLevel = level > 0 ? `N${level}` : '-';
  return ( <div className={orbClass}>{displayLevel}</div> );
};

function StudentDashboard({ user, pillars, levels, allActivities, progress, onSelectPillar, onReset }) {
  
  // A lógica para calcular o nível máximo alcançado em cada pilar permanece a mesma.
  const getPillarLevels = () => {
    const pillarLevels = {};
    if (!pillars || !allActivities) return {}; // allActivities ainda é usado aqui, será removido em otimizações futuras.
    pillars.forEach(pillar => {
      const pillarActivities = allActivities.filter(a => a.pillar === pillar.id);
      const completed = pillarActivities.filter(a => progress?.activityData?.[a.id]?.status === 'done'); // Ajustado para 'done'
      let maxLevel = 0;
      if (completed.length > 0) maxLevel = Math.max(...completed.map(a => a.level));
      pillarLevels[pillar.id] = maxLevel;
    });
    return pillarLevels;
  };
  const pillarLevels = getPillarLevels();

  return (
    <div className="container">
      <div className="header">
        <p>Logado como: <strong>{user.name}</strong> ({user.role})</p>
        <button onClick={onReset} className="reset-button">
          Reiniciar Progresso
        </button>
      </div>
      <h1>Olá, {user.name}!</h1>
      <h2>Seu Progresso em Pensamento Computacional</h2>
      
      <div className="pillar-grid">
        {pillars.map(p => {
          const currentLevel = pillarLevels[p.id] || 0;
          
          // --- ALTERAÇÃO PRINCIPAL ---
          // A lógica que travava os pilares foi removida.
          // Agora todos os pilares são clicáveis por padrão para o MVP.
          const pillarClass = 'pillar-card clickable';

          return (
            <div 
              key={p.id} 
              onClick={() => onSelectPillar(p.id)} // A função onClick agora é aplicada a todos.
              className={pillarClass}
            >
              <h3>{p.name}</h3>
              <ReactorOrb level={currentLevel} />
              <p className="level-text">{levels[currentLevel] || 'Não Iniciado'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StudentDashboard;