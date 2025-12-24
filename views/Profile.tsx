
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  onChat: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onChat }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 bg-[#081a2b] overflow-y-auto pb-32">
      <div className="relative h-64 bg-gradient-to-br from-blue-600 to-blue-800 rounded-b-[4rem] flex flex-col items-center justify-center shadow-xl">
        <div className="absolute top-10 right-6">
           <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
             <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
             <span className="text-white text-[9px] font-black uppercase">Vérifié</span>
           </div>
        </div>
        <div className="w-28 h-28 bg-white/10 rounded-[2.5rem] p-1.5 shadow-2xl backdrop-blur-xl border border-white/20">
           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="User" className="w-full h-full rounded-[2rem] bg-[#081a2b]/50" />
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-white text-xl font-black tracking-tight">{user.name}</h2>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{user.phone}</p>
        </div>
      </div>

      <div className="px-6 -mt-8 space-y-6">
        {/* Referral Card */}
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          <div className="relative flex justify-between items-center mb-4">
             <div>
                <p className="text-[#081a2b]/60 text-[10px] font-black uppercase tracking-widest">Gains Parrainage</p>
                <h3 className="text-[#081a2b] text-3xl font-black">{user.referralBalance || 0} <span className="text-sm">FCFA</span></h3>
             </div>
             <div className="w-12 h-12 bg-[#081a2b]/10 rounded-2xl flex items-center justify-center text-[#081a2b] text-xl">
                <i className="fas fa-gift"></i>
             </div>
          </div>
          <div className="bg-[#081a2b] p-4 rounded-2xl flex items-center justify-between border border-white/5">
             <div>
                <p className="text-white/40 text-[8px] font-black uppercase mb-1">Mon Code</p>
                <p className="text-white font-black tracking-widest">{user.referralCode}</p>
             </div>
             <button onClick={handleCopy} className="bg-yellow-400 text-[#081a2b] px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all active:scale-90">
                {copied ? 'Copié !' : 'Partager'}
             </button>
          </div>
          <p className="mt-4 text-[#081a2b]/60 text-[9px] font-bold text-center uppercase tracking-widest">Gagnez 500 FCFA pour chaque ami inscrit !</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/10">
          <h3 className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-4 px-2">Mon Compte</h3>
          <div className="space-y-1">
             <button className="w-full flex items-center gap-4 p-3 rounded-2xl active:bg-white/5 group">
                <div className="w-11 h-11 bg-white/5 text-white rounded-2xl flex items-center justify-center border border-white/5"><i className="fas fa-shield-halved"></i></div>
                <div className="flex-1 text-left"><p className="font-black text-white text-sm">Sécurité</p></div>
                <i className="fas fa-chevron-right text-[10px] text-white/10"></i>
             </button>
             <button onClick={onChat} className="w-full flex items-center gap-4 p-3 rounded-2xl active:bg-white/5 group">
                <div className="w-11 h-11 bg-white/5 text-blue-400 rounded-2xl flex items-center justify-center border border-white/5"><i className="fas fa-comments"></i></div>
                <div className="flex-1 text-left"><p className="font-black text-white text-sm">Support</p></div>
                <i className="fas fa-chevron-right text-[10px] text-white/10"></i>
             </button>
          </div>
        </div>

        <button onClick={onLogout} className="w-full bg-red-500/10 text-red-400 font-black py-5 rounded-[2.5rem] flex items-center justify-center gap-3 border border-red-500/20 active:scale-95 transition-all">
          <i className="fas fa-power-off text-sm"></i> DÉCONNEXION
        </button>
      </div>
    </div>
  );
};

export default Profile;
