
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

    try {
      if (isAdminMode) {
        if (username === ADMIN_CREDENTIALS.id && password === ADMIN_CREDENTIALS.password) {
          onLogin({ id: 'admin-1', name: 'Administrateur', phone: '000', role: 'admin' });
        } else {
          setError('Identifiants admin incorrects');
        }
      } else {
        if (!username || !password) {
          setError('Veuillez remplir tous les champs');
          setLoading(false);
          return;
        }

        const q = query(collection(db, "users"), where("name", "==", username), where("password", "==", password));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          // S'assurer de n'extraire que les données sérialisables
          const userData = doc.data();
          onLogin({ 
            id: doc.id, 
            name: userData.name,
            phone: userData.phone,
            role: userData.role 
          } as User);
        } else {
          setError('Nom d\'utilisateur ou mot de passe incorrect');
        }
      }
    } catch (err: any) {
      console.error("Login catch error:", err.message);
      setError(err.code === 'permission-denied' 
        ? 'Erreur Firebase : Permission refusée' 
        : 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col">
      <div className="flex flex-col items-center mt-12 mb-12">
        <div className="w-24 h-24 bg-blue-600 rounded-3xl rotate-45 transform flex items-center justify-center mb-10 shadow-xl shadow-blue-200 transition-transform active:scale-95">
           <div className="rotate-[-45deg] flex items-baseline">
             <span className="text-white text-4xl font-black italic">R</span>
             <span className="text-yellow-400 text-xl font-bold">+</span>
           </div>
        </div>
        <h2 className="text-2xl font-bold text-blue-900">Recharge+</h2>
        <p className="text-gray-500 text-center mt-2 px-6">Accédez à votre espace sécurisé</p>
      </div>

      <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-100 shadow-inner">
        <div className="flex bg-white p-1 rounded-2xl mb-8 shadow-sm">
          <button onClick={() => setIsAdminMode(false)} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${!isAdminMode ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}>
            <i className="fas fa-user text-sm"></i>
            <span className="font-semibold text-sm">Client</span>
          </button>
          <button onClick={() => setIsAdminMode(true)} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${isAdminMode ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}>
            <i className="fas fa-shield-alt text-sm"></i>
            <span className="font-semibold text-sm">Admin</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300"><i className="fas fa-user"></i></span>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder={isAdminMode ? "Identifiant" : "Nom complet"} className="w-full bg-white py-4 pl-12 pr-4 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" disabled={loading} />
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300"><i className="fas fa-lock"></i></span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" className="w-full bg-white py-4 pl-12 pr-4 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" disabled={loading} />
          </div>

          {error && <div className="p-3 bg-red-100 border border-red-200 rounded-xl"><p className="text-red-600 text-center text-xs font-bold">{error}</p></div>}

          <button type="submit" disabled={loading} className="w-full bg-yellow-400 text-blue-900 font-black py-4 rounded-2xl shadow-lg hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
            {loading ? <i className="fas fa-circle-notch animate-spin"></i> : 'CONNEXION'}
          </button>

          {!isAdminMode && (
            <p className="text-center text-sm text-gray-500 mt-4">Nouveau ? <button type="button" onClick={onNavigateRegister} className="text-blue-600 font-bold underline decoration-2 underline-offset-4">S'inscrire</button></p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
