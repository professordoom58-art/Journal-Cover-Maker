import jsPDF from 'jspdf';
import { CoverState, ProjectState } from '../types/project';
import { getSpreadDimensions } from './units';

// Cache loaded HTMLImageElement instances to avoid reloading
const imageCache = new Map<string, HTMLImageElement>();

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

/**
 * Draws rounded rectangle path on canvas
 */
const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

/**
 * Draws crisp barcode with numbers
 */
const drawBarcode = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  code: string = '9781402894626'
) => {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);

  const paddingX = width * 0.08;
  const barY = y + height * 0.12;
  const barHeight = height * 0.65;
  const barAreaWidth = width - paddingX * 2;

  ctx.fillStyle = '#0f172a';
  const numBars = 45;
  const barWidth = barAreaWidth / numBars;

  let seed = 0;
  for (let i = 0; i < code.length; i++) {
    seed += code.charCodeAt(i);
  }

  for (let i = 0; i < numBars; i++) {
    const isGuard = i < 3 || (i >= 21 && i <= 23) || i >= numBars - 3;
    const isDrawn = isGuard || ((seed * (i + 1) * 31) % 100 > 45);

    if (isDrawn) {
      const extraH = isGuard ? height * 0.08 : 0;
      ctx.fillRect(
        x + paddingX + i * barWidth,
        barY,
        Math.max(1.5, barWidth * 0.75),
        barHeight + extraH
      );
    }
  }

  ctx.font = `bold ${Math.round(height * 0.16)}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(code, x + width / 2, y + height - 3);

  ctx.restore();
};

/**
 * Word wraps text on canvas without stretching
 */
const fillWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 6
) => {
  const paragraphs = text.split('\n');
  let currentY = y;
  let linesDrawn = 0;

  for (const para of paragraphs) {
    const words = para.split(' ');
    let currentLine = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(currentLine, x, currentY);
        currentLine = words[n] + ' ';
        currentY += lineHeight;
        linesDrawn++;
        if (linesDrawn >= maxLines) break;
      } else {
        currentLine = testLine;
      }
    }

    if (linesDrawn >= maxLines) break;

    ctx.fillText(currentLine, x, currentY);
    currentY += lineHeight;
    linesDrawn++;
    if (linesDrawn >= maxLines) break;
  }
};

/**
 * Draws photo zone onto 300 DPI canvas: support for Fit (contain) and Fill (cover)
 */
const renderPhotoZone = async (
  ctx: CanvasRenderingContext2D,
  zone: CoverState['backPhoto'],
  zoneX: number,
  zoneY: number,
  zoneWidth: number,
  zoneHeight: number,
  isForExport: boolean = false
) => {
  ctx.save();
  ctx.beginPath();
  ctx.rect(zoneX, zoneY, zoneWidth, zoneHeight);
  ctx.clip();

  // Background
  ctx.fillStyle = zone.backgroundColor || '#ffffff';
  ctx.fillRect(zoneX, zoneY, zoneWidth, zoneHeight);

  if (zone.imageSrc) {
    try {
      const img = await loadImage(zone.imageSrc);

      ctx.save();
      // Fit (contain: Math.min) vs Fill (cover: Math.max)
      const isFill = zone.fitMode === 'fill';
      const scale = isFill
        ? Math.max(zoneWidth / img.naturalWidth, zoneHeight / img.naturalHeight)
        : Math.min(zoneWidth / img.naturalWidth, zoneHeight / img.naturalHeight);

      const drawW = img.naturalWidth * scale;
      const drawH = img.naturalHeight * scale;

      // Map 96 DPI pan offset to 300 DPI (factor 3.125)
      const panX300 = (zone.panX || 0) * 3.125;
      const panY300 = (zone.panY || 0) * 3.125;

      const centerX = zoneX + zoneWidth / 2 + panX300;
      const centerY = zoneY + zoneHeight / 2 + panY300;

      ctx.translate(centerX, centerY);
      ctx.rotate((zone.rotation * Math.PI) / 180);
      ctx.scale(
        (zone.flipH ? -1 : 1) * zone.zoom,
        (zone.flipV ? -1 : 1) * zone.zoom
      );

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    } catch (e) {
      console.error('Failed to render photo:', e);
    }
  } else if (!isForExport) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tap to add photo', zoneX + zoneWidth / 2, zoneY + zoneHeight / 2);
  }

  ctx.restore();
};

/**
 * Renders the 300 DPI cover spread canvas (2475 x 1650 px when cropped to trim, or 2550 x 1725 with bleed)
 */
export const renderCoverSpreadCanvas = async (
  cover: CoverState,
  includeBleed: boolean = false,
  isForExport: boolean = false
): Promise<HTMLCanvasElement> => {
  // Wait for all Google Fonts to load before rendering
  if (document.fonts) {
    await document.fonts.ready;
  }

  const dims = getSpreadDimensions(cover.spine.widthInches);
  const canvas = document.createElement('canvas');

  const width = includeBleed ? dims.spreadWithBleedWidthPx : dims.trimWidthPx;
  const height = includeBleed ? dims.spreadWithBleedHeightPx : dims.trimHeightPx;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const bleedX = includeBleed ? dims.bleedPx : 0;
  const bleedY = includeBleed ? dims.bleedPx : 0;

  // 1. Back Photo Zone (4 in = 1200 px at 300 DPI)
  if (includeBleed && cover.backPhoto.extendBleed !== false) {
    ctx.fillStyle = cover.backPhoto.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, dims.backTrimWidth + bleedX, height);
  }
  const backZoneX = bleedX;
  const backZoneY = bleedY;
  const backZoneW = dims.backTrimWidth;
  const backZoneH = dims.trimHeightPx;
  await renderPhotoZone(ctx, cover.backPhoto, backZoneX, backZoneY, backZoneW, backZoneH, isForExport);

  // 2. Front Photo Zone (4 in = 1200 px at 300 DPI)
  if (includeBleed && cover.frontPhoto.extendBleed !== false) {
    ctx.fillStyle = cover.frontPhoto.backgroundColor || '#ffffff';
    ctx.fillRect(dims.frontTrimX + bleedX, 0, dims.frontTrimWidth + bleedX, height);
  }
  const frontZoneX = dims.frontTrimX + bleedX;
  const frontZoneY = bleedY;
  const frontZoneW = dims.frontTrimWidth;
  const frontZoneH = dims.trimHeightPx;
  await renderPhotoZone(ctx, cover.frontPhoto, frontZoneX, frontZoneY, frontZoneW, frontZoneH, isForExport);

  // 3. Spine Panel (0.25 in = 75 px at 300 DPI)
  if (cover.spine.visible && dims.spineTrimWidth > 0) {
    const spineX = dims.spineTrimX + bleedX;
    const spineY = 0;
    const spineW = dims.spineTrimWidth;
    const spineH = height;

    ctx.save();
    ctx.fillStyle = cover.spine.backgroundColor || '#2B2B33';
    ctx.fillRect(spineX, spineY, spineW, spineH);

    // Spine text: default 11 pt, centered, rotated 90 degrees, auto-shrink uniformly (max 24 chars)
    if (cover.spine.text) {
      const rawText = cover.spine.text.slice(0, 24);
      ctx.save();
      ctx.translate(spineX + spineW / 2, spineY + spineH / 2);
      ctx.rotate(Math.PI / 2); // 90 degrees top to bottom

      let fontPt = cover.spine.fontSize || 11;
      let fontPx = Math.round(fontPt * 4.16); // 1 pt = 1/72 in * 300 dpi = 4.166 px
      ctx.font = `600 ${fontPx}px "${cover.spine.fontFamily || 'Inter'}", sans-serif`;

      // Must fit inside spine height (1650 px) and width (75 px)
      const maxSpineLengthPx = dims.trimHeightPx - 120;
      const maxSpineThicknessPx = spineW * 0.75;

      while (
        fontPt > 6 &&
        (ctx.measureText(rawText).width > maxSpineLengthPx || fontPx > maxSpineThicknessPx)
      ) {
        fontPt -= 0.5;
        fontPx = Math.round(fontPt * 4.16);
        ctx.font = `600 ${fontPx}px "${cover.spine.fontFamily || 'Inter'}", sans-serif`;
      }

      ctx.fillStyle = cover.spine.textColor || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rawText, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  // 4. Back Cover Info Block
  if (cover.infoBlock.visible) {
    const ib = cover.infoBlock;
    const isDescOn = ib.showDescription !== false && ib.description.visible;

    // Scale dimensions to 300 DPI (3.125 factor)
    const scaleFactor = 3.125;
    const ibW = Math.round(336 * scaleFactor); // 1050 px
    const ibH = Math.round((isDescOn ? 150 : 76) * scaleFactor); // 468 px or 238 px

    // Safe margin bottom anchored: safe margin is 75 px (24px * 3.125) inside trim
    const safeBottomY = dims.trimHeightPx - 75 + bleedY;
    const ibY = safeBottomY - ibH;
    const ibX = 75 + bleedX;

    ctx.save();
    // Backing panel
    ctx.save();
    ctx.globalAlpha = ib.opacity;
    ctx.fillStyle = ib.backgroundColor;
    roundRect(ctx, ibX, ibY, ibW, ibH, ib.borderRadius * scaleFactor);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, ibX, ibY, ibW, ibH, ib.borderRadius * scaleFactor);
    ctx.stroke();

    const padding = Math.round(14 * scaleFactor); // ~44 px
    const contentW = ibW - padding * 2;
    let currentY = ibY + padding;

    // Optional Description text
    if (isDescOn && ib.description.text) {
      ctx.save();
      const descFontPx = Math.round((ib.description.fontSize || 9) * 4.16);
      const descLineHeight = Math.round(descFontPx * (ib.description.lineHeight || 1.4));
      ctx.font = `400 ${descFontPx}px "${ib.description.fontFamily || 'Inter'}", sans-serif`;
      ctx.fillStyle = ib.description.color;
      ctx.textBaseline = 'top';
      fillWrappedText(ctx, ib.description.text, ibX + padding, currentY, contentW, descLineHeight, 3);
      ctx.restore();
      currentY += descLineHeight * 3 + 16;

      // Divider line
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ibX + padding, currentY);
      ctx.lineTo(ibX + ibW - padding, currentY);
      ctx.stroke();
      currentY += 16;
    }

    // Details line
    if (ib.details.visible && ib.details.text) {
      ctx.save();
      const detailsFontPx = Math.round((ib.details.fontSize || 8) * 4.16);
      ctx.font = `500 ${detailsFontPx}px "${ib.details.fontFamily || 'Inter'}", sans-serif`;
      ctx.fillStyle = ib.details.color;
      ctx.textBaseline = 'top';
      ctx.fillText(ib.details.text, ibX + padding, currentY);
      ctx.restore();
    }

    // Bottom row: Price Box & Barcode
    const priceH = Math.round(24 * scaleFactor);
    const priceW = Math.round(72 * scaleFactor);
    const bottomRowY = ibY + ibH - padding - priceH;

    // Price Box
    if (ib.priceBox.visible && ib.priceBox.text) {
      ctx.save();
      const pb = ib.priceBox;
      ctx.fillStyle = pb.fillColor;
      roundRect(ctx, ibX + padding, bottomRowY, priceW, priceH, pb.borderRadius * scaleFactor);
      ctx.fill();

      ctx.fillStyle = pb.textColor;
      ctx.font = `bold ${Math.round((pb.fontSize || 10) * 4.16)}px "${pb.fontFamily || 'Inter'}", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pb.text, ibX + padding + priceW / 2, bottomRowY + priceH / 2);
      ctx.restore();
    }

    // Barcode
    if (ib.barcode.visible) {
      const bc = ib.barcode;
      const bcW = Math.round(76 * scaleFactor);
      const bcH = Math.round(24 * scaleFactor);
      const bcX = ibX + ibW - padding - bcW;
      const bcY = ibY + ibH - padding - bcH;
      drawBarcode(ctx, bcX, bcY, bcW, bcH, bc.code);
    }

    ctx.restore();
  }

  // 5. Front Cover Title (Sits inside the front safe area, visible by default)
  if (cover.frontTitle.visible && cover.frontTitle.text) {
    const ft = cover.frontTitle;
    const scaleFactor = 3.125;
    const titleX = (dims.frontTrimX + dims.frontTrimWidth / 2 + bleedX);
    const titleY = ((ft.y || 200) * scaleFactor + bleedY);

    ctx.save();
    const titleFontPx = Math.round((ft.fontSize || 28) * 4.16);
    ctx.font = `${ft.fontWeight || 700} ${titleFontPx}px "${ft.fontFamily || 'Playfair Display'}", serif`;
    ctx.fillStyle = ft.textColor;
    ctx.textAlign = ft.align || 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ft.text, titleX, titleY);
    ctx.restore();
  }

  return canvas;
};

