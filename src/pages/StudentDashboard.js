// src/pages/StudentDashboard.js

// 1. Importamos o hook 'useMemo' do React.
import React, { useMemo } from 'react';

// Componente para a "órbita" que mostra o nível de progresso.
const ReactorOrb = ({ level }) => {
  const orbClass = `reactor-orb level-${level}`;
  const displayLevel = level > 0 ? `N${level}` : '-';
  return ( <div className={orbClass}>{displayLevel}</div> );
};

function StudentDashboard({ user, pillars, levels, allActivities, progress, onSelectPillar, onReset }) {
  
  // --- LÓGICA DE CÁLCULO MOVIDA PARA useMemo ---
  // O hook useMemo "memoriza" o resultado de pillarLevels.
  // A função só será re-executada se uma das dependências no array [pillars, allActivities, progress] mudar.
  // Isso resolve o problema de timing, pois o cálculo agora espera até que allActivities seja preenchido.
  const pillarLevels = useMemo(() => {
    const calculatedLevels = {};
    // Adicionamos uma verificação de segurança para garantir que os dados existem antes de processar.
    if (!pillars || !allActivities || !progress?.activityData) {
      return {};
    }
    
    pillars.forEach(pillar => {
      const pillarActivities = allActivities.filter(a => a.pillar_id === pillar.id);
      
      const completed = pillarActivities.filter(a => progress.activityData[a.id]?.status === 'done');
      let maxLevel = 0;
      if (completed.length > 0) {
        maxLevel = Math.max(...completed.map(a => a.level_id));
      }
      calculatedLevels[pillar.id] = maxLevel;
    });
    return calculatedLevels;
  }, [pillars, allActivities, progress]); // O cálculo será refeito quando estas props mudarem.

  return (
    <div className="container">
      <h1>Olá, {user.full_name || user.name}!</h1>
      <h2 className="muted">Seu Progresso em Pensamento Computacional</h2>
      
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
       <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <button onClick={onReset} className="reset-button secondary">
          Reiniciar Progresso
        </button>
      </div>
    </div>
  );
}

export default StudentDashboard;