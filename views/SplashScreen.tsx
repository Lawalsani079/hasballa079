
import React from 'react';
import { ASSETS } from '../constants';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#081a2b] flex flex-col items-center justify-center">
      <div className="w-56 h-56 mb-8 flex items-center justify-center relative">
        <img 
          src={ASSETS.logo} 
          alt="Recharge+" 
          className="max-w-full max-h-full object-contain z-10"
        />
        {/* Glow effect behind logo */}
        <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full scale-150"></div>
      </div>
      
      <div className="text-center px-6 z-10">
        <h1 className="text-white text-5xl font-black tracking-tighter uppercase mb-1">Recharge+</h1>
        <p className="text-yellow-400 font-black text-[11px] tracking-[0.4em] uppercase mb-10">Niger</p>
        
        <div className="space-y-2 mb-12">
          <p className="text-white/60 font-bold text-sm">Dépôts & Retraits Instantanés</p>
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-4 bg-white/10"></span>
            <p className="text-blue-400 font-black text-[9px] uppercase tracking-widest">Le Champion du Pari</p>
            <span className="h-[1px] w-4 bg-white/10"></span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
        <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-1/3 absolute animate-[loading_1.8s_infinite_ease-in-out]"></div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { left: -40%; width: 30%; }
          50% { width: 50%; }
          100% { left: 110%; width: 30%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
