
import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-pulse">
      <div className="w-48 h-48 mb-8 relative">
        {/* Logo Hexagonal R+ */}
        <div className="absolute inset-0 bg-blue-600 rounded-[2.5rem] rotate-45 transform flex items-center justify-center shadow-2xl shadow-blue-200">
           <div className="rotate-[-45deg] flex items-baseline">
             <span className="text-white text-8xl font-black italic">R</span>
             <span className="text-yellow-400 text-5xl font-bold">+</span>
           </div>
        </div>
      </div>
      
      <div className="text-center px-6">
        <h1 className="text-blue-900 text-5xl font-black tracking-tighter uppercase mb-1">Recharge+</h1>
        <p className="text-blue-600 font-black text-[11px] tracking-[0.3em] uppercase mb-4">Niger</p>
        
        {/* Nouveau Slogan */}
        <div className="space-y-1 mb-8">
          <p className="text-gray-500 font-bold text-sm">Dépôts & Retraits Instantanés</p>
          <p className="text-blue-500 font-black text-[10px] uppercase tracking-widest">Pariez sans limites, encaissez sans attendre.</p>
        </div>
      </div>
      
      <div className="mt-4 w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 w-1/3 animate-[loading_1.5s_infinite_ease-in-out]"></div>
      </div>
      
      <p className="mt-6 text-gray-300 font-bold text-[9px] uppercase tracking-widest">Chargement de votre portefeuille...</p>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); width: 30%; }
          50% { width: 60%; }
          100% { transform: translateX(400%); width: 30%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
