// src/pages/LevelSelectionPage.js
import React from 'react';
import { getLevelsDataForPillar } from '../services/progressService';
import { pillars as allPillars, levels } from '../data/mockData';
import { CheckCircle2, RotateCw, ChevronRight, KeyRound } from 'lucide-react';

const PerformanceIcon = ({ status }) => {
  if (status === 'completo') return <CheckCircle2 size={20} className="icon-success" />;
  if (status === 'parcial') return <RotateCw size={20} className="icon-warning" />;
  return <ChevronRight size={20} className="icon-pending" />;
};

const AutonomyIcon = ({ helps }) => {
  if (helps === null) return null;
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

function LevelSelectionPage({ pillarId, onSelectLevel, onBack }) {
  const levelsData = getLevelsDataForPillar(pillarId);
  const pillarInfo = allPillars.find(p => p.id === pillarId);

  return (
    <div className="container">
      <button onClick={onBack} className="back-button">&larr; Voltar para Pilares</button>
      <h1>Pilar: {pillarInfo?.name}</h1>
      <h2>Selecione um nível para ver as atividades.</h2>
      <div className="level-list">
        {levelsData.map((level, index) => {
          // --- LÓGICA DE DESBLOQUEIO ATUALIZADA ---
          const prevLevel = index > 0 ? levelsData[index - 1] : null;

          // A nova regra: um nível é considerado 'passado' se o melhor desempenho
          // do nível anterior for 'parcial' ou 'completo'.
          const prevLevelPassed = prevLevel?.bestPerformanceStatus === 'completo' || prevLevel?.bestPerformanceStatus === 'parcial';
          
          // O nível atual é bloqueado somente se o nível anterior existir E não tiver sido "passado".
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