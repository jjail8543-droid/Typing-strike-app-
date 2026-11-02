/**
 * Web Audio API procedural sound synthesizer for TypeStrike arcade.
 * Zero external audio assets required; ultra-low latency, crisp game feel.
 * Provides distinct audio feedback for typing hits, misses, enemy destruction,
 * and individual power-up activations.
 */

export type PowerUpSoundType = 'emp' | 'freeze' | 'shield' | 'overdrive';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private volume: number = 0.5;

  constructor() {
    const savedMute = localStorage.getItem('typestrike_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
    const savedVol = localStorage.getItem('typestrike_volume');
    if (savedVol !== null) {
      this.volume = parseFloat(savedVol);
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('typestrike_volume', this.volume.toString());
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.02);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('typestrike_muted', String(this.isMuted));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.02);
    }
    return this.isMuted;
  }

  /**
   * 1. TYPING HIT:
   * Crisp cybernetic laser click. Pitch smoothly scales upward as user types each letter,
   * with extra shimmer if on a high combo streak.
   */
  public playTypingHit(progressFraction: number = 0, isHighStreak: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Ascending frequency sweep based on progress (650Hz up to 1250Hz)
    const startFreq = 620 + progressFraction * 500;
    const endFreq = 220 + progressFraction * 180;

    osc.type = isHighStreak ? 'triangle' : 'sawtooth';
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.075);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.08);

    // Mechanical key click overtone
    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = 'sine';
    click.frequency.setValueAtTime(1400 + progressFraction * 800, t);
    clickGain.gain.setValueAtTime(0.12, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    click.connect(clickGain);
    clickGain.connect(this.masterGain);

    click.start(t);
    click.stop(t + 0.035);
  }

  /**
   * 2. TYPING MISS:
   * Low, discordant dual-oscillator digital buzz error tone.
   */
  public playTypingMiss() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Dual detuned square waves for classic arcade buzzer
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(130, t);
    osc1.frequency.linearRampToValueAtTime(75, t + 0.14);

    osc2.frequency.setValueAtTime(105, t);
    osc2.frequency.linearRampToValueAtTime(65, t + 0.14);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.linearRampToValueAtTime(120, t + 0.14);

    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.15);
    osc2.stop(t + 0.15);
  }

  /**
   * 3. ENEMY DESTRUCTION:
   * Explosive burst with dynamic weight scaling for Scout, Drone, Heavy, and Boss.
   */
  public playEnemyDestruction(type: 'scout' | 'drone' | 'heavy' | 'boss' | 'powerup' = 'drone') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const isBoss = type === 'boss' || type === 'heavy';
    const duration = isBoss ? 0.42 : 0.26;

    // Noise burst
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isBoss ? 600 : 900, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isBoss ? 0.45 : 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);

    // Sub-bass impact thud
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(isBoss ? 120 : 150, t);
    sub.frequency.exponentialRampToValueAtTime(25, t + (isBoss ? 0.35 : 0.2));

    subGain.gain.setValueAtTime(isBoss ? 0.45 : 0.35, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + (isBoss ? 0.35 : 0.2));

    sub.connect(subGain);
    subGain.connect(this.masterGain);

    sub.start(t);
    sub.stop(t + duration);
  }

  /**
   * 4. POWER-UP ACTIVATION:
   * Distinct signatures for each power-up type.
   */
  public playPowerUpActivation(type: PowerUpSoundType) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    switch (type) {
      case 'emp':
        this.playEmpSound();
        break;
      case 'freeze':
        this.playFreezeSound();
        break;
      case 'shield':
        this.playShieldRepairSound();
        break;
      case 'overdrive':
        this.playOverdriveSound();
        break;
    }
  }

  /**
   * EMP Shockwave: Charge sweep + high energy electrical blast
   */
  private playEmpSound() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Rising pre-charge
    const charge = this.ctx.createOscillator();
    const chargeGain = this.ctx.createGain();
    charge.type = 'sine';
    charge.frequency.setValueAtTime(200, t);
    charge.frequency.exponentialRampToValueAtTime(1400, t + 0.15);

    chargeGain.gain.setValueAtTime(0.05, t);
    chargeGain.gain.linearRampToValueAtTime(0.3, t + 0.15);
    chargeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    charge.connect(chargeGain);
    chargeGain.connect(this.masterGain);
    charge.start(t);
    charge.stop(t + 0.16);

    // Shockwave boom
    const boomT = t + 0.14;
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(220, boomT);
    sub.frequency.exponentialRampToValueAtTime(35, boomT + 0.4);

    subGain.gain.setValueAtTime(0.4, boomT);
    subGain.gain.exponentialRampToValueAtTime(0.001, boomT + 0.4);

    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(boomT);
    sub.stop(boomT + 0.42);
  }

  /**
   * Stasis Freeze: Glassy crystallizing chime
   */
  private playFreezeSound() {
    if (!this.ctx || !this.masterGain) return;
    const notes = [1046.5, 880, 783.99, 659.25, 523.25]; // C6, A5, G5, E5, C5
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime + idx * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  /**
   * Shield Repair: Warm restorative harmonic chord
   */
  private playShieldRepairSound() {
    if (!this.ctx || !this.masterGain) return;
    const triad = [329.63, 440, 554.37, 659.25]; // E4, A4, C#5, E5
    triad.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  /**
   * Overdrive: Ascending power turbo glissando
   */
  private playOverdriveSound() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.25);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.32);
  }

  /**
   * Shield Breach / Damage
   */
  public playShieldHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.setValueAtTime(90, t + 0.08);

    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  /**
   * Wave Complete Fanfare
   */
  public playWaveComplete() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.32);
    });
  }

  /**
   * Game Over descending motif
   */
  public playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const notes = [330, 311.13, 293.66, 261.63];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime + idx * 0.14;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.28);
    });
  }
}

export const sound = new SoundSynthesizer();
