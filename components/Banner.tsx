
import React, { useState, useEffect } from 'react';
import { MOCK_BANNERS } from '../constants';

const Banner: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (MOCK_BANNERS.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % MOCK_BANNERS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-56 sm:h-72 overflow-hidden shadow-lg bg-blue-900/20">
      <div 
        className="flex transition-transform duration-1000 ease-in-out h-full"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {MOCK_BANNERS.map((banner) => (
          <div key={banner.id} className="min-w-full h-full relative">
            <img 
              src={banner.image} 
              alt={`Promo ${banner.id}`} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback si l'image locale dans banners/ n'existe pas
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex flex-col items-center justify-center bg-blue-600/30 text-white/30 p-8 text-center border-b border-white/5">
                      <i class="fas fa-image text-5xl mb-4"></i>
                      <p class="text-[10px] font-black uppercase tracking-widest px-4">Placez l'image dans le dossier 'banners/'</p>
                      <p class="text-[8px] font-bold opacity-50 mt-2 italic">${banner.image}</p>
                    </div>
                  `;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent"></div>
          </div>
        ))}
      </div>
      
      {MOCK_BANNERS.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {MOCK_BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1 rounded-full transition-all duration-500 ${i === activeIndex ? 'w-8 bg-yellow-400' : 'w-2 bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Banner;
