import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, 
  Bookmark, 
  Menu, 
  X, 
  Home, 
  Image, 
  Drama, 
  Music, 
  MonitorPlay, 
  Sparkles, 
  MapPin, 
  Check, 
  Hexagon,
  PlusCircle,
  User,
  ChevronLeft,
  ShoppingCart,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'motion/react';
import { EventCategory } from '../types';
import { toPersianDigits } from '../utils/persianNumbers';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { SiteSettings } from '../lib/db';
import { CitySelector } from './CitySelector';

interface NavbarProps {
  selectedCategory: EventCategory;
  onSelectCategory: (cat: EventCategory) => void;
  savedCount: number;
  ticketsCount: number;
  onOpenTickets: () => void;
  onOpenSaved: () => void;
  onOpenCreateEvent?: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  cities: string[];
  siteSettings?: SiteSettings;
  isScrolled?: boolean;
}

interface NavItemDefinition {
  id: string;
  category: EventCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  externalUrl?: string;
}

const resolveNavItems = (siteSettings?: SiteSettings): NavItemDefinition[] => {
  if (siteSettings?.headerMenuLinks && siteSettings.headerMenuLinks.length > 0) {
    return siteSettings.headerMenuLinks.map((link) => {
      const titleLower = (link.title || '').toLowerCase();
      const urlLower = (link.url || '').toLowerCase();

      let category: EventCategory = 'all';
      let icon: React.ComponentType<{ className?: string }> = Sparkles;
      let color = 'text-[#FF3366]';
      let externalUrl: string | undefined = undefined;

      if (urlLower.startsWith('http') || (urlLower.startsWith('/') && !urlLower.startsWith('/#'))) {
        externalUrl = link.url;
      }

      if (titleLower.includes('خانه') || titleLower.includes('همه') || urlLower === 'all' || urlLower === '/' || urlLower === '') {
        category = 'all';
        icon = Home;
        color = 'text-[#FF3366]';
      } else if (titleLower.includes('تئاتر') || titleLower.includes('نمایش') || urlLower === 'theater' || urlLower.includes('theater')) {
        category = 'theater';
        icon = Drama;
        color = 'text-[#FF4B7E]';
      } else if (titleLower.includes('کنسرت') || titleLower.includes('موسیقی') || urlLower === 'concert' || urlLower.includes('concert') || urlLower.includes('music')) {
        category = 'concert';
        icon = Music;
        color = 'text-[#A78BFA]';
      } else if (titleLower.includes('گالری') || titleLower.includes('تجسمی') || titleLower.includes('هنر') || urlLower === 'gallery' || urlLower.includes('gallery')) {
        category = 'gallery';
        icon = Image;
        color = 'text-[#FBBF24]';
      } else if (titleLower.includes('تعاملی') || urlLower === 'immersive' || urlLower.includes('immersive')) {
        category = 'immersive';
        icon = MonitorPlay;
        color = 'text-[#38BDF8]';
      }

      return {
        id: link.id || link.title,
        category,
        label: link.title,
        icon,
        color,
        externalUrl,
      };
    });
  }

  return [
    { id: 'all', category: 'all', label: 'همه رویدادها', icon: Home, color: 'text-[#FF3366]' },
    { id: 'theater', category: 'theater', label: 'تئاتر و نمایش', icon: Drama, color: 'text-[#FF4B7E]' },
    { id: 'concert', category: 'concert', label: 'کنسرت و موسیقی', icon: Music, color: 'text-[#A78BFA]' },
    { id: 'gallery', category: 'gallery', label: 'گالری و تجسمی', icon: Image, color: 'text-[#FBBF24]' },
    { id: 'immersive', category: 'immersive', label: 'هنر تعاملی', icon: MonitorPlay, color: 'text-[#38BDF8]' },
  ];
};

