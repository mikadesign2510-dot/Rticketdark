import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  MapPin, 
  Ticket, 
  ArrowRight, 
  Calendar, 
  Check, 
  ShieldCheck, 
  Building2, 
  Car, 
  Train, 
  CheckCircle2,
  Armchair,
  Users,
  CreditCard,
  Lock,
  Smartphone,
  Mail,
  User,
  QrCode,
  Download,
  Printer,
  RefreshCw,
  AlertCircle,
  Tag,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { ArtEvent, EventCategory, SelectedSeat, TicketingType, PurchasedTicket } from '../types';
import { toPersianDigits, formatPrice } from '../utils/persianNumbers';
import { useTheme } from '../context/ThemeContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SiteSettings } from '../lib/db';
import { SeatMap } from './SeatMap';
import { PrintableTicketPdf } from './PrintableTicketPdf';
import { TicketQrCode, TicketBarcode } from './TicketBarcode';

interface EventScheduleModalProps {
  event: ArtEvent;
  onClose: () => void;
  onBuyTicket: (
    event: ArtEvent, 
    initialSlot?: string, 
    initialDate?: string, 
    ticketingType?: TicketingType,
    selectedSeats?: SelectedSeat[]
  ) => void;
  onTicketPurchased?: (ticket: PurchasedTicket) => void;
  siteSettings?: SiteSettings;
  cities?: string[];
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
  selectedCategory?: EventCategory;
  onSelectCategory?: (category: EventCategory) => void;
  savedCount?: number;
  ticketsCount?: number;
  onOpenTickets?: () => void;
  onOpenSaved?: () => void;
}

// Generate realistic show dates
const generateShowDates = (baseDate?: string) => [
  { id: 'd1', label: 'امروز', dateStr: baseDate || '۱۵ بهمن ۱۴۰۳', isSpecial: true },
  { id: 'd2', label: 'فردا پنجشنبه', dateStr: '۱۶ بهمن ۱۴۰۳', isSpecial: false },
  { id: 'd3', label: 'جمعه', dateStr: '۱۷ بهمن ۱۴۰۳', isSpecial: true },
  { id: 'd4', label: 'شنبه', dateStr: '۱۸ بهمن ۱۴۰۳', isSpecial: false },
  { id: 'd5', label: 'یکشنبه', dateStr: '۱۹ بهمن ۱۴۰۳', isSpecial: false },
];

