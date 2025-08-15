// src/pages/TeacherDashboard.js

import React from 'react';
import { levels as levelNames, pillars } from '../data/mockData'; 
import { CheckCircle2, RotateCw, KeyRound } from 'lucide-react';

// --- Componentes Auxiliares ---

const AutonomyIcon = ({ helps }) => {
    if (helps === null || helps === undefined) return null;
    let colorClass = 'grey';
    if (helps === 0) colorClass = 'gold';
    if (helps > 0 && helps <= 2) colorClass = 'blue';
    return (
        <span className={`autonomy-icon ${colorClass}`}>
            <KeyRound size={16} />
            {helps > 0 && <span>{helps}</span>}
        </span>
    );
};

const LevelSummary = ({ levelsData }) => {
    if (!levelsData || levelsData.length === 0) {
        return <div className="level-summary-placeholder">Nenhuma atividade iniciada.</div>;
    }
    return (
        <div className="level-summary">
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
            })}
        </div>
    );
};

// Função auxiliar para processar dados da turma
const processClassData = (allActivities, allStudentsProgress) => {
    // Mock de dados de estudantes para demonstração
    const mockStudents = [
        { id: 'user_ana_123', name: 'Ana Silva' },
        { id: 'user_joao_456', name: 'João Santos' },
        { id: 'user_maria_789', name: 'Maria Oliveira' }
    ];

    return mockStudents.map(student => {
        const studentProgress = allStudentsProgress || { activityData: {} };
        const pillarData = {};

        pillars.forEach(pillar => {
            const pillarActivities = allActivities.filter(a => a.pillar === pillar.id);
            const completed = pillarActivities.filter(a => 
                studentProgress.activityData[a.id]?.status === 'completo' || 
                studentProgress.activityData[a.id]?.status === 'parcial'
            );

            let overallLevel = 0;
            const levels = [];

            if (completed.length > 0) {
                overallLevel = Math.max(...completed.map(a => a.level));
                
                // Agrupar por nível
                const levelGroups = {};
                completed.forEach(activity => {
                    if (!levelGroups[activity.level]) {
                        levelGroups[activity.level] = [];
                    }
                    levelGroups[activity.level].push(activity);
                });

                // Processar cada nível
                Object.keys(levelGroups).forEach(level => {
                    const levelNum = parseInt(level);
                    const levelActivities = levelGroups[level];
                    const bestActivity = levelActivities.find(a => 
                        studentProgress.activityData[a.id]?.status === 'completo'
                    ) || levelActivities[0];

                    levels.push({
                        levelNumber: levelNum,
                        bestPerformanceStatus: studentProgress.activityData[bestActivity.id]?.status || 'parcial',
                        bestAutonomy: studentProgress.activityData[bestActivity.id]?.helpLevel || 0
                    });
                });
            }

            pillarData[pillar.id] = {
                overallLevel,
                levels: levels.sort((a, b) => a.levelNumber - b.levelNumber)
            };
        });

        return {
            studentId: student.id,
            studentName: student.name,
            pillars: pillarData
        };
    });
};

function TeacherDashboard({ user, allActivities, studentProgress }) {
    // Processar dados da turma
    const classData = processClassData(allActivities, studentProgress);
    
    if (!classData || classData.length === 0) {
        return <div className="container"><h2>Carregando dados da turma...</h2></div>;
    }

    return (
        <div className="container">
            <h1>Dashboard do Professor {user.name}</h1>
            <h2>Acompanhamento da Turma</h2>
            <div className="teacher-grid">
                {classData.map(student => (
                    <div key={student.studentId} className="student-card">
                        <div className="student-header">
                            <div className="avatar teacher-avatar">{student.studentName.charAt(0)}</div>
                            <h3>{student.studentName}</h3>
                        </div>
                        <div className="pillars-quadrant">
                            {pillars.map(pillar => {
                                const pillarData = student.pillars[pillar.id];
                                if (!pillarData) return null;
                                return (
                                    <div key={pillar.id} className="quadrant">
                                        <h4>{pillar.name}</h4>
                                        <div className="quadrant-data main-level">
                                            <span>Nível Geral:</span>
                                            <strong>{levelNames[pillarData.overallLevel]}</strong>
                                        </div>
                                        <LevelSummary levelsData={pillarData.levels} />
                                        {pillarData.levels.length > 0 && (
                                            <div className="autonomy-display">
                                                <AutonomyIcon helps={pillarData.levels[pillarData.levels.length - 1]?.bestAutonomy} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TeacherDashboard;