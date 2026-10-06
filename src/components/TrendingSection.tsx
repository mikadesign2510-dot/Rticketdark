import React, { useRef, useState, useEffect, useCallback } from 'react';
import TrendingCard from './TrendingCard'; 
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TrendingSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // دیتای رویدادهای پرفروش
  const trendingEvents = [
    {
      id: 1,
      title: "تئاتر کمدی مکبث",
      director: "کارگردان: شهاب حسینی",
      venue: "سالن اصلی تئاتر شهر",
      date: "پنجشنبه ۲۵ مهر | ساعت ۲۰:۰۰",
      imageUrl: "https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      title: "کنسرت موسیقی سنتی",
      director: "آهنگساز: همایون شجریان",
      venue: "تالار وحدت",
      date: "جمعه ۲۶ مهر | ساعت ۲۱:۳۰",
      imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      title: "استندآپ کمدی",
      director: "کارگردان و اجرا: مهران غفوریان",
      venue: "پردیس سینمایی کوروش",
      date: "یکشنبه ۲۸ مهر | ساعت ۱۹:۰۰",
      imageUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      title: "نمایش موزیکال بینوایان",
      director: "کارگردان: حسین پارسایی",
      venue: "هتل اسپیناس پالاس",
      date: "دوشنبه ۲۹ مهر | ساعت ۱۸:۰۰",
      imageUrl: "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 5,
      title: "ارکستر فیلارمونیک تهران",
      director: "رهبر ارکستر: نادر مشایخی",
      venue: "تالار رودکی",
      date: "سه‌شنبه ۳۰ مهر | ساعت ۲۱:۰۰",
      imageUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 6,
      title: "تئاتر سایه‌ها در تاریکی",
      director: "کارگردان: آتیلا پسیانی",
      venue: "تماشاخانه ایرانشهر",
      date: "چهارشنبه ۱ آبان | ساعت ۱۹:۳۰",
      imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 7,
      title: "گالری تجسمی هنر معاصر",
      director: "کیوریتور: آیدین آغداشلو",
      venue: "فرهنگسرای نیاوران",
      date: "پنجشنبه ۲ آبان | ساعت ۱۷:۰۰",
      imageUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=600&q=80",
    }
  ];

  const sliderRef = useRef<HTMLDivElement>(null);
  const [isGrabbed, setIsGrabbed] = useState(false);

  // Drag physics and state
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const rtlMultiplierRef = useRef<-1 | 1>(-1);

  // Detect RTL scroll implementation on mount
  useEffect(() => {
    try {
      const dummy = document.createElement('div');
      dummy.dir = 'rtl';
      dummy.style.width = '10px';
      dummy.style.height = '1px';
      dummy.style.overflow = 'scroll';
      dummy.style.position = 'absolute';
      dummy.style.top = '-9999px';
      dummy.style.visibility = 'hidden';
      document.body.appendChild(dummy);
      
      if (dummy.scrollLeft > 0) {
        rtlMultiplierRef.current = 1;
      } else {
        dummy.scrollLeft = 1;
        if (dummy.scrollLeft === 0) {
          rtlMultiplierRef.current = -1;
        } else {
          rtlMultiplierRef.current = 1;
        }
      }
      document.body.removeChild(dummy);
    } catch {
      rtlMultiplierRef.current = -1;
    }
  }, []);

  // Cancel any active momentum animation
  const stopMomentum = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Mouse Down handler for drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !sliderRef.current) return;
    stopMomentum();

    isDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    velocityRef.current = 0;
    setIsGrabbed(true);

    // Temporarily disable snap during drag for a buttery smooth glide
    sliderRef.current.style.scrollSnapType = 'none';
  };

  // Mouse Move handler for fluid dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current || !sliderRef.current) return;
    e.preventDefault();

    const currentX = e.clientX;
    const totalDist = Math.abs(currentX - startXRef.current);

    if (totalDist > 5) {
      isDraggingRef.current = true;
    }

    const deltaX = currentX - lastXRef.current;
    velocityRef.current = deltaX;
    lastXRef.current = currentX;

    // Apply scroll step with multiplier
    sliderRef.current.scrollLeft += deltaX * rtlMultiplierRef.current;
  };

  // Mouse Up / Leave handler with momentum release
  const handleMouseUpOrLeave = useCallback(() => {
    if (!isDownRef.current) return;
    isDownRef.current = false;
    setIsGrabbed(false);

    if (sliderRef.current) {
      // Re-enable snap after small delay so momentum can play out smoothly
      const slider = sliderRef.current;
      const initialVelocity = velocityRef.current;

      if (isDraggingRef.current && Math.abs(initialVelocity) > 1.2) {
        let currentVelocity = initialVelocity * 1.5;
        const decay = 0.93; // smooth friction

        const step = () => {
          if (!sliderRef.current) return;
          sliderRef.current.scrollLeft += currentVelocity * rtlMultiplierRef.current;
          currentVelocity *= decay;

          if (Math.abs(currentVelocity) > 0.4) {
            animationFrameRef.current = requestAnimationFrame(step);
          } else {
            slider.style.scrollSnapType = '';
          }
        };

        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        slider.style.scrollSnapType = '';
      }
    }

    // Keep dragging flag for a brief moment to prevent accidental card click
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 80);
  }, []);

  // Global mouseup listener to catch release outside the component
  useEffect(() => {
    const onWindowMouseUp = () => {
      if (isDownRef.current) {
        handleMouseUpOrLeave();
      }
    };
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => {
      window.removeEventListener('mouseup', onWindowMouseUp);
      stopMomentum();
    };
  }, [handleMouseUpOrLeave, stopMomentum]);

  // Prevent card click when user was dragging
  const handleClickCapture = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // Button navigation
  const handleScrollButton = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    stopMomentum();
    const cardStep = 280; // card width + gap
    const scrollAmount = direction === 'left' ? -cardStep * 1.8 : cardStep * 1.8;
    sliderRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className={`py-10 sm:py-12 border-y w-full overflow-hidden select-none transition-colors duration-300 ${
      isDark ? 'bg-[#0D101A] border-[#1E2337]/60' : 'bg-slate-100/60 border-slate-200/80'
    }`} dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* هدر بخش پرفروش‌ها و دکمه‌های ناوبری */}
        <div className="flex justify-between items-end mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-8 bg-gradient-to-b from-[#FF3366] to-[#F59E0B] rounded-full shadow-[0_0_12px_rgba(255,51,102,0.5)]" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  پرفروشترینهای این هفته
                </h2>
                <Flame className="w-5 h-5 text-[#FF3366] animate-bounce" />
              </div>
              <p className={`text-xs mt-1 hidden sm:block ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}>
                محبوب‌ترین رویدادها با بیشترین رزرو و استقبال مخاطبان
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* دکمه‌های اسکرول نرم برای دسکتاپ */}
            <div className="hidden sm:flex items-center gap-2" dir="ltr">
              <button
                onClick={() => handleScrollButton('left')}
                className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all cursor-pointer shadow-md active:scale-95 hover:border-[#FF3366]/40 ${
                  isDark 
                    ? 'bg-[#161B2D] hover:bg-[#1E253A] border-[#2B314B] text-zinc-300 hover:text-white' 
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950'
                }`}
                title="قبلی"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScrollButton('right')}
                className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all cursor-pointer shadow-md active:scale-95 hover:border-[#FF3366]/40 ${
                  isDark 
                    ? 'bg-[#161B2D] hover:bg-[#1E253A] border-[#2B314B] text-zinc-300 hover:text-white' 
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950'
                }`}
                title="بعدی"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button className="text-amber-500 hover:text-amber-400 text-sm font-bold flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full hover:bg-amber-500/10 cursor-pointer">
              مشاهده همه
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 
          کانتینر اسکرول افقی با پشتیبانی از لمس (موبایل) و کلیک و کشیدن (Drag-to-Scroll دسکتاپ):
          - touch-pan-x: لمس نرم در موبایل
          - cursor-grab / cursor-grabbing: تجربه تعاملی کشیدن ماوس در دسکتاپ
          - snap-x snap-mandatory: قفل نرم کارت‌ها در جای خود
        */}
        <div 
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onClickCapture={handleClickCapture}
          className={`flex overflow-x-auto gap-4 sm:gap-6 pb-8 pt-4 snap-x snap-mandatory hide-scrollbar touch-pan-x transition-colors ${
            isGrabbed ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {trendingEvents.map((event, index) => (
            <div key={event.id} className="snap-start shrink-0">
              <TrendingCard 
                rank={index + 1}
                title={event.title}
                venue={event.venue}
                date={event.date}
                imageUrl={event.imageUrl}
                director={event.director}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TrendingSection;
