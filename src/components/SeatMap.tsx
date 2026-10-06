import React, { useMemo } from 'react';
import { SelectedSeat } from '../types';
import { toPersianDigits, formatPrice } from '../utils/persianNumbers';
import { useTheme } from '../context/ThemeContext';
import { Armchair, Check, Sparkles, AlertCircle, Info } from 'lucide-react';

interface SeatMapProps {
  selectedSeats: SelectedSeat[];
  onToggleSeat: (seat: SelectedSeat) => void;
  basePrice: number;
  hallName?: string;
  maxSeats?: number;
}

interface HallSeat {
  id: string;
  row: number;
  seatNumber: number;
  section: 'همکف VIP' | 'همکف استاندارد' | 'بالکن';
  price: number;
  isReserved: boolean;
}

// Generate realistic seats layout for the hall
const generateHallSeats = (basePrice: number): HallSeat[] => {
  const seats: HallSeat[] = [];

  // 9 Rows total
  for (let r = 1; r <= 9; r++) {
    const isVip = r <= 2;
    const isBalcony = r >= 8;
    const section = isVip ? 'همکف VIP' : isBalcony ? 'بالکن' : 'همکف استاندارد';
    const price = isVip ? Math.round(basePrice * 1.35) : isBalcony ? Math.round(basePrice * 0.9) : basePrice;

    // 12 seats per row
    for (let s = 1; s <= 12; s++) {
      const id = `R${r}-S${s}`;
      
      // Deterministic pseudo-reserved pattern so it stays consistent per slot
      const isReserved = 
        (r === 1 && (s === 4 || s === 5 || s === 8 || s === 9)) ||
        (r === 2 && (s === 6 || s === 7)) ||
        (r === 3 && (s === 2 || s === 3 || s === 10)) ||
        (r === 4 && (s === 5 || s === 6 || s === 7)) ||
        (r === 6 && (s === 1 || s === 12)) ||
        (r === 8 && (s === 6 || s === 7 || s === 8));

      seats.push({
        id,
        row: r,
        seatNumber: s,
        section,
        price,
        isReserved,
      });
    }
  }

  return seats;
};

