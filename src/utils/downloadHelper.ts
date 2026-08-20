export function downloadImage(dataUrl: string, filename: string) {
  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to download image:', err);
    // Fallback: open in new tab
    const win = window.open();
    if (win) {
      win.document.write(`<img src="${dataUrl}" alt="Wallpaper" style="max-width:100%;height:auto;" />`);
    }
  }
}

export function sanitizeFilename(prompt: string, suffix: string = 'wallpaper'): string {
  const clean = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 30);
  return `${clean || 'aura-wallpaper'}-${suffix}.png`;
}
