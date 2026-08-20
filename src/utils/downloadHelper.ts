export async function downloadImage(imageUrl: string, filename: string): Promise<boolean> {
  try {
    let downloadUrl = imageUrl;
    let isObjectUrl = false;

    // For data URLs or external URLs, create a direct Blob to ensure standard download prompt across all browsers
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        downloadUrl = URL.createObjectURL(blob);
        isObjectUrl = true;
      } catch (fetchErr) {
        console.warn('Direct blob conversion fallback to original URL:', fetchErr);
        downloadUrl = imageUrl;
      }
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      if (isObjectUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    }, 200);

    return true;
  } catch (err) {
    console.error('Failed to download image:', err);
    // Fallback: open in new tab so user can right-click save
    const win = window.open(imageUrl, '_blank');
    if (!win) {
      window.location.href = imageUrl;
    }
    return false;
  }
}

export function exportCanvasToDownload(
  canvas: HTMLCanvasElement,
  filename: string,
  format: 'image/png' | 'image/jpeg' = 'image/png',
  quality: number = 0.95
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          // Fallback to dataURL
          const dataUrl = canvas.toDataURL(format, quality);
          downloadImage(dataUrl, filename).then(resolve);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          resolve(true);
        }, 200);
      }, format, quality);
    } catch (e) {
      console.error('Error exporting canvas:', e);
      resolve(false);
    }
  });
}

export function sanitizeFilename(prompt: string, suffix: string = 'wallpaper'): string {
  const clean = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 32);
  return `${clean || 'vibewalls'}-${suffix}.png`;
}

