// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

function RegisterPage({ onNavigateToLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Estudante');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Novo estado para controlar se o cadastro foi bem-sucedido
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase não configurado. Verifique o .env.local');
      }

      const { error: supaErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (supaErr) throw supaErr;

      // --- LÓGICA DE FEEDBACK ATUALIZADA ---
      // Define a mensagem de sucesso e atualiza o estado para travar o formulário.
      setMessage('Cadastro realizado com sucesso! Verifique sua caixa de entrada (e a pasta de spam) para confirmar seu e-mail e ativar sua conta.');
      setIsSuccess(true);

    } catch (err) {
      console.error('Erro de cadastro:', err);
      setError(err.message || 'Falha no cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container login-card-container">
      <div className="login-card">
        <h1>Crie sua Conta</h1>
        <h2 className="muted" style={{ marginTop: '-20px', marginBottom: '30px' }}>
          Junte-se à comunidade Decifra
        </h2>
      
        <form onSubmit={handleRegister} className="login-form">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nome Completo"
            required
            // Desabilita o campo após o sucesso para evitar reenvio
            disabled={isLoading || isSuccess || !supabase}
            autoComplete="name"
            style={{ width: '100%', marginBottom: '15px' }}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu e-mail"
            required
            disabled={isLoading || isSuccess || !supabase}
            autoComplete="email"
            style={{ width: '100%', marginBottom: '15px' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Crie uma senha"
            required
            disabled={isLoading || isSuccess || !supabase}
            autoComplete="new-password"
            style={{ width: '100%', marginBottom: '15px' }}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isLoading || isSuccess || !supabase}
            required
            style={{ width: '100%', marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}
          >
            <option value="Estudante">Eu sou um(a) Estudante</option>
            <option value="Professor">Eu sou um(a) Professor(a)</option>
          </select>

          {error && <p className="error-message" style={{ color: 'var(--cor-perigo)', marginBottom: '15px' }}>{error}</p>}
          {message && <p className="success-message" style={{ color: 'var(--cor-sucesso)', marginBottom: '15px', fontWeight: 'bold' }}>{message}</p>}
          
          {/* O botão fica desabilitado permanentemente após o sucesso */}
          <button type="submit" disabled={isLoading || isSuccess || !supabase} style={{ width: '100%' }}>
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '14px', textAlign: 'center' }}>
          Já tem uma conta?{' '}
          <span
            onClick={onNavigateToLogin}
            style={{ color: 'var(--cor-primaria)', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Faça login
          </span>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;