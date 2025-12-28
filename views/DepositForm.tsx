
import React, { useState } from 'react';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { User } from '../types';
import { METHODS, BOOKMAKERS, SUPPORT_PHONE } from '../constants';

// Optimisation Photo : Résolution 1200px pour lire parfaitement le texte du reçu
const compressImage = (base64: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200; 
      const MAX_HEIGHT = 1600; 
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
      } else {
        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
      }
      // Qualité 0.7 : Compromis parfait entre netteté et poids (~350Ko max)
      resolve(canvas.toDataURL('image/jpeg', 0.7)); 
    };
    img.onerror = () => resolve(base64);
  });
};

interface DepositFormProps {
  user: User;
  onBack: () => void;
  onComplete: () => void;
  onQuotaError: () => void;
}

const DepositForm: React.FC<DepositFormProps> = ({ user, onBack, onComplete, onQuotaError }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ amount: '', method: '', bookmaker: '', bookmakerId: '', proofImage: '' });
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!formData.amount || !formData.method || !formData.bookmaker || formData.bookmakerId.length < 5) {
      setError('Remplissez tous les champs obligatoires.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { setError("Fichier trop lourd (>10Mo)"); return; }
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressed = await compressImage(reader.result as string);
          setFormData({ ...formData, proofImage: compressed });
        } catch (err) {
          setError("Échec de compression.");
        } finally { setLoading(false); }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.proofImage) { setError('Photo du reçu obligatoire'); return; }
    setError('');
    setLoading(true);

    try {
      await addDoc(collection(db, "requests"), {
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        type: 'Dépôt',
        status: 'En attente',
        amount: formData.amount,
        method: formData.method,
        bookmaker: formData.bookmaker,
        bookmakerId: formData.bookmakerId,
        proofImage: formData.proofImage,
        createdAt: Date.now()
      });
      setStep(3);
    } catch (err: any) {
      if (err?.code === 'resource-exhausted') onQuotaError();
      else setError("Erreur serveur, réessayez.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="flex-1 bg-[#FACC15] flex flex-col items-center justify-center p-8 animate-in fade-in">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6">
          <i className="fas fa-paper-plane text-blue-600 text-3xl animate-bounce"></i>
        </div>
        <h2 className="text-xl font-black text-slate-900 uppercase">Demande Envoyée</h2>
        <p className="text-slate-700 text-center text-xs mt-3 font-bold opacity-60 px-6">L'admin vérifie votre reçu haute définition. <br/>Délai estimé: 5-10 min.</p>
        <button onClick={onComplete} className="mt-12 w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl">VOIR ACTIVITÉ</button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FACC15] flex flex-col h-full overflow-hidden">
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={step === 1 ? onBack : () => setStep(1)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 border border-white active:scale-90 transition-all">
            <i className={`fas ${step === 1 ? 'fa-times' : 'fa-arrow-left'}`}></i>
          </button>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Déposer Cash</h2>
        </div>
        <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase">Étape {step}/2</div>
      </div>

      <div className="flex-1 bg-white rounded-t-[3.5rem] p-8 overflow-y-auto no-scrollbar shadow-[0_-20px_40px_rgba(0,0,0,0.05)] border-t-4 border-white">
        {step === 1 ? (
          <div className="space-y-6">
            <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 flex items-start gap-4 shadow-sm">
               <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200"><i className="fas fa-info-circle"></i></div>
               <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                 Envoyez le montant sur <span className="text-blue-700 font-black">{SUPPORT_PHONE}</span> (Nita/Amana) puis joignez le reçu original à l'étape suivante.
               </p>
            </div>

            <div className="space-y-4">
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[8px] font-black uppercase text-slate-400 ml-2 mb-1 block tracking-widest">Somme Transférée (FCFA)</label>
                  <input type="number" placeholder="2500, 5000, 10000..." className="w-full bg-transparent py-2 text-slate-900 font-black text-sm outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[8px] font-black uppercase text-slate-400 ml-2 mb-1 block tracking-widest">Bookmaker Cible</label>
                  <select className="w-full bg-transparent py-2 text-slate-900 font-black text-sm outline-none" value={formData.bookmaker} onChange={e => setFormData({...formData, bookmaker: e.target.value})}>
                    <option value="">Sélectionner...</option>
                    {BOOKMAKERS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[8px] font-black uppercase text-slate-400 ml-2 mb-1 block tracking-widest">ID Joueur</label>
                  <input type="text" placeholder="Entrez votre ID bookmaker" className="w-full bg-transparent py-2 text-slate-900 font-black text-sm outline-none" value={formData.bookmakerId} onChange={e => setFormData({...formData, bookmakerId: e.target.value})} />
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[8px] font-black uppercase text-slate-400 ml-2 mb-1 block tracking-widest">Guichet utilisé</label>
                  <select className="w-full bg-transparent py-2 text-slate-900 font-black text-sm outline-none" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
                    <option value="">Sélectionner...</option>
                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </div>
            </div>
            {error && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest bg-red-50 py-3 rounded-xl">{error}</p>}
            <button onClick={handleNext} className="w-full bg-[#0047FF] text-white font-black py-5 rounded-2xl text-[10px] uppercase shadow-xl active:scale-95 transition-all tracking-[0.2em]">ÉTAPE SUIVANTE</button>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div className="text-center">
               <h3 className="text-slate-900 font-black text-lg uppercase tracking-tighter">Preuve de Paiement</h3>
               <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-widest">Haute résolution requise</p>
            </div>

            <div className="bg-slate-50 p-8 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center shadow-inner group">
              {!formData.proofImage ? (
                <div className="grid grid-cols-2 gap-4 w-full h-44">
                  <label className="bg-white rounded-[2rem] flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm border border-slate-100 active:bg-blue-50 transition-all">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner"><i className="fas fa-camera text-xl"></i></div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Appareil</span>
                    <input type="file" capture="environment" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <label className="bg-white rounded-[2rem] flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm border border-slate-100 active:bg-blue-50 transition-all">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner"><i className="fas fa-images text-xl"></i></div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Galerie</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              ) : (
                <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden border-2 border-white shadow-2xl">
                  <img src={formData.proofImage} className="w-full h-full object-cover" alt="Reçu Haute Qualité" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                  <button onClick={() => setFormData({...formData, proofImage: ''})} className="absolute top-4 right-4 bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-xl active:scale-90 border-2 border-white"><i className="fas fa-times"></i></button>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex gap-3">
               <i className="fas fa-shield-check text-yellow-600 mt-1"></i>
               <p className="text-[9px] font-bold text-yellow-800 leading-relaxed uppercase tracking-tighter">
                 En cliquant sur confirmer, vous attestez avoir envoyé l'argent. Toute fausse preuve entraînera un bannissement définitif.
               </p>
            </div>

            {error && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest">{error}</p>}
            
            <button onClick={handleSubmit} disabled={loading} className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl text-[10px] uppercase shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all tracking-[0.25em]">
              {loading ? <i className="fas fa-circle-notch animate-spin text-lg"></i> : <><i className="fas fa-check-circle"></i> CONFIRMER DÉPÔT</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositForm;
