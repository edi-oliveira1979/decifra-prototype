// src/App.js

// 1. Importamos 'useCallback' do React.
import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import LevelSelectionPage from './pages/LevelSelectionPage';
import ActivityListPage from './pages/ActivityListPage';
import ActivityPage from './pages/ActivityPage';
import './App.css';

import { 
  fetchPillars, 
  fetchLevels, 
  fetchStudentProgress, 
  resetStudentProgress, 
  fetchUserProfile, 
  fetchActivities 
} from './services/progressService';
import { setAuthToken } from './services/progressService';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [allActivities, setAllActivities] = useState([]);
  const [pillars, setPillars] = useState([]);
  const [levels, setLevels] = useState({});
  const [studentProgress, setStudentProgress] = useState({ activityData: {} });
  const [isLoading, setIsLoading] = useState(true);

  const [currentPillarId, setCurrentPillarId] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentActivityId, setCurrentActivityId] = useState(null);
  
  // A função de logout também é envolvida com useCallback para estabilidade.
  // Como suas dependências (setters de estado) são estáveis, o array de dependências é vazio.
  const handleLogout = useCallback(() => {
    console.log('Fazendo logout...');
    setUser(null);
    setView('login');
    setAuthToken(null);
    localStorage.removeItem('decifra-user');
    localStorage.removeItem('decifra-token');
  }, []);

  // 2. A função handleLogin agora é envolvida com 'useCallback'.
  // Ela será recriada apenas se 'handleLogout' mudar (o que não acontecerá).
  const handleLogin = useCallback(async (loginData, isReload = false) => {
    const { access_token } = loginData;
    
    setAuthToken(access_token);

    const userProfile = await fetchUserProfile();

    if (!userProfile) {
      handleLogout();
      if (!isReload) {
        alert("Erro ao buscar perfil do usuário. Verifique o console do backend e se o usuário existe na tabela 'public.users'.");
      }
      setIsLoading(false);
      return;
    }

    setUser(userProfile);
    if (!isReload) {
        localStorage.setItem('decifra-user', JSON.stringify(userProfile));
        localStorage.setItem('decifra-token', access_token);
    }
    
    setIsLoading(true);
    
    const [activitiesData, progressRecords] = await Promise.all([
      fetchActivities({}),
      userProfile.role === 'Estudante' ? fetchStudentProgress(userProfile.id) : Promise.resolve(null)
    ]);

    setAllActivities(activitiesData);
        
    if (userProfile.role === 'Estudante') {
      const progressMap = (progressRecords || []).reduce((acc, record) => {
        acc[record.activity_id] = record;
        return acc;
      }, {});

      setStudentProgress({ activityData: progressMap });
      setView('student_dashboard');
    } else {
      setView('teacher_dashboard');
    }
    setIsLoading(false);
  }, [handleLogout]); // Adicionamos 'handleLogout' como dependência.

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const [pillarsData, levelsData] = await Promise.all([
        fetchPillars(),
        fetchLevels()
      ]);
      
      setPillars(pillarsData);
      const levelsMap = (levelsData || []).reduce((acc, level) => {
          acc[level.id] = level.name;
          return acc;
      }, {});
      setLevels(levelsMap);

      const savedUserJSON = localStorage.getItem('decifra-user');
      if (savedUserJSON) {
        const savedUser = JSON.parse(savedUserJSON);
        const savedToken = localStorage.getItem('decifra-token');
        if (savedUser && savedToken) {
          await handleLogin({ user: savedUser, access_token: savedToken }, true);
        }
      }
      setIsLoading(false);
    };
    loadInitialData();
  // 3. Adicionamos 'handleLogin' ao array de dependências, resolvendo o aviso do ESLint.
  }, [handleLogin]);
  
  const handleReset = async () => {
    if(user && user.role === 'Estudante') {
      if (window.confirm('Tem certeza que deseja reiniciar todo o seu progresso? Esta ação não pode ser desfeita.')) {
        console.log('Resetando progresso via API...');
        await resetStudentProgress(user.id);
        setStudentProgress({ activityData: {} });
      }
    }
  };

  const handleProgressUpdate = (activityId, progressDetails) => {
    setStudentProgress(prevProgress => {
      const newActivityData = {
        ...prevProgress.activityData,
        [activityId]: progressDetails,
      };
      return { activityData: newActivityData };
    });
  };
  
  const goToRegister = () => setView('register');
  const goToLogin = () => setView('login');

  const goToLevelSelection = (pillarId) => { setCurrentPillarId(pillarId); setView('level_selection'); };
  const goToActivityList = (levelNumber) => { setCurrentLevel(levelNumber); setView('activity_list'); };
  const goToActivityPage = (activityId) => { setCurrentActivityId(activityId); setView('activity_page'); };
  const backToStudentDashboard = () => setView('student_dashboard');
  const backToLevelSelection = () => setView('level_selection');
  const backToActivityList = () => { setCurrentActivityId(null); setView('activity_list'); };

  const renderContent = () => {
    if (isLoading) return <div className="container"><h2>Carregando ecossistema Decifra...</h2></div>;
    
    if (!user) {
      if (view === 'register') {
        return <RegisterPage onNavigateToLogin={goToLogin} />;
      }
      return <LoginPage onLoginSuccess={handleLogin} onNavigateToRegister={goToRegister} />;
    }

    switch (view) {
      case 'student_dashboard':
        return <StudentDashboard user={user} pillars={pillars} levels={levels} allActivities={allActivities} progress={studentProgress} onSelectPillar={goToLevelSelection} onReset={handleReset} />;
      case 'level_selection':
        return <LevelSelectionPage pillarId={currentPillarId} pillars={pillars} levels={levels} progress={studentProgress} onSelectLevel={goToActivityList} onBack={backToStudentDashboard} />;
      case 'activity_list':
        return <ActivityListPage pillarId={currentPillarId} level={currentLevel} pillars={pillars} levels={levels} progress={studentProgress} onSelectActivity={goToActivityPage} onBack={backToLevelSelection} />;
      case 'activity_page':
        return <ActivityPage activityId={currentActivityId} allActivities={allActivities} user={user} onProgressUpdate={handleProgressUpdate} onBack={backToActivityList} />;
      case 'teacher_dashboard':
        return <TeacherDashboard user={user} pillars={pillars} levels={levels} allActivities={allActivities} />;
      default:
        return <LoginPage onLoginSuccess={handleLogin} onNavigateToRegister={goToRegister} />;
    }
  };

  return (
    <div>
      {user && (
        <div className="header">
          <p>Logado como: <strong>{user.full_name || user.name}</strong> ({user.role})</p>
          <button onClick={handleLogout}>Sair</button>
        </div>
      )}
      <div className="container">{renderContent()}</div>
    </div>
  );
}

export default App;