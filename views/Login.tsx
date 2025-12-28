
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, or } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { ADMIN_CREDENTIALS, ASSETS } from '../constants';
import { User } from '../types';
import { User as UserIcon, Lock, ShieldCheck, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigateRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateRegister }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const input = identifier.trim();
    const pass = password.trim();

    if (!input || !pass) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      if (isAdminMode) {
        if (input.toLowerCase() === ADMIN_CREDENTIALS.id && pass === ADMIN_CREDENTIALS.password) {
          onLogin({ 
            id: 'admin-1', 
            name: 'Recharge+ Admin', 
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
        // Recherche flexible : Nom OU Téléphone (avec ou sans préfixe)
        const phoneWithPrefix = input.length === 8 ? `+227 ${input}` : input;
        
        const q = query(
          collection(db, "users"),
          where("password", "==", pass)
        );
        
        const querySnapshot = await getDocs(q);
        
        // Filtrage manuel pour plus de flexibilité (Name ou Phone)
        const userDoc = querySnapshot.docs.find(doc => {
          const d = doc.data();
          return d.name.toLowerCase() === input.toLowerCase() || d.phone === phoneWithPrefix || d.phone === input;
        });
        
        if (userDoc) {
          const d = userDoc.data();
          onLogin({ 
            id: userDoc.id, 
            name: String(d.name),
            phone: String(d.phone),
            role: d.role,
            referralCode: String(d.referralCode),
            referralBalance: Number(d.referralBalance || 0),
            lastActive: Number(d.lastActive || Date.now())
          } as User);
        } else {
          setError('Identifiants incorrects (Vérifiez votre nom ou numéro)');
        }
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError('Erreur de connexion au serveur Niger.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col bg-[#FACC15] overflow-y-auto">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col items-center mt-8 mb-10"
      >
        <div className="w-24 h-24 mb-6 flex items-center justify-center relative">
          <img src={ASSETS.logo} alt="Logo" className="max-w-full max-h-full object-contain z-10 drop-shadow-2xl" />
          <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full scale-150"></div>
        </div>
        <h2 className="text-3xl font-black text-[#0047FF] tracking-tighter uppercase">Recharge+</h2>
        <p className="text-center mt-2 text-[10px] font-black text-slate-900/40 uppercase tracking-[0.3em] bg-white/30 px-4 py-1 rounded-full border border-white/40">
          {isAdminMode ? 'Espace Administrateur' : 'Accès Client Niger'}
        </p>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-7 rounded-[3rem] border-4 border-white shadow-2xl mb-10"
      >
        <div className="flex p-1.5 bg-slate-100 rounded-[1.8rem] mb-8">
          <button onClick={() => { setIsAdminMode(false); setError(''); }} className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${!isAdminMode ? 'bg-[#FACC15] text-slate-900 shadow-sm font-black' : 'text-slate-400 font-bold'}`}>
            <span className="text-[10px] uppercase tracking-widest">Client</span>
          </button>
          <button onClick={() => { setIsAdminMode(true); setError(''); }} className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${isAdminMode ? 'bg-[#0047FF] text-white shadow-sm font-black' : 'text-slate-400 font-bold'}`}>
            <span className="text-[10px] uppercase tracking-widest">Admin</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Identifiant (Nom ou Téléphone)</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0047FF] transition-colors">
                {isAdminMode ? <ShieldCheck size={18} /> : <UserIcon size={18} />}
              </span>
              <input 
                type="text"
                value={identifier} 
                onChange={e => setIdentifier(e.target.value)} 
                placeholder={isAdminMode ? "Admin ID" : "Ex: 91xxxxxx ou Nom"} 
                className="w-full py-4 pl-12 pr-4 bg-slate-50 text-slate-900 placeholder:text-slate-300 rounded-2xl outline-none border border-slate-100 focus:border-blue-500/30 font-bold transition-all" 
                disabled={loading} 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Mot de passe</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0047FF] transition-colors">
                <Lock size={18} />
              </span>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full py-4 pl-12 pr-14 bg-slate-50 text-slate-900 placeholder:text-slate-300 rounded-2xl outline-none border border-slate-100 focus:border-blue-500/30 font-bold transition-all" 
                disabled={loading} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 active:text-blue-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <motion.p initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-red-500 text-center text-[10px] font-black uppercase tracking-widest bg-red-50 py-3 rounded-xl border border-red-100 px-4">{error}</motion.p>}

          <motion.button 
            whileTap={{ scale: 0.95 }}
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#0047FF] text-white font-black py-5 rounded-[2rem] shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><LogIn size={18} /> SE CONNECTER</>}
          </motion.button>

          {!isAdminMode && (
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
              Pas encore de compte ? <button type="button" onClick={onNavigateRegister} className="text-[#0047FF] font-black ml-1 border-b-2 border-blue-100">S'inscrire</button>
            </p>
          )}
        </form>
      </motion.div>
      <p className="text-center text-slate-900/20 text-[8px] font-black uppercase tracking-[0.5em] mt-auto pb-4">Secured by Champion Niger</p>
    </div>
  );
};

export default Login;
