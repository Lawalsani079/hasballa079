
import React, { useState } from 'react';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { ADMIN_CREDENTIALS } from '../constants';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigateRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateRegister }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    try {
      if (isAdminMode) {
        if (cleanUser === ADMIN_CREDENTIALS.id && cleanPass === ADMIN_CREDENTIALS.password) {
          onLogin({ id: 'admin-1', name: 'Champion Admin', phone: '000', role: 'admin' });
        } else {
          setError('Identifiants admin incorrects');
        }
      } else {
        if (!cleanUser || !cleanPass) {
          setError('Veuillez remplir tous les champs');
          setLoading(false);
          return;
        }

        const q = query(collection(db, "users"), where("name", "==", username.trim()), where("password", "==", cleanPass));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const userData = doc.data();
          onLogin({ 
            id: doc.id, 
            name: String(userData.name),
            phone: String(userData.phone),
            role: 'user' 
          });
        } else {
          setError('Nom d\'utilisateur ou mot de passe incorrect');
        }
      }
    } catch (err: any) {
      setError('Erreur réseau. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col bg-[#F4F7FE]">
      <div className="flex flex-col items-center mt-12 mb-12">
        <div className="w-24 h-24 bg-blue-600 rounded-3xl rotate-45 transform flex items-center justify-center mb-8 shadow-xl shadow-blue-200">
           <div className="rotate-[-45deg] flex items-baseline">
             <span className="text-white text-4xl font-black italic">R</span>
             <span className="text-yellow-400 text-xl font-bold">+</span>
           </div>
        </div>
        <h2 className="text-2xl font-black text-blue-900 tracking-tight uppercase">Recharge+</h2>
        <p className="text-center mt-2 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
          {isAdminMode ? 'PANNEAU D\'ADMINISTRATION SÉCURISÉ' : 'VOTRE PLATEFORME DE RECHARGE RAPIDE'}
        </p>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5">
        <div className="flex p-1 bg-gray-50 rounded-2xl mb-8">
          <button onClick={() => { setIsAdminMode(false); setError(''); }} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${!isAdminMode ? 'bg-white text-blue-600 shadow-md font-black' : 'text-gray-400 font-bold'}`}>
            <i className="fas fa-user text-xs"></i>
            <span className="text-[10px] uppercase tracking-widest">Client</span>
          </button>
          <button onClick={() => { setIsAdminMode(true); setError(''); }} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${isAdminMode ? 'bg-white text-blue-600 shadow-md font-black' : 'text-gray-400 font-bold'}`}>
            <i className="fas fa-shield-alt text-xs"></i>
            <span className="text-[10px] uppercase tracking-widest">Admin</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Identifiant</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300">
                <i className={`fas ${isAdminMode ? 'fa-id-badge' : 'fa-user'}`}></i>
              </span>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder={isAdminMode ? "champion" : "Nom d'utilisateur"} 
                className="w-full py-4 pl-12 pr-4 bg-gray-50 text-blue-900 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all" 
                disabled={loading} 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Mot de passe</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300">
                <i className="fas fa-lock"></i>
              </span>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full py-4 pl-12 pr-4 bg-gray-50 text-blue-900 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all" 
                disabled={loading} 
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-center text-[10px] font-black uppercase tracking-widest bg-red-50 py-3 rounded-xl border border-red-100">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-yellow-400 text-blue-900 font-black py-5 rounded-[2rem] shadow-lg shadow-yellow-900/10 active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-xs">
            {loading ? <i className="fas fa-circle-notch animate-spin"></i> : 'SE CONNECTER'}
          </button>

          {!isAdminMode && (
            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
              Pas de compte ? <button type="button" onClick={onNavigateRegister} className="text-blue-600 font-black ml-1">S'inscrire</button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
