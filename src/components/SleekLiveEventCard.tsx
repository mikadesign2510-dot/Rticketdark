import React, { useEffect, useRef, useState } from 'react';
import { ArtEvent } from '../types';
import { Calendar, MapPin, Ticket, Heart, Sparkles, Info } from 'lucide-react';
import { toPersianDigits, formatPrice } from '../utils/persianNumbers';
import { SiteSettings } from '../lib/db';
import { useTheme } from '../context/ThemeContext';

interface SleekLiveEventCardProps {
  event: ArtEvent;
  isSaved: boolean;
  onToggleSave: (eventId: string) => void;
  onOpenDetails: (event: ArtEvent) => void;
  onBuyTicket: (event: ArtEvent) => void;
  siteSettings?: SiteSettings;
}

export const SleekLiveEventCard: React.FC<SleekLiveEventCardProps> = ({
  event,
  isSaved,
  onToggleSave,
  onOpenDetails,
  onBuyTicket,
  siteSettings,
}) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'gallery':
        return 'text-[#FBBF24] border-[#F59E0B]/40 bg-[#F59E0B]/20';
      case 'theater':
        return 'text-[#FF5B85] border-[#FF3366]/40 bg-[#FF3366]/20';
      case 'concert':
        return 'text-[#A78BFA] border-[#8B5CF6]/40 bg-[#8B5CF6]/20';
      case 'immersive':
        return 'text-[#38BDF8] border-[#06B6D4]/40 bg-[#06B6D4]/20';
      default:
        return 'text-zinc-300 border-white/20 bg-white/10';
    }
  };

  const getCategoryGlow = (cat: string) => {
    switch (cat) {
      case 'gallery':
        return 'group-hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] group-hover:border-[#F59E0B]/50';
      case 'theater':
        return 'group-hover:shadow-[0_0_40px_-10px_rgba(255,51,102,0.5)] group-hover:border-[#FF3366]/50';
      case 'concert':
        return 'group-hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] group-hover:border-[#8B5CF6]/50';
      case 'immersive':
        return 'group-hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] group-hover:border-[#06B6D4]/50';
      default:
        return 'group-hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] group-hover:border-white/50';
    }
  };

  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '-50px' }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardStyle = {
    backgroundColor: siteSettings?.cardBgColor || (isDark ? '#0A0C13' : '#1E293B'),
    color: siteSettings?.cardTextColor || '#FFFFFF',
    borderRadius: siteSettings?.cardBorderRadius || '2rem',
  };

  return (
    <div
      ref={cardRef}
      id={`sleek-event-${event.id}`}
      onClick={() => onOpenDetails(event)}
      className={`group relative w-full aspect-[4/5] sm:aspect-[5/6] overflow-hidden transition-all duration-700 cursor-pointer shadow-xl text-right ${
        isDark ? 'border border-[#21263C]' : 'border border-slate-200/90 shadow-slate-300/50'
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${getCategoryGlow(event.category)}`}
      style={cardStyle}
    >
      {/* Background Poster Image */}
      <img
        src={event.imageUrl}
        alt={event.title}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out"
      />

      {/* Default Overlay Gradient (always present for bottom text legibility) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05060A] via-[#05060A]/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
      
      {/* Hover Dark Overlay (Darkens image for reading info) */}
      <div className="absolute inset-0 bg-[#05060A]/60 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-500" />

      {/* Top Badges */}
      <div className="absolute top-4 inset-x-4 flex items-start justify-between z-20">
        <div className="flex flex-col gap-2">
            <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-xs font-bold border backdrop-blur-md shadow-lg ${getCategoryColor(event.category)}`}>
              {event.categoryLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold bg-black/60 backdrop-blur-md border border-white/10 text-zinc-200 text-[11px] shadow-lg w-max">
              <Sparkles className="w-3.5 h-3.5 text-[#FF884D]" />
              {event.status}
            </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(event.id);
          }}
          className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-zinc-300 hover:text-white backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-lg"
          title={isSaved ? 'نشان‌شده' : 'نشان کردن'}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-[#FF3366] text-[#FF3366]' : ''}`} />
        </button>
      </div>

      {/* Content Container */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-col justify-end z-20 h-full pointer-events-none">
        
        <div className="w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-4 pointer-events-auto">
          
          <span className="text-xs font-bold text-[#FF884D] block mb-1 drop-shadow-md">
            {event.artist}
          </span>
          <h3 className="font-display font-black text-xl sm:text-2xl text-white leading-tight drop-shadow-lg line-clamp-2">
            {event.title}
          </h3>
          
          {/* Expanded Info wrapper (hidden -> visible with sliding effect) */}
          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-0 group-hover:opacity-100">
            <div className="overflow-hidden">
              <div className="pt-3 flex flex-col gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <p className="text-xs sm:text-sm text-zinc-200 line-clamp-2 leading-relaxed font-medium">
                  {event.subtitle}
                </p>
                <div className="space-y-1.5 text-xs font-semibold text-white drop-shadow-md">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FF3366]" />
                    <span>{toPersianDigits(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#06B6D4]" />
                    <span className="truncate">{event.venue}، {event.city}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Base Info (Price) -> Turns into Buttons on Hover */}
          <div className="mt-4 overflow-hidden relative h-[44px]">
             {/* Default Price View */}
             <div className="absolute inset-0 flex items-center gap-1.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-0 group-hover:translate-y-8">
                <span className="text-[11px] font-bold text-zinc-300">شروع از</span>
                <span className="font-black text-lg sm:text-xl text-amber-400 drop-shadow-md">{formatPrice(event.priceFrom)}</span>
             </div>

             {/* Hover Actions View */}
             <div className="absolute inset-0 flex items-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onBuyTicket(event); }}
                  className="flex-1 h-full rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-xl shadow-[#FF3366]/25 transition-all cursor-pointer hover:brightness-110 active:scale-95"
                >
                  <Ticket className="w-4 h-4" />
                  <span>خرید بلیت</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onOpenDetails(event); }}
                  className="px-4 h-full rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm backdrop-blur-md transition-all cursor-pointer flex items-center justify-center hover:bg-white/20"
                >
                  <Info className="w-5 h-5" />
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

