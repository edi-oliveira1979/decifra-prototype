// src/pages/DecompositionPage.js
import React from 'react';
import { activities } from '../data/mockData';
import { getProgress } from '../services/progressService';

function DecompositionPage({ onSelectActivity, onBack }) {
  const progress = getProgress();
  const decompositionActivities = activities.filter(a => a.pillar === 'decomposicao');

  return (
    <div className="container">
      {/* Este botão usará o novo estilo que definiremos no CSS */}
      <button onClick={onBack} className="back-button">&larr; Voltar para Pilares</button>
      <h1>Pilar: Decomposição</h1>
      <p>Dividir problemas grandes em partes menores.</p>
      <ul className="activity-list">
        {decompositionActivities.map(activity => {
          const activityData = progress?.activityData?.[activity.id];
          const isCompleted = activityData?.completed;

          const previousActivity = activities.find(a => a.level === activity.level - 1 && a.pillar === 'decomposicao');
          const previousActivityData = previousActivity ? progress?.activityData?.[previousActivity.id] : null;
          const isLocked = previousActivity && !previousActivityData?.completed;

          let statusIcon = '➡️';
          if (isCompleted) statusIcon = '✔️';
          if (isLocked) statusIcon = '🔒';

          // A classe 'clickable' ou 'disabled' controlará o estilo do cursor
          const listItemClass = isLocked ? 'disabled' : 'clickable';

          return (
            <li
              key={activity.id}
              onClick={() => !isLocked && onSelectActivity(activity.id)}
              className={listItemClass}
            >
              <span className="activity-icon">{statusIcon}</span>
              <span className="activity-title">{activity.title} (Nível {activity.level})</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default DecompositionPage;