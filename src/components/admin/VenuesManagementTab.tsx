import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Armchair, Building2, X } from 'lucide-react';
import { Venue } from '../../types';
import { toPersianDigits } from '../../utils/persianNumbers';
import { CITIES_LIST } from '../../data/mockEvents';

interface VenuesManagementTabProps {
  venues: Venue[];
  onSaveVenue: (venue: Partial<Venue>) => Promise<void>;
  onDeleteVenue: (id: string) => Promise<void>;
}

export const VenuesManagementTab: React.FC<VenuesManagementTabProps> = ({
  venues,
  onSaveVenue,
  onDeleteVenue,
}) => {
  const [editingVenue, setEditingVenue] = useState<Partial<Venue> | null>(null);

  const handleCreateNew = () => {
    setEditingVenue({
      name: '',
      city: 'تهران',
      address: '',
      capacity: 500,
      hasSeatedMap: true,
      sections: ['همکف VIP', 'بالکن'],
      hallCount: 1,
      contactPhone: '',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Top Banner & Add */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-2xs">
        <div>
          <h3 className="font-display font-black text-base text-slate-900">سالن‌ها و اماکن برگزاری</h3>
          <p className="text-xs text-slate-500 font-medium">مدیریت تالارها، نقشه‌های صندلی و ظرفیت مجموعه‌های فرهنگی</p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white text-xs font-black shadow-md shadow-[#FF3366]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن سالن جدید</span>
        </button>
      </div>

      {/* Venues Grid in Light Mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.map((venue) => (
          <div
            key={venue.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white transition-all space-y-3 shadow-2xs hover:shadow-sm hover:border-slate-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FF3366]/10 text-[#FF3366] border border-[#FF3366]/20 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{venue.name}</h4>
                  <span className="text-[11px] text-slate-500 font-medium">{venue.city}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditingVenue(venue)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shadow-2xs"
                  title="ویرایش سالن"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`آیا از حذف مجموعه «${venue.name}» مطمئن هستید؟`)) {
                      onDeleteVenue(venue.id);
                    }
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer shadow-2xs"
                  title="حذف سالن"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {venue.address}
            </p>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">ظرفیت کل:</span>
                <span className="font-bold font-sans text-slate-900">{toPersianDigits(venue.capacity)} صندلی</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">نقشه صندلی:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Armchair className="w-3 h-3" />
                  {venue.hasSeatedMap ? 'فعال (شماره‌دار)' : 'ظرفیت آزاد'}
                </span>
              </div>
            </div>

            {venue.sections && venue.sections.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {venue.sections.map((sec, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600 font-bold border border-slate-200/60">
                    {sec}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Venue Modal in Light Mode */}
      {editingVenue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" dir="rtl">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display font-black text-base text-slate-900">
                {editingVenue.id ? 'ویرایش سالن و نقشه' : 'افزودن سالن جدید'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingVenue(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">نام سالن / مجموعه *</label>
                <input
                  type="text"
                  value={editingVenue.name || ''}
                  onChange={(e) => setEditingVenue({ ...editingVenue, name: e.target.value })}
                  placeholder="مثال: تالار وحدت"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">شهر</label>
                  <select
                    value={editingVenue.city || 'تهران'}
                    onChange={(e) => setEditingVenue({ ...editingVenue, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                  >
                    {CITIES_LIST.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ظرفیت سالن (نفر)</label>
                  <input
                    type="number"
                    value={editingVenue.capacity || 0}
                    onChange={(e) => setEditingVenue({ ...editingVenue, capacity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">آدرس دقیق</label>
                <textarea
                  rows={2}
                  value={editingVenue.address || ''}
                  onChange={(e) => setEditingVenue({ ...editingVenue, address: e.target.value })}
                  placeholder="خیابان، پلاک، دسترسی..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">جایگاه‌ها و بخش‌های سالن (با کاما جدا کنید)</label>
                <input
                  type="text"
                  value={(editingVenue.sections || []).join('، ')}
                  onChange={(e) => {
                    const secs = e.target.value.split(/[,،]/).map(s => s.trim()).filter(Boolean);
                    setEditingVenue({ ...editingVenue, sections: secs });
                  }}
                  placeholder="همکف VIP، بالکن اول، بالکن دوم"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="hasSeatedMap"
                  checked={editingVenue.hasSeatedMap || false}
                  onChange={(e) => setEditingVenue({ ...editingVenue, hasSeatedMap: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF3366]"
                />
                <label htmlFor="hasSeatedMap" className="font-bold text-slate-700 cursor-pointer">
                  پشتیبانی از انتخاب صندلی شماره‌دار روی نقشه سالن
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setEditingVenue(null)}
                className="py-2 px-4 rounded-xl text-xs text-slate-600 hover:text-slate-900"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingVenue.name) {
                    alert('لطفاً نام سالن را وارد نمایید.');
                    return;
                  }
                  await onSaveVenue(editingVenue);
                  setEditingVenue(null);
                }}
                className="py-2 px-5 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white text-xs font-black shadow-md cursor-pointer"
              >
                ذخیره سالن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
