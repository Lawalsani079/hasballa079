
import React, { useState } from 'react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { User } from '../types';

interface RegisterProps {
  onRegister: (user: User) => void;
  onNavigateLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onNavigateLogin }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', referralCodeInput: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReferralCode = (name: string, phone: string) => {
    const prefix = (name.trim().substring(0, 3) || 'USR').toUpperCase().replace(/[^A-Z]/g, 'X');
    const suffix = phone.slice(-4);
    return `${prefix}${suffix}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    const cleanPhoneInput = formData.phone.trim();
    
    if (!cleanName || !cleanPhoneInput || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (cleanPhoneInput.length !== 8) {
      setError('Le numéro doit comporter exactement 8 chiffres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Vérifier si le NOM existe déjà (car c'est l'identifiant de login désormais)
      const qName = query(collection(db, "users"), where("name", "==", cleanName));
      const nameSnap = await getDocs(qName);
      
      if (!nameSnap.empty) {
        setError('Ce nom est déjà utilisé. Choisissez-en un autre.');
        setLoading(false);
        return;
      }

      // 2. Vérifier si le téléphone existe déjà
      const fullPhone = '+227 ' + cleanPhoneInput;
      const qPhone = query(collection(db, "users"), where("phone", "==", fullPhone));
      const phoneSnap = await getDocs(qPhone);
      
      if (!phoneSnap.empty) {
        setError('Ce numéro de téléphone est déjà associé à un compte');
        setLoading(false);
        return;
      }

      let referredBy = '';
      // 3. Vérifier le code de parrainage
      if (formData.referralCodeInput.trim()) {
        const codeToTest = formData.referralCodeInput.trim().toUpperCase();
        const qRef = query(collection(db, "users"), where("referralCode", "==", codeToTest));
        const refSnap = await getDocs(qRef);
        
        if (!refSnap.empty) {
          referredBy = refSnap.docs[0].id;
          await updateDoc(doc(db, "users", referredBy), {
            referralBalance: increment(500)
          });
        } else {
          setError('Code de parrainage invalide');
          setLoading(false);
          return;
        }
      }

      // 4. Créer l'utilisateur
      const myRefCode = generateReferralCode(cleanName, cleanPhoneInput);
      const userPayload = {
        name: cleanName,
        phone: fullPhone,
        password: formData.password.trim(),
        role: 'user' as const,
        referralCode: myRefCode,
        referredBy: referredBy,
        referralBalance: 0,
        lastActive: Date.now()
      };

      const docRef = await addDoc(collection(db, "users"), userPayload);
      onRegister({ id: docRef.id, ...userPayload } as User);
    } catch (err) {
      console.error(err);
      setError('Erreur technique. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#081a2b] overflow-y-auto">
      <div className="p-8 flex items-center justify-between">
        <button onClick={onNavigateLogin} className="text-white bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center active:scale-90 border border-white/5">
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="text-right">
          <h2 className="text-white text-xl font-black uppercase tracking-tighter">Inscription</h2>
          <p className="text-yellow-400 text-[9px] font-black uppercase tracking-widest">Nouveau Membre</p>
        </div>
      </div>

      <div className="px-6 pb-12">
        <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest px-2">Nom Complet (Identifiant)</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-yellow-400 transition-colors">
                  <i className="fas fa-user-tag"></i>
                </span>
                <input 
                  type="text" 
                  required 
                  placeholder="Utilisé pour vous connecter" 
                  className="w-full bg-white/5 py-4 pl-12 pr-4 rounded-2xl text-white font-bold border border-white/5 outline-none focus:border-yellow-400 transition-all" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  disabled={loading} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest px-2">Téléphone (Recharges)</label>
              <div className="flex gap-2">
                <div className="bg-white/5 px-4 flex items-center rounded-2xl text-white/40 border border-white/5 font-black text-xs">+227</div>
                <div className="relative flex-1 group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-yellow-400 transition-colors">
                    <i className="fas fa-phone"></i>
                  </span>
                  <input 
                    type="tel" 
                    required 
                    maxLength={8}
                    placeholder="91xxxxxx" 
                    className="w-full bg-white/5 py-4 pl-12 pr-4 rounded-2xl text-white font-bold border border-white/5 outline-none focus:border-yellow-400 transition-all" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} 
                    disabled={loading} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest px-2">Mot de passe</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-yellow-400 transition-colors">
                  <i className="fas fa-lock"></i>
                </span>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  className="w-full bg-white/5 py-4 pl-12 pr-4 rounded-2xl text-white font-bold border border-white/5 outline-none focus:border-yellow-400 transition-all" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  disabled={loading} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-yellow-400 uppercase tracking-widest px-2 flex justify-between">
                <span>Code Parrain</span>
                <span className="opacity-40">(Facultatif)</span>
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-yellow-400 transition-colors">
                  <i className="fas fa-gift"></i>
                </span>
                <input 
                  type="text" 
                  placeholder="Ex: ALI1234" 
                  className="w-full bg-yellow-400/5 py-4 pl-12 pr-4 rounded-2xl text-yellow-400 font-black border border-yellow-400/20 outline-none focus:border-yellow-400 uppercase tracking-widest transition-all" 
                  value={formData.referralCodeInput} 
                  onChange={e => setFormData({...formData, referralCodeInput: e.target.value.toUpperCase()})} 
                  disabled={loading} 
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-center text-[10px] font-black uppercase tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}

            <button type="submit" disabled={loading} className="w-full bg-yellow-400 text-[#081a2b] font-black py-5 rounded-[2rem] shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3">
              {loading ? <i className="fas fa-circle-notch animate-spin"></i> : <><i className="fas fa-user-check"></i> CRÉER MON COMPTE</>}
            </button>
            
            <p className="text-center text-[10px] font-bold text-white/30 uppercase tracking-widest">
              Vous avez déjà un compte ? <button type="button" onClick={onNavigateLogin} className="text-yellow-400 font-black ml-1 hover:underline">Se connecter</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
