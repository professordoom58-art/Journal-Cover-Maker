/**
 * Color and Contrast utilities for Spine and Photo edges
 */

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

export const getLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const a = [rgb.r, rgb.g, rgb.b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
};

/**
 * Calculates WCAG contrast ratio between two hex colors (1 to 21)
 */
export const getContrastRatio = (hex1: string, hex2: string): number => {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Samples the average color along image edges:
 * - 'right': right edge strip (for back photo next to spine)
 * - 'left': left edge strip (for front photo next to spine)
 * - 'all': all 4 outer border edges (for panel background behind fitted photo)
 */
export const sampleImageEdgeColor = (
  imageSrc: string,
  mode: 'right' | 'left' | 'all' = 'all'
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        canvas.width = Math.min(200, w);
        canvas.height = Math.min(200, h);
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('#ffffff');

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const cw = canvas.width;
        const ch = canvas.height;

        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        let count = 0;

        if (mode === 'right') {
          // Sample rightmost 6 columns
          for (let y = 0; y < ch; y += 2) {
            for (let x = cw - 6; x < cw; x++) {
              const idx = (y * cw + x) * 4;
              totalR += data[idx];
              totalG += data[idx + 1];
              totalB += data[idx + 2];
              count++;
            }
          }
        } else if (mode === 'left') {
          // Sample leftmost 6 columns
          for (let y = 0; y < ch; y += 2) {
            for (let x = 0; x < 6; x++) {
              const idx = (y * cw + x) * 4;
              totalR += data[idx];
              totalG += data[idx + 1];
              totalB += data[idx + 2];
              count++;
            }
          }
        } else {
          // Sample outer border (top, bottom, left, right)
          for (let x = 0; x < cw; x += 2) {
            // top
            let idx = (0 * cw + x) * 4;
            totalR += data[idx];
            totalG += data[idx + 1];
            totalB += data[idx + 2];
            count++;
            // bottom
            idx = ((ch - 1) * cw + x) * 4;
            totalR += data[idx];
            totalG += data[idx + 1];
            totalB += data[idx + 2];
            count++;
          }
          for (let y = 0; y < ch; y += 2) {
            // left
            let idx = (y * cw + 0) * 4;
            totalR += data[idx];
            totalG += data[idx + 1];
            totalB += data[idx + 2];
            count++;
            // right
            idx = (y * cw + (cw - 1)) * 4;
            totalR += data[idx];
            totalG += data[idx + 1];
            totalB += data[idx + 2];
            count++;
          }
        }

        if (count === 0) return resolve('#ffffff');
        const avgR = Math.round(totalR / count);
        const avgG = Math.round(totalG / count);
        const avgB = Math.round(totalB / count);
        const hex =
          '#' +
          [avgR, avgG, avgB]
            .map((c) => c.toString(16).padStart(2, '0'))
            .join('');
        resolve(hex);
      } catch (err) {
        console.warn('Failed to sample image edge color:', err);
        resolve('#ffffff');
      }
    };
    img.onerror = () => resolve('#ffffff');
    img.src = imageSrc;
  });
};