/**
 * Draws standard L-shaped printer crop marks at trim corners
 */
export const drawCropMarks = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  trimWidth: number,
  trimHeight: number,
  bleed: number,
  spineTrimX: number,
  spineTrimWidth: number
) => {
  ctx.save();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);

  const markLen = 28;
  const markGap = 8;

  const tX = x + bleed;
  const tY = y + bleed;
  const tR = tX + trimWidth;
  const tB = tY + trimHeight;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(tX, tY - markGap);
  ctx.lineTo(tX, tY - markGap - markLen);
  ctx.moveTo(tX - markGap, tY);
  ctx.lineTo(tX - markGap - markLen, tY);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(tR, tY - markGap);
  ctx.lineTo(tR, tY - markGap - markLen);
  ctx.moveTo(tR + markGap, tY);
  ctx.lineTo(tR + markGap + markLen, tY);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(tX, tB + markGap);
  ctx.lineTo(tX, tB + markGap - markLen);
  ctx.moveTo(tX - markGap, tB);
  ctx.lineTo(tX - markGap - markLen, tB);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(tR, tB + markGap);
  ctx.lineTo(tR, tB + markGap + markLen);
  ctx.moveTo(tR + markGap, tB);
  ctx.lineTo(tR + markGap + markLen, tB);
  ctx.stroke();

  // Spine fold tick marks at top and bottom
  if (spineTrimWidth > 0) {
    const s1X = tX + spineTrimX;
    const s2X = s1X + spineTrimWidth;

    ctx.beginPath();
    ctx.moveTo(s1X, tY - markGap);
    ctx.lineTo(s1X, tY - markGap - markLen * 0.7);
    ctx.moveTo(s2X, tY - markGap);
    ctx.lineTo(s2X, tY - markGap - markLen * 0.7);

    ctx.moveTo(s1X, tB + markGap);
    ctx.lineTo(s1X, tB + markGap + markLen * 0.7);
    ctx.moveTo(s2X, tB + markGap);
    ctx.lineTo(s2X, tB + markGap + markLen * 0.7);
    ctx.stroke();
  }

  ctx.restore();
};

