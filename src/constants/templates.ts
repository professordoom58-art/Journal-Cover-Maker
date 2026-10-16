import { CoverState } from '../types/project';
import { createDefaultCover } from './defaults';

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  apply: (baseCover: CoverState) => CoverState;
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'anushka-special',
    name: 'Anushka Memorial',
    description: 'The poetic, emotional classic with gold accents & deep slate spine.',
    previewColor: '#1e293b',
    apply: (base) => ({
      ...base,
      spine: {
        ...base.spine,
        text: 'ANUSHKA',
        fontFamily: 'Cinzel',
        backgroundColor: '#1e293b',
        textColor: '#f8fafc',
        letterSpacing: 4,
      },
      frontTitle: {
        ...base.frontTitle,
        text: 'Journal Title',
        fontFamily: 'Playfair Display',
        textColor: '#0f172a',
        fontWeight: 700,
        fontSize: 48,
      },
      infoBlock: {
        ...base.infoBlock,
        backgroundColor: '#ffffff',
        opacity: 0.9,
        description: {
          ...base.infoBlock.description,
          text: 'Good for health. Bad for education. Great for crying about it later.\nMade for Anushka, the one person who can turn a Tuesday into an emotional epic. Fill these pages before the sunset turns red.',
        },
        details: {
          ...base.infoBlock.details,
          text: 'Pages: 120 | Ink: Tears Welcome | Rated: Emotionally Unstable (Lovingly)',
        },
        priceBox: {
          ...base.infoBlock.priceBox,
          text: 'Priceless',
          fillColor: '#0f172a',
          textColor: '#ffffff',
        },
      },
    }),
  },
  {
    id: 'vintage-botanical',
    name: 'Vintage Botanical',
    description: 'Earthy olive tones, classical serif typography, and warm aesthetic.',
    previewColor: '#283618',
    apply: (base) => ({
      ...base,
      spine: {
        ...base.spine,
        text: 'HERBARIUM & NOTES',
        fontFamily: 'Cinzel',
        backgroundColor: '#283618',
        textColor: '#fefae0',
        letterSpacing: 3,
      },
      frontTitle: {
        ...base.frontTitle,
        text: 'Wild Flora',
        fontFamily: 'Playfair Display',
        textColor: '#283618',
        fontWeight: 700,
        fontSize: 52,
      },
      infoBlock: {
        ...base.infoBlock,
        backgroundColor: '#fefae0',
        opacity: 0.94,
        description: {
          ...base.infoBlock.description,
          color: '#283618',
          text: 'Collected specimens, pressed petals, and field observations. Recorded under morning fog and golden twilight across quiet meadows.',
        },
        details: {
          ...base.infoBlock.details,
          color: '#606c38',
          text: 'Hand-bound Volume • Recycled 120gsm Kraft Paper • Vol. IV',
        },
        priceBox: {
          ...base.infoBlock.priceBox,
          text: '$28.00',
          fillColor: '#606c38',
          textColor: '#fefae0',
        },
      },
    }),
  },
  {
    id: 'dark-noir',
    name: 'Midnight Noir',
    description: 'Sleek obsidian monochrome with high contrast minimalism.',
    previewColor: '#09090b',
    apply: (base) => ({
      ...base,
      spine: {
        ...base.spine,
        text: 'NIGHT DIARIES',
        fontFamily: 'Montserrat',
        backgroundColor: '#09090b',
        textColor: '#ffffff',
        letterSpacing: 6,
      },
      frontTitle: {
        ...base.frontTitle,
        text: 'CHRONICLES',
        fontFamily: 'Oswald',
        textColor: '#ffffff',
        fontWeight: 800,
        fontSize: 56,
        letterSpacing: 4,
      },
      infoBlock: {
        ...base.infoBlock,
        backgroundColor: '#18181b',
        opacity: 0.85,
        description: {
          ...base.infoBlock.description,
          color: '#e4e4e7',
          text: 'Raw midnight confessions, unedited code snippets, and sketches made when the rest of the world was asleep.',
        },
        details: {
          ...base.infoBlock.details,
          color: '#a1a1aa',
          text: 'Limited Run 042/500 • Heavyweight Matte Black Linen',
        },
        priceBox: {
          ...base.infoBlock.priceBox,
          text: 'LIMITED',
          fillColor: '#fafafa',
          textColor: '#09090b',
        },
      },
    }),
  },
  {
    id: 'poetry-handwritten',
    name: 'Poet Laureate',
    description: 'Artisanal cursive accents with warm terracotta accents.',
    previewColor: '#9c6644',
    apply: (base) => ({
      ...base,
      spine: {
        ...base.spine,
        text: 'verses & sketches',
        fontFamily: 'Caveat',
        backgroundColor: '#7f4f24',
        textColor: '#ede0d4',
        letterSpacing: 2,
        fontSize: 20,
      },
      frontTitle: {
        ...base.frontTitle,
        text: 'Letters to Myself',
        fontFamily: 'Dancing Script',
        textColor: '#4a2810',
        fontWeight: 700,
        fontSize: 54,
      },
      infoBlock: {
        ...base.infoBlock,
        backgroundColor: '#ede0d4',
        opacity: 0.92,
        description: {
          ...base.infoBlock.description,
          fontFamily: 'Caveat',
          fontSize: 13,
          color: '#4a2810',
          text: 'For the words that were too quiet to say out loud, and the memories that deserve a sanctuary before time softens them.',
        },
        details: {
          ...base.infoBlock.details,
          color: '#7f4f24',
          text: 'Fountain Pen Friendly • 160 Dot-Grid Pages • Soft Touch',
        },
        priceBox: {
          ...base.infoBlock.priceBox,
          text: 'Collector Edition',
          fillColor: '#9c6644',
          textColor: '#ffffff',
          width: 280,
        },
      },
    }),
  },
];
