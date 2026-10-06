import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArtEvent, CastMember, EventCategory, SelectedSeat, TicketingType, PurchasedTicket, EventReview } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Ticket, 
  Heart, 
  Share2, 
  ArrowRight, 
  Users, 
  Check, 
  Sparkles,
  ExternalLink,
  Navigation,
  Quote,
  BookOpen,
  Info,
  CheckCircle2,
  ShieldCheck,
  Star,
  ThumbsUp,
  MessageSquare,
  Send,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { toPersianDigits, formatPrice } from '../utils/persianNumbers';
import { useTheme } from '../context/ThemeContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { EventScheduleModal } from './EventScheduleModal';
import { SiteSettings, fetchEventReviews, saveEventReview, likeEventReview } from '../lib/db';

interface EventDetailModalProps {
  event: ArtEvent | null;
  onClose: () => void;
  onBuyTicket: (
    event: ArtEvent, 
    initialSlot?: string, 
    initialDate?: string, 
    ticketingType?: TicketingType,
    selectedSeats?: SelectedSeat[]
  ) => void;
  onTicketPurchased?: (ticket: PurchasedTicket) => void;
  isSaved?: boolean;
  onToggleSave?: (eventId: string) => void;
  siteSettings?: SiteSettings;
  onOpenTickets?: () => void;
  onOpenSaved?: () => void;
  savedCount?: number;
  ticketsCount?: number;
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
  cities?: string[];
  selectedCategory?: EventCategory;
  onSelectCategory?: (category: EventCategory) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onBuyTicket,
  onTicketPurchased,
  isSaved = false,
  onToggleSave = (_id: string) => {},
  siteSettings,
  onOpenTickets = () => {},
  onOpenSaved = () => {},
  savedCount = 0,
  ticketsCount = 0,
  selectedCity = 'همه شهرها',
  onSelectCity = () => {},
  cities = [],
  selectedCategory = 'all',
  onSelectCategory = (_cat: EventCategory) => {},
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [copiedLink, setCopiedLink] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Reviews and ratings state
  const [reviews, setReviews] = useState<EventReview[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState('');
  const [newAuthorName, setNewAuthorName] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  useEffect(() => {
    if (event) {
      fetchEventReviews(event.id).then(setReviews);
    }
  }, [event]);

  const handleLike = async (reviewId: string) => {
    const newLikes = await likeEventReview(reviewId);
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likesCount: newLikes } : r));
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !event) return;
    setIsSubmittingReview(true);
    try {
      const reviewItem: EventReview = {
        id: `rev-${Date.now()}`,
        eventId: event.id,
        userName: newAuthorName.trim() || 'تماشاگر آرتیکت',
        rating: newRating,
        comment: newComment.trim(),
        createdAt: 'امروز',
        isVerifiedBuyer: true,
        likesCount: 1,
        scores: {
          performance: newRating,
          soundAndMusic: newRating,
          stageDesign: newRating,
          venueQuality: newRating
        }
      };
      await saveEventReview(reviewItem);
      setReviews(prev => [reviewItem, ...prev]);
      setNewComment('');
      setNewAuthorName('');
      setReviewSubmitSuccess(true);
      setTimeout(() => setReviewSubmitSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const averageRating = useMemo(() => {
    if (!reviews.length) return event?.rating || 4.8;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [reviews, event]);

  const handleContainerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 35);
  };

  // نظارت لحظه‌ای و پیوسته بر اسکرول کانتینر جهت تغییر شکل و جابجایی هدر سایت
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

  // Lock body scroll while modal is active
  useEffect(() => {
    if (event) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [event]);

  // Handle ESC key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isScheduleModalOpen) {
          setIsScheduleModalOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isScheduleModalOpen]);

  if (!event) return null;

  // Deriving cast & crew list
  const castList: CastMember[] = event.castAndCrew && event.castAndCrew.length > 0 ? event.castAndCrew : [
    {
      id: 'default-artist-1',
      name: event.artist,
      role: event.artistRole || 'کارگردان',
    }
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `${event.title} - ${event.subtitle || ''}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const bannerImg = event.wideBannerUrl || event.imageUrl;
  const posterImg = event.imageUrl || bannerImg;
  const mapQuery = encodeURIComponent(`${event.venue} ${event.city} ${event.address || ''}`);

  // Dynamic category accent colors for ambient lighting
  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'theater':
        return { hex: '#F43F5E', glow: 'rgba(244, 63, 94, 0.08)', border: 'border-rose-500/30', text: 'text-rose-500', bg: 'bg-rose-500/10' };
      case 'concert':
        return { hex: '#A855F7', glow: 'rgba(168, 85, 247, 0.08)', border: 'border-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500/10' };
      case 'comedy':
        return { hex: '#F59E0B', glow: 'rgba(245, 158, 11, 0.08)', border: 'border-amber-500/30', text: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'gallery':
        return { hex: '#10B981', glow: 'rgba(16, 185, 129, 0.08)', border: 'border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'immersive':
        return { hex: '#06B6D4', glow: 'rgba(6, 182, 212, 0.08)', border: 'border-cyan-500/30', text: 'text-cyan-400', bg: 'bg-cyan-500/10' };
      default:
        return { hex: '#6366F1', glow: 'rgba(99, 102, 241, 0.08)', border: 'border-indigo-500/30', text: 'text-indigo-400', bg: 'bg-indigo-500/10' };
    }
  };

  const catTheme = getCategoryTheme(event.category);

  return (
    <div
      ref={containerRef}
      onScroll={handleContainerScroll}
      className={`fixed inset-0 z-50 overflow-y-auto animate-fade-in text-right transition-colors duration-300 ${
        isDark ? 'bg-[#08090E] text-[#E8EAED]' : 'bg-[#F6F8FA] text-slate-900'
      }`}
      dir="rtl"
    >
      {/* هدر سایت با انیمیشن جمع‌شونده در هنگام اسکرول (کاملاً یکسان با صفحه اصلی) */}
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

      {/* هاله نوری ملایم و پس‌زمینه زنده و باطراوت */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 pointer-events-none blur-[140px] -z-10 transition-colors"
        style={{ backgroundColor: catTheme.glow }}
      />

      {/* محتوای اصلی صفحه با فاصله استاندارد از هدر شناور */}
      <div className="pt-24 sm:pt-28 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* نوار ناوبری بالا: دکمه بازگشت و ابزارهای اشتراک‌گذاری */}
        <div className="flex items-center justify-between gap-4 mb-4 py-1">
          <button
            onClick={onClose}
            className={`inline-flex items-center gap-2 text-xs font-bold transition-all cursor-pointer group px-3.5 py-2 rounded-xl border ${
              isDark 
                ? 'bg-[#12141F] border-white/10 text-zinc-300 hover:text-white hover:border-white/20' 
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
            }`}
          >
            <ArrowRight className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>بازگشت به رویدادها</span>
          </button>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${catTheme.bg} ${catTheme.border} ${catTheme.text}`}>
              {event.categoryLabel}
            </span>

            <button
              onClick={() => onToggleSave(event.id)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isSaved
                  ? 'border-[#FF3366]/40 bg-[#FF3366]/10 text-[#FF3366]'
                  : isDark 
                    ? 'border-white/10 text-zinc-400 hover:text-white bg-[#12141F]' 
                    : 'border-slate-200 text-slate-600 hover:text-slate-900 bg-white shadow-xs'
              }`}
              title={isSaved ? 'حذف از نشان‌شده‌ها' : 'نشان کردن'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#FF3366] text-[#FF3366]' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark 
                  ? 'border-white/10 text-zinc-400 hover:text-white bg-[#12141F]' 
                  : 'border-slate-200 text-slate-600 hover:text-slate-900 bg-white shadow-xs'
              }`}
              title="اشتراک‌گذاری"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ۱. بنر عریض بالای صفحه به همراه نام و مشخصات مخفی/کمرنگ که با هاور آشکار می‌شود */}
        <div className="w-full mb-5">
          <div className={`group relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border shadow-lg h-60 sm:h-76 lg:h-88 bg-slate-950 cursor-pointer ${
            isDark ? 'border-white/10' : 'border-slate-200/80 shadow-slate-200/60'
          }`}>
            <img
              src={bannerImg}
              alt={`بنر رویداد ${event.title}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* لایه گرادیان تیره در انتهای بنر برای خوانایی عالی متن هنگام هاور */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent opacity-20 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* نام کار در سمت راست پایین + باکس‌های کوچک در گوشه سمت چپ تصویر پایین (هنگام هاور آشکار می‌شوند) */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-7 flex flex-col md:flex-row md:items-end md:justify-between gap-3 opacity-25 sm:opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 ease-out pointer-events-none">
              
              {/* سمت راست: فقط اسم کار و زیرعنوان (خلوت و بدون شلوغی) */}
              <div className="max-w-xl">
                <h1 className="font-display font-black text-xl sm:text-2xl lg:text-3xl text-white leading-snug drop-shadow-md">
                  {event.title}
                </h1>
                {event.subtitle && (
                  <p className="text-xs sm:text-sm font-medium text-white/85 mt-1 leading-relaxed drop-shadow-sm line-clamp-2">
                    {event.subtitle}
                  </p>
                )}
              </div>

              {/* گوشه سمت چپ تصویر پایین: باکس‌های کوچک (دسته‌بندی، وضعیت اجرا، سالن) بدون شلوغ کردن فضا */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 self-start md:self-end">
                <span className="text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-xs">
                  {event.categoryLabel}
                </span>
                {event.status && (
                  <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-amber-300 border border-white/15">
                    {event.status}
                  </span>
                )}
                {event.city && (
                  <span className="text-[11px] sm:text-xs text-white/90 hidden sm:inline-flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15">
                    <MapPin className="w-3 h-3 text-[#06B6D4]" />
                    {event.city}
                  </span>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* چیدمان اصولی و متوازن: ستون راست (محتوا) | ستون چپ (پوستر + باکس خرید بلیط) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

          {/* ============================================================ */}
          {/* ستون راست (عرض ۷ ستون): خلاصه داستان، عوامل، زمان و مکان، توضیحات */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">

            {/* ۳. باکس خلاصه داستان */}
            <div className={`p-5 sm:p-6 rounded-2xl border transition-colors ${
              isDark ? 'bg-[#111422] border-white/10 shadow-xs' : 'bg-white border-slate-200/90 shadow-xs'
            }`}>
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-black/5 dark:border-white/10">
                <BookOpen className="w-4 h-4 text-[#FF3366]" />
                <h2 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  خلاصه داستان
                </h2>
              </div>
              <p className={`text-xs sm:text-sm leading-6 sm:leading-7 text-justify whitespace-pre-line ${
                isDark ? 'text-zinc-300' : 'text-slate-700'
              }`}>
                {event.description || 'داستان این اثر روایتی جذاب و تأمل‌برانگیز از وقایع انسانی و درام اجتماعی است که با هنرنمایی عوامل به روی صحنه آمده است.'}
              </p>
            </div>

            {/* ۴. باکس معرفی عوامل (فقط سمت به همراه اسم - فشرده، بهینه و کم‌جا) */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
              isDark ? 'bg-[#111422] border-white/10 shadow-xs' : 'bg-white border-slate-200/90 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#A855F7]" />
                  <h2 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    عوامل و هنرمندان
                  </h2>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
                  {toPersianDigits(castList.length)} نفر
                </span>
              </div>

              {/* چیدمان منعطف، منظم و فوق‌العاده بهینه (حتی برای لیست‌های شلوغ و پرتعداد) */}
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                {castList.map((member, idx) => (
                  <div 
                    key={member.id || idx}
                    className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-lg border text-xs transition-colors ${
                      isDark 
                        ? 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10' 
                        : 'bg-slate-50 border-slate-200/70 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {member.role || 'عامل اجرایی'}:
                    </span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ۵. باکس زمان و مکان اجرا به همراه لوکیشن */}
            <div className={`p-5 sm:p-6 rounded-2xl border transition-colors ${
              isDark ? 'bg-[#111422] border-white/10 shadow-xs' : 'bg-white border-slate-200/90 shadow-xs'
            }`}>
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-black/5 dark:border-white/10">
                <Calendar className="w-4 h-4 text-[#FF884D]" />
                <h2 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  زمان و مکان اجرا
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3.5">
                {/* تاریخ */}
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/70'
                }`}>
                  <Calendar className="w-4 h-4 text-[#FF884D] shrink-0" />
                  <div>
                    <span className={`block text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>تاریخ</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {event.startDate} {event.endDate ? `تا ${event.endDate}` : ''}
                    </span>
                  </div>
                </div>

                {/* ساعت و سانس */}
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/70'
                }`}>
                  <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className={`block text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>ساعت سانس</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {event.timeSlots && event.timeSlots.length > 0 ? event.timeSlots.join(' ، ') : (event.time || '۲۰:۰۰')}
                    </span>
                  </div>
                </div>
              </div>

              {/* مکان و آدرس به همراه دکمه لوکیشن روی نقشه */}
              <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/70'
              }`}>
                <div className="flex items-start gap-2.5 min-w-0">
                  <MapPin className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {event.venue} ({event.city})
                    </span>
                    <span className={`text-[11px] block mt-0.5 truncate ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      {event.address || 'تهران، خیابان اصلی، مجتمع فرهنگی و هنری'}
                    </span>
                  </div>
                </div>

                {/* دکمه باز کردن لوکیشن روی نقشه */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06B6D4]/10 hover:bg-[#06B6D4]/20 text-[#06B6D4] font-bold text-xs border border-[#06B6D4]/30 transition-colors shrink-0 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>مسیریابی روی نقشه</span>
                </a>
              </div>
            </div>

            {/* ۶. باکس توضیحات کارگردان و عوامل اجرایی */}
            <div className={`p-5 sm:p-6 rounded-2xl border transition-colors ${
              isDark ? 'bg-[#111422] border-white/10 shadow-xs' : 'bg-white border-slate-200/90 shadow-xs'
            }`}>
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-black/5 dark:border-white/10">
                <Quote className="w-4 h-4 text-[#FF884D]" />
                <h2 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  توضیحات کارگردان و عوامل اجرایی
                </h2>
              </div>

              <div className={`p-4 rounded-xl border-r-3 border-r-[#FF884D] text-xs sm:text-sm leading-6 sm:leading-7 ${
                isDark ? 'bg-white/5 border-y border-l border-white/5 text-zinc-300' : 'bg-amber-50/50 border-y border-l border-amber-200/60 text-slate-800'
              }`}>
                {event.curatorStatement || 
                  '«حضور تماشاگران گرامی در این اجرا انگیزه اصلی تیم ماست. خواهشمندیم جهت حفظ نظم سالن، ۱۵ دقیقه پیش از آغاز سانس در محل حضور داشته باشید و از عکاسی با فلاش در طول اجرای زنده خودداری فرمایید.»'}
              </div>
            </div>

            {/* ۷. بخش نقد و نظرات و امتیازات تماشاگران (Reviews & Ratings) */}
            <div className={`p-5 sm:p-6 rounded-2xl border transition-colors space-y-5 ${
              isDark ? 'bg-[#111422] border-white/10 shadow-xs' : 'bg-white border-slate-200/90 shadow-xs'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <h2 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    نظرات و امتیاز تماشاگران
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-lg text-amber-400">
                    {toPersianDigits(averageRating)}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    از ۵ ({toPersianDigits(reviews.length || 1)} نظر)
                  </span>
                </div>
              </div>

              {/* خلاصه نمره و رضایت کلی تماشاگران */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/70'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 font-display font-black text-xl">
                    {toPersianDigits(averageRating)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={`overall-star-${s}`}
                          className={`w-4 h-4 ${s <= Math.round(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      میانگین امتیاز رضایت تماشاگران
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/25 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>٪۹۶ پیشنهاد تماشاگران</span>
                  </span>
                </div>
              </div>


              {/* فرم ثبت نظر جدید */}
              <form onSubmit={handleAddReview} className={`p-4 rounded-2xl border space-y-3 text-xs ${
                isDark ? 'bg-black/30 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">دیدگاه و امتیاز شما به این اثر:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`star-btn-${star}`}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-4 h-4 ${star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    placeholder="نام شما (اختیاری)"
                    className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                      isDark ? 'border-white/10 bg-white/5 text-white focus:border-[#FF3366]' : 'border-slate-200 bg-white text-slate-900 focus:border-[#FF3366]'
                    }`}
                  />
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium px-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تایید هویت خودکار تماشاگر</span>
                  </div>
                </div>

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  placeholder="تجربه خود از تماشای این رویداد را بنویسید..."
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none resize-none ${
                    isDark ? 'border-white/10 bg-white/5 text-white focus:border-[#FF3366]' : 'border-slate-200 bg-white text-slate-900 focus:border-[#FF3366]'
                  }`}
                  required
                />

                {reviewSubmitSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>دیدگاه شما با موفقیت ثبت شد و پس از بررسی نمایش داده می‌شود.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingReview || !newComment.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#FF5533] text-white font-bold text-xs shadow-md shadow-[#FF3366]/20 hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReview ? 'در حال ثبت...' : 'ارسال نظر'}</span>
                </button>
              </form>

              {/* لیست نظرات */}
              <div className="space-y-3 pt-2">
                {reviews.map((rev) => (
                  <div
                    key={`review-${rev.id}`}
                    className={`p-4 rounded-2xl border space-y-2 text-xs transition-colors ${
                      isDark ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-slate-50 border-slate-200/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF3366] to-[#F59E0B] p-[1px] flex items-center justify-center font-bold text-[10px] text-white">
                          {rev.userName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">{rev.userName}</span>
                            {rev.isVerifiedBuyer && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/25">
                                خریدار بلیت
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400">{toPersianDigits(rev.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={`star-${rev.id}-${s}`}
                            className={`w-3 h-3 ${s <= (rev.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className={`leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      {rev.comment}
                    </p>

                    <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>این نظر مفید بود؟</span>
                      <button
                        type="button"
                        onClick={() => handleLike(rev.id)}
                        className="flex items-center gap-1 hover:text-[#FF3366] transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{toPersianDigits(rev.likesCount || 0)}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* ستون چپ (عرض ۴-۵ ستون): دکمه شاخص خرید در بالا، سپس پوستر اصولی ۲:۳، سپس باکس مشخصات بلیت */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 flex flex-col gap-3.5">

            {/* ۱. دکمه اصلی و چشم‌گیر خرید بلیت (در بالاترین نقطه ستون چپ با عرض متناسب و استاندارد) */}
            <div className="flex justify-center sm:justify-start lg:justify-center">
              <div className="relative group inline-flex">
                {/* هاله نئونی نبض‌دار برای جلب توجه حداکثری */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF3366] via-[#FF5533] to-[#F59E0B] rounded-xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse pointer-events-none" />
                
                <button
                  type="button"
                  onClick={() => onBuyTicket(event)}
                  className="relative inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-white bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] shadow-md shadow-[#FF3366]/30 hover:shadow-xl hover:shadow-[#FF3366]/45 active:scale-[0.98] transition-all cursor-pointer border border-white/25"
                >
                  <Ticket className="w-4 h-4 shrink-0" />
                  <span className="text-sm sm:text-base font-black tracking-wide">
                    خرید بلیت
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold bg-black/20 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/20 text-white/95">
                    خرید سریع
                  </span>
                </button>
              </div>
            </div>

            {/* ۲. پوستر اصلی کار با تناسب استاندارد ۲:۳ (بدون کراپ نامتقارن و دفرمه شدن) */}
            <div className={`p-2 rounded-2xl border overflow-hidden shadow-md transition-colors ${
              isDark ? 'bg-[#111422] border-white/10' : 'bg-white border-slate-200/90'
            }`}>
              <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-slate-950 relative group">
                <img
                  src={posterImg}
                  alt={`پوستر رسمی ${event.title}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FF884D]" />
                  <span>پوستر رسمی اثر</span>
                </div>
              </div>
            </div>

            {/* دکمه اختصاصی خرید بلیت مستقیماً زیر پوستر رسمی اثر (باز شدن در صفحه جدول منظم سانس‌ها) */}
            <div className="w-full">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(true)}
                className="w-full py-3 px-4 sm:px-5 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center justify-between gap-3 bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] shadow-lg shadow-[#FF3366]/25 hover:shadow-xl hover:shadow-[#FF3366]/40 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer border border-white/20 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 group-hover:rotate-6 transition-transform">
                    <Calendar className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="text-right truncate">
                    <span className="block text-sm sm:text-base font-black">خرید بلیت</span>
                    <span className="block text-[10.5px] text-white/85 font-medium truncate">جدول سانس‌ها و مشخصات زمانی اجرا</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold bg-black/25 px-2.5 py-1.5 rounded-xl border border-white/20 shrink-0">
                  <span>سانس‌ها</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>

            {/* ۳. باکس مشخصات و توضیحات بلیت (زیر پوستر) */}
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-colors ${
              isDark ? 'bg-[#111422] border-white/10' : 'bg-white border-slate-200/90 shadow-slate-200/60'
            }`}>

              {/* هدر باکس مشخصات بلیت */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5 dark:border-white/10">
                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  مشخصات و شرایط بلیت
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                  {event.status || 'فروش فعال'}
                </span>
              </div>

              {/* قیمت بلیت */}
              <div className={`p-2.5 px-3 rounded-xl border mb-2.5 flex items-center justify-between ${
                isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/60'
              }`}>
                <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  قیمت بلیت:
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black font-display text-[#FF3366]">
                    {formatPrice(event.priceFrom)}
                  </span>
                  <span className={`text-[11px] font-bold ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    تومان
                  </span>
                </div>
              </div>

              {/* زمان و مکان */}
              <div className="space-y-2 text-xs mb-3.5">
                <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/60'
                }`}>
                  <Calendar className="w-3.5 h-3.5 text-[#FF884D] shrink-0" />
                  <div className="min-w-0">
                    <span className={`block text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>زمان اجرا</span>
                    <span className={`font-semibold truncate block ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                      {event.startDate} • ساعت {event.time || '۲۰:۰۰'}
                    </span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/60'
                }`}>
                  <MapPin className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
                  <div className="min-w-0">
                    <span className={`block text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>مکان و سالن</span>
                    <span className={`font-semibold truncate block ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                      {event.venue} ({event.city})
                    </span>
                  </div>
                </div>
              </div>

              {/* توضیحات و نکات لازم */}
              <div className="space-y-2 pt-3 border-t border-black/5 dark:border-white/10 text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>ورود فوری با بارکد دیجیتال در تلفن همراه</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>بسته شدن درب‌های سالن ۱۰ دقیقه پیش از سانس</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* فوتر رسمی، یکپارچه و ثابت سایت در انتهای صفحه رویداد */}
      <div className="pb-16 lg:pb-0">
        <Footer siteSettings={siteSettings} />
      </div>

      {/* نوار چسبان مینیمال، مدرن و شیک موبایل: فقط نمایش قیمت و دکمه خرید بلیت سریع */}
      <div className={`lg:hidden fixed bottom-0 inset-x-0 z-40 px-4 py-3 pb-[max(14px,env(safe-area-inset-bottom))] border-t backdrop-blur-2xl transition-all ${
        isDark 
          ? 'bg-[#0B0E1B]/92 border-white/10 shadow-[0_-10px_35px_rgba(0,0,0,0.6)]' 
          : 'bg-white/94 border-slate-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]'
      }`}>
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          {/* قیمت بلیت - کاملاً مینیمال، خوانا و شیک */}
          <div className="flex flex-col">
            <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              قیمت بلیت
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-xl font-black font-display tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {formatPrice(event.priceFrom)}
              </span>
              <span className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                تومان
              </span>
            </div>
          </div>

          {/* دکمه خرید بلیت سریع - ساده، مدرن، جذاب و حرفه‌ای */}
          <button
            type="button"
            onClick={() => onBuyTicket(event)}
            className="flex-1 max-w-[210px] h-12 rounded-2xl font-black text-sm text-white bg-gradient-to-l from-[#FF3366] to-[#F59E0B] shadow-lg shadow-[#FF3366]/25 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
          >
            <Ticket className="w-4 h-4 ml-0.5" />
            <span>خرید سریع بلیت</span>
          </button>
        </div>
      </div>

      {/* صفحه اختصاصی جدول سانس‌ها و مشخصات زمانی و مکانی اجرا (دارای هدر، فوتر و بنر عریض) */}
      {isScheduleModalOpen && (
        <EventScheduleModal
          event={event}
          onClose={() => setIsScheduleModalOpen(false)}
          onBuyTicket={(evt, slot, date, ticketingType, selectedSeats) => {
            setIsScheduleModalOpen(false);
            onBuyTicket(evt, slot, date, ticketingType, selectedSeats);
          }}
          onTicketPurchased={onTicketPurchased}
          siteSettings={siteSettings}
          cities={cities}
          selectedCity={selectedCity}
          onSelectCity={onSelectCity}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          savedCount={savedCount}
          ticketsCount={ticketsCount}
          onOpenTickets={onOpenTickets}
          onOpenSaved={onOpenSaved}
        />
      )}

    </div>
  );
};

export default EventDetailModal;
