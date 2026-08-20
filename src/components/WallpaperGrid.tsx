import React from 'react';
import { WallpaperItem } from '../types';
import { Download, RefreshCw, Maximize2, Sparkles, Layers } from 'lucide-react';
import { downloadImage, sanitizeFilename } from '../utils/downloadHelper';

interface WallpaperGridProps {
  wallpapers: WallpaperItem[];
  isGenerating: boolean;
  onSelectWallpaper: (wallpaper: WallpaperItem, index: number) => void;
  onRemix: (wallpaper: WallpaperItem) => void;
  aspectRatio: string;
  generationProgressText?: string;
}

export const WallpaperGrid: React.FC<WallpaperGridProps> = ({
  wallpapers,
  isGenerating,
  onSelectWallpaper,
  onRemix,
  aspectRatio,
  generationProgressText,
}) => {
  // Determine aspect ratio class
  const getAspectClass = (ratio: string) => {
    switch (ratio) {
      case '9:16':
        return 'aspect-[9/16]';
      case '1:1':
        return 'aspect-square';
      case '2:3':
        return 'aspect-[2/3]';
      case '3:2':
        return 'aspect-[3/2]';
      case '3:4':
        return 'aspect-[3/4]';
      case '4:3':
        return 'aspect-[4/3]';
      case '16:9':
        return 'aspect-[16/9]';
      case '21:9':
        return 'aspect-[21/9]';
      default:
        return 'aspect-[9/16]';
    }
  };

  const currentAspectClass = getAspectClass(aspectRatio);

  const handleQuickDownload = (e: React.MouseEvent, wp: WallpaperItem) => {
    e.stopPropagation();
    const filename = sanitizeFilename(wp.prompt, `v${wp.variationIndex + 1}`);
    downloadImage(wp.imageUrl, filename);
  };

  const handleQuickRemix = (e: React.MouseEvent, wp: WallpaperItem) => {
    e.stopPropagation();
    onRemix(wp);
  };

  if (isGenerating) {
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4a373] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4a373]"></span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#d4a373]">
              {generationProgressText || 'Synthesizing 4 Variation Canvases...'}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[#555]">01 — 04 Batch</span>
        </div>

        {/* 4 Shimmer Loading Skeleton Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d] ${currentAspectClass} flex flex-col items-center justify-center p-4`}
            >
              {/* Shimmer wave effect */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#d4a373]/10 to-transparent" />
              
              <div className="relative flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#151515] border border-[#222] text-[#d4a373]">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#888]">Variation 0{i}</span>
                <span className="text-[9px] uppercase tracking-widest text-[#555]">Rendering 4K Nuance</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (wallpapers.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-[#d4a373]" />
          <span className="text-[10px] uppercase tracking-widest text-[#888] font-bold">Variations</span>
          <span className="rounded-full bg-[#151515] border border-[#222] px-2 py-0.5 text-[9px] uppercase tracking-widest text-[#666]">
            Interactive Gallery
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-[#666]">
          01 — 0{wallpapers.length}
        </span>
      </div>

      {/* Responsive 4 variations grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {wallpapers.map((wallpaper, index) => {
          const itemAspectClass = getAspectClass(wallpaper.aspectRatio || aspectRatio);
          return (
            <div
              key={wallpaper.id || index}
              id={`wallpaper-card-${index}`}
              onClick={() => onSelectWallpaper(wallpaper, index)}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-[#222] bg-[#0d0d0d] shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-[#d4a373] hover:shadow-[0_0_30px_rgba(212,163,115,0.15)] ${itemAspectClass}`}
            >
              {/* Wallpaper Image */}
              <img
                src={wallpaper.imageUrl}
                alt={wallpaper.prompt || `Wallpaper Variation ${index + 1}`}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 opacity-70 transition-opacity group-hover:opacity-85" />

              {/* Top Variation Badge */}
              <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                <span className="rounded-full border border-white/10 bg-black/80 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#d4a373] backdrop-blur-md">
                  0{index + 1}
                </span>
                {wallpaper.referenceImageUsed && (
                  <span className="rounded-full border border-[#d4a373]/40 bg-[#d4a373]/20 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#d4a373] backdrop-blur-md">
                    Remix
                  </span>
                )}
              </div>

              {/* Hover Fullscreen Indicator */}
              <div className="absolute right-2.5 top-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/80 border border-white/10 text-[#d4a373] backdrop-blur-md">
                  <Maximize2 className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#e0d8d0] truncate max-w-[80px] sm:max-w-[100px]">
                    {wallpaper.variationLabel || `Variation ${index + 1}`}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      id={`card-remix-btn-${index}`}
                      type="button"
                      onClick={(e) => handleQuickRemix(e, wallpaper)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/80 text-[#ccc] backdrop-blur-md transition-colors hover:border-[#d4a373] hover:bg-[#d4a373] hover:text-black"
                      title="Remix this variation"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                    <button
                      id={`card-download-btn-${index}`}
                      type="button"
                      onClick={(e) => handleQuickDownload(e, wallpaper)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white text-black backdrop-blur-md transition-colors hover:bg-[#d4a373] hover:text-black"
                      title="Download image"
                    >
                      <Download className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

