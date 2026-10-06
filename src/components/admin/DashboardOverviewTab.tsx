import React from 'react';
import { 
  TrendingUp, 
  Ticket, 
  Calendar, 
  Users, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Printer 
} from 'lucide-react';
import { ArtEvent, PurchasedTicket } from '../../types';
import { toPersianDigits, formatPrice } from '../../utils/persianNumbers';

interface DashboardOverviewTabProps {
  events: ArtEvent[];
  orders: PurchasedTicket[];
  onNavigateToTab: (tab: any) => void;
  onSelectOrderForPrint: (order: PurchasedTicket) => void;
  onAddNewEvent: () => void;
}

export const DashboardOverviewTab: React.FC<DashboardOverviewTabProps> = ({
  events,
  orders,
  onNavigateToTab,
  onSelectOrderForPrint,
  onAddNewEvent,
}) => {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalTicketsIssued = orders.reduce((sum, o) => sum + (o.quantity || 1), 0);
  const activeEventsCount = events.filter(e => e.isActive !== false).length;
  const seatedEventsCount = events.filter(e => e.ticketingType === 'seated').length;

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Welcome Banner in Light Mode */}
      <div className="p-6 rounded-3xl border border-slate-200 bg-gradient-to-l from-white via-rose-50/30 to-amber-50/30 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF3366]/10 border border-[#FF3366]/20 text-[#FF3366] text-[10px] font-black">
                سیستم آنلاین آرتیس
              </span>
              <span className="text-slate-500 text-xs font-medium">سامانه متمرکز گیشه و صدور بلیت</span>
            </div>
            <h2 className="font-display font-black text-2xl text-slate-900">
              خوش آمدید، پنل مدیریت رویدادها و بلیت‌های آرتیکت
            </h2>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              تمام اطلاعات رویدادها، سانس‌ها، ظرفیت سالن‌ها، فروش و شخصی‌سازی ظاهر سایت به صورت زنده در دسترس و قابل ویرایش است.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onAddNewEvent}
              className="py-3 px-5 rounded-2xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs font-black shadow-md shadow-[#FF3366]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ایجاد رویداد جدید</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('appearance')}
              className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              تنظیمات ظاهر سایت
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards in Light Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold text-slate-500">مجموع فروش و تسویه</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-sans font-black text-2xl text-slate-900 tracking-tight">
            {formatPrice(totalRevenue)} <span className="text-xs font-normal text-slate-500">تومان</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>تسویه شده از طریق شاپرک</span>
          </div>
        </div>

        {/* Total Tickets */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold text-slate-500">بلیت‌های صادرشده</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#FF3366] border border-rose-100 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="font-sans font-black text-2xl text-slate-900 tracking-tight">
            {toPersianDigits(totalTicketsIssued)} <span className="text-xs font-normal text-slate-500">بلیت</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span>در {toPersianDigits(orders.length)} سفارش معتبر</span>
          </div>
        </div>

        {/* Active Events */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold text-slate-500">رویدادهای روی گیشه</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="font-sans font-black text-2xl text-slate-900 tracking-tight">
            {toPersianDigits(activeEventsCount)} <span className="text-xs font-normal text-slate-500">رویداد</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-blue-600 font-medium">
            <span>{toPersianDigits(seatedEventsCount)} رویداد با انتخاب صندلی</span>
          </div>
        </div>

        {/* Capacity / Visitors */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold text-slate-500">نرخ تکمیل ظرفیت</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-sans font-black text-2xl text-slate-900 tracking-tight">
            {toPersianDigits(84)}%
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-600 font-medium">
            <span>استقبال عالی در سانس‌های پایانی</span>
          </div>
        </div>
      </div>

      {/* Recent Orders and Top Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-black text-base text-slate-900">آخرین سفارش‌ها و صدور بلیت</h3>
              <p className="text-xs text-slate-500">فهرست آخرین خریدهای موفق از درگاه شتاب</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('orders')}
              className="text-xs font-bold text-[#FF884D] hover:underline cursor-pointer"
            >
              مشاهده همه سفارشات
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold">
                  <th className="py-3 pr-3 rounded-r-lg">کد پیگیری</th>
                  <th className="py-3">رویداد</th>
                  <th className="py-3">خریدار</th>
                  <th className="py-3">تعداد / صندلی</th>
                  <th className="py-3">مبلغ</th>
                  <th className="py-3 text-center rounded-l-lg">چاپ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.ticketId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pr-3 font-mono font-bold text-amber-700" dir="ltr">
                      {order.bookingRef}
                    </td>
                    <td className="py-3 font-bold text-slate-900 max-w-[180px] truncate">
                      {order.event?.title || 'رویداد هنری'}
                    </td>
                    <td className="py-3 text-slate-700 font-medium">
                      {order.customerName}
                    </td>
                    <td className="py-3 text-slate-600 font-sans">
                      {order.selectedSeats && order.selectedSeats.length > 0 
                        ? `${toPersianDigits(order.selectedSeats.length)} صندلی سالن` 
                        : `${toPersianDigits(order.quantity)} بلیت عادی`}
                    </td>
                    <td className="py-3 font-bold text-emerald-600 font-sans">
                      {formatPrice(order.totalAmount)} ت
                    </td>
                    <td className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onSelectOrderForPrint(order)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                        title="چاپ و دانلود بلیت"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Events Breakdown (1 Column) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-base text-slate-900">پرفروش‌ترین رویدادها</h3>
            <button
              type="button"
              onClick={() => onNavigateToTab('events')}
              className="text-xs font-bold text-[#FF884D] hover:underline cursor-pointer"
            >
              مدیریت رویدادها
            </button>
          </div>

          <div className="space-y-3">
            {events.slice(0, 5).map((ev, index) => (
              <div 
                key={ev.id}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-3 transition-colors hover:bg-slate-50"
              >
                <span className="font-mono font-black text-xs text-[#FF3366] w-4 text-center">
                  #{toPersianDigits(index + 1)}
                </span>
                <img
                  src={ev.imageUrl}
                  alt={ev.title}
                  className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 truncate">{ev.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{ev.artist} • {ev.city}</p>
                </div>
                <div className="text-left font-sans text-xs font-bold text-emerald-600 shrink-0">
                  {formatPrice(ev.priceFrom)} ت
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
