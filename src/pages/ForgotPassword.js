// src/pages/ForgotPassword.js
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ForgotPassword({ onSent, onBack }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      return setMsg('Informe um e-mail válido.');
    }
    if (!supabase) {
      return setMsg('Configuração do Supabase ausente. Verifique REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY.');
    }

    setBusy(true);
    setMsg('');
    try {
      // envia o e-mail de recuperação com redirect direto para nossa tela
      const redirectTo = `${window.location.origin}/recuperar-senha`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) throw error;
      setMsg('Enviamos um link para redefinir sua senha. Confira sua caixa de entrada.');
      // volta ao login depois de alguns segundos
      setTimeout(() => {
        if (typeof onSent === 'function') onSent();
      }, 1200);
    } catch (err) {
      setMsg(err.message || 'Não foi possível enviar o e-mail agora.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 460 }}>
      <h1>Esqueci minha senha</h1>
      <p className="muted">
        Informe seu e-mail e enviaremos um link para você definir uma nova senha.
      </p>
      <form onSubmit={handleSend} style={{ display: 'grid', gap: 10 }}>
        <label>E-mail</label>
        <input
          type="email"
          placeholder="seuemail@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={busy}>
            {busy ? 'Enviando...' : 'Enviar link de redefinição'}
          </button>
          {typeof onBack === 'function' && (
            <button type="button" className="secondary-button" onClick={onBack}>
              Voltar ao login
            </button>
          )}
        </div>
        {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
      </form>
    </div>
  );
}