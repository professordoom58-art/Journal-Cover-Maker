export interface IconDefinition {
  id: string;
  name: string;
  category: 'celestial' | 'botanical' | 'vintage' | 'minimal';
  svgPath: string;
  viewBox: string;
}

export const STICKER_ICONS: IconDefinition[] = [
  {
    id: 'star-four',
    name: 'Sparkle Star',
    category: 'celestial',
    viewBox: '0 0 24 24',
    svgPath: 'M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z',
  },
  {
    id: 'crescent-moon',
    name: 'Crescent Moon',
    category: 'celestial',
    viewBox: '0 0 24 24',
    svgPath: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z',
  },
  {
    id: 'sun-burst',
    name: 'Sun Symbol',
    category: 'celestial',
    viewBox: '0 0 24 24',
    svgPath: 'M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM12 2V5M12 19V22M2 12H5M19 12H22M4.93 4.93L7.05 7.05M16.95 16.95L19.07 19.07M4.93 19.07L7.05 16.95M16.95 7.05L19.07 4.93',
  },
  {
    id: 'feather-quill',
    name: 'Feather Quill',
    category: 'vintage',
    viewBox: '0 0 24 24',
    svgPath: 'M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5zM16 8 2 22M17.5 15H9',
  },
  {
    id: 'open-book',
    name: 'Open Book',
    category: 'vintage',
    viewBox: '0 0 24 24',
    svgPath: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  },
  {
    id: 'heart-outline',
    name: 'Delicate Heart',
    category: 'minimal',
    viewBox: '0 0 24 24',
    svgPath: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  },
  {
    id: 'botanical-branch',
    name: 'Botanical Leaf',
    category: 'botanical',
    viewBox: '0 0 24 24',
    svgPath: 'M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22ZM12 2V22',
  },
  {
    id: 'compass',
    name: 'Vintage Compass',
    category: 'vintage',
    viewBox: '0 0 24 24',
    svgPath: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm4.24-14.24-2.83 8.49-8.49 2.83 2.83-8.49 8.49-2.83z',
  },
  {
    id: 'bookmark-ribbon',
    name: 'Ribbon Bookmark',
    category: 'minimal',
    viewBox: '0 0 24 24',
    svgPath: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z',
  },
  {
    id: 'coffee-cup',
    name: 'Coffee Cup',
    category: 'minimal',
    viewBox: '0 0 24 24',
    svgPath: 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3',
  },
];
