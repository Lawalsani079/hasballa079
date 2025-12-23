
import React, { useState, useEffect } from 'react';
import { MOCK_BANNERS } from '../constants';

const Banner: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % MOCK_BANNERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-48 sm:h-56 overflow-hidden group">
      <div 
        className="flex transition-transform duration-1000 ease-in-out h-full"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {MOCK_BANNERS.map((banner) => (
          <div key={banner.id} className="min-w-full h-full relative">
            <img 
              src={banner.image} 
              alt="Promo Recharge+" 
              className="w-full h-full object-cover"
            />
            {/* Overlay subtil */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20"></div>
          </div>
        ))}
      </div>
      
      {/* Pagination dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
        {MOCK_BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-1 rounded-full transition-all duration-500 ${i === activeIndex ? 'w-8 bg-yellow-400' : 'w-2 bg-white/40'}`}
          />
        ))}
      </div>
      
      {/* Navigation discrète */}
      <button 
        onClick={() => setActiveIndex(prev => (prev - 1 + MOCK_BANNERS.length) % MOCK_BANNERS.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
      >
        <i className="fas fa-chevron-left text-xs"></i>
      </button>
      <button 
        onClick={() => setActiveIndex(prev => (prev + 1) % MOCK_BANNERS.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
      >
        <i className="fas fa-chevron-right text-xs"></i>
      </button>
    </div>
  );
};

export default Banner;
