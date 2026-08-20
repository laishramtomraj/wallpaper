import React, { useState, useEffect } from 'react';
import { WallpaperItem } from '../types';
import {
  X,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Check,
  Share2,
  Copy,
  Info,
  Flashlight,
  Camera,
  Wifi,
  BatteryMedium,
  Sliders,
} from 'lucide-react';
import { downloadImage, sanitizeFilename } from '../utils/downloadHelper';
import confetti from 'canvas-confetti';

interface FullscreenModalProps {
  wallpaper: WallpaperItem | null;
  allWallpapers: WallpaperItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onRemix: (wallpaper: WallpaperItem) => void;
  onEditWallpaper?: (wallpaper: WallpaperItem) => void;
}

export const FullscreenModal: React.FC<FullscreenModalProps> = ({
  wallpaper,
  allWallpapers,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  onRemix,
  onEditWallpaper,
}) => {
  const [showLockScreenMockup, setShowLockScreenMockup] = useState(false);
  const [currentTime, setCurrentTime] = useState({ time: '09:41', date: 'Thursday, October 24' });
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
      setCurrentTime({
        time: `${hours}:${minutes}`,
        date: now.toLocaleDateString('en-US', options),
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation & Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < allWallpapers.length - 1) onNavigate(currentIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, allWallpapers.length, onClose, onNavigate]);

  if (!isOpen || !wallpaper) return null;

  const handleDownload = () => {
    const filename = sanitizeFilename(wallpaper.prompt, `v${wallpaper.variationIndex + 1}`);
    downloadImage(wallpaper.imageUrl, filename);
    setDownloadSuccess(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#d4a373', '#ffffff', '#e0d8d0'],
    });
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleRemixClick = () => {
    onRemix(wallpaper);
    onClose();
  };

  const handleCopyLinkOrImage = async () => {
    try {
      const res = await fetch(wallpaper.imageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="fullscreen-wallpaper-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 backdrop-blur-2xl transition-all"
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-2.5">
          {/* Variation Indicator */}
          <span className="rounded-full border border-[#222] bg-[#151515]/90 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#d4a373] backdrop-blur-md">
            Variation 0{currentIndex + 1} / 0{allWallpapers.length}
          </span>

          {/* Phone Lock Screen Preview Toggle */}
          <button
            id="lockscreen-toggle-btn"
            type="button"
            onClick={() => setShowLockScreenMockup(!showLockScreenMockup)}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest backdrop-blur-md transition-all ${
              showLockScreenMockup
                ? 'border-[#d4a373] bg-[#d4a373]/20 text-white ring-1 ring-[#d4a373]/40'
                : 'border-[#222] bg-[#151515]/90 text-[#a09890] hover:border-[#444] hover:text-white'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Phone Overlay</span>
          </button>
        </div>

        {/* Action icons & Close */}
        <div className="flex items-center gap-2">
          {onEditWallpaper && (
            <button
              id="modal-open-editor-btn"
              type="button"
              onClick={() => onEditWallpaper(wallpaper)}
              className="flex items-center gap-1.5 rounded-full border border-[#d4a373]/40 bg-[#d4a373]/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#d4a373] backdrop-blur-md hover:bg-[#d4a373] hover:text-black transition-all"
              title="Open in Wallpaper Editor"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
          )}

          <button
            id="info-toggle-btn"
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#222] bg-[#151515]/90 text-[#aaa] backdrop-blur-md hover:border-[#444] hover:text-white"
            title="Image info"
          >
            <Info className="h-4 w-4" />
          </button>

          <button
            id="copy-image-btn"
            type="button"
            onClick={handleCopyLinkOrImage}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#222] bg-[#151515]/90 text-[#aaa] backdrop-blur-md hover:border-[#444] hover:text-white"
            title="Copy image to clipboard"
          >
            {copied ? <Check className="h-4 w-4 text-[#d4a373]" /> : <Copy className="h-4 w-4" />}
          </button>

          <button
            id="close-fullscreen-btn"
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#222] bg-[#151515]/90 text-[#aaa] backdrop-blur-md hover:border-[#444] hover:bg-[#222] hover:text-white"
            title="Close viewer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Wallpaper Display Container */}
      <div className="relative flex h-full w-full items-center justify-center p-2 sm:p-8">
        {/* Navigation Arrow Left */}
        {allWallpapers.length > 1 && (
          <button
            id="modal-prev-btn"
            type="button"
            onClick={() => onNavigate(currentIndex > 0 ? currentIndex - 1 : allWallpapers.length - 1)}
            className="absolute left-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/70 text-[#e0d8d0] backdrop-blur-md transition-all hover:scale-110 hover:border-[#d4a373] hover:text-white sm:left-6"
            title="Previous variation"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Wallpaper Phone Frame Preview - Bezel Styled */}
        <div
          className="relative flex max-h-[82vh] max-w-[92vw] sm:max-w-[420px] aspect-[9/16] overflow-hidden rounded-[38px] border-[10px] sm:border-[12px] border-[#1a1a1a] bg-[#111] shadow-[0_0_80px_rgba(0,0,0,0.8)] transition-all"
        >
          <img
            src={wallpaper.imageUrl}
            alt={wallpaper.prompt}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />

          {/* Optional Phone Lockscreen Overlay */}
          {showLockScreenMockup && (
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 text-white select-none">
              {/* Top Status Bar & Dynamic Island */}
              <div className="flex items-center justify-between text-xs font-semibold px-2">
                <span>{currentTime.time}</span>
                {/* Dynamic island pill */}
                <div className="h-4 w-20 rounded-full bg-black/90 border border-white/10" />
                <div className="flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5" />
                  <BatteryMedium className="h-4 w-4" />
                </div>
              </div>

              {/* Center Lock Screen Clock & Date */}
              <div className="my-auto flex flex-col items-center text-center">
                <span className="text-xs font-medium uppercase tracking-widest drop-shadow-md text-[#e0d8d0]/90">
                  {currentTime.date}
                </span>
                <span className="text-6xl font-extralight tracking-tight drop-shadow-lg sm:text-7xl font-sans mt-1">
                  {currentTime.time}
                </span>
              </div>

              {/* Bottom Quick Tools & Swipe Bar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/15">
                    <Flashlight className="h-4 w-4 text-[#e0d8d0]" />
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/15">
                    <Camera className="h-4 w-4 text-[#e0d8d0]" />
                  </div>
                </div>
                {/* Home Indicator bar */}
                <div className="mx-auto h-1 w-32 rounded-full bg-white/70 shadow-sm" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Arrow Right */}
        {allWallpapers.length > 1 && (
          <button
            id="modal-next-btn"
            type="button"
            onClick={() => onNavigate(currentIndex < allWallpapers.length - 1 ? currentIndex + 1 : 0)}
            className="absolute right-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/70 text-[#e0d8d0] backdrop-blur-md transition-all hover:scale-110 hover:border-[#d4a373] hover:text-white sm:right-6"
            title="Next variation"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Info Drawer Dropdown if open */}
      {showInfo && (
        <div className="absolute top-16 right-6 z-40 w-80 rounded-2xl border border-[#222] bg-[#0d0d0d]/98 p-4 text-xs shadow-2xl backdrop-blur-xl text-[#e0d8d0]">
          <h4 className="font-serif-display font-bold text-white mb-2 uppercase tracking-wider text-[11px] text-[#d4a373]">
            Wallpaper Metadata
          </h4>
          <div className="space-y-2 text-[#aaa]">
            <p><span className="text-[#666] uppercase tracking-widest text-[9px] block">Vibe Prompt</span> {wallpaper.prompt}</p>
            <p><span className="text-[#666] uppercase tracking-widest text-[9px] block">Aspect Ratio</span> {wallpaper.aspectRatio || '9:16'}</p>
            <p><span className="text-[#666] uppercase tracking-widest text-[9px] block">Resolution</span> {wallpaper.imageSize || '1K'}</p>
            <p><span className="text-[#666] uppercase tracking-widest text-[9px] block">Model</span> {wallpaper.model}</p>
            <p><span className="text-[#666] uppercase tracking-widest text-[9px] block">Variation</span> {wallpaper.variationLabel || `Variation 0${currentIndex + 1}`}</p>
          </div>
        </div>
      )}

      {/* Bottom Action Dock: Download & Remix Buttons */}
      <div className="absolute bottom-0 inset-x-0 z-30 flex flex-col items-center gap-3 p-4 sm:p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
        {/* Variations thumbnail strip */}
        <div className="flex items-center gap-2">
          {allWallpapers.map((wp, idx) => (
            <button
              key={wp.id || idx}
              type="button"
              onClick={() => onNavigate(idx)}
              className={`relative h-12 w-8 overflow-hidden rounded-lg border transition-all ${
                idx === currentIndex
                  ? 'border-[#d4a373] ring-2 ring-[#d4a373]/50 scale-110'
                  : 'border-white/10 opacity-40 hover:opacity-90'
              }`}
            >
              <img
                src={wp.imageUrl}
                alt={`Thumbnail ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Primary Edit, Remix & Download Action Buttons */}
        <div className="flex items-center justify-center gap-2.5 w-full max-w-md">
          {/* Edit Studio Button */}
          {onEditWallpaper && (
            <button
              id="modal-bottom-edit-btn"
              type="button"
              onClick={() => onEditWallpaper(wallpaper)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-3.5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:border-[#d4a373] hover:bg-white/20 active:scale-[0.98]"
            >
              <Sliders className="h-3.5 w-3.5 text-[#d4a373]" />
              <span>Edit</span>
            </button>
          )}

          {/* Remix Button */}
          <button
            id="modal-remix-btn"
            type="button"
            onClick={handleRemixClick}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-3.5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-white/20 active:scale-[0.98]"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#d4a373]" />
            <span>Remix</span>
          </button>

          {/* Download Button */}
          <button
            id="modal-download-btn"
            type="button"
            onClick={handleDownload}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-3.5 text-[11px] font-bold uppercase tracking-widest text-black shadow-lg transition-all hover:bg-[#d4a373] hover:text-black active:scale-[0.98]"
          >
            {downloadSuccess ? (
              <>
                <Check className="h-4 w-4 text-black" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

