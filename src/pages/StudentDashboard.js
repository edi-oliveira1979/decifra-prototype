// src/pages/StudentDashboard.js
import React from 'react';
import { pillars, levels } from '../data/mockData';

const ReactorOrb = ({ level }) => {
  const getOrbStyle = () => {
    const baseStyle = {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      margin: '10px auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      color: 'white',
      fontSize: '20px'
    };

    if (level === 0) {
      return { ...baseStyle, backgroundColor: '#ccc' };
    } else if (level <= 2) {
      return { ...baseStyle, backgroundColor: '#4CAF50' };
    } else if (level <= 4) {
      return { ...baseStyle, backgroundColor: '#FF9800' };
    } else {
      return { ...baseStyle, backgroundColor: '#9C27B0' };
    }
  };

  return (
    <div style={getOrbStyle()}>
      {level}
    </div>
  );
};

function StudentDashboard({ user, allActivities, progress, onSelectPillar, onReset }) {
  const getPillarLevels = () => {
    const pillarLevels = {};
    pillars.forEach(pillar => {
      const pillarActivities = allActivities.filter(a => a.pillar === pillar.id);
      const completed = pillarActivities.filter(a => 
        progress?.activityData?.[a.id]?.status === 'completo' || 
        progress?.activityData?.[a.id]?.status === 'parcial'
      );
      let maxLevel = 0;
      if (completed.length > 0) {
        maxLevel = Math.max(...completed.map(a => a.level));
      }
      pillarLevels[pillar.id] = maxLevel;
    });
    return pillarLevels;
  };
  
  const pillarLevels = getPillarLevels();

  return (
    <div className="container">
      <div className="header-bar">
        <h1>Olá, {user.name}!</h1>
        <button onClick={onReset} className="reset-button">Reiniciar Progresso</button>
      </div>
      <h2>Seu Progresso em Pensamento Computacional</h2>
      <div className="pillar-grid">
        {pillars.map(pillar => {
          const currentLevel = pillarLevels[pillar.id] || 0;
          const isClickable = pillar.id === 'decomposicao';
          const pillarClass = isClickable ? 'pillar-card clickable highlight' : 'pillar-card disabled';
          return (
            <div key={pillar.id} onClick={() => isClickable && onSelectPillar(pillar.id)} className={pillarClass}>
              <h3>{pillar.name}</h3>
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