export const Navbar: React.FC<NavbarProps> = ({
  selectedCategory,
  onSelectCategory,
  savedCount,
  ticketsCount,
  onOpenTickets,
  onOpenSaved,
  onOpenCreateEvent,
  selectedCity,
  onSelectCity,
  cities,
  siteSettings,
  isScrolled: controlledIsScrolled,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [internalScrolled, setInternalScrolled] = useState(false);
  const isScrolled = controlledIsScrolled !== undefined ? controlledIsScrolled : internalScrolled;
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { currentUser, isAuthenticated } = useAuth();

  const headerStyle = {
    backgroundColor: siteSettings?.headerBgColor || undefined,
    borderColor: siteSettings?.headerBorderColor || undefined,
    borderRadius: siteSettings?.headerBorderRadius || undefined,
  };
  const textStyle = siteSettings?.headerTextColor ? { color: siteSettings.headerTextColor } : {};

  useEffect(() => {
    if (controlledIsScrolled !== undefined) return;
    const handleScroll = () => {
      setInternalScrolled(window.scrollY > 35);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [controlledIsScrolled]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  const navItems = resolveNavItems(siteSettings);

  const handleNavClick = (item: NavItemDefinition) => {
    if (item.externalUrl) {
      window.location.href = item.externalUrl;
      return;
    }

    onSelectCategory(item.category);
    setIsSidebarOpen(false);

    // Provide immediate responsive smooth scroll feedback
    setTimeout(() => {
      if (item.category === 'all') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById('events-grid-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 50);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 flex justify-center transition-all duration-500 pointer-events-none px-3 sm:px-6 ${
          isScrolled ? 'pt-3 sm:pt-4' : 'pt-4 sm:pt-7'
        }`}
        dir="rtl"
      >
        <div
          className={`pointer-events-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] backdrop-blur-2xl w-full ${
            isDark
              ? isScrolled
                ? 'max-w-5xl bg-[#0A0C13]/90 border border-white/10 rounded-full py-2 px-3 sm:px-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
                : 'max-w-7xl bg-[#0A0C13]/60 border border-white/[0.08] rounded-[2.5rem] py-3 px-4 sm:px-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] hover:border-white/15'
              : isScrolled
                ? 'max-w-5xl bg-white/95 border border-slate-200/90 rounded-full py-2 px-3 sm:px-5 shadow-[0_15px_35px_rgba(15,23,42,0.08)] text-slate-800'
                : 'max-w-7xl bg-white/85 border border-slate-200/80 rounded-[2.5rem] py-3 px-4 sm:px-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] text-slate-800 hover:border-slate-300'
          }`}
          style={Object.keys(headerStyle).length ? headerStyle : undefined}
        >
          {/* Right Section: Mobile Menu Trigger + Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="منوی سایت"
              className={`lg:hidden p-2.5 rounded-full border transition-all active:scale-95 cursor-pointer ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
              }`}
              style={textStyle}
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => {
                onSelectCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 sm:gap-3 group shrink-0 cursor-pointer select-none text-right"
            >
              {siteSettings?.headerShowLogo !== false && (
                siteSettings?.headerLogoUrl ? (
                  <img
                    src={siteSettings.headerLogoUrl}
                    alt={siteSettings?.headerLogoTitle || siteSettings?.siteTitle || 'Logo'}
                    style={{
                      height: siteSettings?.headerLogoHeight ? `${isScrolled ? Math.min(36, siteSettings.headerLogoHeight) : siteSettings.headerLogoHeight}px` : (isScrolled ? '36px' : '44px'),
                      borderRadius: siteSettings?.headerLogoRadius || '8px',
                    }}
                    className="object-contain transition-all duration-300 max-h-12"
                  />
                ) : (
                  <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#FF3366] via-[#FF6B35] to-[#F59E0B] p-[1.5px] shadow-[0_0_20px_rgba(255,51,102,0.25)] transition-transform duration-500 group-hover:scale-105">
                    <div
                      className={`w-full h-full rounded-[14px] flex items-center justify-center relative overflow-hidden ${
                        isDark ? 'bg-[#08090F]' : 'bg-slate-900'
                      }`}
                    >
                      <Hexagon className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-sm group-hover:rotate-45 transition-transform duration-700" />
                    </div>
                  </div>
                )
              )}

              {siteSettings?.headerShowTextNextToLogo !== false && (
                <div className="flex flex-col items-start justify-center">
                  <span
                    className={`font-display font-black text-lg sm:text-xl tracking-tight leading-none transition-colors ${
                      isDark ? 'text-white group-hover:text-[#FF3366]' : 'text-slate-900 group-hover:text-[#FF3366]'
                    }`}
                    style={textStyle}
                  >
                    {siteSettings?.headerLogoTitle || siteSettings?.brandName || siteSettings?.siteTitle || 'آرتیکت'}
                  </span>
                  {!isScrolled && (
                    <span
                      className={`text-[9px] font-mono tracking-widest uppercase mt-1 ${
                        isDark ? 'text-zinc-400' : 'text-slate-400'
                      }`}
                    >
                      {siteSettings?.headerLogoSubtitle || 'Art & Stage'}
                    </span>
                  )}
                </div>
              )}
            </button>
          </div>

          {/* Center Section: Desktop Navigation Items */}
          <nav
            className={`hidden lg:flex items-center gap-1 p-1 rounded-full border transition-all duration-300 ${
              isDark
                ? isScrolled
                  ? 'bg-black/40 border-white/[0.06]'
                  : 'bg-white/[0.04] border-white/[0.08]'
                : isScrolled
                  ? 'bg-slate-100/90 border-slate-200/90'
                  : 'bg-slate-100/70 border-slate-200/70'
            }`}
          >
            {navItems.map((item, idx) => {
              const isActive = selectedCategory === item.category;
              const IconComp = item.icon;

              return (
                <button
                  key={`${item.id}-${idx}`}
                  onClick={() => handleNavClick(item)}
                  className={`relative px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer select-none group active:scale-95 ${
                    isActive
                      ? isDark
                        ? 'text-white'
                        : 'text-slate-950'
                      : isDark
                        ? 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  {/* Subtle Active Pill Highlight */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className={`absolute inset-0 rounded-full ${
                        isDark
                          ? 'bg-white/15 border border-white/20 shadow-sm'
                          : 'bg-white border border-slate-200 shadow-sm'
                      }`}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}

                  <IconComp
                    className={`w-3.5 h-3.5 relative z-10 transition-colors ${
                      isActive
                        ? item.color
                        : isDark
                          ? 'text-zinc-500 group-hover:text-zinc-300'
                          : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span className="relative z-10 tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Left Section: City Selector + Bookmarks + Tickets */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Custom Modern City Selector Dropdown */}
            <div className="hidden md:block">
              <CitySelector
                selectedCity={selectedCity}
                onSelectCity={onSelectCity}
                cities={cities}
                isScrolled={isScrolled}
              />
            </div>

            {/* Saved / Bookmarks Button */}
            <button
              onClick={onOpenSaved}
              aria-label="رویدادهای نشان‌شده"
              className={`relative p-2 sm:p-2.5 rounded-full border transition-all duration-200 shrink-0 active:scale-95 cursor-pointer ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-950'
              }`}
              title="رویدادهای نشان‌شده"
            >
              <Bookmark className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF3366] text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-[#FF3366]/40 animate-scale-in">
                  {toPersianDigits(savedCount)}
                </span>
              )}
            </button>

            {/* Create Event Button (for Producers & Creators) */}
            <Link
              to={isAuthenticated ? "/create-event" : "/login?redirect=/create-event"}
              aria-label="ایجاد رویداد"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-black bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white hover:brightness-110 shadow-md shadow-[#FF3366]/25 transition-all duration-200 shrink-0 active:scale-95 cursor-pointer whitespace-nowrap"
              title={isAuthenticated ? "ارسال درخواست ایجاد و میزبانی رویداد" : "ورود یا عضویت جهت ایجاد رویداد"}
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">ایجاد رویداد</span>
            </Link>

            {/* User Profile or Login Button */}
            {isAuthenticated && currentUser ? (
              <Link
                to="/profile"
                aria-label="حساب کاربری"
                className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border transition-all shrink-0 active:scale-95 cursor-pointer ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                }`}
                title={`حساب کاربری: ${currentUser.fullName}`}
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-[#FF3366] to-[#F59E0B] flex items-center justify-center text-white text-[11px] font-black shrink-0">
                  {currentUser.fullName ? currentUser.fullName[0] : 'U'}
                </div>
                <span className="hidden lg:inline text-xs font-bold max-w-[90px] truncate">
                  {currentUser.fullName.split(' ')[0]}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                aria-label="ورود یا عضویت"
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold border transition-all shrink-0 active:scale-95 cursor-pointer ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200 hover:text-white'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                }`}
                title="ورود به حساب کاربری یا عضویت"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF3366]" />
                <span className="hidden sm:inline">ورود / عضویت</span>
              </Link>
            )}

            {/* Dynamic Shopping Cart / Ticket Bag (Only shown when user has tickets / purchasing) */}
            {ticketsCount > 0 && (
              <button
                onClick={onOpenTickets}
                aria-label="سبد خرید و بلیت‌های من"
                className={`relative flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-full text-xs font-black transition-all duration-200 shrink-0 active:scale-95 cursor-pointer shadow-md border animate-scale-in ${
                  isDark
                    ? 'bg-gradient-to-tr from-[#FF3366]/20 via-pink-500/15 to-[#F59E0B]/20 hover:from-[#FF3366]/30 hover:to-[#F59E0B]/30 border-[#FF3366]/40 text-white shadow-[#FF3366]/20'
                    : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700 shadow-rose-500/10'
                }`}
                title={`سبد خرید و بلیت‌ها: ${toPersianDigits(ticketsCount)} عدد`}
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4 text-[#FF3366]" />
                  <span className="absolute -top-2 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white text-[10px] font-black flex items-center justify-center shadow-md shadow-[#FF3366]/40">
                    {toPersianDigits(ticketsCount)}
                  </span>
                </div>
                <span className="hidden sm:inline mr-1 text-xs font-black text-white">سبد بلیت</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- Mobile Sidebar (Drawer) --- */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-md z-[60] transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed top-0 right-0 h-full w-[85vw] max-w-[340px] z-[65] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl flex flex-col lg:hidden ${
          isDark
            ? 'bg-[#0A0C13]/95 text-white border-l border-white/10 backdrop-blur-2xl'
            : 'bg-white/98 text-slate-900 border-l border-slate-200 backdrop-blur-2xl'
        } ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        dir="rtl"
      >
        {/* Drawer Header */}
        <div className="p-5 flex items-center justify-between border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF3366] to-[#F59E0B] p-[1.5px]">
              <div
                className={`w-full h-full rounded-[10px] flex items-center justify-center ${
                  isDark ? 'bg-[#08090F]' : 'bg-slate-900'
                }`}
              >
                <Hexagon className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="font-display font-black text-base tracking-tight">
              {siteSettings?.siteTitle || 'آرتیس'}
            </span>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            aria-label="بستن منو"
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Navigation Categories */}
          <div>
            <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5 px-1">
              دسته‌بندی رویدادها
            </div>
            <div className="flex flex-col gap-1.5">
              {navItems.map((item, idx) => {
                const isActive = selectedCategory === item.category;
                const IconComp = item.icon;

                return (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => handleNavClick(item)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-right ${
                      isActive
                        ? isDark
                          ? 'bg-white/15 text-white font-black'
                          : 'bg-slate-900 text-white font-black shadow-sm'
                        : isDark
                          ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComp
                        className={`w-4 h-4 ${isActive ? item.color : 'opacity-60'}`}
                      />
                      <span className="text-sm font-bold">{item.label}</span>
                    </div>

                    {isActive && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`w-full h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

          {/* City Selection Grid in Mobile */}
          <div>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>شهر برگزاری:</span>
              </span>
              <span className="text-xs font-bold text-[#FF3366]">
                {selectedCity || 'همه شهرها'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {cities.map((city) => {
                const isSelected = selectedCity === city || (!selectedCity && city === 'همه شهرها');
                return (
                  <button
                    key={city}
                    onClick={() => {
                      onSelectCity(city);
                      setIsSidebarOpen(false);
                      setTimeout(() => {
                        const el = document.getElementById('events-grid-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 50);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                      isSelected
                        ? isDark
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-black'
                          : 'bg-cyan-50 border-cyan-300 text-cyan-900 font-black'
                        : isDark
                          ? 'bg-white/[0.03] border-white/10 text-zinc-300 hover:bg-white/10'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`w-full h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

          {/* Quick Actions: Bookmarks */}
          <div>
            <button
              onClick={() => {
                onOpenSaved();
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                isDark ? 'hover:bg-white/5 text-zinc-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4 text-[#FF3366]" />
                <span className="text-sm font-bold">رویدادهای نشان‌شده</span>
              </div>
              {savedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#FF3366] text-white text-[11px] font-black">
                  {toPersianDigits(savedCount)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Drawer Footer: Actions */}
        <div className="p-5 border-t border-black/5 dark:border-white/10 space-y-2.5">
          {/* User Account or Login in Mobile */}
          {isAuthenticated && currentUser ? (
            <Link
              to="/profile"
              onClick={() => setIsSidebarOpen(false)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF3366] to-[#F59E0B] flex items-center justify-center text-white text-xs font-black">
                  {currentUser.fullName ? currentUser.fullName[0] : 'U'}
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white">{currentUser.fullName}</div>
                  <div className="text-[10px] text-zinc-400">حساب کاربری و پیگیری پرونده‌ها</div>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-zinc-400" />
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsSidebarOpen(false)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-[#FF3366]" />
                <span className="text-xs font-bold">ورود / عضویت سریع در سامانه</span>
              </div>
              <span className="text-[10px] text-[#FF3366] font-bold">رایگان</span>
            </Link>
          )}

          <Link
            to={isAuthenticated ? "/create-event" : "/login?redirect=/create-event"}
            onClick={() => setIsSidebarOpen(false)}
            className="w-full flex items-center justify-between p-3.5 rounded-xl font-bold transition-all active:scale-95 cursor-pointer shadow-md bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white"
          >
            <div className="flex items-center gap-2.5">
              <PlusCircle className="w-4 h-4" />
              <span className="text-sm">ایجاد و میزبانی رویداد</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">صاحبان اثر</span>
          </Link>

          {ticketsCount > 0 && (
            <button
              onClick={() => {
                onOpenTickets();
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl font-bold transition-all active:scale-95 cursor-pointer shadow-md bg-gradient-to-l from-emerald-500 to-teal-500 text-white"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm">سبد خرید و بلیت‌ها</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[11px] font-black">
                {toPersianDigits(ticketsCount)} عدد
              </span>
            </button>
          )}

          <a
            href="/admin"
            className={`mt-2.5 w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-colors border ${
              isDark 
                ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>ورود به پنل مدیریت سامانه</span>
          </a>
        </div>
      </aside>
    </>
  );
};
