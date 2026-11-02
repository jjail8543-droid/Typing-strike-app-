import React, { useRef, useState, useEffect } from 'react';
import { Delete, Smartphone, ChevronDown, ChevronUp, Keyboard as KeyboardIcon } from 'lucide-react';
import { Enemy } from '../game/types';

interface VirtualKeyboardProps {
  onKeyPress: (char: string) => void;
  lockedEnemy: Enemy | null;
  activeEnemies: Enemy[];
  isGameActive: boolean;
}

const KEYBOARD_LAYOUT = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  lockedEnemy,
  activeEnemies,
  isGameActive
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  // Compute target characters
  const nextTargetChar = lockedEnemy
    ? lockedEnemy.word.charAt(lockedEnemy.typedIndex).toLowerCase()
    : null;

  // Set of starting letters of all current enemy threats
  const availableStarters = new Set(
    activeEnemies.map(e => e.word.charAt(0).toLowerCase())
  );

  const handleKeyTrigger = (key: string) => {
    setLastPressedKey(key);
    setTimeout(() => setLastPressedKey(null), 120);
    onKeyPress(key);
  };

  const handleHiddenInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length > 0) {
      const char = val.charAt(val.length - 1);
      onKeyPress(char);
      e.target.value = '';
    }
  };

  const handleHiddenInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      onKeyPress('Backspace');
    } else if (e.key === 'Escape') {
      onKeyPress('Escape');
    }
  };

  const focusNativeKeyboard = () => {
    hiddenInputRef.current?.focus();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 flex flex-col items-center pointer-events-auto select-none pb-2 sm:pb-3 px-2">
      {/* Hidden input to summon phone/tablet native soft keyboard */}
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="text"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className="sr-only"
        onChange={handleHiddenInput}
        onKeyDown={handleHiddenInputKeyDown}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Top Bar over keyboard: toggle collapse & native keyboard button */}
      <div className="w-full max-w-xl flex items-center justify-between px-2 mb-1 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px] font-mono"
            title={isCollapsed ? 'Show Virtual Keyboard' : 'Hide Virtual Keyboard'}
          >
            <KeyboardIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>{isCollapsed ? 'Show Keyboard' : 'Hide'}</span>
            {isCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Quick Target status hint */}
          {nextTargetChar && !isCollapsed && (
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 ml-1">
              Next Key: <span className="text-amber-400 font-bold uppercase px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">[{nextTargetChar}]</span>
            </span>
          )}
        </div>

        {/* Native mobile keyboard trigger */}
        <button
          onClick={focusNativeKeyboard}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer text-[11px] font-mono"
          title="Open your device's native on-screen keyboard"
        >
          <Smartphone className="w-3 h-3 text-sky-400" />
          <span>Native Keyboard</span>
        </button>
      </div>

      {/* Virtual Keyboard Matrix */}
      {!isCollapsed && (
        <div className="w-full max-w-xl rounded-2xl bg-slate-950/85 border border-slate-800/90 p-1.5 sm:p-2.5 shadow-2xl backdrop-blur-md flex flex-col items-center gap-1.5 touch-manipulation">
          {/* Row 1 */}
          <div className="flex justify-center gap-1 sm:gap-1.5 w-full">
            {KEYBOARD_LAYOUT[0].map(key => {
              const isTarget = nextTargetChar === key;
              const isStarter = !nextTargetChar && availableStarters.has(key);
              const isPressed = lastPressedKey === key;

              return (
                <button
                  key={key}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleKeyTrigger(key);
                  }}
                  className={`flex-1 max-w-[48px] h-10 sm:h-12 rounded-lg font-mono font-bold text-sm sm:text-base uppercase flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
                    isTarget
                      ? 'bg-amber-400 text-slate-950 scale-105 shadow-[0_0_16px_rgba(251,191,36,0.9)] ring-2 ring-white z-10 font-black'
                      : isStarter
                      ? 'bg-sky-950/80 border border-sky-400/80 text-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                      : isPressed
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>

          {/* Row 2 */}
          <div className="flex justify-center gap-1 sm:gap-1.5 w-[94%]">
            {KEYBOARD_LAYOUT[1].map(key => {
              const isTarget = nextTargetChar === key;
              const isStarter = !nextTargetChar && availableStarters.has(key);
              const isPressed = lastPressedKey === key;

              return (
                <button
                  key={key}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleKeyTrigger(key);
                  }}
                  className={`flex-1 max-w-[48px] h-10 sm:h-12 rounded-lg font-mono font-bold text-sm sm:text-base uppercase flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
                    isTarget
                      ? 'bg-amber-400 text-slate-950 scale-105 shadow-[0_0_16px_rgba(251,191,36,0.9)] ring-2 ring-white z-10 font-black'
                      : isStarter
                      ? 'bg-sky-950/80 border border-sky-400/80 text-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                      : isPressed
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>

          {/* Row 3 with Backspace & Spacebar */}
          <div className="flex justify-center gap-1 sm:gap-1.5 w-full">
            {/* Backspace / Retarget key */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleKeyTrigger('Backspace');
              }}
              className="flex-1 max-w-[62px] h-10 sm:h-12 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 hover:bg-rose-900 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              title="Clear Target Lock (Backspace)"
            >
              <Delete className="w-4 h-4" />
            </button>

            {KEYBOARD_LAYOUT[2].map(key => {
              const isTarget = nextTargetChar === key;
              const isStarter = !nextTargetChar && availableStarters.has(key);
              const isPressed = lastPressedKey === key;

              return (
                <button
                  key={key}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleKeyTrigger(key);
                  }}
                  className={`flex-1 max-w-[48px] h-10 sm:h-12 rounded-lg font-mono font-bold text-sm sm:text-base uppercase flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
                    isTarget
                      ? 'bg-amber-400 text-slate-950 scale-105 shadow-[0_0_16px_rgba(251,191,36,0.9)] ring-2 ring-white z-10 font-black'
                      : isStarter
                      ? 'bg-sky-950/80 border border-sky-400/80 text-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                      : isPressed
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {key}
                </button>
              );
            })}

            {/* Space Bar / Action */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleKeyTrigger(' ');
              }}
              className="flex-1 max-w-[70px] h-10 sm:h-12 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-mono font-bold flex items-center justify-center cursor-pointer active:scale-95"
              title="Spacebar"
            >
              SPACE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
