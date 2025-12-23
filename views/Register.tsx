
import React, { useState } from 'react';
import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { User } from '../types';

interface RegisterProps {
  onRegister: (user: User) => void;
  onNavigateLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onNavigateLogin }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.password) return;
    setLoading(true);
    setError('');

    try {
      // Check if user exists
      const q = query(collection(db, "users"), where("phone", "==", formData.phone));
      const existing = await getDocs(q);
      
      if (!existing.empty) {
        setError('Ce numéro de téléphone est déjà utilisé');
        setLoading(false);
        return;
      }

      const userPayload = {
        name: formData.name,
        phone: '+227 ' + formData.phone,
        password: formData.password,
        role: 'user'
      };

      const docRef = await addDoc(collection(db, "users"), userPayload);
      onRegister({ id: docRef.id, ...userPayload } as User);
    } catch (err) {
      setError('Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-blue-600">
      <div className="p-8 flex items-center">
        <button onClick={onNavigateLogin} className="text-white bg-white/20 w-10 h-10 rounded-xl"><i className="fas fa-arrow-left"></i></button>
        <h2 className="flex-1 text-center text-white text-xl font-bold pr-10">Créer un compte</h2>
      </div>

      <div className="flex-1 bg-white rounded-t-[3rem] p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Nom et Prénom</label>
            <input type="text" required placeholder="Votre nom" className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={loading} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Téléphone</label>
            <div className="flex gap-2">
              <div className="bg-gray-100 px-4 flex items-center rounded-2xl font-bold text-gray-500">+227</div>
              <input type="tel" required placeholder="9111xxxx" className="flex-1 bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} disabled={loading} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Mot de passe</label>
            <input type="password" required placeholder="••••••••" className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} disabled={loading} />
          </div>

          {error && <p className="text-red-500 text-center text-xs font-bold">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-yellow-400 text-blue-900 font-black py-5 rounded-3xl shadow-lg">
            {loading ? <i className="fas fa-circle-notch animate-spin"></i> : 'S\'INSCRIRE MAINTENANT'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
