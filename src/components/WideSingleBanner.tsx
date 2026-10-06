import React from 'react';
import { Calendar, ArrowUpLeft } from 'lucide-react';
import { ArtEvent } from '../types';
import { toPersianDigits } from '../utils/persianNumbers';
import { useTheme } from '../context/ThemeContext';

interface WideSingleBannerProps {
  events: ArtEvent[];
  onOpenDetails: (event: ArtEvent) => void;
  onBuyTicket: (event: ArtEvent) => void;
}

export const WideSingleBanner: React.FC<WideSingleBannerProps> = ({
  events,
  onOpenDetails,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const activeEvents = events.filter((e) => e.isActive !== false);
  if (!activeEvents || activeEvents.length === 0) return null;

  // Single static wide banner (no slider, minimal: only title & time)
  const current = activeEvents[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none" dir="rtl">
      {/* Outer Wide Banner Frame */}
      <div
        onClick={() => onOpenDetails(current)}
        className={`relative w-full rounded-2xl sm:rounded-3xl border overflow-hidden group cursor-pointer transition-all duration-300 min-h-[340px] sm:min-h-[400px] lg:h-[460px] flex flex-col justify-end p-6 sm:p-10 lg:p-12 ${
          isDark
            ? 'bg-[#0E1017] border-white/10 hover:border-white/20 shadow-2xl shadow-black/60'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xl shadow-slate-200/50'
        }`}
      >
        {/* Full Artwork Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={current.wideBannerUrl || current.imageUrl}
            alt={current.title}
            className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            loading="eager"
          />
          {/* Minimal Dark Gradient for readability while keeping art prominent */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        </div>

        {/* Minimal Hover Indicator (Top Left) */}
        <div className="absolute top-6 left-6 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 group-hover:text-white group-hover:bg-[#FF884D] group-hover:border-[#FF884D] transition-all">
          <ArrowUpLeft className="w-4 h-4" />
        </div>

        {/* Bottom: فقط اسم کار و زمان */}
        <div className="relative z-10 max-w-2xl space-y-2">
          {/* اسم کار */}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black text-white leading-tight tracking-tight group-hover:text-[#FF884D] transition-colors">
            {current.title}
          </h2>

          {/* زمان */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-white/85 font-medium">
            <Calendar className="w-4 h-4 text-[#FF884D]" />
            <span>{toPersianDigits(current.startDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
