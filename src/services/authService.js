// src/services/authService.js — OBSOLETO
// Todo o fluxo de autenticação agora é feito diretamente via Supabase (frontend).
// Este arquivo permanece apenas para evitar que imports antigos quebrem silenciosamente.

export const loginUser = () => {
  throw new Error(
    'authService.loginUser() obsoleto. Use supabase.auth.signInWithPassword no LoginPage.'
  );
};

export const registerUser = () => {
  throw new Error('authService.registerUser() não está disponível. Faça cadastro via Supabase/Auth Admin ou fluxo dedicado.');
};