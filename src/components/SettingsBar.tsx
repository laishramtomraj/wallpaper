import React from 'react';
import { AspectRatioType, ImageSizeType, ModelType } from '../types';
import { ASPECT_RATIO_CONFIGS, IMAGE_SIZE_CONFIGS } from '../data/vibePresets';
import { Ratio, Sparkles, Cpu, Layers } from 'lucide-react';

interface SettingsBarProps {
  aspectRatio: AspectRatioType;
  onAspectRatioChange: (ratio: AspectRatioType) => void;
  imageSize: ImageSizeType;
  onImageSizeChange: (size: ImageSizeType) => void;
  model: ModelType;
  onModelChange: (model: ModelType) => void;
  isOpen: boolean;
}

export const SettingsBar: React.FC<SettingsBarProps> = ({
  aspectRatio,
  onAspectRatioChange,
  imageSize,
  onImageSizeChange,
  model,
  onModelChange,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="w-full border-b border-[#1a1a1a] bg-[#0d0d0d]/95 p-4 transition-all backdrop-blur-xl">
      <div className="mx-auto max-w-5xl space-y-4">
        {/* Controls Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Aspect Ratio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#888]">
                <Ratio className="h-3.5 w-3.5 text-[#d4a373]" />
                <span>Aspect Ratio</span>
              </label>
              <span className="text-[11px] font-mono text-[#d4a373]">{aspectRatio}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {ASPECT_RATIO_CONFIGS.map((config) => {
                const isSelected = aspectRatio === config.value;
                return (
                  <button
                    key={config.value}
                    id={`ratio-btn-${config.value.replace(':', '-')}`}
                    type="button"
                    onClick={() => onAspectRatioChange(config.value as AspectRatioType)}
                    className={`flex flex-col items-center justify-center rounded-lg border p-1.5 text-center transition-all ${
                      isSelected
                        ? 'border-[#d4a373] bg-[#d4a373]/15 text-white ring-1 ring-[#d4a373]/30'
                        : 'border-[#222] bg-[#151515] text-[#888] hover:border-[#333] hover:text-[#e0d8d0]'
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">{config.label}</span>
                    <span className="text-[9px] text-[#666] uppercase tracking-wider leading-tight truncate max-w-[55px]">
                      {config.value === '9:16' ? 'Phone' : config.desc.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Size / Resolution (1K, 2K, 4K) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#888]">
                <Layers className="h-3.5 w-3.5 text-[#d4a373]" />
                <span>Output Resolution</span>
              </label>
              <span className="text-[11px] font-mono text-[#d4a373]">{imageSize}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {IMAGE_SIZE_CONFIGS.map((config) => {
                const isSelected = imageSize === config.value;
                return (
                  <button
                    key={config.value}
                    id={`size-btn-${config.value}`}
                    type="button"
                    onClick={() => onImageSizeChange(config.value as ImageSizeType)}
                    className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all ${
                      isSelected
                        ? 'border-[#d4a373] bg-[#d4a373]/15 text-white ring-1 ring-[#d4a373]/30'
                        : 'border-[#222] bg-[#151515] text-[#888] hover:border-[#333] hover:text-[#e0d8d0]'
                    }`}
                  >
                    <span className="text-sm font-bold leading-tight">{config.label}</span>
                    <span className="text-[9px] text-[#666] uppercase tracking-wider leading-tight truncate">{config.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Model */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#888]">
                <Cpu className="h-3.5 w-3.5 text-[#d4a373]" />
                <span>Image Model</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                id="model-btn-pro"
                type="button"
                onClick={() => onModelChange('gemini-3-pro-image-preview')}
                className={`flex flex-col items-start justify-center rounded-lg border p-2 text-left transition-all ${
                  model === 'gemini-3-pro-image-preview'
                    ? 'border-[#d4a373] bg-[#d4a373]/15 text-white ring-1 ring-[#d4a373]/30'
                    : 'border-[#222] bg-[#151515] text-[#888] hover:border-[#333] hover:text-[#e0d8d0]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#d4a373]" />
                  <span className="text-xs font-bold">Pro Image</span>
                </div>
                <span className="text-[9px] text-[#666] uppercase tracking-wider leading-tight">Studio Tier</span>
              </button>

              <button
                id="model-btn-flash"
                type="button"
                onClick={() => onModelChange('gemini-3.1-flash-image-preview')}
                className={`flex flex-col items-start justify-center rounded-lg border p-2 text-left transition-all ${
                  model === 'gemini-3.1-flash-image-preview'
                    ? 'border-[#d4a373] bg-[#d4a373]/15 text-white ring-1 ring-[#d4a373]/30'
                    : 'border-[#222] bg-[#151515] text-[#888] hover:border-[#333] hover:text-[#e0d8d0]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Cpu className="h-3 w-3 text-[#d4a373]" />
                  <span className="text-xs font-bold">Flash Image</span>
                </div>
                <span className="text-[9px] text-[#666] uppercase tracking-wider leading-tight">Fast Speed</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

