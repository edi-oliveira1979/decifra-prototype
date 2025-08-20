// src/pages/ActivityListPage.js (Anteriormente DecompositionPage.js)

import React, { useState, useEffect } from 'react';
import { ScanLine, CheckCircle2, Lock } from 'lucide-react';
// Importa o serviço para buscar atividades
import { fetchActivities } from '../services/progressService';

// Mapa de ícones de status para clareza
const statusIconMap = {
  pending:  { Icon: ScanLine,    className: "status-icon status--pending",  label: "Pendente" },
  done:     { Icon: CheckCircle2, className: "status-icon status--complete", label: "Concluído" },
  locked:   { Icon: Lock,        className: "status-icon status--locked",   label: "Bloqueado"},
};

// Componente de linha de atividade (sem grandes alterações)
function ActivityRow({ activity, status = "pending", onClick }) {
  const { Icon, className, label } = statusIconMap[status] ?? statusIconMap.pending;

  return (
    <div
      className={`item-row ${status !== 'locked' ? 'clickable' : ''}`}
      onClick={status !== 'locked' ? onClick : undefined}
      role="button"
      aria-label={`${activity.title} — ${label}`}
    >
      <div className="item-meta">
        <div className="item-title">{activity.title}</div>
        <span className="muted">{label}</span>
      </div>
      <div title={label} aria-hidden="true" className={className}>
        <Icon size={22} strokeWidth={2.4} />
      </div>
    </div>
  );
}

// --- ALTERAÇÃO PRINCIPAL: Componente agora é genérico e busca seus próprios dados ---
function ActivityListPage({ pillarId, level, pillars, levels, progress, onSelectActivity, onBack }) {
  // Estado local para armazenar as atividades desta página
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Busca as informações do pilar atual para exibir o nome correto
  const pillar = pillars.find(p => p.id === pillarId) || {};
  const levelName = levels[level] || `Nível ${level}`;
  
  const progressData = progress.activityData;

  // useEffect para buscar as atividades específicas quando o pilar ou nível mudarem.
  useEffect(() => {
    const loadActivities = async () => {
      if (!pillarId || !level) return;
      setIsLoading(true);
      const fetchedActivities = await fetchActivities({ pillarId, levelId: level });
      setActivities(fetchedActivities);
      setIsLoading(false);
    };

    loadActivities();
  }, [pillarId, level]); // Dependências garantem a busca quando o usuário navegar

  return (
    <div className="container">
      <button onClick={onBack} className="back-button">&larr; Voltar para Níveis</button>
      <header className="section">
        {/* Título e descrição agora são dinâmicos */}
        <h1>{pillar.name} - {levelName}</h1>
        <p className="muted">Selecione uma atividade para começar.</p>
      </header>

      <section className="section">
        <div className="grid">
          {isLoading ? (
            <p>Carregando atividades...</p>
          ) : activities.length === 0 ? (
            <p>Nenhuma atividade encontrada para este nível.</p>
          ) : (
            // O mapeamento agora é feito sobre o estado 'activities' local
            activities.map(activity => {
              const activityProgress = progressData?.[activity.id];
              const status = activityProgress?.status || 'pending';

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
        </div>
      </section>
    </div>
  );
}

export default ActivityListPage;