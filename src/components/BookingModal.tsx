import React, { useState, useEffect } from 'react';
import { ArtEvent, TicketTier, PurchasedTicket, SelectedSeat, TicketingType } from '../types';
import { X, Calendar, Clock, Ticket, Check, ShieldCheck, Download, Printer, User, Mail, CheckCircle2, Armchair, Sparkles } from 'lucide-react';
import { toPersianDigits, formatPrice, formatPersianNumberWithCommas } from '../utils/persianNumbers';
import { useTheme } from '../context/ThemeContext';
import { TicketQrCode, TicketBarcode } from './TicketBarcode';
import { PrintableTicketPdf } from './PrintableTicketPdf';

interface BookingModalProps {
  event: ArtEvent | null;
  onClose: () => void;
  onTicketPurchased: (ticket: PurchasedTicket) => void;
  initialTimeSlot?: string;
  initialDate?: string;
  ticketingType?: TicketingType;
  selectedSeats?: SelectedSeat[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  event,
  onClose,
  onTicketPurchased,
  initialTimeSlot,
  initialDate,
  ticketingType,
  selectedSeats = [],
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const isSeated = ticketingType === 'seated' || (selectedSeats && selectedSeats.length > 0);

  // Earliest showtime is automatically detected and selected
  const earliestTimeSlot = event?.timeSlots && event.timeSlots.length > 0 ? event.timeSlots[0] : '۱۹:۳۰';

  const [selectedDate, setSelectedDate] = useState<string>(initialDate || event?.startDate || '');
  const [selectedTime, setSelectedTime] = useState<string>(initialTimeSlot || earliestTimeSlot);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(event?.tiers?.[0] || null);
  const [quantity, setQuantity] = useState<number>(isSeated && selectedSeats.length > 0 ? selectedSeats.length : 1);
  const [includeCatalog, setIncludeCatalog] = useState<boolean>(false);
  
  // Reset and auto-select earliest showtime whenever an event opens
  useEffect(() => {
    if (event) {
      setSelectedDate(initialDate || event.startDate || '');
      setSelectedTime(initialTimeSlot || event.timeSlots?.[0] || '۱۹:۳۰');
      setSelectedTier(event.tiers?.[0] || null);
      setConfirmedTicket(null);
      setShowPrintablePdf(false);
      setQuantity(isSeated && selectedSeats.length > 0 ? selectedSeats.length : 1);
    }
  }, [event, initialTimeSlot, initialDate, isSeated, selectedSeats.length]);

  // Attendee Info
  const [customerName, setCustomerName] = useState<string>('کیان رادمنش');
  const [customerEmail, setCustomerEmail] = useState<string>('kian.radmanesh@gmail.com');
  
  // Confirmation state
  const [confirmedTicket, setConfirmedTicket] = useState<PurchasedTicket | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showPrintablePdf, setShowPrintablePdf] = useState<boolean>(false);

  if (!event) return null;

  const effectiveTier = selectedTier || event.tiers?.[0] || {
    id: isSeated ? 'tier-reserved' : 'tier-general',
    name: isSeated ? 'جایگاه اختصاصی سالن' : 'ورود عادی',
    description: isSeated ? 'صندلی‌های شماره‌دار سالن' : 'بلیت عادی',
    price: event.priceFrom,
    availableCount: 100,
    perks: isSeated ? ['صندلی اختصاصی', 'ورود بدون صف'] : ['ورود عادی'],
  };

  const catalogPrice = 20; // 20,000 toman
  const preservationFee = 5; // 5,000 toman
  
  const seatsTotal = isSeated && selectedSeats.length > 0
    ? selectedSeats.reduce((sum, s) => sum + s.price, 0)
    : 0;
  const basePriceTotal = isSeated && selectedSeats.length > 0
    ? seatsTotal
    : effectiveTier.price * quantity;

  const subtotal = basePriceTotal + (includeCatalog ? catalogPrice * quantity : 0);
  const total = subtotal + preservationFee;

