import React from 'react';
import { EventCategory } from '../types';
import { useTheme } from '../context/ThemeContext';

interface CategoriesSectionProps {
  selectedCategory?: EventCategory;
  onSelectCategory?: (category: EventCategory) => void;
}

interface CategoryConfig {
  id: string;
  key: EventCategory;
  name: string;
  hex: string;
  activeDarkStyle: string;
  activeLightStyle: string;
  inactiveIconDark: string;
  inactiveIconLight: string;
  hoverBorderDark: string;
  hoverBorderLight: string;
  hoverTextDark: string;
  hoverTextLight: string;
  icon: React.ReactNode;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ 
  selectedCategory = 'all', 
  onSelectCategory 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // تعریف دسته‌بندی‌ها با رنگ‌ها و هویت بصری منحصر‌به‌فرد
  const categories: CategoryConfig[] = [
    { 
      id: 'cat-all', 
      key: 'all', 
      name: 'همه رویدادها', 
      hex: '#6366F1', // Indigo / نیلی کهکشانی
      activeDarkStyle: 'bg-[#6366F1]/15 border-[#6366F1] text-[#818CF8] shadow-[0_0_20px_rgba(99,102,241,0.35)]',
      activeLightStyle: 'bg-indigo-50 border-[#6366F1] text-[#4F46E5] shadow-[0_2px_12px_rgba(99,102,241,0.2)]',
      inactiveIconDark: 'text-[#818CF8]/70 group-hover:text-[#818CF8]',
      inactiveIconLight: 'text-[#6366F1]/80 group-hover:text-[#4F46E5]',
      hoverBorderDark: 'hover:border-[#6366F1]/50 group-hover:border-[#6366F1]/50',
      hoverBorderLight: 'hover:border-[#6366F1]/50 group-hover:border-[#6366F1]/50',
      hoverTextDark: 'group-hover:text-[#818CF8]',
      hoverTextLight: 'group-hover:text-[#4F46E5]',
      icon: (
        <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    { 
      id: 'cat-theater', 
      key: 'theater', 
      name: 'تئاتر و نمایش', 
      hex: '#F43F5E', // Rose / قرمز مخمل تئاتری
      activeDarkStyle: 'bg-[#F43F5E]/15 border-[#F43F5E] text-[#FB7185] shadow-[0_0_20px_rgba(244,63,94,0.35)]',
      activeLightStyle: 'bg-rose-50 border-[#F43F5E] text-[#E11D48] shadow-[0_2px_12px_rgba(244,63,94,0.2)]',
      inactiveIconDark: 'text-[#FB7185]/75 group-hover:text-[#FB7185]',
      inactiveIconLight: 'text-[#F43F5E]/85 group-hover:text-[#E11D48]',
      hoverBorderDark: 'hover:border-[#F43F5E]/50 group-hover:border-[#F43F5E]/50',
      hoverBorderLight: 'hover:border-[#F43F5E]/50 group-hover:border-[#F43F5E]/50',
      hoverTextDark: 'group-hover:text-[#FB7185]',
      hoverTextLight: 'group-hover:text-[#E11D48]',
      icon: (
        <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'cat-concert', 
      key: 'concert', 
      name: 'کنسرت موسیقی', 
      hex: '#A855F7', // Violet / بنفش ارغوانی ارکستر
      activeDarkStyle: 'bg-[#A855F7]/15 border-[#A855F7] text-[#C084FC] shadow-[0_0_20px_rgba(168,85,247,0.35)]',
      activeLightStyle: 'bg-purple-50 border-[#A855F7] text-[#7E22CE] shadow-[0_2px_12px_rgba(168,85,247,0.2)]',
      inactiveIconDark: 'text-[#C084FC]/75 group-hover:text-[#C084FC]',
      inactiveIconLight: 'text-[#A855F7]/85 group-hover:text-[#7E22CE]',
      hoverBorderDark: 'hover:border-[#A855F7]/50 group-hover:border-[#A855F7]/50',
      hoverBorderLight: 'hover:border-[#A855F7]/50 group-hover:border-[#A855F7]/50',
      hoverTextDark: 'group-hover:text-[#C084FC]',
      hoverTextLight: 'group-hover:text-[#7E22CE]',
      icon: (
        <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      )
    },
    { 
      id: 'cat-comedy', 
      key: 'comedy', 
      name: 'استندآپ کمدی', 
      hex: '#F59E0B', // Amber / طلایی کهربایی
      activeDarkStyle: 'bg-[#F59E0B]/15 border-[#F59E0B] text-[#FBBF24] shadow-[0_0_20px_rgba(245,158,11,0.35)]',
      activeLightStyle: 'bg-amber-50 border-[#F59E0B] text-[#D97706] shadow-[0_2px_12px_rgba(245,158,11,0.2)]',
      inactiveIconDark: 'text-[#FBBF24]/75 group-hover:text-[#FBBF24]',
      inactiveIconLight: 'text-[#F59E0B]/85 group-hover:text-[#D97706]',
      hoverBorderDark: 'hover:border-[#F59E0B]/50 group-hover:border-[#F59E0B]/50',
      hoverBorderLight: 'hover:border-[#F59E0B]/50 group-hover:border-[#F59E0B]/50',
      hoverTextDark: 'group-hover:text-[#FBBF24]',
      hoverTextLight: 'group-hover:text-[#D97706]',
      icon: (
        <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    },
    { 
      id: 'cat-immersive', 
      key: 'immersive', 
      name: 'سینما و فیلم', 
      hex: '#06B6D4', // Cyan / فیروزه‌ای اقیانوسی
      activeDarkStyle: 'bg-[#06B6D4]/15 border-[#06B6D4] text-[#22D3EE] shadow-[0_0_20px_rgba(6,182,212,0.35)]',
      activeLightStyle: 'bg-cyan-50 border-[#06B6D4] text-[#0891B2] shadow-[0_2px_12px_rgba(6,182,212,0.2)]',
      inactiveIconDark: 'text-[#22D3EE]/75 group-hover:text-[#22D3EE]',
      inactiveIconLight: 'text-[#06B6D4]/85 group-hover:text-[#0891B2]',
      hoverBorderDark: 'hover:border-[#06B6D4]/50 group-hover:border-[#06B6D4]/50',
      hoverBorderLight: 'hover:border-[#06B6D4]/50 group-hover:border-[#06B6D4]/50',
      hoverTextDark: 'group-hover:text-[#22D3EE]',
      hoverTextLight: 'group-hover:text-[#0891B2]',
      icon: (
        <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      )
    },
    { 
      id: 'cat-gallery', 
      key: 'gallery', 
      name: 'تجسمی و گالری', 
      hex: '#10B981', // Emerald / سبز زمردی
      activeDarkStyle: 'bg-[#10B981]/15 border-[#10B981] text-[#34D399] shadow-[0_0_20px_rgba(16,185,129,0.35)]',
      activeLightStyle: 'bg-emerald-50 border-[#10B981] text-[#059669] shadow-[0_2px_12px_rgba(16,185,129,0.2)]',
      inactiveIconDark: 'text-[#34D399]/75 group-hover:text-[#34D399]',
      inactiveIconLight: 'text-[#10B981]/85 group-hover:text-[#059669]',
      hoverBorderDark: 'hover:border-[#10B981]/50 group-hover:border-[#10B981]/50',
      hoverBorderLight: 'hover:border-[#10B981]/50 group-hover:border-[#10B981]/50',
      hoverTextDark: 'group-hover:text-[#34D399]',
      hoverTextLight: 'group-hover:text-[#059669]',
      icon: (
        <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
  ];

  return (
    <section className={`relative py-4 sm:py-7 w-full overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#0E111C] border-y border-white/5' : 'bg-slate-100/70 border-y border-slate-200/80'
    }`} dir="rtl">
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* ------------------------------------------------------------------ */}
        {/* ۱. نمایش موبایل: چیدمان شبکه‌ای ۳ ستونه، کم‌جا و هر رویداد با رنگ اختصاصی */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid md:hidden grid-cols-3 gap-2">
          {categories.map((category) => {
            const isActive = selectedCategory === category.key;

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory && onSelectCategory(category.key)}
                className={`relative flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer text-center group ${
                  isActive
                    ? isDark
                      ? category.activeDarkStyle
                      : category.activeLightStyle
                    : isDark
                      ? `bg-[#141828]/80 border-white/5 text-zinc-400 ${category.hoverBorderDark} hover:bg-[#181D30]`
                      : `bg-white border-slate-200/80 text-slate-600 ${category.hoverBorderLight} shadow-xs`
                }`}
              >
                {/* آیکون رویداد با رنگ منحصر‌به‌فرد خودش */}
                <div className={`mb-1 transition-transform duration-200 group-hover:scale-110 ${
                  isActive 
                    ? '' 
                    : isDark ? category.inactiveIconDark : category.inactiveIconLight
                }`}>
                  {category.icon}
                </div>

                {/* عنوان دسته‌بندی */}
                <span className={`text-[11px] tracking-tight truncate max-w-full leading-snug transition-colors ${
                  isActive 
                    ? 'font-black' 
                    : isDark 
                      ? `font-medium text-zinc-300 ${category.hoverTextDark}` 
                      : `font-medium text-slate-700 ${category.hoverTextLight}`
                }`}>
                  {category.name}
                </span>

                {/* نشانگر باریک فعال در پایین دکمه موبایل با رنگ اختصاصی */}
                {isActive && (
                  <div 
                    className="absolute bottom-1 w-4 h-0.5 rounded-full" 
                    style={{ backgroundColor: category.hex }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* ۲. نمایش دسکتاپ: افقی سنتر با آیکون‌های دایره‌ای و پالت رنگی اختصاصی    */}
        {/* ------------------------------------------------------------------ */}
        <div className="hidden md:flex justify-center items-center gap-6 lg:gap-8 py-1 select-none">
          {categories.map((category) => {
            const isActive = selectedCategory === category.key;

            return (
              <div 
                key={category.id} 
                onClick={() => onSelectCategory && onSelectCategory(category.key)}
                className="flex flex-col items-center gap-2 cursor-pointer group shrink-0 focus:outline-none transition-transform active:scale-95 py-1 px-2"
              >
                {/* دایره آیکون در دسکتاپ با رنگ اختصاصی */}
                <div 
                  className={`w-16 h-16 rounded-full flex justify-center items-center transition-all duration-300 ${
                    isActive
                      ? isDark
                        ? `${category.activeDarkStyle} border-2 scale-105`
                        : `${category.activeLightStyle} border-2 scale-105`
                      : isDark
                        ? `bg-zinc-900/90 border border-white/10 ${category.hoverBorderDark} shadow-md`
                        : `bg-white border border-slate-200 ${category.hoverBorderLight} shadow-sm group-hover:shadow-md`
                  }`}
                >
                  <div className={`transition-transform duration-300 group-hover:scale-110 ${
                    isActive
                      ? ''
                      : isDark ? category.inactiveIconDark : category.inactiveIconLight
                  }`}>
                    {category.icon}
                  </div>
                </div>
                
                {/* نام دسته‌بندی در دسکتاپ با رنگ اختصاصی در حالت هاور و فعال */}
                <span 
                  className={`text-xs sm:text-sm transition-colors duration-300 whitespace-nowrap ${
                    isActive 
                      ? 'font-black' 
                      : isDark 
                        ? `font-semibold text-zinc-400 ${category.hoverTextDark}` 
                        : `font-semibold text-slate-600 ${category.hoverTextLight}`
                  }`}
                  style={isActive ? { color: category.hex } : undefined}
                >
                  {category.name}
                </span>

                {/* نقطه درخشان فعال با رنگ اختصاصی */}
                {isActive && (
                  <div 
                    className="w-1.5 h-1.5 rounded-full -mt-0.5 animate-pulse"
                    style={{ 
                      backgroundColor: category.hex,
                      boxShadow: `0 0 8px ${category.hex}`
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CategoriesSection;
