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

  // Adiciona o token de autorização se ele existir
  if (AUTH_TOKEN) {
    headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Falha ao processar resposta de erro da API' }));
    throw new Error(errorData.error || `Erro na API: ${response.statusText}`);
  }

  // Retorna o JSON apenas se a resposta tiver conteúdo
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
};

// =================================================================
// Funções de Conteúdo Público (Pilares, Níveis e Atividades)
// =================================================================

/**
 * Busca a lista de pilares do backend.
 * @returns {Promise<Array>} - Uma lista de objetos de pilar.
 */
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

/**
 * Busca a lista de níveis de proficiência do backend.
 * @returns {Promise<Array>} - Uma lista de objetos de nível.
 */
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

/**
 * Busca atividades de forma filtrada.
 * @param {{pillarId?: string, levelId?: number}} filters - Objeto com os filtros desejados.
 * @returns {Promise<Array>} - Uma lista de atividades que correspondem aos filtros.
 */
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

/**
 * Busca o perfil completo do usuário logado (incluindo a role correta).
 * @returns {Promise<object|null>} - O objeto de perfil do usuário ou nulo em caso de erro.
 */
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
// Funções de Progresso do Aluno
// =================================================================

/**
 * Busca todo o progresso de um aluno específico.
 * @param {string} studentId - O ID do aluno.
 * @returns {Promise<Array>} - A lista de registros de progresso do aluno.
 */
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

/**
 * Salva o resultado de uma atividade no backend.
 * @param {object} progressData - Os dados de progresso da atividade.
 */
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

/**
 * Envia um comando para o backend para resetar todo o progresso de um aluno.
 * @param {string} studentId - O ID do aluno a ter o progresso resetado.
 */
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

/**
 * Busca as turmas associadas ao professor logado.
 * @returns {Promise<Array>} - Uma lista de turmas.
 */
export const fetchTeacherClasses = async () => {
  try {
    const data = await safeFetch('/teacher/classes');
    console.log("Turmas do professor carregadas com sucesso!");
    return data;
  } catch (error) {
    console.error("ERRO ao buscar turmas do professor:", error);
    // CORREÇÃO: Retorna um array vazio em caso de erro.
    return [];
  }
};

/**
 * Busca os alunos de uma turma específica.
 * @param {string} classId - O ID da turma.
 * @returns {Promise<Array>} - Uma lista de perfis de alunos.
 */
export const fetchStudentsByClass = async (classId) => {
  if (!classId) return [];
  try {
    const data = await safeFetch(`/teacher/classes/${classId}/students`);
    console.log(`Alunos da turma ${classId} carregados com sucesso!`);
    return data;
  } catch (error) {
    console.error(`ERRO ao buscar alunos da turma ${classId}:`, error);
    // CORREÇÃO: Retorna um array vazio em caso de erro.
    return [];
  }
};

/**
 * Busca o progresso de todos os alunos de uma turma específica.
 * @param {string} classId - O ID da turma.
 * @returns {Promise<Array>} - Uma lista com todos os registros de progresso da turma.
 */
export const fetchProgressByClass = async (classId) => {
  if (!classId) return [];
  try {
    const data = await safeFetch(`/teacher/classes/${classId}/progress`);
    console.log(`Progresso da turma ${classId} carregado com sucesso!`);
    return data;
  } catch (error) {
    console.error(`ERRO ao buscar progresso da turma ${classId}:`, error);
    // CORREÇÃO: Retorna um array vazio em caso de erro.
    return [];
  }
};