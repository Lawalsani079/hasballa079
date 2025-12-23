
import React from 'react';
import Banner from '../components/Banner';
import { User } from '../types';

interface UserHomeProps {
  user: User;
  onDeposit: () => void;
  onWithdraw: () => void;
  onLogout: () => void;
}

const UserHome: React.FC<UserHomeProps> = ({ user, onDeposit, onWithdraw, onLogout }) => {
  return (
    <div className="flex-1 bg-white overflow-y-auto pb-32">
      {/* Header compact */}
      <div className="px-6 pt-10 pb-4 flex items-center justify-between border-b border-gray-50 bg-[#F4F7FE]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl overflow-hidden shadow-sm">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Avatar" className="w-full h-full" />
          </div>
          <div>
            <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Compte Client</p>
            <h3 className="text-blue-900 font-black text-sm leading-tight">{user.name}</h3>
          </div>
        </div>
        <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition-colors p-2">
          <i className="fas fa-sign-out-alt text-lg"></i>
        </button>
      </div>

      {/* Bannière en pleine largeur au sommet */}
      <div className="w-full">
         <Banner />
      </div>

      <div className="px-6 flex flex-col items-center mt-8">
        {/* Boutons empilés comme la maquette */}
        <div className="w-full space-y-4 max-w-xs mb-10">
          <button 
            onClick={onDeposit}
            className="w-full bg-[#1d4ed8] text-white font-black py-5 rounded-full shadow-lg shadow-blue-200 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            Dépôt
          </button>

          <button 
            onClick={onWithdraw}
            className="w-full bg-[#facc15] text-blue-900 font-black py-5 rounded-full shadow-lg shadow-yellow-100 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            Retrait
          </button>
        </div>

        {/* Raccourcis liste */}
        <div className="w-full space-y-2 mt-4">
           {[
             { label: 'Re-Secalt', icon: 'fa-repeat', color: 'blue' },
             { label: 'Retrait rapide', icon: 'fa-bolt', color: 'yellow' },
             { label: 'Gros gains', icon: 'fa-trophy', color: 'orange' }
           ].map((item, idx) => (
             <div key={idx} className="flex items-center justify-between p-4 bg-[#F4F7FE] rounded-2xl active:bg-gray-100 transition-colors">
               <div className="flex items-center gap-4">
                 <div className={`w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] text-blue-600`}>
                   <i className={`fas ${item.icon}`}></i>
                 </div>
                 <span className="text-blue-900 font-bold text-xs uppercase tracking-tight opacity-70">{item.label}</span>
               </div>
               <i className="fas fa-chevron-right text-gray-300 text-[10px]"></i>
             </div>
           ))}
        </div>
      </div>
      
      {/* Bouton Support flottant */}
      <button className="fixed bottom-28 right-6 w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-40 border-4 border-white active:scale-90 transition-transform">
        <i className="fab fa-whatsapp"></i>
      </button>
    </div>
  );
};

export default UserHome;
