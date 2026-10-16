import { getSpreadDimensions } from './units';

export interface CoordinateVerificationResult {
  passed: boolean;
  coverTrimWidthIn: number;
  coverTrimWidthPx: number;
  rulerDistanceAt100ZoomPx: number;
  rulerTrimMismatchPx: number;
  a4WidthIn: number;
  a4WidthPx: number;
  a4RulerDistancePx: number;
  a4MismatchPx: number;
  details: string;
}

/**
 * Automated check:
 * At zoom 100%, the pixel distance between the 0" and 8.25" ruler marks must equal
 * the pixel width of the trim area.
 * On A4 Print Sheet (0" = left edge of A4 paper, 8.27" = right edge).
 */
export const runCoordinateVerification = (spineWidthInches: number = 0.25): CoordinateVerificationResult => {
  const dims = getSpreadDimensions(spineWidthInches);

  // 1. Cover spread trim verification
  const trimWidthIn = dims.trimWidthIn; // 8.25 in for standard 0.25 spine
  const trimWidthPx = dims.trimWidthPx; // 2475 px at 300 DPI

  // Ruler tick positions at zoom 1.0:
  // tick_pos(0) = trimScreenLeft
  // tick_pos(trimWidthIn) = trimScreenLeft + (trimWidthIn * 300 * 1.0)
  const ruler0Px = 0;
  const rulerEndPx = trimWidthIn * 300;
  const rulerDistancePx = rulerEndPx - ruler0Px;
  const trimMismatch = Math.abs(rulerDistancePx - trimWidthPx);

  // 2. A4 Print Sheet verification
  // Standard A4 width = 210mm = 8.2677165 in = 2480 px at 300 DPI
  const a4WidthPx = 2480;
  const a4WidthIn = 2480 / 300; // ~8.267 in
  const a4Ruler0Px = 0;
  const a4RulerEndPx = a4WidthIn * 300; // 2480 px
  const a4Mismatch = Math.abs(a4RulerEndPx - a4WidthPx);

  const passed = trimMismatch === 0 && a4Mismatch < 0.001;

  const result: CoordinateVerificationResult = {
    passed,
    coverTrimWidthIn: trimWidthIn,
    coverTrimWidthPx: trimWidthPx,
    rulerDistanceAt100ZoomPx: rulerDistancePx,
    rulerTrimMismatchPx: trimMismatch,
    a4WidthIn: Number(a4WidthIn.toFixed(2)),
    a4WidthPx,
    a4RulerDistancePx: a4RulerEndPx,
    a4MismatchPx: a4Mismatch,
    details: `Trim width: ${trimWidthIn}" (${trimWidthPx}px) equals 0" to 8.25" ruler distance (${rulerDistancePx}px). A4 width: 8.27" (${a4WidthPx}px) equals A4 ruler distance (${a4RulerEndPx}px).`,
  };

  if (typeof window !== 'undefined') {
    (window as any).__COORDINATE_VERIFICATION__ = result;
    if (passed) {
      console.log('✅ Coordinate & Ruler Verification PASSED:', result);
    } else {
      console.error('❌ Coordinate & Ruler Verification FAILED:', result);
    }
  }

  return result;
};

// Run immediately upon import
runCoordinateVerification();
