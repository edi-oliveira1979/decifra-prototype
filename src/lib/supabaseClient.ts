// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// CRA expõe variáveis com prefixo REACT_APP_
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Pequena validação útil em dev
if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase envs ausentes: verifique REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY no .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
