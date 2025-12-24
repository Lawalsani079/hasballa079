
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
      <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-blue-100 blur-3xl rounded-full opacity-50 scale-150"></div>
          <div className="relative w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-200">
            <i className="fas fa-check text-white text-4xl"></i>
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-blue-900 text-center mb-3 uppercase tracking-tight">Dépôt Confirmé !</h2>
        <p className="text-gray-500 text-center text-sm mb-12 leading-relaxed max-w-[250px]">
          Votre demande de <span className="font-bold text-blue-900">{formData.amount} FCFA</span> a été transmise avec succès.
        </p>

        <div className="w-full space-y-4 max-w-xs">
          <button 
            onClick={onComplete}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 active:scale-95 transition-all text-xs uppercase tracking-widest"
          >
            Suivre ma demande
          </button>
          <button 
            onClick={onBack}
            className="w-full text-gray-400 font-bold py-2 active:scale-95 transition-all text-[10px] uppercase tracking-widest"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F4F7FE] flex flex-col overflow-hidden">
      {/* Dynamic Header */}
      <div className="bg-white px-6 pt-12 pb-6 flex items-center justify-between shadow-sm">
        <button onClick={step === 1 ? onBack : () => setStep(1)} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-blue-900 active:scale-90 transition-all">
          <i className={`fas ${step === 1 ? 'fa-times' : 'fa-chevron-left'}`}></i>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-blue-900 font-black text-sm uppercase tracking-widest">Effectuer un Dépôt</h2>
          <div className="flex gap-1.5 mt-2">
            <div className={`h-1 rounded-full transition-all duration-300 ${step >= 1 ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200'}`}></div>
            <div className={`h-1 rounded-full transition-all duration-300 ${step >= 2 ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200'}`}></div>
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        {step === 1 ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Warning Message */}
            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl flex gap-3 items-start">
              <i className="fas fa-info-circle text-yellow-600 mt-1"></i>
              <p className="text-yellow-800 text-[11px] leading-relaxed">
                <span className="font-black uppercase block mb-1">Action requise</span>
                Envoyez d'abord le montant au <span className="font-black text-blue-600 underline">91115848</span> avant de valider ce formulaire.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Montant à déposer</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors">
                    <i className="fas fa-coins"></i>
                  </div>
                  <input 
                    type="number" 
                    placeholder="Montant en FCFA" 
                    className="w-full bg-white py-4 pl-12 pr-4 rounded-2xl outline-none border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 font-bold text-blue-900 transition-all" 
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Bookmaker</label>
                  <select 
                    className="w-full bg-white py-4 px-4 rounded-2xl outline-none border border-gray-100 focus:border-blue-500 font-bold text-blue-900 transition-all appearance-none" 
                    value={formData.bookmaker} 
                    onChange={e => setFormData({...formData, bookmaker: e.target.value})}
                  >
                    <option value="">Choisir</option>
                    {BOOKMAKERS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Méthode</label>
                  <select 
                    className="w-full bg-white py-4 px-4 rounded-2xl outline-none border border-gray-100 focus:border-blue-500 font-bold text-blue-900 transition-all appearance-none" 
                    value={formData.method} 
                    onChange={e => setFormData({...formData, method: e.target.value})}
                  >
                    <option value="">Choisir</option>
                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">ID Joueur</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors">
                    <i className="fas fa-id-card"></i>
                  </div>
                  <input 
                    type="text" 
                    maxLength={11} 
                    placeholder="11 chiffres requis" 
                    className="w-full bg-white py-4 pl-12 pr-4 rounded-2xl outline-none border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 font-bold text-blue-900 transition-all" 
                    value={formData.bookmakerId} 
                    onChange={e => setFormData({...formData, bookmakerId: e.target.value.replace(/\D/g, '')})} 
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-center text-[10px] font-black uppercase tracking-widest bg-red-50 py-3 rounded-xl">{error}</p>}

            <button 
              onClick={handleNext} 
              className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
            >
              Suivant <i className="fas fa-chevron-right text-[10px]"></i>
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-blue-900 font-black text-xs uppercase tracking-widest border-b border-gray-50 pb-4 flex items-center gap-2">
                <i className="fas fa-file-invoice text-blue-600"></i> Récapitulatif
              </h3>
              <div className="space-y-3 pt-2">
                {[
                  { label: 'Montant', val: formData.amount + ' FCFA' },
                  { label: 'Bookmaker', val: formData.bookmaker },
                  { label: 'ID Joueur', val: formData.bookmakerId },
                  { label: 'Méthode', val: formData.method }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                    <span className="text-blue-900 font-black text-sm">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Preuve de transfert (Reçu)</label>
              
              {!formData.proofImage ? (
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-200 rounded-[2rem] h-32 text-gray-400 active:bg-blue-50 active:border-blue-200 transition-all cursor-pointer">
                    <i className="fas fa-camera text-2xl mb-2"></i>
                    <span className="text-[9px] font-black uppercase tracking-widest">Prendre Photo</span>
                    <input type="file" capture="environment" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <label className="flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-200 rounded-[2rem] h-32 text-gray-400 active:bg-blue-50 active:border-blue-200 transition-all cursor-pointer">
                    <i className="fas fa-images text-2xl mb-2"></i>
                    <span className="text-[9px] font-black uppercase tracking-widest">De la Galerie</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              ) : (
                <div className="relative group">
                  <img src={formData.proofImage} className="w-full h-48 object-cover rounded-[2rem] shadow-lg border-2 border-white" alt="Reçu" />
                  <button onClick={() => setFormData({...formData, proofImage: ''})} className="absolute top-4 right-4 bg-red-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-center text-[10px] font-black uppercase tracking-widest bg-red-50 py-3 rounded-xl">{error}</p>}

            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
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
