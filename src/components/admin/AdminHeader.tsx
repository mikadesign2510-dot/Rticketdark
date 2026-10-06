import React from 'react';
import { Search, Plus, RefreshCw } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuickAction?: () => void;
  quickActionLabel?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  onQuickAction,
  quickActionLabel,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header 
      className="px-6 py-4 border-b border-slate-200 bg-white/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs"
      dir="rtl"
    >
      <div>
        <h1 className="font-display font-black text-xl text-slate-900 tracking-tight flex items-center gap-2">
          <span>{title}</span>
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative w-64 sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="جستجو در تمام بخش‌ها..."
            className="w-full py-2.5 pr-9 pl-4 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF3366]/30 focus:border-[#FF3366] transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="بروزرسانی داده‌ها"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#FF3366]' : ''}`} />
          </button>
        )}

        {/* Quick Action Button */}
        {onQuickAction && quickActionLabel && (
          <button
            type="button"
            onClick={onQuickAction}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs font-black tracking-wide shadow-md shadow-[#FF3366]/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{quickActionLabel}</span>
          </button>
        )}
      </div>
    </header>
  );
};
