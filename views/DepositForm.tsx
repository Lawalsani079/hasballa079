
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
      onComplete();
    } catch (err) {
      setError('Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="flex-1 bg-blue-900 flex flex-col">
        <div className="p-6 flex items-center gap-4 text-white">
          <button onClick={() => setStep(1)}><i className="fas fa-arrow-left"></i></button>
          <h2 className="font-bold">Confirmation</h2>
        </div>
        <div className="px-6 flex-1 overflow-y-auto pb-24">
          <div className="bg-white rounded-[2rem] p-6 mb-6 space-y-4">
            {Object.entries({
              'Montant': formData.amount + ' FCFA',
              'Bookmaker': formData.bookmaker,
              'ID': formData.bookmakerId,
              'Méthode': formData.method
            }).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-400 text-sm">{k}</span>
                <span className="font-bold text-blue-900">{v}</span>
              </div>
            ))}
          </div>

          <h3 className="text-white font-bold mb-4">Téléverser le reçu *</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <label className="bg-white/10 border-2 border-dashed border-white/20 rounded-2xl h-24 flex flex-col items-center justify-center text-white cursor-pointer">
              <i className="fas fa-camera mb-1"></i>
              <span className="text-[10px]">Appareil</span>
              <input type="file" capture="environment" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <label className="bg-white/10 border-2 border-dashed border-white/20 rounded-2xl h-24 flex flex-col items-center justify-center text-white cursor-pointer">
              <i className="fas fa-image mb-1"></i>
              <span className="text-[10px]">Galerie</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          {formData.proofImage && <img src={formData.proofImage} className="w-full h-40 object-cover rounded-2xl mb-6 shadow-xl" />}
          
          {error && <p className="text-red-400 text-center mb-4 text-sm font-bold">{error}</p>}

          <button onClick={handleSubmit} disabled={loading} className="w-full bg-yellow-400 text-blue-900 font-black py-5 rounded-3xl shadow-lg">
            {loading ? <i className="fas fa-circle-notch animate-spin"></i> : 'ENVOYER LA DEMANDE'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-blue-900 flex flex-col">
      <div className="p-6 flex items-center gap-4 text-white">
        <button onClick={onBack}><i className="fas fa-arrow-left"></i></button>
        <h2 className="font-bold">Dépôt rapide</h2>
      </div>

      <div className="px-6 mb-4">
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl">
          <p className="text-white text-xs text-center"><span className="font-bold text-red-400">Attention:</span> Effectuez d'abord le transfert au <span className="underline font-bold">91115848</span> avant de remplir ce formulaire.</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-t-[3rem] p-8 mt-4 overflow-y-auto pb-24">
        <div className="space-y-6">
          <input type="number" placeholder="Montant FCFA" className="w-full bg-gray-50 p-4 rounded-2xl" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          
          <select className="w-full bg-gray-50 p-4 rounded-2xl" value={formData.bookmaker} onChange={e => setFormData({...formData, bookmaker: e.target.value})}>
            <option value="">Sélectionner Bookmaker</option>
            {BOOKMAKERS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <select className="w-full bg-gray-50 p-4 rounded-2xl" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
            <option value="">Méthode de paiement</option>
            {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <input type="text" maxLength={11} placeholder="ID Bookmaker (11 chiffres)" className="w-full bg-gray-50 p-4 rounded-2xl" value={formData.bookmakerId} onChange={e => setFormData({...formData, bookmakerId: e.target.value.replace(/\D/g, '')})} />

          {error && <p className="text-red-500 text-center text-xs font-bold">{error}</p>}
          
          <button onClick={handleNext} className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl shadow-lg">SUIVANT</button>
        </div>
      </div>
    </div>
  );
};

export default DepositForm;