/**
 * Renders the A4 print sheet canvas (2480 x 3508 px at 300 DPI)
 */
export const renderA4PrintSheetCanvas = async (project: ProjectState): Promise<HTMLCanvasElement> => {
  if (document.fonts) {
    await document.fonts.ready;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 2480;
  canvas.height = 3508;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context for A4 sheet');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const { a4Settings } = project;
  const scale = a4Settings.scale;
  const gapPx = Math.round(a4Settings.gapInches * 300);

  const coverTop = project.coverA;
  const coverBottom = a4Settings.duplicateCoverA ? project.coverA : project.coverB;

  const includeBleed = a4Settings.includeBleedInPrint ?? true;

  const [canvasTop, canvasBottom] = await Promise.all([
    renderCoverSpreadCanvas(coverTop, includeBleed, true),
    renderCoverSpreadCanvas(coverBottom, includeBleed, true),
  ]);

  const dimsTop = getSpreadDimensions(coverTop.spine.widthInches);
  const dimsBottom = getSpreadDimensions(coverBottom.spine.widthInches);

  const spreadW = Math.round(canvasTop.width * scale);
  const spreadH = Math.round(canvasTop.height * scale);

  const totalHeight = spreadH * 2 + gapPx;
  const startY = Math.round((canvas.height - totalHeight) / 2);
  const posX = Math.round((canvas.width - spreadW) / 2);

  // Top cover spread
  ctx.drawImage(canvasTop, posX, startY, spreadW, spreadH);
  if (a4Settings.showCropMarks) {
    drawCropMarks(
      ctx,
      posX,
      startY,
      dimsTop.trimWidthPx * scale,
      dimsTop.trimHeightPx * scale,
      (includeBleed ? dimsTop.bleedPx : 0) * scale,
      dimsTop.spineTrimX * scale,
      dimsTop.spineTrimWidth * scale
    );
  }

  // Bottom cover spread
  const posBottomY = startY + spreadH + gapPx;
  ctx.drawImage(canvasBottom, posX, posBottomY, spreadW, spreadH);
  if (a4Settings.showCropMarks) {
    drawCropMarks(
      ctx,
      posX,
      posBottomY,
      dimsBottom.trimWidthPx * scale,
      dimsBottom.trimHeightPx * scale,
      (includeBleed ? dimsBottom.bleedPx : 0) * scale,
      dimsBottom.spineTrimX * scale,
      dimsBottom.spineTrimWidth * scale
    );
  }

  return canvas;
};

/**
 * Downloads a canvas element as PNG file
 */
export const downloadCanvas = (
  canvas: HTMLCanvasElement,
  filename: string,
  _format: 'png' = 'png'
) => {
  const mimeType = 'image/png';
  const dataUrl = canvas.toDataURL(mimeType);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exports A4 Print Sheet as PDF (exactly 210 x 297 mm) with embedded 300 DPI image
 */
export const exportA4Pdf = async (project: ProjectState, filename: string = 'Journal-Covers-A4-Print.pdf') => {
  if (document.fonts) {
    await document.fonts.ready;
  }
  const canvas = await renderA4PrintSheetCanvas(project);
  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  pdf.save(filename);
};
