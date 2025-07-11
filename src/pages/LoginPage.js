// src/pages/LoginPage.js
import React from 'react';
import { users } from '../data/mockData';

// Nova página de login com cards clicáveis
function LoginPage({ onLogin }) {
  return (
    <div className="container">
      <h1>Protótipo Decifra</h1>
      <h2>Selecione um perfil para iniciar:</h2>
      <div className="login-card-container">
        {/* Card para a Aluna Ana */}
        <div className="login-card" onClick={() => onLogin(users['ana@decifra.com'])}>
          <div className="avatar student-avatar">A</div>
          <h3>Ana (Aluna)</h3>
          <p>Visualize as atividades, seu progresso e receba ajuda do mentor.</p>
        </div>

        {/* Card para o Professor Carlos */}
        <div className="login-card" onClick={() => onLogin(users['carlos@decifra.com'])}>
          <div className="avatar teacher-avatar">C</div>
          <h3>Carlos (Professor)</h3>
          <p>Acesse o dashboard da turma e acompanhe o desenvolvimento dos alunos.</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;