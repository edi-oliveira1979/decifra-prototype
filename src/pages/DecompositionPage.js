// src/pages/DecompositionPage.js
import React from 'react';
//import { ChevronRight, RotateCw, CheckCircle2, Lock } from 'lucide-react';
import { ChevronRight, RotateCw, CheckCircle2 } from 'lucide-react';

function DecompositionPage({ level, allActivities, progress, onSelectActivity, onBack }) {
  const decompositionActivities = allActivities.filter(a => a.pillar === 'decomposicao' && a.level === level);
  const progressData = progress.activityData;
  return (
    <div className="container">
      <button onClick={onBack} className="back-button">&larr; Voltar para Níveis</button>
      <h1>Decomposição - Nível {level}</h1>
      <ul className="activity-list">
        {decompositionActivities.map(activity => {
          const status = progressData?.[activity.id]?.status;
          let statusIcon;
          switch(status) {
            case 'completo': statusIcon = <CheckCircle2 size={24} className="icon-success" />; break;
            case 'parcial': statusIcon = <RotateCw size={24} className="icon-warning" />; break;
            default: statusIcon = <ChevronRight size={24} className="icon-pending" />;
          }
          return (
            <li key={activity.id} onClick={() => onSelectActivity(activity.id)} className={'clickable'}>
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