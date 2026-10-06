import React, { useState, useEffect } from 'react';
import { ArtEvent } from '../types';
import { ChevronRight, ChevronLeft, Ticket, Calendar, MapPin, Sparkles, Star } from 'lucide-react';
import { toPersianDigits, formatPrice } from '../utils/persianNumbers';
import { SiteSettings } from '../lib/db';
import { motion, AnimatePresence } from 'motion/react';

interface FeaturedCinemaBannerProps {
  events: ArtEvent[];
  onOpenDetails: (event: ArtEvent) => void;
  onBuyTicket: (event: ArtEvent) => void;
  siteSettings?: SiteSettings | null;
}

export const FeaturedCinemaBanner: React.FC<FeaturedCinemaBannerProps> = ({
  events,
  onOpenDetails,
  onBuyTicket,
  siteSettings,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Filter top featured events based on settings
  const featuredList = siteSettings?.mainSliderEventIds?.length 
    ? events.filter(e => siteSettings.mainSliderEventIds!.includes(e.id))
    : events.slice(0, 5);

  useEffect(() => {
    if (!isAutoPlay || featuredList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlay, featuredList.length]);

  // If disabled, don't render anything
  if (siteSettings && siteSettings.mainSliderActive === false) {
    return null;
  }

  if (featuredList.length === 0) return null;

  const current = featuredList[currentIndex];

  const handlePrev = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    if (diffX > 45) {
      handleNext();
    } else if (diffX < -45) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  return (
    <div 
      id="cinema-banner-container"
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Modern Split Bento Layout: Image on Left (Desktop RTL), Content on Right */}
      <div 
        className="relative w-full flex flex-col lg:flex-row-reverse h-[620px] sm:h-[560px] lg:h-[500px] xl:h-[550px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border"
        style={{
          backgroundColor: siteSettings?.mainSliderBgColor || '#0A0C13',
          borderColor: siteSettings?.mainSliderBorderColor || '#2B314B',
        }}
      >
        
        {/* RIGHT SIDE (Content) - Order 2 in Desktop (flex-row-reverse), Order 2 in Mobile (bottom) */}
        <div 
          className="w-full lg:w-[45%] xl:w-[40%] h-[340px] sm:h-[300px] lg:h-full flex flex-col justify-between p-5 sm:p-8 lg:p-10 relative z-20 overflow-hidden"
          style={{ backgroundColor: siteSettings?.mainSliderBgColor || '#0A0C13' }}
        >
          
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${current.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex flex-col h-full justify-between"
            >
              <div>
                {/* Promo & Star Rating Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>ویژه</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{toPersianDigits(current.rating)} / ۵</span>
                  </div>
                </div>

                {/* Title & Artist */}
                <h2 
                  onClick={() => onOpenDetails(current)}
                  className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white leading-tight mb-2 sm:mb-3 cursor-pointer hover:text-[#FF3366] transition-colors line-clamp-1 sm:line-clamp-2"
                >
                  {current.title}
                </h2>

                <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed mb-4 sm:mb-6 line-clamp-2">
                  {current.subtitle} — با حضور <strong className="text-white font-semibold">{current.artist}</strong>
                </p>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 sm:mb-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">تاریخ برگزاری</span>
                    <div className="flex items-center gap-1.5 text-zinc-200 text-xs sm:text-sm font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-[#FF3366] shrink-0" />
                      <span className="truncate">{toPersianDigits(current.startDate)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">محل برگزاری</span>
                    <div className="flex items-center gap-1.5 text-zinc-200 text-xs sm:text-sm font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
                      <span className="truncate">{current.venue}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
                  <button
                    id={`buy-banner-btn-${current.id}`}
                    onClick={() => onBuyTicket(current)}
                    className="flex-1 h-11 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#FF5533] hover:from-[#FF4477] hover:to-[#FF6644] active:scale-95 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,51,102,0.3)] transition-all cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>خرید بلیت از {formatPrice(current.priceFrom)}</span>
                  </button>
                  <button
                    onClick={() => onOpenDetails(current)}
                    className="px-5 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center cursor-pointer"
                  >
                    جزئیات
                  </button>
                </div>

                {/* Navigation Controls (Dots & Arrows) */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  {/* Slide Indicators / Dots */}
                  <div className="flex items-center gap-1.5">
                    {featuredList.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setIsAutoPlay(false);
                          setCurrentIndex(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === currentIndex ? 'w-6 bg-[#FF3366]' : 'w-1.5 bg-white/20 hover:bg-white/40'
                        }`}
                        title={`بنر ${toPersianDigits(idx + 1)}`}
                      />
                    ))}
                  </div>

                  {/* Arrows */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleNext}
                      className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                      title="بعدی"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handlePrev}
                      className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                      title="قبلی"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
        </div>

        {/* LEFT SIDE (Image) - Order 1 in Desktop (flex-row-reverse), Order 1 in Mobile (top) */}
        <div className="w-full lg:w-[55%] xl:w-[60%] h-[280px] sm:h-[260px] lg:h-full relative overflow-hidden bg-zinc-900 border-b lg:border-b-0 lg:border-l border-[#2B314B]/50 shrink-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={current.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              src={current.imageUrl}
              alt={current.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </AnimatePresence>
          
          {/* Subtle blending gradient from content to image for desktop */}
          <div className="hidden lg:block absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0A0C13] to-transparent z-10" />
          {/* Subtle blending gradient for mobile */}
          <div className="block lg:hidden absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0C13] to-transparent z-10" />

          {/* Floating Category Badge inside Image */}
          <div className="absolute top-6 right-6 z-20">
             <span className="px-4 py-2 rounded-xl text-xs font-black bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-xl">
              {current.categoryLabel}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
