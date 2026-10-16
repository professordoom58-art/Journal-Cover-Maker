import { CoverState, ProjectState, PhotoZoneState } from '../types/project';

export const DPI = 300;

// Dimensions in inches
export const DIMENSIONS = {
  JOURNAL_WIDTH: 4.0,       // inches
  JOURNAL_HEIGHT: 5.5,      // inches
  DEFAULT_SPINE: 0.25,      // inches
  BLEED: 0.125,             // inches (1/8 in)
  SAFE_MARGIN: 0.25,        // inches (1/4 in inside trim)
  A4_WIDTH: 8.2677,         // inches (~210mm)
  A4_HEIGHT: 11.6929,       // inches (~297mm)
  DEFAULT_A4_GAP: 0.4,      // inches
};

// Pixels at 300 DPI
export const PIXELS = {
  JOURNAL_WIDTH: Math.round(DIMENSIONS.JOURNAL_WIDTH * DPI),   // 1200 px
  JOURNAL_HEIGHT: Math.round(DIMENSIONS.JOURNAL_HEIGHT * DPI), // 1650 px
  DEFAULT_SPINE: Math.round(DIMENSIONS.DEFAULT_SPINE * DPI),   // 75 px
  BLEED: Math.round(DIMENSIONS.BLEED * DPI),                   // 38 px (37.5)
  SAFE_MARGIN: Math.round(DIMENSIONS.SAFE_MARGIN * DPI),       // 75 px
  A4_WIDTH: 2480,                                              // standard 300 DPI A4
  A4_HEIGHT: 3508,                                             // standard 300 DPI A4
  DEFAULT_A4_GAP: Math.round(DIMENSIONS.DEFAULT_A4_GAP * DPI), // 120 px
};

export const createDefaultPhotoZone = (bgColor: string = '#ffffff'): PhotoZoneState => ({
  imageSrc: null,
  originalWidth: 0,
  originalHeight: 0,
  fitMode: 'fit',
  zoom: 1.0,
  panX: 0,
  panY: 0,
  rotation: 0,
  flipH: false,
  flipV: false,
  backgroundColor: bgColor,
  extendBleed: true,
});

export const createDefaultCover = (id: 'cover-a' | 'cover-b', title: string): CoverState => {
  const isA = id === 'cover-a';

  return {
    id,
    title,
    spine: {
      widthInches: 0.25,
      backgroundColor: '#2B2B33', // Default spine strip color
      text: (isA ? 'ANUSHKA' : 'MEMORIES').slice(0, 24),
      fontFamily: 'Inter',
      fontSize: 11, // default 11 pt
      textColor: '#ffffff', // Default text color
      letterSpacing: 2,
      visible: true,
    },
    backPhoto: createDefaultPhotoZone('#ffffff'),
    frontPhoto: createDefaultPhotoZone('#ffffff'),
    frontTitle: {
      text: isA ? 'Journal Title' : 'Special Edition',
      fontFamily: 'Playfair Display',
      fontSize: 28,
      fontWeight: 700,
      textColor: '#0f172a',
      align: 'center',
      letterSpacing: 2,
      // In 96 DPI: front panel is 408 to 792, center is 600 px
      x: 600,
      y: 200,
      visible: true,
    },
    infoBlock: {
      visible: true,           // "Show info box"
      showDescription: true,   // "Show description"
      x: 24,                   // inside safe margin from left (24px)
      y: 354,                  // bottom anchored inside safe margin
      width: 336,              // 384 - 48
      height: 150,             // fits description, details, price, barcode
      backgroundColor: '#ffffff',
      opacity: 0.92,
      borderRadius: 10,
      description: {
        visible: true,
        text: isA 
          ? 'Good for health. Bad for education. Great for crying about it later. Fill these pages before the sunset turns red.'
          : 'A bespoke archive of unscripted thoughts, secret playlists, and late-night epiphanies.',
        fontFamily: 'Inter',
        fontSize: 9,
        lineHeight: 1.4,
        color: '#1e293b',
      },
      details: {
        visible: true,
        text: isA
          ? 'Pages: 120 | Ink: Tears Welcome | Edition: 01'
          : 'Archival Acid-Free Paper | 100 gsm | Made with intention',
        fontFamily: 'Inter',
        fontSize: 8,
        color: '#64748b',
      },
      priceBox: {
        visible: true,
        text: isA ? 'Priceless' : '$24.00',
        fontFamily: 'Inter',
        fontSize: 10,
        fillColor: '#0f172a',
        textColor: '#ffffff',
        borderRadius: 5,
        width: 72,
        height: 24,
      },
      barcode: {
        visible: true,
        code: '9781402894626',
        width: 80,
        height: 32,
      },
    },
  };
};

export const createInitialProjectState = (): ProjectState => ({
  version: '2.0.0',
  name: 'My Journal Project',
  activeTab: 'designer',
  activeCoverId: 'cover-a',
  selectedElementId: 'front-title',
  coverA: createDefaultCover('cover-a', 'Cover A'),
  coverB: createDefaultCover('cover-b', 'Cover B'),
  guides: {
    showGuides: false, // OFF by default
  },
  a4Settings: {
    scale: 0.90,
    gapInches: 0.4,
    showCropMarks: true,
    duplicateCoverA: false,
    includeBleedInPrint: true,
  },
});
