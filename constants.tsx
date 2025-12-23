
import { BannerItem } from './types';

export const COLORS = {
  primary: '#1d4ed8', // Bleu Royal
  secondary: '#facc15', // Jaune Or
  accent: '#f97316', // Orange
  success: '#2ecc71', // Vert Émeraude
  danger: '#e74c3c', // Rouge Alerte
  backgroundUser: '#F4F7FE', // Fond suggéré pour le client (très clair et moderne)
  backgroundAdmin: '#0a4d8c', // Fond suggéré pour l'admin (profond et pro)
  darkNav: '#073663' // Navigation basse admin
};

export const MOCK_BANNERS: BannerItem[] = [
  { id: '1', image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2000&auto=format&fit=crop' },
  { id: '2', image: 'https://images.unsplash.com/photo-1541278107931-e006523892df?q=80&w=2000&auto=format&fit=crop' },
  { id: '3', image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2000&auto=format&fit=crop' },
];

export const METHODS = ['Nita', 'Amana'];
export const BOOKMAKERS = ['1xbet', 'Melbet', 'Betwinner'];

export const ADMIN_CREDENTIALS = {
  id: 'champion',
  password: 'champion2010'
};
