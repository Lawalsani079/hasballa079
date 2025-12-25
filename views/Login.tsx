
import React, { useState } from 'react';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { ADMIN_CREDENTIALS, ASSETS } from '../constants';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigateRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateRegister }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [identifier, setIdentifier] = useState(''); // Nom pour les utilisateurs, ID pour l'admin
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!identifier.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      if (isAdminMode) {
        if (identifier.trim().toLowerCase() === ADMIN_CREDENTIALS.id && password.trim() === ADMIN_CREDENTIALS.password) {
          onLogin({ 
            id: 'admin-1', 
            name: 'Champion Admin', 
            phone: '000', 
            role: 'admin', 
            referralCode: '', 
            referralBalance: 0, 
            lastActive: Date.now() 
          });
        } else {
          setError('Identifiants admin incorrects');
        }
      } else {
        const q = query(
          collection(db, "users"), 
          where("name", "==", identifier.trim()), 
          where("password", "==", password.trim())
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const d = doc.data();
          // Explicit mapping to POJO (Plain Old JavaScript Objects) to avoid circular errors
          onLogin({ 
            id: doc.id, 
            name: String(d.name),
            phone: String(d.phone),
            role: d.role,
            referralCode: String(d.referralCode),
            referralBalance: Number(d.referralBalance || 0),
            lastActive: Number(d.lastActive || Date.now())
          } as User);
        } else {
          setError('Nom ou mot de passe incorrect');
        }
      }
    } catch (err: any) {
      console.error("Login attempt failed:", err);
      setError('Erreur de connexion. Vérifiez votre internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col bg-[#081a2b] overflow-y-auto">
      <div className="flex flex-col items-center mt-8 mb-10">
        <div className="w-24 h-24 mb-6 flex items-center justify-center relative group">
          <img 
            src={ASSETS.logo} 
            alt="Logo" 
            className="max-w-full max-h-full object-contain z-10"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const container = e.currentTarget.parentElement;
              if (container) {
                container.innerHTML = `
                  <div class="w-20 h-20 bg-blue-600 rounded-3xl rotate-45 transform flex items-center justify-center shadow-2xl border border-white/10">
                     <div class="rotate-[-45deg] flex items-baseline">
                       <span class="text-white text-4xl font-black italic tracking-tighter">R</span>
                       <span class="text-yellow-400 text-xl font-bold ml-0.5">+</span>
                     </div>
                  </div>
                `;
              }
            }}
          />
          <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full scale-125"></div>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Recharge+</h2>
        <p className="text-center mt-2 text-[9px] font-black text-yellow-400/60 uppercase tracking-[0.3em]">
          {isAdminMode ? 'Espace Administration' : 'Connexion Client'}
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 shadow-2xl mb-10">
        <div className="flex p-1 bg-black/20 rounded-2xl mb-8">
          <button onClick={() => { setIsAdminMode(false); setError(''); }} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${!isAdminMode ? 'bg-blue-600 text-white shadow-md font-black' : 'text-white/40 font-bold'}`}>
            <i className="fas fa-user-circle text-xs"></i>
            <span className="text-[10px] uppercase tracking-widest">Client</span>
          </button>
          <button onClick={() => { setIsAdminMode(true); setError(''); }} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${isAdminMode ? 'bg-blue-600 text-white shadow-md font-black' : 'text-white/40 font-bold'}`}>
            <i className="fas fa-shield-alt text-xs"></i>
            <span className="text-[10px] uppercase tracking-widest">Admin</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest px-2">
              {isAdminMode ? 'Identifiant Admin' : 'Nom d\'utilisateur'}
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors">
                <i className={`fas ${isAdminMode ? 'fa-id-badge' : 'fa-user'}`}></i>
              </span>
              <input 
                type="text"
                value={identifier} 
                onChange={e => setIdentifier(e.target.value)} 
                placeholder={isAdminMode ? "ID Admin" : "Votre nom complet"} 
                className="w-full py-4 pl-12 pr-4 bg-white/5 text-white placeholder:text-white/10 rounded-2xl outline-none border border-white/5 focus:border-blue-500/50 font-bold transition-all" 
                disabled={loading} 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest px-2">Mot de passe</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors">
                <i className="fas fa-lock"></i>
              </span>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full py-4 pl-12 pr-4 bg-white/5 text-white placeholder:text-white/10 rounded-2xl outline-none border border-white/5 focus:border-blue-500/50 font-bold transition-all" 
                disabled={loading} 
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-center text-[10px] font-black uppercase tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 border border-blue-400/20">
            {loading ? <i className="fas fa-circle-notch animate-spin"></i> : <><i className="fas fa-sign-in-alt"></i> SE CONNECTER</>}
          </button>

          {!isAdminMode && (
            <p className="text-center text-[10px] font-bold text-white/30 uppercase tracking-widest mt-4">
              Pas encore de compte ? <button type="button" onClick={onNavigateRegister} className="text-yellow-400 font-black ml-1 hover:underline">S'inscrire</button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
