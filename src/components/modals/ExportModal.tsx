import React, { useState, useEffect, useRef } from 'react';
import { ProjectState, CoverState } from '../../types/project';
import {
  exportA4Pdf,
  renderA4PrintSheetCanvas,
  renderCoverSpreadCanvas,
  downloadCanvas,
} from '../../utils/exportCanvas';
import { X, Download, Loader2, Check, AlertTriangle, Maximize2, Minimize2 } from 'lucide-react';

export type ExportFormat = 'pdf' | 'png' | 'spread';

interface ExportModalProps {
  project: ProjectState;
  activeCover: CoverState;
  initialFormat?: 'pdf' | 'png' | 'spread';
  onClose: () => void;
  isSimulatedMobile?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  activeCover,
  initialFormat = 'pdf',
  onClose,
  isSimulatedMobile,
}) => {
  const [format, setFormat] = useState<ExportFormat>(initialFormat);
  const [zoomMode, setZoomMode] = useState<'fit' | '100%'>('fit');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRenderingPreview, setIsRenderingPreview] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  const cachedCanvases = useRef<{ a4?: HTMLCanvasElement; spread?: HTMLCanvasElement }>({});

  // Horizontal margin calculation on A4
  const spreadWidthIn = 8.25;
  const a4MarginIn = Number(((8.2677 - spreadWidthIn * project.a4Settings.scale) / 2).toFixed(2));
  const isSafeMargin = a4MarginIn >= 0.25;

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Render preview canvas whenever format or project settings change
  useEffect(() => {
    let isCancelled = false;

    const generatePreview = async () => {
      setIsRenderingPreview(true);

      try {
        // Wait for all fonts to be fully rendered
        if (document.fonts) {
          await document.fonts.ready;
        }

        let canvas: HTMLCanvasElement;
        if (format === 'spread') {
          canvas = await renderCoverSpreadCanvas(activeCover, false, true);
          cachedCanvases.current.spread = canvas;
        } else {
          canvas = await renderA4PrintSheetCanvas(project);
          cachedCanvases.current.a4 = canvas;
        }

        if (!isCancelled) {
          const url = canvas.toDataURL('image/png');
          setPreviewUrl(url);
          setIsRenderingPreview(false);
        }
      } catch (err) {
        console.error('Failed to generate export preview:', err);
        if (!isCancelled) {
          setIsRenderingPreview(false);
        }
      }
    };

    generatePreview();

    return () => {
      isCancelled = true;
    };
  }, [format, project, activeCover]);

  // Download Action
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const baseName = project.name.toLowerCase().replace(/\s+/g, '-');

      if (format === 'pdf') {
        await exportA4Pdf(project, `${baseName}-A4.pdf`);
      } else if (format === 'png') {
        let canvas = cachedCanvases.current.a4;
        if (!canvas) {
          canvas = await renderA4PrintSheetCanvas(project);
        }
        downloadCanvas(canvas, `${baseName}-A4-300dpi.png`, 'png');
      } else if (format === 'spread') {
        let canvas = cachedCanvases.current.spread;
        if (!canvas) {
          canvas = await renderCoverSpreadCanvas(activeCover, false, true);
        }
        const coverName = activeCover.title.toLowerCase().replace(/\s+/g, '-');
        downloadCanvas(canvas, `${coverName}-spread-300dpi.png`, 'png');
      }

      // Show toast "Downloaded"
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Export download failed:', err);
      alert('Could not generate export file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Primary button label based on format
  const primaryButtonLabel =
    format === 'pdf'
      ? 'Download PDF'
      : format === 'png'
      ? 'Download PNG'
      : 'Download Spread PNG';

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      className={`${isSimulatedMobile ? 'absolute' : 'fixed'} inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150 select-none`}
    >
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>Downloaded!</span>
        </div>
      )}

      {/* Modal Container: Max width 900px, 16px margins on mobile */}
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-[900px] max-h-[94vh] flex flex-col overflow-hidden text-stone-800 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className={`px-4 py-3 sm:px-6 sm:py-3.5 border-b border-stone-200 flex ${isSimulatedMobile ? 'flex-col gap-2.5' : 'flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5'} bg-stone-50/70 shrink-0`}>
          <div className="flex items-center justify-between w-full">
            <h2 className="font-semibold text-stone-900 text-sm sm:text-base tracking-tight">
              Preview your print sheet
            </h2>
            <button
              onClick={onClose}
              className={`${isSimulatedMobile ? 'flex' : 'sm:hidden'} p-1.5 hover:bg-stone-200/80 rounded-lg text-stone-500 hover:text-stone-800 transition items-center justify-center`}
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className={`flex items-center ${isSimulatedMobile ? 'w-full' : 'w-full sm:w-auto'} justify-between sm:justify-end gap-2 sm:gap-3`}>
            {/* Format Selector Pills */}
            <div className={`flex bg-stone-200/70 p-0.5 rounded-lg text-xs font-medium ${isSimulatedMobile ? 'w-full' : 'w-full sm:w-auto'} justify-center`}>
              <button
                onClick={() => setFormat('pdf')}
                className={`flex-1 sm:flex-none px-3 py-1 rounded-md transition text-center ${
                  format === 'pdf'
                    ? 'bg-white text-stone-900 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                A4 PDF
              </button>
              <button
                onClick={() => setFormat('png')}
                className={`flex-1 sm:flex-none px-3 py-1 rounded-md transition text-center ${
                  format === 'png'
                    ? 'bg-white text-stone-900 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                A4 PNG
              </button>
              <button
                onClick={() => setFormat('spread')}
                className={`flex-1 sm:flex-none px-3 py-1 rounded-md transition text-center ${
                  format === 'spread'
                    ? 'bg-white text-stone-900 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Spread PNG
              </button>
            </div>

            {/* Desktop Close Button */}
            {!isSimulatedMobile && (
              <button
                onClick={onClose}
                className="hidden sm:block p-1.5 hover:bg-stone-200/80 rounded-lg text-stone-500 hover:text-stone-800 transition shrink-0"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Preview Viewport Toolbar (Zoom Control) */}
        <div className="px-4 py-2 border-b border-stone-200 bg-white flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-stone-500">Zoom:</span>
            <div className="inline-flex rounded-md bg-stone-100 p-0.5 border border-stone-200">
              <button
                onClick={() => setZoomMode('fit')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
                  zoomMode === 'fit'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Minimize2 className="w-3 h-3 inline mr-1" />
                Fit
              </button>
              <button
                onClick={() => setZoomMode('100%')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
                  zoomMode === '100%'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Maximize2 className="w-3 h-3 inline mr-1" />
                100%
              </button>
            </div>
          </div>

          <span className="text-[11px] text-stone-400">
            {zoomMode === '100%' ? 'Scroll to pan around full-resolution sheet' : 'Fitted to window'}
          </span>
        </div>

        {/* Preview Canvas Area */}
        <div className="flex-1 bg-[#ECEAE5] overflow-auto p-4 sm:p-6 flex items-center justify-center min-h-[300px] relative">
          {isRenderingPreview && (
            <div className="absolute inset-0 bg-[#ECEAE5]/70 backdrop-blur-xs flex flex-col items-center justify-center z-10 gap-2">
              <Loader2 className="w-7 h-7 text-terracotta-600 animate-spin" />
              <span className="text-xs font-medium text-stone-600">Rendering print-ready sheet...</span>
            </div>
          )}

          {previewUrl && (
            <div
              className={`transition-all duration-150 ${
                zoomMode === 'fit'
                  ? 'flex items-center justify-center w-full h-full'
                  : 'w-max h-max mx-auto my-auto p-4'
              }`}
            >
              {/* The Paper Sheet with realistic white page edge and soft shadow */}
              <img
                src={previewUrl}
                alt="Print Sheet Preview"
                className={`bg-white shadow-2xl rounded-[2px] border border-stone-300/60 block select-none ${
                  zoomMode === 'fit'
                    ? 'max-h-[50vh] sm:max-h-[55vh] max-w-full w-auto object-contain'
                    : 'w-[1240px] max-w-none'
                }`}
                style={{
                  boxShadow:
                    '0 20px 40px -15px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)',
                }}
              />
            </div>
          )}
        </div>

        {/* Footer Area: Specs & Actions */}
        <div className={`px-4 py-3 sm:px-6 sm:py-3.5 border-t border-stone-200 bg-white flex flex-col ${isSimulatedMobile ? 'gap-2.5' : 'sm:flex-row sm:items-center sm:justify-between gap-3'} shrink-0`}>
          {/* Summary Line */}
          <div className={`flex flex-col gap-1 w-full ${isSimulatedMobile ? 'text-center' : 'sm:w-auto sm:text-left'}`}>
            <div className={`text-[11px] sm:text-xs text-stone-600 flex flex-wrap items-center ${isSimulatedMobile ? 'justify-center' : 'justify-center sm:justify-start'} gap-x-2 gap-y-0.5`}>
              <span>
                Format: <strong className="text-stone-800 uppercase">{format}</strong>
              </span>
              <span>•</span>
              {format === 'spread' ? (
                <>
                  <span>Spread (8.25 × 5.5 in)</span>
                  <span>•</span>
                  <span>2475 × 1650 px (300 DPI)</span>
                </>
              ) : (
                <>
                  <span>A4 (210 × 297 mm)</span>
                  <span>•</span>
                  <span>2480 × 3508 px (300 DPI)</span>
                  <span>•</span>
                  <span>Print scale {Math.round(project.a4Settings.scale * 100)}%</span>
                </>
              )}
            </div>

            {/* Amber Margin Warning if margin < 0.25 in on A4 */}
            {format !== 'spread' && !isSafeMargin && (
              <div className={`text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1 font-medium ${isSimulatedMobile ? 'mx-auto' : 'mx-auto sm:mx-0'} w-fit`}>
                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Horizontal margin is {a4MarginIn} in (under 0.25 in safe limit)</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center gap-2.5 w-full ${isSimulatedMobile ? '' : 'sm:w-auto sm:justify-end'}`}>
            <button
              onClick={onClose}
              disabled={isDownloading}
              className={`flex-1 ${isSimulatedMobile ? '' : 'sm:flex-none'} min-h-[44px] py-2 px-4 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition active:scale-95 disabled:opacity-50`}
            >
              Cancel
            </button>

            <button
              onClick={handleDownload}
              disabled={isRenderingPreview || isDownloading}
              className={`flex-1 ${isSimulatedMobile ? '' : 'sm:flex-none'} min-h-[44px] py-2 px-5 rounded-lg bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50`}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing file...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{primaryButtonLabel}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
