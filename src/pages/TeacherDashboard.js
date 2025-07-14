// src/pages/TeacherDashboard.js

import React from 'react';
// CORREÇÃO: Importamos 'levels' e 'pillars' da sua fonte original, o mockData.js
import { levels as levelNames, pillars } from '../data/mockData'; 
import { getTeacherDashboardData } from '../services/progressService';
import { CheckCircle2, RotateCw } from 'lucide-react';
//import { CheckCircle2, RotateCw, KeyRound } from 'lucide-react';

//const AutonomyIcon = ({ helps }) => {
//    if (helps === null || helps === undefined) return null;
//    let colorClass = 'grey';
//    if (helps === 0) colorClass = 'gold';
//    if (helps > 0 && helps <= 2) colorClass = 'blue';
//    return (
//        <span className={`autonomy-icon ${colorClass}`}>
//            <KeyRound size={16} />
//            {helps > 0 && <span>{helps}</span>}
//        </span>
//    );
//};

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

function TeacherDashboard({ user }) {
    const classData = getTeacherDashboardData();

    return (
        <div className="container">
            <h1>Dashboard do Professor</h1>
            <h2>Acompanhamento da Turma</h2>
            <div className="teacher-grid">
                {classData.map(student => (
                    <div key={student.studentId} className="student-card">
                        <div className="student-header">
                            <div className="avatar teacher-avatar">{student.studentName.charAt(0)}</div>
                            <h3>{student.studentName}</h3>
                        </div>
                        <div className="pillars-quadrant">
                            {/* CORREÇÃO: Agora 'pillars' existe e pode ser usado aqui */}
                            {pillars.map(pillar => {
                                const pillarData = student.pillars[pillar.id];
                                if (!pillarData) return null; // Adiciona segurança se os dados do pilar não existirem
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
                ))}
            </div>
        </div>
    );
}

export default TeacherDashboard;