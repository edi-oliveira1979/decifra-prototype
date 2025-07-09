// src/pages/TeacherDashboard.js
import React from 'react';
import { mockProgress } from '../data/mockData';

// Dashboard do Professor, que mostra o progresso da turma
function TeacherDashboard({ user }) {
  return (
    <div className="container">
      <h1>Dashboard do Professor {user.name}</h1>
      <h2>Progresso da Turma</h2>
      <ul className="progress-list">
        {mockProgress.map((progress, index) => (
          <li key={index}>
            <strong>Aluno:</strong> {progress.studentName} <br />
            <strong>Atividade:</strong> {progress.activityTitle} <br />
            <strong>Status:</strong> {progress.status} <br />
            <strong>Interações de Ajuda:</strong> {progress.interactions}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TeacherDashboard;