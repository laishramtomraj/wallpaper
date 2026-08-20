import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sliders,
  Sparkles,
  Type,
  Crop,
  RotateCw,
  FlipHorizontal,
  Download,
  Check,
  RefreshCw,
  Layers,
  Wand2,
  Smartphone,
  Undo2,
  Save,
  Palette,
  Eye,
  Flame,
  Moon,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WallpaperItem } from '../types';
import { exportCanvasToDownload, sanitizeFilename } from '../utils/downloadHelper';

interface WallpaperEditorModalProps {
  isOpen: boolean;
  wallpaper: WallpaperItem | null;
  onClose: () => void;
  onSaveAsNew: (newWallpaper: WallpaperItem) => void;
  onUpdateCurrent: (updatedWallpaper: WallpaperItem) => void;
}

type TabType = 'filters' | 'ai-edit' | 'text' | 'transform';

interface FilterValues {
  brightness: number; // -50 to 50
  contrast: number; // -50 to 50
  saturation: number; // -100 to 100
  warmth: number; // -50 to 50
  vignette: number; // 0 to 100
  grain: number; // 0 to 100
  blur: number; // 0 to 20
  oledBlack: number; // 0 to 100
}

interface TextOverlayValues {
  enabled: boolean;
  text: string;
  position: 'top' | 'center' | 'bottom';
  fontFamily: 'serif' | 'sans' | 'mono';
  fontSize: number; // 16 to 48
  tracking: 'normal' | 'wide' | 'widest';
  color: string;
  opacity: number; // 0.2 to 1
  withPill: boolean;
}

const DEFAULT_FILTERS: FilterValues = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  vignette: 0,
  grain: 0,
  blur: 0,
  oledBlack: 0,
};

const PRESET_LOOKS = [
  {
    id: 'original',
    name: 'Original',
    icon: Undo2,
    filters: DEFAULT_FILTERS,
  },
  {
    id: 'moody-noir',
    name: 'Moody Noir',
    icon: Moon,
    filters: { ...DEFAULT_FILTERS, saturation: -100, contrast: 25, vignette: 40, oledBlack: 30 },
  },
  {
    id: 'amber-glow',
    name: 'Golden Hour',
    icon: Sun,
    filters: { ...DEFAULT_FILTERS, warmth: 35, saturation: 20, brightness: 5, vignette: 20 },
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Glow',
    icon: Flame,
    filters: { ...DEFAULT_FILTERS, saturation: 45, contrast: 20, warmth: -15, vignette: 30 },
  },
  {
    id: 'oled-pure',
    name: 'OLED Pure',
    icon: ShieldCheck,
    filters: { ...DEFAULT_FILTERS, contrast: 35, oledBlack: 60, vignette: 45 },
  },
];

const AI_EDIT_SUGGESTIONS = [
  'Add glowing stars, misty constellations and a crescent moon in upper sky',
  'Add gentle falling sakura cherry blossom petals floating with soft glow',
  'Transform mood into a cinematic rainy twilight with reflections',
  'Add soft volumetric golden sun rays piercing through the atmosphere',
  'Add subtle neon ambient lighting with teal and amber reflections',
  'Make background deeper dark with minimalist floating particles',
];

const QUOTE_SUGGESTIONS = [
  'STAY FOCUSED',
  'DEEP WORK',
  'MEMENTO MORI',
  'CREATE EVERY DAY',
  'QUIET MIND',
  'BEYOND HORIZONS',
  'AURA & GRACE',
];

