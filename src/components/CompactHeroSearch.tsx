import React, { useState, useRef, useEffect } from 'react';
import { Search, Calendar, User, Sparkles, X, MapPin, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { ARTISTS_LIST } from '../data/mockEvents';
import { motion, AnimatePresence } from 'motion/react';
import { SiteSettings } from '../lib/db';
import { useTheme } from '../context/ThemeContext';

interface CompactHeroSearchProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  artistQuery: string;
  onArtistChange: (a: string) => void;
  selectedCity: string;
  onCityChange: (c: string) => void;
  cities: string[];
  dateFilter: 'all' | 'this-week' | 'this-month' | 'weekend';
  onDateFilterChange: (d: 'all' | 'this-week' | 'this-month' | 'weekend') => void;
  onExecuteSearch: () => void;
  siteSettings?: SiteSettings;
}

const DATE_OPTIONS: Array<{ label: string; value: 'all' | 'this-week' | 'this-month' | 'weekend' }> = [
  { label: 'تمام تاریخ‌ها', value: 'all' },
  { label: 'همین آخر هفته', value: 'weekend' },
  { label: '۷ روز آینده', value: 'this-week' },
  { label: '۳۰ روز آینده', value: 'this-month' },
];

export const CompactHeroSearch: React.FC<CompactHeroSearchProps> = ({
  searchQuery,
  onSearchChange,
  artistQuery,
  onArtistChange,
  selectedCity,
  onCityChange,
  cities,
  dateFilter,
  onDateFilterChange,
  onExecuteSearch,
  siteSettings,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'artist' | 'city' | 'date' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    } else {
      setActiveDropdown(null);
    }
  }, [isExpanded]);

  // Click outside listener to close active custom dropdowns
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const searchContainerStyle = {
    backgroundColor: siteSettings?.searchBgColor || undefined,
    borderColor: siteSettings?.searchBorderColor || undefined,
    borderRadius: siteSettings?.searchBorderRadius || undefined,
  };
  const searchPlaceholderText = siteSettings?.searchPlaceholder || 'جستجو در رویدادها، تئاترها، کنسرت‌ها...';
  const searchButtonTextStr = siteSettings?.searchButtonText || 'یافتن بلیت';

  // Selected labels
  const selectedArtistLabel = artistQuery 
    ? artistQuery 
    : 'همه هنرمندان';

  const selectedDateLabel = DATE_OPTIONS.find((d) => d.value === dateFilter)?.label || 'تمام تاریخ‌ها';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative z-30">
      {/* Toggle Button / Collapsed State vs Expanded State */}
      <AnimatePresence mode="popLayout" initial={false}>
        {!isExpanded ? (
          <motion.div
            key="collapsed-search"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="flex justify-center w-full"
          >
            <button
              onClick={() => setIsExpanded(true)}
              style={searchContainerStyle}
              className={`flex items-center gap-3 px-6 py-3 backdrop-blur-xl rounded-[2rem] border transition-all shadow-xl active:scale-95 group cursor-pointer ${
                isDark
                  ? 'bg-[#121524]/90 hover:bg-[#1A1F35]/95 border-[#242A42] text-zinc-400 hover:text-white hover:border-[#FF3366]/30 hover:shadow-2xl hover:shadow-[#FF3366]/10'
                  : 'bg-white/95 hover:bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-[#FF3366]/40 hover:shadow-2xl hover:shadow-slate-200/80'
              }`}
            >
              <Search className="w-5 h-5 text-[#FF3366]" />
              <span className="font-bold text-sm tracking-wide">جستجو و فیلتر رویدادها...</span>
              <ChevronDown className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            ref={searchContainerRef}
            key="expanded-search"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`backdrop-blur-xl p-3 sm:p-4 rounded-3xl border shadow-2xl relative ${
              isDark
                ? 'bg-[#121524]/95 border-[#242A42]'
                : 'bg-white/95 border-slate-200/90 shadow-slate-300/60'
            }`}
            style={searchContainerStyle}
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className={`font-extrabold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Search className="w-4 h-4 text-[#FF3366]" />
                جستجوی پیشرفته
              </h3>
              <button
                onClick={() => {
                  setIsExpanded(false);
                  setActiveDropdown(null);
                }}
                className={`p-1.5 rounded-full transition-colors border cursor-pointer ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border-white/5'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border-slate-200'
                }`}
                title="بستن"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              
              {/* 1. Main Search (Event / Keyword) */}
              <div className={`lg:col-span-4 min-h-[46px] relative flex items-center rounded-2xl px-4 py-2 border focus-within:border-[#FF3366]/50 focus-within:ring-2 focus-within:ring-[#FF3366]/15 transition-all duration-300 ${
                isDark
                  ? 'bg-[#171B2D]/80 border-[#242A42]'
                  : 'bg-slate-100/90 border-slate-200'
              }`}>
                <Search className="w-4 h-4 text-[#FF3366] ml-3 shrink-0" />
                <div className="flex-1 min-w-0">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholderText}
                    className={`w-full bg-transparent text-sm font-bold focus:outline-none ${
                      isDark
                        ? 'text-white placeholder-zinc-500'
                        : 'text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className={`p-1 rounded-full ml-1 cursor-pointer transition-colors ${
                      isDark
                        ? 'text-zinc-400 hover:text-white bg-white/5'
                        : 'text-slate-500 hover:text-slate-900 bg-slate-200'
                    }`}
                    title="پاک کردن"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 2. Custom Artist Select Dropdown */}
              <div className="lg:col-span-3 relative z-30">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'artist' ? null : 'artist')}
                  className={`w-full min-h-[46px] flex items-center justify-between rounded-2xl px-3.5 py-2 border transition-all duration-200 cursor-pointer text-right ${
                    activeDropdown === 'artist'
                      ? isDark
                        ? 'bg-[#1A2035] border-[#F59E0B]/60 ring-2 ring-[#F59E0B]/20'
                        : 'bg-white border-[#F59E0B]/60 ring-2 ring-[#F59E0B]/20'
                      : isDark
                        ? 'bg-[#171B2D]/80 hover:bg-[#1C2238] border-[#242A42] hover:border-[#F59E0B]/40'
                        : 'bg-slate-100/90 hover:bg-slate-200/70 border-slate-200 hover:border-[#F59E0B]/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <User className="w-4 h-4 text-[#F59E0B] shrink-0" />
                    <span className={`text-xs sm:text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {selectedArtistLabel}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 mr-1 transition-transform duration-200 ${
                    activeDropdown === 'artist' ? 'rotate-180 text-[#F59E0B]' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {activeDropdown === 'artist' && (
                    <motion.div
                      key="artist-dropdown-menu"
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className={`absolute top-[calc(100%+6px)] right-0 left-0 backdrop-blur-2xl border rounded-2xl p-1.5 max-h-60 overflow-y-auto hide-scrollbar z-50 divide-y ${
                        isDark
                          ? 'bg-[#121627]/98 border-[#2B3454] shadow-[0_16px_40px_rgba(0,0,0,0.8)] divide-white/5'
                          : 'bg-white/98 border-slate-200 shadow-[0_16px_40px_rgba(0,0,0,0.12)] divide-slate-100'
                      }`}
                    >
                      {ARTISTS_LIST.map((artist) => {
                        const isAll = artist === 'همه هنرمندان';
                        const isSelected = isAll ? !artistQuery : artistQuery === artist;
                        return (
                          <button
                            key={artist}
                            type="button"
                            onClick={() => {
                              onArtistChange(isAll ? '' : artist);
                              setActiveDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-right cursor-pointer my-0.5 ${
                              isSelected
                                ? 'bg-[#F59E0B]/15 text-[#F59E0B] font-bold border border-[#F59E0B]/30'
                                : isDark
                                  ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            <span className="truncate">{artist}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mr-2" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Custom City Select Dropdown */}
              <div className="lg:col-span-2 relative z-20">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'city' ? null : 'city')}
                  className={`w-full min-h-[46px] flex items-center justify-between rounded-2xl px-3.5 py-2 border transition-all duration-200 cursor-pointer text-right ${
                    activeDropdown === 'city'
                      ? isDark
                        ? 'bg-[#1A2035] border-[#06B6D4]/60 ring-2 ring-[#06B6D4]/20'
                        : 'bg-white border-[#06B6D4]/60 ring-2 ring-[#06B6D4]/20'
                      : isDark
                        ? 'bg-[#171B2D]/80 hover:bg-[#1C2238] border-[#242A42] hover:border-[#06B6D4]/40'
                        : 'bg-slate-100/90 hover:bg-slate-200/70 border-slate-200 hover:border-[#06B6D4]/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MapPin className="w-4 h-4 text-[#06B6D4] shrink-0" />
                    <span className={`text-xs sm:text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {selectedCity}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 mr-1 transition-transform duration-200 ${
                    activeDropdown === 'city' ? 'rotate-180 text-[#06B6D4]' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {activeDropdown === 'city' && (
                    <motion.div
                      key="city-dropdown-menu"
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className={`absolute top-[calc(100%+6px)] right-0 left-0 backdrop-blur-2xl border rounded-2xl p-1.5 max-h-60 overflow-y-auto hide-scrollbar z-50 divide-y ${
                        isDark
                          ? 'bg-[#121627]/98 border-[#2B3454] shadow-[0_16px_40px_rgba(0,0,0,0.8)] divide-white/5'
                          : 'bg-white/98 border-slate-200 shadow-[0_16px_40px_rgba(0,0,0,0.12)] divide-slate-100'
                      }`}
                    >
                      {cities.map((city) => {
                        const isSelected = selectedCity === city;
                        return (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              onCityChange(city);
                              setActiveDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-right cursor-pointer my-0.5 ${
                              isSelected
                                ? 'bg-[#06B6D4]/15 text-[#06B6D4] font-bold border border-[#06B6D4]/30'
                                : isDark
                                  ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            <span className="truncate">{city}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#06B6D4] shrink-0 mr-2" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. Custom Date Filter Dropdown */}
              <div className="lg:col-span-2 relative z-10">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
                  className={`w-full min-h-[46px] flex items-center justify-between rounded-2xl px-3.5 py-2 border transition-all duration-200 cursor-pointer text-right ${
                    activeDropdown === 'date'
                      ? isDark
                        ? 'bg-[#1A2035] border-[#8B5CF6]/60 ring-2 ring-[#8B5CF6]/20'
                        : 'bg-white border-[#8B5CF6]/60 ring-2 ring-[#8B5CF6]/20'
                      : isDark
                        ? 'bg-[#171B2D]/80 hover:bg-[#1C2238] border-[#242A42] hover:border-[#8B5CF6]/40'
                        : 'bg-slate-100/90 hover:bg-slate-200/70 border-slate-200 hover:border-[#8B5CF6]/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Calendar className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                    <span className={`text-xs sm:text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {selectedDateLabel}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 mr-1 transition-transform duration-200 ${
                    activeDropdown === 'date' ? 'rotate-180 text-[#8B5CF6]' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {activeDropdown === 'date' && (
                    <motion.div
                      key="date-dropdown-menu"
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className={`absolute top-[calc(100%+6px)] right-0 left-0 backdrop-blur-2xl border rounded-2xl p-1.5 max-h-60 overflow-y-auto hide-scrollbar z-50 divide-y ${
                        isDark
                          ? 'bg-[#121627]/98 border-[#2B3454] shadow-[0_16px_40px_rgba(0,0,0,0.8)] divide-white/5'
                          : 'bg-white/98 border-slate-200 shadow-[0_16px_40px_rgba(0,0,0,0.12)] divide-slate-100'
                      }`}
                    >
                      {DATE_OPTIONS.map((item) => {
                        const isSelected = dateFilter === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => {
                              onDateFilterChange(item.value);
                              setActiveDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-right cursor-pointer my-0.5 ${
                              isSelected
                                ? 'bg-[#8B5CF6]/15 text-[#8B5CF6] font-bold border border-[#8B5CF6]/30'
                                : isDark
                                  ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            <span className="truncate">{item.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0 mr-2" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 5. CTA Search Button */}
              <div className="lg:col-span-1 relative z-0">
                <button
                  id="compact-search-btn"
                  onClick={() => {
                    onExecuteSearch();
                    setIsExpanded(false);
                    setActiveDropdown(null);
                  }}
                  className="w-full min-h-[46px] rounded-2xl bg-gradient-to-l from-[#FF3366] via-[#FF5733] to-[#F59E0B] hover:brightness-110 active:scale-95 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-[#FF3366]/25 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{searchButtonTextStr}</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

