// src/pages/DecompositionPage.js
import React from 'react';
import { activities } from '../data/mockData';
import { getProgress } from '../services/progressService';
import { ChevronRight, RotateCw, CheckCircle2 } from 'lucide-react';
//import { ChevronRight, RotateCw, CheckCircle2, Lock } from 'lucide-react';

function DecompositionPage({ level, onSelectActivity, onBack }) {
  const progress = getProgress();
  // Filtra as atividades para mostrar apenas as do nível selecionado
  const decompositionActivities = activities.filter(a => a.pillar === 'decomposicao' && a.level === level);

  return (
    <div className="container">
      <button onClick={onBack} className="back-button">&larr; Voltar para Níveis</button>
      <h1>Decomposição - Nível {level}</h1>
      <p>Dividir problemas grandes em partes menores.</p>
      <ul className="activity-list">
        {decompositionActivities.map(activity => {
          const activityData = progress?.activityData?.[activity.id];
          const status = activityData?.status;
          
          // Lógica de desbloqueio foi simplificada pois agora estamos em uma página de nível
          let statusIcon;
          switch(status) {
            case 'completo':
              statusIcon = <CheckCircle2 size={24} className="icon-success" />;
              break;
            case 'parcial':
              statusIcon = <RotateCw size={24} className="icon-warning" />;
              break;
            default:
              statusIcon = <ChevronRight size={24} className="icon-pending" />;
          }

          return (
            <li
              key={activity.id}
              onClick={() => onSelectActivity(activity.id)}
              className={'clickable'} // Todas as atividades na página de nível são clicáveis
            >
              <span className="activity-icon">{statusIcon}</span>
              <span className="activity-title">{activity.title}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default DecompositionPage;