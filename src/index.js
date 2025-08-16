// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// 1. IMPORTAÇÃO ADICIONADA: Importamos o arquivo que acabamos de criar.
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Debug inicial para ajudar diagnóstico
console.log('[Decifra] index.js carregado');
window.addEventListener('error', (e) => console.error('[GlobalError]', e?.error || e?.message));
window.addEventListener('unhandledrejection', (e) => console.error('[UnhandledRejection]', e?.reason));

// Aviso caso as variáveis do Supabase não estejam definidas (CRA injetará strings se existirem)
if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
  console.warn('[Supabase] REACT_APP_SUPABASE_URL/REACT_APP_SUPABASE_ANON_KEY ausentes. Defina no .env.local e reinicie o npm start.');
}

// Montagem resiliente: cria #root se estiver faltando no index.html
const mount = () => {
  let container = document.getElementById('root');
  if (!container) {
    console.warn('[Decifra] #root não encontrado no index.html — criando dinamicamente.');
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
  }
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

mount();

// 2. CHAMADA ADICIONADA: registra o Service Worker com proteção
try {
  if (process.env.NODE_ENV === 'development') {
    serviceWorkerRegistration.unregister();
  } else {
    serviceWorkerRegistration.register();
  }
} catch (err) {
  console.warn('[ServiceWorker] Falha ao configurar SW:', err);
}