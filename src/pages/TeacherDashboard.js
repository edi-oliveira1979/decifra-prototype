// src/pages/TeacherDashboard.js
import React, { useState, useEffect, useMemo } from 'react';
import { KeyRound } from 'lucide-react';
// Importa os serviços da API necessários para o dashboard do professor
import { 
  fetchTeacherClasses, 
  fetchStudentsByClass, 
  fetchProgressByClass 
} from '../services/progressService';

/**
 * Componente que exibe o "Índice de Autonomia" de um aluno.
 * A lógica de cores e texto permanece, recebendo a contagem de ajudas.
 * @param {{helpCount: number}} props
 */
function AutonomyIndex({ helpCount = 0 }) {
  let cl = "autonomy gold";
  if (helpCount >= 1 && helpCount <= 2) cl = "autonomy blue";
  if (helpCount >= 3) cl = "autonomy gray";

  const label =
    helpCount === 0 ? "Autonomia Alta" : helpCount <= 2 ? "Autonomia Média" : "Autonomia Baixa";

  return (
    <div className={cl} role="figure" aria-label={`Índice de Autonomia — ${label}`}>
      <span className="icon" aria-hidden="true">
        <KeyRound size={22} strokeWidth={2.4} />
      </span>
      <span>{label}</span>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL REFATORADO ---
function TeacherDashboard({ user, allActivities }) {
  // Estados para gerenciar os dados dinâmicos do dashboard
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [progressRecords, setProgressRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Efeito para buscar as turmas do professor quando o componente é montado.
  useEffect(() => {
    const loadClasses = async () => {
      setIsLoading(true);
      const fetchedClasses = await fetchTeacherClasses();
      setClasses(fetchedClasses);
      // Se houver apenas uma turma, seleciona-a automaticamente.
      if (fetchedClasses.length === 1) {
        setSelectedClassId(fetchedClasses[0].id);
      }
      setIsLoading(false);
    };
    loadClasses();
  }, []); // O array vazio [] garante que isso rode apenas uma vez.

  // Efeito para buscar os dados dos alunos e seus progressos sempre que uma nova turma for selecionada.
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setProgressRecords([]);
      return;
    };

    const loadClassData = async () => {
      setIsLoading(true);
      const [fetchedStudents, fetchedProgress] = await Promise.all([
        fetchStudentsByClass(selectedClassId),
        fetchProgressByClass(selectedClassId)
      ]);
      setStudents(fetchedStudents);
      setProgressRecords(fetchedProgress);
      setIsLoading(false);
    };
    loadClassData();
  }, [selectedClassId]); // Roda sempre que o `selectedClassId` mudar.

  // `useMemo` para processar e agregar os dados dos alunos de forma eficiente.
  // Este cálculo só será refeito se `students` ou `progressRecords` mudarem.
  const studentData = useMemo(() => {
    return students.map(student => {
      const studentProgress = progressRecords.filter(p => p.student_id === student.user_id);
      
      const totalHelpCount = studentProgress.reduce((sum, p) => sum + p.help_level, 0);
      
      let lastActivityTitle = 'Nenhuma atividade enviada';
      if (studentProgress.length > 0) {
        // Encontra a atividade com a data de envio mais recente
        const lastProgress = studentProgress.reduce((latest, current) => 
          new Date(latest.submitted_at) > new Date(current.submitted_at) ? latest : current
        );
        // TODO: Para performance, o ideal seria a API já retornar o título da atividade.
        // Por agora, usamos o `allActivities` que vem do App.js.
        const activityInfo = allActivities.find(a => a.id === lastProgress.activity_id);
        lastActivityTitle = activityInfo ? activityInfo.title : 'Atividade desconhecida';
      }

      return {
        id: student.user_id,
        name: student.full_name,
        helpCount: totalHelpCount,
        lastActivity: lastActivityTitle,
      };
    });
  }, [students, progressRecords, allActivities]);

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
  };

  return (
    <div className="container">
      <header className="section">
        <h1>Dashboard do Professor</h1>
        <p className="muted">
          Acompanhe a turma e identifique quem está mais autônomo(a) para intervir melhor.
        </p>
      </header>

      <section className="section">
        <h2>
          {classes.length > 0 ? 'Selecione uma Turma' : 'Nenhuma turma encontrada'}
        </h2>
        {classes.length > 0 && (
          <select value={selectedClassId} onChange={handleClassChange} className="class-selector">
            <option value="">-- Escolha uma turma --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} - {c.grade} ({c.school_year})</option>
            ))}
          </select>
        )}
      </section>

      {selectedClassId && (
        <section className="section">
          <h2>Turma — Índice de Autonomia</h2>
          {isLoading ? (
            <p>Carregando dados da turma...</p>
          ) : (
            <div className="grid sm-2 md-3">
              {studentData.length > 0 ? studentData.map((st) => (
                <div key={st.id} className="card clickable" role="region" aria-label={st.name}>
                  <div className="card-title">{st.name}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <div>
                      <div className="muted">Última atividade:</div>
                      <div style={{ fontWeight: 600 }}>{st.lastActivity}</div>
                    </div>
                    <AutonomyIndex helpCount={st.helpCount} />
                  </div>
                </div>
              )) : <p>Nenhum aluno encontrado nesta turma.</p>}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default TeacherDashboard;