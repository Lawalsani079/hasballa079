
import React, { useState, useEffect } from 'react';
import { BannerItem } from '../types';
import { MOCK_BANNERS } from '../constants';

interface BannerProps {
  banners: BannerItem[];
}

const Banner: React.FC<BannerProps> = ({ banners }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const displayBanners = (banners.length > 0 ? banners : MOCK_BANNERS).slice(0, 8);

  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % displayBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [displayBanners.length]);

  return (
    <div className="relative w-full h-[180px] overflow-hidden bg-white border border-slate-50">
      <div 
        className="flex h-full transition-transform duration-1000 cubic-bezier(0.19, 1, 0.22, 1)"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {displayBanners.map((banner, i) => (
          <div key={banner.id} className="min-w-full h-full relative">
            <img 
              src={banner.image} 
              alt={`Promo ${i + 1}`} 
              className="w-full h-full object-cover"
            />
            {/* Shimmer Overlay pour le light mode */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-white/10"></div>
          </div>
        ))}
      </div>
      
      {/* Indicator dots */}
      <div className="absolute bottom-4 left-6 flex gap-1.5">
        {displayBanners.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-700 ${i === activeIndex ? 'w-6 bg-blue-600 shadow-[0_0_8px_rgba(29,78,216,0.2)]' : 'w-2 bg-slate-200'}`}
          />
        ))}
      </div>
      
      {/* Promo Badge */}
      <div className="absolute top-4 right-6 bg-yellow-400 text-slate-900 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md animate-bounce">
        PROMO LIVE
      </div>
    </div>
  );
};

export default Banner;
