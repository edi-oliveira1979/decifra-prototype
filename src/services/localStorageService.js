// src/services/localStorageService.js

const PROGRESS_KEY = 'decifra_progress';

export const initializeLocalProgress = () => {
  if (!localStorage.getItem(PROGRESS_KEY)) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ activityData: {} }));
  }
};

// CORREÇÃO: Renomeado de getProgress para getLocalProgress
export const getLocalProgress = () => {
  initializeLocalProgress();
  return JSON.parse(localStorage.getItem(PROGRESS_KEY));
};

// CORREÇÃO: Renomeado de saveProgress para saveLocalProgress
export const saveLocalProgress = (progress) => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

// CORREÇÃO: Renomeado de resetProgress para resetLocalProgress
export const resetLocalProgress = () => {
    localStorage.removeItem(PROGRESS_KEY);
    initializeLocalProgress();
};