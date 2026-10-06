import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, ChevronLeft, ArrowUpLeft, MapPin, Calendar, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ArtEvent } from '../types';
import { toPersianDigits, formatPrice } from '../utils/persianNumbers';
import { useTheme } from '../context/ThemeContext';

interface WideSplitSliderProps {
  events: ArtEvent[];
  onOpenDetails: (event: ArtEvent) => void;
  onBuyTicket: (event: ArtEvent) => void;
}

export const WideSplitSlider: React.FC<WideSplitSliderProps> = ({
  events,
  onOpenDetails,
  onBuyTicket,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Curate top featured active events (up to 5 items)
  const slides = events.filter((e) => e.isActive !== false).slice(0, 5);

  const [[currentIndex, direction], setPage] = useState<[number, number]>([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = slides.length;

  const paginate = useCallback(
    (newDirection: number) => {
      if (totalSlides <= 1) return;
      setPage(([curr]) => {
        let nextIndex = curr + newDirection;
        if (nextIndex < 0) nextIndex = totalSlides - 1;
        if (nextIndex >= totalSlides) nextIndex = 0;
        return [nextIndex, newDirection];
      });
    },
    [totalSlides]
  );

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    const newDir = index > currentIndex ? 1 : -1;
    setPage([index, newDir]);
  };

  // Auto-slide every 7.5 seconds when not interacting
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 7500);
    return () => clearInterval(timer);
  }, [totalSlides, isPaused, paginate]);

  if (!slides || slides.length === 0) return null;

  const currentEvent = slides[currentIndex];
  const nextEvent = slides[(currentIndex + 1) % totalSlides];

  // Editorial directional transition
  const transitionVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 35 : -35,
      filter: 'blur(4px)',
    }),
    center: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir < 0 ? 35 : -35,
      filter: 'blur(4px)',
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      dir="rtl"
    >
      {/* Outer Chic Editorial Frame */}
      <div
        className={`relative w-full rounded-[2rem] sm:rounded-[2.5rem] border transition-all duration-700 overflow-hidden ${
          isDark
            ? 'bg-[#0B0C12]/95 border-white/[0.08] text-white shadow-[0_25px_70px_rgba(0,0,0,0.7)]'
            : 'bg-white/95 border-slate-900/[0.08] text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.06)]'
        }`}
      >
        {/* Subtle Ambient Artwork Atmosphere Aura (Matches current slide image) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-20 transition-opacity duration-1000">
          <img
            key={currentEvent.id + '-ambient'}
            src={currentEvent.imageUrl}
            alt=""
            className="w-full h-full object-cover blur-[90px] scale-125 transform-gpu transition-all duration-1000"
          />
        </div>

        {/* Top Editorial Status Bar & Museum Issue Counter */}
        <div className={`relative z-20 px-6 sm:px-10 pt-6 sm:pt-8 pb-3 flex items-center justify-between border-b ${
          isDark ? 'border-white/[0.05]' : 'border-slate-100'
        }`}>
          {/* Curation Index & Kicker */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs tracking-widest text-[#FF884D] font-bold">
              [ ۰{toPersianDigits(currentIndex + 1)} ]
            </span>
            <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
            <span className={`text-xs font-medium tracking-wide uppercase ${
              isDark ? 'text-zinc-400' : 'text-slate-500'
            }`}>
              گزیده رویدادهای هنری فصل
            </span>
          </div>

          {/* Elegant Prev / Next Navigation Controls */}
          <div className="flex items-center gap-2">
            {/* Previous Slide Button */}
            <button
              onClick={() => paginate(-1)}
              aria-label="رویداد قبلی"
              className={`group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 cursor-pointer ${
                isDark
                  ? 'bg-white/[0.04] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/[0.08]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border border-slate-200'
              } active:scale-95`}
              title="قبلی"
            >
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Next Slide Button */}
            <button
              onClick={() => paginate(1)}
              aria-label="رویداد بعدی"
              className={`group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 cursor-pointer ${
                isDark
                  ? 'bg-white/[0.04] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/[0.08]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border border-slate-200'
              } active:scale-95`}
              title="بعدی"
            >
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Main Split Showcase Stage */}
        <div className="relative z-10 min-h-[460px] sm:min-h-[440px] flex items-center">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentEvent.id}
              custom={direction}
              variants={transitionVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full px-6 sm:px-10 py-6 sm:py-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                
                {/* 1. Large Architectural Artwork Viewport (7 Cols on Desktop) */}
                <div className="lg:col-span-7 order-1 lg:order-2 w-full">
                  <div
                    onClick={() => onOpenDetails(currentEvent)}
                    className="relative w-full h-[280px] sm:h-[380px] lg:h-[430px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer group shadow-2xl"
                  >
                    {/* The Artwork Photo */}
                    <img
                      src={currentEvent.imageUrl}
                      alt={currentEvent.title}
                      className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                      loading="eager"
                    />

                    {/* Subtle Cinematic Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                    {/* Floating Fine-art Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-semibold shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF884D]" />
                      <span>{currentEvent.categoryLabel || 'رویداد هنری'}</span>
                    </div>

                    {/* Floating Curator Statement Button (Hover overlay) */}
                    <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between text-white text-xs font-medium">
                      <span className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 font-bold">
                        {currentEvent.city} · {currentEvent.venue}
                      </span>

                      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span>کاوش اثر</span>
                        <ArrowUpLeft className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Refined Editorial Typography & Booking Controls (5 Cols on Desktop) */}
                <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-between py-2">
                  <div className="space-y-4 sm:space-y-5">
                    
                    {/* Metadata Header line: Status & City */}
                    <div className="flex items-center gap-2.5 text-xs">
                      {currentEvent.status && (
                        <span className="text-[#FF884D] font-extrabold tracking-wide">
                          {currentEvent.status}
                        </span>
                      )}
                      <span className="opacity-30">•</span>
                      <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>
                        {toPersianDigits(currentEvent.startDate)}
                      </span>
                    </div>

                    {/* Main Event Title */}
                    <div>
                      <h2
                        onClick={() => onOpenDetails(currentEvent)}
                        className={`font-display font-black text-2xl sm:text-3xl lg:text-[2.25rem] leading-[1.3] transition-colors cursor-pointer ${
                          isDark
                            ? 'text-white hover:text-zinc-200'
                            : 'text-slate-900 hover:text-slate-700'
                        }`}
                      >
                        {currentEvent.title}
                      </h2>

                      {/* Artist Credit */}
                      <p className="text-xs sm:text-sm font-semibold text-[#FF884D] mt-2 flex items-center gap-2">
                        <span>اثر {currentEvent.artist}</span>
                        {currentEvent.artistRole && (
                          <>
                            <span className="opacity-40">•</span>
                            <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>
                              {currentEvent.artistRole}
                            </span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Editorial Excerpt */}
                    <p className={`text-xs sm:text-sm leading-relaxed line-clamp-3 font-normal ${
                      isDark ? 'text-zinc-300/90' : 'text-slate-600'
                    }`}>
                      {currentEvent.description || currentEvent.curatorStatement}
                    </p>

                    {/* Micro Specifications List */}
                    <div className={`pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs border-t ${
                      isDark ? 'border-white/[0.06] text-zinc-400' : 'border-slate-100 text-slate-500'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 opacity-60 text-[#FF884D]" />
                        <span>{currentEvent.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 opacity-60 text-[#FF884D]" />
                        <span>ساعت {toPersianDigits(currentEvent.time)}</span>
                      </div>
                    </div>

                  </div>

                  {/* Actions & Price Bar */}
                  <div className={`pt-6 mt-6 flex items-center justify-between gap-4 border-t ${
                    isDark ? 'border-white/[0.06]' : 'border-slate-100'
                  }`}>
                    {/* Primary Reservation CTA */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onBuyTicket(currentEvent)}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 cursor-pointer active:scale-95 shadow-lg ${
                          isDark
                            ? 'bg-white text-black hover:bg-zinc-200 shadow-white/5'
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'
                        }`}
                      >
                        <span>رزرو و خرید بلیت</span>
                        <ArrowUpLeft className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenDetails(currentEvent)}
                        className={`px-3 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                          isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        کاتالوگ رویداد
                      </button>
                    </div>

                    {/* Price Tag */}
                    <div className="text-left">
                      <span className={`text-[10px] block font-medium ${isDark ? 'text-zinc-400' : 'text-slate-400'}`}>
                        شروع قیمت
                      </span>
                      <span className={`font-display font-extrabold text-sm sm:text-base ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {formatPrice(currentEvent.priceFrom)}
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Interactive Filmstrip & Navigation Bar */}
        <div className={`px-6 sm:px-10 py-3.5 border-t flex items-center justify-between transition-colors ${
          isDark ? 'border-white/[0.05] bg-black/40' : 'border-slate-100 bg-slate-50/60'
        }`}>
          {/* Filmstrip Slide Selector (Clickable numbers & active progress bar) */}
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(idx)}
                className={`flex items-center gap-2 group transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? isDark ? 'text-white' : 'text-slate-950 font-bold'
                    : isDark ? 'text-zinc-400 hover:text-zinc-300' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`relative h-1.5 transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'w-8 sm:w-10 bg-gradient-to-r from-[#FF884D] to-[#FF3366]'
                    : isDark ? 'w-2 bg-white/20 group-hover:bg-white/40' : 'w-2 bg-slate-300 group-hover:bg-slate-400'
                }`} />
                <span className="text-[11px] font-mono hidden sm:inline">
                  ۰{toPersianDigits(idx + 1)}
                </span>
              </button>
            ))}
          </div>

          {/* Next Slide Sneak-peek Preview */}
          <div 
            onClick={() => paginate(1)}
            className="flex items-center gap-2 cursor-pointer group text-xs transition-colors"
          >
            <span className={`text-[11px] hidden md:inline font-medium ${
              isDark ? 'text-zinc-400 group-hover:text-zinc-300' : 'text-slate-500 group-hover:text-slate-800'
            }`}>
              رویداد بعدی:
            </span>
            <span className={`font-semibold truncate max-w-[140px] sm:max-w-[180px] ${
              isDark ? 'text-zinc-300 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-950'
            }`}>
              {nextEvent.title}
            </span>
            <ChevronLeft className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-transform group-hover:-translate-x-1" />
          </div>
        </div>

      </div>
    </div>
  );
};
