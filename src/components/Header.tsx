import React from 'react';
import { Undo2, Redo2, FileDown, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: 'designer' | 'a4-sheet';
  onSetActiveTab: (tab: 'designer' | 'a4-sheet') => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSetActiveTab,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenExportModal,
}) => {
  return (
    <header className="h-12 w-full bg-white border-b border-stone-200 px-3 sm:px-4 flex items-center justify-between select-none shrink-0 z-20">
      {/* Left: App Name */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="w-6 h-6 rounded-md bg-stone-800 text-white flex items-center justify-center shrink-0">
          <BookOpen className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold text-xs sm:text-sm text-stone-900 tracking-tight hidden sm:inline">
          Cover Studio
        </span>
      </div>

      {/* Middle: 2 Tabs (Design, A4 Sheet) */}
      <nav className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs font-medium">
        <button
          onClick={() => onSetActiveTab('designer')}
          className={`px-2.5 sm:px-3 py-1 rounded-md transition ${
            activeTab === 'designer'
              ? 'bg-white text-terracotta-600 font-semibold shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Design
        </button>
        <button
          onClick={() => onSetActiveTab('a4-sheet')}
          className={`px-2.5 sm:px-3 py-1 rounded-md transition ${
            activeTab === 'a4-sheet'
              ? 'bg-white text-terracotta-600 font-semibold shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          A4 Sheet
        </button>
      </nav>

      {/* Right: Undo, Redo, ONE Export button */}
      <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1 sm:p-1.5 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-25 transition"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1 sm:p-1.5 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-25 transition"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenExportModal}
          className="ml-1 py-1 sm:py-1.5 px-2 sm:px-3 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1 sm:gap-1.5 active:scale-95"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
