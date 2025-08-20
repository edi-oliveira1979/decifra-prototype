// src/App.js

import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import LevelSelectionPage from './pages/LevelSelectionPage';
import ActivityListPage from './pages/ActivityListPage';
import ActivityPage from './pages/ActivityPage';
import './App.css';

// --- Imports de Serviços Atualizados ---
// Adicionamos 'fetchActivities' para ser usado no login.
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

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const [pillarsData, levelsData] = await Promise.all([
        fetchPillars(),
        fetchLevels()
      ]);
      
      setPillars(pillarsData);
      const levelsMap = levelsData.reduce((acc, level) => {
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
  }, []);

  const handleLogin = async (loginData, isReload = false) => {
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
    
    // --- CORREÇÃO ADICIONADA AQUI ---
    // Após o login, buscamos todos os dados necessários de uma vez para popular a aplicação.
    setIsLoading(true);
    
    // Usamos Promise.all para buscar as atividades e o progresso do aluno (se for estudante) em paralelo.
    const [activitiesData, progressRecords] = await Promise.all([
      fetchActivities({}), // Chamada sem filtros para buscar TODAS as atividades.
      userProfile.role === 'Estudante' ? fetchStudentProgress(userProfile.id) : Promise.resolve(null)
    ]);

    // Populamos o estado global de atividades, que será usado pelo ActivityPage.
    setAllActivities(activitiesData);
        
    if (userProfile.role === 'Estudante') {
      const progressMap = (progressRecords || []).reduce((acc, record) => {
        acc[record.activity_id] = record;
        return acc;
      }, {});

      setStudentProgress({ activityData: progressMap });
      setView('student_dashboard');
    } else {
      // Para o professor, não precisamos fazer mais nada aqui,
      // pois o TeacherDashboard buscará os dados da turma selecionada.
      setView('teacher_dashboard');
    }
    setIsLoading(false);
  };
  
  const handleLogout = () => {
    console.log('Fazendo logout...');
    setUser(null);
    setView('login');
    setAuthToken(null);
    localStorage.removeItem('decifra-user');
    localStorage.removeItem('decifra-token');
  };
  
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
  
  const goToLevelSelection = (pillarId) => { setCurrentPillarId(pillarId); setView('level_selection'); };
  const goToActivityList = (levelNumber) => { setCurrentLevel(levelNumber); setView('activity_list'); };
  const goToActivityPage = (activityId) => { setCurrentActivityId(activityId); setView('activity_page'); };
  const backToStudentDashboard = () => setView('student_dashboard');
  const backToLevelSelection = () => setView('level_selection');
  const backToActivityList = () => { setCurrentActivityId(null); setView('activity_list'); };

  const renderContent = () => {
    if (isLoading) return <div className="container"><h2>Carregando ecossistema Decifra...</h2></div>;
    if (!user) return <LoginPage onLoginSuccess={handleLogin} />;

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
        return <TeacherDashboard user={user} allActivities={allActivities} />;
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
      <div className="container">{renderContent()}</div>
    </div>
  );
}

export default App;