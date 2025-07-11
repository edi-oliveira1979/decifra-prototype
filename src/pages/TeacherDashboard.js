// src/pages/TeacherDashboard.js
import React from 'react';
import { levels, pillars } from '../data/mockData';
// Importamos o novo serviço que busca todos os dados para o dashboard
import { getTeacherDashboardData } from '../services/progressService';

// Componente para renderizar os ícones de nível
const LevelStars = ({ level }) => {
    // Cria um array com 'level' estrelas
    const stars = Array.from({ length: level }, (_, i) => i);
    if (level === 0) return <span className="level-icon no-level">--</span>;
    return (
        <span className="level-icon">
            {stars.map(i => '★')}
        </span>
    );
};

// O novo dashboard do professor, com cards
function TeacherDashboard({ user }) {
    const classData = getTeacherDashboardData();

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
                            {pillars.map(pillar => (
                                <div key={pillar.id} className="quadrant">
                                    <h4>{pillar.name}</h4>
                                    <div className="quadrant-data">
                                        Nível: <LevelStars level={student.pillars[pillar.id].level} />
                                    </div>
                                    <div className="quadrant-data">
                                        Ajudas: <span className="help-icon">{student.pillars[pillar.id].helps} 💡</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TeacherDashboard;