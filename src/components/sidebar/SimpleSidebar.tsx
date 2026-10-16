import React, { useRef, useState } from 'react';
import { CoverState, PhotoZoneState, GuidesSettings, A4SheetSettings, ProjectState } from '../../types/project';
import { GOOGLE_FONTS } from '../../constants/fonts';
import { exportA4Pdf, renderA4PrintSheetCanvas, downloadCanvas } from '../../utils/exportCanvas';
import { getContrastRatio, sampleImageEdgeColor } from '../../utils/colorUtils';
import {
  Image as ImageIcon,
  Type,
  BookOpen,
  Printer,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Printer as PrintIcon,
  Download,
  Check,
} from 'lucide-react';

const SPINE_PRESET_COLORS = [
  '#2B2B33',
  '#1F3A5F',
  '#7A2E2E',
  '#3F5B45',
  '#6B4F3F',
  '#F2EFE8',
];

export type SidebarTab = 'photos' | 'text' | 'back-cover' | 'print';

interface SimpleSidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  activePhotoZone: 'front' | 'back';
  onPhotoZoneChange: (zone: 'front' | 'back') => void;
  cover: CoverState;
  onUpdateCover: (updater: (prev: CoverState) => CoverState) => void;
  guides: GuidesSettings;
  onUpdateGuides: (updater: (prev: GuidesSettings) => GuidesSettings) => void;
  a4Settings: A4SheetSettings;
  onUpdateA4Settings: (updater: (prev: A4SheetSettings) => A4SheetSettings) => void;
  onImageUpload: (zone: 'front' | 'back', file: File) => void;
  project?: ProjectState;
  onOpenPreviewModal?: (format: 'pdf' | 'png') => void;
}

