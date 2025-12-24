
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  // Added onChat prop to fix TS error in App.tsx
  onChat: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onChat }) => {
  const [notifsEnabled, setNotifsEnabled] = useState(true);
  const [securityLock, setSecurityLock] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="flex-1 bg-[#F4F7FE] overflow-y-auto pb-32">
      {/* Header Premium */}
      <div className="relative h-64 bg-gradient-to-br from-blue-700 to-blue-500 rounded-b-[4rem] flex flex-col items-center justify-center shadow-lg">
        <div className="absolute top-10 right-6">
           <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 flex items-center gap-2">
             <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
             <span className="text-white text-[9px] font-black uppercase tracking-tighter">Membre Vérifié</span>
           </div>
        </div>

        <div className="relative mt-8">
          <div className="w-28 h-28 bg-white rounded-[2.5rem] p-1.5 shadow-2xl rotate-3">
             <div className="w-full h-full bg-blue-50 rounded-[2rem] overflow-hidden border-2 border-yellow-400">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="User" className="w-full h-full" />
             </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 text-blue-900 rounded-2xl flex items-center justify-center border-4 border-blue-600 shadow-xl">
             <i className="fas fa-camera text-xs"></i>
          </div>
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-white text-xl font-black tracking-tight">{user.name}</h2>
          <p className="text-blue-100 text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">{user.phone}</p>
        </div>
      </div>

      <div className="px-6 -mt-8 space-y-6">
        {/* Section Préférences (Toggles) */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-white">
          <h3 className="text-blue-900/40 text-[10px] font-black uppercase tracking-widest mb-6 px-2">Préférences App</h3>
          <div className="space-y-4">
            {/* Notification Toggle */}
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-bell text-sm"></i>
                </div>
                <div>
                  <p className="font-black text-blue-900 text-xs">Notifications Push</p>
                  <p className="text-[8px] text-gray-400 uppercase font-bold">Alertes de validation</p>
                </div>
              </div>
              <button 
                onClick={() => setNotifsEnabled(!notifsEnabled)}
                className={`w-12 h-6 rounded-full transition-all relative ${notifsEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifsEnabled ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            {/* Security Toggle */}
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-fingerprint text-sm"></i>
                </div>
                <div>
                  <p className="font-black text-blue-900 text-xs">Verrouillage Bio</p>
                  <p className="text-[8px] text-gray-400 uppercase font-bold">Empreinte au lancement</p>
                </div>
              </div>
              <button 
                onClick={() => setSecurityLock(!securityLock)}
                className={`w-12 h-6 rounded-full transition-all relative ${securityLock ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${securityLock ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Section Actions */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-white">
          <h3 className="text-blue-900/40 text-[10px] font-black uppercase tracking-widest mb-6 px-2">Mon Compte</h3>
          <div className="space-y-1">
             {[
               { icon: 'fa-user-pen', label: 'Modifier Infos', desc: 'Nom, Téléphone' },
               { icon: 'fa-shield-halved', label: 'Changer Mot de passe', desc: 'Sécurité renforcée' },
               { icon: 'fa-receipt', label: 'Mes Factures', desc: 'Télécharger reçus' }
             ].map((item, idx) => (
               <button key={idx} className="w-full flex items-center gap-4 p-3 rounded-2xl active:bg-blue-50 transition-all group">
                  <div className="w-11 h-11 bg-gray-50 text-blue-900 rounded-2xl flex items-center justify-center transition-transform group-active:scale-90">
                     <i className={`fas ${item.icon} text-sm`}></i>
                  </div>
                  <div className="flex-1 text-left">
                     <p className="font-black text-blue-900 text-sm">{item.label}</p>
                     <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{item.desc}</p>
                  </div>
                  <i className="fas fa-chevron-right text-[10px] text-gray-200"></i>
               </button>
             ))}
             {/* Added Support Chat action to use the onChat prop */}
             <button onClick={onChat} className="w-full flex items-center gap-4 p-3 rounded-2xl active:bg-blue-50 transition-all group">
                <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center transition-transform group-active:scale-90">
                   <i className="fas fa-comments text-sm"></i>
                </div>
                <div className="flex-1 text-left">
                   <p className="font-black text-blue-900 text-sm">Chat Support</p>
                   <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Assistance en direct</p>
                </div>
                <i className="fas fa-chevron-right text-[10px] text-gray-200"></i>
             </button>
          </div>
        </div>

        {/* Section Support Social */}
        <div className="grid grid-cols-2 gap-4">
          <a href="https://wa.me/22791115848" target="_blank" className="bg-[#25D366] p-4 rounded-3xl flex flex-col items-center justify-center text-white shadow-lg active:scale-95 transition-all">
            <i className="fab fa-whatsapp text-2xl mb-2"></i>
            <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
          </a>
          <a href="#" className="bg-[#0088cc] p-4 rounded-3xl flex flex-col items-center justify-center text-white shadow-lg active:scale-95 transition-all">
            <i className="fab fa-telegram-plane text-2xl mb-2"></i>
            <span className="text-[9px] font-black uppercase tracking-widest">Telegram</span>
          </a>
        </div>

        <button 
          onClick={onLogout}
          className="w-full bg-red-50 text-red-600 font-black py-5 rounded-[2.5rem] flex items-center justify-center gap-3 active:scale-95 transition-all border border-red-100 shadow-sm"
        >
          <i className="fas fa-power-off text-sm"></i>
          DÉCONNEXION SÉCURISÉE
        </button>
        
        <div className="text-center py-4">
          <p className="text-blue-900/20 font-black text-[9px] uppercase tracking-[0.4em]">Propulsé par Recharge+ Niger</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
