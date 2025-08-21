// src/services/progressService.js

// Variável para guardar o token de sessão JWT em memória
let AUTH_TOKEN = null;

// Esta função permite que outros arquivos (como o AuthContext)
// configurem o token que será usado nas chamadas de API.
export function setAuthToken(token) {
  AUTH_TOKEN = token || null;
}

// A URL base da API agora é lida da variável de ambiente,
// com um fallback para o ambiente de desenvolvimento local.
const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '') + '/api/v1';


/**
 * Uma função helper para fazer chamadas de rede de forma segura,
 * adicionando o token de autenticação e tratando erros comuns.
 * @param {string} url - O caminho do endpoint (ex: '/activities')
 * @param {object} options - Opções adicionais para a função fetch (method, body, etc.)
 * @returns {Promise<any>} - O JSON retornado pela API
 * @throws {Error} - Lança um erro em caso de falha na rede ou resposta não-ok.
 */
const safeFetch = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (AUTH_TOKEN) {
    headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Falha ao processar resposta de erro da API' }));
    throw new Error(errorData.error || `Erro na API: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
};

// =================================================================
// Funções de Conteúdo Público (Pilares, Níveis e Atividades)
// =================================================================

export const fetchPillars = async () => {
  try {
    const data = await safeFetch('/pillars');
    console.log('Pilares carregados da API com sucesso!');
    return data;
  } catch (error) {
    console.error("ERRO ao buscar pilares:", error);
    return [];
  }
};

export const fetchLevels = async () => {
  try {
    const data = await safeFetch('/levels');
    console.log('Níveis carregados da API com sucesso!');
    return data;
  } catch (error) {
    console.error("ERRO ao buscar níveis:", error);
    return [];
  }
};

export const fetchActivities = async ({ pillarId, levelId }) => {
  try {
    const params = new URLSearchParams();
    if (pillarId) params.append('pillar_id', pillarId);
    if (levelId) params.append('level_id', levelId);

    const queryString = params.toString();
    const url = `/activities${queryString ? '?' + queryString : ''}`;
    
    const data = await safeFetch(url);
    console.log(`Atividades carregadas de ${url} com sucesso!`);
    return data;
  } catch (error) {
    console.error("ERRO ao buscar atividades filtradas:", error);
    return [];
  }
};

// =================================================================
// Funções de Perfil de Usuário
// =================================================================

export const fetchUserProfile = async () => {
  try {
    const data = await safeFetch('/auth/me');
    console.log("Perfil do usuário carregado com sucesso!", data);
    return data;
  } catch (error) {
    console.error("ERRO ao buscar perfil do usuário:", error);
    return null;
  }
};


// =================================================================
// Funções de Análise e Progresso
// =================================================================

/**
 * NOVA FUNÇÃO: Envia a resposta do aluno para o endpoint de análise do backend.
 * @param {string} activityId - O ID da atividade.
 * @param {string} answer - O texto da resposta do aluno.
 * @returns {Promise<object|null>} - O resultado da análise {status, feedback}.
 */
export const analyzeActivityAnswer = async (activityId, answer) => {
  try {
    const data = await safeFetch(`/activities/${activityId}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
    console.log("Resposta analisada com sucesso!", data);
    return data;
  } catch (error) {
    console.error("ERRO ao analisar resposta:", error);
    // Retorna um feedback de erro genérico para ser exibido ao usuário
    return {
      status: 'pending',
      feedback: 'Não foi possível analisar sua resposta no momento. Tente novamente.',
    };
  }
};

export const fetchStudentProgress = async (studentId) => {
  if (!studentId) {
    console.error("fetchStudentProgress chamado sem studentId");
    return [];
  }
  try {
    const data = await safeFetch(`/progress/student/${studentId}`);
    console.log(`Progresso do aluno ${studentId} carregado com sucesso!`);
    return data;
  } catch (error) {
    console.error(`ERRO ao buscar progresso do aluno ${studentId}:`, error);
    return [];
  }
};

export const saveActivityProgress = async (progressData) => {
    try {
        const data = await safeFetch('/progress', {
            method: 'POST',
            body: JSON.stringify(progressData),
        });
        console.log("Progresso salvo na API com sucesso!", data);
        return data;
    } catch (error) {
        console.error("ERRO ao salvar progresso na API:", error);
        return null;
    }
};

export const resetStudentProgress = async (studentId) => {
  if (!studentId) {
    console.error("resetStudentProgress chamado sem studentId");
    return null;
  }
  try {
    const data = await safeFetch(`/progress/student/${studentId}`, {
      method: 'DELETE',
    });
    console.log(`Progresso do aluno ${studentId} reiniciado com sucesso!`);
    return data;
  } catch (error) {
    console.error(`ERRO ao reiniciar progresso do aluno ${studentId}:`, error);
    return null;
  }
};

// =================================================================
// Funções do Dashboard do Professor
// =================================================================

export const fetchTeacherClasses = async () => {
  try {
    const data = await safeFetch('/teacher/classes');
    console.log("Turmas do professor carregadas com sucesso!");
    return data;
  } catch (error) {
    console.error("ERRO ao buscar turmas do professor:", error);
    return [];
  }
};

export const fetchStudentsByClass = async (classId) => {
  if (!classId) return [];
  try {
    const data = await safeFetch(`/teacher/classes/${classId}/students`);
    console.log(`Alunos da turma ${classId} carregados com sucesso!`);
    return data;
  } catch (error) {
    console.error(`ERRO ao buscar alunos da turma ${classId}:`, error);
    return [];
  }
};

export const fetchProgressByClass = async (classId) => {
  if (!classId) return [];
  try {
    const data = await safeFetch(`/teacher/classes/${classId}/progress`);
    console.log(`Progresso da turma ${classId} carregado com sucesso!`);
    return data;
  } catch (error) {
    console.error(`ERRO ao buscar progresso da turma ${classId}:`, error);
    return [];
  }
};