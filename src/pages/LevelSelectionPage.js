// src/pages/LevelSelectionPage.js

import React, { useState, useEffect } from 'react';
import { CheckCircle2, ChevronRight, KeyRound, Lock } from 'lucide-react';
import { fetchActivities } from '../services/progressService';

// --- Componentes Auxiliares para ícones (COM CLASSES CORRIGIDAS) ---

const PerformanceIcon = ({ status }) => {
  // CORREÇÃO: A classe agora é 'icon-success' para o estado 'completo',
  // conforme definido no App.css do protótipo, para aplicar a cor verde.
  if (status === 'completo') return <CheckCircle2 size={20} className="icon-success" />;
  
  // A classe 'icon-pending' já estava alinhada para a cor cinza.
  return <ChevronRight size={20} className="icon-pending" />;
};

const AutonomyIcon = ({ helps }) => {
  if (helps === null || helps === undefined) return <span>-</span>;
  
  let colorClass = 'grey';
  if (helps === 0) colorClass = 'gold';
  if (helps > 0 && helps <= 2) colorClass = 'blue';
  
  // CORREÇÃO: A classe principal agora é 'autonomy-icon-small' para corresponder ao App.css do protótipo.
  return (
    <span className={`autonomy-icon-small ${colorClass}`}>
      <KeyRound size={16} />
    </span>
  );
};


function LevelSelectionPage({ pillarId, pillars, levels, progress, onSelectLevel, onBack }) {
  const pillarInfo = pillars.find(p => p.id === pillarId) || {};
  const progressData = progress.activityData;
  
  const [activitiesInPillar, setActivitiesInPillar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      if (!pillarId) return;
      setIsLoading(true);
      const activities = await fetchActivities({ pillarId });
      setActivitiesInPillar(activities);
      setIsLoading(false);
    };

    loadActivities();
  }, [pillarId]);

  const getLevelsData = () => {
    if (!activitiesInPillar || activitiesInPillar.length === 0) {
        return [];
    }

    const levelsData = {};
    const maxLevel = Math.max(...activitiesInPillar.map(a => a.level_id), 0);

    for (let i = 1; i <= maxLevel; i++) {
      const activitiesInLevel = activitiesInPillar.filter(a => a.level_id === i);
      if (activitiesInLevel.length === 0) continue;

      const completedActivities = activitiesInLevel.filter(a => progressData?.[a.id]?.status === 'done');
      
      let bestPerformanceStatus = 'nao_iniciado';
      let totalHelpCount = null;

      if (completedActivities.length > 0) {
        bestPerformanceStatus = 'completo';
        totalHelpCount = completedActivities.reduce((sum, act) => sum + (progressData[act.id]?.help_level || 0), 0);
      }
      
      levelsData[i] = {
        levelNumber: i,
        totalActivities: activitiesInLevel.length,
        completedCount: completedActivities.length,
        bestPerformanceStatus,
        totalHelpCount,
      };
    }
    return Object.values(levelsData);
  };

  const levelsData = getLevelsData();

  return (
    <div className="container">
      <button onClick={onBack} className="back-button">&larr; Voltar para Pilares</button>
      <h1>Pilar: {pillarInfo?.name}</h1>
      <h2 className="muted">Selecione um nível para ver as atividades.</h2>
      
      <div className="level-list">
        {isLoading ? (
          <p>Carregando níveis...</p>
        ) : levelsData.length === 0 ? (
          <p>Nenhuma atividade encontrada para este pilar ainda.</p>
        ) : (
          levelsData.map((level, index) => {
            const prevLevel = index > 0 ? levelsData[index - 1] : null;
            const isUnlocked = index === 0 || (prevLevel && prevLevel.completedCount === prevLevel.totalActivities);
            const isLocked = !isUnlocked;

            return (
              <div 
                key={level.levelNumber} 
                className={`level-card ${isLocked ? 'disabled' : 'clickable'}`}
                onClick={() => !isLocked && onSelectLevel(level.levelNumber)}
              >
                <div className='level-card-header'>
                  <h3>Nível {level.levelNumber}: {levels[level.levelNumber]}</h3>
                  {/* CORREÇÃO: A classe do cadeado agora é 'icon-warning' para a cor amarela. */}
                  {isLocked && <Lock size={20} className="icon-warning" />}
                </div>
                <div className="level-card-stats">
                  <span>Atividades: {level.completedCount}/{level.totalActivities}</span>
                  <span>Autonomia: <AutonomyIcon helps={level.totalHelpCount} /></span>
                  <span>Desempenho: <PerformanceIcon status={level.bestPerformanceStatus} /></span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default LevelSelectionPage;