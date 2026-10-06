import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { HeroBanner, SecondBanner } from '../../lib/db';
import { toPersianDigits } from '../../utils/persianNumbers';

interface BannersManagementTabProps {
  banners: HeroBanner[];
  secondBanners: SecondBanner[];
  onSaveBanner: (banner: Partial<HeroBanner>) => Promise<void>;
  onDeleteBanner: (id: string) => Promise<void>;
  onSaveSecondBanner: (banner: Partial<SecondBanner>) => Promise<void>;
  onDeleteSecondBanner: (id: string) => Promise<void>;
}

export const BannersManagementTab: React.FC<BannersManagementTabProps> = ({
  banners,
  secondBanners,
  onSaveBanner,
  onDeleteBanner,
  onSaveSecondBanner,
  onDeleteSecondBanner,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'second'>('hero');
  const [editingHero, setEditingHero] = useState<Partial<HeroBanner> | null>(null);
  const [editingSecond, setEditingSecond] = useState<Partial<SecondBanner> | null>(null);

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Sub tabs switcher */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('hero')}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === 'hero' ? 'bg-[#FF3366] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            اسلایدر اصلی هدر (Hero Slider)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('second')}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === 'second' ? 'bg-[#FF3366] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            بنرهای تبلیغاتی ردیف دوم (Second Banners)
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (activeSubTab === 'hero') {
              setEditingHero({
                title: '',
                subtitle: '',
                imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=2000',
                buttonText: 'تهیه بلیت',
                buttonUrl: '#',
                layout: 'cinematic',
                isActive: true,
                order: banners.length,
              });
            } else {
              setEditingSecond({
                title: '',
                subtitle: '',
                imageUrl: 'https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=1200&q=80',
                linkUrl: '#',
                isActive: true,
                order: secondBanners.length,
              });
            }
          }}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white text-xs font-black shadow-md shadow-[#FF3366]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{activeSubTab === 'hero' ? 'افزودن اسلاید اصلی' : 'افزودن بنر دوم'}</span>
        </button>
      </div>

      {/* Hero Banners View in Light Mode */}
      {activeSubTab === 'hero' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((bnr, idx) => (
            <div
              key={bnr.id}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all flex flex-col justify-between shadow-2xs hover:shadow-sm"
            >
              <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                <img
                  src={bnr.imageUrl}
                  alt={bnr.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20">
                      اسلاید شماره #{toPersianDigits(idx + 1)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSaveBanner({ ...bnr, isActive: !bnr.isActive })}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                        bnr.isActive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {bnr.isActive ? 'فعال' : 'غیرفعال'}
                    </button>
                  </div>
                  <h4 className="font-bold text-sm text-white line-clamp-1">{bnr.title}</h4>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <p className="text-slate-600 line-clamp-2 leading-relaxed">
                  {bnr.subtitle}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <span>دکمه:</span>
                    <span className="text-slate-900 font-bold">{bnr.buttonText || 'مشاهده'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingHero(bnr)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`آیا از حذف اسلاید «${bnr.title}» مطمئن هستید؟`)) {
                          onDeleteBanner(bnr.id);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Second Banners View in Light Mode */}
      {activeSubTab === 'second' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {secondBanners.map((bnr) => (
            <div
              key={bnr.id}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all flex flex-col shadow-2xs hover:shadow-sm"
            >
              <div className="relative h-40 w-full bg-slate-900 overflow-hidden">
                <img
                  src={bnr.imageUrl}
                  alt={bnr.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end">
                  <h4 className="font-bold text-base text-white">{bnr.title}</h4>
                  {bnr.subtitle && <p className="text-xs text-zinc-300 mt-0.5">{bnr.subtitle}</p>}
                </div>
              </div>

              <div className="p-4 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px] truncate max-w-xs" dir="ltr">
                  {bnr.linkUrl || '#'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingSecond(bnr)}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`آیا از حذف بنر «${bnr.title}» مطمئن هستید؟`)) {
                        onDeleteSecondBanner(bnr.id);
                      }
                    }}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Hero Banner Modal in Light Mode */}
      {editingHero && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" dir="rtl">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display font-black text-base text-slate-900">
                {editingHero.id ? 'ویرایش اسلاید اصلی' : 'افزودن اسلاید جدید'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingHero(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">عنوان اسلاید *</label>
                <input
                  type="text"
                  value={editingHero.title || ''}
                  onChange={(e) => setEditingHero({ ...editingHero, title: e.target.value })}
                  placeholder="مثال: جشنواره فیلم‌های برتر"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">توضیحات کوتاه</label>
                <textarea
                  rows={2}
                  value={editingHero.subtitle || ''}
                  onChange={(e) => setEditingHero({ ...editingHero, subtitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">آدرس تصویر عریض (URL) *</label>
                <input
                  type="text"
                  value={editingHero.imageUrl || ''}
                  onChange={(e) => setEditingHero({ ...editingHero, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">متن دکمه (CTA)</label>
                  <input
                    type="text"
                    value={editingHero.buttonText || ''}
                    onChange={(e) => setEditingHero({ ...editingHero, buttonText: e.target.value })}
                    placeholder="مثال: تهیه بلیت"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">لینک دکمه</label>
                  <input
                    type="text"
                    value={editingHero.buttonUrl || ''}
                    onChange={(e) => setEditingHero({ ...editingHero, buttonUrl: e.target.value })}
                    placeholder="#"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="heroIsActive"
                  checked={editingHero.isActive !== false}
                  onChange={(e) => setEditingHero({ ...editingHero, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF3366]"
                />
                <label htmlFor="heroIsActive" className="font-bold text-slate-700 cursor-pointer">
                  فعال و نمایش در صفحه نخست
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setEditingHero(null)}
                className="py-2 px-4 rounded-xl text-xs text-slate-600 hover:text-slate-900"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingHero.title) {
                    alert('لطفاً عنوان اسلاید را وارد نمایید.');
                    return;
                  }
                  await onSaveBanner(editingHero);
                  setEditingHero(null);
                }}
                className="py-2 px-5 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white text-xs font-black shadow-md cursor-pointer"
              >
                ذخیره اسلاید
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Second Banner Modal in Light Mode */}
      {editingSecond && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" dir="rtl">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display font-black text-base text-slate-900">
                {editingSecond.id ? 'ویرایش بنر ردیف دوم' : 'افزودن بنر ردیف دوم'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSecond(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">عنوان بنر *</label>
                <input
                  type="text"
                  value={editingSecond.title || ''}
                  onChange={(e) => setEditingSecond({ ...editingSecond, title: e.target.value })}
                  placeholder="مثال: پیشنهاد ویژه این هفته"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">توضیحات کوتاه</label>
                <input
                  type="text"
                  value={editingSecond.subtitle || ''}
                  onChange={(e) => setEditingSecond({ ...editingSecond, subtitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">آدرس تصویر (URL) *</label>
                <input
                  type="text"
                  value={editingSecond.imageUrl || ''}
                  onChange={(e) => setEditingSecond({ ...editingSecond, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">لینک مقصد بنر</label>
                <input
                  type="text"
                  value={editingSecond.linkUrl || ''}
                  onChange={(e) => setEditingSecond({ ...editingSecond, linkUrl: e.target.value })}
                  placeholder="#"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setEditingSecond(null)}
                className="py-2 px-4 rounded-xl text-xs text-slate-600 hover:text-slate-900"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingSecond.title) {
                    alert('لطفاً عنوان بنر را وارد نمایید.');
                    return;
                  }
                  await onSaveSecondBanner(editingSecond);
                  setEditingSecond(null);
                }}
                className="py-2 px-5 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white text-xs font-black shadow-md cursor-pointer"
              >
                ذخیره بنر
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
