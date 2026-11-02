/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameHUD } from './components/GameHUD';
import { TitleScreen } from './components/TitleScreen';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { KeyboardGuide } from './components/KeyboardGuide';
import { Enemy, GameSettings, GameStats, GameStatus } from './game/types';
import { Difficulty, GameMode } from './game/words';
import { sound } from './game/audio';
import {
  calculateRank,
  getLifetimeStats,
  saveLifetimeStats,
  LifetimeStats,
  RankTier
} from './game/ranking';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // High score & WPM state from storage
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [mode, setMode] = useState<GameMode>('survival');
  const [highScore, setHighScore] = useState<number>(0);
  const [bestWpm, setBestWpm] = useState<number>(0);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());
  const [showKeyboardGuide, setShowKeyboardGuide] = useState<boolean>(false);

  // Lifetime Pilot Rank & Career Stats
  const [lifetimeStats, setLifetimeStats] = useState<LifetimeStats>(() => getLifetimeStats());
  const [rank, setRank] = useState<RankTier>(() =>
    calculateRank(lifetimeStats.avgWpm, lifetimeStats.avgAccuracy, lifetimeStats.roundsPlayed)
  );
  const [isRankUp, setIsRankUp] = useState<boolean>(false);

  // Live Game State synced from Engine
  const [status, setStatus] = useState<GameStatus>('TITLE');
  const [lockedEnemy, setLockedEnemy] = useState<Enemy | null>(null);
  const [stats, setStats] = useState<GameStats>({
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
  });

  // Load high scores for selected difficulty
  useEffect(() => {
    const savedScore = localStorage.getItem(`typestrike_score_${difficulty}`);
    const globalBestScore = localStorage.getItem('typestrike_high_score');
    const savedWpm = localStorage.getItem('typestrike_best_wpm');

    const scoreToDisplay = savedScore ? parseInt(savedScore, 10) : (globalBestScore ? parseInt(globalBestScore, 10) : 0);
    setHighScore(scoreToDisplay);
    if (savedWpm) {
      setBestWpm(parseInt(savedWpm, 10));
    }
  }, [difficulty]);

  // Handle sound mute toggle
  const handleToggleMute = useCallback(() => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Initialize GameEngine on Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const initialSettings: GameSettings = {
      difficulty,
      mode,
      showKeyboardGuide,
      soundEnabled: !isMuted
    };

    const engine = new GameEngine(canvasRef.current, initialSettings);
    engineRef.current = engine;

    engine.setOnStatsUpdate((newStats, newStatus, currentLockedEnemy) => {
      setStats(newStats);
      setStatus(newStatus);
      setLockedEnemy(currentLockedEnemy);

      // Check high scores & save lifetime stats on round finish
      if (newStatus === 'GAMEOVER' || newStatus === 'VICTORY') {
        const storedScoreStr = localStorage.getItem(`typestrike_score_${difficulty}`) || '0';
        const previousBest = parseInt(storedScoreStr, 10);

        if (newStats.score > previousBest) {
          localStorage.setItem(`typestrike_score_${difficulty}`, newStats.score.toString());
          localStorage.setItem('typestrike_high_score', newStats.score.toString());
          setHighScore(newStats.score);
          setIsNewHighScore(true);
        } else {
          setIsNewHighScore(false);
        }

        const storedWpmStr = localStorage.getItem('typestrike_best_wpm') || '0';
        const prevBestWpm = parseInt(storedWpmStr, 10);
        if (newStats.peakWpm > prevBestWpm) {
          localStorage.setItem('typestrike_best_wpm', newStats.peakWpm.toString());
          setBestWpm(newStats.peakWpm);
        }

        // Save career lifetime stats & calculate rank promotion
        const result = saveLifetimeStats({
          wpm: newStats.wpm,
          peakWpm: newStats.peakWpm,
          accuracy: newStats.accuracy,
          wordsShot: newStats.totalWordsBlasted,
          correctKeystrokes: newStats.correctKeystrokes,
          totalKeystrokes: newStats.totalKeystrokes
        });

        setLifetimeStats(result.stats);
        setRank(result.newRank);
        setIsRankUp(result.rankUp);

        if (result.rankUp) {
          sound.playWaveComplete();
        }
      }
    });

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
    };
  }, []); // Run once on mount

  // Sync settings changes to running engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateSettings({
        difficulty,
        mode,
        showKeyboardGuide,
        soundEnabled: !isMuted
      });
    }
  }, [difficulty, mode, showKeyboardGuide, isMuted]);

  // Global Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser default scrolling on space
      if (e.key === ' ' && (status === 'PLAYING' || status === 'TITLE')) {
        e.preventDefault();
      }

      // Title screen quick start
      if (status === 'TITLE') {
        if (e.key === 'Enter' || e.key === ' ') {
          handleStartGame();
        }
        return;
      }

      // Game over quick restart
      if (status === 'GAMEOVER' || status === 'VICTORY') {
        if (e.key === 'Enter') {
          handleStartGame();
        } else if (e.key === 'Escape') {
          handleReturnToHome();
        }
        return;
      }

      // Playing or paused
      if (engineRef.current) {
        engineRef.current.handleKeyPress(e.key);
      }
    };

    const handleBlur = () => {
      // Clear held keys and auto-pause on window blur if currently playing
      if (engineRef.current && status === 'PLAYING') {
        engineRef.current.pause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
    };
  }, [status, difficulty, mode]);

  const handleStartGame = () => {
    if (!engineRef.current) return;
    setIsNewHighScore(false);
    setIsRankUp(false);
    engineRef.current.start({
      difficulty,
      mode,
      showKeyboardGuide,
      soundEnabled: !isMuted
    });
  };

  const handlePause = () => {
    engineRef.current?.pause();
  };

  const handleResume = () => {
    engineRef.current?.resume();
  };

  const handleReturnToHome = () => {
    setStatus('TITLE');
    setLockedEnemy(null);
  };

  // Determine next expected character for typing guide
  const nextTargetChar = lockedEnemy ? lockedEnemy.word.charAt(lockedEnemy.typedIndex) : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 60fps Isolated WebGL / 2D Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Title Screen Overlay */}
      {status === 'TITLE' && (
        <TitleScreen
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          mode={mode}
          setMode={setMode}
          onStart={handleStartGame}
          isMuted={isMuted}
          toggleMute={handleToggleMute}
          highScore={highScore}
          bestWpm={bestWpm}
          rank={rank}
          lifetimeStats={lifetimeStats}
        />
      )}

      {/* World-Matched Low-Occlusion HUD during Active Play or Pause */}
      {(status === 'PLAYING' || status === 'PAUSED') && (
        <GameHUD
          stats={stats}
          lockedEnemy={lockedEnemy}
          mode={mode}
          onPause={handlePause}
          isMuted={isMuted}
          toggleMute={handleToggleMute}
        />
      )}

      {/* Pause Modal */}
      {status === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleStartGame}
          onHome={handleReturnToHome}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          isMuted={isMuted}
          toggleMute={handleToggleMute}
        />
      )}

      {/* Game Over / Victory Modal */}
      {(status === 'GAMEOVER' || status === 'VICTORY') && (
        <GameOverModal
          status={status}
          stats={stats}
          difficulty={difficulty}
          isNewHighScore={isNewHighScore}
          highScore={highScore}
          bestWpm={bestWpm}
          rank={rank}
          isRankUp={isRankUp}
          lifetimeStats={lifetimeStats}
          onRestart={handleStartGame}
          onHome={handleReturnToHome}
        />
      )}

      {/* Optional Touch-Typing Visual Guide */}
      {status === 'PLAYING' && showKeyboardGuide && (
        <KeyboardGuide nextChar={nextTargetChar} />
      )}

      {/* Touch-typing guide toggle affordance (bottom right, ultra-quiet) */}
      {status === 'PLAYING' && (
        <div className="absolute bottom-3 right-4 z-20 pointer-events-auto">
          <button
            onClick={() => setShowKeyboardGuide(!showKeyboardGuide)}
            className="text-[10px] font-mono uppercase tracking-wider text-slate-500 hover:text-slate-300 px-2 py-1 rounded bg-slate-900/60 border border-slate-800/80 transition-colors cursor-pointer"
          >
            {showKeyboardGuide ? 'Hide Guide' : 'Keyboard Guide'}
          </button>
        </div>
      )}
    </div>
  );
}
