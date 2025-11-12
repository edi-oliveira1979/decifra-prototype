// src/pages/RecoverPassword.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function RecoverPassword({ onDone }) {
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // Se o client não estiver configurado, avisa o usuário (e evita crash)
  if (!supabase) {
    return <div className="container"><h1>Definir nova senha</h1><p>Configuração do Supabase ausente. Verifique REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY.</p></div>;
  }
  
  // Fallback: se o Supabase redirecionar com fragmento (#access_token), a sessão já estará ativa.
  // Se no futuro mudarmos para "code" PKCE, podemos chamar exchangeCodeForSession() aqui.

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      return setMsg('A nova senha deve ter pelo menos 8 caracteres.');
    }
    if (password !== password2) {
      return setMsg('As senhas não coincidem.');
    }
    setBusy(true);
    setMsg('');
    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMsg('Senha atualizada com sucesso! Redirecionando...');
      setTimeout(() => {
        if (typeof onDone === 'function') onDone(); // volta para login
      }, 900);
    } catch (err) {
      setMsg(err.message || 'Não foi possível atualizar a senha.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 460 }}>
      <h1>Definir nova senha</h1>
      <p className="muted">
        Você acessou por um link de recuperação. Informe sua nova senha abaixo.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
        <label>Nova senha</label>
        <input
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
        />
        <label>Confirmar nova senha</label>
        <input
          type="password"
          placeholder="Repita a nova senha"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          disabled={busy}
        />
        <button type="submit" disabled={busy}>
          {busy ? 'Salvando...' : 'Salvar nova senha'}
        </button>
        {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
      </form>
    </div>
  );
}