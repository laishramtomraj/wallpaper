import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY is not set. Requests will fail if key is required.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const VARIATION_DIRECTIVES = [
  'Variation 1 (Balanced Composition): Balanced atmospheric frame with clean negative space at the upper third suitable for smartphone clock display, high visual aesthetic.',
  'Variation 2 (Cinematic Lighting): Dramatic cinematic lighting, rich depth of field, bold color contrasts and nuanced shadows.',
  'Variation 3 (Artistic & Textured): Painterly texture and rich details, soft ambient volumetric glow, elegant color harmony.',
  'Variation 4 (Dynamic Perspective): Dynamic perspective and intriguing focal point, vivid highlights, captivating smartphone wallpaper wallpaper framing.'
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit to handle reference image base64 uploads for remixing
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Main wallpaper generation endpoint
  app.post('/api/generate-wallpapers', async (req, res) => {
    try {
      const {
        prompt,
        referenceImage,
        aspectRatio = '9:16',
        imageSize = '1K',
        count = 4,
        model = 'gemini-3-pro-image-preview',
      } = req.body;

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        res.status(400).json({ error: 'A vibe description or prompt is required.' });
        return;
      }

      const rawPrompt = prompt.trim();
      const ai = getGeminiClient();

      // Normalize model name
      let targetModel = model;
      if (!targetModel || typeof targetModel !== 'string') {
        targetModel = 'gemini-3-pro-image-preview';
      }

      // Valid aspect ratios supported
      const validAspectRatios = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];
      const finalAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '9:16';

      // Valid image sizes
      const validSizes = ['1K', '2K', '4K'];
      const finalImageSize = validSizes.includes(imageSize) ? imageSize : '1K';

      // Determine reference image parts if remixing
      let refImageInlineData: { data: string; mimeType: string } | null = null;
      if (referenceImage && typeof referenceImage === 'string') {
        const matches = referenceImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          refImageInlineData = {
            mimeType: matches[1],
            data: matches[2],
          };
        } else if (referenceImage.length > 50) {
          refImageInlineData = {
            mimeType: 'image/png',
            data: referenceImage,
          };
        }
      }

      const totalVariations = Math.min(Math.max(1, count || 4), 4);
      console.log(`Generating ${totalVariations} wallpaper variations for vibe: "${rawPrompt.slice(0, 60)}..." (Aspect: ${finalAspectRatio}, Size: ${finalImageSize}, Model: ${targetModel}, HasRef: ${Boolean(refImageInlineData)})`);

      // Generate variations concurrently
      const generationPromises = Array.from({ length: totalVariations }).map(async (_, idx) => {
        const directive = VARIATION_DIRECTIVES[idx] || `Variation ${idx + 1}`;
        const enhancedPrompt = refImageInlineData
          ? `Create a fresh phone wallpaper variation remixed from the reference image, reimagined with the vibe: "${rawPrompt}". ${directive}. High quality wallpaper aesthetic, visually captivating, no text overlays.`
          : `Create a stunning phone wallpaper with the vibe: "${rawPrompt}". ${directive}. High quality wallpaper aesthetic, visually captivating, clean composition, no watermarks, no text overlays.`;

        const parts: any[] = [];
        if (refImageInlineData) {
          parts.push({
            inlineData: {
              data: refImageInlineData.data,
              mimeType: refImageInlineData.mimeType,
            },
          });
        }
        parts.push({ text: enhancedPrompt });

        const config: any = {
          imageConfig: {
            aspectRatio: finalAspectRatio,
            imageSize: finalImageSize,
          },
        };

        try {
          const response = await ai.models.generateContent({
            model: targetModel,
            contents: { parts },
            config,
          });

          // Find image part in candidates
          const partsList = response.candidates?.[0]?.content?.parts || [];
          for (const part of partsList) {
            if (part.inlineData && part.inlineData.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              return {
                id: `wp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
                imageUrl: `data:${mime};base64,${part.inlineData.data}`,
                prompt: rawPrompt,
                variationLabel: `Variation ${idx + 1}`,
                variationIndex: idx,
                aspectRatio: finalAspectRatio,
                imageSize: finalImageSize,
                model: targetModel,
                createdAt: Date.now(),
                referenceImageUsed: Boolean(refImageInlineData),
              };
            }
          }

          // Fallback check if text was returned instead
          console.warn(`Variation ${idx + 1} did not return inlineData image part.`);
          return null;
        } catch (callErr: any) {
          console.error(`Error generating variation ${idx + 1}:`, callErr?.message || callErr);
          // Attempt a single fallback with flash image if pro model had an issue
          if (targetModel !== 'gemini-3.1-flash-image-preview') {
            try {
              console.log(`Retrying variation ${idx + 1} with gemini-3.1-flash-image-preview...`);
              const retryResponse = await ai.models.generateContent({
                model: 'gemini-3.1-flash-image-preview',
                contents: { parts },
                config,
              });
              const retryParts = retryResponse.candidates?.[0]?.content?.parts || [];
              for (const part of retryParts) {
                if (part.inlineData && part.inlineData.data) {
                  const mime = part.inlineData.mimeType || 'image/png';
                  return {
                    id: `wp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
                    imageUrl: `data:${mime};base64,${part.inlineData.data}`,
                    prompt: rawPrompt,
                    variationLabel: `Variation ${idx + 1}`,
                    variationIndex: idx,
                    aspectRatio: finalAspectRatio,
                    imageSize: finalImageSize,
                    model: 'gemini-3.1-flash-image-preview',
                    createdAt: Date.now(),
                    referenceImageUsed: Boolean(refImageInlineData),
                  };
                }
              }
            } catch (retryErr: any) {
              console.error(`Retry for variation ${idx + 1} also failed:`, retryErr?.message || retryErr);
            }
          }
          return null;
        }
      });

      const results = await Promise.all(generationPromises);
      const successfulWallpapers = results.filter((item): item is NonNullable<typeof item> => item !== null);

      if (successfulWallpapers.length === 0) {
        res.status(500).json({
          error: 'Failed to generate wallpapers. Please check your vibe description or try a different prompt.',
        });
        return;
      }

      res.json({
        success: true,
        wallpapers: successfulWallpapers,
        meta: {
          prompt: rawPrompt,
          aspectRatio: finalAspectRatio,
          imageSize: finalImageSize,
          model: targetModel,
          count: successfulWallpapers.length,
          referenceImageUsed: Boolean(refImageInlineData),
        },
      });
    } catch (err: any) {
      console.error('Server error in /api/generate-wallpapers:', err);
      res.status(500).json({
        error: err?.message || 'An unexpected error occurred while generating wallpapers.',
      });
    }
  });

  // Prompt vibe expander helper
  app.post('/api/expand-vibe', async (req, res) => {
    try {
      const { vibe } = req.body;
      if (!vibe) {
        res.status(400).json({ error: 'Vibe string required' });
        return;
      }
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `You are an expert aesthetic wallpaper visual director. Given this short user vibe: "${vibe}", generate a vivid, sensory-rich 1-2 sentence visual prompt describing lighting, mood, colors, and camera angle perfectly tailored for a stunning 9:16 mobile wallpaper. Return only the enhanced prompt without introductory remarks or quotes.`,
      });
      const expanded = response.text?.trim() || vibe;
      res.json({ expandedPrompt: expanded });
    } catch (err: any) {
      console.error('Error expanding vibe:', err);
      res.status(500).json({ error: 'Failed to expand vibe' });
    }
  });

  // Vite middleware setup for dev vs prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Wallpaper Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
