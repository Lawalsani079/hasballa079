
import React, { useState } from 'react';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { User } from '../types';
import { METHODS, BOOKMAKERS } from '../constants';

interface WithdrawFormProps {
  user: User;
  onBack: () => void;
  onComplete: () => void;
}

const WithdrawForm: React.FC<WithdrawFormProps> = ({ user, onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    amount: '', 
    method: '', 
    bookmaker: '', 
    bookmakerId: '',
    withdrawCode: '',
    proofImage: '' 
  });
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!formData.amount || !formData.method || !formData.bookmaker || formData.withdrawCode.length < 4) {
      setError('Veuillez remplir tous les champs (Montant, Bookmaker, Méthode et Code).');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, proofImage: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, "requests"), {
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        type: 'Retrait',
        status: 'En attente',
        createdAt: Date.now(),
        ...formData
      });
      setStep(3);
    } catch (err) {
      setError('Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="flex-1 bg-[#081a2b] flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-yellow-400 blur-3xl rounded-full opacity-20 scale-150"></div>
          <div className="relative w-24 h-24 bg-yellow-400 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-black/20">
            <i className="fas fa-check text-[#081a2b] text-4xl"></i>
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-white text-center mb-3 uppercase tracking-tight">Retrait Envoyé !</h2>
        <p className="text-white/60 text-center text-sm mb-12 leading-relaxed max-w-[250px]">
          Votre demande de retrait de <span className="font-bold text-white">{formData.amount} FCFA</span> avec le code <span className="font-bold text-yellow-400">{formData.withdrawCode}</span> est en attente.
        </p>

        <div className="w-full space-y-4 max-w-xs">
          <button 
            onClick={onComplete}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-black/20 active:scale-95 transition-all text-xs uppercase tracking-widest"
          >
            Historique des gains
          </button>
          <button 
            onClick={onBack}
            className="w-full text-white/40 font-bold py-2 active:scale-95 transition-all text-[10px] uppercase tracking-widest"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#081a2b] flex flex-col overflow-hidden">
      {/* Header adapté */}
      <div className="bg-[#081a2b] px-6 pt-12 pb-6 flex items-center justify-between border-b border-white/5">
        <button onClick={step === 1 ? onBack : () => setStep(1)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-white active:scale-90 transition-all">
          <i className={`fas ${step === 1 ? 'fa-times' : 'fa-chevron-left'}`}></i>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-white font-black text-sm uppercase tracking-widest">Retrait de fonds</h2>
          <div className="flex gap-1.5 mt-2">
            <div className={`h-1 rounded-full transition-all duration-300 ${step >= 1 ? 'w-6 bg-yellow-400' : 'w-2 bg-white/10'}`}></div>
            <div className={`h-1 rounded-full transition-all duration-300 ${step >= 2 ? 'w-6 bg-yellow-400' : 'w-2 bg-white/10'}`}></div>
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        {step === 1 ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-600 p-5 rounded-[2rem] shadow-lg shadow-black/20 relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white text-xl">
                  <i className="fas fa-wallet"></i>
                </div>
                <div>
                  <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Disponibilité</p>
                  <p className="text-white font-black text-lg">Retraits 24h/7j</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Montant à retirer</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-yellow-400 transition-colors">
                    <i className="fas fa-money-bill-wave"></i>
                  </div>
                  <input 
                    type="number" 
                    placeholder="Montant en FCFA" 
                    className="w-full bg-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none border border-white/5 focus:border-yellow-400 text-white font-bold transition-all" 
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Bookmaker</label>
                  <select 
                    className="w-full bg-white/5 py-4 px-4 rounded-2xl outline-none border border-white/5 focus:border-yellow-400 font-bold text-white transition-all appearance-none" 
                    value={formData.bookmaker} 
                    onChange={e => setFormData({...formData, bookmaker: e.target.value})}
                  >
                    <option value="" className="bg-[#081a2b]">Choisir</option>
                    {BOOKMAKERS.map(b => <option key={b} value={b} className="bg-[#081a2b]">{b}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Recevoir sur</label>
                  <select 
                    className="w-full bg-white/5 py-4 px-4 rounded-2xl outline-none border border-white/5 focus:border-yellow-400 font-bold text-white transition-all appearance-none" 
                    value={formData.method} 
                    onChange={e => setFormData({...formData, method: e.target.value})}
                  >
                    <option value="" className="bg-[#081a2b]">Choisir</option>
                    {METHODS.map(m => <option key={m} value={m} className="bg-[#081a2b]">{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Code de retrait</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-yellow-400 transition-colors">
                    <i className="fas fa-key"></i>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Entrez votre code" 
                    className="w-full bg-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none border border-white/5 focus:border-yellow-400 text-white font-black transition-all uppercase tracking-widest" 
                    value={formData.withdrawCode} 
                    onChange={e => setFormData({...formData, withdrawCode: e.target.value.toUpperCase()})} 
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-red-400 text-center text-[10px] font-black uppercase tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/10">{error}</p>}

            <button 
              onClick={handleNext} 
              className="w-full bg-yellow-400 text-[#081a2b] font-black py-5 rounded-2xl shadow-xl shadow-black/20 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
            >
              Étape suivante <i className="fas fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Confirmation du Code</p>
                <div className="w-full bg-white/5 py-6 px-4 rounded-2xl border border-dashed border-white/10 font-black text-yellow-400 text-3xl text-center uppercase tracking-widest">
                  {formData.withdrawCode}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                 <div className="flex justify-between">
                   <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Destination</span>
                   <span className="text-white font-black text-xs uppercase">{formData.method} - {user.phone}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Montant brut</span>
                   <span className="text-white font-black text-xs">{formData.amount} FCFA</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Bookmaker</span>
                   <span className="text-white font-black text-xs uppercase">{formData.bookmaker}</span>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Capture du code (optionnel)</label>
              
              {!formData.proofImage ? (
                <label className="flex flex-col items-center justify-center bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] h-32 text-white/40 active:bg-white/10 active:border-yellow-400 transition-all cursor-pointer">
                  <i className="fas fa-camera-retro text-2xl mb-2"></i>
                  <span className="text-[9px] font-black uppercase tracking-widest">Joindre une capture</span>
                  <input type="file" capture="environment" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              ) : (
                <div className="relative group">
                  <img src={formData.proofImage} className="w-full h-48 object-cover rounded-[2rem] shadow-lg border-2 border-white/10" alt="Capture" />
                  <button onClick={() => setFormData({...formData, proofImage: ''})} className="absolute top-4 right-4 bg-red-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>

            {error && <p className="text-red-400 text-center text-[10px] font-black uppercase tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/10">{error}</p>}

            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-black/20 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
            >
              {loading ? <i className="fas fa-circle-notch animate-spin"></i> : <><i className="fas fa-check-circle"></i> Confirmer le retrait</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawForm;
