import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Mail, Sparkles } from 'lucide-react';
import { toPersianDigits } from '../utils/persianNumbers';
import { SiteSettings } from '../lib/db';
import { useTheme } from '../context/ThemeContext';

interface FooterProps {
  siteSettings?: SiteSettings;
  onOpenCreateEvent?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ siteSettings, onOpenCreateEvent }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const footerStyle = {
    backgroundColor: siteSettings?.footerBgColor || undefined,
    borderColor: siteSettings?.footerBorderColor || undefined,
  };
  const footerTextStyle = siteSettings?.footerTextColor ? { color: siteSettings.footerTextColor } : {};

  return (
    <footer 
      className={`border-t pt-16 pb-12 text-right transition-colors duration-300 ${
        isDark 
          ? 'bg-[#08090F] border-[#191C2C] text-white' 
          : 'bg-white border-slate-200 text-slate-800'
      }`} 
      dir="rtl" 
      style={footerStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          
            {/* Col 1 & 2: Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {siteSettings?.footerLogoUrl ? (
                <img src={siteSettings.footerLogoUrl} alt={siteSettings?.siteTitle || 'Footer Logo'} className="h-10 object-contain" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF3366] to-[#F59E0B] p-[1.5px]">
                  <div className={`w-full h-full rounded-[10px] flex items-center justify-center font-display font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#FF3366] to-[#F59E0B] ${
                    isDark ? 'bg-[#0D0F18]' : 'bg-white'
                  }`}>
                    آ
                  </div>
                </div>
              )}
              {!siteSettings?.footerLogoUrl && (
                <span className={`font-display font-extrabold text-xl tracking-[0.1em] ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {siteSettings?.siteTitle || 'آرتیس | ARTIS'}
                </span>
              )}
            </div>
            
            <p className={`text-xs leading-relaxed max-w-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              سامانه جامع و اختصاصی رزرواسیون بلیت رویدادهای شاخص هنرهای تجسمی، تئاترهای تجربی و آوانگارد، و کنسرت‌های ارکسترال جهانی.
            </p>

            {/* Newsletter input */}
            <div className="pt-2">
              <span className={`text-[11px] font-bold block mb-2 ${isDark ? 'text-zinc-400' : 'text-slate-700'}`}>
                دریافت گزیده رویدادهای هنری و ورنیساژها در آخر هفته
              </span>
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-500 text-xs py-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 ml-1" />
                  <span>عضویت شما با موفقیت ثبت شد! پنجشنبه‌ها پرونده هنری اختصاصی ما را دریافت خواهید کرد.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
                  <div className="relative flex-1">
                    <Mail className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ایمیل شما (مثلاً: curator@gallery.ir)"
                      dir="ltr"
                      className={`w-full rounded-xl pr-9 pl-3 py-2 text-xs focus:outline-none focus:border-[#FF3366] text-right border transition-colors ${
                        isDark
                          ? 'bg-[#121524] border-[#23283E] text-white placeholder-zinc-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#F59E0B] hover:brightness-110 active:scale-95 text-white font-bold text-xs shrink-0 cursor-pointer shadow-md"
                  >
                    عضویت
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Custom Footer Links */}
          {siteSettings?.footerMenuLinks && siteSettings.footerMenuLinks.length > 0 ? (
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className={`text-xs font-bold mb-4 ${isDark ? 'text-zinc-300' : 'text-slate-900'}`}>لینک‌های مفید</h4>
                <ul className={`space-y-2.5 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  {siteSettings.footerMenuLinks.map((link, idx) => (
                    <li key={`${link.id}-${idx}`}>
                      <a href={link.url} className={`transition-colors cursor-pointer block ${isDark ? 'hover:text-white' : 'hover:text-slate-950'}`}>
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* Col 3: Disciplines */}
              <div>
                <h4 className={`text-xs font-bold mb-4 ${isDark ? 'text-zinc-300' : 'text-slate-900'}`}>
                  شاخه‌های هنری
                </h4>
                <ul className={`space-y-2.5 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  <li><span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-slate-950'}`}>هنرهای تجسمی و چیدمان مدرن</span></li>
                  <li><span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-slate-950'}`}>تئاترهای آوانگارد و پرفورمنس</span></li>
                  <li><span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-slate-950'}`}>ارکستر سمفونیک و آنسامبل چمبر</span></li>
                  <li><span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-slate-950'}`}>معماری نوری و رسانه‌های نوین</span></li>
                  <li><span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-slate-950'}`}>گذرنامه‌های اختصاصی بینال هنر</span></li>
                </ul>
              </div>

          {/* Col 4: Cultural Centers */}
          <div>
            <h4 className={`text-xs font-bold mb-4 ${isDark ? 'text-zinc-300' : 'text-slate-900'}`}>
              پایتخت‌های فرهنگی
            </h4>
            <ul className={`space-y-2.5 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              <li><span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-slate-950'}`}>لندن: وست‌اند و بنک‌ساید</span></li>
              <li><span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-slate-950'}`}>پاریس: ویلت و لومره</span></li>
              <li><span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-slate-950'}`}>نیویورک: چلسی و لینکلن سنتر</span></li>
              <li><span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-slate-950'}`}>توکیو: روپونگی و اودایبا</span></li>
              <li><span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-slate-950'}`}>برلین: کولتورفروم و میته</span></li>
            </ul>
          </div>

          {/* Col 5: Box Office Standards */}
          <div>
            <h4 className={`text-xs font-bold mb-4 ${isDark ? 'text-zinc-300' : 'text-slate-900'}`}>
              اصالت و تعهدات گیشه
            </h4>
            <div className={`space-y-3 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>۱۰۰٪ تضمین صدور مستقیم از گیشه رسمی مراکز فرهنگی</span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <span>بارکد و کارت دیجیتال امنیتی ضدجعل</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FF3366] shrink-0 mt-0.5" />
                <span>نرخ مصوب فرهنگی بدون هزینه واسطه یا بازار سیاه</span>
              </div>
            </div>
          </div>
          </>
          )}

        </div>

        {/* Bottom copyright */}
        <div className={`pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
          isDark ? 'border-[#161826] text-zinc-400' : 'border-slate-200 text-slate-500'
        }`} style={footerTextStyle}>
          <p>{siteSettings?.footerText || `© ${toPersianDigits(2026)} سامانه رزرواسیون فرهنگی و هنری آرتیس. توسعه‌یافته برای تجارب معاصر صحنه و گالری.`}</p>
          <div className="flex items-center gap-6">
            <a
              href="/create-event"
              className="text-[#FF3366] hover:brightness-110 font-black transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>ایجاد و میزبانی رویداد</span>
            </a>
            <span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-zinc-300' : 'hover:text-slate-800'}`}>منشور حفظ حریم هنردوستان</span>
            <span className={`transition-colors cursor-pointer ${isDark ? 'hover:text-zinc-300' : 'hover:text-slate-800'}`}>قوانین و تعهدات گیشه</span>
            <a href="/admin" className="hover:text-[#FF3366] transition-colors cursor-pointer">ورود مدیریت</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
