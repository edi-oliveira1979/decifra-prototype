// src/App.js

import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import DecompositionPage from './pages/DecompositionPage';
import ActivityPage from './pages/ActivityPage';
import './App.css';
// CORREÇÃO: Não precisamos mais importar 'clearProgress' aqui
import { initializeProgress } from './services/progressService';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [currentActivityId, setCurrentActivityId] = useState(null);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('decifra-user', JSON.stringify(loggedInUser));
    if (loggedInUser.role === 'student') {
      initializeProgress();
      setView('student_dashboard');
    } else {
      setView('teacher_dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
    // REMOVIDO: clearProgress(); <-- ESTA LINHA ESTAVA CAUSANDO O ERRO.
    // A função de logout agora apenas gerencia a sessão, sem apagar os dados persistentes do aluno.
    localStorage.removeItem('decifra-user');
  };

  // Carrega o usuário salvo ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('decifra-user');
    if (savedUser) {
      // Precisamos inicializar o progresso aqui também para o caso do professor logar primeiro
      initializeProgress(); 
      handleLogin(JSON.parse(savedUser));
    }
  }, []);

  const goToPillarPage = () => setView('pillar_page');
  const goToActivityPage = (id) => {
      setCurrentActivityId(id);
      setView('activity_page');
  };
  const backToStudentDashboard = () => setView('student_dashboard');
  const backToPillarPage = () => {
      setCurrentActivityId(null);
      setView('pillar_page');
  }

  const renderContent = () => {
    if (view === 'login' || !user) {
      return <LoginPage onLogin={handleLogin} />;
    }

    switch (view) {
      case 'student_dashboard':
        return <StudentDashboard user={user} onSelectPillar={goToPillarPage} />;
      case 'pillar_page':
        return <DecompositionPage onSelectActivity={goToActivityPage} onBack={backToStudentDashboard} />;
      case 'activity_page':
        return <ActivityPage activityId={currentActivityId} onBack={backToPillarPage} />;
      case 'teacher_dashboard':
        return <TeacherDashboard user={user} />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <div>
      {user && (
        <div className="header">
          <p>Logado como: <strong>{user.name}</strong> ({user.role})</p>
          <button onClick={handleLogout}>Sair</button>
        </div>
      )}
      {renderContent()}
    </div>
  );
}

export default App;