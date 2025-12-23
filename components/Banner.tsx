
import React, { useState, useEffect } from 'react';
import { MOCK_BANNERS } from '../constants';

const Banner: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % MOCK_BANNERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-44 overflow-hidden rounded-[2rem] shadow-lg mb-8">
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {MOCK_BANNERS.map((banner) => (
          <div key={banner.id} className="min-w-full h-full relative">
            <img src={banner.image} alt="Promo" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"></div>
          </div>
        ))}
      </div>
      
      {/* Pagination dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {MOCK_BANNERS.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-yellow-400' : 'w-2 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
