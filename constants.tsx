
import { BannerItem } from './types';
import { LOCAL_IMAGES } from './imageLibrary';

export const COLORS = {
  primary: '#0047FF', 
  secondary: '#FACC15', 
  accent: '#f97316', 
  success: '#10b981', 
  danger: '#ef4444', 
  backgroundUser: '#FACC15', 
  backgroundAdmin: '#FACC15', 
  darkNav: '#ffffff'
};

export const ASSETS = {
  logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEwMCAxMEwxNzggNTVWMTQ1TDEwMCAxOTBMMjIgMTQ1VjU1TDEwMCAxMFoiIGZpbGw9IiMwMDQ3RkYiLz48cGF0aCBkPSJNNjUgMTQwVjYwSDEwNUMxMjEuNTY5IDYwIDEzNSA3My40MzE1IDEzNSA5MEMxMzUgMTAxLjQyIDEyOC42MTUgMTExLjM0OCAxMTkuMjQxIDExNi41MUwxNDAgMTQwSDExNUw5Ny41IDEyMEg4NVYxNDBINjVaTTg1IDEwMEgxMDBDIDEwNS41MjMgMTAwIDExMCA5NS41MjI4IDExMCA5MEMxMTAgODQuNDc3MiAxMDUuNTIzIDgwIDEwMCA4MEg4NVYxMDBaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik0xNDAgMTE1SDE2NU0xNTIuNSAxMDIuNVYxMjcuNSIgc3Ryb2tlPSIjRkZEMzAwIiBzdHlsZS13aWR0aD0iOCIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+',
};

/**
 * MOCK_BANNERS utilise maintenant vos images locales définies dans imageLibrary.ts
 */
export const MOCK_BANNERS: BannerItem[] = [
  { id: 'local-b1', image: LOCAL_IMAGES.banner1 }, 
  { id: 'local-b2', image: LOCAL_IMAGES.banner2 },
  { id: 'local-b3', image: LOCAL_IMAGES.banner3 },
  { id: 'local-b4', image: LOCAL_IMAGES.banner4 },
];

export const SUPPORT_PHONE = "91 11 58 58";
export const METHODS = ['Nita', 'Amana'];
export const BOOKMAKERS = ['1xbet', 'Melbet', 'Betwinner'];
export const ADMIN_CREDENTIALS = { id: 'champion', password: 'champion2010' };
