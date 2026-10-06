import React, { useState, useEffect } from 'react';
import { SecondBanner, SiteSettings } from '../lib/db';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface SecondSliderProps {
  banners: SecondBanner[];
  siteSettings: SiteSettings | null;
}

export const SecondSlider: React.FC<SecondSliderProps> = ({ banners, siteSettings }) => {
  const activeBanners = banners.filter(b => b.isActive).sort((a, b) => a.order - b.order);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (!siteSettings?.secondSliderActive || activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIdx];

  const goNext = () => setCurrentIdx((prev) => (prev + 1) % activeBanners.length);
  const goPrev = () => setCurrentIdx((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);

  const radius = siteSettings.secondSliderRadius || '1.5rem';
  const height = siteSettings.secondSliderHeight || '180px';
  const bgColor = siteSettings.secondSliderBgColor || '#0A0C13';
  const textColor = siteSettings.secondSliderTextColor || '#ffffff';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative z-10">
      <div 
        className="relative overflow-hidden shadow-2xl group flex items-center justify-center transition-all duration-700"
        style={{ 
          backgroundColor: bgColor,
          borderRadius: radius,
          height: height
        }}
      >
        {activeBanners.map((banner, idx) => (
          <div 
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-400 ${idx === currentIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Background Image with Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${banner.imageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center p-8 sm:p-12 z-20" style={{ color: textColor }}>
              <h3 className="text-xl sm:text-3xl font-black mb-2 drop-shadow-md">{banner.title}</h3>
              {banner.subtitle && <p className="text-sm sm:text-lg opacity-90 drop-shadow-md max-w-xl">{banner.subtitle}</p>}
              {banner.linkUrl && (
                <div className="mt-4">
                  <a href={banner.linkUrl} className="inline-block bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors border border-white/20">
                    مشاهده بیشتر
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        {activeBanners.length > 1 && (
          <>
            <button 
              onClick={goNext}
              className="absolute right-4 z-30 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all border border-white/10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={goPrev}
              className="absolute left-4 z-30 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all border border-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
              {activeBanners.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentIdx ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/70'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
