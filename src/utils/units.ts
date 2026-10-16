import { DPI, DIMENSIONS } from '../constants/defaults';

export const inchesToPx = (inches: number, dpi: number = DPI): number => {
  return Math.round(inches * dpi);
};

export const pxToInches = (px: number, dpi: number = DPI): number => {
  return Number((px / dpi).toFixed(3));
};

export interface SpreadDimensions {
  journalWidthIn: number;
  journalHeightIn: number;
  spineWidthIn: number;
  bleedIn: number;
  
  // Trim area (excluding bleed)
  trimWidthIn: number;
  trimHeightIn: number;
  trimWidthPx: number;
  trimHeightPx: number;

  // Bleed area (including 0.125" on all 4 edges)
  spreadWithBleedWidthIn: number;
  spreadWithBleedHeightIn: number;
  spreadWithBleedWidthPx: number;
  spreadWithBleedHeightPx: number;

  // Segment positions in trim space (x offsets)
  backTrimX: number;
  backTrimWidth: number;
  spineTrimX: number;
  spineTrimWidth: number;
  frontTrimX: number;
  frontTrimWidth: number;

  // Bleed offset in px
  bleedPx: number;
  safeMarginPx: number;
}

export const getSpreadDimensions = (spineWidthIn: number = DIMENSIONS.DEFAULT_SPINE): SpreadDimensions => {
  const journalWidthIn = DIMENSIONS.JOURNAL_WIDTH; // 4.0 in
  const journalHeightIn = DIMENSIONS.JOURNAL_HEIGHT; // 5.5 in
  const bleedIn = DIMENSIONS.BLEED; // 0.125 in

  // Flat spread trim width = 4 + spine + 4
  const trimWidthIn = journalWidthIn * 2 + spineWidthIn;
  const trimHeightIn = journalHeightIn;

  const trimWidthPx = Math.round(trimWidthIn * DPI);
  const trimHeightPx = Math.round(trimHeightIn * DPI);

  // Spread with bleed = trim + 2 * bleed
  const spreadWithBleedWidthIn = trimWidthIn + 2 * bleedIn;
  const spreadWithBleedHeightIn = trimHeightIn + 2 * bleedIn;

  const spreadWithBleedWidthPx = Math.round(spreadWithBleedWidthIn * DPI);
  const spreadWithBleedHeightPx = Math.round(spreadWithBleedHeightIn * DPI);

  const bleedPx = Math.round(bleedIn * DPI); // 38 px
  const safeMarginPx = Math.round(DIMENSIONS.SAFE_MARGIN * DPI); // 75 px

  const backTrimWidth = Math.round(journalWidthIn * DPI);
  const spineTrimWidth = Math.round(spineWidthIn * DPI);
  const frontTrimWidth = Math.round(journalWidthIn * DPI);

  const backTrimX = 0;
  const spineTrimX = backTrimWidth;
  const frontTrimX = backTrimWidth + spineTrimWidth;

  return {
    journalWidthIn,
    journalHeightIn,
    spineWidthIn,
    bleedIn,
    trimWidthIn,
    trimHeightIn,
    trimWidthPx,
    trimHeightPx,
    spreadWithBleedWidthIn,
    spreadWithBleedHeightIn,
    spreadWithBleedWidthPx,
    spreadWithBleedHeightPx,
    backTrimX,
    backTrimWidth,
    spineTrimX,
    spineTrimWidth,
    frontTrimX,
    frontTrimWidth,
    bleedPx,
    safeMarginPx,
  };
};

/**
 * Checks effective DPI for an image printed on a zone (e.g. 4.125 x 5.75 with bleed)
 * Returns { effectiveDpi, isLowRes, recommendedWidth, recommendedHeight }
 */
export const checkImageResolution = (
  imageWidth: number,
  imageHeight: number,
  targetWidthIn: number = 4.125,
  targetHeightIn: number = 5.75,
  requiredDpi: number = 300
) => {
  if (!imageWidth || !imageHeight) return { effectiveDpi: 0, isLowRes: false, recommendedWidth: 0, recommendedHeight: 0 };

  const dpiX = imageWidth / targetWidthIn;
  const dpiY = imageHeight / targetHeightIn;
  const effectiveDpi = Math.round(Math.min(dpiX, dpiY));

  const recommendedWidth = Math.round(targetWidthIn * requiredDpi);
  const recommendedHeight = Math.round(targetHeightIn * requiredDpi);

  return {
    effectiveDpi,
    isLowRes: effectiveDpi < 280, // give a slight tolerance, e.g. < 280 DPI triggers warning
    recommendedWidth,
    recommendedHeight,
  };
};
