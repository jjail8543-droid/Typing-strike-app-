import React from 'react';
import { Play, Volume2, VolumeX, Zap, Trophy, Shield, Award, ChevronRight } from 'lucide-react';
import { Difficulty, GameMode } from '../game/words';
import { LifetimeStats, RankTier, getNextRankProgress } from '../game/ranking';
import { RankBadge } from './RankBadge';

interface TitleScreenProps {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  mode: GameMode;
  setMode: (m: GameMode) => void;
  onStart: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  highScore: number;
  bestWpm: number;
  rank: RankTier;
  lifetimeStats: LifetimeStats;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  difficulty,
  setDifficulty,
  mode,
  setMode,
  onStart,
  isMuted,
  toggleMute,
  highScore,
  bestWpm,
  rank,
  lifetimeStats
}) => {
  const progress = getNextRankProgress(lifetimeStats.avgWpm, lifetimeStats.avgAccuracy, rank);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-4 sm:p-8 pointer-events-auto bg-slate-950/65 backdrop-blur-[2px] overflow-y-auto">
      {/* Top Bar: Pilot Rank Badge & Audio Mute Toggle */}
      <header className="w-full max-w-4xl flex items-center justify-between text-xs font-mono text-slate-400 gap-4">
        {/* Pilot Identity & Rank Badge */}
        <div className="flex items-center gap-3">
          <RankBadge rank={rank} size="sm" showLabel={true} />
          <div className="hidden sm:flex items-center gap-2 text-slate-500 pl-2 border-l border-slate-800">
            <span>CAREER: <span className="text-slate-300 tabular-nums">{lifetimeStats.avgWpm} WPM</span></span>
            <span>·</span>
            <span>ACC: <span className="text-slate-300 tabular-nums">{lifetimeStats.avgAccuracy}%</span></span>
            <span>·</span>
            <span>ROUNDS: <span className="text-slate-300 tabular-nums">{lifetimeStats.roundsPlayed}</span></span>
          </div>
        </div>

        {/* Records & Audio Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 text-slate-400">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
              <span>BEST:</span>
              <span className="font-bold tabular-nums text-slate-200">{highScore.toLocaleString()}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Zap className="w-3.5 h-3.5" />
              <span>PEAK:</span>
              <span className="font-bold tabular-nums text-slate-200">{bestWpm} WPM</span>
            </div>
          </div>

          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="text-[11px] uppercase tracking-wider">{isMuted ? 'Muted' : 'Sound ON'}</span>
          </button>
        </div>
      </header>

      {/* Main Centerpiece */}
      <main className="flex flex-col items-center text-center max-w-2xl my-auto py-4">
        {/* Custom SVG Title Lockup */}
        <div className="relative mb-2 flex flex-col items-center">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 mb-2 drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]" viewBox="0 0 100 100" fill="none">
            <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" stroke="#38bdf8" strokeWidth="2.5" fill="rgba(15,23,42,0.6)" />
            <line x1="50" y1="18" x2="50" y2="82" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            <line x1="18" y1="50" x2="82" y2="50" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            <polygon points="50,22 45,55 55,55" fill="#f59e0b" />
            <circle cx="50" cy="55" r="9" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="50" cy="55" r="3" fill="#ffffff" />
            <circle cx="50" cy="22" r="2.5" fill="#fbbf24" />
          </svg>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase select-none">
            TYPE<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-400">STRIKE</span>
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-normal max-w-md">
            Boost your typing speed and accuracy by shooting down incoming hostile drones with rapid-fire keyboard strikes.
          </p>
        </div>

        {/* Pilot Progression Card */}
        {progress.nextRank && (
          <div className="w-full max-w-lg mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Next Rank Progression:</span>
              <span className="font-semibold text-slate-200">
                {progress.nextRank.title} (Tier {progress.nextRank.tierNumber})
              </span>
            </div>

            {/* Progression Meters */}
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-0.5">
                  <span>WPM: {lifetimeStats.avgWpm} / {progress.nextRank.minWpm}</span>
                  <span>{progress.wpmProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress.wpmProgress}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-0.5">
                  <span>Accuracy: {lifetimeStats.avgAccuracy}% / {progress.nextRank.minAccuracy}%</span>
                  <span>{progress.accProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress.accProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Selectors */}
        <div className="w-full max-w-lg mt-4 space-y-3">
          {/* Game Mode */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-mono mb-1.5 text-left">
              Select Mission Mode
            </div>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
              <button
                onClick={() => setMode('survival')}
                className={`py-2 px-3 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === 'survival'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Survival
              </button>
              <button
                onClick={() => setMode('waves')}
                className={`py-2 px-3 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === 'waves'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Wave Blitz
              </button>
              <button
                onClick={() => setMode('time_attack')}
                className={`py-2 px-3 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === 'time_attack'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2-Min Sprint
              </button>
            </div>
          </div>

          {/* Vocabulary Difficulty */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-mono mb-1.5 text-left">
              Difficulty & Enemy Threat Level
            </div>
            <div className="grid grid-cols-4 gap-2 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
              <button
                onClick={() => setDifficulty('easy')}
                className={`py-2 px-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  difficulty === 'easy'
                    ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Easy (Slow)
              </button>
              <button
                onClick={() => setDifficulty('normal')}
                className={`py-2 px-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  difficulty === 'normal'
                    ? 'bg-sky-600 text-white font-semibold shadow-md shadow-sky-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setDifficulty('hard')}
                className={`py-2 px-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  difficulty === 'hard'
                    ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hard (Fast)
              </button>
              <button
                onClick={() => setDifficulty('code')}
                className={`py-2 px-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  difficulty === 'code'
                    ? 'bg-amber-600 text-white font-semibold shadow-md shadow-amber-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dev Code
              </button>
            </div>
          </div>
        </div>

        {/* Primary Start CTA Button */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-base tracking-wide shadow-[0_0_25px_rgba(56,189,248,0.4)] hover:shadow-[0_0_35px_rgba(56,189,248,0.6)] transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>START MISSION</span>
          </button>

          <span className="text-[11px] font-mono text-slate-500">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Enter</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Space</kbd> to Launch
          </span>
        </div>
      </main>

      {/* Footer: Control Hint Line */}
      <footer className="w-full text-center text-xs text-slate-500 font-mono py-2">
        <span>Type starting letter to lock</span>
        <span className="mx-2 text-slate-700">·</span>
        <span>Backspace resets lock</span>
        <span className="mx-2 text-slate-700">·</span>
        <span>Esc pauses game</span>
      </footer>
    </div>
  );
};
