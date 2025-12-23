
import React from 'react';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  return (
    <div className="flex-1 bg-blue-900 overflow-y-auto pb-24">
      <div className="p-8 flex flex-col items-center">
         <div className="w-32 h-32 bg-blue-600 rounded-[3rem] p-1 shadow-2xl mb-6 transform rotate-12">
            <div className="w-full h-full bg-white rounded-[2.5rem] flex items-center justify-center transform -rotate-12">
               <i className="fas fa-user text-5xl text-blue-600"></i>
            </div>
         </div>
         <h2 className="text-2xl font-black text-white">{user.name}</h2>
         <p className="text-blue-300 font-bold mt-1">{user.phone}</p>
      </div>

      <div className="px-6 space-y-4">
        <div className="bg-white/10 rounded-3xl p-6 border border-white/10">
          <h3 className="text-blue-300 text-xs font-black uppercase tracking-widest mb-4">Parametres de compte</h3>
          <div className="space-y-4">
             <button className="w-full flex items-center justify-between text-white group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center">
                      <i className="fas fa-edit text-sm"></i>
                   </div>
                   <span className="font-bold">Modifier le profil</span>
                </div>
                <i className="fas fa-chevron-right text-xs group-hover:translate-x-1 transition-transform"></i>
             </button>
             <button className="w-full flex items-center justify-between text-white group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center">
                      <i className="fas fa-lock text-sm"></i>
                   </div>
                   <span className="font-bold">Changer le mot de passe</span>
                </div>
                <i className="fas fa-chevron-right text-xs group-hover:translate-x-1 transition-transform"></i>
             </button>
             <button className="w-full flex items-center justify-between text-white group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center">
                      <i className="fas fa-bell text-sm"></i>
                   </div>
                   <span className="font-bold">Notifications</span>
                </div>
                <i className="fas fa-chevron-right text-xs group-hover:translate-x-1 transition-transform"></i>
             </button>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full bg-red-500/10 border border-red-500/30 text-red-500 font-black py-5 rounded-3xl flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"
        >
          <i className="fas fa-power-off"></i>
          DECONNEXION
        </button>
      </div>
    </div>
  );
};

export default Profile;