export const SimpleSidebar: React.FC<SimpleSidebarProps> = ({
  activeTab,
  onTabChange,
  activePhotoZone,
  onPhotoZoneChange,
  cover,
  onUpdateCover,
  guides,
  onUpdateGuides,
  a4Settings,
  onUpdateA4Settings,
  onImageUpload,
  project,
  onOpenPreviewModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePhoto: PhotoZoneState =
    activePhotoZone === 'front' ? cover.frontPhoto : cover.backPhoto;

  const updateActivePhoto = (updater: (prev: PhotoZoneState) => PhotoZoneState) => {
    onUpdateCover((prev) => {
      const key = activePhotoZone === 'front' ? 'frontPhoto' : 'backPhoto';
      return {
        ...prev,
        [key]: updater(prev[key]),
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(activePhotoZone, file);
    }
  };

  const handleResetPhoto = () => {
    updateActivePhoto((prev) => ({
      ...prev,
      fitMode: 'fit',
      zoom: 1.0,
      panX: 0,
      panY: 0,
      rotation: 0,
      flipH: false,
      flipV: false,
    }));
  };

  // Horizontal margin calculation on A4
  const spreadWidthIn = 8.25;
  const a4MarginIn = Number(((8.2677 - spreadWidthIn * a4Settings.scale) / 2).toFixed(2));
  const isSafeMargin = a4MarginIn >= 0.25;

  // Print handler: window.print()
  const handlePrint = () => {
    window.print();
  };

  return (
    <aside className="w-full sm:w-[300px] h-full bg-white border-r border-stone-200 flex flex-col select-none text-stone-800 shrink-0">
      {/* Hidden File Input for Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 4 Simple Tabs at the Top */}
      <div className="grid grid-cols-4 border-b border-stone-200 bg-stone-50/70 p-1 text-xs font-medium">
        <button
          onClick={() => onTabChange('photos')}
          className={`py-2 px-1 rounded-md flex flex-col items-center gap-1 transition ${
            activeTab === 'photos'
              ? 'bg-white text-terracotta-600 font-semibold shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span className="text-[11px]">Photos</span>
        </button>

        <button
          onClick={() => onTabChange('text')}
          className={`py-2 px-1 rounded-md flex flex-col items-center gap-1 transition ${
            activeTab === 'text'
              ? 'bg-white text-terracotta-600 font-semibold shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Type className="w-4 h-4" />
          <span className="text-[11px]">Text</span>
        </button>

        <button
          onClick={() => onTabChange('back-cover')}
          className={`py-2 px-1 rounded-md flex flex-col items-center gap-1 transition ${
            activeTab === 'back-cover'
              ? 'bg-white text-terracotta-600 font-semibold shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[11px]">Back</span>
        </button>

        <button
          onClick={() => onTabChange('print')}
          className={`py-2 px-1 rounded-md flex flex-col items-center gap-1 transition ${
            activeTab === 'print'
              ? 'bg-white text-terracotta-600 font-semibold shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span className="text-[11px]">Print</span>
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
        {/* ================= TAB 1: PHOTOS ================= */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            {/* Front / Back Photo Switcher */}
            <div className="grid grid-cols-2 gap-1 bg-stone-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => onPhotoZoneChange('front')}
                className={`py-1.5 rounded-md transition ${
                  activePhotoZone === 'front'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Front Cover
              </button>
              <button
                onClick={() => onPhotoZoneChange('back')}
                className={`py-1.5 rounded-md transition ${
                  activePhotoZone === 'back'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Back Cover
              </button>
            </div>

            {/* Photo Sizing: Fit / Fill Switch */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                Photo Sizing
              </label>
              <div className="grid grid-cols-2 gap-1 bg-stone-100 p-1 rounded-lg text-xs font-medium">
                <button
                  onClick={() => {
                    if (activePhoto.fitMode !== 'fit') {
                      updateActivePhoto((prev) => ({
                        ...prev,
                        fitMode: 'fit',
                        zoom: 1.0,
                        panX: 0,
                        panY: 0,
                      }));
                    }
                  }}
                  className={`py-1.5 rounded-md transition ${
                    activePhoto.fitMode !== 'fill'
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Fit
                </button>
                <button
                  onClick={() => {
                    if (activePhoto.fitMode !== 'fill') {
                      updateActivePhoto((prev) => ({
                        ...prev,
                        fitMode: 'fill',
                        zoom: 1.0,
                        panX: 0,
                        panY: 0,
                      }));
                    }
                  }}
                  className={`py-1.5 rounded-md transition ${
                    activePhoto.fitMode === 'fill'
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Fill
                </button>
              </div>
              {activePhoto.fitMode === 'fill' && (
                <p className="text-[11px] text-stone-500 pt-0.5">
                  Fill may crop the edges of your photo.
                </p>
              )}
            </div>

            {/* Photo Upload & Transforms ONLY (No Adjustments) */}
            <div className="space-y-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[44px] py-2 px-3 border border-dashed border-stone-300 hover:border-terracotta-500 rounded-lg text-xs font-medium text-stone-700 bg-stone-50/50 hover:bg-white transition flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-4 h-4 text-stone-500" />
                <span>{activePhoto.imageSrc ? 'Replace Photo' : 'Upload Photo'}</span>
              </button>

              {/* Quick Sample Photos for Testing All Ratios */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-stone-500 block">Sample photos:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() =>
                      updateActivePhoto((prev) => ({
                        ...prev,
                        imageSrc: '/test-images/landscape.svg',
                        originalWidth: 600,
                        originalHeight: 300,
                        fitMode: prev.fitMode || 'fit',
                        zoom: 1.0,
                        panX: 0,
                        panY: 0,
                      }))
                    }
                    className="py-1 px-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] text-center transition"
                  >
                    Landscape (2:1)
                  </button>
                  <button
                    onClick={() =>
                      updateActivePhoto((prev) => ({
                        ...prev,
                        imageSrc: '/test-images/portrait.svg',
                        originalWidth: 300,
                        originalHeight: 600,
                        fitMode: prev.fitMode || 'fit',
                        zoom: 1.0,
                        panX: 0,
                        panY: 0,
                      }))
                    }
                    className="py-1 px-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] text-center transition"
                  >
                    Portrait (1:2)
                  </button>
                  <button
                    onClick={() =>
                      updateActivePhoto((prev) => ({
                        ...prev,
                        imageSrc: '/test-images/square.svg',
                        originalWidth: 400,
                        originalHeight: 400,
                        fitMode: prev.fitMode || 'fit',
                        zoom: 1.0,
                        panX: 0,
                        panY: 0,
                      }))
                    }
                    className="py-1 px-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] text-center transition"
                  >
                    Square (1:1)
                  </button>
                  <button
                    onClick={() =>
                      updateActivePhoto((prev) => ({
                        ...prev,
                        imageSrc: '/test-images/exact.svg',
                        originalWidth: 384,
                        originalHeight: 528,
                        fitMode: prev.fitMode || 'fit',
                        zoom: 1.0,
                        panX: 0,
                        panY: 0,
                      }))
                    }
                    className="py-1 px-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] text-center transition"
                  >
                    Exact (4:5.5)
                  </button>
                </div>
              </div>

              {activePhoto.imageSrc && (
                <div className="space-y-4 pt-1">
                  <p className="text-[11px] text-stone-400 text-center">
                    Drag photo on canvas to reposition
                  </p>

                  {/* Zoom slider: 50% to 300%, 100% = Fit size */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-stone-600">
                      <span>Zoom:</span>
                      <span className="font-mono">{Math.round(activePhoto.zoom * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.05"
                      value={activePhoto.zoom}
                      onChange={(e) =>
                        updateActivePhoto((prev) => ({
                          ...prev,
                          zoom: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full h-1.5 bg-stone-200 rounded appearance-none cursor-pointer accent-terracotta-500"
                    />
                  </div>

                  {/* Warning hint when zoomed beyond panel or panned */}
                  {(activePhoto.zoom > 1.0 || activePhoto.panX !== 0 || activePhoto.panY !== 0) && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-1.5 leading-tight">
                      Parts of the photo are outside the cover
                    </p>
                  )}

                  {/* Rotate 90 & Flip buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateActivePhoto((prev) => ({
                          ...prev,
                          rotation: (prev.rotation + 90) % 360,
                        }))
                      }
                      className="flex-1 min-h-[38px] py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Rotate 90°</span>
                    </button>

                    <button
                      onClick={() =>
                        updateActivePhoto((prev) => ({ ...prev, flipH: !prev.flipH }))
                      }
                      className={`min-h-[38px] px-3 rounded-md border text-xs transition ${
                        activePhoto.flipH
                          ? 'bg-terracotta-50 border-terracotta-400 text-terracotta-700 font-semibold'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                      title="Flip Horizontal"
                    >
                      <FlipHorizontal className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        updateActivePhoto((prev) => ({ ...prev, flipV: !prev.flipV }))
                      }
                      className={`min-h-[38px] px-3 rounded-md border text-xs transition ${
                        activePhoto.flipV
                          ? 'bg-terracotta-50 border-terracotta-400 text-terracotta-700 font-semibold'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                      title="Flip Vertical"
                    >
                      <FlipVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Reset photo link */}
                  <div className="text-right pt-1">
                    <button
                      onClick={handleResetPhoto}
                      className="text-xs text-stone-500 hover:text-stone-900 underline"
                    >
                      Reset photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Background Behind the Photo */}
            <div className="space-y-3 pt-3 border-t border-stone-200">
              <span className="block text-[12px] font-semibold text-stone-700">
                Panel Background
              </span>

              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-600">Background color:</span>
                {activePhoto.imageSrc && (
                  <button
                    onClick={async () => {
                      if (!activePhoto.imageSrc) return;
                      const color = await sampleImageEdgeColor(activePhoto.imageSrc, 'all');
                      updateActivePhoto((prev) => ({ ...prev, backgroundColor: color }));
                    }}
                    className="text-[11px] text-terracotta-600 hover:text-terracotta-700 underline font-medium cursor-pointer"
                  >
                    Match photo edge color
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={activePhoto.backgroundColor || '#ffffff'}
                  onChange={(e) =>
                    updateActivePhoto((prev) => ({
                      ...prev,
                      backgroundColor: e.target.value,
                    }))
                  }
                  className="w-7 h-7 rounded border border-stone-200 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={activePhoto.backgroundColor || '#ffffff'}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (!val.startsWith('#') && val.length > 0) val = '#' + val;
                    updateActivePhoto((prev) => ({
                      ...prev,
                      backgroundColor: val,
                    }));
                  }}
                  maxLength={7}
                  className="w-20 px-2 py-1 text-xs font-mono uppercase border border-stone-200 rounded bg-white text-stone-700"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activePhoto.extendBleed !== false}
                  onChange={(e) =>
                    updateActivePhoto((prev) => ({
                      ...prev,
                      extendBleed: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-terracotta-600 rounded"
                />
                <span className="text-xs text-stone-700">Extend background into bleed</span>
              </label>
            </div>
          </div>
        )}

        {/* ================= TAB 2: TEXT ================= */}
        {activeTab === 'text' && (
          <div className="space-y-6">
            {/* 1. Front Title */}
            <div className="space-y-3">
              <span className="block text-[12px] font-semibold text-stone-400 uppercase tracking-wider">
                Front Title
              </span>

              <input
                type="text"
                value={cover.frontTitle.text}
                onChange={(e) =>
                  onUpdateCover((prev) => ({
                    ...prev,
                    frontTitle: { ...prev.frontTitle, text: e.target.value },
                  }))
                }
                placeholder="Front Cover Title"
                className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white focus:outline-hidden focus:border-terracotta-500"
              />

              {/* Font Dropdown (Showing each option in its own typeface) */}
              <select
                value={cover.frontTitle.fontFamily}
                onChange={(e) =>
                  onUpdateCover((prev) => ({
                    ...prev,
                    frontTitle: { ...prev.frontTitle, fontFamily: e.target.value },
                  }))
                }
                className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white"
              >
                {GOOGLE_FONTS.map((f) => (
                  <option key={f.name} value={f.name} style={{ fontFamily: f.family }}>
                    {f.name}
                  </option>
                ))}
              </select>

              {/* Size Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-stone-600">
                  <span>Size:</span>
                  <span className="font-mono">{cover.frontTitle.fontSize} pt</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="64"
                  value={cover.frontTitle.fontSize}
                  onChange={(e) =>
                    onUpdateCover((prev) => ({
                      ...prev,
                      frontTitle: { ...prev.frontTitle, fontSize: parseInt(e.target.value) },
                    }))
                  }
                  className="w-full h-1.5 bg-stone-200 rounded appearance-none cursor-pointer accent-terracotta-500"
                />
              </div>

              {/* Color Swatch */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-600">Color:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={cover.frontTitle.textColor}
                    onChange={(e) =>
                      onUpdateCover((prev) => ({
                        ...prev,
                        frontTitle: { ...prev.frontTitle, textColor: e.target.value },
                      }))
                    }
                    className="w-7 h-7 rounded border border-stone-200 cursor-pointer p-0 bg-transparent"
                  />
                  <span className="font-mono text-xs text-stone-500 uppercase">
                    {cover.frontTitle.textColor}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Spine Text */}
            <div className="space-y-3 pt-3 border-t border-stone-200">
              <span className="block text-[12px] font-semibold text-stone-400 uppercase tracking-wider">
                Spine Text
              </span>

              <input
                type="text"
                maxLength={24}
                value={cover.spine.text}
                onChange={(e) =>
                  onUpdateCover((prev) => ({
                    ...prev,
                    spine: { ...prev.spine, text: e.target.value.slice(0, 24) },
                  }))
                }
                placeholder="Spine text (max 24 chars)"
                className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white focus:outline-hidden focus:border-terracotta-500"
              />

              <select
                value={cover.spine.fontFamily}
                onChange={(e) =>
                  onUpdateCover((prev) => ({
                    ...prev,
                    spine: { ...prev.spine, fontFamily: e.target.value },
                  }))
                }
                className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white"
              >
                {GOOGLE_FONTS.map((f) => (
                  <option key={f.name} value={f.name} style={{ fontFamily: f.family }}>
                    {f.name}
                  </option>
                ))}
              </select>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-stone-600">
                  <span>Size:</span>
                  <span className="font-mono">{cover.spine.fontSize} pt</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="16"
                  value={cover.spine.fontSize}
                  onChange={(e) =>
                    onUpdateCover((prev) => ({
                      ...prev,
                      spine: { ...prev.spine, fontSize: parseInt(e.target.value) },
                    }))
                  }
                  className="w-full h-1.5 bg-stone-200 rounded appearance-none cursor-pointer accent-terracotta-500"
                />
              </div>

              {/* Spine Colors: Strip and Text */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700">Colors</span>
                  {(cover.backPhoto.imageSrc || cover.frontPhoto.imageSrc) && (
                    <button
                      onClick={async () => {
                        const targetSrc = cover.backPhoto.imageSrc || cover.frontPhoto.imageSrc;
                        if (!targetSrc) return;
                        const targetMode = cover.backPhoto.imageSrc ? 'right' : 'left';
                        const color = await sampleImageEdgeColor(targetSrc, targetMode);
                        onUpdateCover((prev) => ({
                          ...prev,
                          spine: { ...prev.spine, backgroundColor: color },
                        }));
                      }}
                      className="text-[11px] text-terracotta-600 hover:text-terracotta-700 underline font-medium cursor-pointer"
                    >
                      Match photo edge
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Spine Color (the strip) */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-stone-600 block">Spine color</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={cover.spine.backgroundColor || '#2B2B33'}
                        onChange={(e) =>
                          onUpdateCover((prev) => ({
                            ...prev,
                            spine: { ...prev.spine, backgroundColor: e.target.value },
                          }))
                        }
                        className="w-7 h-7 rounded border border-stone-200 cursor-pointer p-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={cover.spine.backgroundColor || '#2B2B33'}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (!val.startsWith('#') && val.length > 0) val = '#' + val;
                          onUpdateCover((prev) => ({
                            ...prev,
                            spine: { ...prev.spine, backgroundColor: val },
                          }));
                        }}
                        maxLength={7}
                        className="w-full min-w-0 px-1.5 py-1 text-xs font-mono uppercase border border-stone-200 rounded bg-white text-stone-700"
                      />
                    </div>
                  </div>

                  {/* Text Color (the lettering) */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-stone-600 block">Text color</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={cover.spine.textColor || '#ffffff'}
                        onChange={(e) =>
                          onUpdateCover((prev) => ({
                            ...prev,
                            spine: { ...prev.spine, textColor: e.target.value },
                          }))
                        }
                        className="w-7 h-7 rounded border border-stone-200 cursor-pointer p-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        value={cover.spine.textColor || '#ffffff'}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (!val.startsWith('#') && val.length > 0) val = '#' + val;
                          onUpdateCover((prev) => ({
                            ...prev,
                            spine: { ...prev.spine, textColor: val },
                          }));
                        }}
                        maxLength={7}
                        className="w-full min-w-0 px-1.5 py-1 text-xs font-mono uppercase border border-stone-200 rounded bg-white text-stone-700"
                      />
                    </div>
                  </div>
                </div>

                {/* 6 Quick Presets for Spine Color */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-stone-400 block uppercase font-medium">Quick Presets</span>
                  <div className="flex items-center gap-1.5">
                    {SPINE_PRESET_COLORS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() =>
                          onUpdateCover((prev) => ({
                            ...prev,
                            spine: { ...prev.spine, backgroundColor: preset },
                          }))
                        }
                        style={{ backgroundColor: preset }}
                        className={`w-6 h-6 rounded-md border transition-all ${
                          (cover.spine.backgroundColor || '#2B2B33').toLowerCase() === preset.toLowerCase()
                            ? 'ring-2 ring-terracotta-500 ring-offset-1 scale-105 border-stone-400'
                            : 'border-stone-300 hover:scale-105'
                        }`}
                        title={preset}
                      />
                    ))}
                  </div>
                </div>

                {/* Readability Helper */}
                {getContrastRatio(cover.spine.backgroundColor || '#2B2B33', cover.spine.textColor || '#ffffff') < 3.0 && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-1.5 leading-tight">
                    Text may be hard to read on this spine color.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BACK COVER ================= */}
        {activeTab === 'back-cover' && (
          <div className="space-y-6">
            {/* TWO TOGGLES AT THE TOP */}
            <div className="space-y-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
              {/* Toggle 1: Show info box (the whole panel) */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-stone-800">Show info box</span>
                <input
                  type="checkbox"
                  checked={cover.infoBlock.visible}
                  onChange={(e) =>
                    onUpdateCover((prev) => ({
                      ...prev,
                      infoBlock: { ...prev.infoBlock, visible: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 text-terracotta-600 rounded"
                />
              </label>

              {/* Toggle 2: Show description */}
              {cover.infoBlock.visible && (
                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-stone-200/80">
                  <span className="text-xs text-stone-700">Show description</span>
                  <input
                    type="checkbox"
                    checked={cover.infoBlock.showDescription !== false}
                    onChange={(e) =>
                      onUpdateCover((prev) => ({
                        ...prev,
                        infoBlock: { ...prev.infoBlock, showDescription: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 text-terracotta-600 rounded"
                  />
                </label>
              )}
            </div>

            {cover.infoBlock.visible && (
              <>
                {/* Back Info Panel Styling */}
                <div className="space-y-3">
                  <span className="block text-[12px] font-semibold text-stone-400 uppercase tracking-wider">
                    Panel Style
                  </span>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-600">Background:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={cover.infoBlock.backgroundColor}
                        onChange={(e) =>
                          onUpdateCover((prev) => ({
                            ...prev,
                            infoBlock: { ...prev.infoBlock, backgroundColor: e.target.value },
                          }))
                        }
                        className="w-7 h-7 rounded border border-stone-200 cursor-pointer p-0 bg-transparent"
                      />
                      <span className="font-mono text-xs text-stone-500 uppercase">
                        {cover.infoBlock.backgroundColor}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-stone-600">
                      <span>Opacity:</span>
                      <span className="font-mono">
                        {Math.round(cover.infoBlock.opacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={cover.infoBlock.opacity}
                      onChange={(e) =>
                        onUpdateCover((prev) => ({
                          ...prev,
                          infoBlock: { ...prev.infoBlock, opacity: parseFloat(e.target.value) },
                        }))
                      }
                      className="w-full h-1.5 bg-stone-200 rounded appearance-none cursor-pointer accent-terracotta-500"
                    />
                  </div>
                </div>

                {/* Description (Visible only when showDescription is true) */}
                {cover.infoBlock.showDescription !== false && (
                  <div className="space-y-3 pt-3 border-t border-stone-200">
                    <span className="block text-[12px] font-semibold text-stone-400 uppercase tracking-wider">
                      Description Text
                    </span>

                    <textarea
                      rows={3}
                      value={cover.infoBlock.description.text}
                      onChange={(e) =>
                        onUpdateCover((prev) => ({
                          ...prev,
                          infoBlock: {
                            ...prev.infoBlock,
                            description: { ...prev.infoBlock.description, text: e.target.value },
                          },
                        }))
                      }
                      placeholder="Short description or quote..."
                      className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white focus:outline-hidden focus:border-terracotta-500"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={cover.infoBlock.description.fontFamily}
                        onChange={(e) =>
                          onUpdateCover((prev) => ({
                            ...prev,
                            infoBlock: {
                              ...prev.infoBlock,
                              description: { ...prev.infoBlock.description, fontFamily: e.target.value },
                            },
                          }))
                        }
                        className="w-full p-1.5 border border-stone-200 rounded-lg text-xs bg-white"
                      >
                        {GOOGLE_FONTS.map((f) => (
                          <option key={f.name} value={f.name} style={{ fontFamily: f.family }}>
                            {f.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="color"
                        value={cover.infoBlock.description.color}
                        onChange={(e) =>
                          onUpdateCover((prev) => ({
                            ...prev,
                            infoBlock: {
                              ...prev.infoBlock,
                              description: { ...prev.infoBlock.description, color: e.target.value },
                            },
                          }))
                        }
                        className="w-full h-8 rounded border border-stone-200 cursor-pointer p-0 bg-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Details Line */}
                <div className="space-y-3 pt-3 border-t border-stone-200">
                  <span className="block text-[12px] font-semibold text-stone-400 uppercase tracking-wider">
                    Details Line
                  </span>

                  <input
                    type="text"
                    value={cover.infoBlock.details.text}
                    onChange={(e) =>
                      onUpdateCover((prev) => ({
                        ...prev,
                        infoBlock: {
                          ...prev.infoBlock,
                          details: { ...prev.infoBlock.details, text: e.target.value },
                        },
                      }))
                    }
                    placeholder="e.g. 120 Pages | 100 gsm"
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs bg-white"
                  />
                </div>

                {/* Price & Barcode */}
                <div className="space-y-3 pt-3 border-t border-stone-200">
                  <span className="block text-[12px] font-semibold text-stone-400 uppercase tracking-wider">
                    Price & Barcode
                  </span>

                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={cover.infoBlock.priceBox.text}
                      onChange={(e) =>
                        onUpdateCover((prev) => ({
                          ...prev,
                          infoBlock: {
                            ...prev.infoBlock,
                            priceBox: { ...prev.infoBlock.priceBox, text: e.target.value },
                          },
                        }))
                      }
                      placeholder="Price"
                      className="flex-1 p-2 border border-stone-200 rounded-lg text-xs bg-white"
                    />

                    <input
                      type="color"
                      value={cover.infoBlock.priceBox.fillColor}
                      onChange={(e) =>
                        onUpdateCover((prev) => ({
                          ...prev,
                          infoBlock: {
                            ...prev.infoBlock,
                            priceBox: { ...prev.infoBlock.priceBox, fillColor: e.target.value },
                          },
                        }))
                      }
                      className="w-9 h-9 rounded border border-stone-200 cursor-pointer p-0 bg-transparent"
                      title="Price box background"
                    />
                  </div>

                  <label className="flex items-center justify-between p-2 rounded-lg border border-stone-200 bg-stone-50 cursor-pointer">
                    <span className="text-xs text-stone-700">Show Barcode</span>
                    <input
                      type="checkbox"
                      checked={cover.infoBlock.barcode.visible}
                      onChange={(e) =>
                        onUpdateCover((prev) => ({
                          ...prev,
                          infoBlock: {
                            ...prev.infoBlock,
                            barcode: { ...prev.infoBlock.barcode, visible: e.target.checked },
                          },
                        }))
                      }
                      className="w-4 h-4 text-terracotta-600 rounded"
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= TAB 4: PRINT ================= */}
        {activeTab === 'print' && (
          <div className="space-y-6">
            {/* Guides Toggle */}
            <div className="space-y-3">
              <span className="block text-[12px] font-semibold text-stone-400 uppercase tracking-wider">
                Guides
              </span>

              <label className="flex items-center justify-between p-3 rounded-lg border border-stone-200 bg-stone-50 cursor-pointer">
                <div>
                  <span className="text-xs font-medium text-stone-800 block">Show guides</span>
                  <span className="text-[11px] text-stone-500">Trim, safe area and bleed</span>
                </div>
                <input
                  type="checkbox"
                  checked={guides.showGuides}
                  onChange={(e) =>
                    onUpdateGuides((prev) => ({ ...prev, showGuides: e.target.checked }))
                  }
                  className="w-4 h-4 text-terracotta-600 rounded"
                />
              </label>
            </div>

            {/* A4 Sheet Settings */}
            <div className="space-y-3 pt-3 border-t border-stone-200">
              <span className="block text-[12px] font-semibold text-stone-400 uppercase tracking-wider">
                A4 Sheet Setup
              </span>

              {/* Scale */}
              <div className="space-y-1.5">
                <span className="text-xs text-stone-600">Print Scale:</span>
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

              {/* Margin Note */}
              <div
                className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
                  isSafeMargin
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <span>
                  Horizontal margin: <strong>{a4MarginIn} in</strong> (
                  {isSafeMargin ? 'Safe for all home printers' : 'Tight margin for some printers'})
                </span>
              </div>

              {/* Gap slider */}
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
              <label className="flex items-center justify-between p-2 rounded-lg border border-stone-200 bg-stone-50 cursor-pointer">
                <span className="text-xs text-stone-700">Crop marks</span>
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
                <span className="text-xs text-stone-700">Same design on both</span>
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

            {/* ACTION SECTION: EXPORT & PRINT */}
            <div className="space-y-3 pt-3 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <span className="block text-[12px] font-semibold text-stone-400 uppercase tracking-wider">
                  Actions & Output
                </span>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              </div>

              {/* 1. Download PDF and Download PNG side by side, equal width, secondary style */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onOpenPreviewModal?.('pdf')}
                  className="w-full min-h-[44px] py-2 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-stone-600" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => onOpenPreviewModal?.('png')}
                  className="w-full min-h-[44px] py-2 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-stone-600" />
                  <span>Download PNG</span>
                </button>
              </div>

              {/* 2. Print below them, full width, primary terracotta style */}
              <div className="space-y-1">
                <button
                  onClick={handlePrint}
                  className="w-full min-h-[44px] py-2.5 px-3 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <PrintIcon className="w-4 h-4" />
                  <span>Print</span>
                </button>
                {/* 3. Hint text under Print */}
                <p className="text-[11px] text-stone-500 text-center">
                  Set scale to 100% / Actual size.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
