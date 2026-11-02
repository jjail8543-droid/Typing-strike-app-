/**
 * Data structures and state definitions for TypeStrike.
 */

import { Difficulty, GameMode, PowerUpWord } from './words';

export type GameStatus = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

export type EnemyType = 'scout' | 'drone' | 'heavy' | 'boss' | 'powerup';

export interface Enemy {
  id: string;
  word: string;
  typedIndex: number;
  x: number;
  y: number;
  targetY: number;
  speed: number;
  type: EnemyType;
  hp: number;
  maxHp: number;
  radius: number;
  color: string;
  glowColor: string;
  powerUp?: PowerUpWord;
  // Visual animation props
  angle: number;
  rotationSpeed: number;
  hitFlashTime: number; // in seconds
  scale: number;
}

export interface LaserBeam {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  decay: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

export interface GameStats {
  score: number;
  wpm: number;
  peakWpm: number;
  accuracy: number;
  streak: number;
  maxStreak: number;
  totalWordsBlasted: number;
  correctKeystrokes: number;
  totalKeystrokes: number;
  shield: number;
  maxShield: number;
  wave: number;
  totalWaves: number;
  timeRemaining?: number; // for time attack
  missesByChar: Record<string, number>;
  activeBuffs: {
    freezeUntil: number;
    overdriveUntil: number;
  };
}

export interface GameSettings {
  difficulty: Difficulty;
  mode: GameMode;
  showKeyboardGuide: boolean;
  soundEnabled: boolean;
}
