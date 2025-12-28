
import React, { useState } from 'react';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { User } from '../types';
import { METHODS } from '../constants';

interface CryptoFormProps {
  user: User;
  onBack: () => void;
  onComplete: () => void;
  onQuotaError: () => void;
}

const CRYPTOS = ['USDT (TRC20)', 'Bitcoin (BTC)', 'Ethereum (ETH)', 'Binance Coin (BNB)'];

const compressImage = (base64: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 600; const MAX_HEIGHT = 600;
      let width = img.width; let height = img.height;
      if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
      else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };
    img.onerror = () => resolve(base64);
  });
};

const CryptoForm: React.FC<CryptoFormProps> = ({ user, onBack, onComplete, onQuotaError }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ amount: '', method: '', cryptoType: '', walletAddress: '', proofImage: '' });
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!formData.amount || !formData.method || !formData.cryptoType || formData.walletAddress.length < 10) {
      setError('Complétez tous les champs obligatoires.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressed = await compressImage(reader.result as string);
          setFormData({ ...formData, proofImage: compressed });
        } catch (e) {
          setError("Erreur image.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.proofImage) {
      setError('La preuve de paiement est obligatoire');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const payload = {
        userId: String(user.id),
        userName: String(user.name),
        userPhone: String(user.phone),
        type: 'Crypto',
        status: 'En attente',
        amount: String(formData.amount),
        method: String(formData.method),
        cryptoType: String(formData.cryptoType),
        walletAddress: String(formData.walletAddress),
        proofImage: String(formData.proofImage),
        createdAt: Date.now()
      };

      await addDoc(collection(db, "requests"), payload);
      setStep(3);
    } catch (err: any) {
      if (err?.code === 'resource-exhausted') {
        onQuotaError();
      } else {
        setError("L'envoi a échoué. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="flex-1 bg-[#FACC15] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-8 border-4 border-white/50">
          <i className="fas fa-rocket text-emerald-500 text-4xl"></i>
        </div>
        <h2 className="text-2xl font-black text-slate-900 text-center mb-3 uppercase tracking-tight">C'est fait !</h2>
        <p className="text-slate-900/60 text-center text-[12px] mb-12 uppercase font-black tracking-widest leading-relaxed">
          Transfert de votre <span className="text-emerald-600 font-black">{formData.cryptoType}</span> en cours.
        </p>
        <button onClick={onComplete} className="w-full bg-[#0047FF] text-white font-black py-6 rounded-3xl text-[11px] uppercase tracking-widest shadow-2xl">VOIR HISTORIQUE</button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FACC15] flex flex-col overflow-hidden h-full">
      <div className="px-6 pt-12 pb-8 flex items-center justify-between z-20">
        <button onClick={step === 1 ? onBack : () => setStep(1)} className="w-12 h-12 flex items-center justify-center bg-white/40 backdrop-blur-md rounded-2xl text-slate-900 active:scale-90 border border-white/50"><i className={`fas ${step === 1 ? 'fa-times' : 'fa-chevron-left'}`}></i></button>
        <div className="text-right">
           <h2 className="text-slate-900 font-black text-[13px] uppercase tracking-[0.1em] leading-none">Formulaire</h2>
           <p className="text-emerald-600 font-black text-[9px] uppercase tracking-[0.3em] mt-1">Achat Crypto</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-t-[3.5rem] overflow-y-auto px-6 py-10 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] no-scrollbar">
        {step === 1 ? (
          <div className="space-y-8">
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2.5rem] flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-coins"></i>
              </div>
              <p className="text-slate-900 text-[10px] font-black leading-relaxed">Achetez vos cryptos au meilleur taux du Niger. Livraison sur votre wallet en 5 minutes.</p>
            </div>

            <div className="space-y-5">
              <div className="relative">
                <select className="w-full bg-slate-50 py-5 px-6 rounded-[2rem] outline-none border border-slate-100 font-black text-slate-900 text-xs appearance-none" value={formData.cryptoType} onChange={e => setFormData({...formData, cryptoType: e.target.value})}>
                  <option value="">Sélectionner Crypto</option>
                  {CRYPTOS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <i className="fas fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 text-[10px] pointer-events-none"></i>
              </div>

              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xs">F</span>
                <input type="number" placeholder="Montant à investir (FCFA)" className="w-full bg-slate-50 py-5 pl-12 pr-6 rounded-[2rem] outline-none border border-slate-100 text-slate-900 font-black text-sm" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>

              <div className="relative">
                <select className="w-full bg-slate-50 py-5 px-6 rounded-[2rem] outline-none border border-slate-100 font-black text-slate-900 text-xs appearance-none" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
                  <option value="">Méthode de paiement</option>
                  {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <i className="fas fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 text-[10px] pointer-events-none"></i>
              </div>

              <div className="relative">
                <i className="fas fa-wallet absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500"></i>
                <input type="text" placeholder="Votre Adresse Wallet" className="w-full bg-slate-50 py-5 pl-14 pr-6 rounded-[2rem] outline-none border border-slate-100 text-slate-900 font-black text-sm" value={formData.walletAddress} onChange={e => setFormData({...formData, walletAddress: e.target.value})} />
              </div>
            </div>

            {error && <p className="text-red-500 text-center text-[10px] font-black uppercase tracking-widest bg-red-50 py-4 rounded-2xl border border-red-100">{error}</p>}
            <button onClick={handleNext} className="w-full bg-[#0047FF] text-white font-black py-6 rounded-[2rem] text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-2xl">SUIVANT</button>
          </div>
        ) : (
          <div className="space-y-10 animate-in slide-in-from-right duration-500">
            <div className="text-center space-y-3">
              <h3 className="text-slate-900 font-black text-xl uppercase tracking-tight">Reçu de paiement</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-8">Envoyez la preuve du transfert Nita/Amana</p>
            </div>

            {!formData.proofImage ? (
              <div className="grid grid-cols-2 gap-4 h-48">
                <label className="flex flex-col items-center justify-center bg-slate-50 border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300 cursor-pointer active:bg-emerald-50 transition-all group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-lg group-active:scale-90 transition-transform">
                    <i className="fas fa-camera text-2xl text-emerald-500"></i>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Caméra</span>
                  <input type="file" capture="environment" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <label className="flex flex-col items-center justify-center bg-slate-50 border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300 cursor-pointer active:bg-emerald-50 transition-all group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-lg group-active:scale-90 transition-transform">
                    <i className="fas fa-images text-2xl text-emerald-500"></i>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Galerie</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            ) : (
              <div className="relative animate-in zoom-in">
                <img src={formData.proofImage} className="w-full h-72 object-cover rounded-[3rem] border-4 border-slate-50 shadow-2xl" alt="Reçu" />
                <button onClick={() => setFormData({...formData, proofImage: ''})} className="absolute top-6 right-6 bg-red-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center active:scale-90 border-2 border-white shadow-xl"><i className="fas fa-times"></i></button>
              </div>
            )}

            {error && <p className="text-red-500 text-center text-[10px] font-black uppercase tracking-widest bg-red-50 py-4 rounded-2xl border border-red-100">{error}</p>}
            
            <button onClick={handleSubmit} disabled={loading} className="w-full bg-emerald-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl active:scale-95 transition-all text-[11px] uppercase tracking-widest flex items-center justify-center gap-4">
              {loading ? <><i className="fas fa-circle-notch animate-spin"></i> ENVOI...</> : <><i className="fas fa-check-circle"></i> PAYER & RECEVOIR</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoForm;
