
import { BannerItem } from './types';

export const COLORS = {
  primary: '#1d4ed8', // Bleu Royal
  secondary: '#facc15', // Jaune Or
  accent: '#f97316', // Orange
  success: '#2ecc71', // Vert Émeraude
  danger: '#e74c3c', // Rouge Alerte
  backgroundUser: '#081a2b', // Fond plus sombre et premium
  backgroundAdmin: '#081a2b',
  darkNav: '#04111d'
};

/**
 * CONFIGURATION DES ASSETS
 * Note: Le répertoire racine est considéré comme votre dossier source ('src').
 * Créez un dossier 'logos' et un dossier 'banners' à la racine.
 */
export const ASSETS = {
  logo: 'logos/logo.png',
  logoAdmin: 'logos/logo_admin.png', // Optionnel : un logo différent pour l'admin
};

export const MOCK_BANNERS: BannerItem[] = [
  { 
    id: '1', 
    image: 'banners/banner1.jpg' 
  },
  { 
    id: '2', 
    image: 'banners/banner2.jpg' 
  },
  { 
    id: '3', 
    image: 'banners/banner3.jpg' 
  },
];

export const SUPPORT_PHONE = "91 11 58 58";
export const SUPPORT_PHONE_FULL = "+227 91 11 58 58";

export const METHODS = ['Nita', 'Amana'];
export const BOOKMAKERS = ['1xbet', 'Melbet', 'Betwinner'];

export const ADMIN_CREDENTIALS = {
  id: 'champion',
  password: 'champion2010'
};
