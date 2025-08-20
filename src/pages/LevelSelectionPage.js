// src/pages/LevelSelectionPage.js

import React, { useState, useEffect } from 'react';
import { CheckCircle2, RotateCw, ChevronRight, KeyRound } from 'lucide-react';
// Importamos o serviço para buscar as atividades de forma dinâmica.
import { fetchActivities } from '../services/progressService';

// --- Componentes Auxiliares (sem alterações) ---
const PerformanceIcon = ({ status }) => {
  if (status === 'completo') return <CheckCircle2 size={20} className="icon-success" />;
  if (status === 'parcial') return <RotateCw size={20} className="icon-warning" />;
  return <ChevronRight size={20} className="icon-pending" />;
};

const AutonomyIcon = ({ helps }) => {
  if (helps === null || helps === undefined) return null;
  let colorClass = 'grey';
  if (helps === 0) colorClass = 'gold';
  if (helps > 0 && helps <= 2) colorClass = 'blue';
  return (
    <span className={`autonomy-icon-small ${colorClass}`}>
      <KeyRound size={16} />
      {helps > 0 && <span>{helps}</span>}
    </span>
  );
};


// --- ALTERAÇÃO PRINCIPAL: Componente não recebe mais 'allActivities' ---
function LevelSelectionPage({ pillarId, pillars, levels, progress, onSelectLevel, onBack }) {
  const pillarInfo = pillars.find(p => p.id === pillarId);
  const progressData = progress.activityData;
  
  // Novo estado para armazenar apenas as atividades relevantes para este pilar.
  const [activitiesInPillar, setActivitiesInPillar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect para buscar os dados da API quando o componente for montado ou o pillarId mudar.
  useEffect(() => {
    const loadActivities = async () => {
      if (!pillarId) return;
      setIsLoading(true);
      const activities = await fetchActivities({ pillarId });
      setActivitiesInPillar(activities);
      setIsLoading(false);
    };

    loadActivities();
  }, [pillarId]); // A dependência garante que a busca será refeita se o pilar mudar.

  const getLevelsData = () => {
    // A lógica de cálculo agora opera sobre o estado local 'activitiesInPillar',
    // que é um conjunto de dados muito menor e mais focado.
    if (!activitiesInPillar || activitiesInPillar.length === 0) {
        return [];
    }

    const levelsData = {};
    const maxLevel = Math.max(...activitiesInPillar.map(a => a.level_id), 0);

    for (let i = 1; i <= maxLevel; i++) {
      const activitiesInLevel = activitiesInPillar.filter(a => a.level_id === i);
      if (activitiesInLevel.length === 0) continue;

      const completedInLevel = activitiesInLevel.filter(a => progressData?.[a.id]?.status === 'done');
      
      let bestPerformanceStatus = 'nao_iniciado';
      if (completedInLevel.length > 0) {
        bestPerformanceStatus = 'completo';
      }
      
      levelsData[i] = {
        levelNumber: i,
        totalActivities: activitiesInLevel.length,
        completedCount: completedInLevel.length,
        bestPerformanceStatus,
      };
    }
    return Object.values(levelsData);
  };

  const levelsData = getLevelsData();

  return (
    <div className="container">
      <button onClick={onBack} className="back-button">&larr; Voltar para Pilares</button>
      <h1>Pilar: {pillarInfo?.name}</h1>
      <h2>Selecione um nível para ver as atividades.</h2>
      <div className="level-list">
        {isLoading ? (
          <p>Carregando níveis...</p>
        ) : levelsData.length === 0 ? (
          <p>Nenhuma atividade encontrada para este pilar ainda.</p>
        ) : (
          levelsData.map((level, index) => {
            const prevLevel = index > 0 ? levelsData[index - 1] : null;
            const prevLevelPassed = prevLevel?.bestPerformanceStatus === 'completo';
            const isLocked = index > 0 && !prevLevelPassed; // O primeiro nível nunca é bloqueado

            return (
              <div 
                key={level.levelNumber} 
                className={`level-card ${isLocked ? 'disabled' : 'clickable'}`}
                onClick={() => !isLocked && onSelectLevel(level.levelNumber)}
              >
                <div className='level-card-header'>
                  <h3>Nível {level.levelNumber}: {levels[level.levelNumber]}</h3>
                  {isLocked && <span className='lock-icon'>🔒</span>}
                </div>
                <div className="level-card-stats">
                  <span>Atividades: {level.completedCount}/{level.totalActivities}</span>
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