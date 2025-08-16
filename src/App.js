// src/App.js

import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import LevelSelectionPage from './pages/LevelSelectionPage'; 
import DecompositionPage from './pages/DecompositionPage';
import ActivityPage from './pages/ActivityPage';
import './App.css';
import { fetchAllActivities, saveActivityProgress, setAuthToken } from './services/progressService'; 
import { getLocalProgress, saveLocalProgress, resetLocalProgress } from './services/localStorageService';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); 
  const [allActivities, setAllActivities] = useState([]);
  const [studentProgress, setStudentProgress] = useState({ activityData: {} });
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPillarId, setCurrentPillarId] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentActivityId, setCurrentActivityId] = useState(null);
  
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      console.log('Carregando dados iniciais...');
      
      try {
        const activities = await fetchAllActivities();
        console.log(`${activities.length} atividades carregadas`);
        setAllActivities(activities);
        
        // Verificar se há usuário salvo no localStorage
        const safeParse = (s) => {
          try { return JSON.parse(s); } catch { return null; }
        };
        const savedUser = safeParse(localStorage.getItem('decifra-user'));
        //const savedToken = localStorage.getItem('decifra-token');
        if (savedUser) {
          console.log('Usuário encontrado no localStorage, fazendo login automático...');
          const parsedUser = JSON.parse(savedUser);
          handleLogin(parsedUser, true);
        }
      } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        // Continuar mesmo sem atividades para permitir login
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);
  
  const handleLogin = (loginData, isReload = false) => {
    console.log('Processando login:', loginData);
    
    let userData, accessToken;
    
    // Para reload do localStorage, loginData já é o user
    if (isReload) {
      userData = loginData;
      accessToken = localStorage.getItem('decifra-token') || null;
    } else {
      // Para login normal, loginData vem do Supabase normalizado em LoginPage.js: { user, access_token }

      userData = loginData.user;
      accessToken = loginData.access_token;
    }
    
    if (!userData) {
      console.error('Dados de usuário inválidos:', loginData);
      return;
    }
    
    setUser(userData);
    
    // Configurar o token no progressService (JWT do Supabase)
    if (accessToken) {
      setAuthToken(accessToken);
      if (!isReload) {
        localStorage.setItem('decifra-token', accessToken);
      }
    }
    
    if (!isReload) {
      localStorage.setItem('decifra-user', JSON.stringify(userData));
    }
    
    if (userData.role === 'Estudante') {
      setStudentProgress(getLocalProgress());
      setView('student_dashboard');
    } else if (userData.role === 'Professor') {
      setView('teacher_dashboard');
    } else {
      // Fallback para papel desconhecido
      setView('student_dashboard');
    }
    
    console.log(`Login bem-sucedido: ${userData.name} (${userData.role})`);
  };
  
  const handleLogout = () => {
    console.log('Fazendo logout...');
    setUser(null);
    setView('login');
    setAuthToken(null); // Limpar token do progressService
    localStorage.removeItem('decifra-user');
    localStorage.removeItem('decifra-token');
  };
  
  const handleReset = () => {
    if(user && user.role === 'Estudante') {
      console.log('Resetando progresso local...');
      resetLocalProgress();
      setStudentProgress(getLocalProgress());
    }
  };

  const handleProgressUpdate = async (activityId, progressDetails) => {
    try {
      // Atualizar localStorage primeiro
      const newProgress = getLocalProgress();
      newProgress.activityData[activityId] = progressDetails;
      saveLocalProgress(newProgress);
      setStudentProgress(newProgress);

      // Tentar salvar no backend
      console.log('Salvando progresso no backend:', progressDetails);
      const result = await saveActivityProgress({ 
        student_id: user.id, 
        activity_id: activityId,
        status: progressDetails.status,
        help_level: progressDetails.helpLevel,
        student_answer: progressDetails.answer,
        feedback_given: progressDetails.feedback
      });
      
      if (result) {
        console.log('Progresso salvo no backend com sucesso');
      }
    } catch (error) {
      console.error('Erro ao salvar progresso no backend:', error);
      // Não impedir o usuário de continuar se o backend falhar
    }
  };
  
  const goToLevelSelection = (pillarId) => { setCurrentPillarId(pillarId); setView('level_selection'); };
  const goToActivityList = (levelNumber) => { setCurrentLevel(levelNumber); setView('activity_list'); };
  const goToActivityPage = (activityId) => { setCurrentActivityId(activityId); setView('activity_page'); };
  const backToStudentDashboard = () => setView('student_dashboard');
  const backToLevelSelection = () => setView('level_selection');
  const backToActivityList = () => { setCurrentActivityId(null); setView('activity_list'); };

  const renderContent = () => {
    if (isLoading) {
      return <div className="container"><h2>Carregando ecossistema Decifra...</h2></div>;
    }
    
    if (!user) {
      return <LoginPage onLoginSuccess={handleLogin} />;
    }
    
    switch (view) {
      case 'student_dashboard':
        return <StudentDashboard user={user} allActivities={allActivities} progress={studentProgress} onSelectPillar={goToLevelSelection} onReset={handleReset} />;
      case 'level_selection':
        return <LevelSelectionPage pillarId={currentPillarId} allActivities={allActivities} progress={studentProgress} onSelectLevel={goToActivityList} onBack={backToStudentDashboard} />;
      case 'activity_list':
        return <DecompositionPage level={currentLevel} allActivities={allActivities} progress={studentProgress} onSelectActivity={goToActivityPage} onBack={backToLevelSelection} />;
      case 'activity_page':
        return <ActivityPage activityId={currentActivityId} allActivities={allActivities} user={user} onProgressUpdate={handleProgressUpdate} onBack={backToActivityList} />;
      case 'teacher_dashboard':
        return <TeacherDashboard user={user} allActivities={allActivities} studentProgress={studentProgress} />;
      default:
        return <LoginPage onLoginSuccess={handleLogin} />;
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