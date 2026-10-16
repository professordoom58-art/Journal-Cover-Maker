import React from 'react';
import { ProjectState } from '../../types/project';
import { CoverArtboard } from '../designer/CoverArtboard';

interface A4PrintSheetViewProps {
  project: ProjectState;
  onUpdateA4Settings: (updater: (prev: ProjectState['a4Settings']) => ProjectState['a4Settings']) => void;
}

export const A4PrintSheetView: React.FC<A4PrintSheetViewProps> = ({
  project,
  onUpdateA4Settings,
}) => {
  const { a4Settings } = project;

  // Margin calculation: A4 is 8.2677 in wide, spread width is ~8.25 in
  const spreadWidthIn = 8.25;
  const horizontalMarginIn = Number(((8.2677 - spreadWidthIn * a4Settings.scale) / 2).toFixed(2));
  const isSafeMargin = horizontalMarginIn >= 0.25;

  const coverTop = project.coverA;
  const coverBottom = a4Settings.duplicateCoverA ? project.coverA : project.coverB;

  // In 96 DPI CSS pixels:
  // A4 portrait is 794 x 1123 px (8.27 x 11.69 in)
  const A4_CSS_W = 794;
  const A4_CSS_H = 1123;

  const scale = a4Settings.scale;
  const gapPx = Math.round(a4Settings.gapInches * 96);

  // Scaled dimensions of 816 x 552 artboard (including bleed)
  const spreadW = 816 * scale;
  const spreadH = 552 * scale;

  const totalHeight = spreadH * 2 + gapPx;
  const startY = Math.max(12, Math.round((A4_CSS_H - totalHeight) / 2));
  const posX = Math.max(0, Math.round((A4_CSS_W - spreadW) / 2));
  const posBottomY = startY + spreadH + gapPx;

  return (
    <div className="flex flex-col sm:flex-row h-full w-full bg-[#F6F5F2] overflow-hidden select-none">
      {/* 300px Left Configuration Panel */}
      <div className="no-print w-full sm:w-[300px] h-auto sm:h-full bg-white border-r border-stone-200 p-4 overflow-y-auto space-y-6 text-xs text-stone-700 shrink-0">
        <div>
          <h2 className="font-semibold text-sm text-stone-900">A4 Print Sheet</h2>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Two covers placed on standard A4 (210 × 297 mm)
          </p>
        </div>

        {/* Print Scale */}
        <div className="space-y-1.5">
          <span className="font-medium text-stone-700">Print Scale:</span>
          <div className="grid grid-cols-4 gap-1">
            {([1.0, 0.95, 0.9, 0.85] as const).map((sc) => (
              <button
                key={sc}
                onClick={() => onUpdateA4Settings((prev) => ({ ...prev, scale: sc }))}
                className={`py-1.5 text-xs rounded-md border font-medium transition ${
                  a4Settings.scale === sc
                    ? 'bg-terracotta-50 border-terracotta-500 text-terracotta-700 font-semibold'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {Math.round(sc * 100)}%
              </button>
            ))}
          </div>
        </div>

        {/* Small Margin Note (Green / Amber) */}
        <div
          className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
            isSafeMargin
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <span>
            Margin: <strong>{horizontalMarginIn} in</strong> —{' '}
            {isSafeMargin ? 'Safe for all home printers' : 'Warning: margin < 0.25 in'}
          </span>
        </div>

        {/* Gap between covers */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-stone-600">
            <span>Gap between covers:</span>
            <span className="font-mono">{a4Settings.gapInches.toFixed(2)} in</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={a4Settings.gapInches}
            onChange={(e) =>
              onUpdateA4Settings((prev) => ({
                ...prev,
                gapInches: parseFloat(e.target.value),
              }))
            }
            className="w-full h-1.5 bg-stone-200 rounded appearance-none cursor-pointer accent-terracotta-500"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-2 pt-2 border-t border-stone-200">
          <label className="flex items-center justify-between p-2 rounded-lg border border-stone-200 bg-stone-50 cursor-pointer">
            <span className="text-xs text-stone-800">Crop marks</span>
            <input
              type="checkbox"
              checked={a4Settings.showCropMarks}
              onChange={(e) =>
                onUpdateA4Settings((prev) => ({
                  ...prev,
                  showCropMarks: e.target.checked,
                }))
              }
              className="w-4 h-4 text-terracotta-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg border border-stone-200 bg-stone-50 cursor-pointer">
            <span className="text-xs text-stone-800">Same design on both</span>
            <input
              type="checkbox"
              checked={a4Settings.duplicateCoverA}
              onChange={(e) =>
                onUpdateA4Settings((prev) => ({
                  ...prev,
                  duplicateCoverA: e.target.checked,
                }))
              }
              className="w-4 h-4 text-terracotta-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* A4 Sheet Center Preview (Placing spreads using the same CoverArtboard component) */}
      <div className="flex-1 h-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-auto">
        {/* Responsive Container that scales A4 sheet */}
        <div
          className="relative transition-all"
          style={{
            width: 'clamp(280px, 45vh, 440px)',
            aspectRatio: '794 / 1123',
          }}
        >
          {/* Scaled A4 Sheet Body */}
          <div
            className="absolute top-0 left-0 bg-white"
            style={{
              width: `${A4_CSS_W}px`,
              height: `${A4_CSS_H}px`,
              transform: `scale(${440 / A4_CSS_W})`, // default scale inside responsive box
              transformOrigin: 'top left',
              boxShadow: '0 20px 50px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
            }}
          >
            {/* Top Cover Spread */}
            <div
              className="absolute"
              style={{
                left: `${posX}px`,
                top: `${startY}px`,
                width: `${spreadW}px`,
                height: `${spreadH}px`,
              }}
            >
              <CoverArtboard
                cover={coverTop}
                scale={scale}
                isInteractive={false}
                showGuides={false}
              />
              {/* Optional Crop Marks */}
              {a4Settings.showCropMarks && (
                <div className="absolute inset-0 pointer-events-none border border-black/30" />
              )}
            </div>

            {/* Bottom Cover Spread */}
            <div
              className="absolute"
              style={{
                left: `${posX}px`,
                top: `${posBottomY}px`,
                width: `${spreadW}px`,
                height: `${spreadH}px`,
              }}
            >
              <CoverArtboard
                cover={coverBottom}
                scale={scale}
                isInteractive={false}
                showGuides={false}
              />
              {/* Optional Crop Marks */}
              {a4Settings.showCropMarks && (
                <div className="absolute inset-0 pointer-events-none border border-black/30" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
