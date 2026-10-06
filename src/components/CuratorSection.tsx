import React from 'react';
import { ArrowUpLeft } from 'lucide-react';
import { toPersianDigits } from '../utils/persianNumbers';

interface CuratorSectionProps {
  onSelectCity: (city: string) => void;
}

export const CuratorSection: React.FC<CuratorSectionProps> = ({ onSelectCity }) => {
  const institutions = [
    {
      name: 'تیت مدرن (سالن توربین)',
      city: 'لندن',
      country: 'بریتانیا',
      specialty: 'چیدمان‌های یادمانی حرکتی و هنر ادراکی',
      imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop',
      exhibitionsCount: 14,
    },
    {
      name: 'فیلارمونیک پاریس',
      city: 'پاریس',
      country: 'فرانسه',
      specialty: 'آکوستیک آوانگارد و ارکسترهای بین‌المللی',
      imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=800&auto=format&fit=crop',
      exhibitionsCount: 18,
    },
    {
      name: 'گنبد هنرهای دیجیتال اودایبا',
      city: 'توکیو',
      country: 'ژاپن',
      specialty: 'محیط‌های تعاملی بیومورفیک و نیومدیا',
      imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
      exhibitionsCount: 9,
    },
    {
      name: 'پاویون هنرهای معاصر',
      city: 'نیویورک',
      country: 'ایالات متحده',
      specialty: 'مجسمه‌سازی سایه‌روشن و آزمایش‌های ادراکی حسی',
      imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=800&auto=format&fit=crop',
      exhibitionsCount: 22,
    },
  ];

  return (
    <section className="py-20 bg-[#0B0D16] border-t border-[#1C2033] text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#FF3366]"></span>
              <span className="text-xs font-bold text-[#FF884D]">
                مراکز و تالارهای همکار فرهنگی
              </span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
              صحنه‌ها و نگارخانه‌های شاخص جهانی
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed">
            اتصال بی‌واسطه به وب‌سرویس رسمی گیشه برترین بنیادهای هنری جهان، با تضمین کامل اصالت بلیت و حذف بازار سیاه.
          </p>
        </div>

        {/* Institutions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {institutions.map((inst) => (
            <div
              key={inst.name}
              onClick={() => onSelectCity(inst.city)}
              className="group relative bg-[#121524] hover:bg-[#161B2E] border border-[#23293F] hover:border-[#FF884D]/50 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer shadow-lg"
            >
              <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
                <img
                  src={inst.imageUrl}
                  alt={inst.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121524] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 p-1.5 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 group-hover:bg-[#FF3366] group-hover:border-[#FF3366] transition-colors">
                  <ArrowUpLeft className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-4">
                <span className="text-[10px] font-bold text-[#FF884D] block mb-1">
                  {inst.city}، {inst.country}
                </span>
                <h3 className="font-display font-bold text-base text-white group-hover:text-white transition-colors">
                  {inst.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {inst.specialty}
                </p>

                <div className="mt-4 pt-3 border-t border-[#1F253B] flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{toPersianDigits(inst.exhibitionsCount)} رویداد فعال</span>
                  <span className="text-[#F59E0B] font-semibold group-hover:-translate-x-1 transition-transform">
                    مشاهده گذرها ←
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Artis Vernissage Patron Club Strip */}
        <div className="mt-14 p-8 sm:p-10 rounded-3xl bg-gradient-to-l from-[#171B2D] via-[#1D172A] to-[#121524] border border-[#2B324F] relative overflow-hidden">
          <div className="absolute -left-16 -top-16 w-64 h-64 bg-[#FF3366]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/30 mb-3 inline-block">
                عضویت ویژه حامیان هنر و کلکسیونرها
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
                به حلقه حامیان و کیوریتورهای آرتیس بپیوندید
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-xl leading-relaxed">
                بهره‌مندی از حضور اختصاصی در شب‌های خصوصی افتتاحیه (ورنیساژ)، همراهی با کیوریتورهای بین‌المللی و رزرو زودهنگام بلیت‌ها ۴۸ ساعت پیش از آغاز فروش عمومی.
              </p>
            </div>
            <button
              onClick={() => alert("به حلقه حامیان هنر آرتیس خوش آمدید. دعوت‌نامه اختصاصی برای ورنیساژهای پیش‌رو ارسال خواهد شد.")}
              className="px-6 py-3.5 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-100 active:scale-95 font-display font-extrabold text-xs tracking-wide shadow-xl transition-all cursor-pointer shrink-0"
            >
              درخواست دعوت‌نامه عضویت
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
