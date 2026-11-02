import React, { useState } from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Difficulty } from '../game/words';
import { sound } from '../game/audio';
import { PWAInstallButton } from './PWAInstallButton';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  difficulty,
  setDifficulty,
  isMuted,
  toggleMute
}) => {
  const [volume, setVolume] = useState<number>(() => sound.getVolume());

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    sound.setVolume(val);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-[2px] pointer-events-auto select-none">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-1">
          GAME PAUSED
        </h2>
        <p className="text-xs text-slate-400 font-mono mb-4">
          Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Esc</kbd> to resume combat
        </p>

        {/* Difficulty quick switcher */}
        <div className="mb-4 text-left">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
            Difficulty:
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setDifficulty('easy')}
              className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                difficulty === 'easy' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => setDifficulty('normal')}
              className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                difficulty === 'normal' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setDifficulty('hard')}
              className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                difficulty === 'hard' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hard
            </button>
          </div>
        </div>

        {/* Audio Controls & Sound Effects Preview */}
        <div className="mb-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-300">Sound Effects FX</span>
            <button
              onClick={toggleMute}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-xs font-mono text-slate-200 hover:text-white border border-slate-700 cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isMuted ? 'Muted' : 'Sound ON'}</span>
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono text-slate-500 w-10">Vol:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              disabled={isMuted}
              className="flex-1 accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-400 w-8 tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Distinct Audio Feedback Test Triggers */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
              Test Audio Feedback:
            </div>
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => sound.playTypingHit(0.5)}
                className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-emerald-400 cursor-pointer"
                title="Test typing hit laser"
              >
                Hit
              </button>
              <button
                type="button"
                onClick={() => sound.playTypingMiss()}
                className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-rose-400 cursor-pointer"
                title="Test wrong key error buzzer"
              >
                Miss
              </button>
              <button
                type="button"
                onClick={() => sound.playEnemyDestruction('drone')}
                className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-amber-400 cursor-pointer"
                title="Test enemy explosion"
              >
                Boom
              </button>
              <button
                type="button"
                onClick={() => sound.playPowerUpActivation('emp')}
                className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-cyan-400 cursor-pointer"
                title="Test powerup chime"
              >
                Power
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2">
          <button
            onClick={onResume}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm tracking-wide transition-all cursor-pointer shadow-md shadow-sky-500/20"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>RESUME (ESC)</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART ROUND</span>
          </button>

          <div className="flex justify-center py-1">
            <PWAInstallButton className="w-full justify-center" />
          </div>

          <button
            onClick={onHome}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-slate-400 hover:text-slate-200 font-medium text-xs transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>RETURN TO MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
