import React from 'react';
import { 
  Sparkles, 
  PlusCircle, 
  ArrowLeft,
  CreditCard, 
  QrCode, 
  BarChart3, 
  Headphones,
  FlaskConical
} from 'lucide-react';
import { motion } from 'motion/react';
import { SiteSettings } from '../lib/db';
import { useTheme } from '../context/ThemeContext';

interface CreateEventSectionProps {
  onOpenModal: () => void;
  siteSettings?: SiteSettings;
}

export const CreateEventSection: React.FC<CreateEventSectionProps> = ({ 
  onOpenModal,
  siteSettings 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // If disabled in admin settings, do not render
  if (siteSettings?.creatorSectionEnabled === false) {
    return null;
  }

  // Extract settings with fallbacks
  const badgeText = siteSettings?.creatorSectionBadge || 'ویژه تهیه‌کنندگان و هنرمندان';
  const mainTitle = siteSettings?.creatorSectionTitle || 'میزبانی و فروش بلیت آثار هنری شما در آرتیکت';
  const subtitle = siteSettings?.creatorSectionSubtitle || 'رویداد خود را با زیرساخت پیشرفته گیشه، اسکنر اختصاصی و تسویه آنی به هزاران مخاطب عرضه کنید.';
  const buttonText = siteSettings?.creatorSectionButtonText || 'ثبت و ارسال طرح رویداد';
  const buttonSubtitle = siteSettings?.creatorSectionButtonSubtitle || 'بررسی ۲۴ ساعته و فعال‌سازی رایگان';

  const card1Title = siteSettings?.creatorSectionCard1Title || 'تسویه حساب آنی';
  const card2Title = siteSettings?.creatorSectionCard2Title || 'سامانه گیت و اسکنر';
  const card3Title = siteSettings?.creatorSectionCard3Title || 'گزارش و آمار زنده';
  const card4Title = siteSettings?.creatorSectionCard4Title || 'پشتیبانی اختصاصی';
  const card5Title = siteSettings?.creatorSectionCard5Title || 'امکان تست آزمایشی قبل از ثبت';

  const chips = [
    { icon: CreditCard, label: card1Title, color: 'text-emerald-400', glow: 'hover:shadow-emerald-500/20' },
    { icon: QrCode, label: card2Title, color: 'text-sky-400', glow: 'hover:shadow-sky-500/20' },
    { icon: BarChart3, label: card3Title, color: 'text-purple-400', glow: 'hover:shadow-purple-500/20' },
    { icon: Headphones, label: card4Title, color: 'text-amber-400', glow: 'hover:shadow-amber-500/20' },
    { 
      icon: FlaskConical, 
      label: card5Title, 
      color: 'text-rose-400', 
      glow: 'hover:shadow-rose-500/25', 
      isHighlight: true,
      onClick: onOpenModal 
    },
  ];


  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-5 sm:my-7">
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        animate={{ 
          boxShadow: isDark
            ? [
                '0 10px 30px -10px rgba(255, 51, 102, 0.12)', 
                '0 18px 45px -8px rgba(255, 51, 102, 0.25)', 
                '0 10px 30px -10px rgba(255, 51, 102, 0.12)'
              ]
            : [
                '0 10px 25px -10px rgba(15, 23, 42, 0.10)', 
                '0 18px 35px -8px rgba(255, 51, 102, 0.18)', 
                '0 10px 25px -10px rgba(15, 23, 42, 0.10)'
              ]
        }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border text-right transition-colors group shadow-lg"
        dir="rtl"
      >

      {/* 1. Animated Gradient Border Beam (متحرک سرجای خودش دور باکس) */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl p-[1px] pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute -inset-[100%] opacity-40 group-hover:opacity-80 transition-opacity"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, #FF3366 90deg, #F59E0B 180deg, #8B5CF6 270deg, transparent 360deg)'
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <div className={`w-full h-full rounded-[inherit] ${isDark ? 'bg-[#0B0F1F]' : 'bg-slate-900'}`} />
      </div>

      {/* 2. Sleek Deep Background with Floating Animated Orbs */}
      <div className={`absolute inset-[1px] rounded-[inherit] pointer-events-none overflow-hidden ${
        isDark 
          ? 'bg-gradient-to-r from-[#0C1022]/95 via-[#10162F]/95 to-[#090C1A]/95' 
          : 'bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95'
      }`}>
        {/* Floating Orb 1 (Magenta Pink) */}
        <motion.div 
          className="absolute top-[-20%] right-[-10%] w-72 h-72 rounded-full bg-[#FF3366]/20 blur-3xl pointer-events-none"
          animate={{ 
            x: [0, 30, -20, 0],
            y: [0, -15, 20, 0],
            scale: [1, 1.2, 0.95, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating Orb 2 (Purple Violet) */}
        <motion.div 
          className="absolute bottom-[-20%] left-[-10%] w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none"
          animate={{ 
            x: [0, -25, 20, 0],
            y: [0, 20, -15, 0],
            scale: [1, 1.15, 0.9, 1]
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating Orb 3 (Warm Amber Accent) */}
        <motion.div 
          className="absolute top-[30%] left-[35%] w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"
          animate={{ 
            scale: [0.8, 1.25, 0.8],
            opacity: [0.15, 0.35, 0.15]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Cyber Dots Grid with Soft Shimmer */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:20px_20px] opacity-35" />

        {/* Light Beam sweeping across periodically */}
        <motion.div 
          className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent skew-x-[-25deg] pointer-events-none"
          animate={{ x: ['-200%', '800%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
        />
      </div>

      {/* 3. Compact Content Strip */}
      <div className="relative z-10 p-4 sm:p-5 md:px-7 md:py-5 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-white">
        
        {/* Right Info Section */}
        <div className="w-full md:flex-1 space-y-2.5">
          
          {/* Badge & Title */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Animated Badge */}
            <motion.div 
              whileHover={{ scale: 1.04 }}
              className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-l from-white/[0.08] to-white/[0.03] border border-white/15 text-[11px] font-bold text-zinc-100 backdrop-blur-md shadow-inner overflow-hidden cursor-default shrink-0"
            >
              {/* Live Ping Indicator */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3366] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF3366]"></span>
              </span>

              {/* Sparkle Icon rotating gently in place */}
              <motion.div
                animate={{ rotate: [0, 18, -12, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF3366]" />
              </motion.div>

              <span>{badgeText}</span>

              {/* Shimmer line inside badge */}
              <motion.div 
                className="absolute inset-0 w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
                animate={{ x: ['-100%', '300%'] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
              />
            </motion.div>

            {/* Main Title with Gradient Accent */}
            <h3 className="font-display font-black text-base sm:text-lg md:text-xl text-white tracking-tight leading-snug flex items-center gap-1.5">
              <span>{mainTitle}</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-[#FF3366] to-[#F59E0B] animate-pulse" />
            </h3>
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed max-w-3xl line-clamp-2 sm:line-clamp-1">
            {subtitle}
          </p>

          {/* Inline Feature Chips with Interactive Pop & Glow */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {chips.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <motion.div 
                  key={idx}
                  onClick={chip.onClick}
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium backdrop-blur-xs transition-all shadow-xs ${chip.glow} ${
                    chip.isHighlight
                      ? 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-200 cursor-pointer ring-1 ring-rose-500/20'
                      : 'bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/25 text-zinc-200 cursor-default'
                  }`}
                  title={chip.isHighlight ? 'کلیک کنید تا فرم و محیط گیشه را آزمایشی تست کنید' : undefined}
                >
                  <Icon className={`w-3.5 h-3.5 ${chip.color} shrink-0`} />
                  <span>{chip.label}</span>
                  {chip.isHighlight && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-rose-500/30 text-rose-200 font-bold">
                      تست
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

        </div>

        {/* Left Action Button (CTA with Animated Glow & Nudge) */}
        <div className="w-full md:w-auto shrink-0 flex flex-col items-center sm:items-end justify-center gap-1.5">
          <div className="relative w-full md:w-auto group/btn">
            {/* Ambient Pulsing Aura Behind Button */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#FF3366] via-[#FF5533] to-[#F59E0B] opacity-70 blur-md group-hover/btn:opacity-100 transition-opacity animate-pulse pointer-events-none" />

            {/* The Clickable Button */}
            <motion.button
              type="button"
              onClick={onOpenModal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="relative w-full md:w-auto px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white font-display font-black text-xs sm:text-sm shadow-xl shadow-[#FF3366]/30 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/25 whitespace-nowrap overflow-hidden"
            >
              {/* Internal Sheen Bar moving across button */}
              <motion.div 
                className="absolute inset-0 w-12 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] pointer-events-none"
                animate={{ x: ['-150%', '350%'] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.8 }}
              />

              <PlusCircle className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-300 shrink-0 text-white" />
              <span>{buttonText}</span>
              
              {/* Arrow with Lively Nudge Motion in place */}
              <motion.div
                animate={{ x: [0, -3.5, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                className="shrink-0 flex items-center"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </motion.div>
            </motion.button>
          </div>

          {buttonSubtitle && (
            <motion.span 
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[10px] text-zinc-300 font-medium text-center md:text-left flex items-center gap-1"
            >
              <span className="text-amber-400">✨</span>
              <span>{buttonSubtitle}</span>
            </motion.span>
          )}
        </div>

      </div>
    </motion.section>
  </div>
);
};
