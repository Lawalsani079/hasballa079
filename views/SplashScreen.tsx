
import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-pulse">
      <div className="w-48 h-48 mb-8 relative">
        {/* Mocking the R+ Hexagon Logo */}
        <div className="absolute inset-0 bg-blue-600 rounded-[2.5rem] rotate-45 transform flex items-center justify-center">
           <div className="rotate-[-45deg] flex items-baseline">
             <span className="text-white text-8xl font-black italic">R</span>
             <span className="text-yellow-400 text-5xl font-bold">+</span>
           </div>
        </div>
      </div>
      <h1 className="text-blue-700 text-4xl font-black tracking-tighter uppercase mb-2">Recharge+</h1>
      <p className="text-gray-400 font-medium tracking-widest text-sm">CHARGEMENT EN COURS...</p>
      
      <div className="mt-12 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 w-1/3 animate-[loading_1.5s_infinite_ease-in-out]"></div>
      </div>
      
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