export const WallpaperEditorModal: React.FC<WallpaperEditorModalProps> = ({
  isOpen,
  wallpaper,
  onClose,
  onSaveAsNew,
  onUpdateCurrent,
}) => {
  if (!isOpen || !wallpaper) return null;

  const [activeTab, setActiveTab] = useState<TabType>('filters');
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(wallpaper.imageUrl);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [rotation, setRotation] = useState<number>(0);
  const [isFlippedH, setIsFlippedH] = useState<boolean>(false);
  const [isFlippedV, setIsFlippedV] = useState<boolean>(false);
  const [frameBorder, setFrameBorder] = useState<'none' | 'gold' | 'white' | 'dark'>('none');
  
  // Text Overlay State
  const [textOverlay, setTextOverlay] = useState<TextOverlayValues>({
    enabled: false,
    text: 'STAY FOCUSED',
    position: 'center',
    fontFamily: 'serif',
    fontSize: 24,
    tracking: 'widest',
    color: '#ffffff',
    opacity: 0.9,
    withPill: false,
  });

  // AI Edit State
  const [aiInstruction, setAiInstruction] = useState<string>('');
  const [isAiEditing, setIsAiEditing] = useState<boolean>(false);
  const [aiEditError, setAiEditError] = useState<string | null>(null);

  // Phone Mockup Overlay Toggle
  const [showPhoneMockup, setShowPhoneMockup] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset state when wallpaper changes
  useEffect(() => {
    if (wallpaper) {
      setCurrentImageUrl(wallpaper.imageUrl);
      setFilters(DEFAULT_FILTERS);
      setRotation(0);
      setIsFlippedH(false);
      setIsFlippedV(false);
      setFrameBorder('none');
      setAiInstruction('');
      setAiEditError(null);
    }
  }, [wallpaper?.id, wallpaper?.imageUrl]);

  // Render to canvas whenever filters, text, or transforms change
  useEffect(() => {
    renderCanvas();
  }, [
    currentImageUrl,
    filters,
    rotation,
    isFlippedH,
    isFlippedV,
    frameBorder,
    textOverlay,
  ]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Determine canvas dimensions based on image and rotation
      const isRotated90or270 = rotation % 180 !== 0;
      const baseWidth = img.naturalWidth || 1080;
      const baseHeight = img.naturalHeight || 1920;

      canvas.width = isRotated90or270 ? baseHeight : baseWidth;
      canvas.height = isRotated90or270 ? baseWidth : baseHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save context for transform & filters
      ctx.save();

      // Center transform origin
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(isFlippedH ? -1 : 1, isFlippedV ? -1 : 1);

      // Construct CSS filter string for canvas
      const brightnessVal = 100 + filters.brightness;
      const contrastVal = 100 + filters.contrast + (filters.oledBlack * 0.4);
      const saturateVal = 100 + filters.saturation;
      const blurVal = filters.blur;

      ctx.filter = `brightness(${brightnessVal}%) contrast(${contrastVal}%) saturate(${saturateVal}%) ${
        blurVal > 0 ? `blur(${blurVal}px)` : ''
      }`;

      // Draw base image
      ctx.drawImage(img, -baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight);
      ctx.restore();

      // Reset filter for overlays
      ctx.filter = 'none';

      // 1. Warmth Tint Overlay
      if (filters.warmth !== 0) {
        ctx.save();
        ctx.fillStyle =
          filters.warmth > 0
            ? `rgba(245, 158, 11, ${Math.abs(filters.warmth) * 0.005})`
            : `rgba(59, 130, 246, ${Math.abs(filters.warmth) * 0.005})`;
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // 2. OLED True-Black Shadow Boost
      if (filters.oledBlack > 0) {
        ctx.save();
        const oledAlpha = (filters.oledBlack / 100) * 0.4;
        ctx.fillStyle = `rgba(0, 0, 0, ${oledAlpha})`;
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // 3. Vignette Effect
      if (filters.vignette > 0) {
        ctx.save();
        const maxRadius = Math.sqrt(
          Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2)
        );
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.25,
          canvas.width / 2,
          canvas.height / 2,
          maxRadius
        );
        const vignetteAlpha = (filters.vignette / 100) * 0.85;
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.6, `rgba(0,0,0,${vignetteAlpha * 0.3})`);
        gradient.addColorStop(1, `rgba(0,0,0,${vignetteAlpha})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // 4. Subtle Film Grain
      if (filters.grain > 0) {
        ctx.save();
        const grainAmount = (filters.grain / 100) * 0.08;
        const grainWidth = 120;
        const grainHeight = 120;
        const grainCanvas = document.createElement('canvas');
        grainCanvas.width = grainWidth;
        grainCanvas.height = grainHeight;
        const grainCtx = grainCanvas.getContext('2d');
        if (grainCtx) {
          const imgData = grainCtx.createImageData(grainWidth, grainHeight);
          for (let i = 0; i < imgData.data.length; i += 4) {
            const val = (Math.random() * 255) | 0;
            imgData.data[i] = val;
            imgData.data[i + 1] = val;
            imgData.data[i + 2] = val;
            imgData.data[i + 3] = (Math.random() * 40 * grainAmount * 255) | 0;
          }
          grainCtx.putImageData(imgData, 0, 0);
          const pattern = ctx.createPattern(grainCanvas, 'repeat');
          if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        }
        ctx.restore();
      }

      // 5. Inset Frame / Museum Border
      if (frameBorder !== 'none') {
        ctx.save();
        const borderWidth = Math.max(12, Math.round(canvas.width * 0.025));
        const insetMargin = Math.max(20, Math.round(canvas.width * 0.04));

        let borderColor = 'rgba(212, 163, 115, 0.8)';
        if (frameBorder === 'white') borderColor = 'rgba(255, 255, 255, 0.85)';
        if (frameBorder === 'dark') borderColor = 'rgba(20, 20, 20, 0.9)';

        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(
          insetMargin,
          insetMargin,
          canvas.width - insetMargin * 2,
          canvas.height - insetMargin * 2
        );
        ctx.restore();
      }

      // 6. Custom Text Overlay
      if (textOverlay.enabled && textOverlay.text.trim()) {
        ctx.save();
        const fontName =
          textOverlay.fontFamily === 'serif'
            ? 'Cinzel, Georgia, serif'
            : textOverlay.fontFamily === 'mono'
            ? 'monospace'
            : 'Plus Jakarta Sans, sans-serif';

        const scaledFontSize = Math.round(
          (textOverlay.fontSize / 24) * (canvas.width * 0.045)
        );
        ctx.font = `600 ${scaledFontSize}px ${fontName}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let posY = canvas.height * 0.5;
        if (textOverlay.position === 'top') {
          posY = canvas.height * 0.28; // Below clock
        } else if (textOverlay.position === 'bottom') {
          posY = canvas.height * 0.76; // Above dock
        }

        const posX = canvas.width * 0.5;
        const displayText =
          textOverlay.tracking === 'widest'
            ? textOverlay.text.toUpperCase().split('').join('  ')
            : textOverlay.tracking === 'wide'
            ? textOverlay.text.toUpperCase().split('').join(' ')
            : textOverlay.text;

        // Optional Pill Background
        if (textOverlay.withPill) {
          const metrics = ctx.measureText(displayText);
          const paddingX = scaledFontSize * 1.2;
          const paddingY = scaledFontSize * 0.6;
          const rectW = metrics.width + paddingX * 2;
          const rectH = scaledFontSize + paddingY * 2;
          const rectX = posX - rectW / 2;
          const rectY = posY - rectH / 2;

          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.beginPath();
          ctx.roundRect(rectX, rectY, rectW, rectH, rectH / 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Drop shadow for legibility
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 12;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;
        }

        ctx.fillStyle = textOverlay.color;
        ctx.globalAlpha = textOverlay.opacity;
        ctx.fillText(displayText, posX, posY);
        ctx.restore();
      }
    };
    img.src = currentImageUrl;
  };

  // Perform AI Magic Edit via API
  const handleAiEdit = async () => {
    if (!aiInstruction.trim() || isAiEditing) return;

    setIsAiEditing(true);
    setAiEditError(null);

    try {
      // Get current canvas state as base64 so any manual crops/filters are preserved or used as seed
      const currentCanvas = canvasRef.current;
      const seedImage = currentCanvas
        ? currentCanvas.toDataURL('image/png')
        : currentImageUrl;

      const res = await fetch('/api/edit-wallpaper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: seedImage,
          instruction: aiInstruction.trim(),
          aspectRatio: wallpaper.aspectRatio || '9:16',
          imageSize: wallpaper.imageSize || '1K',
          model: wallpaper.model || 'gemini-3-pro-image-preview',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.imageUrl) {
        throw new Error(data.error || 'Failed to edit wallpaper with AI.');
      }

      // Update current image with new AI edited result and reset filter values
      setCurrentImageUrl(data.imageUrl);
      setFilters(DEFAULT_FILTERS);
      setAiInstruction('');
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#d4a373', '#ffffff'],
      });
    } catch (err: any) {
      console.error('AI Edit failed:', err);
      setAiEditError(err.message || 'Error occurred while editing wallpaper.');
    } finally {
      setIsAiEditing(false);
    }
  };

  // Direct download current edited canvas to system
  const handleDownloadToSystem = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    const filename = sanitizeFilename(
      `${wallpaper.prompt}-edited`,
      'custom-wallpaper'
    );
    const success = await exportCanvasToDownload(canvas, filename, 'image/png', 0.98);

    if (success) {
      setDownloadSuccess(true);
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.85 },
        colors: ['#d4a373', '#ffffff', '#e0d8d0'],
      });
      setTimeout(() => setDownloadSuccess(false), 2500);
    }
    setIsExporting(false);
  };

  // Save changes directly back to the active wallpaper item
  const handleApplyChanges = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png', 0.98);
    const updated: WallpaperItem = {
      ...wallpaper,
      imageUrl: dataUrl,
      variationLabel: `${wallpaper.variationLabel} (Edited)`,
    };
    onUpdateCurrent(updated);
    onClose();
  };

  // Save changes as a new wallpaper in the batch
  const handleSaveAsNewVariation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png', 0.98);
    const newWp: WallpaperItem = {
      id: `wp-${Date.now()}-custom`,
      imageUrl: dataUrl,
      prompt: `${wallpaper.prompt} (Custom Studio Edit)`,
      variationLabel: `Custom Edit`,
      variationIndex: Date.now(),
      aspectRatio: wallpaper.aspectRatio,
      imageSize: wallpaper.imageSize,
      model: wallpaper.model,
      createdAt: Date.now(),
      referenceImageUsed: true,
    };
    onSaveAsNew(newWp);
    onClose();
  };

  return (
    <div
      id="wallpaper-editor-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 backdrop-blur-2xl p-2 sm:p-4 transition-all"
    >
      <div className="flex h-full max-h-[96vh] w-full max-w-5xl flex-col rounded-3xl border border-[#1a1a1a] bg-[#0d0d0d] shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#1a1a1a] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#151515] border border-[#d4a373]/40 text-[#d4a373]">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-display text-sm font-semibold tracking-tight text-white uppercase sm:text-base">
                  Wallpaper Studio Editor
                </h3>
                <span className="rounded-full border border-[#d4a373]/30 bg-[#d4a373]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#d4a373]">
                  {wallpaper.aspectRatio || '9:16'}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-[#666]">
                Make visual tweaks, AI edits, and text overlays
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Phone Lock Screen Toggle */}
            <button
              id="editor-mockup-toggle-btn"
              type="button"
              onClick={() => setShowPhoneMockup(!showPhoneMockup)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                showPhoneMockup
                  ? 'border-[#d4a373] bg-[#d4a373]/20 text-white'
                  : 'border-[#222] bg-[#151515] text-[#888] hover:border-[#333] hover:text-white'
              }`}
              title="Toggle phone lockscreen mockup overlay"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Phone Overlay</span>
            </button>

            <button
              id="editor-close-btn"
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#222] bg-[#151515] text-[#888] hover:border-[#444] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Content Split: Left Controls, Right Preview Canvas */}
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* Left Panel: Tabs & Sliders */}
          <div className="flex flex-col w-full lg:w-[420px] border-b lg:border-b-0 lg:border-r border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
            {/* Tab navigation bar */}
            <div className="flex border-b border-[#1a1a1a] bg-[#0d0d0d] p-1.5 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('filters')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] uppercase tracking-wider font-semibold transition-all ${
                  activeTab === 'filters'
                    ? 'bg-[#181818] text-[#d4a373] border border-[#222]'
                    : 'text-[#777] hover:text-[#bbb]'
                }`}
              >
                <Sliders className="h-3 w-3" />
                <span>Filters</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ai-edit')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] uppercase tracking-wider font-semibold transition-all ${
                  activeTab === 'ai-edit'
                    ? 'bg-[#181818] text-[#d4a373] border border-[#222]'
                    : 'text-[#777] hover:text-[#bbb]'
                }`}
              >
                <Sparkles className="h-3 w-3" />
                <span>AI Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] uppercase tracking-wider font-semibold transition-all ${
                  activeTab === 'text'
                    ? 'bg-[#181818] text-[#d4a373] border border-[#222]'
                    : 'text-[#777] hover:text-[#bbb]'
                }`}
              >
                <Type className="h-3 w-3" />
                <span>Text</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('transform')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] uppercase tracking-wider font-semibold transition-all ${
                  activeTab === 'transform'
                    ? 'bg-[#181818] text-[#d4a373] border border-[#222]'
                    : 'text-[#777] hover:text-[#bbb]'
                }`}
              >
                <Crop className="h-3 w-3" />
                <span>Frame</span>
              </button>
            </div>

            {/* Tab Body Scrollable Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 no-scrollbar">
              {/* TAB 1: FILTERS & ADJUSTMENTS */}
              {activeTab === 'filters' && (
                <div className="space-y-5">
                  {/* Preset Looks Carousel */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#666] mb-2 block">
                      Aesthetic Preset Looks
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESET_LOOKS.map((preset) => {
                        const Icon = preset.icon;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setFilters(preset.filters)}
                            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#222] bg-[#121212] p-2.5 text-center transition-all hover:border-[#d4a373]/50 hover:bg-[#181818]"
                          >
                            <Icon className="h-3.5 w-3.5 text-[#d4a373]" />
                            <span className="text-[10px] font-medium text-[#c0b8b0] uppercase tracking-wider truncate">
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual Adjustment Sliders */}
                  <div className="space-y-4 border-t border-[#1a1a1a] pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-[#888] font-bold">
                        Fine Adjustments
                      </span>
                      <button
                        type="button"
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                        className="text-[9px] uppercase tracking-wider text-[#666] hover:text-[#d4a373]"
                      >
                        Reset Sliders
                      </button>
                    </div>

                    {/* Brightness */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#aaa]">Brightness</span>
                        <span className="font-mono text-[#d4a373] text-[11px]">{filters.brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={filters.brightness}
                        onChange={(e) =>
                          setFilters({ ...filters, brightness: parseInt(e.target.value) })
                        }
                        className="w-full accent-[#d4a373] bg-[#222] h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Contrast */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#aaa]">Contrast</span>
                        <span className="font-mono text-[#d4a373] text-[11px]">{filters.contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={filters.contrast}
                        onChange={(e) =>
                          setFilters({ ...filters, contrast: parseInt(e.target.value) })
                        }
                        className="w-full accent-[#d4a373] bg-[#222] h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Saturation */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#aaa]">Saturation</span>
                        <span className="font-mono text-[#d4a373] text-[11px]">{filters.saturation}%</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={filters.saturation}
                        onChange={(e) =>
                          setFilters({ ...filters, saturation: parseInt(e.target.value) })
                        }
                        className="w-full accent-[#d4a373] bg-[#222] h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Warmth */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#aaa]">Color Warmth / Tint</span>
                        <span className="font-mono text-[#d4a373] text-[11px]">
                          {filters.warmth > 0 ? `+${filters.warmth} Warm` : filters.warmth < 0 ? `${filters.warmth} Cool` : 'Neutral'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={filters.warmth}
                        onChange={(e) =>
                          setFilters({ ...filters, warmth: parseInt(e.target.value) })
                        }
                        className="w-full accent-[#d4a373] bg-[#222] h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Vignette */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#aaa]">Cinematic Vignette</span>
                        <span className="font-mono text-[#d4a373] text-[11px]">{filters.vignette}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.vignette}
                        onChange={(e) =>
                          setFilters({ ...filters, vignette: parseInt(e.target.value) })
                        }
                        className="w-full accent-[#d4a373] bg-[#222] h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* OLED Black Boost */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#aaa]">OLED Deep Black Depth</span>
                        <span className="font-mono text-[#d4a373] text-[11px]">{filters.oledBlack}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.oledBlack}
                        onChange={(e) =>
                          setFilters({ ...filters, oledBlack: parseInt(e.target.value) })
                        }
                        className="w-full accent-[#d4a373] bg-[#222] h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Film Grain */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#aaa]">Analog Film Grain</span>
                        <span className="font-mono text-[#d4a373] text-[11px]">{filters.grain}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.grain}
                        onChange={(e) =>
                          setFilters({ ...filters, grain: parseInt(e.target.value) })
                        }
                        className="w-full accent-[#d4a373] bg-[#222] h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Soft Focus / Blur */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#aaa]">Soft Blur / Depth of Field</span>
                        <span className="font-mono text-[#d4a373] text-[11px]">{filters.blur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="15"
                        value={filters.blur}
                        onChange={(e) =>
                          setFilters({ ...filters, blur: parseInt(e.target.value) })
                        }
                        className="w-full accent-[#d4a373] bg-[#222] h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI MAGIC EDIT */}
              {activeTab === 'ai-edit' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#666] mb-2 block">
                      AI Instruction / Magic Inpaint
                    </label>
                    <textarea
                      value={aiInstruction}
                      onChange={(e) => setAiInstruction(e.target.value)}
                      placeholder="Describe what to add, remove or transform in this wallpaper (e.g. 'Add glowing full moon in the sky', 'Change to snowy night', 'Add sakura blossoms')..."
                      rows={4}
                      className="w-full bg-[#151515] border border-[#222] rounded-xl p-3.5 text-xs text-[#e0d8d0] placeholder-[#555] focus:outline-none focus:border-[#d4a373] transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  {aiEditError && (
                    <div className="rounded-xl border border-rose-900/50 bg-rose-950/30 p-3 text-[11px] text-rose-300">
                      {aiEditError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAiEdit}
                    disabled={isAiEditing || !aiInstruction.trim()}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-white text-black py-3.5 text-xs font-semibold uppercase tracking-widest hover:bg-[#d4a373] transition-all disabled:opacity-40"
                  >
                    {isAiEditing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-black" />
                        <span>Synthesizing AI Changes...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 text-black" />
                        <span>Apply AI Transformation</span>
                      </>
                    )}
                  </button>

                  {/* Suggestion Chips */}
                  <div className="space-y-2 pt-2 border-t border-[#1a1a1a]">
                    <span className="text-[10px] uppercase tracking-widest text-[#666] block">
                      Suggested Edit Prompts
                    </span>
                    <div className="space-y-1.5">
                      {AI_EDIT_SUGGESTIONS.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAiInstruction(suggestion)}
                          className="w-full text-left rounded-lg border border-[#222] bg-[#121212] p-2 text-[11px] text-[#aaa] hover:border-[#d4a373]/50 hover:text-white transition-all line-clamp-2"
                        >
                          "{suggestion}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TEXT & QUOTE OVERLAY */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-[#666]">
                      Text Overlay
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setTextOverlay({ ...textOverlay, enabled: !textOverlay.enabled })
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        textOverlay.enabled ? 'bg-[#d4a373]' : 'bg-[#222]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                          textOverlay.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {textOverlay.enabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-[#666] mb-1.5 block">
                          Quote / Custom Text
                        </label>
                        <input
                          type="text"
                          value={textOverlay.text}
                          onChange={(e) =>
                            setTextOverlay({ ...textOverlay, text: e.target.value })
                          }
                          placeholder="e.g. STAY FOCUSED"
                          className="w-full bg-[#151515] border border-[#222] rounded-xl p-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#d4a373]"
                        />
                      </div>

                      {/* Quick Quotes */}
                      <div className="flex flex-wrap gap-1.5">
                        {QUOTE_SUGGESTIONS.map((quote, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setTextOverlay({ ...textOverlay, text: quote })}
                            className="rounded-full border border-[#222] bg-[#121212] px-2.5 py-1 text-[9px] uppercase tracking-wider text-[#888] hover:border-[#d4a373] hover:text-white"
                          >
                            {quote}
                          </button>
                        ))}
                      </div>

                      {/* Position */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-[#666] block">
                          Vertical Position
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['top', 'center', 'bottom'] as const).map((pos) => (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => setTextOverlay({ ...textOverlay, position: pos })}
                              className={`rounded-xl border py-2 text-[10px] uppercase tracking-wider font-semibold transition-all ${
                                textOverlay.position === pos
                                  ? 'border-[#d4a373] bg-[#d4a373]/15 text-[#d4a373]'
                                  : 'border-[#222] bg-[#121212] text-[#888]'
                              }`}
                            >
                              {pos === 'top' ? 'Top (Below Clock)' : pos === 'center' ? 'Center' : 'Bottom'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Family */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-[#666] block">
                          Typography Style
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(
                            [
                              { id: 'serif', label: 'Cinzel Serif' },
                              { id: 'sans', label: 'Clean Sans' },
                              { id: 'mono', label: 'Monospace' },
                            ] as const
                          ).map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                setTextOverlay({ ...textOverlay, fontFamily: item.id })
                              }
                              className={`rounded-xl border py-2 text-[10px] uppercase tracking-wider font-semibold transition-all ${
                                textOverlay.fontFamily === item.id
                                  ? 'border-[#d4a373] bg-[#d4a373]/15 text-[#d4a373]'
                                  : 'border-[#222] bg-[#121212] text-[#888]'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Size & Spacing */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#aaa]">Font Size</span>
                          <span className="font-mono text-[#d4a373] text-[11px]">{textOverlay.fontSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="14"
                          max="48"
                          value={textOverlay.fontSize}
                          onChange={(e) =>
                            setTextOverlay({
                              ...textOverlay,
                              fontSize: parseInt(e.target.value),
                            })
                          }
                          className="w-full accent-[#d4a373] bg-[#222] h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Color Choice */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-[#666] block">
                          Text Tone
                        </label>
                        <div className="flex items-center gap-3">
                          {[
                            { color: '#ffffff', label: 'White' },
                            { color: '#d4a373', label: 'Gold' },
                            { color: '#e0d8d0', label: 'Ivory' },
                            { color: '#111111', label: 'Obsidian' },
                          ].map((c) => (
                            <button
                              key={c.color}
                              type="button"
                              onClick={() => setTextOverlay({ ...textOverlay, color: c.color })}
                              className={`h-7 w-7 rounded-full border transition-transform ${
                                textOverlay.color === c.color
                                  ? 'ring-2 ring-[#d4a373] scale-110'
                                  : 'border-white/20'
                              }`}
                              style={{ backgroundColor: c.color }}
                              title={c.label}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: TRANSFORM & FRAMING */}
              {activeTab === 'transform' && (
                <div className="space-y-5">
                  {/* Rotation & Flip */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#666] mb-2 block">
                      Orientation & Transforms
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#222] bg-[#121212] p-3 text-center hover:border-[#d4a373]/50 hover:bg-[#181818]"
                      >
                        <RotateCw className="h-4 w-4 text-[#d4a373]" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#aaa]">
                          Rotate 90°
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsFlippedH(!isFlippedH)}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                          isFlippedH
                            ? 'border-[#d4a373] bg-[#d4a373]/15 text-[#d4a373]'
                            : 'border-[#222] bg-[#121212] text-[#aaa] hover:bg-[#181818]'
                        }`}
                      >
                        <FlipHorizontal className="h-4 w-4" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                          Flip Horiz
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsFlippedV(!isFlippedV)}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                          isFlippedV
                            ? 'border-[#d4a373] bg-[#d4a373]/15 text-[#d4a373]'
                            : 'border-[#222] bg-[#121212] text-[#aaa] hover:bg-[#181818]'
                        }`}
                      >
                        <FlipHorizontal className="h-4 w-4 rotate-90" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                          Flip Vert
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Framing / Museum Inset Border */}
                  <div className="space-y-2 border-t border-[#1a1a1a] pt-4">
                    <label className="text-[10px] uppercase tracking-widest text-[#666] block">
                      Minimalist Museum Frame Accent
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(
                        [
                          { id: 'none', label: 'None' },
                          { id: 'gold', label: 'Gold Inset' },
                          { id: 'white', label: 'White Inset' },
                          { id: 'dark', label: 'Dark Inset' },
                        ] as const
                      ).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFrameBorder(item.id)}
                          className={`rounded-xl border py-2.5 text-[10px] uppercase tracking-wider font-semibold transition-all ${
                            frameBorder === item.id
                              ? 'border-[#d4a373] bg-[#d4a373]/15 text-[#d4a373]'
                              : 'border-[#222] bg-[#121212] text-[#888] hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Interactive Canvas / Phone Preview */}
          <div
            ref={containerRef}
            className="flex flex-1 items-center justify-center bg-[#050505] p-4 sm:p-6 relative overflow-hidden"
          >
            {/* Phone Bezel Frame Container */}
            <div className="relative flex max-h-[76vh] aspect-[9/16] overflow-hidden rounded-[36px] border-[10px] sm:border-[12px] border-[#1a1a1a] bg-[#111] shadow-[0_0_80px_rgba(0,0,0,0.8)]">
              {/* The Live Rendered Canvas */}
              <canvas
                ref={canvasRef}
                className="h-full w-full object-cover"
              />

              {/* Optional Phone Mockup Lockscreen UI */}
              {showPhoneMockup && (
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 text-white">
                  {/* Status bar */}
                  <div className="flex items-center justify-between text-xs font-semibold px-2">
                    <span>9:41</span>
                    <div className="h-4 w-20 rounded-full bg-black/90 border border-white/10" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px]">5G</span>
                      <span className="text-[10px]">100%</span>
                    </div>
                  </div>

                  {/* Lock Screen Clock */}
                  <div className="my-auto flex flex-col items-center text-center">
                    <span className="text-xs font-medium uppercase tracking-widest drop-shadow-md text-[#e0d8d0]/90">
                      Thursday, August 20
                    </span>
                    <span className="text-6xl font-extralight tracking-tight drop-shadow-lg sm:text-7xl font-sans mt-1">
                      09:41
                    </span>
                  </div>

                  {/* Home indicator */}
                  <div className="mx-auto h-1 w-28 rounded-full bg-white/60 backdrop-blur-md" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Footer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1a1a1a] bg-[#0d0d0d] p-4 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              id="editor-reset-all-btn"
              type="button"
              onClick={() => {
                setCurrentImageUrl(wallpaper.imageUrl);
                setFilters(DEFAULT_FILTERS);
                setRotation(0);
                setIsFlippedH(false);
                setIsFlippedV(false);
                setFrameBorder('none');
                setTextOverlay({ ...textOverlay, enabled: false });
              }}
              className="flex items-center gap-1.5 rounded-full border border-[#222] bg-[#151515] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#888] hover:border-[#333] hover:text-white transition-all"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span>Reset Edits</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Save as New Variation */}
            <button
              id="editor-save-new-btn"
              type="button"
              onClick={handleSaveAsNewVariation}
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-white/20 transition-all"
            >
              <Layers className="h-3.5 w-3.5 text-[#d4a373]" />
              <span>Save As New</span>
            </button>

            {/* Apply Directly */}
            <button
              id="editor-apply-btn"
              type="button"
              onClick={handleApplyChanges}
              className="flex items-center gap-1.5 rounded-xl border border-[#d4a373] bg-[#d4a373]/15 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#d4a373] hover:bg-[#d4a373] hover:text-black transition-all"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Apply Changes</span>
            </button>

            {/* Download to System */}
            <button
              id="editor-download-system-btn"
              type="button"
              onClick={handleDownloadToSystem}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest shadow-lg hover:bg-[#d4a373] transition-all disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <Check className="h-4 w-4 text-black" />
                  <span>Saved to System!</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 text-black" />
                  <span>{isExporting ? 'Exporting...' : 'Download Wallpaper'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
