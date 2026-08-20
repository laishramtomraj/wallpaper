import React, { useState } from 'react';
import { VIBE_PRESETS, VibePreset } from '../data/vibePresets';
import { Sparkles, Dices, X, ArrowRight, Wand2, RefreshCw } from 'lucide-react';

interface VibeComposerProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  referenceImage: string | null;
  onClearReference: () => void;
  aspectRatio: string;
  imageSize: string;
}

export const VibeComposer: React.FC<VibeComposerProps> = ({
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
  referenceImage,
  onClearReference,
  aspectRatio,
  imageSize,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isExpanding, setIsExpanding] = useState(false);

  const categories = ['All', 'Cyber & Sci-Fi', 'Anime & Art', 'Nature & Calm', 'Minimal & Dark', 'Abstract & 3D'];

  const filteredPresets = selectedCategory === 'All'
    ? VIBE_PRESETS
    : VIBE_PRESETS.filter((p) => p.category === selectedCategory);

  const handleRandomVibe = () => {
    const randomPreset = VIBE_PRESETS[Math.floor(Math.random() * VIBE_PRESETS.length)];
    onPromptChange(randomPreset.prompt);
  };

  const handleSelectPreset = (preset: VibePreset) => {
    onPromptChange(preset.prompt);
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isExpanding) return;
    setIsExpanding(true);
    try {
      const res = await fetch('/api/expand-vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibe: prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.expandedPrompt) {
          onPromptChange(data.expandedPrompt);
        }
      }
    } catch (e) {
      console.error('Enhance vibe error:', e);
    } finally {
      setIsExpanding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isGenerating && prompt.trim()) {
        onGenerate();
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Remix Reference Banner if active */}
      {referenceImage && (
        <div className="relative flex items-center justify-between rounded-2xl border border-[#222] bg-[#0a0a0a] p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-md">
              <img
                src={referenceImage}
                alt="Reference"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#666] mb-0.5">Active Reference Image</p>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 text-[#d4a373] animate-spin-slow" />
                <span className="text-xs font-semibold text-white">Seed Reference Locked</span>
                <span className="rounded-full bg-[#d4a373]/15 border border-[#d4a373]/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#d4a373]">
                  Remix Mode
                </span>
              </div>
              <p className="text-[11px] text-[#888] mt-0.5">
                The next 4 variations will be synthesized using this composition as stylistic guide.
              </p>
            </div>
          </div>
          <button
            id="clear-reference-btn"
            type="button"
            onClick={onClearReference}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#222] bg-[#151515] text-[#888] transition-colors hover:border-[#444] hover:text-white"
            title="Clear reference image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Vibe Text Input Card */}
      <div className="relative rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d] p-4 sm:p-5 shadow-2xl transition-all focus-within:border-[#d4a373] focus-within:ring-1 focus-within:ring-[#d4a373]/30">
        <div className="flex items-center justify-between pb-3">
          <label htmlFor="vibe-prompt-input" className="text-[10px] uppercase tracking-widest text-[#666] flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#d4a373]" />
            <span>{referenceImage ? 'Current Remix Vibe' : 'Current Vibe'}</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              id="enhance-prompt-btn"
              type="button"
              onClick={handleEnhancePrompt}
              disabled={isExpanding || !prompt.trim()}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-[#d4a373] hover:text-white disabled:opacity-30 transition-colors"
              title="Expand prompt with AI aesthetic nuances"
            >
              <Wand2 className={`h-3 w-3 ${isExpanding ? 'animate-spin' : ''}`} />
              <span>{isExpanding ? 'Enhancing...' : 'AI Enhance'}</span>
            </button>
            <span className="text-[#333]">|</span>
            <button
              id="random-vibe-btn"
              type="button"
              onClick={handleRandomVibe}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-[#888] hover:text-white transition-colors"
              title="Pick a random aesthetic vibe"
            >
              <Dices className="h-3 w-3 text-[#d4a373]" />
              <span>Surprise Me</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            id="vibe-prompt-input"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your mood, scene, aesthetic lighting, atmosphere, colors..."
            rows={3}
            className="w-full bg-[#151515] border border-[#222] rounded-xl p-3.5 text-sm text-[#e0d8d0] placeholder-[#555] focus:outline-none focus:border-[#d4a373] transition-colors leading-relaxed resize-none"
          />
        </div>

        {/* Footer info & Generate Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 mt-1 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#666]">
            <span className="rounded-md border border-[#222] bg-[#151515] px-2.5 py-1 text-[#aaa] font-mono">{aspectRatio}</span>
            <span className="rounded-md border border-[#222] bg-[#151515] px-2.5 py-1 text-[#aaa] font-mono">{imageSize}</span>
            <span className="hidden sm:inline text-[#555] tracking-normal font-sans">Press ⌘+Enter</span>
          </div>

          <button
            id="generate-wallpapers-btn"
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="flex items-center justify-center gap-2 rounded-full bg-white text-black px-6 py-3.5 text-xs font-semibold uppercase tracking-widest shadow-lg hover:bg-[#d4a373] hover:text-black transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-black" />
                <span>Synthesizing Batch...</span>
              </>
            ) : (
              <>
                <span>{referenceImage ? 'Regenerate Remixed Batch' : 'Synthesize 4 Variations'}</span>
                <ArrowRight className="h-4 w-4 text-black" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Category Chips & Carousel */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full px-3.5 py-1 text-[11px] font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#151515] text-[#777] hover:border-[#333] hover:text-[#e0d8d0] border border-[#222]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {filteredPresets.map((preset) => (
            <button
              key={preset.id}
              id={`preset-${preset.id}`}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="group flex flex-col items-start rounded-xl border border-[#222] bg-[#121212] p-2.5 text-left transition-all hover:border-[#d4a373]/60 hover:bg-[#181818]"
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-base">{preset.emoji}</span>
                <span className="text-[9px] uppercase tracking-widest text-[#555] group-hover:text-[#d4a373] transition-colors">Apply</span>
              </div>
              <span className="mt-1 text-xs font-medium text-[#c0b8b0] group-hover:text-white line-clamp-1">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

