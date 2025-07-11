// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// 1. IMPORTAÇÃO ADICIONADA: Importamos o arquivo que acabamos de criar.
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Este código encontra o elemento 'root' no nosso HTML e renderiza nosso componente App dentro dele.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 2. CHAMADA ADICIONADA: Esta linha "liga" o Service Worker, ativando a funcionalidade PWA.
// Agora o seu protótipo se comportará como esperado para instalação e uso offline.
serviceWorkerRegistration.register();