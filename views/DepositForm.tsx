
import React, { useState } from 'react';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { User } from '../types';
import { METHODS, BOOKMAKERS } from '../constants';

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

  // Étape 3: Succès
  if (step === 3) {
    return (
      <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
        <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
            <i className="fas fa-check text-white text-4xl"></i>
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-blue-900 text-center mb-2 uppercase tracking-tight">Dépôt Envoyé !</h2>
        <p className="text-gray-500 text-center text-sm mb-10 leading-relaxed px-4">
          Votre demande de recharge de <span className="font-bold text-blue-900">{formData.amount} FCFA</span> est en cours de traitement. 
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

  if (step === 2) {
    return (
      <div className="flex-1 bg-blue-900 flex flex-col">
        <div className="p-6 flex items-center gap-4 text-white">
          <button onClick={() => setStep(1)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><i className="fas fa-arrow-left"></i></button>
          <h2 className="font-bold">Confirmation</h2>
        </div>
        <div className="px-6 flex-1 overflow-y-auto pb-24">
          <div className="bg-white rounded-[2rem] p-6 mb-6 space-y-4 shadow-2xl">
            {Object.entries({
              'Montant': formData.amount + ' FCFA',
              'Bookmaker': formData.bookmaker,
              'ID': formData.bookmakerId,
              'Méthode': formData.method
            }).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{k}</span>
                <span className="font-bold text-blue-900">{v}</span>
              </div>
            ))}
          </div>

          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-camera text-yellow-400"></i>
            Téléverser le reçu *
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
             <div className="relative mb-6">
                <img src={formData.proofImage} className="w-full h-48 object-cover rounded-[2rem] shadow-2xl border-4 border-white/10" alt="Reçu" />
                <button onClick={() => setFormData({...formData, proofImage: ''})} className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center"><i className="fas fa-times"></i></button>
             </div>
          )}
          
          {error && <div className="bg-red-500/20 border border-red-500/40 p-4 rounded-2xl mb-4"><p className="text-red-300 text-center text-xs font-bold">{error}</p></div>}

          <button onClick={handleSubmit} disabled={loading} className="w-full bg-yellow-400 text-blue-900 font-black py-5 rounded-[2rem] shadow-xl shadow-yellow-900/20 active:scale-95 transition-transform flex items-center justify-center gap-3">
            {loading ? <i className="fas fa-circle-notch animate-spin"></i> : <><i className="fas fa-paper-plane"></i> ENVOYER LA DEMANDE</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-blue-900 flex flex-col">
      <div className="p-6 flex items-center gap-4 text-white">
        <button onClick={onBack} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><i className="fas fa-arrow-left"></i></button>
        <h2 className="font-bold">Dépôt rapide</h2>
      </div>

      <div className="px-6 mb-4">
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-[1.5rem]">
          <p className="text-white text-xs text-center"><span className="font-bold text-red-400 uppercase tracking-tighter">Important:</span> Effectuez le transfert au <span className="underline font-black text-white">91115848</span> avant de remplir ce formulaire.</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-t-[3rem] p-8 mt-4 overflow-y-auto pb-24 shadow-inner">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest px-2">Montant (FCFA)</label>
            <input type="number" placeholder="0.00" className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-900 transition-all" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest px-2">Bookmaker</label>
            <select className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-900 appearance-none" value={formData.bookmaker} onChange={e => setFormData({...formData, bookmaker: e.target.value})}>
              <option value="">Sélectionner</option>
              {BOOKMAKERS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest px-2">Méthode Utilisée</label>
            <select className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-900 appearance-none" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
              <option value="">Sélectionner</option>
              {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest px-2">ID Joueur (11 chiffres)</label>
            <input type="text" maxLength={11} placeholder="Ex: 12345678901" className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-900 transition-all" value={formData.bookmakerId} onChange={e => setFormData({...formData, bookmakerId: e.target.value.replace(/\D/g, '')})} />
          </div>

          {error && <p className="text-red-500 text-center text-xs font-bold bg-red-50 py-2 rounded-xl">{error}</p>}
          
          <div className="space-y-4">
            <button onClick={handleNext} className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-lg shadow-blue-100 active:scale-95 transition-transform">
              SUIVANT
            </button>
            
            <a 
              href="https://www.youtube.com/results?search_query=comment+effectuer+un+depot+1xbet+niger" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 text-red-600 font-bold text-[11px] py-2 hover:opacity-80 transition-opacity uppercase tracking-widest"
            >
              <div className="bg-red-100 p-2 rounded-full flex items-center justify-center">
                <i className="fab fa-youtube text-lg"></i>
              </div>
              <span>Tutoriel: Comment faire ?</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositForm;
