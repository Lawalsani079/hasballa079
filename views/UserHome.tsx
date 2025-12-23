
import React from 'react';
import Banner from '../components/Banner';
import { User } from '../types';

interface UserHomeProps {
  user: User;
  onDeposit: () => void;
  onLogout: () => void;
}

const UserHome: React.FC<UserHomeProps> = ({ user, onDeposit, onLogout }) => {
  return (
    <div className="flex-1 bg-blue-900 overflow-y-auto pb-24">
      {/* Header */}
      <div className="p-6 flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 shadow-inner">
             <div className="w-full h-full bg-blue-600 rounded-lg flex items-center justify-center transform rotate-45">
               <span className="text-white text-xs font-black rotate-[-45deg]">R+</span>
             </div>
          </div>
          <div>
            <p className="text-blue-300 text-xs font-medium">Bienvenue</p>
            <h3 className="text-white font-bold text-lg leading-tight">{user.name}</h3>
          </div>
        </div>
        <button onClick={onLogout} className="text-blue-300 bg-blue-800/50 p-3 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-colors">
          <i className="fas fa-sign-out-alt text-lg"></i>
        </button>
      </div>

      <div className="px-6">
        <Banner />
        
        <div className="mb-6">
           <h4 className="text-blue-200 font-bold text-xl mb-1">Services</h4>
           <p className="text-blue-400/80 text-sm">Selectionnez une operation</p>
        </div>

        <div className="space-y-4">
          {/* Deposit Button */}
          <button 
            onClick={onDeposit}
            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] p-5 rounded-[2rem] flex items-center gap-5 group transition-all"
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
              <i className="fas fa-download"></i>
            </div>
            <div className="flex-1 text-left">
              <h5 className="text-white font-bold text-lg">DEPOT</h5>
              <p className="text-sky-100/70 text-sm">Recharger votre compte</p>
            </div>
            <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center text-white">
              <i className="fas fa-chevron-right"></i>
            </div>
          </button>

          {/* Withdraw Button */}
          <button 
            className="w-full bg-[#f97316] hover:bg-[#ea580c] p-5 rounded-[2rem] flex items-center gap-5 group transition-all"
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
              <i className="fas fa-upload"></i>
            </div>
            <div className="flex-1 text-left">
              <h5 className="text-white font-bold text-lg">RETRAIT</h5>
              <p className="text-orange-100/70 text-sm">Retirer vos gains</p>
            </div>
            <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center text-white">
              <i className="fas fa-chevron-right"></i>
            </div>
          </button>

          {/* Transfer Button */}
          <button 
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] p-5 rounded-[2rem] flex items-center gap-5 group transition-all"
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
              <i className="fas fa-paper-plane"></i>
            </div>
            <div className="flex-1 text-left">
              <h5 className="text-white font-bold text-lg">TRANSFERT</h5>
              <p className="text-green-100/70 text-sm">Envoyer de l'argent</p>
            </div>
            <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center text-white">
              <i className="fas fa-chevron-right"></i>
            </div>
          </button>
        </div>
      </div>
      
      {/* Support floating button */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/50 flex items-center justify-center text-2xl z-40">
        <i className="fas fa-comment-dots"></i>
      </button>
    </div>
  );
};

export default UserHome;
