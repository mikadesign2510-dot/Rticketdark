import React from 'react';
import { EventCategory } from '../types';
import { SlidersHorizontal, Grid, List, X } from 'lucide-react';
import { toPersianDigits } from '../utils/persianNumbers';

interface CategoryFilterProps {
  selectedCategory: EventCategory;
  onSelectCategory: (cat: EventCategory) => void;
  sortBy: 'date' | 'price-asc' | 'price-desc' | 'popularity';
  onSortChange: (sort: 'date' | 'price-asc' | 'price-desc' | 'popularity') => void;
  resultsCount: number;
  totalCount: number;
  viewMode: 'grid' | 'list';
  onToggleViewMode: (mode: 'grid' | 'list') => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  resultsCount,
  totalCount,
  viewMode,
  onToggleViewMode,
  hasActiveFilters,
  onResetFilters,
}) => {
  const categories: { id: EventCategory; label: string }[] = [
    { id: 'all', label: 'تمام رشته‌های هنری' },
    { id: 'gallery', label: 'گالری و هنرهای تجسمی' },
    { id: 'theater', label: 'تئاتر و نمایش آوانگارد' },
    { id: 'concert', label: 'کنسرت و ارکستر سمفونیک' },
    { id: 'immersive', label: 'چیدمان تعاملی و چندحسی' },
  ];

  return (
    <div className="w-full mb-8 pt-4">
      {/* Category Pills and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1E2336]/80">
        
        {/* Category Discipline Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-pill-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-l from-[#FF3366] to-[#FF5533] text-white shadow-lg shadow-[#FF3366]/25 border border-transparent'
                    : 'bg-[#141724] text-zinc-300 hover:text-white hover:bg-[#1C2032] border border-[#23293F]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Right side: Results counter & Sort & View toggle */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
          
          {/* Active Filter reset badge */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-medium hover:bg-rose-900/50 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 ml-1" />
              <span>حذف فیلترها</span>
            </button>
          )}

          {/* Results Count with Persian Numerals */}
          <span className="text-xs text-zinc-400 font-medium hidden sm:inline-block">
            نمایش <strong className="text-white font-bold">{toPersianDigits(resultsCount)}</strong> از {toPersianDigits(totalCount)} رویداد
          </span>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-[#141724] border border-[#23293F] rounded-xl px-3 py-1.5 text-xs text-zinc-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
            <span className="text-zinc-400 text-xs font-semibold">ترتیب:</span>
            <select
              aria-label="مرتب‌سازی رویدادها"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pl-1 text-xs"
            >
              <option value="date" className="bg-[#141724] text-white">نزدیک‌ترین تاریخ</option>
              <option value="popularity" className="bg-[#141724] text-white">پیشنهاد کیوریتور / محبوب‌ترین</option>
              <option value="price-asc" className="bg-[#141724] text-white">قیمت: کم به زیاد</option>
              <option value="price-desc" className="bg-[#141724] text-white">قیمت: زیاد به کم</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="hidden sm:flex items-center bg-[#141724] border border-[#23293F] rounded-xl p-1">
            <button
              onClick={() => onToggleViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#22283E] text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="نمای شبکه‌ای"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-[#22283E] text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="نمای فهرستی مجله‌ای"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
