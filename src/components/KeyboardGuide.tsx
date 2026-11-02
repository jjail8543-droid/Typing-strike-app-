import React from 'react';

interface KeyboardGuideProps {
  nextChar: string | null;
}

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

export const KeyboardGuide: React.FC<KeyboardGuideProps> = ({ nextChar }) => {
  const activeKey = nextChar ? nextChar.toLowerCase() : null;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none select-none z-10 flex flex-col items-center gap-1 opacity-75 hover:opacity-100 transition-opacity">
      {KEYBOARD_ROWS.map((row, rIdx) => (
        <div key={rIdx} className="flex gap-1">
          {row.map(k => {
            const isTarget = activeKey === k;
            return (
              <div
                key={k}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-[11px] font-mono font-bold uppercase transition-all ${
                  isTarget
                    ? 'bg-amber-400 text-slate-950 scale-110 shadow-[0_0_12px_rgba(251,191,36,0.9)] ring-2 ring-white z-10'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400'
                }`}
              >
                {k}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
