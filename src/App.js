// src/App.js

import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import LevelSelectionPage from './pages/LevelSelectionPage'; 
import DecompositionPage from './pages/DecompositionPage';
import ActivityPage from './pages/ActivityPage';
import './App.css';
import { initializeProgress } from './services/progressService';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); 
  const [currentPillarId, setCurrentPillarId] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentActivityId, setCurrentActivityId] = useState(null);
  
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('decifra-user', JSON.stringify(loggedInUser));
    // A verificação aqui usa 'Estudante', que é o correto.
    if (loggedInUser.role === 'Estudante') {
      initializeProgress();
      setView('student_dashboard');
    } else {
      setView('teacher_dashboard');
    }
  };
  
  const handleLogout = () => {
    setUser(null);
    setView('login');
    localStorage.removeItem('decifra-user');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('decifra-user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      initializeProgress();
      
      // --- CORREÇÃO APLICADA AQUI ---
      // A verificação agora usa 'Estudante' (maiúsculo), o que resolve o bug.
      setView(parsedUser.role === 'Estudante' ? 'student_dashboard' : 'teacher_dashboard');
    }
  }, []);
  
  const goToLevelSelection = (pillarId) => {
    if (pillarId === 'decomposicao') {
      setCurrentPillarId(pillarId);
      setView('level_selection');
    }
  };
  
  const goToActivityList = (levelNumber) => {
    setCurrentLevel(levelNumber);
    setView('activity_list'); 
  };

  const goToActivityPage = (activityId) => {
      setCurrentActivityId(activityId);
      setView('activity_page');
  };
  
  const backToStudentDashboard = () => setView('student_dashboard');
  const backToLevelSelection = () => setView('level_selection');
  const backToActivityList = () => {
    setCurrentActivityId(null);
    setView('activity_list');
  };

  const renderContent = () => {
    if (!user) {
      return <LoginPage onLogin={handleLogin} />;
    }
    
    switch (view) {
      case 'student_dashboard':
        return <StudentDashboard user={user} onSelectPillar={goToLevelSelection} />;
      case 'level_selection':
        return <LevelSelectionPage pillarId={currentPillarId} onSelectLevel={goToActivityList} onBack={backToStudentDashboard} />;
      case 'activity_list':
        return <DecompositionPage level={currentLevel} onSelectActivity={goToActivityPage} onBack={backToLevelSelection} />;
      case 'activity_page':
        return <ActivityPage activityId={currentActivityId} onBack={backToActivityList} />;
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
      <div className="container">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;