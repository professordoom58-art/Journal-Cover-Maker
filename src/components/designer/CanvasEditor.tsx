import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CoverState, GuidesSettings } from '../../types/project';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { SidebarTab } from '../sidebar/SimpleSidebar';
import { CoverArtboard } from './CoverArtboard';

interface CanvasEditorProps {
  cover: CoverState;
  guides: GuidesSettings;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateCover: (updater: (prev: CoverState) => CoverState) => void;
  onImageDrop: (zone: 'back' | 'front', file: File) => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onSwitchSidebarTab: (tab: SidebarTab, photoZone?: 'front' | 'back') => void;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  cover,
  guides,
  selectedElementId,
  onSelectElement,
  onUpdateCover,
  onImageDrop,
  zoom,
  onZoomChange,
  onSwitchSidebarTab,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [dragZone, setDragZone] = useState<'front' | 'back' | null>(null);
  const [dragStartMouse, setDragStartMouse] = useState({ x: 0, y: 0 });
  const [initialPhotoPan, setInitialPhotoPan] = useState({ x: 0, y: 0 });

  // Fixed Artboard Dimensions in CSS pixels at 96 DPI: 816 x 552
  const ARTBOARD_W = 816;
  const ARTBOARD_H = 552;

  // Auto-fit on initial load and window resize
  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const padding = window.innerWidth < 640 ? 32 : 64;
    const availW = containerRef.current.clientWidth - padding;
    const availH = containerRef.current.clientHeight - padding;
    const scaleX = availW / ARTBOARD_W;
    const scaleY = availH / ARTBOARD_H;
    const fitScale = Math.min(scaleX, scaleY, 1.0);
    onZoomChange(Number(Math.max(0.2, fitScale).toFixed(2)));
  }, [onZoomChange]);

  useEffect(() => {
    handleFitToScreen();
    window.addEventListener('resize', handleFitToScreen);
    return () => window.removeEventListener('resize', handleFitToScreen);
  }, [handleFitToScreen]);

  // Photo mouse-down for dragging to reposition
  const handlePhotoMouseDown = (
    e: React.MouseEvent,
    zone: 'front' | 'back'
  ) => {
    e.stopPropagation();
    onSelectElement(zone === 'front' ? 'front-photo' : 'back-photo');
    onSwitchSidebarTab('photos', zone);

    const currentPhoto = zone === 'front' ? cover.frontPhoto : cover.backPhoto;
    if (!currentPhoto.imageSrc) {
      if (zone === 'front') frontFileInputRef.current?.click();
      else backFileInputRef.current?.click();
      return;
    }

    setIsDraggingPhoto(true);
    setDragZone(zone);
    setDragStartMouse({ x: e.clientX, y: e.clientY });
    setInitialPhotoPan({ x: currentPhoto.panX, y: currentPhoto.panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingPhoto || !dragZone) return;

    const dx = (e.clientX - dragStartMouse.x) / zoom;
    const dy = (e.clientY - dragStartMouse.y) / zoom;

    const targetKey = dragZone === 'front' ? 'frontPhoto' : 'backPhoto';
    onUpdateCover((prev) => ({
      ...prev,
      [targetKey]: {
        ...prev[targetKey],
        panX: Math.round(initialPhotoPan.x + dx),
        panY: Math.round(initialPhotoPan.y + dy),
      },
    }));
  };

  const handleMouseUp = () => {
    setIsDraggingPhoto(false);
    setDragZone(null);
  };

  const handleDrop = (e: React.DragEvent, zone: 'front' | 'back') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageDrop(zone, file);
      onSwitchSidebarTab('photos', zone);
    }
  };

  return (
    <main
      ref={containerRef}
      className="relative flex-1 h-full w-full bg-[#F6F5F2] overflow-hidden select-none touch-none flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <input
        ref={frontFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImageDrop('front', file);
        }}
      />
      <input
        ref={backFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImageDrop('back', file);
        }}
      />

      {/* FIXED 816 x 552 WRAPPER: Centered, Zoomed via CSS scale */}
      <div
        className="transition-transform duration-75 origin-center"
        style={{
          width: `${ARTBOARD_W}px`,
          minWidth: `${ARTBOARD_W}px`,
          maxWidth: `${ARTBOARD_W}px`,
          height: `${ARTBOARD_H}px`,
          minHeight: `${ARTBOARD_H}px`,
          maxHeight: `${ARTBOARD_H}px`,
          flex: 'none',
          transform: `scale(${zoom})`,
          boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        }}
      >
        <CoverArtboard
          cover={cover}
          showGuides={guides.showGuides}
          selectedElementId={selectedElementId}
          onSelectElement={onSelectElement}
          onPhotoMouseDown={handlePhotoMouseDown}
          onDropPhoto={handleDrop}
          isInteractive={true}
        />
      </div>

      {/* Minimal Zoom Control at Bottom-Right: [-] [ % ] [+] */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center bg-white/95 backdrop-blur-xs border border-stone-200 px-2 py-1 rounded-lg shadow-xs text-xs">
        <button
          onClick={() => onZoomChange(Math.max(0.15, Number((zoom - 0.05).toFixed(2))))}
          className="p-1.5 text-stone-600 hover:text-stone-900 transition"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <span className="font-mono text-stone-700 px-2 min-w-[44px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={() => onZoomChange(Math.min(2.0, Number((zoom + 0.05).toFixed(2))))}
          className="p-1.5 text-stone-600 hover:text-stone-900 transition"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>
    </main>
  );
};
