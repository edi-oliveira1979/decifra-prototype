// src/App.js

// 1. Importamos 'useCallback' do React.
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ProfessorHome from './pages/ProfessorHome';
import ClassManagement from './pages/ClassManagement';
import StudentJoinClass from './pages/StudentJoinClass';
import SandboxAllActivities from './pages/SandboxAllActivities';
import RecoverPassword from './pages/RecoverPassword';
import ForgotPassword from './pages/ForgotPassword';
import LevelSelectionPage from './pages/LevelSelectionPage';
import ActivityListPage from './pages/ActivityListPage';
import ActivityPage from './pages/ActivityPage';
import './App.css';

// Serviços consolidados (evita imports duplicados)
import {
  fetchPillars,
  fetchLevels,
  fetchStudentProgress,
  resetStudentProgress,
  fetchUserProfile,
  fetchActivities,
  fetchMembership,
  setAuthToken,
} from './services/progressService';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // + recover_password + forgot_password
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
    setView('login'); // volta à tela de login
    setAuthToken(null);
    localStorage.removeItem('decifra-user');
    localStorage.removeItem('decifra-token');
  }, []);

  // ====== interceptação de recovery ======
  useEffect(() => {
    // 1) path direto
    if (window.location.pathname === '/recuperar-senha') {
      setView('recover_password');
      return;
    }
    // 2) query string
    try {
      const qs = new URLSearchParams(window.location.search);
      if (qs.get('type') === 'recovery') {
        setView('recover_password');
        return;
      }
    } catch {}
    // 3) hash (padrão Supabase: #access_token=...&type=recovery)
    const hash = window.location.hash || '';
    if (hash.includes('type=recovery') || hash.includes('access_token=')) {
      setView('recover_password');
      return;
    }
    // 4) listener oficial do Supabase (com cleanup seguro)
    let unsubscribe = null;
    try {
      if (supabase?.auth?.onAuthStateChange) {
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY') {
            setView('recover_password');
          }
          // garante token nas chamadas autenticadas quando vier sessão de recovery
          if (event === 'SIGNED_IN' && session?.access_token) {
            try { setAuthToken(session.access_token); } catch {}
          }
        });
        unsubscribe = () => listener?.subscription?.unsubscribe?.();
      }
    } catch (e) {
      console.warn('[Auth listener] não inicializado:', e);
    }
    return () => {
      try { unsubscribe && unsubscribe(); } catch {}
    };
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
    
    // Carrega base comum
    const activitiesData = await fetchActivities({});
    setAllActivities(activitiesData);
        
    // Roteamento baseado em papel + membership
    if (userProfile.role === 'Estudante') {
      // Verifica vínculo a turma
      let isMember = false;
      try {
        const membership = await fetchMembership();
        isMember = !!membership?.isMember;
      } catch (e) {
        console.warn('Falha ao buscar membership, seguindo fluxo padrão de estudante sem turma.', e);
      }

      // Busca progresso do aluno (independente de estar em turma — permite modo "solo")
      const progressRecords = await fetchStudentProgress(userProfile.id);
      const progressMap = (progressRecords || []).reduce((acc, record) => {
        acc[record.activity_id] = record;
        return acc;
      }, {});

      setStudentProgress({ activityData: progressMap });
      setView(isMember ? 'student_dashboard' : 'student_join');
    } else {
      // Professor agora entra em um HUB com 3 caminhos:
      // - Dashboard de Progresso
      // - Gestão de Turmas
      // - Sandbox (modo aluno, tudo desbloqueado)
      setView('professor_home');
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
  const goToForgotPassword = () => setView('forgot_password');
  const backFromForgotToLogin = () => setView('login');

  // Navegação aluno
  const goToLevelSelection = (pillarId) => { setCurrentPillarId(pillarId); setView('level_selection'); };
  const goToActivityList = (levelNumber) => { setCurrentLevel(levelNumber); setView('activity_list'); };
  const goToActivityPage = (activityId) => { setCurrentActivityId(activityId); setView('activity_page'); };
  const backToStudentDashboard = () => setView('student_dashboard');
  const backToLevelSelection = () => setView('level_selection');
  const backToActivityList = () => { setCurrentActivityId(null); setView('activity_list'); };

  // Navegação professor (hub → destinos)
  const goToProfessorHome = () => setView('professor_home');
  const goToTeacherDashboard = () => setView('teacher_dashboard');
  const goToClassManagement = () => setView('class_management');
  const goToSandbox = () => setView('sandbox');

  // Aluno sem turma: após vincular com sucesso (ou optar por seguir "solo")
  const onStudentJoinedOrContinueSolo = () => setView('student_dashboard');

  // ====== render ======
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="container">
          <h2>Carregando ecossistema Decifra...</h2>
        </div>
      );
    }

    // sem usuário logado
    if (!user) {
      if (view === 'register') {
        return <RegisterPage onNavigateToLogin={goToLogin} />;
      }
      if (view === 'forgot_password') {
        return (
          <ForgotPassword onSent={goToLogin} onBack={backFromForgotToLogin} />
        );
      }
      if (view === 'recover_password') {
        return <RecoverPassword onDone={goToLogin} />;
      }
      // login padrão
      return (
        <LoginPage
          onLoginSuccess={handleLogin}
          onNavigateToRegister={goToRegister}
          onNavigateToForgot={goToForgotPassword}
        />
      );
    }

    // usuário logado
    switch (view) {
      // ====== PROFESSOR ======
      case 'professor_home':
        return (
          <ProfessorHome
            user={user}
            onGoDashboard={goToTeacherDashboard}
            onGoClasses={goToClassManagement}
            onGoSandbox={goToSandbox}
          />
        );

      case 'class_management':
        return (
          <ClassManagement
            user={user}
            onBack={goToProfessorHome}
          />
        );

      case 'sandbox':
        return (
          <SandboxAllActivities
            user={user}
            pillars={pillars}
            levels={levels}            
            allActivities={allActivities}
            isTeacherSandbox
            onBack={goToProfessorHome}
          />
        );

      case 'teacher_dashboard':
        return (
          <TeacherDashboard
            user={user}
            pillars={pillars}
            levels={levels}
            allActivities={allActivities}
            onBack={goToProfessorHome}
          />
        );

      // ====== ALUNO ======
      case 'student_dashboard':
        return (
          <StudentDashboard
            user={user}
            pillars={pillars}
            levels={levels}
            allActivities={allActivities}
            progress={studentProgress}
            onSelectPillar={goToLevelSelection}
            onReset={handleReset}
          />
        );

      case 'level_selection':
        return (
          <LevelSelectionPage
            pillarId={currentPillarId}
            pillars={pillars}
            levels={levels}
            progress={studentProgress}
            onSelectLevel={goToActivityList}
            onBack={backToStudentDashboard}
          />
        );

      case 'activity_list':
        return (
          <ActivityListPage
            pillarId={currentPillarId}
            level={currentLevel}
            pillars={pillars}
            levels={levels}
            progress={studentProgress}
            onSelectActivity={goToActivityPage}
            onBack={backToLevelSelection}
          />
        );

      case 'activity_page':
        return (
          <ActivityPage
            activityId={currentActivityId}
            allActivities={allActivities}
            user={user}
            onProgressUpdate={(activityId, details) => {
              setStudentProgress((prev) => ({
                activityData: {
                  ...(prev.activityData || {}),
                  [activityId]: details,
                },
              }));
            }}
            onBack={backToActivityList}
          />
        );

      case 'student_join':
        return (
          <StudentJoinClass
            user={user}
            onJoined={onStudentJoinedOrContinueSolo}
            onContinueSolo={onStudentJoinedOrContinueSolo}
          />
        );

      // fallback seguro
      default:
        return (
          <LoginPage
            onLoginSuccess={handleLogin}
            onNavigateToRegister={goToRegister}
            onNavigateToForgot={goToForgotPassword}
          />
        );
    }
  };

  return (
    <div>
      {user && (
        <div className="header">
          <p>Logado como: <strong>{user.full_name || user.name}</strong> ({user.role})</p>
          <div style={{ display:'flex', gap:8 }}>
            {user.role === 'Professor' && view !== 'professor_home' && (
              <button onClick={goToProfessorHome}>Início do Professor</button>
            )}
            <button onClick={handleLogout}>Sair</button>
          </div>
        </div>
      )}
      <div className="container">{renderContent()}</div>
    </div>
  );
}

export default App;