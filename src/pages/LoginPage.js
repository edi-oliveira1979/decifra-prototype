// src/pages/LoginPage.js
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Função chamada ao clicar no botão "Entrar" do formulário
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (!supabase) {
        throw new Error(
          'Configuração do Supabase ausente. Verifique REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY em .env.local e reinicie o servidor.'
        );
      }
      
      const { data, error: supaErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (supaErr) {
        // Mensagem amigável para a causa mais comum deste erro:
        if (String(supaErr.message || '').toLowerCase().includes('invalid api key')) {
          throw new Error(
            'Invalid API key: confira no Supabase → Settings → API se a URL do projeto e a "anon public" key estão corretas no seu .env.local. Depois reinicie o npm start.\n' +
            'Dicas: a URL deve parecer com https://<seu-ref>.supabase.co e a anon key começa com "ey...".'
          );
        }
        throw supaErr;
      }
      if (!data || !data.session || !data.session.access_token || !data.user) {
        throw new Error('Resposta de autenticação inválida.');
      }

      const access_token = data.session.access_token;
      const u = data.user;
      const name =
        (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) ||
        u.email;
      const role = (u.user_metadata && u.user_metadata.role) || 'Estudante';

      onLoginSuccess({
        access_token,
        user: { id: u.id, email: u.email, name, role },
      });
    } catch (err) {
      console.error('Erro Supabase login:', err);
      setError(err.message || 'Falha no login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para preencher credenciais de teste rapidamente
  const fillTestCredentials = (userType) => {
    if (userType === 'student') {
      setEmail('ana@decifra.com');
      setPassword('123456');
    } else if (userType === 'teacher') {
      setEmail('carlos@decifra.com');
      setPassword('123456');
    }
  };

  return (
    <div className="container">
      <h1>Protótipo Decifra</h1>
      <h2>Faça seu login para continuar</h2>

      {/* Aviso amigável quando o Supabase não está configurado */}
      {!supabase && (
        <div
          style={{
            margin: '16px 0',
            padding: '12px',
            border: '1px solid #f0ad4e',
            borderRadius: 8,
            background: '#fff8e1'
          }}
        >
          <strong>Atenção:</strong> Supabase não configurado.<br />
          Defina <code>REACT_APP_SUPABASE_URL</code> e <code>REACT_APP_SUPABASE_ANON_KEY</code> no <code>.env.local</code> (frontend) e reinicie o <code>npm start</code>.
        </div>
      )} 

      {/* Botões de teste rápido */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          type="button" 
          onClick={() => fillTestCredentials('student')}
          disabled={isLoading || !supabase}
          style={{ marginRight: '10px', padding: '5px 10px', fontSize: '12px' }}
        >
          Testar como Ana (Estudante)
        </button>
        <button 
          type="button" 
          onClick={() => fillTestCredentials('teacher')}
          disabled={isLoading || !supabase}
          style={{ padding: '5px 10px', fontSize: '12px' }}
        >
          Testar como Carlos (Professor)
        </button>
      </div>
      
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu e-mail"
          required
          disabled={isLoading || !supabase}
          autoComplete="email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Sua senha"
          required
          disabled={isLoading || !supabase}
          autoComplete="current-password"
        />
        {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
+        <button type="submit" disabled={isLoading || !supabase}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      
      {/* Dica: crie/gerencie usuários no Supabase Auth; role recomendada em user_metadata.role */}
      {/* Futuramente, aqui teremos um link para a página de cadastro */}
    </div>
  );
}

export default LoginPage;