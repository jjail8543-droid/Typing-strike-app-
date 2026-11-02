import React from 'react';
import { RankTier } from '../game/ranking';

interface RankBadgeProps {
  rank: RankTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showDescription?: boolean;
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  size = 'md',
  showLabel = true,
  showDescription = false
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const renderInsigniaSvg = () => {
    switch (rank.id) {
      case 'novice':
        // Tier 1: Single clean chevron
        return (
          <svg className={iconSizes[size]} viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke={rank.color} strokeWidth="1.5" strokeOpacity="0.4" />
            <path d="M12 24L20 16L28 24" stroke={rank.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'rookie':
        // Tier 2: Double chevrons
        return (
          <svg className={iconSizes[size]} viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke={rank.color} strokeWidth="1.5" strokeOpacity="0.5" />
            <path d="M12 26L20 18L28 26" stroke={rank.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 20L20 14L26 20" stroke={rank.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'pilot':
        // Tier 3: Winged chevron
        return (
          <svg className={iconSizes[size]} viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke={rank.color} strokeWidth="1.5" strokeOpacity="0.6" />
            {/* Left and Right Wings */}
            <path d="M6 18L14 22L12 26L4 20Z" fill={rank.color} fillOpacity="0.8" />
            <path d="M34 18L26 22L28 26L36 20Z" fill={rank.color} fillOpacity="0.8" />
            {/* Center Shield */}
            <path d="M15 15L20 10L25 15L20 28Z" fill={rank.color} />
          </svg>
        );

      case 'sharpshooter':
        // Tier 4: Crosshair reticle with diamond core
        return (
          <svg className={iconSizes[size]} viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke={rank.color} strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="20" cy="20" r="13" stroke={rank.color} strokeWidth="1" strokeOpacity="0.7" />
            <line x1="20" y1="3" x2="20" y2="37" stroke={rank.color} strokeWidth="1.5" />
            <line x1="3" y1="20" x2="37" y2="20" stroke={rank.color} strokeWidth="1.5" />
            <rect x="16" y="16" width="8" height="8" transform="rotate(45 20 20)" fill={rank.color} />
          </svg>
        );

      case 'marksman':
        // Tier 5: Golden star with angled interceptor wings
        return (
          <svg className={iconSizes[size]} viewBox="0 0 40 40" fill="none">
            {/* Outer halo */}
            <circle cx="20" cy="20" r="18" stroke={rank.color} strokeWidth="2" />
            {/* Angular swept wings */}
            <path d="M5 14L15 22L8 28L4 22Z" fill={rank.color} />
            <path d="M35 14L25 22L32 28L36 22Z" fill={rank.color} />
            {/* Center 4-point star */}
            <polygon points="20,8 23,17 32,20 23,23 20,32 17,23 8,20 17,17" fill="#ffffff" />
            <circle cx="20" cy="20" r="3" fill={rank.color} />
          </svg>
        );

      case 'elite':
        // Tier 6: Prismatic diamond crest with dual energy blades
        return (
          <svg className={iconSizes[size]} viewBox="0 0 40 40" fill="none">
            <polygon points="20,2 38,20 20,38 2,20" stroke={rank.color} strokeWidth="2" fill="rgba(236,72,153,0.15)" />
            <polygon points="20,8 32,20 20,32 8,20" fill={rank.color} />
            <polygon points="20,13 27,20 20,27 13,20" fill="#ffffff" />
            <circle cx="20" cy="20" r="3" fill="#020617" />
          </svg>
        );

      case 'grandmaster':
      default:
        // Tier 7: Apex radiant crest with celestial crown
        return (
          <svg className={iconSizes[size]} viewBox="0 0 40 40" fill="none">
            <polygon points="20,3 37,14 37,26 20,37 3,26 3,14" stroke="#38bdf8" strokeWidth="2.5" fill="rgba(56,189,248,0.2)" />
            {/* Radiant spikes */}
            <line x1="20" y1="3" x2="20" y2="37" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="3" y1="20" x2="37" y2="20" stroke="#ffffff" strokeWidth="1.5" />
            {/* Crown peaks */}
            <path d="M10 24L15 15L20 20L25 15L30 24Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            <circle cx="20" cy="20" r="3" fill="#ffffff" />
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative flex items-center justify-center p-1.5 rounded-xl border transition-all"
        style={{
          borderColor: rank.color,
          backgroundColor: rank.accentBg,
          boxShadow: `0 0 16px ${rank.glowColor}`
        }}
      >
        {renderInsigniaSvg()}
      </div>

      {showLabel && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Rank Tier {rank.tierNumber}
            </span>
          </div>
          <span
            className="font-bold tracking-tight text-sm sm:text-base leading-tight"
            style={{ color: rank.color }}
          >
            {rank.title}
          </span>
          {showDescription && (
            <span className="text-xs text-slate-400 mt-0.5 max-w-xs">
              {rank.description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
