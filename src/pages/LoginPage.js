// src/pages/LoginPage.js
import React, { useState } from 'react';
import { users } from '../data/mockData';

// Componente da página de Login
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');

  // Função chamada ao tentar fazer login
  const handleLogin = () => {
    const user = users[email.toLowerCase()];
    if (user) {
      onLogin(user); // Se o usuário existe nos nossos dados, chama a função onLogin
    } else {
      alert('Usuário não encontrado. Tente ana@decifra.com ou carlos@decifra.com');
    }
  };

  return (
    <div className="container">
      <h1>Bem-vindo ao Protótipo Decifra</h1>
      <p>Para testar, use o e-mail <strong>ana@decifra.com</strong> para a visão do aluno ou <strong>carlos@decifra.com</strong> para a visão do professor.</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Digite seu e-mail"
      />
      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
}

export default LoginPage;