import { WallpaperItem } from '../types';

// Curated high aesthetic initial demo wallpapers so the canvas is immediately vivid and interactive
export const STARTER_WALLPAPERS: WallpaperItem[] = [
  {
    id: 'starter-1',
    prompt: 'Rainy cyberpunk lo-fi city street at midnight, neon reflections on wet asphalt, glowing ramen shop',
    variationLabel: 'V1 · Balanced Atmosphere',
    variationIndex: 0,
    aspectRatio: '9:16',
    imageSize: '1K',
    model: 'gemini-3-pro-image-preview',
    createdAt: Date.now() - 3600000,
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'starter-2',
    prompt: 'Rainy cyberpunk lo-fi city street at midnight, neon reflections on wet asphalt, glowing ramen shop',
    variationLabel: 'V2 · Cinematic Bokeh',
    variationIndex: 1,
    aspectRatio: '9:16',
    imageSize: '1K',
    model: 'gemini-3-pro-image-preview',
    createdAt: Date.now() - 3600000,
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'starter-3',
    prompt: 'Rainy cyberpunk lo-fi city street at midnight, neon reflections on wet asphalt, glowing ramen shop',
    variationLabel: 'V3 · Deep Textures & Mist',
    variationIndex: 2,
    aspectRatio: '9:16',
    imageSize: '1K',
    model: 'gemini-3-pro-image-preview',
    createdAt: Date.now() - 3600000,
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'starter-4',
    prompt: 'Rainy cyberpunk lo-fi city street at midnight, neon reflections on wet asphalt, glowing ramen shop',
    variationLabel: 'V4 · Neon Alleyway Perspective',
    variationIndex: 3,
    aspectRatio: '9:16',
    imageSize: '1K',
    model: 'gemini-3-pro-image-preview',
    createdAt: Date.now() - 3600000,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop',
  },
];