export const SeatMap: React.FC<SeatMapProps> = ({
  selectedSeats,
  onToggleSeat,
  basePrice,
  hallName = 'سالن اصلی تالار',
  maxSeats = 8,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const allSeats = useMemo(() => generateHallSeats(basePrice), [basePrice]);

  // Group seats by row
  const rows = useMemo(() => {
    const rowMap = new Map<number, HallSeat[]>();
    for (const seat of allSeats) {
      if (!rowMap.has(seat.row)) {
        rowMap.set(seat.row, []);
      }
      rowMap.get(seat.row)!.push(seat);
    }
    return Array.from(rowMap.entries()).sort((a, b) => a[0] - b[0]);
  }, [allSeats]);

  const handleSeatClick = (seat: HallSeat) => {
    if (seat.isReserved) return;

    const isAlreadySelected = selectedSeats.some((s) => s.id === seat.id);
    if (!isAlreadySelected && selectedSeats.length >= maxSeats) {
      alert(`حداکثر می‌توانید ${toPersianDigits(maxSeats)} صندلی به صورت همزمان رزرو کنید.`);
      return;
    }

    onToggleSeat({
      id: seat.id,
      row: seat.row,
      seatNumber: seat.seatNumber,
      section: seat.section,
      price: seat.price,
    });
  };

  return (
    <div className={`p-4 sm:p-6 rounded-3xl border transition-colors ${
      isDark ? 'bg-[#111422] border-white/10' : 'bg-white border-slate-200/90 shadow-xs'
    }`}>
      {/* سربرگ پلان سالن */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-black/5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Armchair className="w-5 h-5 text-[#FF3366]" />
            <h3 className={`font-display font-black text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              پلان صندلی‌های سالن: {hallName}
            </h3>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            جهت انتخاب، روی صندلی‌های آزاد کلیک کنید (حداکثر {toPersianDigits(maxSeats)} صندلی).
          </p>
        </div>

        {/* وضعیت صندلی‌های انتخابی */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/30">
            {toPersianDigits(selectedSeats.length)} صندلی انتخاب شده
          </span>
        </div>
      </div>

      {/* راهنمای رنگ‌های صندلی (Legend) */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8 text-[11px]">
        <div className="flex items-center gap-1.5">
          <div className={`w-4 h-4 rounded-md border ${
            isDark ? 'bg-[#161B2E] border-white/20' : 'bg-slate-100 border-slate-300'
          }`} />
          <span className={isDark ? 'text-zinc-300' : 'text-slate-600'}>صندلی آزاد</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-[#FF3366] border border-[#FF3366] flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
          </div>
          <span className="text-[#FF3366] font-bold">انتخاب شما</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className={`w-4 h-4 rounded-md border ${
            isDark ? 'bg-amber-500/15 border-amber-500/40' : 'bg-amber-50 border-amber-400'
          }`} />
          <span className="text-amber-500 font-semibold">همکف VIP</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className={`w-4 h-4 rounded-md border opacity-40 cursor-not-allowed ${
            isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-300 border-slate-400'
          }`} />
          <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>رزرو شده</span>
        </div>
      </div>

      {/* صحنه و سن اصلی اجرا (STAGE) */}
      <div className="relative max-w-lg mx-auto mb-10 text-center">
        <div className="h-10 sm:h-12 rounded-t-[50px] bg-gradient-to-b from-[#FF884D]/30 via-[#FF3366]/20 to-transparent border-t-2 border-x-2 border-[#FF3366]/50 flex items-center justify-center shadow-[0_-10px_25px_rgba(255,51,102,0.15)]">
          <span className="font-display font-black text-xs sm:text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FF884D] via-[#FF3366] to-[#F59E0B]">
            🎭 صحنه و سن اصلی اجرا (STAGE) 🎭
          </span>
        </div>
        <div className="text-[10px] text-zinc-500 mt-1 font-medium">دید مستقیم به صحنه</div>
      </div>

      {/* چیدمان صندلی‌ها در سالن (قابلیت اسکرول افقی در موبایل برای خوانایی کامل) */}
      <div className="overflow-x-auto pb-4 hide-scrollbar">
        <div className="min-w-[560px] max-w-2xl mx-auto space-y-3">
          {rows.map(([rowNum, rowSeats]) => {
            const isVip = rowNum <= 2;
            const isBalcony = rowNum >= 8;

            return (
              <div key={`row-${rowNum}`} className="flex items-center gap-2">
                {/* شماره ردیف سمت راست */}
                <div className={`w-16 text-right text-[11px] font-bold shrink-0 ${
                  isVip ? 'text-amber-400' : isBalcony ? 'text-cyan-400' : isDark ? 'text-zinc-400' : 'text-slate-500'
                }`}>
                  ردیف {toPersianDigits(rowNum)}
                  {isVip && <span className="block text-[9px] text-amber-500/80">VIP</span>}
                </div>

                {/* صندلی‌های این ردیف (با ایجاد راهرو در وسط صندلی ۶ و ۷) */}
                <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2">
                  {/* نیمه اول صندلی‌ها (۱ تا ۶) */}
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {rowSeats.slice(0, 6).map((seat) => renderSeatButton(seat))}
                  </div>

                  {/* راهروی میانی سالن */}
                  <div className={`w-5 sm:w-8 h-6 border-x border-dashed flex items-center justify-center ${
                    isDark ? 'border-white/10 text-zinc-600' : 'border-slate-200 text-slate-300'
                  }`}>
                    <span className="text-[8px] rotate-90 select-none">راهرو</span>
                  </div>

                  {/* نیمه دوم صندلی‌ها (۷ تا ۱۲) */}
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {rowSeats.slice(6, 12).map((seat) => renderSeatButton(seat))}
                  </div>
                </div>

                {/* شماره ردیف سمت چپ */}
                <div className={`w-12 text-left text-[11px] font-bold shrink-0 ${
                  isDark ? 'text-zinc-400' : 'text-slate-400'
                }`}>
                  {toPersianDigits(rowNum)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* یادداشت راهنمای ورود سالن */}
      <div className={`mt-6 p-3 rounded-2xl border flex items-center gap-2 text-xs ${
        isDark ? 'bg-white/5 border-white/5 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <Info className="w-4 h-4 text-[#FF884D] shrink-0" />
        <span>
          شماره ردیف و صندلی‌ها پس از پرداخت به صورت خودکار بر روی کارت دیجیتال و بارکد اختصاصی شما ثبت می‌گردد.
        </span>
      </div>
    </div>
  );

  function renderSeatButton(seat: HallSeat) {
    const isSelected = selectedSeats.some((s) => s.id === seat.id);

    if (seat.isReserved) {
      return (
        <button
          key={seat.id}
          disabled
          type="button"
          title={`ردیف ${seat.row} صندلی ${seat.seatNumber} (فروخته شده)`}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] opacity-35 cursor-not-allowed border ${
            isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-slate-300 border-slate-400 text-slate-500'
          }`}
        >
          {toPersianDigits(seat.seatNumber)}
        </button>
      );
    }

    if (isSelected) {
      return (
        <button
          key={seat.id}
          type="button"
          onClick={() => handleSeatClick(seat)}
          title={`ردیف ${seat.row} صندلی ${seat.seatNumber} • ${seat.section} • ${formatPrice(seat.price)} تومان (برای لغو کلیک کنید)`}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FF3366] text-white font-bold text-[10px] flex items-center justify-center shadow-md shadow-[#FF3366]/40 ring-2 ring-[#FF3366] scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      );
    }

    // Available seat
    const isVip = seat.section === 'همکف VIP';
    return (
      <button
        key={seat.id}
        type="button"
        onClick={() => handleSeatClick(seat)}
        title={`ردیف ${seat.row} صندلی ${seat.seatNumber} • ${seat.section} • ${formatPrice(seat.price)} تومان`}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] font-medium border transition-all cursor-pointer hover:scale-110 active:scale-95 ${
          isVip
            ? isDark
              ? 'bg-[#1D1B22] border-amber-500/40 text-amber-300 hover:border-amber-400 hover:bg-amber-500/20 shadow-xs'
              : 'bg-amber-50/70 border-amber-400 text-amber-800 hover:bg-amber-100 shadow-xs'
            : isDark
              ? 'bg-[#15192A] border-[#22283E] text-zinc-300 hover:border-white/40 hover:text-white'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-white'
        }`}
      >
        {toPersianDigits(seat.seatNumber)}
      </button>
    );
  }
};

export default SeatMap;
