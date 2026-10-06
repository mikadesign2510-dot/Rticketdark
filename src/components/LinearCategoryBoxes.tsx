import React from 'react';
import { EventCategory } from '../types';
import { Sparkles, Palette, Drama, Music2, Layers } from 'lucide-react';
import { toPersianDigits } from '../utils/persianNumbers';

interface LinearCategoryBoxesProps {
  selectedCategory: EventCategory;
  onSelectCategory: (cat: EventCategory) => void;
  categoryCounts: Partial<Record<EventCategory, number>>;
}

export const LinearCategoryBoxes: React.FC<LinearCategoryBoxesProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const categoryBoxes: {
    id: EventCategory;
    title: string;
    englishTitle: string;
    icon: React.ReactNode;
    activeBorderColor: string;
    activeGradient: string;
  }[] = [
    {
      id: 'all',
      title: 'همه رویدادها',
      englishTitle: 'All Events',
      icon: <Sparkles className="w-4 h-4" />,
      activeBorderColor: 'border-[#FF3366]',
      activeGradient: 'from-[#FF3366]/20 to-[#FF5533]/10',
    },
    {
      id: 'gallery',
      title: 'گالری و تجسمی',
      englishTitle: 'Art & Gallery',
      icon: <Palette className="w-4 h-4 text-[#FBBF24]" />,
      activeBorderColor: 'border-[#F59E0B]',
      activeGradient: 'from-[#F59E0B]/20 to-[#D97706]/10',
    },
    {
      id: 'theater',
      title: 'تئاتر و نمایش',
      englishTitle: 'Theater & Stage',
      icon: <Drama className="w-4 h-4 text-[#FF5B85]" />,
      activeBorderColor: 'border-[#FF3366]',
      activeGradient: 'from-[#FF3366]/20 to-[#E11D48]/10',
    },
    {
      id: 'concert',
      title: 'کنسرت و ارکستر',
      englishTitle: 'Orchestra & Live',
      icon: <Music2 className="w-4 h-4 text-[#A78BFA]" />,
      activeBorderColor: 'border-[#8B5CF6]',
      activeGradient: 'from-[#8B5CF6]/20 to-[#6D28D9]/10',
    },
    {
      id: 'immersive',
      title: 'چیدمان تعاملی',
      englishTitle: 'Immersive Art',
      icon: <Layers className="w-4 h-4 text-[#38BDF8]" />,
      activeBorderColor: 'border-[#06B6D4]',
      activeGradient: 'from-[#06B6D4]/20 to-[#0284C7]/10',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-2">
      {/* Horizontal linear boxes grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {categoryBoxes.map((cat, idx) => {
          const isActive = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] || 0;
          const isLast = idx === categoryBoxes.length - 1;

          return (
            <button
              key={cat.id}
              id={`linear-cat-box-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`relative flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer text-right group ${
                isLast ? 'col-span-2 sm:col-span-1' : ''
              } ${
                isActive
                  ? `bg-gradient-to-l ${cat.activeGradient} bg-[#161B2D] ${cat.activeBorderColor} shadow-lg shadow-black/40`
                  : 'bg-[#121524] border-[#22273D] hover:bg-[#161A2C] hover:border-zinc-700/80 text-zinc-300'
              }`}
            >
              {/* Icon and Title */}
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'bg-white/15' : 'bg-[#181D30] text-zinc-400'
                  }`}
                >
                  {cat.icon}
                </div>
                <div className="min-w-0">
                  <span
                    className={`block text-[11px] sm:text-xs font-bold truncate transition-colors ${
                      isActive ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                    }`}
                  >
                    {cat.title}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] text-zinc-500 font-medium truncate">
                    {cat.englishTitle}
                  </span>
                </div>
              </div>

              {/* Count pill badge */}
              <span
                className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[#1A1F33] text-zinc-400 group-hover:text-zinc-200'
                }`}
              >
                {toPersianDigits(count)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