export const EventScheduleModal: React.FC<EventScheduleModalProps> = ({
  event,
  onClose,
  onBuyTicket,
  onTicketPurchased,
  siteSettings,
  cities = [],
  selectedCity = 'همه شهرها',
  onSelectCity = () => {},
  selectedCategory = 'all',
  onSelectCategory = (_cat: EventCategory) => {},
  savedCount = 0,
  ticketsCount = 0,
  onOpenTickets = () => {},
  onOpenSaved = () => {},
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const handleContainerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 35);
  };

  // رصد آنی و مداوم اسکرول جهت هماهنگی و جابجایی هدر سایت
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => {
      setIsScrolled(el.scrollTop > 35);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Four-step checkout flow:
  // 1. 'schedule': انتخاب سانس، تعداد یا صندلی
  // 2. 'confirmation': تائید پیش‌فاکتور و اطلاعات خریدار
  // 3. 'gateway': درگاه پرداخت امن شاپرک
  // 4. 'success': رسید پرداخت و صدور بلیت قطعی
  const [currentStep, setCurrentStep] = useState<'schedule' | 'confirmation' | 'gateway' | 'success'>('schedule');

  // Two Ticketing Modes: 'normal' (عادی بدون صندلی) or 'seated' (با انتخاب صندلی سالن)
  const defaultMode: TicketingType = event.ticketingType || 
    (event.category === 'theater' || event.category === 'concert' ? 'seated' : 'normal');
  const [activeTicketingType, setActiveTicketingType] = useState<TicketingType>(defaultMode);

  const dates = generateShowDates(event.startDate);
  const [selectedDay, setSelectedDay] = useState(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>(
    event.timeSlots && event.timeSlots.length > 0 ? event.timeSlots[0] : '۱۹:۳۰'
  );
  
  // Normal mode quantity
  const [ticketQuantity, setTicketQuantity] = useState(1);

  // Seated mode chosen seats
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

  // Attendee Information (Confirmation Step)
  const [buyerName, setBuyerName] = useState('کیان رادمنش');
  const [buyerMobile, setBuyerMobile] = useState('۰۹۱۲۳۴۵۶۷۸۹');
  const [buyerEmail, setBuyerEmail] = useState('kian.radmanesh@gmail.com');
  const [buyerNationalId, setBuyerNationalId] = useState('۰۰۱۲۳۴۵۶۷۸');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Gateway selection
  const [selectedGateway, setSelectedGateway] = useState<'mellat' | 'saman' | 'zarinpal'>('mellat');

  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showPrintablePdf, setShowPrintablePdf] = useState(false);

  // Gateway card input simulator states
  const [cardNumber, setCardNumber] = useState('۶۱۰۴ - ۳۳۷۸ - ۴۹۱۵ - ۲۰۸۱');
  const [cardCvv2, setCardCvv2] = useState('۷۴۲');
  const [cardExpMonth, setCardExpMonth] = useState('۰۸');
  const [cardExpYear, setCardExpYear] = useState('۰۶');
  const [cardPin, setCardPin] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(120);
  const [gatewayCountdown, setGatewayCountdown] = useState(600); // 10 minutes session
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Confirmed ticket state
  const [issuedTicket, setIssuedTicket] = useState<PurchasedTicket | null>(null);
  const [bankRefId, setBankRefId] = useState('');
  const [traceNumber, setTraceNumber] = useState('');

  // Scroll to top helper when navigating steps
  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleSeat = (seat: SelectedSeat) => {
    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.id === seat.id);
      if (exists) {
        return prev.filter((s) => s.id !== seat.id);
      }
      return [...prev, seat];
    });
  };

  // Wide banner without text overlay
  const bannerImg = event.wideBannerUrl || event.imageUrl;

  // Compute end time based on slot (90 min duration)
  const getSlotEndTime = (time: string) => {
    const [hours, mins] = time.split(':').map(Number);
    let endHour = (hours || 20) + 1;
    let endMin = (mins || 30) + 30;
    if (endMin >= 60) {
      endHour += 1;
      endMin -= 60;
    }
    return `${endHour < 10 ? '0' : ''}${endHour}:${endMin < 10 ? '0' : ''}${endMin}`;
  };

  // Base total
  const baseTotal = activeTicketingType === 'seated'
    ? selectedSeats.reduce((sum, s) => sum + s.price, 0)
    : event.priceFrom * ticketQuantity;

  // Final total with discount
  const finalPayable = Math.max(0, baseTotal - discountAmount);

  // Apply discount code
  const handleApplyDiscount = () => {
    const clean = discountCode.trim().toUpperCase();
    if (clean === 'ARTIS' || clean === 'ARTIS20') {
      const disc = Math.round(baseTotal * 0.2);
      setDiscountAmount(disc);
      setDiscountApplied(true);
    } else if (clean === 'NOROOZ' || clean === 'OFF50') {
      setDiscountAmount(50000);
      setDiscountApplied(true);
    } else {
      alert('کد تخفیف وارد شده معتبر نمی‌باشد. (کد تست: ARTIS)');
    }
  };

  // Step 1 -> Step 2: Go to confirmation
  const handleProceedToConfirmation = () => {
    if (activeTicketingType === 'seated' && selectedSeats.length === 0) {
      alert('لطفاً حداقل یک صندلی از روی پلان سالن انتخاب نمایید.');
      return;
    }
    setCurrentStep('confirmation');
    scrollToTop();
  };

  // Step 2 -> Step 3: Go to payment gateway
  const handleProceedToGateway = () => {
    if (!termsAccepted) {
      alert('لطفاً قوانین و مقررات حضور در رویداد را تایید فرمایید.');
      return;
    }
    if (!buyerName.trim() || !buyerMobile.trim()) {
      alert('لطفاً نام و نام‌خانوادگی و شماره همراه را تکمیل فرمایید.');
      return;
    }
    setCurrentStep('gateway');
    setGatewayCountdown(600);
    setOtpSent(false);
    setCardPin('');
    scrollToTop();
  };

  // Step 3: OTP request
  const handleRequestOtp = () => {
    setOtpSent(true);
    setOtpTimer(120);
    // Auto-fill test OTP after 1 second for seamless developer test
    setTimeout(() => {
      setCardPin('۸۴۹۲۱');
    }, 900);
  };

  // OTP Countdown timer
  useEffect(() => {
    let interval: any = null;
    if (currentStep === 'gateway' && otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, otpSent, otpTimer]);

  // Gateway Session timer
  useEffect(() => {
    let interval: any = null;
    if (currentStep === 'gateway' && gatewayCountdown > 0) {
      interval = setInterval(() => {
        setGatewayCountdown((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, gatewayCountdown]);

  // Step 3 -> Step 4: Complete Payment in Gateway
  const handleFinalizePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      const generatedRef = `ART-${Math.floor(100000 + Math.random() * 900000)}`;
      const generatedBankRef = Math.floor(10000000 + Math.random() * 90000000).toString();
      const generatedTrace = Math.floor(100000 + Math.random() * 900000).toString();
      setBankRefId(generatedBankRef);
      setTraceNumber(generatedTrace);

      const effectiveTier = event.tiers?.[0] || {
        id: activeTicketingType === 'seated' ? 'tier-reserved' : 'tier-general',
        name: activeTicketingType === 'seated' ? 'جایگاه اختصاصی سالن' : 'ورود عادی',
        description: activeTicketingType === 'seated' ? 'صندلی‌های شماره‌دار سالن' : 'بلیت عادی',
        price: event.priceFrom,
        availableCount: 100,
        perks: ['ورود به سالن اصلی'],
      };

      const newTicket: PurchasedTicket = {
        ticketId: `tkt-${Date.now()}`,
        bookingRef: generatedRef,
        event,
        tier: effectiveTier,
        quantity: activeTicketingType === 'seated' ? selectedSeats.length : ticketQuantity,
        selectedTime: selectedSlot,
        selectedDate: selectedDay.dateStr,
        purchasedAt: 'امروز، ' + toPersianDigits(new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })),
        customerName: buyerName || 'هنردوست گرامی',
        customerEmail: buyerEmail || 'patron@artis.ir',
        totalAmount: finalPayable,
        qrCodeSeed: generatedRef,
        ticketingType: activeTicketingType,
        selectedSeats: activeTicketingType === 'seated' ? selectedSeats : [],
      };

      // Save to localStorage & update global tickets
      try {
        const stored = localStorage.getItem('artis_purchased_tickets');
        const list = stored ? JSON.parse(stored) : [];
        localStorage.setItem('artis_purchased_tickets', JSON.stringify([newTicket, ...list]));
      } catch (e) {
        console.error(e);
      }

      if (onTicketPurchased) {
        onTicketPurchased(newTicket);
      }

      setIssuedTicket(newTicket);
      setIsProcessingPayment(false);
      setCurrentStep('success');
      scrollToTop();
    }, 1200);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleContainerScroll}
      className={`fixed inset-0 z-50 overflow-y-auto animate-fade-in text-right transition-colors duration-300 ${
        isDark ? 'bg-[#08090E] text-[#E8EAED]' : 'bg-[#F6F8FA] text-slate-900'
      }`}
      dir="rtl"
    >
      {/* هدر رسمی و یکپارچه سایت */}
      <Navbar
        isScrolled={isScrolled}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          onSelectCategory(cat);
          onClose();
        }}
        onOpenTickets={onOpenTickets}
        onOpenSaved={onOpenSaved}
        siteSettings={siteSettings}
        cities={cities}
        selectedCity={selectedCity}
        onSelectCity={onSelectCity}
        savedCount={savedCount}
        ticketsCount={ticketsCount}
      />

      {/* محتوای اصلی صفحه با فاصله استاندارد از هدر شناور */}
      <div className="pt-24 sm:pt-28 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* نوار گام‌های فرآیند خرید (Stepper) در تمامی مراحل خرید */}
        <div className={`mb-6 p-4 rounded-3xl border transition-colors ${
          isDark ? 'bg-[#121524] border-white/10' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                currentStep === 'schedule'
                  ? 'bg-[#FF3366] text-white shadow-sm'
                  : 'bg-emerald-500 text-white'
              }`}>
                {currentStep === 'schedule' ? '۱' : '✓'}
              </span>
              <span className={currentStep === 'schedule' ? 'text-[#FF3366]' : 'text-emerald-500'}>
                ۱. انتخاب سانس و بلیت
              </span>
            </div>

            <ChevronLeft className="w-4 h-4 text-zinc-500 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                currentStep === 'confirmation'
                  ? 'bg-[#FF3366] text-white shadow-sm'
                  : currentStep === 'gateway' || currentStep === 'success'
                    ? 'bg-emerald-500 text-white'
                    : isDark ? 'bg-white/10 text-zinc-400' : 'bg-slate-100 text-slate-400'
              }`}>
                {currentStep === 'gateway' || currentStep === 'success' ? '✓' : '۲'}
              </span>
              <span className={
                currentStep === 'confirmation' 
                  ? 'text-[#FF3366]' 
                  : currentStep === 'gateway' || currentStep === 'success' 
                    ? 'text-emerald-500' 
                    : isDark ? 'text-zinc-400' : 'text-slate-400'
              }>
                ۲. تائید خرید و پیش‌فاکتور
              </span>
            </div>

            <ChevronLeft className="w-4 h-4 text-zinc-500 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                currentStep === 'gateway'
                  ? 'bg-[#FF3366] text-white shadow-sm'
                  : currentStep === 'success'
                    ? 'bg-emerald-500 text-white'
                    : isDark ? 'bg-white/10 text-zinc-400' : 'bg-slate-100 text-slate-400'
              }`}>
                {currentStep === 'success' ? '✓' : '۳'}
              </span>
              <span className={
                currentStep === 'gateway' 
                  ? 'text-[#FF3366]' 
                  : currentStep === 'success' 
                    ? 'text-emerald-500' 
                    : isDark ? 'text-zinc-400' : 'text-slate-400'
              }>
                ۳. درگاه پرداخت بانکی
              </span>
            </div>

            <ChevronLeft className="w-4 h-4 text-zinc-500 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                currentStep === 'success'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : isDark ? 'bg-white/10 text-zinc-400' : 'bg-slate-100 text-slate-400'
              }`}>
                ۴
              </span>
              <span className={currentStep === 'success' ? 'text-emerald-500' : isDark ? 'text-zinc-400' : 'text-slate-400'}>
                ۴. صدور بلیت دیجیتال
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* مرحله ۱: صفحه انتخاب سانس و بلیت (Schedule) */}
        {/* ========================================================================= */}
        {currentStep === 'schedule' && (
          <div className="animate-fade-in">
            {/* نوار ناوبری بالا: دکمه بازگشت به صفحه اثر و انتخاب شیوه فروش */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 py-1">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex items-center gap-2 text-xs font-bold transition-all cursor-pointer group px-3.5 py-2 rounded-xl border ${
                  isDark 
                    ? 'bg-[#12141F] border-white/10 text-zinc-300 hover:text-white hover:border-white/20' 
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
                }`}
              >
                <ArrowRight className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>بازگشت به معرفی اثر</span>
              </button>

              {/* تب تغییر ۲ مدل فروش بلیت: فروش عادی یا با انتخاب صندلی */}
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-2xl border flex items-center gap-1 ${
                  isDark ? 'bg-[#12141F] border-white/10' : 'bg-white border-slate-200 shadow-xs'
                }`}>
                  <button
                    type="button"
                    onClick={() => setActiveTicketingType('normal')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTicketingType === 'normal'
                        ? 'bg-[#FF3366] text-white shadow-md shadow-[#FF3366]/20'
                        : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>۱. فروش عادی (سانس و تعداد)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTicketingType('seated')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTicketingType === 'seated'
                        ? 'bg-[#FF3366] text-white shadow-md shadow-[#FF3366]/20'
                        : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Armchair className="w-3.5 h-3.5" />
                    <span>۲. فروش با انتخاب صندلی سالن</span>
                  </button>
                </div>
              </div>
            </div>

            {/* بنر عریض بالای صفحه (بدون متن روی بنر طبق درخواست) */}
            <div className="w-full mb-6">
              <div className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border shadow-lg h-56 sm:h-72 lg:h-80 bg-slate-950 ${
                isDark ? 'border-white/10' : 'border-slate-200/80 shadow-slate-200/60'
              }`}>
                <img
                  src={bannerImg}
                  alt={`بنر رویداد ${event.title}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* چیدمان ستونی: راست (تقویم، سانس و صندلی‌ها) / چپ (فاکتور و مشخصات) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* ستون راست: انتخاب تاریخ، سانس، و در صورت لزوم پلان صندلی سالن (عرض ۷ از ۱۲) */}
              <div className="lg:col-span-7 space-y-6">

                {/* بخش ۱: تقویم روزهای برگزاری */}
                <div className={`p-5 rounded-3xl border ${
                  isDark ? 'bg-[#111422] border-white/10' : 'bg-white border-slate-200/90 shadow-xs'
                }`}>
                  <div className="flex items-center justify-between mb-3.5">
                    <h2 className={`font-bold text-sm sm:text-base flex items-center gap-2 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      <Calendar className="w-4 h-4 text-[#FF3366]" />
                      <span>۱. انتخاب تاریخ اجرا</span>
                    </h2>
                    <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      ۵ روز زمان‌بندی‌شده
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {dates.map((d) => {
                      const isSelected = selectedDay.id === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setSelectedDay(d)}
                          className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? 'bg-[#FF3366] border-[#FF3366] text-white shadow-md shadow-[#FF3366]/25 ring-2 ring-[#FF3366]/30'
                              : isDark
                                ? 'bg-[#15192A] border-[#22283E] text-zinc-300 hover:border-zinc-500'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs font-black">{d.label}</span>
                          <span className={`text-[10px] ${isSelected ? 'text-white/90' : isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                            {toPersianDigits(d.dateStr)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* بخش ۲: سانس‌های اجرا برای روز انتخابی */}
                <div className={`p-5 rounded-3xl border ${
                  isDark ? 'bg-[#111422] border-white/10' : 'bg-white border-slate-200/90 shadow-xs'
                }`}>
                  <div className="flex items-center justify-between mb-3.5">
                    <h2 className={`font-bold text-sm sm:text-base flex items-center gap-2 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      <Clock className="w-4 h-4 text-[#06B6D4]" />
                      <span>۲. انتخاب سانس اجرا ({selectedDay.label} {toPersianDigits(selectedDay.dateStr)})</span>
                    </h2>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ظرفیت فعال
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {event.timeSlots.map((slot, index) => {
                      const isSelected = selectedSlot === slot;
                      const isEarliest = index === 0;
                      const endTime = getSlotEndTime(slot);

                      return (
                        <div
                          key={`schedule-slot-item-${slot}-${index}`}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-[#FF3366]/10 border-[#FF3366] ring-1 ring-[#FF3366] shadow-sm'
                              : isDark
                                ? 'bg-[#15192A] border-[#22283E] hover:border-[#303854]'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'border-[#FF3366] bg-[#FF3366]'
                                : isDark ? 'border-zinc-600' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display font-black text-base sm:text-lg">
                                  ساعت {toPersianDigits(slot)}
                                </span>
                                {isEarliest && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                    زودترین سانس
                                  </span>
                                )}
                              </div>
                              <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                پایان تقریبی: ساعت {toPersianDigits(endTime)} • ۹۰ دقیقه
                              </span>
                            </div>
                          </div>

                          <div className="text-left shrink-0">
                            <span className="font-display font-bold text-sm sm:text-base text-[#FF3366]">
                              {formatPrice(event.priceFrom)}
                            </span>
                            <span className={`text-[11px] mr-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                              تومان
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* بخش ۳: در صورتی که شیوه فروش «انتخاب صندلی سالن» باشد: پلان تعاملی صندلی‌ها */}
                {activeTicketingType === 'seated' && (
                  <SeatMap
                    selectedSeats={selectedSeats}
                    onToggleSeat={handleToggleSeat}
                    basePrice={event.priceFrom}
                    hallName={event.hallName || event.venue}
                    maxSeats={8}
                  />
                )}

              </div>

              {/* ستون چپ: ابتدا خلاصه فاکتور رزرو و دکمه خرید، سپس جزئیات زمانی و مکانی اجرا (عرض ۵ از ۱۲) */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 h-fit">

                {/* ۱. کارت خلاصه فاکتور رزرو و دکمه خرید نهایی بلیت */}
                <div className={`p-5 rounded-3xl border shadow-lg space-y-4 ${
                  isDark 
                    ? 'bg-gradient-to-b from-[#181D30] to-[#121626] border-[#2E3652]' 
                    : 'bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-black/5 dark:border-white/10">
                    <span className={`font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      خلاصه فاکتور رزرو
                    </span>
                    <span className="text-[#FF884D] font-bold">
                      {selectedDay.label} ({toPersianDigits(selectedDay.dateStr)}) • {toPersianDigits(selectedSlot)}
                    </span>
                  </div>

                  {/* محتوای فاکتور بر اساس مدل انتخاب صندلی یا فروش عادی */}
                  {activeTicketingType === 'seated' ? (
                    /* ۲. مدل فروش با انتخاب صندلی */
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
                        <span className="font-semibold text-zinc-300">صندلی‌های انتخابی شما:</span>
                        <span className="font-bold text-[#FF3366]">
                          {selectedSeats.length > 0 ? `${toPersianDigits(selectedSeats.length)} صندلی` : 'هیچ صندلی انتخاب نشده'}
                        </span>
                      </div>

                      {selectedSeats.length === 0 ? (
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs leading-relaxed text-center">
                          لطفاً برای صدور فاکتور، صندلی‌های دلخواه خود را از روی پلان سالن کلیک نمایید.
                        </div>
                      ) : (
                        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                          {selectedSeats.map((s) => (
                            <div 
                              key={s.id} 
                              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                                isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div>
                                <span className="font-bold">ردیف {toPersianDigits(s.row)} • صندلی {toPersianDigits(s.seatNumber)}</span>
                                <span className="text-[10px] text-zinc-400 mr-1.5">({s.section})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#FF3366]">{formatPrice(s.price)} تومان</span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSeat(s)}
                                  className="text-zinc-400 hover:text-rose-500 p-0.5 cursor-pointer"
                                  title="حذف صندلی"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-baseline pt-2 border-t border-black/5 dark:border-white/10">
                        <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>مبلغ قابل پرداخت</span>
                        <span className="font-display font-black text-xl text-[#FF3366]">
                          {formatPrice(baseTotal)}
                          <span className="text-xs font-normal text-zinc-400 mr-1">تومان</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* ۱. مدل فروش عادی فقط سانس و تعداد نفرات */
                    <div className="space-y-3 text-xs">
                      {/* کنترل تعداد نفرات */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-black/5 dark:border-white/10">
                        <span className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                          تعداد نفرات / بلیت:
                        </span>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-sm cursor-pointer ${
                              isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            -
                          </button>
                          <span className="font-display font-black text-sm w-4 text-center">
                            {toPersianDigits(ticketQuantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))}
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-sm cursor-pointer ${
                              isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className={`flex justify-between items-center text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        <span>قیمت پایه هر بلیت:</span>
                        <span>{formatPrice(event.priceFrom)} تومان</span>
                      </div>

                      <div className="flex justify-between items-baseline pt-2 border-t border-black/5 dark:border-white/10">
                        <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>مبلغ قابل پرداخت</span>
                        <span className="font-display font-black text-xl text-[#FF3366]">
                          {formatPrice(baseTotal)}
                          <span className="text-xs font-normal text-zinc-400 mr-1">تومان</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* کلید اقدام صدور بلیت -> باز شدن صفحه تایید خرید */}
                  <button
                    type="button"
                    disabled={activeTicketingType === 'seated' && selectedSeats.length === 0}
                    onClick={handleProceedToConfirmation}
                    className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white transition-all flex items-center justify-center gap-2 border border-white/20 ${
                      activeTicketingType === 'seated' && selectedSeats.length === 0
                        ? 'bg-zinc-700 opacity-50 cursor-not-allowed'
                        : 'bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] shadow-xl shadow-[#FF3366]/30 hover:brightness-110 active:scale-[0.98] cursor-pointer'
                    }`}
                  >
                    <Ticket className="w-5 h-5" />
                    <span>
                      {activeTicketingType === 'seated'
                        ? selectedSeats.length > 0
                          ? `تکمیل رزرو و تایید خرید (${toPersianDigits(selectedSeats.length)} صندلی)`
                          : 'ابتدا صندلی‌های خود را انتخاب کنید'
                        : `تکمیل رزرو و تایید خرید (${toPersianDigits(ticketQuantity)} نفر)`}
                    </span>
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-zinc-400 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>صدور رسمی بلیت • ضمانت بازگشت وجه در صورت لغو رویداد</span>
                  </div>
                </div>

                {/* ۲. کارت مشخصات زمانی و مکانی اجرا (زیر خلاصه فاکتور) */}
                <div className={`p-5 rounded-3xl border space-y-4 ${
                  isDark ? 'bg-[#111422] border-white/10' : 'bg-white border-slate-200/90 shadow-xs'
                }`}>
                  <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-white/10">
                    <Building2 className="w-4 h-4 text-[#FF884D]" />
                    <h3 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      مشخصات زمانی و مکانی اجرا
                    </h3>
                  </div>

                  {/* جزئیات مکانی */}
                  <div className="space-y-3">
                    <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                      isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/80'
                    }`}>
                      <MapPin className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
                      <div>
                        <span className={`block text-[10px] font-bold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                          محل و تالار برگزاری:
                        </span>
                        <span className="text-xs sm:text-sm font-bold block mt-0.5">
                          {event.hallName || event.venue} ({event.city})
                        </span>
                        <span className={`text-[11px] block mt-1 leading-5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                          {event.address || `${event.city}، میدان هنر، مجتمع فرهنگی هنری آرتیس، تالار اختصاصی`}
                        </span>
                      </div>
                    </div>

                    {/* دسترسی‌های حمل‌ونقل و پارکینگ */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/80'
                      }`}>
                        <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <div>
                          <span className={`block text-[9.5px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>پارکینگ:</span>
                          <span className="font-semibold text-[11px]">پارکینگ اختصاصی سالن</span>
                        </div>
                      </div>

                      <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/80'
                      }`}>
                        <Train className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <div>
                          <span className={`block text-[9.5px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>حمل و نقل:</span>
                          <span className="font-semibold text-[11px]">نزدیک ایستگاه مترو</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* جزئیات زمانی دقیق */}
                  <div className="pt-2 border-t border-black/5 dark:border-white/10 space-y-2">
                    <span className={`block text-[11px] font-bold mb-2 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      جدول زمانی و ضوابط ورود
                    </span>

                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/80'
                    }`}>
                      <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>باز شدن درب‌های سالن:</span>
                      <span className="font-bold text-emerald-400">۳۰ دقیقه قبل از سانس</span>
                    </div>

                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/80'
                    }`}>
                      <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>بسته شدن گیت‌های ورود:</span>
                      <span className="font-bold text-amber-400">دقیقاً همزمان با شروع سانس</span>
                    </div>

                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/80'
                    }`}>
                      <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>مدت زمان اجرا:</span>
                      <span className="font-bold">۹۰ دقیقه بدون آنتراکت</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* مرحله ۲: صفحه تائید خرید و پیش‌فاکتور رسمی (Order Confirmation Screen) */}
        {/* ========================================================================= */}
        {currentStep === 'confirmation' && (
          <div className="space-y-6 animate-fade-in">
            {/* نوار بازگشت */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep('schedule');
                  scrollToTop();
                }}
                className={`inline-flex items-center gap-2 text-xs font-bold transition-all cursor-pointer group px-4 py-2 rounded-xl border ${
                  isDark 
                    ? 'bg-[#12141F] border-white/10 text-zinc-300 hover:text-white hover:border-white/20' 
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
                }`}
              >
                <ArrowRight className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>بازگشت و تغییر سانس / تعداد بلیت</span>
              </button>

              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                سانس با موفقیت برای شما رزرو موقت شد (۱۰ دقیقه معتبر)
              </span>
            </div>

            {/* گرید صفحه تایید خرید */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* ستون راست: فرم مشخصات خریدار و انتخاب درگاه بانکی (عرض ۷ از ۱۲) */}
              <div className="lg:col-span-7 space-y-6">

                {/* کارت مشخصات خریدار / دریافت‌کننده بلیت */}
                <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${
                  isDark ? 'bg-[#111422] border-white/10' : 'bg-white border-slate-200/90 shadow-xs'
                }`}>
                  <div className="flex items-center gap-2 pb-3 border-b border-black/5 dark:border-white/10">
                    <User className="w-4 h-4 text-[#FF3366]" />
                    <h3 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      مشخصات خریدار و دریافت‌کننده بلیت الکترونیک
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className={`block font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        نام و نام خانوادگی خریدار: *
                      </label>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="مثال: کیان رادمنش"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF3366]/40 ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`block font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        شماره تلفن همراه (جهت پیامک بلیت): *
                      </label>
                      <input
                        type="tel"
                        value={buyerMobile}
                        onChange={(e) => setBuyerMobile(e.target.value)}
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF3366]/40 ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`block font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        آدرس ایمیل (جهت ارسال فایل PDF بلیت):
                      </label>
                      <input
                        type="email"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder="kian@example.com"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF3366]/40 ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`block font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        کد ملی (جهت صدور بلیت بیمه‌شده):
                      </label>
                      <input
                        type="text"
                        value={buyerNationalId}
                        onChange={(e) => setBuyerNationalId(e.target.value)}
                        placeholder="۰۰۱۲۳۴۵۶۷۸"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF3366]/40 ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* کارت انتخاب درگاه پرداخت اینترنتی بانکی */}
                <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${
                  isDark ? 'bg-[#111422] border-white/10' : 'bg-white border-slate-200/90 shadow-xs'
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <h3 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        انتخاب درگاه پرداخت آنلاین شاپرک
                      </h3>
                    </div>
                    <span className="text-[11px] text-zinc-400">تمام کارت‌های عضو شتاب</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* درگاه ۱: به‌پرداخت ملت */}
                    <div
                      onClick={() => setSelectedGateway('mellat')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        selectedGateway === 'mellat'
                          ? 'border-[#FF3366] bg-[#FF3366]/10 ring-2 ring-[#FF3366]/30'
                          : isDark ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs">درگاه به‌پرداخت ملت</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedGateway === 'mellat' ? 'border-[#FF3366] bg-[#FF3366]' : 'border-zinc-500'
                        }`}>
                          {selectedGateway === 'mellat' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-400">سریع‌ترین نرخ تسویه شاپرک</span>
                    </div>

                    {/* درگاه ۲: پرداخت الکترونیک سامان (سپ) */}
                    <div
                      onClick={() => setSelectedGateway('saman')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        selectedGateway === 'saman'
                          ? 'border-[#FF3366] bg-[#FF3366]/10 ring-2 ring-[#FF3366]/30'
                          : isDark ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs">سامان‌کیش (سپ)</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedGateway === 'saman' ? 'border-[#FF3366] bg-[#FF3366]' : 'border-zinc-500'
                        }`}>
                          {selectedGateway === 'saman' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-400">پشتیبانی ۲۴ ساعته</span>
                    </div>

                    {/* درگاه ۳: زرین‌پال VIP */}
                    <div
                      onClick={() => setSelectedGateway('zarinpal')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        selectedGateway === 'zarinpal'
                          ? 'border-[#FF3366] bg-[#FF3366]/10 ring-2 ring-[#FF3366]/30'
                          : isDark ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs">زرین‌پال اختصاصی VIP</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedGateway === 'zarinpal' ? 'border-[#FF3366] bg-[#FF3366]' : 'border-zinc-500'
                        }`}>
                          {selectedGateway === 'zarinpal' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-400">ضمانت بازگشت آنی وجه</span>
                    </div>
                  </div>

                  {/* گواهی امنیت */}
                  <div className="flex items-center justify-center gap-4 pt-2 text-[10.5px] text-zinc-400 border-t border-black/5 dark:border-white/10">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      اتصال رمزنگاری‌شده ۲۵۶ بیتی شاپرک
                    </span>
                    <span>•</span>
                    <span>دارای نماد الکترونیک Enamad</span>
                  </div>
                </div>

                {/* تاییدیه قوانین و شرایط حضور */}
                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 rounded mt-0.5 accent-[#FF3366] cursor-pointer"
                  />
                  <label htmlFor="terms-checkbox" className="text-xs leading-5 cursor-pointer">
                    <span className="font-bold">قوانین و مقررات خرید بلیت را می‌پذیرم:</span> ورود به سالن ۳۰ دقیقه قبل از شروع سانس آغاز می‌شود و پس از آغاز اجرا ورود به سالن ممنوع است. در صورت لغو رویداد، استرداد کامل وجه تضمین می‌گردد.
                  </label>
                </div>

              </div>

              {/* ستون چپ: کارت رسمی پیش‌فاکتور خرید (عرض ۵ از ۱۲) */}
              <div className="lg:col-span-5 space-y-6">

                {/* کارت پیش‌فاکتور تفکیکی */}
                <div className={`p-5 rounded-3xl border shadow-xl space-y-4 ${
                  isDark 
                    ? 'bg-gradient-to-b from-[#181D30] to-[#121626] border-[#2E3652]' 
                    : 'bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-black/5 dark:border-white/10">
                    <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      پیش‌فاکتور نهایی سفارش
                    </span>
                    <span className="text-[#FF884D] font-bold">
                      {toPersianDigits(selectedSlot)} • {toPersianDigits(selectedDay.dateStr)}
                    </span>
                  </div>

                  {/* مشخصات رویداد */}
                  <div className="flex items-center gap-3 pb-3 border-b border-black/5 dark:border-white/10">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-14 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm line-clamp-1">{event.title}</h4>
                      <span className="text-[11px] text-[#FF884D] font-medium block mt-0.5">{event.artist}</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">{event.hallName || event.venue}</span>
                    </div>
                  </div>

                  {/* نوع خرید و صندلی‌ها */}
                  <div className="space-y-2 text-xs">
                    {activeTicketingType === 'seated' ? (
                      <div>
                        <span className="font-bold block mb-1.5 text-zinc-300">
                          صندلی‌های رزرو شده ({toPersianDigits(selectedSeats.length)} صندلی):
                        </span>
                        <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                          {selectedSeats.map((s) => (
                            <div key={s.id} className="flex justify-between items-center text-[11px] p-1.5 rounded-lg bg-white/5 border border-white/5">
                              <span>ردیف {toPersianDigits(s.row)} • صندلی {toPersianDigits(s.seatNumber)} ({s.section})</span>
                              <span className="font-bold">{formatPrice(s.price)} تومان</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-xs">
                        <span>نوع بلیت و تعداد:</span>
                        <span className="font-bold">بلیت ورودی عادی × {toPersianDigits(ticketQuantity)} نفر</span>
                      </div>
                    )}
                  </div>

                  {/* اعمال کد تخفیف */}
                  <div className="pt-2 border-t border-black/5 dark:border-white/10">
                    <label className={`block text-[11px] font-bold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      کد تخفیف دارید؟
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          placeholder="کد تخفیف (مثال: ARTIS)"
                          disabled={discountApplied}
                          className={`w-full pr-8 pl-3 py-2 rounded-xl border text-xs uppercase focus:outline-none ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200'
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyDiscount}
                        disabled={discountApplied || !discountCode.trim()}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        {discountApplied ? 'اعمال شد ✓' : 'اعمال'}
                      </button>
                    </div>
                    {discountApplied && (
                      <span className="text-[11px] text-emerald-400 font-bold block mt-1">
                        تخفیف به مبلغ {formatPrice(discountAmount)} تومان کسر گردید.
                      </span>
                    )}
                  </div>

                  {/* ریز فاکتور مالی */}
                  <div className="pt-3 border-t border-black/5 dark:border-white/10 space-y-1.5 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>بهای پایه بلیت‌ها:</span>
                      <span>{formatPrice(baseTotal)} تومان</span>
                    </div>

                    {discountApplied && (
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>کسر تخفیف:</span>
                        <span>- {formatPrice(discountAmount)} تومان</span>
                      </div>
                    )}

                    <div className="flex justify-between text-zinc-400">
                      <span>کارمزد صدور الکترونیک و بیمه:</span>
                      <span className="text-emerald-400 font-semibold">رایگان (۰ تومان)</span>
                    </div>

                    <div className="flex justify-between items-baseline pt-2 border-t border-black/5 dark:border-white/10">
                      <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        مبلغ نهایی قابل پرداخت:
                      </span>
                      <span className="font-display font-black text-2xl text-[#FF3366]">
                        {formatPrice(finalPayable)}
                        <span className="text-xs font-normal text-zinc-400 mr-1.5">تومان</span>
                      </span>
                    </div>
                  </div>

                  {/* دکمه انتقال به درگاه پرداخت شاپرک */}
                  <button
                    type="button"
                    onClick={handleProceedToGateway}
                    className="w-full py-4 px-6 rounded-2xl font-black text-sm text-white bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] shadow-xl shadow-[#FF3366]/30 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/20"
                  >
                    <Lock className="w-4 h-4" />
                    <span>تأیید نهایی و اتصال به درگاه پرداخت شاپرک</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep('schedule');
                      scrollToTop();
                    }}
                    className="w-full py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer text-center"
                  >
                    انصراف و ویرایش سانس / تعداد
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* مرحله ۳: صفحه درگاه پرداخت اینترنتی شاپرک (Payment Gateway Simulator) */}
        {/* ========================================================================= */}
        {currentStep === 'gateway' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* سربرگ استاندارد درگاه شاپرک */}
            <div className={`p-5 rounded-3xl border shadow-2xl overflow-hidden ${
              isDark ? 'bg-[#0E111D] border-[#2A314B]' : 'bg-white border-slate-300 shadow-slate-300'
            }`}>
              
              {/* نوار رنگی بالای درگاه شاپرک */}
              <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                    شاپرک
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">
                      درگاه پرداخت الکترونیک {selectedGateway === 'mellat' ? 'به‌پرداخت ملت' : selectedGateway === 'saman' ? 'سامان‌کیش (سپ)' : 'زرین‌پال VIP'}
                    </h3>
                    <span className="text-[11px] text-zinc-400">سامانه جامع پرداخت اینترنتی کارت‌های شتاب</span>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-[10px] text-zinc-400 block">زمان باقیمانده:</span>
                  <span className="font-mono font-black text-rose-500 text-sm">
                    {Math.floor(gatewayCountdown / 60)}:{(gatewayCountdown % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* خلاصه اطلاعات پذیرنده */}
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 p-3 rounded-2xl text-[11px] ${
                isDark ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-200'
              }`}>
                <div>
                  <span className="text-zinc-400 block text-[10px]">نام پذیرنده:</span>
                  <span className="font-bold truncate block">سامانه بلیت آرتیس</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">شماره ترمینال:</span>
                  <span className="font-mono font-bold">۸۹۲۱۴۵۳</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">کد سفارش:</span>
                  <span className="font-mono font-bold text-[#FF884D]">ART-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">مبلغ تراکنش:</span>
                  <span className="font-bold text-[#FF3366] text-xs">{formatPrice(finalPayable)} تومان</span>
                </div>
              </div>

              {/* فرم ورود اطلاعات کارت بانکی */}
              <div className="space-y-4 pt-2">
                {/* شماره کارت */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold">شماره کارت بانکی ۱۶ رقمی: *</label>
                  <div className="relative">
                    <input
                      type="text"
                      dir="ltr"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="XXXX - XXXX - XXXX - XXXX"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-mono tracking-widest text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#FF3366]/40 ${
                        isDark ? 'bg-[#15192A] border-[#252D48] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                    <CreditCard className="w-5 h-5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* CVV2 و تاریخ انقضا */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold">کد دوم شناسایی (CVV2): *</label>
                    <input
                      type="password"
                      dir="ltr"
                      maxLength={4}
                      value={cardCvv2}
                      onChange={(e) => setCardCvv2(e.target.value)}
                      placeholder="***"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#FF3366]/40 ${
                        isDark ? 'bg-[#15192A] border-[#252D48] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold">تاریخ انقضا (ماه / سال): *</label>
                    <div className="flex items-center gap-2" dir="ltr">
                      <input
                        type="text"
                        maxLength={2}
                        value={cardExpMonth}
                        onChange={(e) => setCardExpMonth(e.target.value)}
                        placeholder="MM"
                        className={`w-1/2 px-2 py-2.5 rounded-xl border text-sm font-mono text-center font-bold focus:outline-none ${
                          isDark ? 'bg-[#15192A] border-[#252D48] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                      <span className="text-zinc-500 font-bold">/</span>
                      <input
                        type="text"
                        maxLength={2}
                        value={cardExpYear}
                        onChange={(e) => setCardExpYear(e.target.value)}
                        placeholder="YY"
                        className={`w-1/2 px-2 py-2.5 rounded-xl border text-sm font-mono text-center font-bold focus:outline-none ${
                          isDark ? 'bg-[#15192A] border-[#252D48] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* رمز پویا */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold">رمز اینترنتی دوم (رمز پویا): *</label>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={otpSent && otpTimer > 0}
                      className="text-xs font-bold text-[#FF884D] hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {otpSent && otpTimer > 0 ? `ارسال مجدد (${toPersianDigits(otpTimer)} ثانیه)` : 'دریافت رمز پویا (پیامکی)'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      dir="ltr"
                      value={cardPin}
                      onChange={(e) => setCardPin(e.target.value)}
                      placeholder="رمز اینترنتی را وارد نمایید"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono tracking-widest text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#FF3366]/40 ${
                        isDark ? 'bg-[#15192A] border-[#252D48] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  {otpSent && (
                    <span className="text-[11px] text-emerald-400 font-medium block">
                      رمز پویا به شماره همراه مالک کارت پیامک شد (کد تستی درج گردید).
                    </span>
                  )}
                </div>

                {/* دکمه‌های اقدام پرداخت */}
                <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-2.5">
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handleFinalizePayment}
                    className="w-full py-4 rounded-2xl font-black text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/30 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>در حال تایید تراکنش در شاپرک...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>پرداخت قطعی مبلغ {formatPrice(finalPayable)} تومان</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleFinalizePayment}
                      disabled={isProcessingPayment}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-colors cursor-pointer"
                    >
                      ⚡ پرداخت تستی سریع (بدون نیاز به رمز)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep('confirmation');
                        scrollToTop();
                      }}
                      className="py-2.5 px-4 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      انصراف و بازگشت
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* مرحله ۴: صفحه رسید پرداخت موفق و صدور قطعی بلیت (Success Screen) */}
        {/* ========================================================================= */}
        {currentStep === 'success' && issuedTicket && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-center">
            
            {/* کارت تایید موفقیت */}
            <div className="py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-emerald-400 mb-2">
                پرداخت شما با موفقیت انجام شد!
              </h2>
              <p className={`text-xs sm:text-sm max-w-md mx-auto ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                بلیت دیجیتال رویداد <strong className={isDark ? 'text-white' : 'text-slate-900'}>{event.title}</strong> به صورت رسمی صادر گردید و به آدرس ایمیل و شماره همراه خریدار ارسال شد.
              </p>
            </div>

            {/* کارت دیجیتال فاخر بلیت (Artis Digital Pass) */}
            <div className={`relative border rounded-3xl p-6 sm:p-8 shadow-2xl text-right overflow-hidden ${
              isDark 
                ? 'bg-gradient-to-b from-[#181D30] to-[#121626] border-[#2E3652]' 
                : 'bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-slate-200'
            }`}>
              {/* نوار طلایی بالا */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-l from-[#FF3366] via-[#FF884D] to-[#F59E0B]" />

              <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 text-xs">
                <div>
                  <span className="font-black text-sm text-[#FF3366]">گذر رسمی بلیت دیجیتال آرتیس</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">ARTIS OFFICIAL EVENT PASS</span>
                </div>
                <div className="text-left font-mono">
                  <span className="text-[10px] text-zinc-400 block">کد پیگیری بلیت:</span>
                  <span className="font-bold text-[#F59E0B] text-sm">{issuedTicket.bookingRef}</span>
                </div>
              </div>

              {/* جزئیات رویداد */}
              <div className="py-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display font-black text-lg sm:text-xl text-white">
                      {event.title}
                    </h3>
                    <p className="text-xs text-[#FF884D] font-bold mt-1">
                      {event.artist} {event.artistRole ? `(${event.artistRole})` : ''}
                    </p>
                  </div>
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-16 h-20 rounded-xl object-cover shrink-0 border border-white/10 shadow-md"
                  />
                </div>

                <div className={`grid grid-cols-2 gap-3 p-3.5 rounded-2xl text-xs ${
                  isDark ? 'bg-white/5 border border-white/5' : 'bg-slate-100 border border-slate-200'
                }`}>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">تاریخ و ساعت سانس:</span>
                    <span className="font-bold block mt-0.5">{toPersianDigits(issuedTicket.selectedDate)}</span>
                    <span className="text-emerald-400 font-bold block mt-0.5">ساعت {toPersianDigits(issuedTicket.selectedTime)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">محل برگزاری:</span>
                    <span className="font-bold block mt-0.5">{event.hallName || event.venue}</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">{event.city}</span>
                  </div>
                </div>

                {/* اطلاعات صندلی‌ها یا ظرفیت */}
                {issuedTicket.selectedSeats && issuedTicket.selectedSeats.length > 0 ? (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                    <span className="text-[10px] text-amber-400 font-bold block mb-1">
                      شماره صندلی‌های اختصاصی سالن:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {issuedTicket.selectedSeats.map((s) => (
                        <span key={s.id} className="px-2.5 py-1 rounded-lg bg-black/30 border border-amber-500/30 text-amber-300 font-bold">
                          ردیف {toPersianDigits(s.row)} • صندلی {toPersianDigits(s.seatNumber)} ({s.section})
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex justify-between items-center">
                    <span className="font-bold text-emerald-400">تعداد بلیت ورودی:</span>
                    <span className="font-bold">{toPersianDigits(issuedTicket.quantity)} نفر (ظرفیت آزاد)</span>
                  </div>
                )}

                {/* بخش بارکد و QR */}
                <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-4">
                  <div className="text-xs">
                    <span className="text-[10px] text-zinc-400 block">دارنده بلیت:</span>
                    <span className="font-bold block mt-0.5 text-sm">{issuedTicket.customerName}</span>
                    <span className="text-[10px] text-zinc-400 block mt-1">شماره ارجاع شاپرک: {toPersianDigits(bankRefId)}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">وضعیت: تسویه شده و معتبر</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                      <TicketQrCode 
                        value={`https://artis.ir/ticket/verify?ref=${issuedTicket.bookingRef}&id=${issuedTicket.ticketId}&event=${encodeURIComponent(issuedTicket.event.id)}`} 
                        size={60} 
                      />
                    </div>
                    <div className="hidden sm:flex flex-col items-center bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-sm" dir="ltr">
                      <TicketBarcode 
                        value={issuedTicket.bookingRef.startsWith('ART-') ? issuedTicket.bookingRef : `ART-${issuedTicket.bookingRef}`} 
                        height={28} 
                        width={1.2} 
                      />
                      <span className="font-mono text-[8px] text-zinc-500 font-bold mt-0.5">
                        *{issuedTicket.bookingRef.startsWith('ART-') ? issuedTicket.bookingRef : `ART-${issuedTicket.bookingRef}`}*
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* دکمه‌های اقدام نهایی تک‌خطی و بهینه‌سازی شده */}
            <div className="pt-2 max-w-lg mx-auto space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {/* ۱. دریافت بلیت */}
                <button
                  type="button"
                  onClick={() => setShowPrintablePdf(true)}
                  className="py-3 px-3 sm:px-5 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs sm:text-sm font-black tracking-wide shadow-lg shadow-[#FF3366]/25 hover:shadow-xl hover:shadow-[#FF3366]/35 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap border border-white/20"
                >
                  <Download className="w-4 h-4 shrink-0 text-white" />
                  <span className="whitespace-nowrap font-display font-black">دریافت بلیط</span>
                </button>

                {/* ۲. چاپ بلیت */}
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

              {/* ردیف ثانویه: بلیت‌های من و بازگشت */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTickets();
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border ${
                    isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5 text-[#FF3366]" />
                  <span>مشاهده در «بلیت‌های من»</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl font-bold text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  بازگشت به سایت
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* مدال نسخه چاپی و دانلود PDF روشن */}
      {showPrintablePdf && issuedTicket && (
        <PrintableTicketPdf
          ticket={issuedTicket}
          onClose={() => setShowPrintablePdf(false)}
        />
      )}

      {/* فوتر رسمی و کامل سایت */}
      <Footer siteSettings={siteSettings} />

    </div>
  );
};

export default EventScheduleModal;
