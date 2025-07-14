// src/services/progressService.js

// CORREÇÃO: Removemos 'levels' desta linha, pois não é usado neste arquivo.
// Ele é usado nos componentes de UI, mas não aqui no serviço.
import { pillars, activities, mockTeacherData, users } from '../data/mockData';

const PROGRESS_KEY = 'decifra_progress';

export const initializeProgress = () => {
  if (!localStorage.getItem(PROGRESS_KEY)) {
    const initialProgress = { activityData: {} };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(initialProgress));
  }
};

export const getProgress = () => {
  initializeProgress();
  return JSON.parse(localStorage.getItem(PROGRESS_KEY));
};

export const completeActivity = (activityId, helpLevelUsed, studentAnswer, feedbackGiven, feedbackStatus) => {
  const progress = getProgress();
  progress.activityData[activityId] = {
    status: feedbackStatus,
    helpLevel: helpLevelUsed,
    answer: studentAnswer,
    feedback: feedbackGiven,
  };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

export const clearProgress = () => localStorage.removeItem(PROGRESS_KEY);

export const resetProgress = () => {
  clearProgress();
  initializeProgress();
};

export const getPillarLevels = () => {
  const progress = getProgress();
  const pillarLevels = {};

  pillars.forEach(pillar => {
    const pillarActivities = activities.filter(a => a.pillar === pillar.id);
    const completedPillarActivities = pillarActivities.filter(a => {
        const status = progress?.activityData?.[a.id]?.status;
        return status === 'completo' || status === 'parcial';
    });

    let maxLevel = 0;
    if (completedPillarActivities.length > 0) {
      maxLevel = Math.max(...completedPillarActivities.map(a => a.level));
    }
    pillarLevels[pillar.id] = maxLevel;
  });
  return pillarLevels;
};

export const getLevelsDataForPillar = (pillarId) => {
  const progressData = getProgress().activityData;
  const levelsData = {};

  const activitiesInPillar = activities.filter(a => a.pillar === pillarId);
  if (activitiesInPillar.length === 0) return [];

  const maxLevelInPillar = Math.max(...activitiesInPillar.map(a => a.level), 0);

  for (let levelNum = 1; levelNum <= maxLevelInPillar; levelNum++) {
    const activitiesInLevel = activitiesInPillar.filter(a => a.level === levelNum);
    if (activitiesInLevel.length === 0) continue;

    const completedInLevel = activitiesInLevel.filter(a => progressData[a.id]?.status === 'completo' || progressData[a.id]?.status === 'parcial');
    
    let bestPerformanceStatus = 'nao_iniciado';
    let bestAutonomy = null;

    if (completedInLevel.length > 0) {
      const hasCompletedPerfectly = completedInLevel.some(a => progressData[a.id]?.status === 'completo');
      bestPerformanceStatus = hasCompletedPerfectly ? 'completo' : 'parcial';
      
      const bestActivity = completedInLevel.find(a => progressData[a.id]?.status === 'completo') || completedInLevel[0];
      if (bestActivity && progressData[bestActivity.id]) {
        bestAutonomy = progressData[bestActivity.id].helpLevel;
      }
    }
    
    levelsData[levelNum] = {
      levelNumber: levelNum,
      totalActivities: activitiesInLevel.length,
      completedCount: completedInLevel.length,
      bestPerformanceStatus,
      bestAutonomy,
    };
  }
  return Object.values(levelsData);
};

export const getTeacherDashboardData = () => {
  // CORREÇÃO: Removemos a linha 'const anaProgressData = ...' que não estava sendo utilizada.
  // A lógica agora é mais direta e clara.

  // Pega os dados reais da Ana (Estudante)
  const anaPillarLevels = getPillarLevels();
  const anaData = {
    studentId: users['ana@decifra.com'].id,
    studentName: 'Ana', // Usamos o nome diretamente para clareza
    pillars: {}
  };
  pillars.forEach(pillar => {
    anaData.pillars[pillar.id] = {
      overallLevel: anaPillarLevels[pillar.id] || 0,
      levels: getLevelsDataForPillar(pillar.id),
    };
  });

  // Processa os dados FÍCTICIOS dos outros alunos
  const otherStudentsData = mockTeacherData.map(student => {
    const studentData = {
        studentId: student.studentName,
        studentName: student.studentName,
        pillars: {}
    };
    pillars.forEach(pillar => {
      const overallLevel = student.progress[pillar.id] || 0;
      studentData.pillars[pillar.id] = {
        overallLevel: overallLevel,
        levels: Array.from({length: overallLevel}, (_, i) => ({
          levelNumber: i + 1,
          totalActivities: 1,
          completedCount: 1,
          bestPerformanceStatus: 'completo',
          bestAutonomy: Math.floor(Math.random() * 2)
        }))
      };
    });
    return studentData;
  });

  // Combina os dados reais da Ana com os fictícios e retorna
  return [anaData, ...otherStudentsData];
};