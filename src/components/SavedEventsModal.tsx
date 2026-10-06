import React from 'react';
import { ArtEvent } from '../types';
import { X, Bookmark, Ticket, Trash2, Calendar, MapPin } from 'lucide-react';
import { toPersianDigits, formatPrice } from '../utils/persianNumbers';
import { useTheme } from '../context/ThemeContext';

interface SavedEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedEvents?: ArtEvent[];
  onRemoveSave?: (id: string) => void;
  onBuyTicket?: (event: ArtEvent) => void;
  onOpenDetails?: (event: ArtEvent) => void;
}

export const SavedEventsModal: React.FC<SavedEventsModalProps> = ({
  isOpen,
  onClose,
  savedEvents = [],
  onRemoveSave = (_id: string) => {},
  onBuyTicket = (_event: ArtEvent) => {},
  onOpenDetails = (_event: ArtEvent) => {},
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-right" dir="rtl">
      <div 
        id="saved-events-modal"
        className={`w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[85vh] border transition-colors ${
          isDark 
            ? 'bg-[#0F121E] border-[#252C43] text-white' 
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/20'
        }`}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'border-[#21273F] bg-[#141827]' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF3366]/20 flex items-center justify-center text-[#FF3366]">
              <Bookmark className="w-4 h-4 fill-[#FF3366]" />
            </div>
            <div>
              <h3 className={`font-display font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                علاقه‌مندی‌ها و نشان‌شده‌ها
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                {toPersianDigits(savedEvents.length)} رویداد نشان‌شده
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isDark 
                ? 'hover:bg-white/10 text-zinc-400 hover:text-white' 
                : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
            }`}
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {savedEvents.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Bookmark className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
              <h4 className={`font-display font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                فهرست نشان‌شده‌های شما خالی است
              </h4>
              <p className={`text-xs mt-2 max-w-xs mx-auto leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                با کلیک روی نماد قلب روی کارت هر نمایشگاه یا اجرا، آن را برای دسترسی سریع بعدی ذخیره کنید.
              </p>
            </div>
          ) : (
            savedEvents.map((evt) => (
              <div
                key={evt.id}
                className={`flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-2xl border transition-all ${
                  isDark 
                    ? 'bg-[#151928] border-[#242A40] hover:border-[#FF3366]/30' 
                    : 'bg-slate-50 border-slate-200 hover:border-[#FF3366]/40 shadow-sm'
                }`}
              >
                <div 
                  onClick={() => {
                    onClose();
                    onOpenDetails(evt);
                  }}
                  className="w-full sm:w-28 h-24 rounded-xl overflow-hidden bg-zinc-900 shrink-0 cursor-pointer"
                >
                  <img
                    src={evt.imageUrl}
                    alt={evt.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-[#FF884D]">
                      {evt.categoryLabel}
                    </span>
                    <button
                      onClick={() => onRemoveSave(evt.id)}
                      className="text-zinc-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                      title="حذف از نشان‌شده‌ها"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 
                    onClick={() => {
                      onClose();
                      onOpenDetails(evt);
                    }}
                    className={`font-display font-bold text-sm hover:text-[#FF884D] transition-colors cursor-pointer truncate ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {evt.title}
                  </h4>
                  <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {evt.artist}
                  </p>
                  <div className={`flex items-center gap-3 text-[11px] mt-2 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#FF3366] ml-1" />
                      {toPersianDigits(evt.startDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-400 ml-1" />
                      {evt.city}
                    </span>
                  </div>
                </div>

                <div className={`w-full sm:w-auto flex sm:flex-col items-center justify-between sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 ${
                  isDark ? 'border-[#22283E]' : 'border-slate-200'
                }`}>
                  <span className={`font-display font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {formatPrice(evt.priceFrom)}
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onBuyTicket(evt);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#FF3366]/20 hover:brightness-110 transition-all cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>خرید</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
