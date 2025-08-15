// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.REACT_APP_SUPABASE_ANON_KEY || '').trim();

// Logs de diagnóstico (mascarados) para detectar URL/KEY inválidas
const mask = (s) => (s ? `${s.slice(0, 6)}…${s.slice(-6)}` : '(vazio)');
const looksLikeUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl);
const looksLikeJwt = supabaseAnonKey.startsWith('ey') && supabaseAnonKey.includes('.');
// eslint-disable-next-line no-console
console.log('[Supabase] URL:', looksLikeUrl ? supabaseUrl : '(inválida ou vazia)', 'KEY:', looksLikeJwt ? mask(supabaseAnonKey) : '(inválida ou vazia)');

// Não derrube a UI se faltar config; exporte null e deixe a página avisar
export const supabase = looksLikeUrl && looksLikeJwt ? createClient(supabaseUrl, supabaseAnonKey) : null;

if (!supabase) {
  // eslint-disable-next-line no-console
  console.warn('[Supabase] Config inválida. Verifique REACT_APP_SUPABASE_URL (ex.: https://xxxx.supabase.co) e REACT_APP_SUPABASE_ANON_KEY (anon public key).');
}