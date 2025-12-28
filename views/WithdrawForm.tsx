
import React, { useState } from 'react';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { User } from '../types';
import { METHODS, BOOKMAKERS } from '../constants';

const compressImage = (base64: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 500;
      const MAX_HEIGHT = 500;
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
      } else {
        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
      }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.4));
    };
    img.onerror = () => resolve(base64);
  });
};

interface WithdrawFormProps {
  user: User;
  onBack: () => void;
  onComplete: () => void;
  onQuotaError: () => void;
}

const WithdrawForm: React.FC<WithdrawFormProps> = ({ user, onBack, onComplete, onQuotaError }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ amount: '', method: '', bookmaker: '', bookmakerId: '', withdrawCode: '', proofImage: '' });
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!formData.amount || !formData.method || !formData.bookmaker || formData.withdrawCode.length < 4) {
      setError('Remplissez tous les champs obligatoires.');
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
    setError('');
    setLoading(true);

    try {
      await addDoc(collection(db, "requests"), {
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        type: 'Retrait',
        status: 'En attente',
        amount: formData.amount,
        method: formData.method,
        bookmaker: formData.bookmaker,
        bookmakerId: formData.bookmakerId,
        withdrawCode: formData.withdrawCode,
        proofImage: formData.proofImage,
        createdAt: Date.now()
      });
      setStep(3);
    } catch (err: any) {
      if (err?.code === 'resource-exhausted') onQuotaError();
      else setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="flex-1 bg-[#FACC15] flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6">
          <i className="fas fa-hourglass-half text-blue-600 text-4xl animate-pulse"></i>
        </div>
        <h2 className="text-xl font-black text-slate-900 uppercase">Demande Reçue</h2>
        <p className="text-slate-700 text-center text-xs mt-2 font-bold opacity-60">Paiement via {formData.method} sous peu.</p>
        <button onClick={onComplete} className="mt-10 w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl">Suivre l'opération</button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FACC15] flex flex-col h-full overflow-hidden">
      <div className="px-6 pt-12 pb-6 flex items-center gap-4">
        <button onClick={step === 1 ? onBack : () => setStep(1)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 border border-white shadow-sm active:scale-90 transition-all">
          <i className={`fas ${step === 1 ? 'fa-times' : 'fa-arrow-left'}`}></i>
        </button>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Retirer Gains</h2>
      </div>

      <div className="flex-1 bg-white/40 backdrop-blur-xl rounded-t-[3.5rem] p-6 overflow-y-auto no-scrollbar border-t-4 border-white">
        {step === 1 ? (
          <div className="space-y-6">
            <div className="bg-blue-600 p-5 rounded-3xl border border-blue-500 shadow-xl text-white">
               <div className="flex items-center gap-3 mb-2">
                 <i className="fas fa-shield-alt text-sm"></i>
                 <span className="text-[10px] font-black uppercase">Sécurité</span>
               </div>
               <p className="text-[11px] font-bold opacity-80 leading-relaxed">
                 Générez votre code de retrait sur votre appli bookmaker avant de remplir ce formulaire.
               </p>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-white shadow-xl space-y-4">
               <div>
                  <label className="text-[8px] font-black uppercase text-slate-300 ml-4 mb-1 block tracking-widest">Montant du Code (F)</label>
                  <input type="number" placeholder="Somme à recevoir" className="w-full bg-slate-50 py-4 px-6 rounded-2xl outline-none border border-slate-100 font-bold text-slate-900 focus:border-blue-500 transition-all" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
               </div>

               <div>
                  <label className="text-[8px] font-black uppercase text-slate-300 ml-4 mb-1 block tracking-widest">Bookmaker</label>
                  <select className="w-full bg-slate-50 py-4 px-6 rounded-2xl outline-none border border-slate-100 font-bold text-slate-900 text-xs" value={formData.bookmaker} onChange={e => setFormData({...formData, bookmaker: e.target.value})}>
                    <option value="">Choisir...</option>
                    {BOOKMAKERS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
               </div>

               <div>
                  <label className="text-[8px] font-black uppercase text-slate-300 ml-4 mb-1 block tracking-widest">Code de Retrait</label>
                  <input type="text" placeholder="Entrez le code ici" className="w-full bg-blue-50 py-4 px-6 rounded-2xl outline-none border border-blue-100 font-black text-blue-600 tracking-widest focus:border-blue-500 transition-all uppercase" value={formData.withdrawCode} onChange={e => setFormData({...formData, withdrawCode: e.target.value.toUpperCase()})} />
               </div>

               <div>
                  <label className="text-[8px] font-black uppercase text-slate-300 ml-4 mb-1 block tracking-widest">Recevoir par</label>
                  <select className="w-full bg-slate-50 py-4 px-6 rounded-2xl outline-none border border-slate-100 font-bold text-slate-900 text-xs" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
                    <option value="">Choisir...</option>
                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </div>
            </div>

            {error && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest">{error}</p>}

            <button onClick={handleNext} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Continuer</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-white shadow-xl flex flex-col items-center">
              <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 text-center">Capture du code (Facultatif mais recommandé)</h3>
              
              {!formData.proofImage ? (
                <label className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 active:bg-blue-50 transition-colors cursor-pointer text-slate-300">
                  <i className="fas fa-camera text-2xl"></i>
                  <span className="text-[8px] font-black uppercase">Prendre la photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              ) : (
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-slate-100 shadow-inner">
                  <img src={formData.proofImage} className="w-full h-full object-cover" alt="Capture Code" />
                  <button onClick={() => setFormData({...formData, proofImage: ''})} className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-lg active:scale-90 border-2 border-white"><i className="fas fa-times text-xs"></i></button>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest">{error}</p>}

            <button onClick={handleSubmit} disabled={loading} className="w-full bg-[#0047FF] text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
              {loading ? <i className="fas fa-circle-notch animate-spin"></i> : <><i className="fas fa-check-circle"></i> Valider le retrait</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawForm;
