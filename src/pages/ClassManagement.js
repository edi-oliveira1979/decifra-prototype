// src/pages/ClassManagement.js
import React, { useEffect, useState } from 'react';
import {
  fetchTeacherClasses,
  createTeacherClass,
  fetchClassInvites,
  createInviteForClass,
} from '../services/progressService';

export default function ClassManagement({ user, onBack }) {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // form nova turma
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('');
  const [newClassYear, setNewClassYear] = useState(new Date().getFullYear());
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const list = await fetchTeacherClasses();
        setClasses(list || []);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadInvites = async () => {
      if (!selectedClassId) {
        setInvites([]);
        return;
      }
      try {
        const list = await fetchClassInvites(selectedClassId);
        setInvites(Array.isArray(list) ? list : []);
      } catch (e) {
        setInvites([]);
      }
    };
    loadInvites();
  }, [selectedClassId]);

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      alert('Informe um nome para a turma.');
      return;
    }
    setIsCreating(true);
    try {
      const created = await createTeacherClass({
        name: newClassName.trim(),
        grade: newClassGrade.trim() || null,
        school_year: Number(newClassYear) || null,
      });
      // Atualiza lista local
      setClasses(prev => [...prev, created]);
      setSelectedClassId(created.id || '');
      // Se o backend já devolveu invite_code, insere no topo da lista de convites
      if (created.invite_code) {
        setInvites(prev => [{ code: created.invite_code, created_at: new Date().toISOString() }, ...(prev || [])]);
      }
      // limpa form
      setNewClassName('');
      setNewClassGrade('');
      setNewClassYear(new Date().getFullYear());
      alert('Turma criada com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Não foi possível criar a turma.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateInvite = async () => {
    if (!selectedClassId) return;
    try {
      const res = await createInviteForClass(selectedClassId);
      if (res && res.code) {
        setInvites(prev => [{ code: res.code, created_at: new Date().toISOString() }, ...(prev || [])]);
      }
    } catch (e) {
      console.error(e);
      alert('Não foi possível gerar um novo código.');
    }
  };

  return (
    <div className="container">
      <header className="section">
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
          <h1>Gestão de Turmas</h1>
          {typeof onBack === 'function' && (
            <button className="secondary-button" onClick={onBack}>⟵ Início do Professor</button>
          )}
        </div>
        <p className="muted">Crie novas turmas e gere códigos para seus alunos se vincularem.</p>
      </header>

      {/* Criar nova turma */}
      <section className="section">
        <h2>Criar nova turma</h2>
        <div className="card" style={{display:'grid', gap:8, maxWidth:520}}>
          <label>Nome da turma *</label>
          <input
            value={newClassName}
            onChange={e => setNewClassName(e.target.value)}
            placeholder="Ex.: 1º Ano B - Manhã"
          />
          <div style={{display:'grid', gridTemplateColumns:'1fr 160px', gap:8}}>
            <div>
              <label>Série / Ano</label>
              <input
                value={newClassGrade}
                onChange={e => setNewClassGrade(e.target.value)}
                placeholder="Ex.: 1ºB"
              />
            </div>
            <div>
              <label>Ano letivo</label>
              <input
                type="number"
                value={newClassYear}
                onChange={e => setNewClassYear(e.target.value)}
              />
            </div>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button disabled={isCreating} onClick={handleCreateClass}>
              {isCreating ? 'Criando...' : 'Criar turma'}
            </button>
            <button type="button" className="secondary-button" onClick={() => {
              setNewClassName(''); setNewClassGrade(''); setNewClassYear(new Date().getFullYear());
            }}>
              Limpar
            </button>
          </div>
        </div>
      </section>

      {/* Seletor de turma existente */}
      <section className="section">
        <h2>Turmas existentes</h2>
        {isLoading ? (
          <p>Carregando turmas...</p>
        ) : classes.length > 0 ? (
          <div style={{display:'grid', gap:8, maxWidth:520}}>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="class-selector"
            >
              <option value="">-- Selecione uma turma --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.grade ? ` - ${c.grade}` : ''}{c.school_year ? ` (${c.school_year})` : ''}
                </option>
              ))}
            </select>
            <div>
              <button disabled={!selectedClassId} onClick={handleGenerateInvite}>
                Gerar novo código de convite
              </button>
            </div>
          </div>
        ) : (
          <p>Nenhuma turma encontrada ainda.</p>
        )}
      </section>

      {/* Lista de convites */}
      <section className="section">
        <h2>Códigos de convite</h2>
        {!selectedClassId ? (
          <p className="muted">Selecione uma turma para visualizar ou gerar códigos.</p>
        ) : invites.length === 0 ? (
          <p>Nenhum código gerado ainda para esta turma.</p>
        ) : (
          <div className="card" style={{display:'grid', gap:8, maxWidth:520}}>
            {invites.map((inv, idx) => (
              <div key={`${inv.code}-${idx}`} style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
                <div>
                  <strong>{inv.code}</strong>
                  {inv.expires_at && <span className="muted"> • expira em {new Date(inv.expires_at).toLocaleString()}</span>}
                </div>
                <button
                  className="secondary-button"
                  onClick={() => navigator.clipboard?.writeText(inv.code)}
                >
                  Copiar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}