import React from 'react';
import { Shield, Zap, Target, Flame, Pause, Volume2, VolumeX, Clock } from 'lucide-react';
import { Enemy, GameStats } from '../game/types';
import { GameMode } from '../game/words';

interface GameHUDProps {
  stats: GameStats;
  lockedEnemy: Enemy | null;
  mode: GameMode;
  onPause: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  lockedEnemy,
  mode,
  onPause,
  isMuted,
  toggleMute
}) => {
  const isFreezeActive = stats.activeBuffs.freezeUntil > performance.now();
  const freezeSeconds = Math.max(0, Math.ceil((stats.activeBuffs.freezeUntil - performance.now()) / 1000));

  const isOverdriveActive = stats.activeBuffs.overdriveUntil > performance.now();
  const overdriveSeconds = Math.max(0, Math.ceil((stats.activeBuffs.overdriveUntil - performance.now()) / 1000));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Perimeter Cluster */}
      <header className="flex items-start justify-between w-full">
        {/* Left Status: Shield / Hull & Mission State */}
        <div className="flex flex-col gap-2">
          {/* Hull Integrity */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/85 border border-slate-800 pointer-events-auto">
            <Shield className={`w-4 h-4 ${stats.shield <= 2 ? 'text-rose-500 animate-pulse' : 'text-sky-400'}`} />
            <span className="text-xs font-mono text-slate-400">SHIELD:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: stats.maxShield }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-4 rounded-xs transition-colors ${
                    i < stats.shield
                      ? stats.shield <= 2
                        ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)]'
                        : 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-mono font-bold tabular-nums text-slate-200 ml-1">
              {stats.shield}/{stats.maxShield}
            </span>
          </div>

          {/* Mode-specific tracker: Wave or Time Remaining */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/85 border border-slate-800 pointer-events-auto text-xs font-mono text-slate-300">
            {mode === 'time_attack' && stats.timeRemaining !== undefined ? (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">TIME:</span>
                <span className={`font-bold tabular-nums ${stats.timeRemaining <= 15 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                  {formatTime(stats.timeRemaining)}
                </span>
              </>
            ) : mode === 'waves' ? (
              <>
                <Target className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-slate-400">WAVE:</span>
                <span className="font-bold tabular-nums text-white">
                  {stats.wave} / {stats.totalWaves}
                </span>
              </>
            ) : (
              <>
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">ENEMIES BLOCKED:</span>
                <span className="font-bold tabular-nums text-white">{stats.totalWordsBlasted}</span>
              </>
            )}
          </div>

          {/* Active Buff Indicators */}
          {(isFreezeActive || isOverdriveActive) && (
            <div className="flex items-center gap-2 mt-1">
              {isFreezeActive && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>STASIS ({freezeSeconds}s)</span>
                </div>
              )}
              {isOverdriveActive && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-mono">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>2x OVERDRIVE ({overdriveSeconds}s)</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Active Target Word HUD (helps focus attention) */}
        {lockedEnemy && (
          <div className="hidden sm:flex flex-col items-center px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400 mb-0.5">
              Locked Intercept
            </div>
            <div className="font-mono text-xl tracking-wider font-bold">
              <span className="text-emerald-400">{lockedEnemy.word.substring(0, lockedEnemy.typedIndex)}</span>
              <span className="text-amber-300 underline underline-offset-4 decoration-2">
                {lockedEnemy.word.charAt(lockedEnemy.typedIndex)}
              </span>
              <span className="text-slate-400">{lockedEnemy.word.substring(lockedEnemy.typedIndex + 1)}</span>
            </div>
          </div>
        )}

        {/* Right Status Cluster: WPM, Accuracy, Streak, Score & Controls */}
        <div className="flex flex-col items-end gap-2">
          {/* Performance Metas */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-slate-900/85 border border-slate-800 pointer-events-auto">
            {/* WPM */}
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-400" />
              <div className="flex flex-col leading-none">
                <span className="text-[10px] text-slate-400 font-mono">SPEED</span>
                <span className="text-sm font-bold font-mono tabular-nums text-white">
                  {stats.wpm} <span className="text-[10px] text-slate-400 font-normal">WPM</span>
                </span>
              </div>
            </div>

            <div className="w-px h-6 bg-slate-800" />

            {/* Accuracy */}
            <div className="flex flex-col leading-none">
              <span className="text-[10px] text-slate-400 font-mono">ACC</span>
              <span className="text-sm font-bold font-mono tabular-nums text-slate-200">
                {stats.accuracy}%
              </span>
            </div>

            <div className="w-px h-6 bg-slate-800" />

            {/* Streak */}
            <div className="flex items-center gap-1">
              <Flame className={`w-3.5 h-3.5 ${stats.streak >= 10 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
              <div className="flex flex-col leading-none">
                <span className="text-[10px] text-slate-400 font-mono">STREAK</span>
                <span className="text-sm font-bold font-mono tabular-nums text-amber-300">
                  {stats.streak}x
                </span>
              </div>
            </div>
          </div>

          {/* Score & Quick Controls */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Score */}
            <div className="px-3 py-1 rounded-lg bg-slate-900/85 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400 mr-1.5">SCORE:</span>
              <span className="font-bold tabular-nums text-amber-400 text-sm">
                {stats.score.toLocaleString()}
              </span>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg bg-slate-900/85 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
              aria-label="Toggle Sound"
              title="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Pause Button */}
            <button
              onClick={onPause}
              className="p-1.5 rounded-lg bg-slate-900/85 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
              aria-label="Pause Game"
              title="Pause Game (Esc)"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom control reminder (ultra-quiet) */}
      <footer className="w-full flex justify-between items-end text-[11px] font-mono text-slate-500">
        <div>
          <span>Targeting: Type starting letter</span>
          <span className="mx-2 text-slate-700">·</span>
          <span>Switch: <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">Backspace</kbd></span>
        </div>
        <div>
          <span>Pause: <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">Esc</kbd></span>
        </div>
      </footer>
    </div>
  );
};
