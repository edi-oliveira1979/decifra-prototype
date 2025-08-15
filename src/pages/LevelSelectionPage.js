// src/pages/LevelSelectionPage.js
import React from 'react';
// 1. As importações de dados e serviços foram removidas.
// O componente agora importa apenas o que é estritamente necessário para a UI.
import { pillars as allPillars, levels } from '../data/mockData';
import { CheckCircle2, RotateCw, ChevronRight, KeyRound } from 'lucide-react';

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

/**
 * Componente que exibe os níveis de desafio para um pilar selecionado.
 * @param {object} props - Propriedades passadas pelo App.js
 * @param {string} props.pillarId - O ID do pilar a ser exibido.
 * @param {Array} props.allActivities - A lista completa de todas as atividades.
 * @param {object} props.progress - O objeto de progresso atual do aluno.
 * @param {Function} props.onSelectLevel - Callback para navegar para a lista de atividades de um nível.
 * @param {Function} props.onBack - Callback para navegar de volta para a tela anterior.
 */
function LevelSelectionPage({ pillarId, allActivities, progress, onSelectLevel, onBack }) {
  const pillarInfo = allPillars.find(p => p.id === pillarId);
  const progressData = progress.activityData;

  // 3. A lógica interna agora usa as props 'allActivities' e 'progress' para calcular os dados.
  // Esta função calcula as estatísticas de cada nível.
  const getLevelsData = () => {
    const levelsData = {};
    const activitiesInPillar = allActivities.filter(a => a.pillar === pillarId);
    if (!activitiesInPillar.length) return [];

    const maxLevel = Math.max(...activitiesInPillar.map(a => a.level), 0);

    for (let i = 1; i <= maxLevel; i++) {
      const activitiesInLevel = activitiesInPillar.filter(a => a.level === i);
      if (activitiesInLevel.length === 0) continue;

      const completedInLevel = activitiesInLevel.filter(a => progressData[a.id]?.status === 'completo' || progressData[a.id]?.status === 'parcial');
      
      let bestPerformanceStatus = 'nao_iniciado';
      let bestAutonomy = null;

      if (completedInLevel.length > 0) {
        const hasCompletedPerfectly = completedInLevel.some(a => progressData[a.id]?.status === 'completo');
        bestPerformanceStatus = hasCompletedPerfectly ? 'completo' : 'parcial';
        
        const bestActivity = completedInLevel.find(a => progressData[a.id]?.status === 'completo') || completedInLevel[0];
        if (bestActivity && progressData[bestActivity.id]) {
          bestAutonomy = progressData[bestActivity.id].helpLevel;
        }
      }
      
      levelsData[i] = {
        levelNumber: i,
        totalActivities: activitiesInLevel.length,
        completedCount: completedInLevel.length,
        bestPerformanceStatus,
        bestAutonomy,
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
        {levelsData.map((level, index) => {
          const prevLevel = index > 0 ? levelsData[index - 1] : null;
          const prevLevelPassed = prevLevel?.bestPerformanceStatus === 'completo' || prevLevel?.bestPerformanceStatus === 'parcial';
          const isLocked = prevLevel && !prevLevelPassed;

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
                <span>Autonomia: <AutonomyIcon helps={level.bestAutonomy} /></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LevelSelectionPage;