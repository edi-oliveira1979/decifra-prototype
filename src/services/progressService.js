// src/services/progressService.js

let AUTH_TOKEN = null;

// Exportar a função setAuthToken que estava faltando
export function setAuthToken(token) {
  AUTH_TOKEN = token || null;
}

// CRA: lê do process.env.REACT_APP_*
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

const DEFAULT_TIMEOUT = 8000;
const inflight = new Map();

function buildKey(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? String(options.body) : '';
  return `${method} ${url} ${body}`;
}

async function safeFetch(url, options = {}, { timeout = DEFAULT_TIMEOUT, dedupe = true } = {}) {
  const key = buildKey(url, options);
  if (dedupe && inflight.has(key)) return inflight.get(key);

  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), timeout);

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (AUTH_TOKEN) headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  if (options.method && options.method !== 'GET' && !AUTH_TOKEN) {
    throw new Error('Operação protegida sem token. Faça login pelo Supabase.');
  }

  const finalOptions = {
    ...options,
    signal: ac.signal,
    headers,
    cache: 'no-store',
  };

  const p = (async () => {
    try {
      console.log(`Fazendo requisição para: ${url}`, { method: finalOptions.method || 'GET' });
      const res = await fetch(url, finalOptions);
      console.log(`Status da resposta: ${res.status}`);
      
      if (!res.ok) {
        let payload;
        try { 
          const errorText = await res.text();
          console.log('Erro da resposta:', errorText);
          payload = JSON.parse(errorText); 
        } catch {
          console.error('Não foi possível fazer parse do erro como JSON');
        }
        const msg = payload?.error || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      
      const responseText = await res.text();
      console.log('Resposta do servidor:', responseText);
      
      if (!responseText.trim()) {
        return null;
      }
      
      try { 
        return JSON.parse(responseText); 
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError);
        console.error('Texto da resposta:', responseText);
        return null; 
      }
    } finally {
      clearTimeout(id);
      inflight.delete(key);
    }
  })();

  if (dedupe) inflight.set(key, p);
  return p;
}

// ---- Públicos (sem mock!) ----
export async function fetchAllActivities() {
  const url = `${API_BASE_URL}/activities`;
  try { 
    const result = await safeFetch(url, { method: 'GET' }, { dedupe: true });
    console.log(`${(result || []).length} atividades carregadas`);
    return result || []; 
  }
  catch (err) { 
    console.error('ERRO ao buscar atividades:', err); 
    return []; 
  }
}

export async function fetchPillars() {
  const url = `${API_BASE_URL}/pillars`;
  try { 
    const result = await safeFetch(url, { method: 'GET' }, { dedupe: true });
    console.log(`${(result || []).length} pilares carregados`);
    return result || []; 
  }
  catch (err) { 
    console.error('ERRO ao buscar pilares:', err); 
    return []; 
  }
}

export async function fetchLevels() {
  const url = `${API_BASE_URL}/levels`;
  try { 
    const result = await safeFetch(url, { method: 'GET' }, { dedupe: true });
    console.log(`${(result || []).length} níveis carregados`);
    return result || []; 
  }
  catch (err) { 
    console.error('ERRO ao buscar níveis:', err); 
    return []; 
  }
}

// ---- Protegidos ----
export async function saveActivityProgress(progressData) {
  const url = `${API_BASE_URL}/progress`;
  try {
    console.log('Salvando progresso:', progressData);
    const result = await safeFetch(
      url,
      { method: 'POST', body: JSON.stringify(progressData) },
      { dedupe: false }
    );
    console.log('Progresso salvo com sucesso:', result);
    return result;
  } catch (err) {
    console.error('ERRO ao salvar progresso:', err);
    return null;
  }
}

export async function resetStudentProgress(studentId) {
  const url = `${API_BASE_URL}/progress/student/${encodeURIComponent(studentId)}`;
  try { 
    const result = await safeFetch(url, { method: 'DELETE' }, { dedupe: false });
    console.log('Progresso resetado com sucesso:', result);
    return result; 
  }
  catch (err) { 
    console.error('ERRO ao reiniciar progresso:', err); 
    return null; 
  }
}

// Adicionar função para limpar progresso (alias)
export const clearStudentProgress = resetStudentProgress;

// Função de teste para verificar conectividade com a API
export const testApiConnection = async () => {
  try {
    console.log('Testando conexão com a API...');
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API está funcionando:', data);
      return true;
    } else {
      console.error('API retornou erro:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Erro de conectividade com a API:', error);
    return false;
  }
};

// Função auxiliar para debug
export const getApiInfo = () => {
  return {
    baseUrl: API_BASE_URL,
    hasToken: !!AUTH_TOKEN,
    tokenPreview: AUTH_TOKEN ? AUTH_TOKEN.substring(0, 20) + '...' : null,
  };
};