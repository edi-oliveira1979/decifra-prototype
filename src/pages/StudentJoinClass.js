import React, { useState } from 'react';
import { joinClassByCode } from '../services/progressService';

export default function StudentJoinClass({ onJoined, onContinueSolo }) {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');

  const handleJoin = async () => {
    if (!code.trim()) return setMsg('Informe o código de convite.');
    try {
      const res = await joinClassByCode(code.trim());
      if (res?.joined) {
        setMsg('Vinculado com sucesso! Redirecionando...');
        setTimeout(() => {
          if (typeof onJoined === 'function') onJoined();
        }, 600);
      } else {
        setMsg(res?.message || 'Convite processado.');
      }
    } catch (e) {
      setMsg('Código inválido. Peça ao professor um novo.');
    }
  };

  return (
    <div className="container">
      <h1>Entrar em uma turma</h1>
      <p>Digite o código de convite fornecido pelo seu professor(a).</p>
      <input value={code} onChange={e => setCode(e.target.value)} placeholder="Ex.: DEC-7F3C" />
      <button onClick={handleJoin}>Entrar</button>
      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      <hr style={{ margin: '24px 0' }} />
      <p>Ou continue sem turma (modo individual / teste):</p>
      <button className="secondary-button" onClick={onContinueSolo}>Continuar sem turma</button>
    </div>
  );
}