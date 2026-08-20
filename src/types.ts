export type AspectRatioType = '9:16' | '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '16:9' | '21:9';
export type ImageSizeType = '1K' | '2K' | '4K';
export type ModelType = 'gemini-3-pro-image-preview' | 'gemini-3.1-flash-image-preview';

export interface WallpaperItem {
  id: string;
  imageUrl: string;
  prompt: string;
  variationLabel: string;
  variationIndex: number;
  aspectRatio: AspectRatioType;
  imageSize: ImageSizeType;
  model: ModelType;
  createdAt: number;
  referenceImageUsed?: boolean;
}

export interface WallpaperBatch {
  id: string;
  vibePrompt: string;
  aspectRatio: AspectRatioType;
  imageSize: ImageSizeType;
  model: ModelType;
  createdAt: number;
  referenceImage?: string;
  wallpapers: WallpaperItem[];
}

export interface GenerateWallpaperPayload {
  prompt: string;
  aspectRatio?: AspectRatioType;
  imageSize?: ImageSizeType;
  model?: ModelType;
  referenceImage?: string; // Base64 data url or base64 string
  count?: number;
}
