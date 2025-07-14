// src/pages/LoginPage.js

import React from 'react';
import { users } from '../data/mockData';

function LoginPage({ onLogin }) {
  return (
    // O container principal da tela de login
    <div className="container">
      <h1>Protótipo Decifra</h1>
      <h2>Selecione um perfil para iniciar:</h2>
      
      {/* Container que alinha os cards */}
      <div className="login-card-container">

        {/* --- Card da Aluna Ana (CORRIGIDO) --- */}
        {/* A função onClick foi movida para a div principal do card */}
        <div className="login-card" onClick={() => onLogin(users['ana@decifra.com'])}>
          {/* Todo o conteúdo agora está DENTRO do card clicável */}
          <div className="avatar student-avatar">A</div>
          <h3>Ana (Estudante)</h3>
          <p>Visualize as atividades, seu progresso e receba ajuda do mentor.</p>
        </div>

        {/* --- Card do Professor Carlos (CORRIGIDO) --- */}
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