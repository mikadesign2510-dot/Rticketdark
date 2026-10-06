import React from 'react';
import { ArtEvent } from '../types';
import { BentoHero } from './BentoHero';
import { SiteSettings, HeroBanner } from '../lib/db';
import { useTheme } from '../context/ThemeContext';

interface HeroSectionProps {
  onOpenDetails: (event: ArtEvent) => void;
  onBuyTicket: (event: ArtEvent) => void;
  featuredEvents: ArtEvent[];
  siteSettings?: SiteSettings;
  banners?: HeroBanner[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenDetails,
  onBuyTicket,
  featuredEvents,
  siteSettings,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bgUrl = siteSettings?.heroBgUrl;

  return (
    <section 
      className={`relative w-full overflow-hidden pt-28 sm:pt-36 lg:pt-36 pb-6 sm:pb-10 transition-colors duration-300 ${
        isDark 
          ? 'bg-[#0A0B10] border-b border-[#1A1D2E]/80' 
          : 'bg-gradient-to-b from-slate-100/70 via-white to-slate-50 border-b border-slate-200/80'
      }`}
      dir="rtl"
    >
      {/* Background Graphic if configured */}
      {bgUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 filter blur-sm scale-105 pointer-events-none select-none"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
      )}

      {/* Dynamic Ambient Fluid Gradients & Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className={`absolute -top-36 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-40 ${
          isDark ? 'bg-[#FF884D]/10' : 'bg-orange-200/40'
        }`} />
        <div className={`absolute -bottom-20 left-1/4 w-[400px] h-[400px] rounded-full blur-[130px] pointer-events-none opacity-30 ${
          isDark ? 'bg-[#FF3366]/10' : 'bg-pink-200/40'
        }`} />
        <div className={`absolute inset-0 bg-[size:4rem_4rem] ${
          isDark 
            ? 'bg-[linear-gradient(to_right,#1E223812_1px,transparent_1px),linear-gradient(to_bottom,#1E223812_1px,transparent_1px)]' 
            : 'bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)]'
        }`} />
      </div>

      <div className="relative">
        {/* Top Control Bar: Optional Title */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5 sm:mb-6">
          <div className="text-right">
            {siteSettings?.heroTitle ? (
              <div>
                <h1 className={`font-display font-black text-xl sm:text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {siteSettings.heroTitle}
                </h1>
                {siteSettings?.heroSubtitle && (
                  <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {siteSettings.heroSubtitle}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF884D] animate-ping" />
                <span className={`text-xs sm:text-sm font-bold tracking-wide ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  ویترین رویدادهای برگزیده هنر و صحنه
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Bento 3-Piece Hero Grid */}
        <BentoHero
          events={featuredEvents}
          onOpenDetails={onOpenDetails}
          onBuyTicket={onBuyTicket}
        />
      </div>
    </section>
  );
};
