/**
 * Lifetime Ranking System for TypeStrike.
 * Calculates military pilot rank based on lifetime average WPM, accuracy, and total words typed.
 */

export interface RankTier {
  id: string;
  title: string;
  minWpm: number;
  minAccuracy: number;
  tierNumber: number;
  color: string;
  glowColor: string;
  description: string;
  accentBg: string;
}

export const RANK_TIERS: RankTier[] = [
  {
    id: 'novice',
    title: 'Novice Cadet',
    minWpm: 0,
    minAccuracy: 0,
    tierNumber: 1,
    color: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    description: 'Recruit learning core touch-typing fundamentals.',
    accentBg: 'rgba(148, 163, 184, 0.1)'
  },
  {
    id: 'rookie',
    title: 'Rookie Gunner',
    minWpm: 30,
    minAccuracy: 75,
    tierNumber: 2,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    description: 'Steady turret defender with sound keyboard control.',
    accentBg: 'rgba(56, 189, 248, 0.1)'
  },
  {
    id: 'pilot',
    title: 'Combat Pilot',
    minWpm: 45,
    minAccuracy: 82,
    tierNumber: 3,
    color: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.45)',
    description: 'Fast interceptor capable of multi-target containment.',
    accentBg: 'rgba(52, 211, 153, 0.1)'
  },
  {
    id: 'sharpshooter',
    title: 'Sharpshooter',
    minWpm: 60,
    minAccuracy: 88,
    tierNumber: 4,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    description: 'High-speed marksman with sharp keystroke discipline.',
    accentBg: 'rgba(168, 85, 247, 0.1)'
  },
  {
    id: 'marksman',
    title: 'Marksman',
    minWpm: 75,
    minAccuracy: 92,
    tierNumber: 5,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.55)',
    description: 'Superior typist with rapid reflex speed and precision.',
    accentBg: 'rgba(245, 158, 11, 0.12)'
  },
  {
    id: 'elite',
    title: 'Elite Typer',
    minWpm: 90,
    minAccuracy: 94,
    tierNumber: 6,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.6)',
    description: 'Master of high-velocity space combat and code execution.',
    accentBg: 'rgba(236, 72, 153, 0.12)'
  },
  {
    id: 'grandmaster',
    title: 'Grandmaster Interceptor',
    minWpm: 105,
    minAccuracy: 96,
    tierNumber: 7,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.75)',
    description: 'Legendary keyboard ace operating at pinnacle speed.',
    accentBg: 'rgba(56, 189, 248, 0.15)'
  }
];

export interface LifetimeStats {
  roundsPlayed: number;
  totalWordsShot: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  peakWpm: number;
  avgWpm: number;
  avgAccuracy: number;
}

const STORAGE_KEY = 'typestrike_lifetime_stats_v1';

export function getLifetimeStats(): LifetimeStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore parse error
  }
  return {
    roundsPlayed: 0,
    totalWordsShot: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    peakWpm: 0,
    avgWpm: 0,
    avgAccuracy: 0
  };
}

export function saveLifetimeStats(roundStats: {
  wpm: number;
  peakWpm: number;
  accuracy: number;
  wordsShot: number;
  correctKeystrokes: number;
  totalKeystrokes: number;
}): { stats: LifetimeStats; rankUp: boolean; oldRank: RankTier; newRank: RankTier } {
  const current = getLifetimeStats();
  const oldRank = calculateRank(current.avgWpm, current.avgAccuracy, current.roundsPlayed);

  const newRounds = current.roundsPlayed + 1;
  const newWords = current.totalWordsShot + roundStats.wordsShot;
  const newTotalKeys = current.totalKeystrokes + roundStats.totalKeystrokes;
  const newCorrectKeys = current.correctKeystrokes + roundStats.correctKeystrokes;
  const newPeak = Math.max(current.peakWpm, roundStats.peakWpm, roundStats.wpm);

  // Exponential moving average for WPM with higher weight on recent practice
  const newAvgWpm = current.roundsPlayed === 0
    ? roundStats.wpm
    : Math.round(current.avgWpm * 0.7 + roundStats.wpm * 0.3);

  const newAvgAcc = newTotalKeys > 0
    ? Math.round((newCorrectKeys / newTotalKeys) * 100)
    : roundStats.accuracy;

  const updated: LifetimeStats = {
    roundsPlayed: newRounds,
    totalWordsShot: newWords,
    totalKeystrokes: newTotalKeys,
    correctKeystrokes: newCorrectKeys,
    peakWpm: newPeak,
    avgWpm: newAvgWpm,
    avgAccuracy: newAvgAcc
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // local storage full or disabled
  }

  const newRank = calculateRank(newAvgWpm, newAvgAcc, newRounds);
  const rankUp = newRank.tierNumber > oldRank.tierNumber;

  return { stats: updated, rankUp, oldRank, newRank };
}

export function calculateRank(avgWpm: number, avgAccuracy: number, roundsPlayed: number = 1): RankTier {
  if (roundsPlayed === 0) {
    return RANK_TIERS[0];
  }

  // Iterate backwards from highest rank to lowest
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    const tier = RANK_TIERS[i];
    if (avgWpm >= tier.minWpm && avgAccuracy >= tier.minAccuracy) {
      return tier;
    }
  }

  return RANK_TIERS[0];
}

export function getNextRankProgress(avgWpm: number, avgAccuracy: number, currentRank: RankTier): {
  nextRank: RankTier | null;
  wpmProgress: number; // 0 to 100
  accProgress: number; // 0 to 100
  wpmNeeded: number;
  accNeeded: number;
} {
  const currentIndex = RANK_TIERS.findIndex(r => r.id === currentRank.id);
  if (currentIndex === -1 || currentIndex >= RANK_TIERS.length - 1) {
    return {
      nextRank: null,
      wpmProgress: 100,
      accProgress: 100,
      wpmNeeded: 0,
      accNeeded: 0
    };
  }

  const next = RANK_TIERS[currentIndex + 1];
  const wpmDiff = next.minWpm - currentRank.minWpm;
  const wpmProgress = Math.max(0, Math.min(100, Math.round(((avgWpm - currentRank.minWpm) / wpmDiff) * 100)));
  const accProgress = Math.max(0, Math.min(100, Math.round((avgAccuracy / next.minAccuracy) * 100)));

  return {
    nextRank: next,
    wpmProgress,
    accProgress,
    wpmNeeded: Math.max(0, next.minWpm - avgWpm),
    accNeeded: Math.max(0, next.minAccuracy - avgAccuracy)
  };
}
