import React, { useState } from 'react';
import { MapPin, User, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { toPersianDigits } from '../utils/persianNumbers';

interface TrendingCardProps {
  rank?: number;
  title: string;
  venue: string;
  date?: string;
  imageUrl: string;
  badgeText?: string;
  director?: string;
  artist?: string;
  onClick?: () => void;
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=600&q=80',
];

const TrendingCard: React.FC<TrendingCardProps> = ({
  rank = 1,
  title,
  venue,
  date,
  imageUrl,
  director,
  artist,
  onClick,
}) => {
  const [imgSrc, setImgSrc] = useState(imageUrl);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleImageError = () => {
    const fallback = FALLBACK_IMAGES[(rank - 1) % FALLBACK_IMAGES.length];
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  const directorName = director || artist || 'کارگردان / اثر';

  return (
    <div
      onClick={onClick}
      className="group relative w-[180px] sm:w-[210px] flex flex-col cursor-pointer select-none text-right shrink-0 transition-transform duration-300"
      dir="rtl"
    >
      {/* باکس پوستر: فقط تصویر پوستر مشخص باشد */}
      <div className={`relative aspect-[3/4] w-full rounded-2xl overflow-hidden border transition-all duration-300 ${
        isDark 
          ? 'bg-[#0A0C13] border-[#22283E] group-hover:border-[#FF884D]/50 shadow-lg shadow-black/40 group-hover:shadow-xl group-hover:shadow-[#FF884D]/10' 
          : 'bg-slate-100 border-slate-200/90 group-hover:border-[#FF884D]/50 shadow-sm group-hover:shadow-md'
      }`}>
        <img
          src={imgSrc}
          alt={title}
          onError={handleImageError}
          draggable={false}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] pointer-events-none select-none"
        />

        {/* هاله محو تا وسطای تصویر در زمان هاور: نمایش مشخصات اصلی و مهم کار */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex flex-col justify-end p-3 text-right pointer-events-none transform translate-y-1 group-hover:translate-y-0 space-y-1">
          {/* کارگردان */}
          <div className="flex items-center gap-1.5 text-white text-xs font-semibold leading-tight truncate drop-shadow-sm">
            <User className="w-3.5 h-3.5 text-[#FF884D] shrink-0" />
            <span className="truncate">{directorName}</span>
          </div>

          {/* مکان اجرا */}
          <div className="flex items-center gap-1.5 text-white/85 text-[11px] font-medium leading-tight truncate drop-shadow-sm">
            <MapPin className="w-3 h-3 text-[#FF884D] shrink-0" />
            <span className="truncate">{venue}</span>
          </div>

          {/* زمان */}
          {date && (
            <div className="flex items-center gap-1.5 text-white/85 text-[10px] font-medium leading-tight truncate drop-shadow-sm">
              <Calendar className="w-3 h-3 text-[#FF884D] shrink-0" />
              <span className="truncate">{toPersianDigits(date)}</span>
            </div>
          )}
        </div>
      </div>

      {/* اسم کار زیر باکس پوستر به صورت کوچک و خوانا */}
      <div className="pt-2 px-0.5">
        <h3 className={`text-xs sm:text-[13px] font-medium leading-relaxed line-clamp-1 group-hover:text-[#FF884D] transition-colors ${
          isDark ? 'text-zinc-200' : 'text-slate-800'
        }`}>
          {title}
        </h3>
      </div>
    </div>
  );
};

export default TrendingCard;
