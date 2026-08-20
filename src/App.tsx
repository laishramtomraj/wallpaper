/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AspectRatioType, ImageSizeType, ModelType, WallpaperBatch, WallpaperItem } from './types';
import { Header } from './components/Header';
import { SettingsBar } from './components/SettingsBar';
import { VibeComposer } from './components/VibeComposer';
import { WallpaperGrid } from './components/WallpaperGrid';
import { FullscreenModal } from './components/FullscreenModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { STARTER_WALLPAPERS } from './data/starterWallpapers';
import { AlertCircle, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'vibewalls_history_v1';

export default function App() {
  const [prompt, setPrompt] = useState<string>(
    'Rainy cyberpunk lo-fi city street at midnight, neon reflections on wet asphalt, glowing holographic vending machines, cozy ramen shop'
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [imageSize, setImageSize] = useState<ImageSizeType>('1K');
  const [model, setModel] = useState<ModelType>('gemini-3-pro-image-preview');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  const [currentWallpapers, setCurrentWallpapers] = useState<WallpaperItem[]>(STARTER_WALLPAPERS);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');

  const [fullscreenIndex, setFullscreenIndex] = useState<number>(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [historyBatches, setHistoryBatches] = useState<WallpaperBatch[]>([]);

  const [toast, setToast] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistoryBatches(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse history from localStorage', e);
    }
  }, []);

  // Save history to localStorage
  const saveBatchToHistory = (newBatch: WallpaperBatch) => {
    setHistoryBatches((prev) => {
      const updated = [newBatch, ...prev.slice(0, 19)]; // Keep latest 20 batches
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage full, trimming history');
      }
      return updated;
    });
  };

  const showToast = (type: 'error' | 'success' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Generate 4 Wallpaper variations
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setProgressMessage('Connecting to Gemini AI Image Studio...');

    const progressTimer = setTimeout(() => {
      setProgressMessage('Rendering 4 distinct 9:16 compositions & lighting variations...');
    }, 2500);

    const progressTimer2 = setTimeout(() => {
      setProgressMessage('Finalizing high-res textures and atmospheric nuances...');
    }, 6000);

    try {
      const res = await fetch('/api/generate-wallpapers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          referenceImage: referenceImage || undefined,
          aspectRatio,
          imageSize,
          model,
          count: 4,
        }),
      });

      clearTimeout(progressTimer);
      clearTimeout(progressTimer2);

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Generation failed. Please try again.');
      }

      if (data.wallpapers && data.wallpapers.length > 0) {
        setCurrentWallpapers(data.wallpapers);

        // Save batch to history
        const newBatch: WallpaperBatch = {
          id: `batch-${Date.now()}`,
          vibePrompt: prompt.trim(),
          aspectRatio,
          imageSize,
          model,
          createdAt: Date.now(),
          referenceImage: referenceImage || undefined,
          wallpapers: data.wallpapers,
        };
        saveBatchToHistory(newBatch);

        showToast('success', `Created 4 custom wallpaper variations for "${prompt.slice(0, 24)}..."`);
      } else {
        throw new Error('No wallpapers were returned from the model.');
      }
    } catch (err: any) {
      console.error('Error generating wallpapers:', err);
      showToast('error', err?.message || 'Failed to generate wallpapers. Please verify prompt or try again.');
    } finally {
      clearTimeout(progressTimer);
      clearTimeout(progressTimer2);
      setIsGenerating(false);
      setProgressMessage('');
    }
  };

  // User taps an image to see it full screen
  const handleSelectWallpaper = (wallpaper: WallpaperItem, index: number) => {
    setFullscreenIndex(index);
    setIsFullscreenOpen(true);
  };

  // Remix button handler: sets reference image and prepares vibe input
  const handleRemix = (wallpaper: WallpaperItem) => {
    setReferenceImage(wallpaper.imageUrl);
    setPrompt(wallpaper.prompt || prompt);
    showToast('info', 'Image set as reference! Tweak your vibe prompt and generate a remixed batch.');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearReference = () => {
    setReferenceImage(null);
    showToast('info', 'Reference image removed. Next generation will be created from scratch.');
  };

  const handleSelectBatchFromHistory = (batch: WallpaperBatch) => {
    setCurrentWallpapers(batch.wallpapers);
    setPrompt(batch.vibePrompt);
    setAspectRatio(batch.aspectRatio);
    setImageSize(batch.imageSize);
    setModel(batch.model);
    showToast('info', `Loaded batch: "${batch.vibePrompt.slice(0, 30)}..."`);
  };

  const handleSelectWallpaperFromHistory = (wallpaper: WallpaperItem, batch: WallpaperBatch) => {
    setCurrentWallpapers(batch.wallpapers);
    const idx = batch.wallpapers.findIndex((w) => w.id === wallpaper.id);
    setFullscreenIndex(idx >= 0 ? idx : 0);
    setIsFullscreenOpen(true);
    setIsHistoryOpen(false);
  };

  const handleClearAllHistory = () => {
    setHistoryBatches([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    showToast('info', 'History cleared.');
  };

  return (
    <div className="min-h-screen bg-[#090909] text-[#e0d8d0] selection:bg-[#d4a373] selection:text-black flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-16 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full border border-[#333] bg-[#121212]/98 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-white shadow-2xl backdrop-blur-xl transition-all">
          {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-400" />}
          {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-[#d4a373]" />}
          {toast.type === 'info' && <Sparkles className="h-4 w-4 text-[#d4a373]" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Sticky Header */}
      <Header
        historyCount={historyBatches.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        isSettingsOpen={isSettingsOpen}
        activeReferenceImage={referenceImage}
      />

      {/* Expandable Settings Bar (Aspect Ratio, Resolution, Model) */}
      <SettingsBar
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
        imageSize={imageSize}
        onImageSizeChange={setImageSize}
        model={model}
        onModelChange={setModel}
        isOpen={isSettingsOpen}
      />

      {/* Main Body Canvas */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-5 sm:px-6 space-y-6">
        {/* Vibe Composer (Prompt, Enhancer, Presets, Remix Banner, Generate Button) */}
        <VibeComposer
          prompt={prompt}
          onPromptChange={setPrompt}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          referenceImage={referenceImage}
          onClearReference={handleClearReference}
          aspectRatio={aspectRatio}
          imageSize={imageSize}
        />

        {/* 4 Wallpaper Variations Grid */}
        <WallpaperGrid
          wallpapers={currentWallpapers}
          isGenerating={isGenerating}
          onSelectWallpaper={handleSelectWallpaper}
          onRemix={handleRemix}
          aspectRatio={aspectRatio}
          generationProgressText={progressMessage}
        />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#1a1a1a] bg-[#090909] py-5 text-center text-[10px] uppercase tracking-widest text-[#666]">
        <div className="flex items-center justify-center gap-2">
          <span>Synthesized with</span>
          <span className="text-[#d4a373] font-semibold">Gemini 3 Pro Image</span>
          <span>&middot;</span>
          <span>9:16 Canvas Variations</span>
        </div>
      </footer>

      {/* Fullscreen Modal View with Phone Lockscreen overlay, Download, Remix */}
      <FullscreenModal
        wallpaper={currentWallpapers[fullscreenIndex] || null}
        allWallpapers={currentWallpapers}
        currentIndex={fullscreenIndex}
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        onNavigate={setFullscreenIndex}
        onRemix={handleRemix}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        batches={historyBatches}
        onSelectBatch={handleSelectBatchFromHistory}
        onSelectWallpaper={handleSelectWallpaperFromHistory}
        onClearHistory={handleClearAllHistory}
        onRemix={handleRemix}
      />
    </div>
  );
}
