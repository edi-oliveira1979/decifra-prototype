// src/pages/ActivityListPage.js

import React, { useState, useEffect } from 'react';
// Importamos os ícones corretos do protótipo, incluindo o RotateCw para o estado "parcial"
import { CheckCircle2, ChevronRight, Lock, RotateCw } from 'lucide-react';
import { fetchActivities } from '../services/progressService';

// --- Ícones de Status ATUALIZADOS ---
// O mapa agora inclui o estado 'parcial' e usa as classes CSS corretas do protótipo.
const statusIconMap = {
  pending:  { Icon: ChevronRight, className: "icon-pending" }, // Não iniciado
  partial:  { Icon: RotateCw,     className: "icon-warning" }, // Iniciado, mas não concluído
  done:     { Icon: CheckCircle2, className: "icon-success" }, // Concluído
  locked:   { Icon: Lock,         className: "status--locked"   }, // Mantido para consistência
};

// --- Componente de Linha de Atividade REFATORADO ---
// Nenhuma mudança no JSX, apenas no mapa de ícones que ele consome.
function ActivityRow({ activity, status = "pending", onClick }) {
  const { Icon, className } = statusIconMap[status] ?? statusIconMap.pending;

  return (
    // A classe 'activity-list' e 'li' do protótipo são representadas aqui pela estrutura de grid do App.css
    <li
      className={`item-row clickable`}
      onClick={onClick}
      role="button"
      aria-label={activity.title}
    >
      <span className="activity-title">{activity.title}</span>
      <span className="activity-icon" aria-hidden="true">
        <Icon size={24} className={className} />
      </span>
    </li>
  );
}


function ActivityListPage({ pillarId, level, pillars, levels, progress, onSelectActivity, onBack }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const pillar = pillars.find(p => p.id === pillarId) || {};
  const levelName = levels[level] || `Nível ${level}`;
  
  const progressData = progress.activityData;

  useEffect(() => {
    const loadActivities = async () => {
      if (!pillarId || !level) return;
      setIsLoading(true);
      const fetchedActivities = await fetchActivities({ pillarId, levelId: level });
      setActivities(fetchedActivities);
      setIsLoading(false);
    };

    loadActivities();
  }, [pillarId, level]);

  return (
    <div className="container">
      <button onClick={onBack} className="back-button">&larr; Voltar para Níveis</button>
      <header className="section">
        <h1>{pillar.name} - {levelName}</h1>
        <p className="muted">Selecione uma atividade para começar.</p>
      </header>

      <section className="section">
        {/* Usamos a tag `ul` e a classe `activity-list` para corresponder ao protótipo */}
        <ul className="activity-list">
          {isLoading ? (
            <p>Carregando atividades...</p>
          ) : activities.length === 0 ? (
            <p>Nenhuma atividade encontrada para este nível.</p>
          ) : (
            activities.map(activity => {
              const activityProgress = progressData?.[activity.id];
              
              // --- LÓGICA DE STATUS ATUALIZADA ---
              // Agora diferenciamos entre não iniciado ('pending') e iniciado mas não concluído ('partial').
              let status = 'pending'; // Padrão: não iniciado
              if (activityProgress) {
                if (activityProgress.status === 'done') {
                  status = 'done'; // Concluído
                } else {
                  status = 'partial'; // Tem progresso salvo, mas não está 'done'
                }
              }

              return (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                  status={status}
                  onClick={() => onSelectActivity(activity.id)}
                />
              );
            })
          )}
        </ul>
      </section>
    </div>
  );
}

export default ActivityListPage;