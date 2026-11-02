import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-label="Network status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 border border-amber-400 px-3.5 py-2 text-xs font-mono text-slate-950 shadow-xl backdrop-blur-sm animate-in fade-in"
    >
      <WifiOff className="w-4 h-4 text-slate-950" />
      <span className="font-bold">Offline Mode:</span>
      <span>Cached Service Worker active</span>
    </aside>
  );
};
