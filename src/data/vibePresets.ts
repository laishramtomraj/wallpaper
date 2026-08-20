export interface VibePreset {
  id: string;
  name: string;
  emoji: string;
  prompt: string;
  category: 'Cyber & Sci-Fi' | 'Anime & Art' | 'Nature & Calm' | 'Minimal & Dark' | 'Abstract & 3D';
  gradient: string;
}

export const VIBE_PRESETS: VibePreset[] = [
  {
    id: 'rainy-cyberpunk',
    name: 'Rainy Cyberpunk Lo-Fi',
    emoji: '🌧️',
    prompt: 'Rainy cyberpunk lo-fi city street at midnight, neon reflections on wet asphalt, glowing holographic vending machines, cozy ramen shop ramen steam, cinematic teal and magenta bokeh lighting, vertical smartphone wallpaper composition',
    category: 'Cyber & Sci-Fi',
    gradient: 'from-fuchsia-600 to-cyan-700',
  },
  {
    id: 'studio-ghibli-meadow',
    name: 'Ghibli Summer Meadow',
    emoji: '🌿',
    prompt: 'Studio Ghibli style lush summer grassy meadow on a sunny hill, towering cumulus clouds in bright sapphire sky, wind blowing through wildflowers, hand-painted aesthetic, nostalgic warm pastoral anime wallpaper',
    category: 'Anime & Art',
    gradient: 'from-emerald-500 to-sky-600',
  },
  {
    id: 'amoled-minimal-liquid',
    name: 'OLED Minimalist Liquid',
    emoji: '🖤',
    prompt: 'Ultra clean AMOLED pure pitch-black background with smooth flowing iridescent obsidian liquid ribbon curves, subtle matte metallic reflections, luxurious dark abstract minimalism wallpaper',
    category: 'Minimal & Dark',
    gradient: 'from-zinc-800 to-neutral-900',
  },
  {
    id: 'bioluminescent-abyss',
    name: 'Bioluminescent Abyss',
    emoji: '🪼',
    prompt: 'Deep ocean abyss with glowing translucent neon bioluminescent jellyfish, floating underwater particles, ethereal cyan and violet glow in dark deep sea, mesmerizing mystical phone wallpaper',
    category: 'Nature & Calm',
    gradient: 'from-cyan-900 to-blue-950',
  },
  {
    id: 'synthwave-sunset',
    name: 'Neo-Tokyo Synthwave',
    emoji: '🌆',
    prompt: '80s retro synthwave aesthetic, giant wireframe wire grid horizon with huge glowing neon pink sun setting over futuristic metropolis, palm trees silhouette, outrun vaporwave wallpaper',
    category: 'Cyber & Sci-Fi',
    gradient: 'from-pink-600 to-purple-800',
  },
  {
    id: 'nordic-fog-forest',
    name: 'Nordic Foggy Pine Forest',
    emoji: '🌲',
    prompt: 'Moody Nordic misty pine forest early dawn, dense soft fog weaving through evergreen trees, peaceful mountain ridge in background, cool muted cinematic tones, atmospheric calm wallpaper',
    category: 'Nature & Calm',
    gradient: 'from-slate-700 to-teal-900',
  },
  {
    id: 'cozy-autumn-coffee',
    name: 'Cozy Autumn Cafe',
    emoji: '☕',
    prompt: 'Warm cozy coffee shop window on a rainy autumn day, cup of steaming hot chocolate, golden amber fallen maple leaves outside on cobblestone, warm amber bokeh lights, cozy lofi wallpaper',
    category: 'Nature & Calm',
    gradient: 'from-amber-600 to-orange-800',
  },
  {
    id: 'cosmic-nebula-3d',
    name: 'Cosmic Nebula Glass',
    emoji: '✨',
    prompt: 'Abstract 3D frosted glass prisms floating in deep starry space, refracting vibrant cosmic nebula gas clouds in gold and violet, Octane 3D render, futuristic luxury wallpaper',
    category: 'Abstract & 3D',
    gradient: 'from-indigo-700 to-rose-700',
  },
  {
    id: '90s-retro-anime-room',
    name: '90s Lo-Fi Anime Room',
    emoji: '📼',
    prompt: 'Cozy aesthetic 90s retro anime bedroom interior overlooking dusk city skyline, soft purple twilight light spilling through window, plants on windowsill, nostalgic hand-drawn cell animation wallpaper',
    category: 'Anime & Art',
    gradient: 'from-violet-600 to-fuchsia-800',
  },
  {
    id: 'pastel-desert-dunes',
    name: 'Pastel Dream Dunes',
    emoji: '🏜️',
    prompt: 'Minimalist smooth sand dunes under a soft pastel cotton-candy gradient sky, delicate shadows, surreal quiet desert solitude, gentle blush pink and soft lavender aesthetic',
    category: 'Minimal & Dark',
    gradient: 'from-rose-400 to-indigo-500',
  }
];

export const ASPECT_RATIO_CONFIGS: { label: string; value: string; desc: string; icon: string }[] = [
  { label: '9:16', value: '9:16', desc: 'Phone Wallpaper', icon: '📱' },
  { label: '1:1', value: '1:1', desc: 'Square Avatar', icon: '⏹️' },
  { label: '2:3', value: '2:3', desc: 'Tall Portrait', icon: '🖼️' },
  { label: '3:2', value: '3:2', desc: 'Photo Landscape', icon: '🌄' },
  { label: '3:4', value: '3:4', desc: 'Standard Portrait', icon: '📄' },
  { label: '4:3', value: '4:3', desc: 'Classic Display', icon: '🖥️' },
  { label: '16:9', value: '16:9', desc: 'Widescreen / PC', icon: '💻' },
  { label: '21:9', value: '21:9', desc: 'Ultra-wide', icon: '🎞️' },
];

export const IMAGE_SIZE_CONFIGS: { label: string; value: string; desc: string }[] = [
  { label: '1K', value: '1K', desc: 'Standard Fast' },
  { label: '2K', value: '2K', desc: 'HD Crisp (Retina)' },
  { label: '4K', value: '4K', desc: 'Ultra Studio Max' },
];
