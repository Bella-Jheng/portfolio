export type MagazineTheme = {
  bg: string;
  accent: string;
  text: string;
  catSrc: string;
};

export const STEM_ELEMENT: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

export const ELEMENT_ENGLISH: Record<string, string> = {
  木: 'WOOD ELEMENT',
  火: 'FIRE ELEMENT',
  土: 'EARTH ELEMENT',
  金: 'METAL ELEMENT',
  水: 'WATER ELEMENT',
};

export const ELEMENT_THEME: Record<string, MagazineTheme> = {
  木: { bg: '#F4FAF4', accent: '#7AC97A', text: '#2E4C2E', catSrc: '/cats/bazi-cat-wood.webp' },
  火: { bg: '#FFF5F5', accent: '#E87878', text: '#5C2D2D', catSrc: '/cats/bazi-cat-fire.webp' },
  土: { bg: '#FFFDF5', accent: '#FCD060', text: '#4A4A4A', catSrc: '/cats/bazi-cat-earth.webp' },
  金: { bg: '#FFFBE0', accent: '#C8900A', text: '#4A3200', catSrc: '/cats/bazi-cat-gold.webp' },
  水: { bg: '#F5EDFF', accent: '#9070C0', text: '#36274D', catSrc: '/cats/bazi-cat-water.webp' },
};

export const DEFAULT_THEME: MagazineTheme = {
  bg: '#FFFDF5',
  accent: '#FCD060',
  text: '#4A4A4A',
  catSrc: '/cats/bazi-cat-default.webp',
};
