import React from 'react';
import { Sparkles, History, Sliders, Image as ImageIcon } from 'lucide-react';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  onToggleSettings: () => void;
  isSettingsOpen: boolean;
  activeReferenceImage: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  onOpenHistory,
  onToggleSettings,
  isSettingsOpen,
  activeReferenceImage,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#1a1a1a] bg-[#0d0d0d]/90 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151515] border border-[#d4a373]/40 shadow-md">
            <Sparkles className="h-4.5 w-4.5 text-[#d4a373]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-display text-lg font-semibold tracking-tight text-white sm:text-xl">
                VIBE<span className="text-[#d4a373]">WALLS</span>
              </h1>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#d4a373] border border-[#d4a373]/30 bg-[#d4a373]/10 px-2 py-0.5 rounded-full font-medium">
                9:16 Studio
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[#666]">
              Aesthetic Wallpaper Synthesis
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {activeReferenceImage && (
            <div className="hidden items-center gap-1.5 rounded-full border border-[#d4a373]/40 bg-[#d4a373]/10 px-3 py-1 text-xs text-[#d4a373] sm:flex">
              <ImageIcon className="h-3.5 w-3.5 text-[#d4a373]" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">Remix Active</span>
            </div>
          )}

          <button
            id="settings-toggle-btn"
            type="button"
            onClick={onToggleSettings}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
              isSettingsOpen
                ? 'border-[#d4a373] bg-[#d4a373]/15 text-[#d4a373]'
                : 'border-[#222] bg-[#151515] text-[#a09890] hover:border-[#333] hover:text-white'
            }`}
            title="Adjust resolution, aspect ratio and model"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[11px] uppercase tracking-wider">Settings</span>
          </button>

          <button
            id="history-drawer-btn"
            type="button"
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 rounded-full border border-[#222] bg-[#151515] px-3.5 py-1.5 text-xs font-medium text-[#a09890] transition-all hover:border-[#333] hover:text-white"
            title="View recent wallpaper creations"
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[11px] uppercase tracking-wider">History</span>
            {historyCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#d4a373] px-1 text-[10px] font-bold text-black">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

