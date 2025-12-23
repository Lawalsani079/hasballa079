
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * Configuration Firebase officielle du projet "recharge-a1d14".
 * Assurez-vous que les règles Firestore sur console.firebase.google.com sont :
 * allow read, write: if true; (ou selon vos besoins de sécurité)
 */
const firebaseConfig = {
  apiKey: "AIzaSyC8ahCCT_FSH5vk2zq5wCryUG75_1q-4jA",
  authDomain: "recharge-a1d14.firebaseapp.com",
  projectId: "recharge-a1d14",
  storageBucket: "recharge-a1d14.firebasestorage.app",
  messagingSenderId: "487276356058",
  appId: "1:487276356058:web:e0f0348338f705efc920e3",
  measurementId: "G-TFLHLB8H68"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Vérification de sécurité pour s'assurer qu'on n'utilise plus l'ID de démonstration
export const isPlaceholderConfig = firebaseConfig.projectId === "recharge-plus-demo";
