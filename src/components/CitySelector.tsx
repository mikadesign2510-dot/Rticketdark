import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check, Globe, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

interface CitySelectorProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
  cities: string[];
  isScrolled?: boolean;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  selectedCity,
  onSelectCity,
  cities,
  isScrolled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredCities = cities.filter((c) =>
    c.toLowerCase().includes(searchFilter.trim().toLowerCase())
  );

  const handleSelect = (city: string) => {
    onSelectCity(city);
    setIsOpen(false);
    setSearchFilter('');
    // Smooth scroll to events list
    const el = document.getElementById('events-grid-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isAllCities = !selectedCity || selectedCity === 'همه شهرها';

  return (
    <div className="relative" ref={dropdownRef} dir="rtl">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="انتخاب شهر"
        className={`group flex items-center gap-2 rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold transition-all duration-300 cursor-pointer border select-none ${
          isOpen
            ? isDark
              ? 'bg-white/15 border-white/25 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
              : 'bg-white border-slate-300 text-slate-900 shadow-md shadow-slate-200'
            : isDark
              ? isScrolled
                ? 'bg-[#0D101C]/80 hover:bg-white/10 border-white/10 text-zinc-200 hover:text-white'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200 hover:text-white'
              : isScrolled
                ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:text-slate-950'
                : 'bg-slate-100/80 hover:bg-slate-200/80 border-slate-200/80 text-slate-700 hover:text-slate-950'
        } active:scale-95`}
      >
        <span className="relative flex items-center justify-center">
          <MapPin
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isAllCities
                ? isDark
                  ? 'text-cyan-400 group-hover:text-cyan-300'
                  : 'text-cyan-600'
                : 'text-[#FF3366]'
            }`}
          />
          {!isAllCities && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#FF3366] animate-pulse" />
          )}
        </span>

        <span className="max-w-[90px] sm:max-w-[110px] truncate tracking-wide">
          {selectedCity || 'همه شهرها'}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-white' : 'opacity-60 group-hover:opacity-100'
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="city-selector-menu"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute left-0 top-full mt-2.5 w-60 sm:w-68 rounded-2xl sm:rounded-[1.25rem] p-2.5 z-50 shadow-2xl border backdrop-blur-2xl overflow-hidden ${
              isDark
                ? 'bg-[#0E111C]/95 border-white/10 text-white shadow-[0_25px_60px_rgba(0,0,0,0.85)]'
                : 'bg-white/98 border-slate-200/90 text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.14)]'
            }`}
          >
            {/* Header info */}
            <div className="px-2.5 pt-1.5 pb-2 flex items-center justify-between border-b border-black/5 dark:border-white/5">
              <span className={`text-[11px] font-bold flex items-center gap-1.5 ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}>
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>موقعیت مکانی رویدادها</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                isDark ? 'bg-white/5 text-zinc-400' : 'bg-slate-100 text-slate-500'
              }`}>
                {filteredCities.length} شهر
              </span>
            </div>

            {/* Quick Search if more than 5 cities */}
            {cities.length > 5 && (
              <div className="my-2 px-1">
                <div
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs ${
                    isDark
                      ? 'bg-black/30 border-white/10 text-white placeholder-zinc-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 opacity-50 shrink-0" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="جستجوی نام شهر..."
                    className="w-full bg-transparent focus:outline-none text-xs"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Cities List */}
            <div className="max-h-56 overflow-y-auto no-scrollbar py-1 space-y-1">
              {filteredCities.length === 0 ? (
                <div className="py-4 text-center text-xs text-zinc-500">
                  شهری با این عنوان یافت نشد
                </div>
              ) : (
                filteredCities.map((city) => {
                  const isSelected = selectedCity === city || (!selectedCity && city === 'همه شهرها');
                  return (
                    <button
                      key={city}
                      onClick={() => handleSelect(city)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-right group ${
                        isSelected
                          ? isDark
                            ? 'bg-white/15 text-white font-black'
                            : 'bg-slate-900 text-white font-black shadow-sm'
                          : isDark
                            ? 'text-zinc-300 hover:text-white hover:bg-white/5'
                            : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full transition-transform ${
                            isSelected
                              ? 'bg-cyan-400 scale-125'
                              : isDark
                                ? 'bg-zinc-600 group-hover:bg-zinc-400'
                                : 'bg-slate-300 group-hover:bg-slate-400'
                          }`}
                        />
                        <span>{city}</span>
                      </div>

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom status */}
            {!isAllCities && (
              <div className="pt-2 border-t border-black/5 dark:border-white/5 px-1">
                <button
                  onClick={() => handleSelect('همه شهرها')}
                  className={`w-full py-1.5 text-center text-[11px] font-semibold transition-colors cursor-pointer rounded-lg ${
                    isDark
                      ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30'
                      : 'text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50'
                  }`}
                >
                  نمایش رویدادهای همه شهرها
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
