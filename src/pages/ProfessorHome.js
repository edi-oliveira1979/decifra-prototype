import React from 'react';

export default function ProfessorHome({ onGoDashboard, onGoClasses, onGoSandbox }) {
  return (
    <div className="container">
      <h1>Bem-vindo, Professor(a)</h1>
      <div className="grid-2">
        <div className="card">
          <h3>📊 Dashboard de Progresso</h3>
          <p>Acompanhe o desempenho por turma, pilar e nível.</p>
          <button onClick={onGoDashboard}>Abrir</button>
        </div>
        <div className="card">
          <h3>🏫 Gestão de Turmas</h3>
          <p>Crie novas turmas e gere códigos de convite.</p>
          <button onClick={onGoClasses}>Abrir</button>
        </div>
        <div className="card">
          <h3>🧪 Experimentar como Aluno</h3>
          <p>Faça as atividades como seus alunos (tudo desbloqueado) e visualize o gabarito pedagógico.</p>
          <button onClick={onGoSandbox}>Abrir modo aluno</button>
        </div>
      </div>
    </div>
  );
}