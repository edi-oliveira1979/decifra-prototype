// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// CRA expõe variáveis com prefixo REACT_APP_
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// VALIDAÇÃO OBRIGATÓRIA - garante que as variáveis existam
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase ausentes! ' +
    'Verifique se REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY ' +
    'estão definidas no arquivo .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Tipos úteis para usar no resto da aplicação
export type User = {
  id: string;
  email?: string;
  full_name?: string;
  role?: string;
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  user: User;
};