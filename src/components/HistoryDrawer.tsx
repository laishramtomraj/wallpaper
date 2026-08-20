import React from 'react';
import { WallpaperBatch, WallpaperItem } from '../types';
import { X, Trash2, Clock, Sparkles, Download, RefreshCw, ChevronRight } from 'lucide-react';
import { downloadImage, sanitizeFilename } from '../utils/downloadHelper';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  batches: WallpaperBatch[];
  onSelectBatch: (batch: WallpaperBatch) => void;
  onSelectWallpaper: (wallpaper: WallpaperItem, batch: WallpaperBatch) => void;
  onClearHistory: () => void;
  onRemix: (wallpaper: WallpaperItem) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  batches,
  onSelectBatch,
  onSelectWallpaper,
  onClearHistory,
  onRemix,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md transition-all">
      <div className="flex h-full w-full max-w-md flex-col border-l border-[#1a1a1a] bg-[#0d0d0d] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-[#d4a373]" />
            <h3 className="font-serif-display text-sm font-semibold tracking-tight text-white uppercase">
              Synthesis Archive
            </h3>
            <span className="rounded-full bg-[#151515] border border-[#222] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#d4a373]">
              {batches.length} Batches
            </span>
          </div>
          <div className="flex items-center gap-2">
            {batches.length > 0 && (
              <button
                id="clear-all-history-btn"
                type="button"
                onClick={onClearHistory}
                className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-[#888] hover:text-rose-400 transition-colors"
                title="Clear all saved history"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              id="close-history-drawer-btn"
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#222] bg-[#151515] text-[#888] hover:border-[#333] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">
          {batches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-[#555]">
              <Sparkles className="h-8 w-8 text-[#333] mb-3" />
              <p className="text-xs uppercase tracking-widest font-semibold text-[#888]">No Batches Generated Yet</p>
              <p className="text-xs text-[#555] max-w-xs mt-1.5 leading-relaxed">
                Your synthesized 4-variation wallpaper sets will automatically archive here.
              </p>
            </div>
          ) : (
            batches.map((batch) => (
              <div
                key={batch.id}
                className="rounded-2xl border border-[#222] bg-[#121212] p-4 transition-all hover:border-[#d4a373]/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-[#666]">
                    {new Date(batch.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#888]">
                    <span className="rounded border border-[#222] bg-[#181818] px-1.5 py-0.5 text-[#aaa]">{batch.aspectRatio}</span>
                    <span className="rounded border border-[#222] bg-[#181818] px-1.5 py-0.5 text-[#aaa]">{batch.imageSize}</span>
                  </div>
                </div>

                <p className="text-xs font-medium text-[#d0c8c0] line-clamp-2 mb-3">
                  "{batch.vibePrompt}"
                </p>

                {/* 4 Thumbnails Grid */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {batch.wallpapers.map((wp, idx) => (
                    <div
                      key={wp.id || idx}
                      onClick={() => onSelectWallpaper(wp, batch)}
                      className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-xl border border-[#222] bg-black transition-all hover:scale-105 hover:border-[#d4a373]"
                    >
                      <img
                        src={wp.imageUrl}
                        alt={`Variation ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a] text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectBatch(batch);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-[#d4a373] hover:text-white transition-colors"
                  >
                    <span>Load Batch to Canvas</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

