
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDy0Vmvb7OjdhUrGQadDG8ug9vhUzf0PLI",
  authDomain: "recharge-plus-d0d88.firebaseapp.com",
  projectId: "recharge-plus-d0d88",
  storageBucket: "recharge-plus-d0d88.firebasestorage.app",
  messagingSenderId: "14112469524",
  appId: "1:14112469524:web:f50b10363447aa320cad01",
  measurementId: "G-1DHC62RXYG"
};

const app = initializeApp(firebaseConfig);

/**
 * CONFIGURATION ROBUSTE :
 * - experimentalForceLongPolling: Pour passer à travers les réseaux mobiles instables (2G/3G).
 * - cacheSizeBytes: Utilise le stockage local pour éviter de re-télécharger les données (économie de quota).
 */
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false,
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

export const isPlaceholderConfig = false;
