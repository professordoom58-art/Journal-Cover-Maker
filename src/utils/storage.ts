import { ProjectState } from '../types/project';
import { createInitialProjectState } from '../constants/defaults';

const STORAGE_KEY = 'journal_cover_studio_project_v1';

/**
 * Normalizes loaded project state, ensuring spine colors and photo fitMode backward compatibility
 */
export const normalizeProjectState = (parsed: any): ProjectState => {
  const base = createInitialProjectState();
  if (!parsed) return base;

  const normalizeCover = (loadedCover: any, defaultCover: any) => {
    if (!loadedCover) return defaultCover;
    return {
      ...defaultCover,
      ...loadedCover,
      spine: {
        ...defaultCover.spine,
        ...loadedCover.spine,
        backgroundColor: loadedCover.spine?.backgroundColor || '#2B2B33',
        textColor: loadedCover.spine?.textColor || '#ffffff',
      },
      backPhoto: {
        ...defaultCover.backPhoto,
        ...loadedCover.backPhoto,
        fitMode: loadedCover.backPhoto?.fitMode || (loadedCover.backPhoto?.imageSrc ? 'fill' : 'fit'),
        backgroundColor: loadedCover.backPhoto?.backgroundColor || '#ffffff',
        extendBleed: loadedCover.backPhoto?.extendBleed !== undefined ? loadedCover.backPhoto.extendBleed : true,
      },
      frontPhoto: {
        ...defaultCover.frontPhoto,
        ...loadedCover.frontPhoto,
        fitMode: loadedCover.frontPhoto?.fitMode || (loadedCover.frontPhoto?.imageSrc ? 'fill' : 'fit'),
        backgroundColor: loadedCover.frontPhoto?.backgroundColor || '#ffffff',
        extendBleed: loadedCover.frontPhoto?.extendBleed !== undefined ? loadedCover.frontPhoto.extendBleed : true,
      },
    };
  };

  return {
    ...base,
    ...parsed,
    coverA: normalizeCover(parsed?.coverA, base.coverA),
    coverB: normalizeCover(parsed?.coverB, base.coverB),
  };
};

/**
 * Loads project state from localStorage or returns default
 */
export const loadProjectFromStorage = (): ProjectState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProjectState();
    const parsed = JSON.parse(raw);
    return normalizeProjectState(parsed);
  } catch (e) {
    console.warn('Failed to load project from localStorage:', e);
    return createInitialProjectState();
  }
};

/**
 * Saves project state to localStorage
 */
export const saveProjectToStorage = (project: ProjectState) => {
  try {
    const serialized = JSON.stringify(project);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (e) {
    console.warn('LocalStorage quota exceeded or unavailable:', e);
  }
};

/**
 * Downloads project state as a JSON file
 */
export const exportProjectToJsonFile = (project: ProjectState) => {
  const data = JSON.stringify(project, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-project.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Reads project JSON file from an input file
 */
export const importProjectFromJsonFile = (file: File): Promise<ProjectState> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        resolve({
          ...createInitialProjectState(),
          ...parsed,
        });
      } catch (err) {
        reject(new Error('Invalid project JSON file format.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
};

/**
 * Compresses an image data URL for storage if needed
 */
export const compressImageDataUrl = (
  dataUrl: string,
  maxWidth: number = 1800,
  maxHeight: number = 2400,
  quality: number = 0.85
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};
