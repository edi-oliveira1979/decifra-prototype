// src/pages/TeacherDashboard.js

//teste de PR e commit de novo aaaa

import React, { useState, useEffect, useMemo } from 'react';
// Importamos os ícones que serão usados no novo LevelSummary
import { CheckCircle2, RotateCw } from 'lucide-react';
import { 
  fetchTeacherClasses, 
  fetchStudentsByClass, 
  fetchProgressByClass 
} from '../services/progressService';

// --- SUBCOMPONENTE REINTRODUZIDO DO PROTÓTIPO ---
// Renderiza os ícones de progresso para cada nível dentro de um pilar.
const LevelSummary = ({ levelsData }) => {
    if (!levelsData || levelsData.length === 0) {
        return <div className="level-summary-placeholder">Nenhuma atividade iniciada.</div>;
    }
    return (
        <div className="level-summary">
            {/* CORREÇÃO: Adicionamos .filter(Boolean) para remover 'null's antes da renderização */}
            {levelsData.map(level => {
                let icon = null;
                if (level.bestPerformanceStatus === 'completo') {
                    icon = <CheckCircle2 size={16} className="icon-success" />;
                } else if (level.bestPerformanceStatus === 'parcial') {
                    icon = <RotateCw size={16} className="icon-warning" />;
                }
                
                if (icon) {
                    return (
                        <div key={level.levelNumber} className="level-dot" title={`Nível ${level.levelNumber}`}>
                            {icon} L{level.levelNumber}
                        </div>
                    );
                }
                return null;
            }).filter(Boolean)}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL REFATORADO ---
function TeacherDashboard({ user, pillars, levels: levelNames, allActivities, onBack }) {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [progressRecords, setProgressRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Efeito para buscar as turmas (sem alterações)
  useEffect(() => {
    const loadClasses = async () => {
      setIsLoading(true);
      const fetchedClasses = await fetchTeacherClasses();
      setClasses(fetchedClasses);
      if (fetchedClasses.length === 1) {
        setSelectedClassId(fetchedClasses[0].id);
      }
      setIsLoading(false);
    };
    loadClasses();
  }, []);

  // Efeito para buscar os dados da turma (sem alterações)
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
  }, [selectedClassId]);

  // --- LÓGICA DE PROCESSAMENTO DE DADOS TOTALMENTE REFATORADA ---
  // Agora calcula o progresso detalhado por pilar e nível para cada aluno.
  const studentData = useMemo(() => {
    return students.map(student => {
      // o payload de alunos tem { id, full_name }
      const studentProgress = progressRecords.filter(p => p.student_id === student.id);
      const progressMap = studentProgress.reduce((acc, p) => {
        acc[p.activity_id] = p;
        return acc;
      }, {});

      const pillarsData = {};
      pillars.forEach(pillar => {
        const activitiesInPillar = allActivities.filter(a => a.pillar_id === pillar.id);
        if (activitiesInPillar.length === 0) return;

        const maxLevel = Math.max(...activitiesInPillar.map(a => a.level_id), 0);
        const levelsSummary = [];
        let overallLevel = 0;

        for (let i = 1; i <= maxLevel; i++) {
          const activitiesInLevel = activitiesInPillar.filter(a => a.level_id === i);
          if (activitiesInLevel.length === 0) continue;

          const doneActivities = activitiesInLevel.filter(a => progressMap[a.id]?.status === 'done');
          const partialActivities = activitiesInLevel.filter(a => progressMap[a.id] && progressMap[a.id]?.status !== 'done');
          
          let bestPerformanceStatus = 'nao_iniciado';
          if (doneActivities.length > 0) bestPerformanceStatus = 'completo';
          else if (partialActivities.length > 0) bestPerformanceStatus = 'parcial';

          if (bestPerformanceStatus !== 'nao_iniciado') {
            levelsSummary.push({ levelNumber: i, bestPerformanceStatus });
          }
          if (bestPerformanceStatus === 'completo') {
            overallLevel = Math.max(overallLevel, i);
          }
        }
        
        if (levelsSummary.length > 0) {
            pillarsData[pillar.id] = { overallLevel, levels: levelsSummary };
        }
      });

      return {
        studentId: student.id,
        studentName: student.full_name,
        pillars: pillarsData,
      };
    });
  }, [students, progressRecords, pillars, allActivities]);

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
  };

  return (
    <div className="container">
      <header className="section">
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
          <h1>Dashboard do Professor</h1>
          {typeof onBack === 'function' && (
            <button className="secondary-button" onClick={onBack}>⟵ Início do Professor</button>
          )}
        </div>
        <h2 className="muted">
          Acompanhamento da Turma
        </h2>
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
          {/* --- JSX REFATORADO PARA USAR O LAYOUT DE QUADRANTES DO PROTÓTIPO --- */}
          {isLoading ? (
            <p>Carregando dados da turma...</p>
          ) : (
            <div className="teacher-grid">
              {studentData.length > 0 ? studentData.map((student) => (
                <div key={student.studentId} className="student-card">
                  <div className="student-header">
                      <div className="avatar teacher-avatar">{student.studentName.charAt(0)}</div>
                      <h3>{student.studentName}</h3>
                  </div>
                  <div className="pillars-quadrant">
                      {pillars.map(pillar => {
                          const pillarData = student.pillars[pillar.id];
                          // Se o aluno não tiver progresso neste pilar, o quadrante não é renderizado.
                          if (!pillarData) return <div key={pillar.id} className="quadrant empty"><h4>{pillar.name}</h4><span>-</span></div>;
                          
                          return (
                              <div key={pillar.id} className="quadrant">
                                  <h4>{pillar.name}</h4>
                                  <div className="quadrant-data main-level">
                                      <span>Nível Geral:</span>
                                      <strong>{levelNames[pillarData.overallLevel]}</strong>
                                  </div>
                                  <LevelSummary levelsData={pillarData.levels} />
                              </div>
                          )
                      })}
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