/**
 * High-performance 60fps Game Engine for TypeStrike.
 * Rendered on Canvas2D with particle physics, camera shake,
 * procedural Web Audio synthesis, and real-time typing analytics.
 */

import { sound } from './audio';
import {
  Enemy,
  FloatingText,
  GameSettings,
  GameStats,
  GameStatus,
  LaserBeam,
  Particle,
  Shockwave
} from './types';
import { getRandomWord, POWER_UPS } from './words';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private settings: GameSettings;
  private status: GameStatus = 'TITLE';

  // Game entities
  private enemies: Enemy[] = [];
  private lasers: LaserBeam[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private shockwaves: Shockwave[] = [];
  private stars: { x: number; y: number; size: number; speed: number; alpha: number }[] = [];

  // Target lock
  public lockedEnemyId: string | null = null;

  // Player interceptor turret
  private turretX: number = 0;
  private turretY: number = 0;
  private turretAngle: number = -Math.PI / 2;
  private turretRecoil: number = 0;

  // Stats & Performance tracking
  private stats: GameStats = {
    score: 0,
    wpm: 0,
    peakWpm: 0,
    accuracy: 100,
    streak: 0,
    maxStreak: 0,
    totalWordsBlasted: 0,
    correctKeystrokes: 0,
    totalKeystrokes: 0,
    shield: 5,
    maxShield: 5,
    wave: 1,
    totalWaves: 10,
    timeRemaining: 120,
    missesByChar: {},
    activeBuffs: {
      freezeUntil: 0,
      overdriveUntil: 0
    }
  };

  // Keystroke timing window for WPM
  private recentKeystrokes: number[] = [];
  private gameStartTime: number = 0;

  // Game feel FX
  private cameraShakeIntensity: number = 0;
  private cameraShakeDecay: number = 0.9;
  private hitstopDuration: number = 0;
  private screenFlashAlpha: number = 0;
  private screenFlashColor: string = 'rgba(239, 68, 68, ';

  // Spawning logic
  private spawnTimer: number = 0;
  private spawnInterval: number = 2.8; // seconds
  private enemiesSpawnedInWave: number = 0;
  private maxEnemiesInWave: number = 10;
  private waveClearDelay: number = 0;

  // Animation frame
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private onStatsUpdate?: (
    stats: GameStats,
    status: GameStatus,
    lockedEnemy: Enemy | null,
    activeEnemies: Enemy[]
  ) => void;

  constructor(canvas: HTMLCanvasElement, settings: GameSettings) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D rendering context');
    this.ctx = context;
    this.settings = settings;

    this.resize();
    this.initStars();
  }

  public setOnStatsUpdate(
    callback: (
      stats: GameStats,
      status: GameStatus,
      lockedEnemy: Enemy | null,
      activeEnemies: Enemy[]
    ) => void
  ) {
    this.onStatsUpdate = callback;
  }

  public resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    this.turretX = rect.width / 2;
    this.turretY = rect.height - 45;
  }

  private initStars() {
    this.stars = [];
    const count = 90;
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 25 + 10,
        alpha: Math.random() * 0.7 + 0.3
      });
    }
  }

  public start(settings?: Partial<GameSettings>) {
    if (settings) {
      this.settings = { ...this.settings, ...settings };
    }

    const maxShield = this.settings.difficulty === 'easy' ? 6 : this.settings.difficulty === 'normal' ? 5 : 4;
    this.stats = {
      score: 0,
      wpm: 0,
      peakWpm: 0,
      accuracy: 100,
      streak: 0,
      maxStreak: 0,
      totalWordsBlasted: 0,
      correctKeystrokes: 0,
      totalKeystrokes: 0,
      shield: maxShield,
      maxShield: maxShield,
      wave: 1,
      totalWaves: 10,
      timeRemaining: this.settings.mode === 'time_attack' ? 120 : undefined,
      missesByChar: {},
      activeBuffs: {
        freezeUntil: 0,
        overdriveUntil: 0
      }
    };

    this.enemies = [];
    this.lasers = [];
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.lockedEnemyId = null;
    this.recentKeystrokes = [];
    this.gameStartTime = performance.now();
    this.cameraShakeIntensity = 0;
    this.hitstopDuration = 0;
    this.screenFlashAlpha = 0;

    this.spawnTimer = 0.5; // Quick initial spawn
    this.enemiesSpawnedInWave = 0;
    this.updateWaveConfig();

    this.status = 'PLAYING';
    this.notifyStats();

    if (!this.animationFrameId) {
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  public pause() {
    if (this.status === 'PLAYING') {
      this.status = 'PAUSED';
      this.notifyStats();
    }
  }

  public resume() {
    if (this.status === 'PAUSED') {
      this.status = 'PLAYING';
      this.lastTime = performance.now();
      this.notifyStats();
    }
  }

  public togglePause() {
    if (this.status === 'PLAYING') this.pause();
    else if (this.status === 'PAUSED') this.resume();
  }

  public getStatus(): GameStatus {
    return this.status;
  }

  public getSettings(): GameSettings {
    return this.settings;
  }

  public updateSettings(settings: Partial<GameSettings>) {
    this.settings = { ...this.settings, ...settings };
  }

  private updateWaveConfig() {
    // Dynamic spawn interval based on wave & difficulty
    const diffMultiplier =
      this.settings.difficulty === 'easy' ? 1.3 : this.settings.difficulty === 'normal' ? 1.0 : 0.8;
    this.spawnInterval = Math.max(1.1, (3.2 - this.stats.wave * 0.18) * diffMultiplier);
    this.maxEnemiesInWave = 8 + this.stats.wave * 3;
  }

  /**
   * Keyboard Input processing
   */
  public handleKeyPress(key: string) {
    if (this.status !== 'PLAYING') return;

    // Special controls
    if (key === 'Escape') {
      this.togglePause();
      return;
    }

    if (key === 'Backspace') {
      // Clear current lock-on so player can retarget!
      if (this.lockedEnemyId) {
        this.lockedEnemyId = null;
        this.notifyStats();
      }
      return;
    }

    // Only process alphanumeric or symbols if needed
    if (key.length !== 1) return;

    const char = key.toLowerCase();
    this.stats.totalKeystrokes++;

    const lockedEnemy = this.enemies.find(e => e.id === this.lockedEnemyId);

    if (lockedEnemy) {
      // Target is already locked on
      const expectedChar = lockedEnemy.word.charAt(lockedEnemy.typedIndex).toLowerCase();

      if (char === expectedChar) {
        // Correct next letter!
        this.registerHit(lockedEnemy);
      } else {
        // Wrong letter
        this.registerMiss(expectedChar);
      }
    } else {
      // No active lock: search enemies matching the first letter
      // If multiple matches, prioritize the one lowest on the screen (highest threat!)
      const matchingEnemies = this.enemies
        .filter(e => e.word.charAt(0).toLowerCase() === char)
        .sort((a, b) => b.y - a.y);

      if (matchingEnemies.length > 0) {
        const target = matchingEnemies[0];
        this.lockedEnemyId = target.id;
        this.registerHit(target);
      } else {
        // No enemy starts with this letter
        this.registerMiss(null);
      }
    }
  }

  private registerHit(enemy: Enemy) {
    enemy.typedIndex++;
    this.stats.correctKeystrokes++;
    this.stats.streak++;
    if (this.stats.streak > this.stats.maxStreak) {
      this.stats.maxStreak = this.stats.streak;
    }

    // Recalculate rolling WPM
    const now = performance.now();
    this.recentKeystrokes.push(now);
    // Keep keystrokes from last 12 seconds
    this.recentKeystrokes = this.recentKeystrokes.filter(t => now - t <= 12000);
    const windowMinutes = Math.min(12, (now - this.gameStartTime) / 1000) / 60;
    if (windowMinutes > 0.02) {
      this.stats.wpm = Math.round((this.recentKeystrokes.length / 5) / windowMinutes);
      if (this.stats.wpm > this.stats.peakWpm) {
        this.stats.peakWpm = this.stats.wpm;
      }
    }

    this.stats.accuracy = Math.round((this.stats.correctKeystrokes / this.stats.totalKeystrokes) * 100);

    // Audio feedback with pitch scaling and streak shimmer
    const progress = enemy.typedIndex / enemy.word.length;
    sound.playTypingHit(progress, this.stats.streak >= 8);

    // Aim turret at enemy
    const dx = enemy.x - this.turretX;
    const dy = enemy.y - this.turretY;
    this.turretAngle = Math.atan2(dy, dx);
    this.turretRecoil = 8;

    // Create laser beam
    const isOverdrive = performance.now() < this.stats.activeBuffs.overdriveUntil;
    const laserColor = isOverdrive ? '#c084fc' : enemy.powerUp ? '#38bdf8' : '#34d399';
    this.lasers.push({
      id: Math.random().toString(),
      x1: this.turretX + Math.cos(this.turretAngle) * 30,
      y1: this.turretY + Math.sin(this.turretAngle) * 30,
      x2: enemy.x,
      y2: enemy.y,
      progress: 0,
      color: laserColor,
      life: 0.12,
      maxLife: 0.12
    });

    // Enemy hit sparks
    enemy.hitFlashTime = 0.1;
    this.createImpactSparks(enemy.x, enemy.y, laserColor, 5);

    // Did we destroy this word?
    if (enemy.typedIndex >= enemy.word.length) {
      this.destroyEnemy(enemy);
    }

    this.notifyStats();
  }

  private registerMiss(expectedChar: string | null) {
    this.stats.streak = 0;
    this.stats.accuracy = Math.round((this.stats.correctKeystrokes / this.stats.totalKeystrokes) * 100);

    if (expectedChar) {
      this.stats.missesByChar[expectedChar] = (this.stats.missesByChar[expectedChar] || 0) + 1;
    }

    // Distinct typing miss sound feedback
    sound.playTypingMiss();
    this.cameraShakeIntensity = Math.min(this.cameraShakeIntensity + 3, 8);

    // Floating MISS cue
    const target = this.enemies.find(e => e.id === this.lockedEnemyId);
    if (target) {
      this.floatingTexts.push({
        id: Math.random().toString(),
        x: target.x,
        y: target.y - 25,
        text: 'MISS',
        color: '#f87171',
        size: 13,
        life: 0.5,
        maxLife: 0.5
      });
    }

    this.notifyStats();
  }

  private destroyEnemy(enemy: Enemy) {
    // Distinct enemy destruction sound based on craft tier
    sound.playEnemyDestruction(enemy.type);

    // Remove from active target lock
    if (this.lockedEnemyId === enemy.id) {
      this.lockedEnemyId = null;
    }

    // Hitstop freeze (35ms for standard, 80ms for boss)
    this.hitstopDuration = enemy.type === 'boss' ? 0.08 : 0.035;
    this.cameraShakeIntensity = enemy.type === 'boss' ? 14 : 7;

    // Calculate score
    const isOverdrive = performance.now() < this.stats.activeBuffs.overdriveUntil;
    const multiplier = (1 + Math.floor(this.stats.streak / 5) * 0.2) * (isOverdrive ? 2 : 1);
    const basePoints = enemy.word.length * 20;
    const earnedPoints = Math.round(basePoints * multiplier);
    this.stats.score += earnedPoints;
    this.stats.totalWordsBlasted++;

    // Floating score popup
    this.floatingTexts.push({
      id: Math.random().toString(),
      x: enemy.x,
      y: enemy.y - 20,
      text: `+${earnedPoints}`,
      color: isOverdrive ? '#e879f9' : '#fbbf24',
      size: 16,
      life: 0.8,
      maxLife: 0.8
    });

    if (this.stats.streak > 0 && this.stats.streak % 5 === 0) {
      this.floatingTexts.push({
        id: Math.random().toString(),
        x: enemy.x,
        y: enemy.y - 40,
        text: `${this.stats.streak}x STREAK!`,
        color: '#38bdf8',
        size: 14,
        life: 0.9,
        maxLife: 0.9
      });
    }

    // Explosion shockwave & debris
    this.shockwaves.push({
      x: enemy.x,
      y: enemy.y,
      radius: 10,
      maxRadius: enemy.radius * 2.8,
      color: enemy.color,
      alpha: 0.9
    });

    this.createExplosionDebris(enemy.x, enemy.y, enemy.color, enemy.type === 'boss' ? 40 : 20);

    // Power-up activation
    if (enemy.powerUp) {
      this.activatePowerUp(enemy.powerUp, enemy.x, enemy.y);
    }

    // Remove enemy
    this.enemies = this.enemies.filter(e => e.id !== enemy.id);

    // Check wave progress
    if (this.settings.mode === 'waves') {
      if (this.enemiesSpawnedInWave >= this.maxEnemiesInWave && this.enemies.length === 0) {
        this.waveComplete();
      }
    }
  }

  private activatePowerUp(powerUp: NonNullable<Enemy['powerUp']>, x: number, y: number) {
    // Distinct power-up sound signature for EMP, Freeze, Shield, and Overdrive
    sound.playPowerUpActivation(powerUp.type);

    this.floatingTexts.push({
      id: Math.random().toString(),
      x,
      y: y - 50,
      text: powerUp.label,
      color: powerUp.color,
      size: 18,
      life: 1.4,
      maxLife: 1.4
    });

    switch (powerUp.type) {
      case 'emp': {
        // Clear all non-boss enemies
        const toDestroy = [...this.enemies];
        toDestroy.forEach(e => {
          if (e.type !== 'boss') {
            this.destroyEnemy(e);
          }
        });
        this.shockwaves.push({
          x: this.turretX,
          y: this.turretY,
          radius: 20,
          maxRadius: 800,
          color: '#fbbf24',
          alpha: 1
        });
        break;
      }
      case 'freeze': {
        this.stats.activeBuffs.freezeUntil = performance.now() + 6000;
        break;
      }
      case 'shield': {
        this.stats.shield = Math.min(this.stats.shield + 1, this.stats.maxShield);
        this.screenFlashColor = 'rgba(16, 185, 129, ';
        this.screenFlashAlpha = 0.35;
        break;
      }
      case 'overdrive': {
        this.stats.activeBuffs.overdriveUntil = performance.now() + 7000;
        break;
      }
    }
  }

  private waveComplete() {
    sound.playWaveComplete();

    if (this.stats.wave >= this.stats.totalWaves) {
      // Victory!
      this.status = 'VICTORY';
      this.notifyStats();
      return;
    }

    this.stats.wave++;
    this.enemiesSpawnedInWave = 0;
    this.updateWaveConfig();

    this.floatingTexts.push({
      id: Math.random().toString(),
      x: this.turretX,
      y: this.canvas.height / (window.devicePixelRatio || 1) / 2,
      text: `WAVE ${this.stats.wave} INCOMING`,
      color: '#38bdf8',
      size: 24,
      life: 2.0,
      maxLife: 2.0
    });
  }

  private handleBreach(enemy: Enemy) {
    sound.playShieldHit();
    this.stats.shield--;
    this.stats.streak = 0;

    // Heavy damage feedback
    this.cameraShakeIntensity = 18;
    this.screenFlashColor = 'rgba(239, 68, 68, ';
    this.screenFlashAlpha = 0.55;

    this.createExplosionDebris(enemy.x, enemy.y, '#ef4444', 15);

    if (this.lockedEnemyId === enemy.id) {
      this.lockedEnemyId = null;
    }

    this.enemies = this.enemies.filter(e => e.id !== enemy.id);

    if (this.stats.shield <= 0) {
      this.gameOver();
    } else {
      this.notifyStats();
    }
  }

  private gameOver() {
    this.status = 'GAMEOVER';
    sound.playGameOver();
    this.notifyStats();
  }

  private spawnEnemy() {
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const activeWords = this.enemies.map(e => e.word);

    // 10% chance for power-up word if none currently active
    const hasActivePowerUp = this.enemies.some(e => e.powerUp !== undefined);
    const isPowerUp = !hasActivePowerUp && Math.random() < 0.12 && this.stats.wave > 1;

    let word: string;
    let powerUpData: Enemy['powerUp'] = undefined;
    let type: Enemy['type'] = 'drone';
    let color = '#38bdf8';
    let glowColor = 'rgba(56, 189, 248, 0.4)';
    let radius = 22;

    if (isPowerUp) {
      const p = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];
      word = p.word;
      powerUpData = p;
      type = 'powerup';
      color = p.color;
      glowColor = p.color;
      radius = 24;
    } else {
      // Regular or heavy
      const isBossWave = this.settings.mode === 'waves' && this.stats.wave % 5 === 0;
      const isBoss = isBossWave && this.enemiesSpawnedInWave === this.maxEnemiesInWave - 1;

      if (isBoss) {
        word = 'DREADNOUGHT';
        type = 'boss';
        color = '#f43f5e';
        glowColor = 'rgba(244, 63, 94, 0.7)';
        radius = 34;
      } else {
        word = getRandomWord(this.settings.difficulty, activeWords);
        if (this.settings.difficulty === 'easy') {
          // Easy: Gentle mint & emerald colors, clean visibility
          type = 'scout';
          color = '#10b981';
          glowColor = 'rgba(16, 185, 129, 0.4)';
          radius = 20;
        } else if (this.settings.difficulty === 'hard') {
          // Hard: Menacing crimson, violet, and high-threat accents
          type = word.length >= 7 ? 'heavy' : 'drone';
          color = word.length >= 7 ? '#f43f5e' : '#a855f7';
          glowColor = word.length >= 7 ? 'rgba(244, 63, 94, 0.55)' : 'rgba(168, 85, 247, 0.5)';
          radius = word.length >= 7 ? 27 : 21;
        } else if (this.settings.difficulty === 'code') {
          // Code: Amber terminal theme
          type = 'drone';
          color = '#f59e0b';
          glowColor = 'rgba(245, 158, 11, 0.5)';
          radius = 22;
        } else {
          // Medium / Normal: Sky blue & cyan fighters
          if (word.length >= 7) {
            type = 'heavy';
            color = '#38bdf8';
            glowColor = 'rgba(56, 189, 248, 0.5)';
            radius = 25;
          } else {
            type = 'drone';
            color = '#06b6d4';
            glowColor = 'rgba(6, 182, 212, 0.45)';
            radius = 21;
          }
        }
      }
    }

    // Safe lateral margins
    const margin = 70;
    const x = margin + Math.random() * (width - margin * 2);

    // Speed calculation
    const baseSpeed =
      this.settings.difficulty === 'easy' ? 24 : this.settings.difficulty === 'normal' ? 36 : 48;
    const speedVariation = (Math.random() * 0.4 + 0.8);
    const waveSpeedBoost = (this.stats.wave - 1) * 2.2;
    const speed = (baseSpeed + waveSpeedBoost) * speedVariation * (type === 'scout' ? 1.25 : type === 'heavy' ? 0.8 : 1.0);

    const newEnemy: Enemy = {
      id: Math.random().toString(),
      word,
      typedIndex: 0,
      x,
      y: -30,
      targetY: this.turretY,
      speed,
      type,
      hp: word.length,
      maxHp: word.length,
      radius,
      color,
      glowColor,
      powerUp: powerUpData,
      angle: Math.PI / 2,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      hitFlashTime: 0,
      scale: 1
    };

    this.enemies.push(newEnemy);
    this.enemiesSpawnedInWave++;
    this.notifyStats();
  }

  private createImpactSparks(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 120 + 40;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2.5 + 1.5,
        color,
        alpha: 1,
        life: 0.25,
        maxLife: 0.25,
        decay: 1 / 0.25
      });
    }
  }

  private createExplosionDebris(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 220 + 60;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 2,
        color: Math.random() < 0.4 ? '#f59e0b' : color,
        alpha: 1,
        life: 0.6 + Math.random() * 0.3,
        maxLife: 0.9,
        decay: 1 / 0.8
      });
    }
  }

  /**
   * Main 60fps Loop
   */
  private loop = (time: number) => {
    const rawDt = (time - this.lastTime) / 1000;
    this.lastTime = time;
    // Clamped frame delta
    const dt = Math.min(rawDt, 0.05);

    this.update(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    // Starfield animation (always runs for atmosphere)
    const height = this.canvas.height / (window.devicePixelRatio || 1);
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    for (const star of this.stars) {
      star.y += star.speed * dt;
      if (star.y > height) {
        star.y = 0;
        star.x = Math.random() * width;
      }
    }

    if (this.status !== 'PLAYING') return;

    // Hitstop handling
    if (this.hitstopDuration > 0) {
      this.hitstopDuration -= dt;
      return;
    }

    // Camera shake decay
    if (this.cameraShakeIntensity > 0) {
      this.cameraShakeIntensity *= Math.pow(this.cameraShakeDecay, dt * 60);
      if (this.cameraShakeIntensity < 0.2) this.cameraShakeIntensity = 0;
    }

    // Flash decay
    if (this.screenFlashAlpha > 0) {
      this.screenFlashAlpha = Math.max(0, this.screenFlashAlpha - dt * 2.5);
    }

    // Turret recoil recovery
    if (this.turretRecoil > 0) {
      this.turretRecoil = Math.max(0, this.turretRecoil - dt * 45);
    }

    // Time Attack timer
    if (this.settings.mode === 'time_attack' && this.stats.timeRemaining !== undefined) {
      this.stats.timeRemaining -= dt;
      if (this.stats.timeRemaining <= 0) {
        this.stats.timeRemaining = 0;
        this.status = 'VICTORY';
        sound.playWaveComplete();
        this.notifyStats();
        return;
      }
    }

    // Spawning
    const isFrozen = performance.now() < this.stats.activeBuffs.freezeUntil;
    const canSpawnMore =
      this.settings.mode !== 'waves' || this.enemiesSpawnedInWave < this.maxEnemiesInWave;

    // Concurrency limit based on difficulty
    const maxConcurrent =
      this.settings.difficulty === 'easy' ? 3 : this.settings.difficulty === 'normal' ? 5 : 7;

    if (canSpawnMore && this.enemies.length < maxConcurrent) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnEnemy();
        this.spawnTimer = this.spawnInterval;
      }
    }

    // Update Enemies
    const speedFactor = isFrozen ? 0.35 : 1.0;
    const timeSec = performance.now() / 1000;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.y += enemy.speed * speedFactor * dt;
      enemy.angle += enemy.rotationSpeed * dt;

      // Behavioral adaptation: Hard mode enemies execute evasive lateral zig-zags
      if (this.settings.difficulty === 'hard' && enemy.type !== 'boss') {
        const lateralDrift = Math.sin(timeSec * 2.5 + enemy.y * 0.03) * 35 * dt;
        const margin = 60;
        enemy.x = Math.max(margin, Math.min(width - margin, enemy.x + lateralDrift));
      }

      if (enemy.hitFlashTime > 0) {
        enemy.hitFlashTime = Math.max(0, enemy.hitFlashTime - dt);
      }

      // Check breach
      if (enemy.y >= this.turretY - 15) {
        this.handleBreach(enemy);
      }
    }

    // Update Lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];
      laser.life -= dt;
      if (laser.life <= 0) {
        this.lasers.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 35 * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 8 * dt;
      sw.alpha -= 1.8 * dt;
      if (sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  private render() {
    const ctx = this.ctx;
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    ctx.save();

    // Camera shake offset
    if (this.cameraShakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.cameraShakeIntensity * 2;
      const shakeY = (Math.random() - 0.5) * this.cameraShakeIntensity * 2;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Deep Space Canvas Clear
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);

    // 2. Cyber Horizon Grid (Subtle at bottom)
    this.renderCyberGrid(ctx, w, h);

    // 3. Starfield
    for (const star of this.stars) {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }

    // 4. Shockwaves
    for (const sw of this.shockwaves) {
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // 5. Laser Beams
    for (const laser of this.lasers) {
      const alpha = laser.life / laser.maxLife;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(laser.x1, laser.y1);
      ctx.lineTo(laser.x2, laser.y2);
      ctx.strokeStyle = laser.color;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = laser.color;
      ctx.shadowBlur = 12;
      ctx.globalAlpha = alpha;
      ctx.stroke();
      ctx.restore();
    }

    // 6. Particles
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 7. Base Shield Defense Perimeter Line
    this.renderBasePerimeter(ctx, w, h);

    // 8. Turret Interceptor
    this.renderTurret(ctx);

    // 9. Enemies & Typing Target Overlays
    for (const enemy of this.enemies) {
      this.renderEnemy(ctx, enemy);
    }

    // 10. Floating Combat Texts
    for (const ft of this.floatingTexts) {
      const alpha = ft.life / ft.maxLife;
      ctx.save();
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${ft.size}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    // 11. Fullscreen Flash (Damage / Heal)
    if (this.screenFlashAlpha > 0) {
      ctx.fillStyle = `${this.screenFlashColor}${this.screenFlashAlpha})`;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }

  private renderCyberGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();
    const horizonY = h * 0.72;
    const gridGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    gridGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    gridGrad.addColorStop(1, 'rgba(56, 189, 248, 0.08)');
    ctx.fillStyle = gridGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
    ctx.lineWidth = 1;

    // Horizontal perspective lines
    const lineCount = 7;
    for (let i = 0; i <= lineCount; i++) {
      const t = Math.pow(i / lineCount, 1.8);
      const y = horizonY + t * (h - horizonY);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderBasePerimeter(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();
    const isLowShield = this.stats.shield <= 2;
    const perimeterColor = isLowShield ? 'rgba(239, 68, 68, 0.6)' : 'rgba(56, 189, 248, 0.35)';

    ctx.strokeStyle = perimeterColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(0, this.turretY - 20);
    ctx.lineTo(w, this.turretY - 20);
    ctx.stroke();

    ctx.restore();
  }

  private renderTurret(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.turretX, this.turretY);

    // Turret base aura
    const isOverdrive = performance.now() < this.stats.activeBuffs.overdriveUntil;
    const auraColor = isOverdrive ? '#c084fc' : '#38bdf8';

    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = auraColor;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = auraColor;
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Rotating barrel
    ctx.save();
    ctx.rotate(this.turretAngle);

    // Cannon recoil
    const recoilOffset = -this.turretRecoil;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0 + recoilOffset, -4, 28, 8);
    ctx.strokeStyle = auraColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0 + recoilOffset, -4, 28, 8);

    // Barrel tip emitter
    ctx.fillStyle = auraColor;
    ctx.fillRect(26 + recoilOffset, -2, 4, 4);

    ctx.restore();

    // Center core light
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = auraColor;
    ctx.shadowBlur = 15;
    ctx.fill();

    ctx.restore();
  }

  private renderEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    ctx.save();
    const isLocked = enemy.id === this.lockedEnemyId;

    // 1. Draw Target Reticle / Lock-on Indicator
    if (isLocked) {
      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      // Lock circle
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 10, 0, Math.PI * 2);
      ctx.stroke();

      // Laser guide line from turret
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(this.turretX, this.turretY);
      ctx.lineTo(enemy.x, enemy.y);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Draw Enemy Craft
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    if (enemy.hitFlashTime > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 20;
    } else {
      ctx.fillStyle = enemy.color;
      ctx.shadowColor = enemy.glowColor;
      ctx.shadowBlur = isLocked ? 16 : 8;
    }

    // Different geometry based on type
    if (enemy.type === 'scout') {
      // Sleek Triangle interceptor
      ctx.beginPath();
      ctx.moveTo(0, enemy.radius);
      ctx.lineTo(-enemy.radius * 0.8, -enemy.radius * 0.6);
      ctx.lineTo(0, -enemy.radius * 0.2);
      ctx.lineTo(enemy.radius * 0.8, -enemy.radius * 0.6);
      ctx.closePath();
      ctx.fill();
    } else if (enemy.type === 'heavy' || enemy.type === 'boss') {
      // Hexagonal armored dreadnought
      ctx.beginPath();
      const sides = 6;
      for (let i = 0; i < sides; i++) {
        const a = (i * 2 * Math.PI) / sides;
        const px = Math.cos(a) * enemy.radius;
        const py = Math.sin(a) * enemy.radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (enemy.type === 'powerup') {
      // Pulsing Diamond
      ctx.beginPath();
      ctx.moveTo(0, -enemy.radius);
      ctx.lineTo(enemy.radius, 0);
      ctx.lineTo(0, enemy.radius);
      ctx.lineTo(-enemy.radius, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      // Standard Drone chevron
      ctx.beginPath();
      ctx.moveTo(0, enemy.radius);
      ctx.lineTo(-enemy.radius, -enemy.radius * 0.8);
      ctx.lineTo(0, -enemy.radius * 0.3);
      ctx.lineTo(enemy.radius, -enemy.radius * 0.8);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // 3. Render Typing Word Label
    this.renderWordLabel(ctx, enemy, isLocked);

    ctx.restore();
  }

  private renderWordLabel(ctx: CanvasRenderingContext2D, enemy: Enemy, isLocked: boolean) {
    ctx.save();

    const word = enemy.word;
    const typed = word.substring(0, enemy.typedIndex);
    const remaining = word.substring(enemy.typedIndex);

    ctx.font = `${isLocked ? 'bold 16px' : '600 14px'} 'JetBrains Mono', monospace`;
    const fullWidth = ctx.measureText(word).width;
    const typedWidth = ctx.measureText(typed).width;

    const badgePaddingX = 8;
    const badgeHeight = 22;
    const badgeY = enemy.y - enemy.radius - 18;
    const badgeX = enemy.x - fullWidth / 2 - badgePaddingX;

    // Label background tag
    ctx.fillStyle = isLocked ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(badgeX, badgeY - badgeHeight / 2, fullWidth + badgePaddingX * 2, badgeHeight);

    ctx.strokeStyle = isLocked ? '#f59e0b' : enemy.powerUp ? enemy.color : 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = isLocked ? 1.5 : 1;
    ctx.strokeRect(badgeX, badgeY - badgeHeight / 2, fullWidth + badgePaddingX * 2, badgeHeight);

    // Text rendering: green for typed, bright white/cyan for next letter, muted for rest
    const textStartX = enemy.x - fullWidth / 2;

    // Draw typed portion (Green / Gold)
    if (typed.length > 0) {
      ctx.fillStyle = '#34d399';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 4;
      ctx.fillText(typed, textStartX, badgeY + 5);
    }

    // Draw remaining portion
    if (remaining.length > 0) {
      // Highlight immediate next character if locked
      if (isLocked) {
        const nextChar = remaining.charAt(0);
        const restChars = remaining.substring(1);

        // Next target character (Bright amber/white)
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8;
        ctx.fillText(nextChar, textStartX + typedWidth, badgeY + 5);

        // Remaining characters (clean light slate)
        const nextCharWidth = ctx.measureText(nextChar).width;
        ctx.fillStyle = '#cbd5e1';
        ctx.shadowBlur = 0;
        ctx.fillText(restChars, textStartX + typedWidth + nextCharWidth, badgeY + 5);
      } else {
        // Not locked: First letter is slightly highlighted to aid scanning
        const firstChar = remaining.charAt(0);
        const restChars = remaining.substring(1);

        ctx.fillStyle = enemy.powerUp ? '#ffffff' : '#94a3b8';
        ctx.shadowBlur = 0;
        ctx.fillText(firstChar, textStartX, badgeY + 5);

        const firstWidth = ctx.measureText(firstChar).width;
        ctx.fillStyle = '#64748b';
        ctx.fillText(restChars, textStartX + firstWidth, badgeY + 5);
      }
    }

    ctx.restore();
  }

  private notifyStats() {
    if (this.onStatsUpdate) {
      const lockedEnemy = this.enemies.find(e => e.id === this.lockedEnemyId) || null;
      this.onStatsUpdate({ ...this.stats }, this.status, lockedEnemy, [...this.enemies]);
    }
  }

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
