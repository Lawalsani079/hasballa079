
import React from 'react';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  return (
    <div className="flex-1 bg-[#F4F7FE] overflow-y-auto pb-32">
      <div className="relative pt-16 pb-12 px-8 flex flex-col items-center">
         {/* Profile Avatar with decorative elements */}
         <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-20 scale-150 rounded-full"></div>
            <div className="relative w-32 h-32 bg-white rounded-[3rem] p-1 shadow-2xl border border-gray-100 flex items-center justify-center">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="User" className="w-full h-full rounded-[2.5rem] bg-blue-50" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-blue-900 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-[#F4F7FE] shadow-lg">
                <i className="fas fa-camera text-sm"></i>
            </div>
         </div>
         
         <h2 className="text-2xl font-black text-blue-900 tracking-tight">{user.name}</h2>
         <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{user.phone}</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span className="bg-blue-100 text-blue-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Vérifié</span>
         </div>
      </div>

      <div className="px-6 space-y-6">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6">Mon Compte</h3>
          <div className="space-y-2">
             {[
               { icon: 'fa-user-edit', label: 'Informations personnelles', color: 'blue' },
               { icon: 'fa-shield-halved', label: 'Sécurité & Mot de passe', color: 'orange' },
               { icon: 'fa-bell', label: 'Préférences de notification', color: 'green' },
               { icon: 'fa-headset', label: 'Support & Aide', color: 'purple' }
             ].map((item, idx) => (
               <button key={idx} className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-all group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white rounded-xl flex items-center justify-center transition-all">
                        <i className={`fas ${item.icon} text-sm`}></i>
                     </div>
                     <span className="font-bold text-blue-900 text-sm">{item.label}</span>
                  </div>
                  <i className="fas fa-chevron-right text-[10px] text-gray-300 group-hover:text-blue-600 transition-colors"></i>
               </button>
             ))}
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full bg-white border border-red-100 text-red-500 font-black py-5 rounded-[2.5rem] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm shadow-red-500/5 mt-4"
        >
          <i className="fas fa-power-off text-sm"></i>
          DECONNEXION
        </button>
        
        <p className="text-center text-gray-300 text-[9px] font-bold uppercase tracking-[0.2em] pt-4">Recharge+ v2.0.1</p>
      </div>
    </div>
  );
};

export default Profile;
