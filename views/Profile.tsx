
import React, { useState, useRef, useEffect } from 'react';
import { collection, query, where, getDocs, doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  onChat: () => void;
  onNotify: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onChat, onNotify }) => {
  const [loading, setLoading] = useState(false);
  const [confirmingType, setConfirmingType] = useState<'requests' | 'messages' | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const clearData = async (collectionName: 'requests' | 'messages') => {
    const label = collectionName === 'requests' ? "l'historique Niger" : "les discussions";
    
    // Étape 1 : Demander la confirmation visuelle
    if (confirmingType !== collectionName) {
      setConfirmingType(collectionName);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setConfirmingType(null), 4000);
      return;
    }

    // Étape 2 : Suppression effective
    setConfirmingType(null);
    setLoading(true);
    try {
      const q = query(collection(db, collectionName), where("userId", "==", user.id));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        alert(`Aucune donnée à supprimer.`);
        setLoading(false);
        return;
      }

      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      
      alert(`✅ Succès : ${label} vidé définitivement.`);
    } catch (e: any) {
      console.error(`Clear ${collectionName} Error:`, e.message);
      alert("Erreur serveur lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto pb-32 no-scrollbar flex flex-col h-full animate-in fade-in">
      <div className="px-6 pt-14 pb-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-slate-900 text-xl font-black uppercase tracking-tighter leading-none">Profil</h2>
          <p className="text-[8px] font-black text-[#0047FF] uppercase tracking-[0.3em] mt-2">Niger Premium App</p>
        </div>
        <button onClick={onNotify} className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 active:scale-90 relative border border-slate-100 shadow-sm">
          <i className="fas fa-bell text-sm"></i>
          <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-[#0047FF] rounded-full border-2 border-white"></span>
        </button>
      </div>

      <div className="px-6 space-y-6 flex-1">
        {/* User Card */}
        <div className="bg-[#0f172a] p-7 rounded-[3rem] flex items-center gap-5 shadow-2xl relative overflow-hidden border-b-8 border-[#0047FF]">
          <div className="w-16 h-16 bg-[#0047FF] rounded-[2rem] flex items-center justify-center shadow-xl border-4 border-white/10 shrink-0">
            <i className="fas fa-user-shield text-white text-2xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-black text-sm uppercase tracking-tight">{user.name}</h3>
            <p className="text-[#FACC15] text-[9px] font-black uppercase tracking-widest mt-1">{user.phone}</p>
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-5">
             <i className="fas fa-crown text-8xl text-white"></i>
          </div>
        </div>

        {/* Danger Zone Actions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4">
            <h4 className="text-red-500 text-[9px] font-black uppercase tracking-[0.4em]">Zone Critique</h4>
            <div className="h-[1px] flex-1 bg-red-100 ml-4 opacity-50"></div>
          </div>
          
          <div className="bg-red-50/50 rounded-[3rem] p-3 space-y-3 border-2 border-red-50">
            {/* Vider Transactions */}
            <button 
              disabled={loading}
              onClick={() => clearData('requests')} 
              className={`w-full flex items-center gap-4 p-5 rounded-[2.2rem] transition-all shadow-sm border ${
                confirmingType === 'requests' 
                ? 'bg-red-600 text-white border-red-700 animate-pulse' 
                : 'bg-white text-slate-900 border-red-100'
              }`}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner ${
                confirmingType === 'requests' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-500'
              }`}>
                <i className={`fas ${confirmingType === 'requests' ? 'fa-exclamation-triangle' : 'fa-history'} text-xs`}></i>
              </div>
              <div className="flex-1 text-left">
                <span className={`block font-black text-[10px] uppercase tracking-tight ${confirmingType === 'requests' ? 'text-white' : 'text-slate-900'}`}>
                  {confirmingType === 'requests' ? "Cliquez pour Confirmer" : "Vider Historique"}
                </span>
                <span className={`text-[7px] font-black uppercase tracking-widest ${confirmingType === 'requests' ? 'text-white/60' : 'text-red-400'}`}>
                  {confirmingType === 'requests' ? "Action irréversible" : "Tout supprimer définitivement"}
                </span>
              </div>
              {loading && confirmingType === 'requests' && <i className="fas fa-circle-notch animate-spin"></i>}
            </button>
            
            {/* Vider Chat */}
            <button 
              disabled={loading}
              onClick={() => clearData('messages')} 
              className={`w-full flex items-center gap-4 p-5 rounded-[2.2rem] transition-all shadow-sm border ${
                confirmingType === 'messages' 
                ? 'bg-red-600 text-white border-red-700 animate-pulse' 
                : 'bg-white text-slate-900 border-red-100'
              }`}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner ${
                confirmingType === 'messages' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-500'
              }`}>
                <i className={`fas ${confirmingType === 'messages' ? 'fa-exclamation-triangle' : 'fa-comment-slash'} text-xs`}></i>
              </div>
              <div className="flex-1 text-left">
                <span className={`block font-black text-[10px] uppercase tracking-tight ${confirmingType === 'messages' ? 'text-white' : 'text-slate-900'}`}>
                  {confirmingType === 'messages' ? "Confirmation Finale" : "Supprimer Chat"}
                </span>
                <span className={`text-[7px] font-black uppercase tracking-widest ${confirmingType === 'messages' ? 'text-white/60' : 'text-red-400'}`}>
                  {confirmingType === 'messages' ? "Vider toute la discussion" : "Effacer vos messages"}
                </span>
              </div>
              {loading && confirmingType === 'messages' && <i className="fas fa-circle-notch animate-spin"></i>}
            </button>
          </div>
        </div>

        {/* Regular Actions */}
        <div className="space-y-4">
           <h4 className="text-slate-300 text-[9px] font-black uppercase tracking-[0.4em] px-4">Options</h4>
           <div className="bg-slate-50 p-3 rounded-[3rem] space-y-2">
             <button onClick={onChat} className="w-full flex items-center gap-4 p-5 rounded-[2.2rem] bg-white shadow-sm active:scale-95 transition-all">
                <div className="w-11 h-11 bg-blue-50 text-[#0047FF] rounded-2xl flex items-center justify-center border border-blue-100">
                  <i className="fas fa-headset text-sm"></i>
                </div>
                <span className="flex-1 text-left font-black text-slate-900 text-[10px] uppercase tracking-tight">Support Client 24/7</span>
                <i className="fas fa-chevron-right text-[8px] text-slate-300"></i>
             </button>
           </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full mt-auto mb-10 bg-slate-900 text-[#FACC15] py-6 rounded-[2.5rem] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl group border-b-4 border-slate-700"
        >
          <span className="font-black uppercase tracking-[0.2em] text-[10px]">Déconnexion Sécurisée</span>
          <i className="fas fa-power-off text-xs group-active:animate-pulse"></i>
        </button>

        <p className="text-center text-[7px] font-black text-slate-200 uppercase tracking-[0.6em] py-8">Champion Niger • Vers. 2.9.0</p>
      </div>
    </div>
  );
};

export default Profile;
