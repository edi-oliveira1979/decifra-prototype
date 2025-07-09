// src/pages/StudentDashboard.js
import React from 'react';
import { activities } from '../data/mockData';

// Dashboard do Aluno, que mostra as atividades disponíveis
function StudentDashboard({ user, onSelectActivity }) {
  return (
    <div className="container">
      <h1>Olá, {user.name}!</h1>
      <h2>Suas Atividades</h2>
      <ul className="activity-list">
        {activities.map(activity => (
          <li key={activity.id} onClick={() => onSelectActivity(activity.id)}>
            {activity.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StudentDashboard;