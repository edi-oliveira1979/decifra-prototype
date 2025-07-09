// src/App.js
import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ActivityPage from './pages/ActivityPage';
import './App.css';

function App() {
  // Estado para gerenciar o usuário logado
  const [user, setUser] = useState(null);
  // Estado para gerenciar a visualização de uma atividade específica
  const [currentActivityId, setCurrentActivityId] = useState(null);

  // Função para lidar com o login
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    // Salva o usuário no localStorage para "lembrar" dele se a página for recarregada
    localStorage.setItem('decifra-user', JSON.stringify(loggedInUser));
  };
  
  // Função para lidar com o logout
  const handleLogout = () => {
    setUser(null);
    setCurrentActivityId(null);
    localStorage.removeItem('decifra-user');
  };

  // Efeito que roda uma vez quando o app carrega para verificar se já existe um usuário logado
  useEffect(() => {
    const savedUser = localStorage.getItem('decifra-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Lógica para decidir qual página mostrar
  const renderContent = () => {
    if (!user) {
      return <LoginPage onLogin={handleLogin} />;
    }

    if (currentActivityId) {
      return <ActivityPage activityId={currentActivityId} onBack={() => setCurrentActivityId(null)} />;
    }

    if (user.role === 'student') {
      return <StudentDashboard user={user} onSelectActivity={setCurrentActivityId} />;
    }

    if (user.role === 'teacher') {
      return <TeacherDashboard user={user} />;
    }
  };

  return (
    <div>
      {user && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p>Logado como: <strong>{user.name}</strong> ({user.role})</p>
          <button onClick={handleLogout}>Sair</button>
        </div>
      )}
      {renderContent()}
    </div>
  );
}

export default App;