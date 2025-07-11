// src/services/progressService.js
import { pillars, activities, mockTeacherData, users } from '../data/mockData';

const PROGRESS_KEY = 'decifra_progress';

export const initializeProgress = () => {
  if (!localStorage.getItem(PROGRESS_KEY)) {
    const initialProgress = { activityData: {} };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(initialProgress));
  }
};

export const getProgress = () => {
  const progressString = localStorage.getItem(PROGRESS_KEY);
  if (!progressString) {
    initializeProgress();
    return JSON.parse(localStorage.getItem(PROGRESS_KEY));
  }
  return JSON.parse(progressString);
};

export const completeActivity = (activityId, helpLevelUsed, studentAnswer, feedbackGiven) => {
  const progress = getProgress();
  progress.activityData[activityId] = {
    completed: true,
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
    const completedPillarActivities = pillarActivities.filter(
      a => progress?.activityData?.[a.id]?.completed
    );

    let maxLevel = 0;
    if (completedPillarActivities.length > 0) {
      maxLevel = Math.max(...completedPillarActivities.map(a => a.level));
    }
    pillarLevels[pillar.id] = maxLevel;
  });
  return pillarLevels;
};


export const getTeacherDashboardData = () => {
  const anaProgressData = getProgress();
  const anaPillarLevels = getPillarLevels(); 

  const anaDashboardData = {
    studentId: users['ana@decifra.com'].id,
    studentName: users['ana@decifra.com'].name,
    pillars: {},
  };

  pillars.forEach(pillar => {
    const lastActivityCompleted = activities
      .filter(a => a.pillar === pillar.id && anaProgressData.activityData[a.id]?.completed)
      .sort((a, b) => b.level - a.level)[0]; // Pega a atividade de maior nível

    anaDashboardData.pillars[pillar.id] = {
      level: anaPillarLevels[pillar.id] || 0,
      helps: lastActivityCompleted ? anaProgressData.activityData[lastActivityCompleted.id]?.helpLevel : 0,
    };
  });

  const otherStudentsData = mockTeacherData.map(student => ({
      studentId: Math.random(),
      studentName: student.studentName,
      pillars: Object.keys(student.progress).reduce((acc, pillarKey) => {
          acc[pillarKey] = { level: student.progress[pillarKey], helps: Math.floor(Math.random() * 3) };
          return acc;
      }, {})
  }));

  return [anaDashboardData, ...otherStudentsData];
};