  const handleConfirmBooking = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const rawRef = Math.floor(100000 + Math.random() * 900000);
      const bookingRef = `ART-${rawRef}`;
      const newTicket: PurchasedTicket = {
        ticketId: `tkt-${Date.now()}`,
        bookingRef,
        event,
        tier: effectiveTier,
        quantity: isSeated && selectedSeats.length > 0 ? selectedSeats.length : quantity,
        selectedTime,
        selectedDate,
        purchasedAt: 'امروز، ' + toPersianDigits(new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })),
        customerName: customerName || 'هنردوست گرامی',
        customerEmail: customerEmail || 'patron@artis.ir',
        totalAmount: total,
        qrCodeSeed: bookingRef,
        ticketingType: isSeated ? 'seated' : 'normal',
        selectedSeats: selectedSeats || [],
      };

      setConfirmedTicket(newTicket);
      onTicketPurchased(newTicket);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-xl overflow-y-auto text-right animate-fade-in" dir="rtl">
      <div 
        id="booking-checkout-modal"
        className={`relative w-full max-w-2xl max-h-[92vh] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto border transition-colors flex flex-col animate-fade-in ${
          isDark 
            ? 'bg-[#0F121E] border-[#262C45] text-white' 
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/20'
        }`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b shrink-0 ${
          isDark ? 'border-[#21263C] bg-[#141827]' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF3366]/20 flex items-center justify-center text-[#FF3366]">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-display font-bold text-base sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {confirmedTicket ? 'صدور رسمی بلیت و کارت دیجیتال ورود' : 'رزرو و صدور بلیت نمایشگاه'}
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                {event.title} • {event.venue}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isDark 
                ? 'hover:bg-white/10 text-zinc-400 hover:text-white' 
                : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
            }`}
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* IF CONFIRMED: SHOW LUXURY DIGITAL TICKET PASS */}
        {confirmedTicket ? (
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[calc(92vh-70px)] animate-fade-in">
            {/* Header Success Badge */}
            <div className="text-center py-1">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2.5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className={`font-display font-black text-xl sm:text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                پرداخت شما موفق و بلیت صادر شد!
              </h2>
              <p className={`text-xs mt-1 max-w-md mx-auto ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                کارت دیجیتال ورود صادر شد و نسخه الکترونیک آن به آدرس <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`} dir="ltr">{confirmedTicket.customerEmail}</span> ارسال گردید.
              </p>
            </div>

            {/* ARTIS INTEGRATED LUXURY DIGITAL PASS CARD */}
            <div className={`relative rounded-2xl overflow-hidden border shadow-xl ${
              isDark 
                ? 'bg-gradient-to-b from-[#141829] to-[#0D101C] border-[#2A3350] text-white' 
                : 'bg-gradient-to-b from-white via-slate-50 to-slate-100 border-slate-200 text-slate-900 shadow-slate-200'
            }`}>
              {/* Top Gradient Ribbon */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#FF3366] via-[#FF884D] to-[#F59E0B]" />

              {/* Event Header Banner */}
              <div className="relative h-32 sm:h-40 w-full overflow-hidden bg-slate-950">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D101C] via-black/40 to-transparent flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF3366] text-white shadow-xs">
                      {event.categoryLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                      گذر رسمی ورود (ARTIS PASS)
                    </span>
                  </div>
                  <h3 className="font-display font-black text-base sm:text-xl text-white line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-xs text-zinc-300 font-medium mt-0.5">
                    {event.artist} {event.artistRole ? `• ${event.artistRole}` : ''}
                  </p>
                </div>
              </div>

              {/* Details & Info */}
              <div className="p-4 sm:p-5 space-y-3.5">
                {/* Reference & Tier */}
                <div className="flex items-center justify-between pb-2.5 border-b border-black/5 dark:border-white/10 text-xs">
                  <div>
                    <span className={`text-[10px] font-bold block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>شماره پیگیری سفارش:</span>
                    <span className="font-mono font-bold text-sm text-[#F59E0B] tracking-wider" dir="ltr">
                      {confirmedTicket.bookingRef}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className={`text-[10px] font-bold block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>نوع جایگاه:</span>
                    <span className="font-bold text-[#FF3366]">{confirmedTicket.tier.name}</span>
                  </div>
                </div>

                {/* Date, Time, Venue */}
                <div className={`grid grid-cols-2 gap-3 p-3 rounded-xl border text-xs ${
                  isDark ? 'bg-[#080A12] border-white/10' : 'bg-white border-slate-200'
                }`}>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-bold block">تاریخ و سانس:</span>
                    <div className="font-bold">{toPersianDigits(confirmedTicket.selectedDate)}</div>
                    <div className="text-emerald-400 text-[11px] font-bold">ساعت {toPersianDigits(confirmedTicket.selectedTime)}</div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-bold block">محل برگزاری:</span>
                    <div className="font-bold truncate">{event.hallName || event.venue}</div>
                    <div className="text-zinc-400 text-[10px]">{event.city}</div>
                  </div>
                </div>

                {/* Seats or Capacity */}
                {confirmedTicket.selectedSeats && confirmedTicket.selectedSeats.length > 0 ? (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                    <span className="text-[10px] text-amber-400 font-bold block mb-1">
                      صندلی‌های رزرو شده ({toPersianDigits(confirmedTicket.selectedSeats.length)} عدد):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {confirmedTicket.selectedSeats.map(s => (
                        <span key={s.id} className="px-2 py-0.5 rounded-lg bg-black/30 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                          ردیف {toPersianDigits(s.row)} صندلی {toPersianDigits(s.seatNumber)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="font-semibold text-zinc-400">تعداد نفرات / بلیت ورود:</span>
                    <span className="font-bold text-emerald-400">{toPersianDigits(confirmedTicket.quantity)} بلیت استاندارد معتبر</span>
                  </div>
                )}

                {/* Attendee & Total Amount */}
                <div className="flex items-center justify-between text-xs px-1">
                  <div>
                    <span className="text-zinc-400">دارنده بلیت: </span>
                    <strong className={isDark ? 'text-white' : 'text-slate-900'}>{confirmedTicket.customerName}</strong>
                  </div>
                  <div className="font-sans font-bold text-emerald-500">
                    {formatPrice(confirmedTicket.totalAmount)} تومان (تسویه شده)
                  </div>
                </div>

                {/* Barcode & QR Code Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1 border-t border-black/5 dark:border-white/10">
                  {/* QR Code */}
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                    isDark ? 'bg-[#080A12] border-white/10' : 'bg-white border-slate-200 shadow-xs'
                  }`}>
                    <div className="bg-white p-1 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                      <TicketQrCode 
                        value={`https://artis.ir/ticket/verify?ref=${confirmedTicket.bookingRef}&id=${confirmedTicket.ticketId}&event=${encodeURIComponent(confirmedTicket.event.id)}`} 
                        size={56} 
                      />
                    </div>
                    <div className="text-[10px] leading-relaxed">
                      <span className="font-bold block text-emerald-400">کیوآرکد ورود هوشمند</span>
                      <span className="text-zinc-400">اسکن با دوربین گوشی یا اسکنر گیت تردد</span>
                    </div>
                  </div>

                  {/* Linear Barcode Code 128 */}
                  <div className={`p-2.5 rounded-xl border flex flex-col justify-center items-center ${
                    isDark ? 'bg-[#080A12] border-white/10' : 'bg-white border-slate-200 shadow-xs'
                  }`}>
                    <div className="w-full bg-white px-2 py-1 rounded flex items-center justify-center overflow-hidden border border-slate-200" dir="ltr">
                      <TicketBarcode 
                        value={confirmedTicket.bookingRef.startsWith('ART-') ? confirmedTicket.bookingRef : `ART-${confirmedTicket.bookingRef}`} 
                        height={28} 
                        width={1.3} 
                      />
                    </div>
                    <div className="flex items-center justify-between w-full mt-1 px-1">
                      <span className="font-mono font-bold text-[8px] tracking-wider text-zinc-400" dir="ltr">
                        *{confirmedTicket.bookingRef.startsWith('ART-') ? confirmedTicket.bookingRef : `ART-${confirmedTicket.bookingRef}`}*
                      </span>
                      <span className="font-sans text-[9px] text-zinc-400 font-bold">
                        سریال: {toPersianDigits(confirmedTicket.bookingRef)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Buttons: تک‌خطی و بهینه‌سازی شده از نظر بصری */}
            <div className="pt-2 space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {/* ۱. دکمه دریافت بلیط */}
                <button
                  type="button"
                  onClick={() => setShowPrintablePdf(true)}
                  className="py-3 px-3 sm:px-5 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs sm:text-sm font-black tracking-wide shadow-lg shadow-[#FF3366]/25 hover:shadow-xl hover:shadow-[#FF3366]/35 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap border border-white/20"
                >
                  <Download className="w-4 h-4 shrink-0 text-white" />
                  <span className="whitespace-nowrap font-display font-black">دریافت بلیط</span>
                </button>

                {/* ۲. دکمه چاپ بلیط */}
                <button
                  type="button"
                  onClick={() => setShowPrintablePdf(true)}
                  className={`py-3 px-3 sm:px-5 rounded-xl text-xs sm:text-sm font-black tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap border active:scale-[0.98] ${
                    isDark 
                      ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/40 shadow-md shadow-emerald-950/40' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  }`}
                >
                  <Printer className="w-4 h-4 shrink-0 text-emerald-300 sm:text-inherit" />
                  <span className="whitespace-nowrap font-display font-black">چاپ بلیط</span>
                </button>
              </div>

              {/* دکمه تأیید و بستن */}
              <button
                type="button"
                onClick={onClose}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 border ${
                  isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>تأیید و بازگشت به رویداد</span>
              </button>
            </div>

            {/* Printable PDF Modal */}
            {showPrintablePdf && (
              <PrintableTicketPdf
                ticket={confirmedTicket}
                onClose={() => setShowPrintablePdf(false)}
              />
            )}
          </div>
        ) : (
          /* BOOKING STEP FLOW */
          <div className="p-4 sm:p-8 space-y-5 sm:space-y-6 max-h-[82vh] overflow-y-auto animate-fade-in">
            
            {/* Step 1: Time Slot Selection */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className={`block text-xs font-bold ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  ۱. انتخاب سانس ورود زمان‌بندی‌شده
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Clock className="w-3 h-3 ml-0.5 text-emerald-400" />
                  {initialTimeSlot ? `سانس انتخابی: ساعت ${toPersianDigits(selectedTime)}` : 'زودترین سانس (انتخاب خودکار)'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {event.timeSlots.map((slot, index) => {
                  const isEarliest = index === 0;
                  const isSelected = selectedTime === slot;
                  return (
                    <button
                      key={`slot-${slot}-${index}`}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`relative pt-3.5 pb-2.5 px-3 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FF3366]/20 border-[#FF3366] text-[#FF3366] shadow-md shadow-[#FF3366]/20 ring-1 ring-[#FF3366]'
                          : isDark
                            ? 'bg-[#141726] border-[#22283E] text-zinc-300 hover:border-zinc-500'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {isEarliest && (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-gradient-to-r from-[#FF3366] to-[#F59E0B] text-white shadow-xs">
                          زودترین سانس
                        </span>
                      )}
                      <span>{toPersianDigits(slot)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Choose Ticket Tier or Show Seats */}
            {isSeated && selectedSeats.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className={`block text-xs font-bold ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    ۲. صندلی‌های رزرو شده در سالن ({event.hallName || event.venue})
                  </label>
                  <span className="text-[11px] font-bold text-[#FF3366] bg-[#FF3366]/10 px-2.5 py-0.5 rounded-full border border-[#FF3366]/20 flex items-center gap-1">
                    <Armchair className="w-3.5 h-3.5" />
                    {toPersianDigits(selectedSeats.length)} صندلی
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedSeats.map((s) => (
                    <div
                      key={s.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                        isDark ? 'bg-[#15192A] border-[#22283E]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Armchair className="w-4 h-4 text-[#FF3366]" />
                        <div>
                          <span className="font-bold">ردیف {toPersianDigits(s.row)} • صندلی {toPersianDigits(s.seatNumber)}</span>
                          <span className="text-[10px] text-zinc-400 block">{s.section}</span>
                        </div>
                      </div>
                      <span className="font-bold text-[#FF3366]">{formatPrice(s.price)} تومان</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  ۲. انتخاب رده و پلن ورودی
                </label>
                <div className="space-y-2.5">
                  {event.tiers.map((tier, index) => {
                    const isSelected = selectedTier?.id === tier.id;
                    return (
                      <div
                        key={`tier-${tier.id}-${index}`}
                        onClick={() => setSelectedTier(tier)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? isDark
                              ? 'bg-[#1B2033] border-[#FF3366] shadow-md shadow-[#FF3366]/15'
                              : 'bg-rose-50/70 border-[#FF3366] shadow-md shadow-rose-200/50'
                            : isDark
                              ? 'bg-[#131624] border-[#22283E] hover:border-[#303854]'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-display font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {tier.name}
                              </span>
                              {tier.id === 'tier-vip' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E0B]/20 text-[#D97706] border border-[#F59E0B]/30">
                                  پرطرفدارترین
                                </span>
                              )}
                            </div>
                            <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                              {tier.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {tier.perks.map((perk, i) => (
                                <span key={`perk-${i}-${perk}`} className={`inline-flex items-center gap-1 text-[11px] ${
                                  isDark ? 'text-zinc-300' : 'text-slate-600'
                                }`}>
                                  <Check className="w-3 h-3 text-[#10B981] ml-1" />
                                  {perk}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="text-left shrink-0">
                            <span className={`font-display font-bold text-lg block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {formatPrice(tier.price)}
                            </span>
                            <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>هر بلیت</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {isSeated && selectedSeats.length > 0 ? (
              <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
                isDark ? 'bg-[#141726] border-[#22283E]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="font-bold block">تعداد صندلی‌های انتخابی:</span>
                  <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    بر اساس صندلی‌های کلیک شده در پلان سالن
                  </span>
                </div>
                <span className="font-display font-black text-lg text-[#FF3366]">
                  {toPersianDigits(selectedSeats.length)} صندلی
                </span>
              </div>
            ) : (
              <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                isDark ? 'bg-[#141726] border-[#22283E]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    تعداد بلیت‌ها
                  </span>
                  <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    حداکثر {toPersianDigits(8)} بلیت در هر سفارش
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className={`w-9 h-9 rounded-xl disabled:opacity-40 font-bold flex items-center justify-center transition-colors cursor-pointer ${
                      isDark ? 'bg-[#1E2338] hover:bg-[#282F4B] text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    -
                  </button>
                  <span className={`font-display font-bold text-lg w-6 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {toPersianDigits(quantity)}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= 8}
                    onClick={() => setQuantity((q) => Math.min(8, q + 1))}
                    className={`w-9 h-9 rounded-xl disabled:opacity-40 font-bold flex items-center justify-center transition-colors cursor-pointer ${
                      isDark ? 'bg-[#1E2338] hover:bg-[#282F4B] text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add-on: Hardcover Catalogue */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isDark ? 'bg-[#141726] border-[#22283E]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <input
                  id="catalog-checkbox"
                  type="checkbox"
                  checked={includeCatalog}
                  onChange={(e) => setIncludeCatalog(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF3366] accent-[#FF3366] cursor-pointer"
                />
                <label htmlFor="catalog-checkbox" className="cursor-pointer">
                  <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    افزودن کاتالوگ مونوگراف جلدسخت نفیس نمایشگاه
                  </span>
                  <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    کتاب ۱۸۰ صفحه‌ای گلاسه تمام‌رنگی آثار (تحویل در غرفه تشریفات تالار)
                  </span>
                </label>
              </div>
              <span className={`font-bold text-xs shrink-0 ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
                +{formatPrice(catalogPrice)}
              </span>
            </div>

            {/* Attendee Details Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  نام و نام خانوادگی خریدار (جهت درج روی کارت امنیتی)
                </label>
                <div className={`relative flex items-center rounded-xl px-3 py-2 border focus-within:border-[#FF3366] ${
                  isDark ? 'bg-[#141726] border-[#23283E]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <User className="w-4 h-4 text-zinc-400 ml-2 shrink-0" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="مثلاً: کیان رادمنش"
                    className={`w-full bg-transparent text-xs focus:outline-none ${isDark ? 'text-white' : 'text-slate-900'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  ایمیل جهت دریافت نسخه دیجیتال بلیت
                </label>
                <div className={`relative flex items-center rounded-xl px-3 py-2 border focus-within:border-[#FF3366] ${
                  isDark ? 'bg-[#141726] border-[#23283E]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <Mail className="w-4 h-4 text-zinc-400 ml-2 shrink-0" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    dir="ltr"
                    className={`w-full bg-transparent text-xs focus:outline-none text-right ${isDark ? 'text-white' : 'text-slate-900'}`}
                  />
                </div>
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
              isDark ? 'bg-[#0B0D16] border-[#1E2338]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className={`flex justify-between ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                <span>{selectedTier.name} × {toPersianDigits(quantity)}</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(selectedTier.price * quantity)}</span>
              </div>
              {includeCatalog && (
                <div className={`flex justify-between ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  <span>کاتالوگ نفیس نمایشگاه × {toPersianDigits(quantity)}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(catalogPrice * quantity)}</span>
                </div>
              )}
              <div className={`flex justify-between ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                <span>عوارض توسعه و نگهداری ابنیه و گنجینه هنری</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatPrice(preservationFee)}</span>
              </div>
              <div className={`pt-2 border-t flex justify-between items-baseline ${isDark ? 'border-[#1E2338]' : 'border-slate-200'}`}>
                <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>مبلغ کل قابل پرداخت</span>
                <span className="font-display font-bold text-xl text-[#FF884D]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <div className="pt-2">
              <button
                id="complete-booking-btn"
                disabled={isProcessing}
                onClick={handleConfirmBooking}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] hover:brightness-110 active:scale-[0.98] text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-[#FF3366]/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>در حال صدور بلیت و تولید بارکد اختصاصی ورود...</span>
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 ml-1" />
                    <span>تأیید نهایی و پرداخت {formatPrice(total)}</span>
                  </>
                )}
              </button>
              <p className={`text-center text-[11px] mt-2 flex items-center justify-center gap-1 ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}>
                <span>تضمین اصالت گیشه رسمی • ۱۰۰٪ ضمانت بازگشت وجه در صورت لغو رویداد</span>
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
