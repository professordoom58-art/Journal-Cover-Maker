import React, { useState, useEffect, useCallback } from 'react';
import { ProjectState, CoverState } from './types/project';
import { loadProjectFromStorage, saveProjectToStorage } from './utils/storage';
import { Header } from './components/Header';
import { SimpleSidebar, SidebarTab } from './components/sidebar/SimpleSidebar';
import { CanvasEditor } from './components/designer/CanvasEditor';
import { A4PrintSheetView } from './components/printSheet/A4PrintSheetView';
import { ExportModal } from './components/modals/ExportModal';
import { CoverArtboard } from './components/designer/CoverArtboard';
import { Image as ImageIcon, Type, BookOpen, Printer, X } from 'lucide-react';

export const App: React.FC = () => {
  const [project, setProject] = useState<ProjectState>(() => loadProjectFromStorage());

  // Navigation & Tabs
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('photos');
  const [activePhotoZone, setActivePhotoZone] = useState<'front' | 'back'>('front');
  const [zoom, setZoom] = useState(0.42);

  // Mobile bottom sheet state
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // History for Undo / Redo
  const [history, setHistory] = useState<CoverState[]>([]);
  const [future, setFuture] = useState<CoverState[]>([]);

  // Export Preview Modal State
  const [exportModalConfig, setExportModalConfig] = useState<{
    isOpen: boolean;
    format: 'pdf' | 'png' | 'spread';
  }>({ isOpen: false, format: 'pdf' });

  // Simulated Mobile Mode for testing (e.g. ?mobile=390)
  const [isMobileSimulated, setIsMobileSimulated] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.search.includes('mobile=390') || window.location.hash.includes('mobile'))) {
      setIsMobileSimulated(true);
    }
  }, []);

  // Active cover helper
  const activeCover = project.activeCoverId === 'cover-a' ? project.coverA : project.coverB;

  // Autosave to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      saveProjectToStorage(project);
    }, 500);
    return () => clearTimeout(timer);
  }, [project]);

  // Update active cover with undo recording
  const handleUpdateActiveCover = useCallback(
    (updater: (prev: CoverState) => CoverState) => {
      setProject((prevProject) => {
        const currentCover =
          prevProject.activeCoverId === 'cover-a' ? prevProject.coverA : prevProject.coverB;
        const updatedCover = updater(currentCover);

        // Push previous state to history
        setHistory((hist) => [...hist.slice(-25), currentCover]);
        setFuture([]);

        if (prevProject.activeCoverId === 'cover-a') {
          return { ...prevProject, coverA: updatedCover };
        } else {
          return { ...prevProject, coverB: updatedCover };
        }
      });
    },
    []
  );

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((hist) => hist.slice(0, hist.length - 1));
    setFuture((fut) => [activeCover, ...fut]);

    setProject((prev) => ({
      ...prev,
      [prev.activeCoverId === 'cover-a' ? 'coverA' : 'coverB']: previous,
    }));
  }, [history, activeCover]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((fut) => fut.slice(1));
    setHistory((hist) => [...hist, activeCover]);

    setProject((prev) => ({
      ...prev,
      [prev.activeCoverId === 'cover-a' ? 'coverA' : 'coverB']: next,
    }));
  }, [future, activeCover]);

  // Keyboard Shortcuts: Ctrl+Z, Ctrl+Y, Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        handleRedo();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Image drop/upload handler
  const handleImageUpload = useCallback(
    (zone: 'front' | 'back', file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          handleUpdateActiveCover((prev) => {
            const key = zone === 'front' ? 'frontPhoto' : 'backPhoto';
            return {
              ...prev,
              [key]: {
                ...prev[key],
                imageSrc: src,
                originalWidth: img.naturalWidth,
                originalHeight: img.naturalHeight,
                fitMode: 'fit',
                zoom: 1.0,
                panX: 0,
                panY: 0,
                rotation: 0,
                flipH: false,
                flipV: false,
              },
            };
          });
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    },
    [handleUpdateActiveCover]
  );

  // Switch sidebar tab when canvas element is clicked
  const handleSwitchSidebarTab = useCallback(
    (tab: SidebarTab, photoZone?: 'front' | 'back') => {
      setSidebarTab(tab);
      if (photoZone) setActivePhotoZone(photoZone);
      // Open bottom sheet if on mobile
      if (window.innerWidth < 640) {
        setMobileSheetOpen(true);
      }
    },
    []
  );

  // Testing helpers exposed on window for browser testing
  useEffect(() => {
    (window as any).__testHelpers = {
      setPhotos: (frontSrc: string, backSrc: string, fitMode: 'fit' | 'fill' = 'fit') => {
        handleUpdateActiveCover((prev) => ({
          ...prev,
          frontPhoto: {
            ...prev.frontPhoto,
            imageSrc: frontSrc,
            fitMode,
            zoom: 1.0,
            panX: 0,
            panY: 0,
          },
          backPhoto: {
            ...prev.backPhoto,
            imageSrc: backSrc,
            fitMode,
            zoom: 1.0,
            panX: 0,
            panY: 0,
          },
        }));
      },
      setSpine: (bgColor: string, textColor: string) => {
        handleUpdateActiveCover((prev) => ({
          ...prev,
          spine: {
            ...prev.spine,
            backgroundColor: bgColor,
            textColor,
          },
        }));
      },
      setBackgroundColor: (zone: 'front' | 'back', color: string) => {
        handleUpdateActiveCover((prev) => {
          const key = zone === 'front' ? 'frontPhoto' : 'backPhoto';
          return {
            ...prev,
            [key]: {
              ...prev[key],
              backgroundColor: color,
            },
          };
        });
      },
    };
  }, [handleUpdateActiveCover]);

  return (
    <>
      <div className={isMobileSimulated ? 'w-full h-[100dvh] bg-stone-900 flex items-center justify-center p-4' : ''}>
        <div className={`no-print flex flex-col ${isMobileSimulated ? 'w-[390px] h-[844px] max-w-[390px] max-h-[844px] border border-stone-600 rounded-3xl shadow-2xl relative' : 'h-[100dvh] w-full max-w-full'} bg-[#F6F5F2] overflow-hidden font-sans text-stone-800 relative`}>
        {/* 1. Single-Row Top Bar */}
        <Header
          activeTab={project.activeTab}
          onSetActiveTab={(tab) => setProject((prev) => ({ ...prev, activeTab: tab }))}
          canUndo={history.length > 0}
          canRedo={future.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onOpenExportModal={() => setExportModalConfig({ isOpen: true, format: 'pdf' })}
        />

        {/* 2. Main Content Area */}
        <div className="flex flex-1 w-full overflow-hidden relative">
          {project.activeTab === 'designer' ? (
            <>
              {/* Desktop Left Sidebar (300px) */}
              {!isMobileSimulated && (
                <div className="hidden sm:block">
                  <SimpleSidebar
                    activeTab={sidebarTab}
                    onTabChange={setSidebarTab}
                    activePhotoZone={activePhotoZone}
                    onPhotoZoneChange={setActivePhotoZone}
                    cover={activeCover}
                    onUpdateCover={handleUpdateActiveCover}
                    guides={project.guides}
                    onUpdateGuides={(updater) =>
                      setProject((prev) => ({ ...prev, guides: updater(prev.guides) }))
                    }
                    a4Settings={project.a4Settings}
                    onUpdateA4Settings={(updater) =>
                      setProject((prev) => ({ ...prev, a4Settings: updater(prev.a4Settings) }))
                    }
                    onImageUpload={handleImageUpload}
                    project={project}
                    onOpenPreviewModal={(fmt) => setExportModalConfig({ isOpen: true, format: fmt })}
                  />
                </div>
              )}

            {/* Center Area: Cover A/B Bar + Canvas */}
            <div className="flex-1 h-full flex flex-col overflow-hidden">
              {/* Centered Cover A / Cover B Switch + Show Guides Toggle */}
              <div className="h-10 bg-white border-b border-stone-200 px-4 flex items-center justify-between text-xs select-none shrink-0">
                <div className="w-24 hidden sm:block" />

                {/* Centered Segmented Control */}
                <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200 font-medium">
                  <button
                    onClick={() =>
                      setProject((prev) => ({
                        ...prev,
                        activeCoverId: 'cover-a',
                        selectedElementId: null,
                      }))
                    }
                    className={`px-3 py-1 rounded-md transition ${
                      project.activeCoverId === 'cover-a'
                        ? 'bg-white text-stone-900 font-semibold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Cover A
                  </button>
                  <button
                    onClick={() =>
                      setProject((prev) => ({
                        ...prev,
                        activeCoverId: 'cover-b',
                        selectedElementId: null,
                      }))
                    }
                    className={`px-3 py-1 rounded-md transition ${
                      project.activeCoverId === 'cover-b'
                        ? 'bg-white text-stone-900 font-semibold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Cover B
                  </button>
                </div>

                {/* Guides Toggle + Legend */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Legend (only shows when guides are on) */}
                  {project.guides.showGuides && (
                    <div className="flex items-center gap-2 text-[12px] text-stone-600 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-0 border-t-2 border-dashed border-red-500" />
                        <span>Bleed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-0.5 bg-black" />
                        <span>Trim</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-0 border-t-2 border-dashed border-emerald-500" />
                        <span>Safe area</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-0 border-t-2 border-dashed border-stone-400" />
                        <span>Fold</span>
                      </div>
                    </div>
                  )}

                  {/* Quick Guides Checkbox */}
                  <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 hover:text-stone-900">
                    <input
                      type="checkbox"
                      checked={project.guides.showGuides}
                      onChange={(e) =>
                        setProject((prev) => ({
                          ...prev,
                          guides: { ...prev.guides, showGuides: e.target.checked },
                        }))
                      }
                      className="rounded text-terracotta-600 w-3.5 h-3.5"
                    />
                    <span className="text-xs">Show guides</span>
                  </label>
                </div>
              </div>

              {/* Canvas Viewport */}
              <CanvasEditor
                cover={activeCover}
                guides={project.guides}
                selectedElementId={project.selectedElementId}
                onSelectElement={(id) => setProject((prev) => ({ ...prev, selectedElementId: id }))}
                onUpdateCover={handleUpdateActiveCover}
                onImageDrop={handleImageUpload}
                zoom={zoom}
                onZoomChange={setZoom}
                onSwitchSidebarTab={handleSwitchSidebarTab}
              />
            </div>

            {/* Mobile Fixed Bottom Navigation Bar (< 640px) */}
            <div className={`${isMobileSimulated ? 'flex absolute' : 'sm:hidden fixed'} bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xs border-t border-stone-200 flex items-center justify-around py-1.5 pb-[max(8px,env(safe-area-inset-bottom))] shadow-lg`}>
              <button
                onClick={() => {
                  setSidebarTab('photos');
                  setMobileSheetOpen(true);
                }}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] text-xs transition ${
                  sidebarTab === 'photos' && mobileSheetOpen
                    ? 'text-terracotta-600 font-semibold'
                    : 'text-stone-600'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">Photos</span>
              </button>

              <button
                onClick={() => {
                  setSidebarTab('text');
                  setMobileSheetOpen(true);
                }}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] text-xs transition ${
                  sidebarTab === 'text' && mobileSheetOpen
                    ? 'text-terracotta-600 font-semibold'
                    : 'text-stone-600'
                }`}
              >
                <Type className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">Text</span>
              </button>

              <button
                onClick={() => {
                  setSidebarTab('back-cover');
                  setMobileSheetOpen(true);
                }}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] text-xs transition ${
                  sidebarTab === 'back-cover' && mobileSheetOpen
                    ? 'text-terracotta-600 font-semibold'
                    : 'text-stone-600'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">Back</span>
              </button>

              <button
                onClick={() => {
                  setSidebarTab('print');
                  setMobileSheetOpen(true);
                }}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] text-xs transition ${
                  sidebarTab === 'print' && mobileSheetOpen
                    ? 'text-terracotta-600 font-semibold'
                    : 'text-stone-600'
                }`}
              >
                <Printer className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">Print</span>
              </button>
            </div>

            {/* Mobile Bottom Sheet Modal (< 640px) */}
            {mobileSheetOpen && (
              <>
                <div
                  className={`${isMobileSimulated ? 'absolute' : 'sm:hidden fixed'} inset-0 z-40 bg-stone-900/30 backdrop-blur-xs transition-opacity`}
                  onClick={() => setMobileSheetOpen(false)}
                />

                <div className={`${isMobileSimulated ? 'absolute' : 'sm:hidden fixed'} left-0 right-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl border-t border-stone-200 flex flex-col max-h-[75dvh] pb-[max(12px,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-200`}>
                  <div className="pt-2 px-4 pb-2 border-b border-stone-200 flex items-center justify-between">
                    <span className="font-semibold text-xs text-stone-900 uppercase tracking-wider">
                      {sidebarTab === 'photos'
                        ? 'Photos'
                        : sidebarTab === 'text'
                        ? 'Title & Spine Text'
                        : sidebarTab === 'back-cover'
                        ? 'Back Cover Details'
                        : 'Print & Guides'}
                    </span>
                    <button
                      onClick={() => setMobileSheetOpen(false)}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <SimpleSidebar
                      activeTab={sidebarTab}
                      onTabChange={setSidebarTab}
                      activePhotoZone={activePhotoZone}
                      onPhotoZoneChange={setActivePhotoZone}
                      cover={activeCover}
                      onUpdateCover={handleUpdateActiveCover}
                      guides={project.guides}
                      onUpdateGuides={(updater) =>
                        setProject((prev) => ({ ...prev, guides: updater(prev.guides) }))
                      }
                      a4Settings={project.a4Settings}
                      onUpdateA4Settings={(updater) =>
                        setProject((prev) => ({ ...prev, a4Settings: updater(prev.a4Settings) }))
                      }
                      onImageUpload={handleImageUpload}
                      project={project}
                      onOpenPreviewModal={(fmt) => {
                        setMobileSheetOpen(false);
                        setExportModalConfig({ isOpen: true, format: fmt });
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          /* Tab 2: A4 Print Sheet Imposition View */
          <A4PrintSheetView
            project={project}
            onUpdateA4Settings={(updater) =>
              setProject((prev) => ({ ...prev, a4Settings: updater(prev.a4Settings) }))
            }
          />
        )}
      </div>

      {/* Export Preview Modal */}
      {exportModalConfig.isOpen && (
        <ExportModal
          project={project}
          activeCover={activeCover}
          initialFormat={exportModalConfig.format}
          onClose={() => setExportModalConfig((prev) => ({ ...prev, isOpen: false }))}
          isSimulatedMobile={isMobileSimulated}
        />
      )}
      </div>
    </div>

    {/* Dedicated Printable A4 Container for window.print() (Zero UI, @page { size: A4; margin: 0 }) */}
    <div className="print-only hidden">
      <div
        className="relative bg-white overflow-hidden"
        style={{
          width: '210mm',
          height: '297mm',
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
        }}
      >
        {/* Top Cover Spread */}
        <div
          className="absolute"
          style={{
            left: `${(210 - (8.25 * project.a4Settings.scale * 25.4)) / 2}mm`,
            top: '12mm',
            transform: `scale(${project.a4Settings.scale * (25.4 / 96)})`,
            transformOrigin: 'top left',
          }}
        >
          <CoverArtboard cover={project.coverA} showGuides={false} isInteractive={false} />
        </div>

        {/* Bottom Cover Spread */}
        <div
          className="absolute"
          style={{
            left: `${(210 - (8.25 * project.a4Settings.scale * 25.4)) / 2}mm`,
            top: `${12 + (5.5 * project.a4Settings.scale * 25.4) + (project.a4Settings.gapInches * 25.4)}mm`,
            transform: `scale(${project.a4Settings.scale * (25.4 / 96)})`,
            transformOrigin: 'top left',
          }}
        >
          <CoverArtboard
            cover={project.a4Settings.duplicateCoverA ? project.coverA : project.coverB}
            showGuides={false}
            isInteractive={false}
          />
        </div>
      </div>
      </div>
    </>
  );
};

export default App;
