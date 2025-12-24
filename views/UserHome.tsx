
import React from 'react';
import Banner from '../components/Banner';
import { User } from '../types';

interface UserHomeProps {
  user: User;
  onDeposit: () => void;
  onWithdraw: () => void;
  onBuyCrypto: () => void;
  onLogout: () => void;
  onChat: () => void;
}

const UserHome: React.FC<UserHomeProps> = ({ user, onDeposit, onWithdraw, onBuyCrypto, onLogout, onChat }) => {
  return (
    <div className="flex-1 bg-[#081a2b] overflow-y-auto pb-32">
      {/* Header compact adapté */}
      <div className="px-6 pt-10 pb-4 flex items-center justify-between border-b border-white/5 bg-[#081a2b] sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl overflow-hidden shadow-sm border border-white/10">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Avatar" className="w-full h-full" />
          </div>
          <div>
            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Bienvenue sur Recharge+</p>
            <h3 className="text-white font-black text-sm leading-tight">{user.name}</h3>
          </div>
        </div>
        <button onClick={onLogout} className="text-white/40 hover:text-red-400 transition-colors p-2">
          <i className="fas fa-sign-out-alt text-lg"></i>
        </button>
      </div>

      <div className="w-full">
         <Banner />
      </div>

      <div className="px-6 flex flex-col items-center mt-8">
        <div className="w-full space-y-4 max-w-xs mb-10">
          <button 
            onClick={onDeposit} 
            className="w-full bg-[#1d4ed8] text-white font-black py-5 rounded-[2rem] shadow-xl shadow-blue-900/40 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3 border border-blue-400/20"
          >
            <i className="fas fa-plus-circle text-lg"></i> Effectuer un Dépôt
          </button>
          
          <button 
            onClick={onWithdraw} 
            className="w-full bg-[#facc15] text-[#081a2b] font-black py-5 rounded-[2rem] shadow-xl shadow-yellow-900/40 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3"
          >
            <i className="fas fa-minus-circle text-lg"></i> Effectuer un Retrait
          </button>

          <button 
            onClick={onBuyCrypto} 
            className="w-full bg-[#10b981] text-white font-black py-5 rounded-[2rem] shadow-xl shadow-emerald-900/40 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3 border border-emerald-400/20"
          >
            <i className="fab fa-bitcoin text-lg"></i> Achat Crypto
          </button>
        </div>

        <div className="w-full space-y-3 px-2">
           {[
             { label: 'Assistance Directe', icon: 'fa-headset', color: 'blue', desc: 'Une question ? Chattez avec nous.', onClick: onChat },
             { label: 'Historique Détaillé', icon: 'fa-clock-rotate-left', color: 'gray', desc: 'Suivez vos dernières transactions.', onClick: () => {} }
           ].map((item, idx) => (
             <div key={idx} onClick={item.onClick} className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl active:bg-white/10 transition-colors cursor-pointer group border border-white/5">
               <div className={`w-12 h-12 rounded-2xl bg-white/10 shadow-sm flex items-center justify-center text-lg ${item.color === 'blue' ? 'text-blue-300' : 'text-white/40'}`}>
                 <i className={`fas ${item.icon}`}></i>
               </div>
               <div className="flex-1">
                 <span className="text-white font-black text-xs uppercase tracking-tight block">{item.label}</span>
                 <span className="text-white/40 text-[9px] font-bold">{item.desc}</span>
               </div>
               <i className="fas fa-chevron-right text-white/20 group-active:translate-x-1 transition-transform"></i>
             </div>
           ))}
        </div>
      </div>
      
      {/* Bouton Chat flottant adapté */}
      <div className="fixed bottom-28 right-6 group z-40">
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-[#081a2b] flex items-center justify-center">
          <span className="text-[8px] text-white font-black">!</span>
        </div>
        <button onClick={onChat} className="w-16 h-16 bg-blue-600 text-white rounded-[1.8rem] shadow-2xl flex items-center justify-center text-2xl border-4 border-white/10 active:scale-90 transition-transform">
          <i className="fas fa-comment-dots"></i>
        </button>
      </div>
    </div>
  );
};

export default UserHome;
