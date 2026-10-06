import React from 'react';
import { ArtEvent } from '../types';
import { MapPin, User, Calendar, Ticket } from 'lucide-react';
import { toPersianDigits, formatPrice } from '../utils/persianNumbers';
import { SiteSettings } from '../lib/db';
import { useTheme } from '../context/ThemeContext';

interface EventCardProps {
  event: ArtEvent;
  isSaved?: boolean;
  onToggleSave?: (eventId: string) => void;
  onOpenDetails: (event: ArtEvent) => void;
  onBuyTicket?: (event: ArtEvent) => void;
  viewMode?: 'grid' | 'list';
  siteSettings?: SiteSettings;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onOpenDetails,
  viewMode = 'grid',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Format director / artist label
  const directorLabel = event.artistRole 
    ? `${event.artistRole}: ${event.artist}` 
    : `کارگردان: ${event.artist}`;

  // -------------------------------------------------------------
  // LIST VIEW (در حالت نمایش لیستی)
  // -------------------------------------------------------------
  if (viewMode === 'list') {
    return (
      <div 
        id={`event-card-list-${event.id}`}
        onClick={() => onOpenDetails(event)}
        className={`group relative border p-3.5 transition-all duration-300 flex flex-col sm:flex-row items-center gap-4 cursor-pointer rounded-2xl ${
          isDark
            ? 'bg-[#111422] border-[#23283E] hover:border-[#FF884D]/40 shadow-md shadow-black/30'
            : 'bg-white border-slate-200/90 hover:border-[#FF884D]/40 shadow-sm hover:shadow-md'
        }`}
        dir="rtl"
      >
        {/* باکس پوستر با هاله محو هاور تا وسط تصویر */}
        <div className="relative w-full sm:w-36 aspect-[3/4] sm:h-48 rounded-xl overflow-hidden shrink-0 bg-slate-900">
          <img
            src={event.imageUrl}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* هاله محو تا وسط کادر با مشخصات اصلی و مهم کار */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/95 via-black/75 to-transparent backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-2.5 text-right pointer-events-none">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-white/95 truncate">
              <User className="w-3 h-3 text-[#FF884D] shrink-0" />
              <span className="truncate">{directorLabel}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-white/80 font-normal truncate mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-[#FF884D] shrink-0" />
              <span>{event.venue}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/90 font-medium pt-1 mt-1 border-t border-white/15">
              <span>شروع قیمت</span>
              <span className="font-bold text-[#FF884D]">{formatPrice(event.priceFrom)}</span>
            </div>
          </div>
        </div>

        {/* اسم کار و مشخصات کلی کنار باکس پوستر */}
        <div className="flex-1 min-w-0 w-full text-right py-1">
          <h3 className={`font-medium text-sm sm:text-base leading-snug group-hover:text-[#FF884D] transition-colors truncate ${
            isDark ? 'text-zinc-100' : 'text-slate-900'
          }`}>
            {event.title}
          </h3>
          <p className={`text-xs mt-1.5 font-normal ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            {event.venue} · {toPersianDigits(event.startDate)}
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // DEFAULT GRID VIEW (پیش‌نمایش پیش‌فرض صفحه اصلی)
  // ۱. حالت عادی: فقط و فقط باکس پوستر خالص
  // ۲. حالت هاور: هاله محو تا وسطای تصویر باز شده و مشخصات اصلی و مهم کار را نشان می‌دهد:
  //    - کارگردان / هنرمند
  //    - مکان و سالن اجرا
  //    - زمان و ساعت اجرا
  //    - شروع قیمت بلیت
  // ۳. اسم کار کوچک زیر باکس پوستر با فونت ریز خوانا
  // -------------------------------------------------------------
  return (
    <div
      id={`event-card-grid-${event.id}`}
      onClick={() => onOpenDetails(event)}
      className="group flex flex-col cursor-pointer select-none text-right transition-transform duration-300"
      dir="rtl"
    >
      {/* باکس پوستر */}
      <div className={`relative w-full aspect-[3/4] rounded-2xl overflow-hidden border transition-all duration-300 ${
        isDark 
          ? 'bg-[#111422] border-[#22283E] group-hover:border-[#FF884D]/50 shadow-lg shadow-black/40 group-hover:shadow-xl group-hover:shadow-[#FF884D]/10' 
          : 'bg-slate-100 border-slate-200/90 group-hover:border-[#FF884D]/50 shadow-sm group-hover:shadow-md'
      }`}>
        {/* تصویر خالص پوستر */}
        <img
          src={event.imageUrl}
          alt={event.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* هاله محو بازشونده از پایین تا وسطای تصویر در زمان هاور: نمایش مشخصات اصلی و مهم کار */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex flex-col justify-end p-3 sm:p-3.5 text-right pointer-events-none transform translate-y-1 group-hover:translate-y-0 space-y-1">
          {/* ۱. کارگردان / پدیدآورنده */}
          <div className="flex items-center gap-1.5 text-white text-xs sm:text-[13px] font-semibold leading-tight truncate drop-shadow-sm">
            <User className="w-3.5 h-3.5 text-[#FF884D] shrink-0" />
            <span className="truncate">{directorLabel}</span>
          </div>

          {/* ۲. مکان و سالن اجرا */}
          <div className="flex items-center gap-1.5 text-white/85 text-[11px] font-medium leading-tight truncate drop-shadow-sm">
            <MapPin className="w-3 h-3 text-[#FF884D] shrink-0" />
            <span className="truncate">{event.venue} ({event.city})</span>
          </div>

          {/* ۳. زمان و ساعت */}
          <div className="flex items-center gap-1.5 text-white/85 text-[10px] sm:text-[11px] font-medium leading-tight truncate drop-shadow-sm">
            <Calendar className="w-3 h-3 text-[#FF884D] shrink-0" />
            <span className="truncate">{toPersianDigits(event.startDate)}{event.time ? ` · ${toPersianDigits(event.time)}` : ''}</span>
          </div>

          {/* ۴. قیمت بلیت */}
          <div className="flex items-center justify-between text-white/90 text-[10px] sm:text-[11px] font-medium pt-1.5 border-t border-white/20">
            <span className="text-white/70 flex items-center gap-1">
              <Ticket className="w-3 h-3 text-[#FF884D]" />
              <span>قیمت از</span>
            </span>
            <span className="font-bold text-[#FF884D]">
              {formatPrice(event.priceFrom)}
            </span>
          </div>
        </div>
      </div>

      {/* اسم کار زیر باکس پوستر به صورت کوچک و خوانا */}
      <div className="pt-2 px-0.5">
        <h3 className={`text-xs sm:text-[13px] font-medium leading-relaxed line-clamp-1 group-hover:text-[#FF884D] transition-colors ${
          isDark ? 'text-zinc-200' : 'text-slate-800'
        }`}>
          {event.title}
        </h3>
      </div>
    </div>
  );
};
