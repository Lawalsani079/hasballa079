
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
    if (!formData.amount || !formData.method || !formData.bookmaker || formData.bookmakerId.length !== 11) {
      setError('Veuillez remplir tous les champs correctement (ID 11 chiffres)');
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
    if (!formData.withdrawCode) {
      setError('Le code de retrait est obligatoire');
      return;
    }
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

  // Étape 3: Écran de Succès
  if (step === 3) {
    return (
      <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
        <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-200">
            <i className="fas fa-check text-white text-4xl"></i>
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-blue-900 text-center mb-2 uppercase tracking-tight">Demande Envoyée !</h2>
        <p className="text-gray-500 text-center text-sm mb-10 leading-relaxed px-4">
          Votre demande de retrait de <span className="font-bold text-blue-900">{formData.amount} FCFA</span> a été transmise. Nos agents valident votre demande sous peu.
        </p>

        <div className="w-full space-y-4">
          <button 
            onClick={onComplete}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-blue-100 active:scale-95 transition-transform"
          >
            VOIR L'HISTORIQUE
          </button>
          <button 
            onClick={onBack}
            className="w-full bg-gray-100 text-gray-500 font-bold py-4 rounded-[2rem] active:scale-95 transition-transform"
          >
            RETOUR À L'ACCUEIL
          </button>
        </div>
      </div>
    );
  }

  // Étape 2: Saisie du Code + Récapitulatif
  if (step === 2) {
    return (
      <div className="flex-1 bg-blue-900 flex flex-col">
        <div className="p-6 flex items-center gap-4 text-white">
          <button onClick={() => setStep(1)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><i className="fas fa-arrow-left"></i></button>
          <h2 className="font-bold">Détails du Retrait</h2>
        </div>
        <div className="px-6 flex-1 overflow-y-auto pb-24">
          {/* Récapitulatif Rapide */}
          <div className="bg-white/10 border border-white/10 rounded-[2rem] p-5 mb-6 flex justify-between items-center">
             <div>
               <p className="text-orange-300 text-[10px] font-black uppercase tracking-widest">Montant</p>
               <p className="text-white font-black text-xl">{formData.amount} FCFA</p>
             </div>
             <div className="text-right">
               <p className="text-orange-300 text-[10px] font-black uppercase tracking-widest">ID Joueur</p>
               <p className="text-white font-bold text-sm">{formData.bookmakerId}</p>
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 mb-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <p className="text-gray-400 text-[10px] font-bold text-center uppercase tracking-widest mb-2">Code de retrait bookmaker</p>
            <div className="relative">
               <input 
                type="text" 
                placeholder="ABC123XYZ" 
                className="w-full bg-gray-50 p-5 rounded-2xl font-black text-center text-2xl tracking-[0.3em] outline-none focus:ring-2 focus:ring-orange-500 text-blue-900 uppercase placeholder:text-gray-200" 
                value={formData.withdrawCode} 
                onChange={e => setFormData({...formData, withdrawCode: e.target.value.toUpperCase()})} 
              />
            </div>
          </div>

          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-camera text-orange-400"></i>
            Capture d'écran (Optionnel)
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <label className="bg-white/10 border-2 border-dashed border-white/20 rounded-[2rem] h-28 flex flex-col items-center justify-center text-white cursor-pointer active:scale-95 transition-all">
              <i className="fas fa-camera-retro text-2xl mb-1"></i>
              <span className="text-[10px] font-bold uppercase tracking-widest">Appareil</span>
              <input type="file" capture="environment" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <label className="bg-white/10 border-2 border-dashed border-white/20 rounded-[2rem] h-28 flex flex-col items-center justify-center text-white cursor-pointer active:scale-95 transition-all">
              <i className="fas fa-images text-2xl mb-1"></i>
              <span className="text-[10px] font-bold uppercase tracking-widest">Galerie</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          {formData.proofImage && (
            <div className="relative mb-6 group">
              <img src={formData.proofImage} className="w-full h-48 object-cover rounded-[2rem] shadow-2xl border-4 border-white/10" alt="Capture" />
              <button onClick={() => setFormData({...formData, proofImage: ''})} className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center"><i className="fas fa-times"></i></button>
            </div>
          )}
          
          {error && <div className="bg-red-500/20 border border-red-500/40 p-4 rounded-2xl mb-4"><p className="text-red-300 text-center text-xs font-bold">{error}</p></div>}

          <button onClick={handleSubmit} disabled={loading} className="w-full bg-orange-500 text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-orange-900/40 active:scale-95 transition-transform flex items-center justify-center gap-3">
            {loading ? <i className="fas fa-circle-notch animate-spin"></i> : <><i className="fas fa-paper-plane"></i> CONFIRMER LE RETRAIT</>}
          </button>
        </div>
      </div>
    );
  }

  // Étape 1: Formulaire principal
  return (
    <div className="flex-1 bg-blue-900 flex flex-col">
      <div className="p-6 flex items-center gap-4 text-white">
        <button onClick={onBack} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><i className="fas fa-arrow-left"></i></button>
        <h2 className="font-bold text-lg">Retrait de fonds</h2>
      </div>

      <div className="px-6 mb-4">
        <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-[1.5rem] flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
             <i className="fas fa-info text-white text-xs"></i>
          </div>
          <p className="text-white text-[10px] leading-relaxed">Les retraits sont traités sous 30 min. Saisissez votre <span className="font-bold underline">ID Joueur</span> exact.</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-t-[3rem] p-8 mt-4 overflow-y-auto pb-24 shadow-inner">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest px-2">Montant (FCFA)</label>
            <input type="number" placeholder="0.00" className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-blue-900 transition-all" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest px-2">Bookmaker</label>
            <select className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-blue-900 appearance-none transition-all" value={formData.bookmaker} onChange={e => setFormData({...formData, bookmaker: e.target.value})}>
              <option value="">Sélectionner</option>
              {BOOKMAKERS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest px-2">Recevoir par</label>
            <select className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-blue-900 appearance-none transition-all" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
              <option value="">Sélectionner</option>
              {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest px-2">ID Joueur (11 chiffres) *</label>
            <input 
              type="text" 
              maxLength={11} 
              placeholder="Ex: 12345678901" 
              className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-blue-900 transition-all" 
              value={formData.bookmakerId} 
              onChange={e => setFormData({...formData, bookmakerId: e.target.value.replace(/\D/g, '')})} 
            />
          </div>

          {error && <p className="text-red-500 text-center text-[10px] font-bold bg-red-50 py-2 rounded-xl border border-red-100 uppercase tracking-tighter">{error}</p>}
          
          <button onClick={handleNext} className="w-full bg-orange-500 text-white font-black py-5 rounded-[2rem] shadow-lg shadow-orange-100 active:scale-95 transition-transform flex items-center justify-center gap-2">
            SUIVANT <i className="fas fa-arrow-right text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawForm;
