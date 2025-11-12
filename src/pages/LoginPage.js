// src/pages/LoginPage.js
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

// A função onNavigateToRegister foi adicionada às props
// para permitir a navegação para a tela de cadastro.
function LoginPage({ onLoginSuccess, onNavigateToRegister, onNavigateToForgot }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // A lógica de handleLogin foi simplificada para focar apenas na autenticação.
  // A busca de perfil agora é responsabilidade do App.js.
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (!supabase) {
        throw new Error('Supabase não configurado. Verifique o .env.local');
      }
      
      const { data, error: supaErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supaErr) throw supaErr;
      
      // A chamada de sucesso agora passa apenas os dados da sessão.
      onLoginSuccess({ access_token: data.session.access_token });

    } catch (err) {
      console.error('Erro de login:', err);
      // Mapeia o erro comum do Supabase para uma mensagem mais amigável.
      if (err.message.includes('Invalid login credentials')) {
        setError('E-mail ou senha inválidos.');
      } else {
        setError(err.message || 'Falha no login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- ESTRUTURA JSX COMPLETAMENTE REFATORADA ---
  // O layout agora usa um card centralizado e remove os botões de teste.
  return (
    <div className="container login-card-container">
      <div className="login-card">
        <h1>Decifra</h1>
        <h2 className="muted" style={{ marginTop: '-20px', marginBottom: '30px' }}>
          Faça seu login para continuar
        </h2>
      
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu e-mail"
            required
            disabled={isLoading || !supabase}
            autoComplete="email"
            style={{ width: '100%', marginBottom: '15px' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            required
            disabled={isLoading || !supabase}
            autoComplete="current-password"
            style={{ width: '100%', marginBottom: '20px' }}
          />
          {error && <p className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
          <button type="submit" disabled={isLoading || !supabase} style={{ width: '100%' }}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Link para navegar para a página de cadastro */}
        <p style={{ marginTop: 20, fontSize: 14, textAlign: 'center' }}>
          Ainda não tem uma conta?{' '}
          <button
            type="button"
            onClick={onNavigateToRegister}
            style={{ background:'none', border:'none', color:'var(--cor-primaria)', fontWeight:'bold', cursor:'pointer', padding:0 }}
          >
            Cadastre-se
          </button>
        </p>

        {/* NOVO BLOCO: link "Esqueci minha senha" */}
        <p style={{ marginTop: 10, fontSize: 13, textAlign: 'center' }}>
          <button
            type="button"
            onClick={onNavigateToForgot}
            style={{ background:'none', border:'none', color:'var(--cor-primaria)', fontWeight:'bold', cursor:'pointer', textDecoration:'underline', padding:0 }}
          >
            Esqueci minha senha
          </button>
        </p>       
      </div>
    </div>
  );
}

export default LoginPage;