import React, { useState } from 'react';
import { 
  Ticket, 
  Search, 
  Printer, 
  Trash2, 
  CheckCircle2
} from 'lucide-react';
import { PurchasedTicket } from '../../types';
import { toPersianDigits, formatPrice } from '../../utils/persianNumbers';

interface OrdersManagementTabProps {
  orders: PurchasedTicket[];
  onSelectOrderForPrint: (order: PurchasedTicket) => void;
  onDeleteOrder: (ticketId: string) => Promise<void>;
}

export const OrdersManagementTab: React.FC<OrdersManagementTabProps> = ({
  orders,
  onSelectOrderForPrint,
  onDeleteOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'seated' | 'normal'>('all');

  const filteredOrders = orders.filter((order) => {
    if (filterType === 'seated' && order.ticketingType !== 'seated') return false;
    if (filterType === 'normal' && order.ticketingType === 'seated') return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchRef = order.bookingRef.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchEmail = order.customerEmail.toLowerCase().includes(q);
      const matchTitle = (order.event?.title || '').toLowerCase().includes(q);
      if (!matchRef && !matchName && !matchEmail && !matchTitle) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Header and Controls */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو با کد پیگیری، نام یا ایمیل..."
              className="w-full py-2 pr-8 pl-3 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF3366]/30"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'all' ? 'bg-[#FF3366] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              همه ({toPersianDigits(orders.length)})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('seated')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'seated' ? 'bg-[#FF3366] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              صندلی شماره‌دار
            </button>
            <button
              type="button"
              onClick={() => setFilterType('normal')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'normal' ? 'bg-[#FF3366] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ظرفیت آزاد
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          نمایش <strong className="text-slate-900 font-sans">{toPersianDigits(filteredOrders.length)}</strong> بلیت صادرشده
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="py-3.5 pr-4">کد پیگیری رسمی</th>
                <th className="py-3.5">رویداد</th>
                <th className="py-3.5">خریدار و تماس</th>
                <th className="py-3.5">سانس و تاریخ</th>
                <th className="py-3.5">جایگاه / صندلی‌ها</th>
                <th className="py-3.5">مبلغ کل</th>
                <th className="py-3.5">وضعیت</th>
                <th className="py-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.ticketId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 pr-4">
                    <span className="font-mono font-bold text-sm text-amber-700 tracking-wider block" dir="ltr">
                      {order.bookingRef}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono" dir="ltr">{order.ticketId}</span>
                  </td>
                  <td className="py-3.5">
                    <span className="font-bold text-slate-900 block max-w-xs truncate">{order.event?.title || 'رویداد هنری'}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{order.event?.venue}</span>
                  </td>
                  <td className="py-3.5">
                    <span className="font-bold text-slate-800 block">{order.customerName}</span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5" dir="ltr">{order.customerEmail}</span>
                  </td>
                  <td className="py-3.5">
                    <span className="font-bold text-slate-700 block">{toPersianDigits(order.selectedDate)}</span>
                    <span className="text-emerald-600 text-[11px] font-bold block mt-0.5">ساعت {toPersianDigits(order.selectedTime)}</span>
                  </td>
                  <td className="py-3.5">
                    {order.selectedSeats && order.selectedSeats.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {order.selectedSeats.map((s) => (
                          <span key={s.id} className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-bold">
                            ردیف {toPersianDigits(s.row)} ص {toPersianDigits(s.seatNumber)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-700 font-sans font-bold">
                        {toPersianDigits(order.quantity)} بلیت ({order.tier?.name || 'عادی'})
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 font-sans font-bold text-emerald-600">
                    {formatPrice(order.totalAmount)} تومان
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      تسویه شاپرک
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectOrderForPrint(order)}
                        className="p-2 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white hover:brightness-110 shadow-2xs cursor-pointer"
                        title="چاپ و دانلود بلیت (نسخه رسمی PDF)"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`آیا از ابطال و حذف سفارش «${order.bookingRef}» مطمئن هستید؟`)) {
                            onDeleteOrder(order.ticketId);
                          }
                        }}
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-red-600 text-slate-500 hover:text-white transition-colors cursor-pointer shadow-2xs"
                        title="ابطال بلیت"
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
    </div>
  );
};
