import React from 'react';
import { RotateCcw, Home, Trophy, Zap, Target, Flame, Award, AlertCircle, ArrowUpCircle } from 'lucide-react';
import { GameStats, GameStatus } from '../game/types';
import { Difficulty } from '../game/words';
import { LifetimeStats, RankTier, getNextRankProgress } from '../game/ranking';
import { RankBadge } from './RankBadge';

interface GameOverModalProps {
  status: GameStatus;
  stats: GameStats;
  difficulty: Difficulty;
  isNewHighScore: boolean;
  highScore: number;
  bestWpm: number;
  rank: RankTier;
  isRankUp: boolean;
  lifetimeStats: LifetimeStats;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  stats,
  difficulty,
  isNewHighScore,
  highScore,
  rank,
  isRankUp,
  lifetimeStats,
  onRestart,
  onHome
}) => {
  const isVictory = status === 'VICTORY';
  const progress = getNextRankProgress(lifetimeStats.avgWpm, lifetimeStats.avgAccuracy, rank);

  // Identify top missed characters
  const missedEntries = Object.entries(stats.missesByChar)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm pointer-events-auto select-none overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl relative overflow-hidden text-center my-auto">
        {/* Glow backdrop accent */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isVictory ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />

        {/* Title */}
        <div className="relative">
          <div className="text-[11px] uppercase tracking-widest font-mono text-slate-400 mb-1">
            {difficulty.toUpperCase()} DIFFICULTY · {isVictory ? 'MISSION ACCOMPLISHED' : 'BASE SHIELD BREACHED'}
          </div>
          <h2
            className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${
              isVictory ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isVictory ? 'VICTORY SECURED' : 'MISSION TERMINATED'}
          </h2>
        </div>

        {/* Rank Promotion Banner or Current Visual Rank Badge */}
        {isRankUp ? (
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-purple-500/20 border border-amber-500/50 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="w-6 h-6 text-amber-400 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                  RANK PROMOTION UNLOCKED!
                </div>
                <div className="text-sm font-bold text-white">
                  Promoted to {rank.title} (Tier {rank.tierNumber})
                </div>
              </div>
            </div>
            <RankBadge rank={rank} size="sm" showLabel={false} />
          </div>
        ) : (
          <div className="mt-3 py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                Pilot Standing:
              </span>
              <span className="text-xs font-semibold text-slate-300">
                Career Avg: <span className="tabular-nums text-white font-mono">{lifetimeStats.avgWpm} WPM</span> · <span className="tabular-nums text-white font-mono">{lifetimeStats.avgAccuracy}% Acc</span>
              </span>
            </div>
            <RankBadge rank={rank} size="sm" showLabel={true} />
          </div>
        )}

        {/* High Score Celebration Banner */}
        {isNewHighScore && (
          <div className="mt-2.5 py-1.5 px-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>NEW PERSONAL HIGH SCORE RECORD!</span>
          </div>
        )}

        {/* Primary Score Board */}
        <div className="mt-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Score</span>
          <span className="text-3xl sm:text-4xl font-black font-mono tabular-nums text-white mt-0.5">
            {stats.score.toLocaleString()}
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Personal Best: {highScore.toLocaleString()} pts
          </span>
        </div>

        {/* Performance Stats Grid */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* WPM */}
          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex flex-col items-center">
            <Zap className="w-4 h-4 text-sky-400 mb-0.5" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">Avg Speed</span>
            <span className="text-lg font-bold font-mono tabular-nums text-white">
              {stats.wpm}
            </span>
            <span className="text-[9px] font-mono text-slate-500">Peak: {stats.peakWpm} WPM</span>
          </div>

          {/* Accuracy */}
          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex flex-col items-center">
            <Target className="w-4 h-4 text-emerald-400 mb-0.5" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">Accuracy</span>
            <span className="text-lg font-bold font-mono tabular-nums text-white">
              {stats.accuracy}%
            </span>
            <span className="text-[9px] font-mono text-slate-500">{stats.correctKeystrokes}/{stats.totalKeystrokes} Keys</span>
          </div>

          {/* Words Shot */}
          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex flex-col items-center">
            <Award className="w-4 h-4 text-purple-400 mb-0.5" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">Words Shot</span>
            <span className="text-lg font-bold font-mono tabular-nums text-white">
              {stats.totalWordsBlasted}
            </span>
            <span className="text-[9px] font-mono text-slate-500">Targets blasted</span>
          </div>

          {/* Longest Streak */}
          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex flex-col items-center">
            <Flame className="w-4 h-4 text-amber-400 mb-0.5" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">Max Streak</span>
            <span className="text-lg font-bold font-mono tabular-nums text-amber-300">
              {stats.maxStreak}x
            </span>
            <span className="text-[9px] font-mono text-slate-500">Combo streak</span>
          </div>
        </div>

        {/* Next Rank Progress Meter */}
        {progress.nextRank && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-left">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>Next Rank: <span className="text-slate-200 font-semibold">{progress.nextRank.title}</span></span>
              <span>{progress.wpmNeeded > 0 ? `+${progress.wpmNeeded} WPM needed` : 'WPM Met!'}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${progress.wpmProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Speed Booster: Weak Keys Feedback */}
        {missedEntries.length > 0 && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-left flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px]">
              <span className="font-semibold text-slate-200">Practice keys for higher rank:</span>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {missedEntries.map(([char, count]) => (
                  <span
                    key={char}
                    className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-amber-300 font-bold"
                  >
                    '{char}' <span className="text-[9px] text-slate-400 font-normal">({count})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={onRestart}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN (ENTER)</span>
          </button>

          <button
            onClick={onHome}
            className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-sm transition-all cursor-pointer border border-slate-700"
          >
            <Home className="w-4 h-4" />
            <span>MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
