import React from 'react';
import { Calendar, ArrowUpLeft } from 'lucide-react';
import { ArtEvent } from '../types';
import { toPersianDigits } from '../utils/persianNumbers';
import { useTheme } from '../context/ThemeContext';

interface BentoHeroProps {
  events: ArtEvent[];
  onOpenDetails: (event: ArtEvent) => void;
  onBuyTicket: (event: ArtEvent) => void;
}

export const BentoHero: React.FC<BentoHeroProps> = ({ events, onOpenDetails }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const activeEvents = events.filter((e) => e.isActive !== false);
  if (!activeEvents || activeEvents.length === 0) return null;

  // Static 3-piece layout: Event 1 (Large Right), Events 2 & 3 (Stacked Left)
  const mainEvent = activeEvents[0];
  const secondEvent = activeEvents[1] || activeEvents[0];
  const thirdEvent = activeEvents[2] || activeEvents[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none" dir="rtl">
      {/* 3-Piece Bento Grid: Large Banner Right (8 cols), 2 Small Stacked Banners Left (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 lg:h-[480px]">
        
        {/* ========================================================= */}
        {/* 1. LARGE HERO BANNER (سمت راست - بنر بزرگ خلوت و مینیمال) */}
        {/* ========================================================= */}
        <div 
          onClick={() => onOpenDetails(mainEvent)}
          className={`lg:col-span-8 relative rounded-2xl sm:rounded-3xl overflow-hidden group cursor-pointer border transition-all duration-300 h-[380px] sm:h-[430px] lg:h-full flex flex-col justify-end p-6 sm:p-8 lg:p-10 ${
            isDark 
              ? 'bg-[#0E1017] border-white/10 hover:border-white/20 shadow-2xl shadow-black/60' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xl shadow-slate-200/50'
          }`}
        >
          {/* Static Artwork Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src={mainEvent.wideBannerUrl || mainEvent.imageUrl}
              alt={mainEvent.title}
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              loading="eager"
            />
            {/* Subtle Gradient for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          </div>

          {/* Minimal Hover Indicator (Top Left) */}
          <div className="absolute top-5 left-5 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 group-hover:text-white group-hover:bg-[#FF884D] group-hover:border-[#FF884D] transition-all">
            <ArrowUpLeft className="w-4 h-4" />
          </div>

          {/* Bottom Area: فقط اسم کار و زمان */}
          <div className="relative z-10 space-y-2">
            {/* اسم کار */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white leading-tight tracking-tight group-hover:text-[#FF884D] transition-colors">
              {mainEvent.title}
            </h2>

            {/* زمان */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/85 font-medium">
              <Calendar className="w-4 h-4 text-[#FF884D]" />
              <span>{toPersianDigits(mainEvent.startDate)}</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. TWO SMALL STACKED BANNERS (سمت چپ - ۲ بنر کوچک خلوت)    */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5 lg:gap-6 h-full justify-between">
          
          {/* Top Small Banner (بنر کوچک بالا) */}
          <div
            onClick={() => onOpenDetails(secondEvent)}
            className={`flex-1 relative rounded-2xl sm:rounded-3xl overflow-hidden group cursor-pointer border transition-all duration-300 min-h-[180px] lg:min-h-0 flex flex-col justify-end p-5 sm:p-6 ${
              isDark 
                ? 'bg-[#0E1017] border-white/10 hover:border-white/20 shadow-lg shadow-black/40' 
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-md shadow-slate-200/50'
            }`}
          >
            {/* Background Artwork */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <img
                src={secondEvent.imageUrl}
                alt={secondEvent.title}
                className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            </div>

            {/* Minimal Hover Indicator (Top Left) */}
            <div className="absolute top-4 left-4 z-10 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 group-hover:text-white group-hover:bg-[#FF884D] group-hover:border-[#FF884D] transition-all">
              <ArrowUpLeft className="w-3.5 h-3.5" />
            </div>

            {/* Bottom: فقط اسم کار و زمان */}
            <div className="relative z-10 space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1 group-hover:text-[#FF884D] transition-colors">
                {secondEvent.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-white/85">
                <Calendar className="w-3.5 h-3.5 text-[#FF884D]" />
                <span>{toPersianDigits(secondEvent.startDate)}</span>
              </div>
            </div>
          </div>

          {/* Bottom Small Banner (بنر کوچک پایین) */}
          <div
            onClick={() => onOpenDetails(thirdEvent)}
            className={`flex-1 relative rounded-2xl sm:rounded-3xl overflow-hidden group cursor-pointer border transition-all duration-300 min-h-[180px] lg:min-h-0 flex flex-col justify-end p-5 sm:p-6 ${
              isDark 
                ? 'bg-[#0E1017] border-white/10 hover:border-white/20 shadow-lg shadow-black/40' 
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-md shadow-slate-200/50'
            }`}
          >
            {/* Background Artwork */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <img
                src={thirdEvent.imageUrl}
                alt={thirdEvent.title}
                className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            </div>

            {/* Minimal Hover Indicator (Top Left) */}
            <div className="absolute top-4 left-4 z-10 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 group-hover:text-white group-hover:bg-[#FF884D] group-hover:border-[#FF884D] transition-all">
              <ArrowUpLeft className="w-3.5 h-3.5" />
            </div>

            {/* Bottom: فقط اسم کار و زمان */}
            <div className="relative z-10 space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1 group-hover:text-[#FF884D] transition-colors">
                {thirdEvent.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-white/85">
                <Calendar className="w-3.5 h-3.5 text-[#FF884D]" />
                <span>{toPersianDigits(thirdEvent.startDate)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
