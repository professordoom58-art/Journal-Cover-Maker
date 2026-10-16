export type FontOption = {
  name: string;
  family: string;
  category: 'serif' | 'sans-serif' | 'handwriting' | 'display';
};

export type FitMode = 'fill' | 'fit';

export interface PhotoZoneState {
  imageSrc: string | null;
  originalWidth: number;
  originalHeight: number;
  fitMode: FitMode;
  zoom: number;       // 0.5 to 3.0
  panX: number;       // offset in px
  panY: number;       // offset in px
  rotation: number;   // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  backgroundColor: string;
  extendBleed: boolean;
}

export interface SpineState {
  widthInches: number; // default 0.25
  backgroundColor: string;
  text: string;        // max 24 chars
  fontFamily: string;
  fontSize: number;    // default 11 pt
  textColor: string;
  letterSpacing: number;
  visible: boolean;
}

export interface FrontTitleState {
  text: string;
  fontFamily: string;
  fontSize: number;    // in pt
  fontWeight: number;
  textColor: string;
  align: 'left' | 'center' | 'right';
  letterSpacing: number;
  x: number;           // in px inside spread
  y: number;           // in px inside spread
  visible: boolean;
}

export interface InfoBlockState {
  visible: boolean;        // "Show info box" (whole panel)
  showDescription: boolean; // "Show description" toggle
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  opacity: number;     // 0 to 1
  borderRadius: number;

  description: {
    visible: boolean;
    text: string;
    fontFamily: string;
    fontSize: number;  // pt
    lineHeight?: number;
    color: string;
  };

  details: {
    visible: boolean;
    text: string;
    fontFamily: string;
    fontSize: number;  // pt
    color: string;
  };

  priceBox: {
    visible: boolean;
    text: string;
    fontFamily: string;
    fontSize: number;  // pt
    fillColor: string;
    textColor: string;
    borderRadius: number;
    width: number;
    height: number;
  };

  barcode: {
    visible: boolean;
    code: string;
    width: number;
    height: number;
  };
}

export interface CoverState {
  id: 'cover-a' | 'cover-b';
  title: string;
  spine: SpineState;
  backPhoto: PhotoZoneState;
  frontPhoto: PhotoZoneState;
  frontTitle: FrontTitleState;
  infoBlock: InfoBlockState;
  customElements?: any[];
}

export interface GuidesSettings {
  showGuides: boolean; // Single toggle that shows trim, safe area, and bleed together
  showBleed?: boolean;
  showSafeArea?: boolean;
  showTrim?: boolean;
  showFoldLines?: boolean;
}

export interface A4SheetSettings {
  scale: 1.0 | 0.95 | 0.90 | 0.85; // default 0.90
  gapInches: number;                // default 0.4
  showCropMarks: boolean;
  duplicateCoverA: boolean;         // "Same design on both" toggle
  includeBleedInPrint?: boolean;
  rotateSpreads90?: boolean;
}

export interface ProjectState {
  version: string;
  name: string;
  activeTab: 'designer' | 'a4-sheet';
  activeCoverId: 'cover-a' | 'cover-b';
  selectedElementId: string | null;
  coverA: CoverState;
  coverB: CoverState;
  guides: GuidesSettings;
  a4Settings: A4SheetSettings;
}
