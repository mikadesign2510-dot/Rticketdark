import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Armchair, 
  Check, 
  X, 
  Ticket
} from 'lucide-react';
import { ArtEvent, EventCategory, TicketingType } from '../../types';
import { toPersianDigits, formatPrice } from '../../utils/persianNumbers';
import { CITIES_LIST } from '../../data/mockEvents';

interface EventsManagementTabProps {
  events: ArtEvent[];
  onSaveEvent: (event: Partial<ArtEvent>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  editingEvent: Partial<ArtEvent> | null;
  setEditingEvent: (event: Partial<ArtEvent> | null) => void;
}

export const EventsManagementTab: React.FC<EventsManagementTabProps> = ({
  events,
  onSaveEvent,
  onDeleteEvent,
  editingEvent,
  setEditingEvent,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEvents = events.filter((ev) => {
    if (categoryFilter !== 'all' && ev.category !== categoryFilter) return false;
    if (cityFilter !== 'all' && ev.city !== cityFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchArtist = ev.artist.toLowerCase().includes(q);
      const matchVenue = ev.venue.toLowerCase().includes(q);
      if (!matchTitle && !matchArtist && !matchVenue) return false;
    }
    return true;
  });

  const handleCreateNew = () => {
    setEditingEvent({
      title: '',
      subtitle: '',
      category: 'theater',
      categoryLabel: 'تئاتر',
      artist: '',
      artistRole: 'کارگردان',
      venue: 'تالار وحدت',
      city: 'تهران',
      country: 'ایران',
      address: '',
      startDate: '۱۴۰۵/۰۸/۰۱',
      endDate: '۱۴۰۵/۰۸/۳۰',
      time: '۱۹:۳۰ - ۲۱:۳۰',
      timeSlots: ['۱۸:۰۰', '۲۰:۳۰'],
      imageUrl: 'https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=800&q=80',
      wideBannerUrl: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1600&q=80',
      galleryImages: [],
      priceFrom: 180,
      status: 'ظرفیت موجود',
      rating: 4.8,
      reviewsCount: 12,
      description: '',
      curatorStatement: '',
      highlightTags: ['ویژه', 'پیشنهاد سردبیر'],
      tiers: [
        { id: 't-1', name: 'همکف VIP', description: 'بهترین زاویه دید سالن', price: 250, availableCount: 50, perks: ['پذیرایی', 'ورود بدون صف'] },
        { id: 't-2', name: 'جایگاه عادی', description: 'صندلی‌های بالکن', price: 180, availableCount: 120, perks: ['ورود عادی'] }
      ],
      ticketingType: 'normal',
      isActive: true,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Top Filter and Controls */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو بر اساس عنوان، هنرمند یا سالن..."
              className="w-full py-2 pr-8 pl-3 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF3366]/30"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 px-3 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
          >
            <option value="all">همه دسته‌بندی‌ها</option>
            <option value="theater">تئاتر و نمایش</option>
            <option value="concert">کنسرت و موسیقی</option>
            <option value="gallery">گالری و تجسمی</option>
            <option value="immersive">هنر تعاملی</option>
          </select>

          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="py-2 px-3 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
          >
            <option value="all">همه شهرها</option>
            {CITIES_LIST.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="py-2.5 px-5 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs font-black shadow-md shadow-[#FF3366]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن رویداد جدید</span>
        </button>
      </div>

      {/* Events Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="py-3.5 pr-4">رویداد</th>
                <th className="py-3.5">هنرمند / پدیدآور</th>
                <th className="py-3.5">دسته‌بندی و شهر</th>
                <th className="py-3.5">نوع فروش</th>
                <th className="py-3.5">قیمت پایه</th>
                <th className="py-3.5">وضعیت</th>
                <th className="py-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={ev.imageUrl}
                        alt={ev.title}
                        className="w-12 h-14 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{ev.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{ev.venue}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="font-bold text-slate-800">{ev.artist}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{ev.artistRole}</span>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {ev.categoryLabel || ev.category}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-1">{ev.city}</span>
                  </td>
                  <td className="py-3.5">
                    {ev.ticketingType === 'seated' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Armchair className="w-3 h-3" />
                        صندلی شماره‌دار
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Ticket className="w-3 h-3" />
                        ظرفیت آزاد
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 font-sans font-bold text-emerald-600">
                    {formatPrice(ev.priceFrom)} تومان
                  </td>
                  <td className="py-3.5">
                    <button
                      type="button"
                      onClick={() => onSaveEvent({ ...ev, isActive: ev.isActive === false ? true : false })}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        ev.isActive !== false
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {ev.isActive !== false ? 'روی گیشه (فعال)' : 'غیرفعال / آرشیو'}
                    </button>
                  </td>
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingEvent(ev)}
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-[#FF3366] text-slate-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                        title="ویرایش کامل رویداد"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`آیا از حذف رویداد «${ev.title}» اطمینان دارید؟`)) {
                            onDeleteEvent(ev.id);
                          }
                        }}
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-red-600 text-slate-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                        title="حذف رویداد"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Event Modal in Light Mode */}
      {editingEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto" dir="rtl">
          <div className="relative w-full max-w-3xl my-auto rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FF3366]/10 text-[#FF3366] flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="font-display font-black text-base text-slate-900">
                  {editingEvent.id ? `ویرایش رویداد: ${editingEvent.title}` : 'افزودن رویداد جدید به گیشه'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(92vh-130px)] text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">عنوان اصلی رویداد *</label>
                  <input
                    type="text"
                    value={editingEvent.title || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    placeholder="مثال: نمایش هملت"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">زیرعنوان یا عبارت توصیفی</label>
                  <input
                    type="text"
                    value={editingEvent.subtitle || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, subtitle: e.target.value })}
                    placeholder="مثال: روایتی نو از تراژدی شکسپیر"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Artist & Role */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">نام هنرمند / کارگردان *</label>
                  <input
                    type="text"
                    value={editingEvent.artist || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, artist: e.target.value })}
                    placeholder="مثال: علی رفیعی"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">نقش هنرمند</label>
                  <input
                    type="text"
                    value={editingEvent.artistRole || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, artistRole: e.target.value })}
                    placeholder="مثال: کارگردان و طراح صحنه"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Category & City */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">دسته‌بندی</label>
                  <select
                    value={editingEvent.category || 'theater'}
                    onChange={(e) => {
                      const val = e.target.value as EventCategory;
                      const labels: Record<string, string> = {
                        theater: 'تئاتر',
                        concert: 'کنسرت',
                        gallery: 'گالری',
                        immersive: 'هنر تعاملی'
                      };
                      setEditingEvent({ 
                        ...editingEvent, 
                        category: val as any,
                        categoryLabel: labels[val] || 'رویداد'
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="theater">تئاتر و نمایش</option>
                    <option value="concert">کنسرت و موسیقی</option>
                    <option value="gallery">گالری و تجسمی</option>
                    <option value="immersive">هنر تعاملی</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">شهر برگزاری</label>
                  <select
                    value={editingEvent.city || 'تهران'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                  >
                    {CITIES_LIST.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Venue & Hall */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">محل برگزاری (سالن / مجموعه) *</label>
                  <input
                    type="text"
                    value={editingEvent.venue || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                    placeholder="مثال: تالار وحدت"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">نام سالن اختصاصی</label>
                  <input
                    type="text"
                    value={editingEvent.hallName || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, hallName: e.target.value })}
                    placeholder="مثال: سالن اصلی"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Ticketing Type */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">نحوه انتخاب بلیت در گیشه</label>
                  <select
                    value={editingEvent.ticketingType || 'normal'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, ticketingType: e.target.value as TicketingType })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="normal">ظرفیت آزاد (تعیین تعداد بلیت)</option>
                    <option value="seated">انتخاب صندلی اختصاصی روی نقشه سالن</option>
                  </select>
                </div>

                {/* Base Price */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">قیمت شروع بلیت (هزار تومان) *</label>
                  <input
                    type="number"
                    value={editingEvent.priceFrom || 0}
                    onChange={(e) => setEditingEvent({ ...editingEvent, priceFrom: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Poster Image URL */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">آدرس اینترنتی پوستر رسمی (تناسب ۲:۳)</label>
                  <input
                    type="text"
                    value={editingEvent.imageUrl || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                    dir="ltr"
                  />
                </div>

                {/* Wide Banner URL */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">آدرس اینترنتی بنر عریض سینمایی (پایین پوستر)</label>
                  <input
                    type="text"
                    value={editingEvent.wideBannerUrl || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, wideBannerUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                    dir="ltr"
                  />
                </div>

                {/* Time slots */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">سانس‌های اجرا (با کاما جدا کنید)</label>
                  <input
                    type="text"
                    value={(editingEvent.timeSlots || []).join('، ')}
                    onChange={(e) => {
                      const slots = e.target.value.split(/[,،]/).map(s => s.trim()).filter(Boolean);
                      setEditingEvent({ ...editingEvent, timeSlots: slots });
                    }}
                    placeholder="مثال: ۱۸:۰۰، ۲۰:۳۰"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">خلاصه و معرفی کامل اثر</label>
                  <textarea
                    rows={3}
                    value={editingEvent.description || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    placeholder="توضیحات و داستان اثر..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs leading-relaxed focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                انصراف و بستن
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (!editingEvent.title) {
                    alert('لطفاً عنوان رویداد را وارد نمایید.');
                    return;
                  }
                  await onSaveEvent(editingEvent);
                  setEditingEvent(null);
                }}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs font-black shadow-md shadow-[#FF3366]/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>ذخیره تغییرات رویداد</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
