
import React, { useState } from 'react';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { User } from '../types';
import { METHODS, BOOKMAKERS, SUPPORT_PHONE } from '../constants';

interface DepositFormProps {
  user: User;
  onBack: () => void;
  onComplete: () => void;
}

const DepositForm: React.FC<DepositFormProps> = ({ user, onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ amount: '', method: '', bookmaker: '', bookmakerId: '', proofImage: '' });
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!formData.amount || !formData.method || !formData.bookmaker || formData.bookmakerId.length < 5) {
      setError('Veuillez remplir tous les champs correctement.');
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
    if (!formData.proofImage) {
      setError('La preuve de paiement est obligatoire');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "requests"), {
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        type: 'Dépôt',
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
          <div className="absolute inset-0 bg-blue-400 blur-3xl rounded-full opacity-20 scale-150"></div>
          <div className="relative w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-black/20">
            <i className="fas fa-check text-white text-4xl"></i>
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-white text-center mb-3 uppercase tracking-tight">Dépôt Confirmé !</h2>
        <p className="text-white/60 text-center text-sm mb-12 leading-relaxed max-w-[250px]">
          Votre demande de <span className="font-bold text-white">{formData.amount} FCFA</span> a été transmise avec succès.
        </p>

        <div className="w-full space-y-4 max-w-xs">
          <button 
            onClick={onComplete}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-black/20 active:scale-95 transition-all text-xs uppercase tracking-widest"
          >
            Suivre ma demande
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
          <h2 className="text-white font-black text-sm uppercase tracking-widest">Effectuer un Dépôt</h2>
          <div className="flex gap-1.5 mt-2">
            <div className={`h-1 rounded-full transition-all duration-300 ${step >= 1 ? 'w-6 bg-blue-500' : 'w-2 bg-white/10'}`}></div>
            <div className={`h-1 rounded-full transition-all duration-300 ${step >= 2 ? 'w-6 bg-blue-500' : 'w-2 bg-white/10'}`}></div>
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        {step === 1 ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Warning Message adapté */}
            <div className="bg-yellow-400/10 border border-yellow-400/20 p-4 rounded-2xl flex gap-3 items-start">
              <i className="fas fa-info-circle text-yellow-400 mt-1"></i>
              <p className="text-yellow-100 text-[11px] leading-relaxed">
                <span className="font-black uppercase block mb-1">Action requise</span>
                Envoyez d'abord le montant au <span className="font-black text-yellow-400 underline">{SUPPORT_PHONE}</span> avant de valider ce formulaire.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Montant à déposer</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors">
                    <i className="fas fa-coins"></i>
                  </div>
                  <input 
                    type="number" 
                    placeholder="Montant en FCFA" 
                    className="w-full bg-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none border border-white/5 focus:border-blue-500 text-white font-bold transition-all" 
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Bookmaker</label>
                  <select 
                    className="w-full bg-white/5 py-4 px-4 rounded-2xl outline-none border border-white/5 focus:border-blue-500 font-bold text-white transition-all appearance-none" 
                    value={formData.bookmaker} 
                    onChange={e => setFormData({...formData, bookmaker: e.target.value})}
                  >
                    <option value="" className="bg-[#081a2b]">Choisir</option>
                    {BOOKMAKERS.map(b => <option key={b} value={b} className="bg-[#081a2b]">{b}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Méthode</label>
                  <select 
                    className="w-full bg-white/5 py-4 px-4 rounded-2xl outline-none border border-white/5 focus:border-blue-500 font-bold text-white transition-all appearance-none" 
                    value={formData.method} 
                    onChange={e => setFormData({...formData, method: e.target.value})}
                  >
                    <option value="" className="bg-[#081a2b]">Choisir</option>
                    {METHODS.map(m => <option key={m} value={m} className="bg-[#081a2b]">{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">ID Joueur</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors">
                    <i className="fas fa-id-card"></i>
                  </div>
                  <input 
                    type="text" 
                    maxLength={11} 
                    placeholder="11 chiffres requis" 
                    className="w-full bg-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none border border-white/5 focus:border-blue-500 text-white font-bold transition-all" 
                    value={formData.bookmakerId} 
                    onChange={e => setFormData({...formData, bookmakerId: e.target.value.replace(/\D/g, '')})} 
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-red-400 text-center text-[10px] font-black uppercase tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/10">{error}</p>}

            <button 
              onClick={handleNext} 
              className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-black/20 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
            >
              Suivant <i className="fas fa-chevron-right text-[10px]"></i>
            </button>

            {/* Tutoriel Vidéo */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-4 bg-yellow-400 rounded-full"></div>
                <h3 className="text-white font-black text-[10px] uppercase tracking-[0.2em]">Besoin d'aide ? Tutoriel</h3>
              </div>
              
              <div className="w-full overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl bg-black/40 aspect-video relative group">
                <iframe 
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&rel=0" 
                  title="Comment effectuer un dépôt sur Recharge+" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <p className="text-[9px] text-white/30 text-center font-bold uppercase tracking-widest px-4">
                Regardez cette vidéo de 1 minute pour comprendre comment recharger votre compte sans erreur.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-sm space-y-4">
              <h3 className="text-white font-black text-xs uppercase tracking-widest border-b border-white/5 pb-4 flex items-center gap-2">
                <i className="fas fa-file-invoice text-blue-400"></i> Récapitulatif
              </h3>
              <div className="space-y-3 pt-2">
                {[
                  { label: 'Montant', val: formData.amount + ' FCFA' },
                  { label: 'Bookmaker', val: formData.bookmaker },
                  { label: 'ID Joueur', val: formData.bookmakerId },
                  { label: 'Méthode', val: formData.method }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                    <span className="text-white font-black text-sm">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Preuve de transfert (Reçu)</label>
              
              {!formData.proofImage ? (
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col items-center justify-center bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] h-32 text-white/40 active:bg-white/10 active:border-blue-400 transition-all cursor-pointer">
                    <i className="fas fa-camera text-2xl mb-2"></i>
                    <span className="text-[9px] font-black uppercase tracking-widest">Prendre Photo</span>
                    <input type="file" capture="environment" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <label className="flex flex-col items-center justify-center bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] h-32 text-white/40 active:bg-white/10 active:border-blue-400 transition-all cursor-pointer">
                    <i className="fas fa-images text-2xl mb-2"></i>
                    <span className="text-[9px] font-black uppercase tracking-widest">De la Galerie</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              ) : (
                <div className="relative group">
                  <img src={formData.proofImage} className="w-full h-48 object-cover rounded-[2rem] shadow-lg border-2 border-white/10" alt="Reçu" />
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
              {loading ? <i className="fas fa-circle-notch animate-spin"></i> : <><i className="fas fa-paper-plane"></i> Envoyer la demande</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositForm;
