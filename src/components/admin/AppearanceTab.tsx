import React, { useState } from 'react';
import { 
  Check, 
  Layout, 
  Type, 
  Globe, 
  Sparkles, 
  Image as ImageIcon, 
  Crop, 
  Trash2, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Menu as MenuIcon, 
  Sliders,
  Search,
  Layers,
  Film,
  Award,
  Sun,
  Moon,
  RotateCcw,
  Monitor,
  Smartphone,
  ExternalLink,
  ChevronLeft,
  Calendar,
  Ticket,
  MapPin,
  Clock,
  Heart,
  GripVertical,
  CheckCircle2,
  Lock,
  Eye,
  Settings2,
  Palette,
  Wand2,
  Flame,
  Crown,
  Zap,
  Gem,
  ShieldCheck
} from 'lucide-react';
import { SiteSettings, MenuLink } from '../../lib/db';
import { LogoImageEditorModal } from './LogoImageEditorModal';

interface AppearanceTabProps {
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
}

type AppearanceSubTab = 
  | 'header' 
  | 'hero' 
  | 'intro' 
  | 'search' 
  | 'cards' 
  | 'cinema' 
  | 'curator' 
  | 'creator'
  | 'footer' 
  | 'auth'
  | 'sections';


const DEFAULT_HEADER_MENUS: MenuLink[] = [
  { id: '1', title: 'همه رویدادها', url: 'all' },
  { id: '2', title: 'تئاتر و نمایش', url: 'theater' },
  { id: '3', title: 'موسیقی و کنسرت', url: 'concert' },
  { id: '4', title: 'گالری و تجسمی', url: 'gallery' },
  { id: '5', title: 'هنر تعاملی', url: 'immersive' },
];

/* ------------------------------------------------------------- */
/* PRESET CATALOGS                                               */
/* ------------------------------------------------------------- */

interface GlobalThemePreset {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  icon: React.FC<{ className?: string }>;
  accentColor: string;
  previewDots: string[];
  settings: Partial<SiteSettings>;
}

const GLOBAL_THEMES: GlobalThemePreset[] = [
  {
    id: 'articket-neon',
    name: 'آرتیکت اورجینال (Neon Magenta)',
    tagline: 'مدرن، جذاب و پرانرژی برای رویدادهای زنده، تئاتر و کنسرت‌ها',
    badge: 'پیش‌فرض برتر',
    icon: Flame,
    accentColor: '#FF3366',
    previewDots: ['#FF3366', '#FF5533', '#0A0C13'],
    settings: {
      primaryAccent: '#FF3366',
      headerBgColor: '#0A0C13',
      headerBorderRadius: '40px',
      headerLogoRadius: '14px',
      headerLogoHeight: 42,
      heroLayout: 'bento',
      introBoxBgColor: 'rgba(255, 51, 102, 0.12)',
      introBoxBorderColor: 'rgba(255, 51, 102, 0.35)',
      introBoxRadius: '1.5rem',
      searchBgColor: '#0A0C13',
      searchBorderColor: '#242A42',
      searchBorderRadius: '24px',
      cardBgColor: '#0E1324',
      cardBorderRadius: '20px',
      cardTextColor: '#FFFFFF',
      footerBgColor: '#06070B',
    }
  },
  {
    id: 'royal-gold',
    name: 'رویال لوکس و مخملی (Royal Velvet & Gold)',
    tagline: 'تم اشرافی طلایی مناسب اپرا، تالارهای فاخر و ارکستر سمفونیک',
    badge: 'بسیار مجلل',
    icon: Crown,
    accentColor: '#F59E0B',
    previewDots: ['#F59E0B', '#D97706', '#141416'],
    settings: {
      primaryAccent: '#F59E0B',
      headerBgColor: '#0C0C0E',
      headerBorderRadius: '24px',
      headerLogoRadius: '8px',
      headerLogoHeight: 40,
      heroLayout: 'wide',
      introBoxBgColor: 'rgba(245, 158, 11, 0.12)',
      introBoxBorderColor: 'rgba(245, 158, 11, 0.45)',
      introBoxRadius: '1.25rem',
      searchBgColor: '#121216',
      searchBorderColor: '#D97706',
      searchBorderRadius: '16px',
      cardBgColor: '#151518',
      cardBorderRadius: '18px',
      cardTextColor: '#FEF3C7',
      footerBgColor: '#09090B',
    }
  },
  {
    id: 'cinematic-cyan',
    name: 'سینماتیک و یشمی (Cyber Teal & Emerald)',
    tagline: 'فضای جشنواره‌ای بین‌المللی با نورهای فیروزه‌ای و سبز زمردی',
    badge: 'جشنواره مدرن',
    icon: Zap,
    accentColor: '#06B6D4',
    previewDots: ['#06B6D4', '#10B981', '#05121E'],
    settings: {
      primaryAccent: '#06B6D4',
      headerBgColor: '#05121E',
      headerBorderRadius: '40px',
      headerLogoRadius: '12px',
      headerLogoHeight: 42,
      heroLayout: 'bento',
      introBoxBgColor: 'rgba(6, 182, 212, 0.12)',
      introBoxBorderColor: 'rgba(6, 182, 212, 0.4)',
      introBoxRadius: '1.5rem',
      searchBgColor: '#071827',
      searchBorderColor: '#0E3A5A',
      searchBorderRadius: '28px',
      cardBgColor: '#091E30',
      cardBorderRadius: '22px',
      cardTextColor: '#E0F2FE',
      footerBgColor: '#030D16',
    }
  },
  {
    id: 'minimal-ivory',
    name: 'مینیمال مونوکروم استودیو (Minimal Studio Light)',
    tagline: 'سبک معاصر گالری‌های هنری با خطوط شارپ، سفید و کادر خاکستری',
    badge: 'گالری و تجسمی',
    icon: Gem,
    accentColor: '#E11D48',
    previewDots: ['#E11D48', '#334155', '#FFFFFF'],
    settings: {
      primaryAccent: '#E11D48',
      headerBgColor: '#FFFFFF',
      headerBorderRadius: '16px',
      headerLogoRadius: '8px',
      headerLogoHeight: 40,
      heroLayout: 'wide',
      introBoxBgColor: '#F8FAFC',
      introBoxBorderColor: '#E2E8F0',
      introBoxRadius: '1rem',
      searchBgColor: '#FFFFFF',
      searchBorderColor: '#CBD5E1',
      searchBorderRadius: '14px',
      cardBgColor: '#FFFFFF',
      cardBorderRadius: '16px',
      cardTextColor: '#0F172A',
      footerBgColor: '#0F172A',
    }
  },
];

/* Section Specific Presets */
const HEADER_PRESETS = [
  {
    id: 'capsule-floating',
    name: 'کپسولی شیشه‌ای شناور',
    desc: 'انحنای ۴۰ پیکسل با پس‌زمینه دارک شیشه‌ای مدرن',
    settings: { headerBorderRadius: '40px', headerBgColor: '#0A0C13', headerLogoRadius: '14px', headerLogoHeight: 42 }
  },
  {
    id: 'fullwidth-sharp',
    name: 'لبه‌به‌لبه مستطیل مدرن',
    desc: 'انحنای صفر با فرمت فلت عریض در بالای صفحه',
    settings: { headerBorderRadius: '0px', headerBgColor: '#07090F', headerLogoRadius: '0px', headerLogoHeight: 46 }
  },
  {
    id: 'island-rounded',
    name: 'جزیره نرم با گوشه ۲۰px',
    desc: 'فرمت باکس جزیره‌ای شناور با انحنای استاندارد',
    settings: { headerBorderRadius: '20px', headerBgColor: '#121626', headerLogoRadius: '8px', headerLogoHeight: 40 }
  },
  {
    id: 'studio-white',
    name: 'سفید ابری استودیویی',
    desc: 'پس‌زمینه سفید خالص همراه با سایه ملایم و متن تیره',
    settings: { headerBorderRadius: '32px', headerBgColor: '#FFFFFF', headerLogoRadius: '10px', headerLogoHeight: 44 }
  }
];

const INTRO_PRESETS = [
  {
    id: 'neon-rose',
    name: 'شیشه‌ای رز نئون (Rose Glow)',
    desc: 'زمینه صورتی ملایم با حاشیه درخشان نئون',
    settings: { introBoxBgColor: 'rgba(255, 51, 102, 0.12)', introBoxBorderColor: '#FDA4AF', introBoxRadius: '1.5rem' }
  },
  {
    id: 'luxury-gold',
    name: 'طلای مخملی کهربایی (Royal Gold)',
    desc: 'زمینه تیره اشرافی با کادر طلایی براق',
    settings: { introBoxBgColor: 'rgba(245, 158, 11, 0.12)', introBoxBorderColor: 'rgba(245, 158, 11, 0.45)', introBoxRadius: '1.25rem' }
  },
  {
    id: 'teal-ocean',
    name: 'آبی اقیانوسی فیروزه‌ای (Teal Wave)',
    desc: 'زمینه فیروزه‌ای آرام‌بخش با کنتراست عالی',
    settings: { introBoxBgColor: 'rgba(6, 182, 212, 0.12)', introBoxBorderColor: 'rgba(6, 182, 212, 0.4)', introBoxRadius: '1.75rem' }
  },
  {
    id: 'pure-white',
    name: 'عاجی مینیمال لایت (Minimal Ivory)',
    desc: 'زمینه سفید استخوانی با حاشیه ظریف خاکستری',
    settings: { introBoxBgColor: '#F8FAFC', introBoxBorderColor: '#E2E8F0', introBoxRadius: '1rem' }
  }
];

const SEARCH_PRESETS = [
  {
    id: 'capsule-neon',
    name: 'کپسولی نئون فلوتینگ',
    desc: 'انحنای کامل ۳۰px با کادر درخشان صورتی',
    settings: { searchBorderRadius: '30px', searchBgColor: '#0A0C13', searchBorderColor: '#FF3366', searchButtonText: 'جستجوی رویداد' }
  },
  {
    id: 'geometric-sleek',
    name: 'ژئومتریک نرم (Sleek 12px)',
    desc: 'انحنای ملایم ۱۲px برای سبک‌های تکنولوژیک و مدرن',
    settings: { searchBorderRadius: '12px', searchBgColor: '#121624', searchBorderColor: '#2B3550', searchButtonText: 'جستجو' }
  },
  {
    id: 'gold-elegance',
    name: 'طلایی کلاسیک و مجلل',
    desc: 'حاشیه کهربایی طلایی با دکمه باوقار',
    settings: { searchBorderRadius: '18px', searchBgColor: '#141416', searchBorderColor: '#D97706', searchButtonText: 'کشف بلیت' }
  },
  {
    id: 'clean-light',
    name: 'سفید استودیویی لایت',
    desc: 'پس‌زمینه سفید با حاشیه خاکستری روشن',
    settings: { searchBorderRadius: '24px', searchBgColor: '#FFFFFF', searchBorderColor: '#CBD5E1', searchButtonText: 'پیدا کن' }
  }
];

const CARDS_PRESETS = [
  {
    id: 'dark-glass',
    name: 'دارک گلس نئون (Dark Neon Glass)',
    desc: 'پس‌زمینه تیره عمیق با گوشه ۲۰px و متون سفید',
    settings: { cardBgColor: '#0E1324', cardBorderRadius: '20px', cardTextColor: '#FFFFFF' }
  },
  {
    id: 'charcoal-gold',
    name: 'زغالی مات با حاشیه طلایی',
    desc: 'پس‌زمینه دودی اشرافی با متون کهربایی',
    settings: { cardBgColor: '#151518', cardBorderRadius: '16px', cardTextColor: '#FEF3C7' }
  },
  {
    id: 'metallic-sleek',
    name: 'استیل مونوکروم متالیک',
    desc: 'انحنای ۱۲px با رنگ‌بندی طوسی متالیک',
    settings: { cardBgColor: '#18181B', cardBorderRadius: '12px', cardTextColor: '#F4F4F5' }
  },
  {
    id: 'pure-light-card',
    name: 'سفید خالص استودیو (Light Card)',
    desc: 'کارت سفید لایت با سایه عمیق و متون تیره',
    settings: { cardBgColor: '#FFFFFF', cardBorderRadius: '20px', cardTextColor: '#0F172A' }
  }
];

export const AppearanceTab: React.FC<AppearanceTabProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formState, setFormState] = useState<SiteSettings>({ ...settings });
  const [activeSubTab, setActiveSubTab] = useState<AppearanceSubTab>('header');
  const [isSaved, setIsSaved] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [appliedPresetNotice, setAppliedPresetNotice] = useState<string | null>(null);

  // New menu item draft
  const [newMenuTitle, setNewMenuTitle] = useState('');
  const [newMenuUrl, setNewMenuUrl] = useState('all');

  const handleSave = async () => {
    await onSaveSettings(formState);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const applyPresetNotice = (name: string) => {
    setAppliedPresetNotice(name);
    setTimeout(() => setAppliedPresetNotice(null), 3000);
  };

  const applyGlobalTheme = (theme: GlobalThemePreset) => {
    setFormState(prev => ({
      ...prev,
      ...theme.settings,
    }));
    applyPresetNotice(`تم سراسری «${theme.name}» اعمال شد`);
  };

  // Menu handlers
  const handleAddMenu = () => {
    if (!newMenuTitle.trim()) {
      alert('لطفاً عنوان منو را وارد کنید.');
      return;
    }
    const currentMenus = formState.headerMenuLinks || DEFAULT_HEADER_MENUS;
    const newLink: MenuLink = {
      id: 'menu-' + Date.now(),
      title: newMenuTitle.trim(),
      url: newMenuUrl.trim() || 'all',
    };
    setFormState({
      ...formState,
      headerMenuLinks: [...currentMenus, newLink],
    });
    setNewMenuTitle('');
  };

  const handleUpdateMenu = (id: string, field: 'title' | 'url', val: string) => {
    const currentMenus = formState.headerMenuLinks || DEFAULT_HEADER_MENUS;
    const updated = currentMenus.map(m => m.id === id ? { ...m, [field]: val } : m);
    setFormState({ ...formState, headerMenuLinks: updated });
  };

  const handleDeleteMenu = (id: string) => {
    const currentMenus = formState.headerMenuLinks || DEFAULT_HEADER_MENUS;
    setFormState({
      ...formState,
      headerMenuLinks: currentMenus.filter(m => m.id !== id),
    });
  };

  const handleMoveMenu = (index: number, direction: 'up' | 'down') => {
    const currentMenus = [...(formState.headerMenuLinks || DEFAULT_HEADER_MENUS)];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentMenus.length) return;

    const [moved] = currentMenus.splice(index, 1);
    currentMenus.splice(targetIndex, 0, moved);
    setFormState({ ...formState, headerMenuLinks: currentMenus });
  };

  const subTabs: { id: AppearanceSubTab; label: string; icon: React.FC<{ className?: string }>; desc: string }[] = [
    { id: 'header', label: 'هدر، لوگو و منوها', icon: Layout, desc: 'لوگو، برند و پیوندهای ناوبری' },
    { id: 'hero', label: 'اسلایدر و بنر اصلی', icon: Sparkles, desc: 'تیتر، چیدمان بنتو و بک‌گراند' },
    { id: 'intro', label: 'باکس خوش‌آمدگویی', icon: Type, desc: 'کارت معرفی و پیام سردبیر' },
    { id: 'search', label: 'کادر جستجو و فیلتر', icon: Search, desc: 'سرچ‌بار، دکمه و عبارات' },
    { id: 'cards', label: 'استایل کارت رویدادها', icon: Layers, desc: 'رنگ‌بندی، گوشه‌ها و کارت‌ها' },
    { id: 'cinema', label: 'اسلایدر عریض سینمایی', icon: Film, desc: 'بنر پانوراما و تبلیغات ردیف دوم' },
    { id: 'curator', label: 'پیشنهاد کیوریتور', icon: Award, desc: 'برگزیده‌های هفته و یادداشت' },
    { id: 'creator', label: 'باکس صاحبان آثار', icon: Crown, desc: 'شخصی‌سازی متون، دکمه و مزایای میزبانی' },
    { id: 'footer', label: 'فوتر و کپی‌رایت', icon: Globe, desc: 'پاورقی، لینک‌ها و قوانین' },
    { id: 'auth', label: 'صفحه ورود و ثبت‌نام', icon: Lock, desc: 'شخصی‌سازی متون، بنر و فیلدهای لاگین' },
    { id: 'sections', label: 'کنترل فعال‌سازی بخش‌ها', icon: Sliders, desc: 'مدیریت خاموش/روشن صفحه اصلی' },
  ];


  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto" dir="rtl">
      {/* Top Studio Bar */}
      <div className="p-4 sm:p-5 rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 sticky top-16 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF3366] via-[#FF5533] to-[#F59E0B] flex items-center justify-center text-white shadow-md shadow-[#FF3366]/20">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-lg text-slate-900 tracking-tight">
                استودیوی طراحی و هویت بصری
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF3366]/10 text-[#FF3366]">
                LIVE STUDIO & PRESETS
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              انتخاب سریع از استایل‌های آماده و شخصی‌سازی مستقل بخش‌ها همراه با پیش‌نمایش ماک‌آپ
            </p>
          </div>
        </div>

        {/* Viewport & Theme Switcher & Save Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification on preset applied */}
          {appliedPresetNotice && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{appliedPresetNotice}</span>
            </div>
          )}

          {/* Viewport switch */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewportMode('desktop')}
              className={`p-1.5 px-2.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                viewportMode === 'desktop' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="نمای دسکتاپ"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">دسکتاپ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('mobile')}
              className={`p-1.5 px-2.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                viewportMode === 'mobile' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="نمای موبایل"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">موبایل</span>
            </button>
          </div>

          {/* Theme switch */}
          <button
            type="button"
            onClick={() => setPreviewTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="p-2 sm:px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="تغییر تم پیش‌نمایش"
          >
            {previewTheme === 'dark' ? <Moon className="w-4 h-4 text-blue-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span className="hidden sm:inline">{previewTheme === 'dark' ? 'تم تاریک' : 'تم روشن'}</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            className="py-2.5 px-5 sm:px-6 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs font-black shadow-md shadow-[#FF3366]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            {isSaved ? <Check className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
            <span>{isSaved ? 'تنظیمات ذخیره شد!' : 'ذخیره تغییرات'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* GLOBAL FULL-THEME PRESETS STRIP                         */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-gradient-to-l from-white via-rose-50/20 to-amber-50/20 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm text-slate-900 flex items-center gap-2">
                <span>تم‌های جامع و هماهنگ سامانه (Full System Themes)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                  تغییر یکپارچه با ۱ کلیک
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                با انتخاب هر تم، تمام بخش‌ها (هدر، بنرها، کارت‌ها، کادر جستجو و رنگ‌بندی) به شکل خودکار و هماهنگ ست می‌شوند.
              </p>
            </div>
          </div>
        </div>

        {/* Global Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {GLOBAL_THEMES.map((theme) => {
            const Icon = theme.icon;
            return (
              <div
                key={theme.id}
                onClick={() => applyGlobalTheme(theme)}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#FF3366] transition-all flex flex-col justify-between shadow-2xs hover:shadow-md cursor-pointer group relative overflow-hidden"
              >
                {/* Accent Top Border */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5"
                  style={{ backgroundColor: theme.accentColor }}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {theme.badge}
                    </span>
                    <div className="flex items-center gap-1">
                      {theme.previewDots.map((dot, i) => (
                        <span
                          key={i}
                          className="w-3 h-3 rounded-full border border-white/60 shadow-2xs"
                          style={{ backgroundColor: dot }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: theme.accentColor }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#FF3366] transition-colors line-clamp-1">
                      {theme.name}
                    </h4>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {theme.tagline}
                  </p>
                </div>

                <button
                  type="button"
                  className="mt-3 w-full py-1.5 rounded-xl bg-slate-100 group-hover:bg-[#FF3366] text-slate-700 group-hover:text-white text-[11px] font-bold transition-all cursor-pointer text-center"
                >
                  اعمال این تم سراسری
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-2">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-white to-slate-50 border-[#FF3366] text-[#FF3366] shadow-sm shadow-[#FF3366]/10 ring-2 ring-[#FF3366]/20 scale-[1.02]'
                  : 'bg-white border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-[#FF3366] text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF3366] animate-pulse" />}
              </div>
              <span className="font-bold text-xs leading-tight block text-slate-900">{tab.label}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">{tab.desc}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 1. HEADER & LOGO & MENUS */}
      {/* ======================================================== */}
      {activeSubTab === 'header' && (
        <div className="space-y-6">
          {/* Header Pre-made Styles Selector */}
          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#FF3366]" />
                <span>استایل‌های آماده و الگوهای هدر (Header Style Presets)</span>
              </span>
              <span className="text-[11px] text-slate-400">یک کلیک برای تست و اعمال</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {HEADER_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    setFormState(prev => ({ ...prev, ...preset.settings }));
                    applyPresetNotice(`استایل «${preset.name}» اعمال شد`);
                  }}
                  className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#FF3366] transition-all cursor-pointer shadow-2xs space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-[#FF3366] transition-colors">
                      {preset.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {preset.settings.headerBorderRadius}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {preset.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Mockup Browser Window Preview */}
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            {/* Safari/Chrome Browser Header */}
            <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              </div>
              <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-white border border-slate-200 text-slate-500 font-mono text-[11px] shadow-2xs">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>articket.ir/header-preview</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono font-medium">
                {viewportMode === 'desktop' ? '1440 × 900 px' : '390 × 844 px'}
              </div>
            </div>

            {/* Browser Canvas Area */}
            <div className={`p-6 sm:p-10 flex items-center justify-center transition-colors ${
              previewTheme === 'dark' ? 'bg-[#060810]' : 'bg-slate-100/80'
            }`}>
              <div className={`transition-all duration-300 w-full ${viewportMode === 'mobile' ? 'max-w-sm' : 'max-w-5xl'}`}>
                {/* Header Floating Pill */}
                <div
                  className={`p-3 sm:p-4 border transition-all flex items-center justify-between shadow-xl ${
                    previewTheme === 'dark'
                      ? 'border-white/10 text-white shadow-black/40'
                      : 'border-slate-200 text-slate-900 shadow-slate-300/40'
                  }`}
                  style={{
                    borderRadius: formState.headerBorderRadius || '40px',
                    backgroundColor: formState.headerBgColor || (previewTheme === 'dark' ? '#0A0C13' : '#FFFFFF'),
                  }}
                >
                  {/* Brand & Logo */}
                  <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                    {formState.headerShowLogo !== false && (
                      formState.headerLogoUrl ? (
                        <img
                          src={formState.headerLogoUrl}
                          alt="Logo"
                          style={{
                            height: `${viewportMode === 'mobile' ? Math.min(32, formState.headerLogoHeight || 40) : (formState.headerLogoHeight || 40)}px`,
                            borderRadius: formState.headerLogoRadius || '8px',
                          }}
                          className="object-contain max-h-12 drop-shadow-sm"
                        />
                      ) : (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#FF3366] via-[#FF6B35] to-[#F59E0B] p-[1.5px] flex items-center justify-center text-white font-black text-xs shadow-md shadow-[#FF3366]/20">
                          آرت
                        </div>
                      )
                    )}

                    {formState.headerShowTextNextToLogo !== false && (
                      <div className="leading-tight">
                        <span className="font-display font-black text-sm sm:text-base block tracking-tight">
                          {formState.headerLogoTitle || formState.siteTitle || 'آرتیکت'}
                        </span>
                        {viewportMode === 'desktop' && (
                          <span className={`text-[9px] block font-mono mt-0.5 ${previewTheme === 'dark' ? 'text-zinc-400' : 'text-slate-400'}`}>
                            {formState.headerLogoSubtitle || 'Art & Stage'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Navigation Links (Desktop) */}
                  {viewportMode === 'desktop' && (
                    <div className="hidden md:flex items-center gap-1.5 text-xs font-bold">
                      {(formState.headerMenuLinks || DEFAULT_HEADER_MENUS).slice(0, 5).map((m, idx) => (
                        <span
                          key={m.id}
                          className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                            idx === 0
                              ? 'bg-[#FF3366] text-white shadow-xs'
                              : previewTheme === 'dark' ? 'text-zinc-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {m.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Right Action */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border cursor-pointer ${
                      previewTheme === 'dark'
                        ? 'border-white/10 text-white bg-white/5 hover:bg-white/10'
                        : 'border-slate-200 text-slate-800 bg-slate-50 hover:bg-slate-100'
                    }`}>
                      بلیت‌های من
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Settings Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Logo Settings (6 Cols) */}
            <div className="lg:col-span-6 p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FF3366]/10 text-[#FF3366] flex items-center justify-center font-bold">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">نشان‌واره و تصویر لوگو</h4>
                    <p className="text-[11px] text-slate-500">آپلود، برش و کنترل ابعاد نشان هدر</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(true)}
                  className="py-2 px-3.5 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs font-black shadow-md shadow-[#FF3366]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>ویرایشگر و برش لوگو</span>
                </button>
              </div>

              {/* Logo Card with Checkerboard */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-2 overflow-hidden shrink-0 shadow-2xs relative">
                  {/* checkerboard background */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:8px_8px]" />
                  {formState.headerLogoUrl ? (
                    <img src={formState.headerLogoUrl} alt="Logo" className="max-h-full max-w-full object-contain relative z-10" />
                  ) : (
                    <div className="text-center relative z-10">
                      <span className="text-[10px] text-slate-400 font-bold block">پیش‌فرض</span>
                      <span className="text-[9px] text-[#FF3366] font-bold block">هگزاگون</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      {formState.headerLogoUrl ? 'لوگوی اختصاصی فعال' : 'لوگوی استاندارد آرتیکت'}
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={formState.headerShowLogo !== false}
                        onChange={(e) => setFormState({ ...formState, headerShowLogo: e.target.checked })}
                        className="w-4 h-4 rounded text-[#FF3366]"
                      />
                      <span>نمایش در هدر</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    می‌توانید تصویر شفاف با فرمت PNG آپلود کنید و با نسبت دلخواه برش بزنید.
                  </p>
                  {formState.headerLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, headerLogoUrl: '' })}
                      className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>حذف و بازگشت به آیکون پیش‌فرض</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sliders and Radiuses */}
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">ارتفاع لوگو در هدر:</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      {formState.headerLogoHeight || 40} پیکسل
                    </span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="64"
                    step="2"
                    value={formState.headerLogoHeight || 40}
                    onChange={(e) => setFormState({ ...formState, headerLogoHeight: Number(e.target.value) })}
                    className="w-full accent-[#FF3366] cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-slate-700 block">انحنای کادر دور لوگو</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { val: '0px', label: 'تیز (0px)' },
                      { val: '8px', label: 'نرم (8px)' },
                      { val: '14px', label: 'گرد (14px)' },
                      { val: '50%', label: 'دایره (50%)' },
                    ].map(item => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setFormState({ ...formState, headerLogoRadius: item.val })}
                        className={`p-2 rounded-xl text-center font-bold text-xs transition-all cursor-pointer border ${
                          (formState.headerLogoRadius || '8px') === item.val
                            ? 'bg-[#FF3366]/10 border-[#FF3366] text-[#FF3366]'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Title & Header Shell (6 Cols) */}
            <div className="lg:col-span-6 p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                    <Type className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">نوشته کنار لوگو و پوسته هدر</h4>
                    <p className="text-[11px] text-slate-500">عنوان سایت، رنگ شیشه‌ای و انحنای نوار</p>
                  </div>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={formState.headerShowTextNextToLogo !== false}
                    onChange={(e) => setFormState({ ...formState, headerShowTextNextToLogo: e.target.checked })}
                    className="w-4 h-4 rounded text-[#FF3366]"
                  />
                  <span>نمایش نوشته کنار لوگو</span>
                </label>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">عنوان اصلی برند (کنار نشان)</label>
                  <input
                    type="text"
                    value={formState.headerLogoTitle ?? formState.siteTitle ?? 'آرتیکت'}
                    onChange={(e) => setFormState({ ...formState, headerLogoTitle: e.target.value, siteTitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                    placeholder="مثال: آرتیکت"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">شعار یا زیرعنوان هدر</label>
                  <input
                    type="text"
                    value={formState.headerLogoSubtitle ?? 'پلتفرم کشف و رزرو رویدادهای هنری'}
                    onChange={(e) => setFormState({ ...formState, headerLogoSubtitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                    placeholder="مثال: Art & Stage"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">انحنای حاشیه هدر</label>
                    <select
                      value={formState.headerBorderRadius || '40px'}
                      onChange={(e) => setFormState({ ...formState, headerBorderRadius: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                    >
                      <option value="40px">کپسولی شناور (40px)</option>
                      <option value="24px">گرد مدرن (24px)</option>
                      <option value="14px">مستطیلی نرم (14px)</option>
                      <option value="0px">لبه به لبه کامل (0px)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">کد رنگ پس‌زمینه هدر</label>
                    <input
                      type="text"
                      value={formState.headerBgColor || '#0A0C13'}
                      onChange={(e) => setFormState({ ...formState, headerBgColor: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Management (Full Width) */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <MenuIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">مدیریت پیوندها و دسته‌بندی‌های منوی هدر</h4>
                  <p className="text-[11px] text-slate-500">ترتیب، عناوین و مسیرهای ناوبری بالای سایت</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFormState({ ...formState, headerMenuLinks: DEFAULT_HEADER_MENUS })}
                className="py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بازنشانی پیش‌فرض‌ها</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(formState.headerMenuLinks || DEFAULT_HEADER_MENUS).map((menu, idx) => (
                <div
                  key={menu.id}
                  className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={menu.title}
                      onChange={(e) => handleUpdateMenu(menu.id, 'title', e.target.value)}
                      className="py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold text-xs w-36 focus:outline-none"
                    />
                    <select
                      value={menu.url}
                      onChange={(e) => handleUpdateMenu(menu.id, 'url', e.target.value)}
                      className="py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none flex-1 truncate"
                    >
                      <option value="all">همه رویدادها</option>
                      <option value="theater">تئاتر و نمایش</option>
                      <option value="concert">کنسرت و موسیقی</option>
                      <option value="gallery">گالری و تجسمی</option>
                      <option value="immersive">هنر تعاملی</option>
                      <option value="#">لینک دلخواه (#)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveMenu(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-600 cursor-pointer shadow-2xs"
                      title="انتقال به جلو"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveMenu(idx, 'down')}
                      disabled={idx === (formState.headerMenuLinks || DEFAULT_HEADER_MENUS).length - 1}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-600 cursor-pointer shadow-2xs"
                      title="انتقال به عقب"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMenu(menu.id)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer shadow-2xs"
                      title="حذف منو"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Menu item */}
            <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-white flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#FF3366]" />
                <span>افزودن پیوند جدید:</span>
              </span>
              <input
                type="text"
                value={newMenuTitle}
                onChange={(e) => setNewMenuTitle(e.target.value)}
                placeholder="عنوان پیوند منو..."
                className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold flex-1 min-w-[150px] focus:bg-white focus:outline-none"
              />
              <select
                value={newMenuUrl}
                onChange={(e) => setNewMenuUrl(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold focus:bg-white focus:outline-none"
              >
                <option value="all">همه رویدادها</option>
                <option value="theater">تئاتر و نمایش</option>
                <option value="concert">کنسرت و موسیقی</option>
                <option value="gallery">گالری و تجسمی</option>
                <option value="immersive">هنر تعاملی</option>
                <option value="#">لینک سفارشی</option>
              </select>
              <button
                type="button"
                onClick={handleAddMenu}
                className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن به نوار هدر</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. HERO SLIDER & BANNER */}
      {/* ======================================================== */}
      {activeSubTab === 'hero' && (
        <div className="space-y-6">
          {/* Hero Presets Picker */}
          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-[#FF3366]" />
              <span>استایل‌های آماده اسلایدر اصلی (Hero Presets)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: 'بنتو مدرن شبکه‌ای (Bento Grid)', desc: 'چیدمان کارتی مدرن با کارت‌های پوستر چندوجهی', layout: 'bento' },
                { name: 'پانورامای سینمایی عریض (Wide Banner)', desc: 'بنر افقی عریض با تصویر پس‌زمینه کامل', layout: 'wide' },
                { name: 'مینیمال سنترال (Clean Centered)', desc: 'تایپوگرافی تمیز با تمرکز روی دکمه‌های اقدام سریع', layout: 'wide' },
              ].map((hp, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setFormState(prev => ({ ...prev, heroLayout: hp.layout as any }));
                    applyPresetNotice(`چیدمان «${hp.name}» اعمال شد`);
                  }}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer shadow-2xs space-y-1 ${
                    (formState.heroLayout || 'bento') === hp.layout
                      ? 'bg-[#FF3366]/5 border-[#FF3366] text-[#FF3366]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  <span className="font-bold text-xs block">{hp.name}</span>
                  <p className="text-[11px] text-slate-500 leading-snug">{hp.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Mockup Browser Window Preview */}
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              </div>
              <div className="text-[11px] text-slate-500 font-mono">Hero Stage Live View</div>
              <div className="text-[11px] text-slate-400 font-mono">{viewportMode}</div>
            </div>

            <div className={`p-6 sm:p-10 flex items-center justify-center ${
              previewTheme === 'dark' ? 'bg-[#080A12]' : 'bg-slate-100'
            }`}>
              <div className={`w-full transition-all duration-300 ${viewportMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'}`}>
                {/* Hero Mockup Card */}
                <div className={`p-6 sm:p-10 rounded-3xl border relative overflow-hidden flex flex-col justify-end min-h-[260px] shadow-2xl ${
                  previewTheme === 'dark' ? 'bg-[#0F1424] border-white/10 text-white' : 'bg-slate-900 border-slate-800 text-white'
                }`}>
                  {formState.heroBgUrl ? (
                    <img
                      src={formState.heroBgUrl}
                      alt="Hero Bg"
                      className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#FF3366]/20 via-[#8B5CF6]/10 to-transparent" />
                  )}

                  <div className="relative z-10 space-y-3 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF3366] animate-ping" />
                      <span className="text-[11px] font-bold text-[#FF884D]">
                        چیدمان انتخابی: {formState.heroLayout === 'wide' ? 'عریض پانوراما' : 'بنتو مدرن (Bento)'}
                      </span>
                    </div>

                    <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight">
                      {formState.heroTitle || 'پلتفرم کشف و رزرو رویدادهای هنری'}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-lg">
                      {formState.heroSubtitle || 'جدیدترین نمایش‌ها، گالری‌ها و کنسرت‌های برگزیده را کشف و تجربه کنید.'}
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <button type="button" className="py-2.5 px-6 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white text-xs font-black shadow-md cursor-pointer">
                        رزرو سریع بلیت
                      </button>
                      <button type="button" className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 cursor-pointer backdrop-blur-md">
                        مشاهده برنامه سالن‌ها
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Settings */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FF3366]/10 text-[#FF3366] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">تنظیمات محتوا و چیدمان بنر اصلی هدر</h4>
                  <p className="text-[11px] text-slate-500">تیتر، زیرعنوان، پس‌زمینه و حالت نمایش</p>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.heroBannerActive !== false}
                  onChange={(e) => setFormState({ ...formState, heroBannerActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF3366]"
                />
                <span>فعال بودن اسلایدر اصلی</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">سبک چیدمان اسلایدر اصلی (Layout)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormState({ ...formState, heroLayout: 'bento' })}
                    className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      (formState.heroLayout || 'bento') === 'bento'
                        ? 'bg-[#FF3366]/10 border-[#FF3366] text-[#FF3366]'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    بنتو گرید چندبخشی
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormState({ ...formState, heroLayout: 'wide' })}
                    className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      formState.heroLayout === 'wide'
                        ? 'bg-[#FF3366]/10 border-[#FF3366] text-[#FF3366]'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    عریض پانورامیک
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">آدرس تصویر پس‌زمینه (URL)</label>
                <input
                  type="text"
                  value={formState.heroBgUrl || ''}
                  onChange={(e) => setFormState({ ...formState, heroBgUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">تیتر اصلی هدر</label>
                <input
                  type="text"
                  value={formState.heroTitle || ''}
                  onChange={(e) => setFormState({ ...formState, heroTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">زیرتیتر توضیحی</label>
                <textarea
                  rows={2}
                  value={formState.heroSubtitle || ''}
                  onChange={(e) => setFormState({ ...formState, heroSubtitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. INTRO BOX */}
      {/* ======================================================== */}
      {activeSubTab === 'intro' && (
        <div className="space-y-6">
          {/* Intro Box Presets */}
          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-[#FF3366]" />
              <span>استایل‌های آماده باکس معرفی (Intro Box Presets)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {INTRO_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    setFormState(prev => ({ ...prev, ...preset.settings }));
                    applyPresetNotice(`استایل «${preset.name}» اعمال شد`);
                  }}
                  className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#FF3366] transition-all cursor-pointer shadow-2xs space-y-1.5 group"
                >
                  <span className="font-bold text-xs text-slate-900 group-hover:text-[#FF3366] transition-colors block">
                    {preset.name}
                  </span>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {preset.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Mockup Preview */}
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">پیش‌نمایش زنده باکس خوش‌آمدگویی</span>
              <span className="text-[11px] text-slate-400 font-mono">Intro Box Preview</span>
            </div>

            <div className={`p-6 sm:p-10 flex items-center justify-center ${
              previewTheme === 'dark' ? 'bg-[#080A12]' : 'bg-slate-100'
            }`}>
              <div className={`w-full transition-all duration-300 ${viewportMode === 'mobile' ? 'max-w-sm' : 'max-w-3xl'}`}>
                <div
                  className="p-6 sm:p-7 border transition-all flex flex-wrap items-center gap-5 shadow-lg"
                  style={{
                    backgroundColor: formState.introBoxBgColor || (previewTheme === 'dark' ? 'rgba(255, 51, 102, 0.1)' : '#FFF1F2'),
                    borderColor: formState.introBoxBorderColor || '#FDA4AF',
                    borderRadius: formState.introBoxRadius || '1.5rem',
                    color: formState.introBoxTextColor || (previewTheme === 'dark' ? '#FFFFFF' : '#0F172A'),
                  }}
                >
                  {formState.introBoxLogoUrl && (
                    <img
                      src={formState.introBoxLogoUrl}
                      alt="Intro Logo"
                      style={{
                        width: formState.introBoxLogoSize || '80px',
                        height: formState.introBoxLogoSize || '80px',
                        borderRadius: formState.introBoxLogoRadius || '100%',
                      }}
                      className="object-cover shrink-0 border border-white/20 shadow-md"
                    />
                  )}
                  <div className="space-y-1.5 flex-1 min-w-[200px]">
                    <span className="text-[10px] font-bold text-[#FF3366] uppercase tracking-wider block">
                      پیام خوش‌آمدگویی اختصاصی
                    </span>
                    <h4 className="font-display font-black text-lg sm:text-xl">
                      {formState.introBoxTitle || 'به آرتیکت، پلتفرم رسمی رویدادهای هنری خوش آمدید'}
                    </h4>
                    <p className="text-xs leading-relaxed opacity-85">
                      {formState.introBoxDescription || 'در اینجا می‌توانید جدیدترین و محبوب‌ترین رویدادهای هنری را مشاهده کرده و بلیت خود را رزرو کنید.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Settings */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">پیکربندی باکس معرفی (Intro Box)</h4>
                  <p className="text-[11px] text-slate-500">متن خوش‌آمد، تصویر نشان و رنگ کادر</p>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.introBoxEnabled !== false}
                  onChange={(e) => setFormState({ ...formState, introBoxEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF3366]"
                />
                <span>فعال بودن باکس معرفی</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">عنوان پیام خوش‌آمد</label>
                <input
                  type="text"
                  value={formState.introBoxTitle || ''}
                  onChange={(e) => setFormState({ ...formState, introBoxTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">متن پیام معرفی</label>
                <textarea
                  rows={2}
                  value={formState.introBoxDescription || ''}
                  onChange={(e) => setFormState({ ...formState, introBoxDescription: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">آدرس تصویر نشان باکس (URL)</label>
                <input
                  type="text"
                  value={formState.introBoxLogoUrl || ''}
                  onChange={(e) => setFormState({ ...formState, introBoxLogoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">رنگ پس‌زمینه کارت</label>
                <input
                  type="text"
                  value={formState.introBoxBgColor || 'rgba(255, 51, 102, 0.1)'}
                  onChange={(e) => setFormState({ ...formState, introBoxBgColor: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">انحنای گوشه‌ها (Border Radius)</label>
                <input
                  type="text"
                  value={formState.introBoxRadius || '1.5rem'}
                  onChange={(e) => setFormState({ ...formState, introBoxRadius: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SEARCH BOX */}
      {/* ======================================================== */}
      {activeSubTab === 'search' && (
        <div className="space-y-6">
          {/* Search Box Presets */}
          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-[#FF3366]" />
              <span>استایل‌های آماده کادر جستجو (Search Box Presets)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SEARCH_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    setFormState(prev => ({ ...prev, ...preset.settings }));
                    applyPresetNotice(`استایل «${preset.name}» اعمال شد`);
                  }}
                  className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#FF3366] transition-all cursor-pointer shadow-2xs space-y-1.5 group"
                >
                  <span className="font-bold text-xs text-slate-900 group-hover:text-[#FF3366] transition-colors block">
                    {preset.name}
                  </span>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {preset.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">پیش‌نمایش زنده کادر جستجو</span>
              <span className="text-[11px] text-slate-400 font-mono">Search Box Preview</span>
            </div>

            <div className={`p-8 sm:p-12 flex items-center justify-center ${
              previewTheme === 'dark' ? 'bg-[#080A12]' : 'bg-slate-100'
            }`}>
              <div className="w-full max-w-xl space-y-3">
                <div
                  className="p-2 sm:p-2.5 flex items-center gap-3 border shadow-xl transition-all"
                  style={{
                    backgroundColor: formState.searchBgColor || (previewTheme === 'dark' ? '#0A0C13' : '#FFFFFF'),
                    borderColor: formState.searchBorderColor || (previewTheme === 'dark' ? '#242A42' : '#CBD5E1'),
                    borderRadius: formState.searchBorderRadius || '24px',
                  }}
                >
                  <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                  <span className="text-xs text-slate-400 font-medium flex-1 truncate">
                    {formState.searchPlaceholder || 'جستجو در رویدادها، هنرمندان و مکان‌ها...'}
                  </span>
                  <button type="button" className="py-2.5 px-6 rounded-full bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white text-xs font-bold shadow-md">
                    {formState.searchButtonText || 'جستجو'}
                  </button>
                </div>

                {/* Popular Tags under search */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 justify-center">
                  <span>پیشنهادات محبوب:</span>
                  <span className="text-[#FF3366] font-bold">تئاتر شهر</span>
                  <span>•</span>
                  <span className="text-slate-700 dark:text-zinc-300 font-bold">کنسرت همایون شجریان</span>
                  <span>•</span>
                  <span className="text-slate-700 dark:text-zinc-300 font-bold">تالار وحدت</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Settings */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Search className="w-4 h-4 text-blue-500" />
              <span>تنظیمات متون و استایل کادر جستجو</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">متن نگه‌دارنده (Placeholder)</label>
                <input
                  type="text"
                  value={formState.searchPlaceholder || ''}
                  onChange={(e) => setFormState({ ...formState, searchPlaceholder: e.target.value })}
                  placeholder="جستجو در رویدادها..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">متن دکمه جستجو</label>
                <input
                  type="text"
                  value={formState.searchButtonText || ''}
                  onChange={(e) => setFormState({ ...formState, searchButtonText: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">شعاع گوشه‌ها (Border Radius)</label>
                <input
                  type="text"
                  value={formState.searchBorderRadius || '24px'}
                  onChange={(e) => setFormState({ ...formState, searchBorderRadius: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. EVENT CARDS */}
      {/* ======================================================== */}
      {activeSubTab === 'cards' && (
        <div className="space-y-6">
          {/* Card Style Presets */}
          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-[#FF3366]" />
              <span>استایل‌های آماده کارت رویداد (Card Presets)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {CARDS_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    setFormState(prev => ({ ...prev, ...preset.settings }));
                    applyPresetNotice(`استایل «${preset.name}» اعمال شد`);
                  }}
                  className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#FF3366] transition-all cursor-pointer shadow-2xs space-y-1.5 group"
                >
                  <span className="font-bold text-xs text-slate-900 group-hover:text-[#FF3366] transition-colors block">
                    {preset.name}
                  </span>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {preset.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">پیش‌نمایش زنده کارت رویداد هنری</span>
              <span className="text-[11px] text-slate-400 font-mono">Event Card Mockup</span>
            </div>

            <div className={`p-8 sm:p-12 flex items-center justify-center ${
              previewTheme === 'dark' ? 'bg-[#080A12]' : 'bg-slate-100'
            }`}>
              <div
                className="w-80 border overflow-hidden shadow-2xl transition-all"
                style={{
                  backgroundColor: formState.cardBgColor || (previewTheme === 'dark' ? '#0A0C13' : '#FFFFFF'),
                  borderColor: previewTheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                  borderRadius: formState.cardBorderRadius || '20px',
                  color: formState.cardTextColor || (previewTheme === 'dark' ? '#FFFFFF' : '#0F172A'),
                }}
              >
                <div className="relative h-48 bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=600&q=80"
                    alt="Sample Event"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#FF3366] text-white text-[10px] font-bold shadow-md">
                    تئاتر و درام
                  </span>
                  <span className="absolute bottom-3 right-3 text-white text-xs font-bold">
                    کارگردان: دکتر علی رفیعی
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  <h4 className="font-display font-black text-base leading-tight">نمایش هملت در صحنه معاصر</h4>
                  <div className="flex items-center gap-2 text-xs opacity-75">
                    <MapPin className="w-3.5 h-3.5 text-[#FF3366]" />
                    <span>تالار وحدت • سالن اصلی</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/20">
                    <div>
                      <span className="text-[10px] opacity-60 block">قیمت بلیت از</span>
                      <span className="font-sans font-bold text-emerald-500 text-sm">۲۵۰,۰۰۰ تومان</span>
                    </div>
                    <button type="button" className="py-2 px-4 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white text-xs font-bold shadow-xs">
                      انتخاب صندلی
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Settings */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Layers className="w-4 h-4 text-[#FF3366]" />
              <span>شخصی‌سازی کارت‌های رویداد</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">رنگ پس‌زمینه کارت</label>
                <input
                  type="text"
                  value={formState.cardBgColor || '#0A0C13'}
                  onChange={(e) => setFormState({ ...formState, cardBgColor: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">رنگ متن کارت</label>
                <input
                  type="text"
                  value={formState.cardTextColor || '#FFFFFF'}
                  onChange={(e) => setFormState({ ...formState, cardTextColor: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">شعاع گوشه‌ها (Border Radius)</label>
                <input
                  type="text"
                  value={formState.cardBorderRadius || '20px'}
                  onChange={(e) => setFormState({ ...formState, cardBorderRadius: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. CINEMA BANNER & SECOND SLIDER */}
      {/* ======================================================== */}
      {activeSubTab === 'cinema' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">پیش‌نمایش زنده بنر عریض سینمایی</span>
              <span className="text-[11px] text-slate-400 font-mono">Cinema Strip Preview</span>
            </div>

            <div className={`p-8 sm:p-12 flex items-center justify-center ${
              previewTheme === 'dark' ? 'bg-[#080A12]' : 'bg-slate-100'
            }`}>
              <div className="w-full max-w-4xl">
                <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden flex flex-col justify-end min-h-[190px] shadow-2xl ${
                  previewTheme === 'dark' ? 'bg-[#0A0C13] border-white/10 text-white' : 'bg-slate-900 border-slate-800 text-white'
                }`}>
                  <div className="relative z-10 space-y-2">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white text-[10px] font-black inline-block shadow-md">
                      اکران ویژه جشنواره تئاتر فجر
                    </span>
                    <h4 className="font-display font-black text-xl sm:text-2xl text-white">
                      سانس‌های اختصاصی با انتخاب صندلی در سالن اصلی
                    </h4>
                    <p className="text-xs text-zinc-300">
                      رزرو آنلاین بلیت با امکان دانلود آنی نسخه رسمی PDF
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Settings */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Film className="w-4 h-4 text-[#FF3366]" />
              <span>پیکربندی بنرهای سینمایی و ردیف دوم</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer">
                <span className="font-bold text-slate-800">فعال بودن اسلایدر عریض سینمایی</span>
                <input
                  type="checkbox"
                  checked={Boolean(formState.mainSliderActive)}
                  onChange={(e) => setFormState({ ...formState, mainSliderActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF3366]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer">
                <span className="font-bold text-slate-800">فعال بودن ردیف بنرهای دوم</span>
                <input
                  type="checkbox"
                  checked={Boolean(formState.secondSliderActive)}
                  onChange={(e) => setFormState({ ...formState, secondSliderActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF3366]"
                />
              </label>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">ارتفاع اسلایدر دوم</label>
                <input
                  type="text"
                  value={formState.secondSliderHeight || '180px'}
                  onChange={(e) => setFormState({ ...formState, secondSliderHeight: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">انحنای گوشه‌ها (Border Radius)</label>
                <input
                  type="text"
                  value={formState.secondSliderRadius || '1.5rem'}
                  onChange={(e) => setFormState({ ...formState, secondSliderRadius: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[11px] focus:bg-white focus:outline-none"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. CURATOR SECTION */}
      {/* ======================================================== */}
      {activeSubTab === 'curator' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">پیش‌نمایش زنده بخش پیشنهاد کیوریتور</span>
              <span className="text-[11px] text-slate-400 font-mono">Curator Pick</span>
            </div>

            <div className={`p-8 sm:p-12 flex items-center justify-center ${
              previewTheme === 'dark' ? 'bg-[#080A12]' : 'bg-slate-100'
            }`}>
              <div className="w-full max-w-2xl">
                <div className={`p-6 sm:p-8 rounded-3xl border flex items-center gap-5 shadow-2xl ${
                  previewTheme === 'dark' ? 'bg-[#101526] border-white/10 text-white' : 'bg-slate-900 border-slate-800 text-white'
                }`}>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF3366] to-[#F59E0B] p-[2px] shrink-0 shadow-lg">
                    <div className="w-full h-full rounded-[14px] bg-[#0E1220] flex items-center justify-center text-[#FF3366]">
                      <Award className="w-7 h-7" />
                    </div>
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-[#FF884D] block">
                      پیشنهاد ویژه این هفته سردبیر
                    </span>
                    <h4 className="font-display font-black text-lg">تحلیل و بررسی آثار برگزیده تئاتر شهر</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      کیوریتور آرتیکت هر هفته برترین اجراها را از نگاه منتقدان و مخاطبان انتخاب می‌کند.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Settings */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Award className="w-4 h-4 text-amber-500" />
              <span>کنترل بخش کیوریتور</span>
            </h4>

            <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer text-xs">
              <div>
                <span className="font-bold text-slate-900 block">نمایش بخش پیشنهاد سردبیر و کیوریتور</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">نمایش یادداشت و برگزیده‌های هفته در صفحه نخست</span>
              </div>
              <input
                type="checkbox"
                checked={formState.curatorSectionEnabled !== false}
                onChange={(e) => setFormState({ ...formState, curatorSectionEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-[#FF3366]"
              />
            </label>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. FOOTER & COPYRIGHT */}
      {/* ======================================================== */}
      {activeSubTab === 'footer' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">پیش‌نمایش زنده فوتر سایت</span>
              <span className="text-[11px] text-slate-400 font-mono">Footer Preview</span>
            </div>

            <div className={`p-8 sm:p-12 flex items-center justify-center ${
              previewTheme === 'dark' ? 'bg-[#080A12]' : 'bg-slate-100'
            }`}>
              <div className="w-full max-w-4xl">
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 shadow-2xl ${
                  previewTheme === 'dark' ? 'bg-[#06070B] border-white/10 text-white' : 'bg-slate-900 border-slate-800 text-white'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF3366] to-[#F59E0B] flex items-center justify-center text-white font-bold">
                        آرت
                      </div>
                      <span className="font-display font-black text-sm">آرتیکت</span>
                    </div>

                    <div className="flex items-center gap-5 text-xs text-zinc-300">
                      <span className="hover:text-white cursor-pointer">رویدادها</span>
                      <span className="hover:text-white cursor-pointer">سالن‌ها</span>
                      <span className="hover:text-white cursor-pointer">قوانین و استرداد</span>
                      <span className="hover:text-white cursor-pointer">پشتیبانی</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400">
                    {formState.footerText || 'تمامی حقوق مادی و معنوی برای سامانه بلیت الکترونیک آرتیکت محفوظ است.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Settings */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>تنظیمات فوتر و کپی‌رایت</span>
              </h4>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.footerEnabled !== false}
                  onChange={(e) => setFormState({ ...formState, footerEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF3366]"
                />
                <span>فعال بودن فوتر</span>
              </label>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">متن رسمی کپی‌رایت</label>
                <input
                  type="text"
                  value={formState.footerText || ''}
                  onChange={(e) => setFormState({ ...formState, footerText: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. SECTIONS VISIBILITY OVERVIEW */}
      {/* ======================================================== */}
      {activeSubTab === 'sections' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display font-black text-sm text-slate-900">
                  مرکز کنترل یکپارچه بخش‌های صفحه اصلی
                </h4>
                <p className="text-[11px] text-slate-500">
                  هر بخشی که تیک آن را بردارید، بلافاصله از صفحه اصلی سایت برداشته می‌شود.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { key: 'heroBannerActive', label: 'اسلایدر و بنر هدر اصلی (Hero Slider)', desc: 'بنر ابتدایی صفحه اصلی با دکمه رزرو' },
                { key: 'introBoxEnabled', label: 'باکس معرفی و خوش‌آمدگویی (Intro Box)', desc: 'کارت پیام خوش‌آمد و معرفی سامانه' },
                { key: 'featuredEventsEnabled', label: 'رویدادهای منتخب و محبوب', desc: 'اسلایدر افقی پرفروش‌ترین رویدادها' },
                { key: 'categoriesEnabled', label: 'دسته‌بندی‌ها و شهرهای فعال', desc: 'فیلتر سریع تئاتر، کنسرت، گالری و شهرها' },
                { key: 'mainSliderActive', label: 'اسلایدر عریض سینمایی (Cinema Banner)', desc: 'بنر پانوراما در میانه صفحه' },
                { key: 'secondSliderActive', label: 'ردیف بنرهای تبلیغاتی دوم', desc: 'بنرهای تبلیغاتی جشنواره‌ها و اسپانسرها' },
                { key: 'curatorSectionEnabled', label: 'بخش پیشنهاد سردبیر و کیوریتور', desc: 'یادداشت هفتگی و رویداد برگزیده' },
                { key: 'footerEnabled', label: 'بخش پاورقی و فوتر سایت', desc: 'پیوندها، مجوزها و اطلاعات تماس' },
              ].map(({ key, label, desc }) => {
                const isEnabled = Boolean((formState as any)[key] !== false);
                return (
                  <label 
                    key={key} 
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isEnabled 
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950 shadow-2xs' 
                        : 'bg-slate-50 border-slate-200 opacity-60 text-slate-600'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs block text-slate-900">{label}</span>
                      <span className="text-[10px] text-slate-500 block">{desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => setFormState({ ...formState, [key]: e.target.checked })}
                      className="w-5 h-5 rounded text-[#FF3366] cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 10. AUTH & LOGIN / REGISTER PAGE APPEARANCE */}
      {/* ======================================================== */}
      {activeSubTab === 'auth' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-slate-900">
                    ظاهرسازی و متن‌های صفحه ورود و ثبت‌نام
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    شخصی‌سازی کامل متون، پیام‌های راهنما، عناوین تب‌ها، متن دکمه‌ها و تنظیم چیدمان بنر کناری
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">سبک طراحی:</span>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  MINIMALIST LUXURY
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* 1. Main Titles */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <Type className="w-4 h-4 text-[#FF3366]" />
                    <span>عناوین و سربرگ اصلی صفحه</span>
                  </h4>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">عنوان اصلی صفحه (Page Title)</label>
                    <input
                      type="text"
                      value={formState.authPageTitle || ''}
                      onChange={(e) => setFormState({ ...formState, authPageTitle: e.target.value })}
                      placeholder="مثال: ورود به سامانه آرتیکت"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-bold focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">زیرعنوان و توضیحات (Subtitle)</label>
                    <input
                      type="text"
                      value={formState.authPageSubtitle || ''}
                      onChange={(e) => setFormState({ ...formState, authPageSubtitle: e.target.value })}
                      placeholder="مثال: سامانه یکپارچه رزرواسیون و میزبانی رویدادهای هنری"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. Tabs & Buttons Labels */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#FF3366]" />
                    <span>عناوین تب‌ها و دکمه‌های اقدام</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">عنوان تب ورود</label>
                      <input
                        type="text"
                        value={formState.authLoginTabTitle || ''}
                        onChange={(e) => setFormState({ ...formState, authLoginTabTitle: e.target.value })}
                        placeholder="ورود به حساب کاربری"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-[#FF3366] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">عنوان تب ثبت‌نام</label>
                      <input
                        type="text"
                        value={formState.authRegisterTabTitle || ''}
                        onChange={(e) => setFormState({ ...formState, authRegisterTabTitle: e.target.value })}
                        placeholder="عضویت و ثبت‌نام سریع"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-[#FF3366] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">متن دکمه ورود</label>
                      <input
                        type="text"
                        value={formState.authSubmitLoginText || ''}
                        onChange={(e) => setFormState({ ...formState, authSubmitLoginText: e.target.value })}
                        placeholder="ورود به حساب کاربری"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-bold focus:border-[#FF3366] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">متن دکمه ثبت‌نام</label>
                      <input
                        type="text"
                        value={formState.authSubmitRegisterText || ''}
                        onChange={(e) => setFormState({ ...formState, authSubmitRegisterText: e.target.value })}
                        placeholder="تکمیل ثبت‌نام"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-bold focus:border-[#FF3366] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Notices & Terms */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>پیام اعلان و قوانین عضویت</span>
                  </h4>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">متن پیام خوش‌آمدگویی یا اطلاعیه هدایت</label>
                    <textarea
                      rows={2}
                      value={formState.authWelcomeNotice || ''}
                      onChange={(e) => setFormState({ ...formState, authWelcomeNotice: e.target.value })}
                      placeholder="برای ایجاد و میزبانی رویداد، داشتن حساب کاربری تاییدشده الزامی است..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-[#FF3366] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">متن تایید قوانین و حریم خصوصی</label>
                    <textarea
                      rows={2}
                      value={formState.authTermsText || ''}
                      onChange={(e) => setFormState({ ...formState, authTermsText: e.target.value })}
                      placeholder="تمامی قوانین و مقررات میزبانی رویداد و حریم خصوصی را می‌پذیرم..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-[#FF3366] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* 4. Side Banner Configuration */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      <Layout className="w-4 h-4 text-blue-600" />
                      <span>پنل و بنر کناری (Side Banner)</span>
                    </h4>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-bold text-slate-700">
                        {formState.authShowSideBanner ? 'نمایش داده شود' : 'مخفی (حالت اولترا مینیمال)'}
                      </span>
                      <input
                        type="checkbox"
                        checked={Boolean(formState.authShowSideBanner)}
                        onChange={(e) => setFormState({ ...formState, authShowSideBanner: e.target.checked })}
                        className="w-4 h-4 rounded text-[#FF3366]"
                      />
                    </label>
                  </div>

                  {formState.authShowSideBanner && (
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">عنوان بنر کناری</label>
                        <input
                          type="text"
                          value={formState.authSideBannerTitle || ''}
                          onChange={(e) => setFormState({ ...formState, authSideBannerTitle: e.target.value })}
                          placeholder="ورود به سامانه رسمی آرتیکت"
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-[#FF3366] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">توضیحات بنر کناری</label>
                        <input
                          type="text"
                          value={formState.authSideBannerSubtitle || ''}
                          onChange={(e) => setFormState({ ...formState, authSideBannerSubtitle: e.target.value })}
                          placeholder="جهت ارسال درخواست میزبانی و دسترسی به بلیت‌ها وارد شوید..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:border-[#FF3366] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Live Preview Mockup (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#FF3366]" />
                    <span>پیش‌نمایش زنده صفحه لاگین</span>
                  </span>
                  <span className="text-[10px] text-slate-400">انطباق آنی با تغییرات</span>
                </div>

                {/* Dark Mockup Card */}
                <div className="p-5 rounded-3xl bg-[#080A12] border border-white/10 text-white shadow-xl space-y-4 font-sans">
                  
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#FF3366] to-[#F59E0B] p-[1px]">
                        <div className="w-full h-full bg-[#0D0F18] rounded-[7px] flex items-center justify-center font-bold text-[10px] text-[#FF3366]">
                          آ
                        </div>
                      </div>
                      <span className="font-bold text-xs">{formState.siteTitle || 'آرتیکت'}</span>
                    </div>
                    <span className="text-[9px] text-zinc-400 px-2 py-0.5 rounded-md bg-white/5">صفحه ورود</span>
                  </div>

                  {/* Mockup Title */}
                  <div className="space-y-0.5 text-center">
                    <h5 className="font-bold text-sm text-white">{formState.authPageTitle || 'ورود به حساب کاربری'}</h5>
                    <p className="text-[10px] text-zinc-400 line-clamp-1">{formState.authPageSubtitle || 'سامانه یکپارچه رزرواسیون'}</p>
                  </div>

                  {/* Mockup Tabs */}
                  <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 text-[10px]">
                    <div className="flex-1 py-1.5 rounded-lg bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white font-bold text-center">
                      {formState.authLoginTabTitle || 'ورود به حساب'}
                    </div>
                    <div className="flex-1 py-1.5 text-zinc-400 font-bold text-center">
                      {formState.authRegisterTabTitle || 'ثبت‌نام جدید'}
                    </div>
                  </div>

                  {/* Mockup Inputs */}
                  <div className="space-y-2 text-[11px]">
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-400">شماره همراه / کدملی:</span>
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-500 font-mono text-[10px]">
                        ۰۹۱۲۳۴۵۶۷۸۹
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-400">کلمه عبور:</span>
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-500 font-mono text-[10px]">
                        ••••••••
                      </div>
                    </div>

                    <div className="py-2.5 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white font-black text-center text-xs shadow-md">
                      {formState.authSubmitLoginText || 'ورود به حساب کاربری'}
                    </div>
                  </div>

                  {/* Mockup Notice */}
                  {formState.authWelcomeNotice && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] leading-relaxed">
                      {formState.authWelcomeNotice}
                    </div>
                  )}

                  {/* Mockup Footer */}
                  <div className="text-center pt-1 text-[9px] text-zinc-500 border-t border-white/5">
                    حقوق برای سامانه {formState.siteTitle || 'آرتیکت'} محفوظ است
                  </div>

                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <span className="font-bold block text-slate-800">💡 نکته طراحی مینیمال:</span>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    برای تجربه حداکثر سادگی و تمیزی، گزینه «نمایش بنر کناری» را در حالت غیرفعال نگه دارید تا کارت ورود به صورت متمرکز و چشم‌نواز در مرکز صفحه نمایش یابد.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. CREATOR & PRODUCER SECTION CUSTOMIZATION */}
      {/* ======================================================== */}
      {activeSubTab === 'creator' && (

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 cols: Edit Controls */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Main Toggle Card */}
              <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        نمایش باکس صاحبان آثار در صفحه اصلی
                      </h4>
                      <p className="text-xs text-slate-400">
                        فعال یا غیرفعال‌سازی کل بخش میزبانی رویداد برای تهیه‌کنندگان و هنرمندان
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.creatorSectionEnabled !== false}
                      onChange={(e) => setFormState({ ...formState, creatorSectionEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF3366]"></div>
                  </label>
                </div>

                {/* Badge and Titles */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-xs text-slate-700 block">
                      متن برچسب (Badge) بالای باکس:
                    </label>
                    <input
                      type="text"
                      value={formState.creatorSectionBadge || ''}
                      onChange={(e) => setFormState({ ...formState, creatorSectionBadge: e.target.value })}
                      placeholder="ویژه برگزارکنندگان، تهیه‌کنندگان و هنرمندان"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#FF3366] focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-xs text-slate-700 block">
                      عنوان اصلی باکس میزبانی:
                    </label>
                    <input
                      type="text"
                      value={formState.creatorSectionTitle || ''}
                      onChange={(e) => setFormState({ ...formState, creatorSectionTitle: e.target.value })}
                      placeholder="میزبانی و فروش بلیت آثار هنری شما در آرتیکت"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold focus:border-[#FF3366] focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-xs text-slate-700 block">
                      توضیح زیر عنوان (متن پاراگراف معرفی):
                    </label>
                    <textarea
                      rows={3}
                      value={formState.creatorSectionSubtitle || ''}
                      onChange={(e) => setFormState({ ...formState, creatorSectionSubtitle: e.target.value })}
                      placeholder="اگر پدیدآورنده، تهیه‌کننده یا صاحب سالن هستید، رویداد خود را با زیرساخت پیشرفته گیشه..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed focus:border-[#FF3366] focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Action Button Texts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="font-bold text-xs text-slate-700 block">
                      متن دکمه ثبت رویداد:
                    </label>
                    <input
                      type="text"
                      value={formState.creatorSectionButtonText || ''}
                      onChange={(e) => setFormState({ ...formState, creatorSectionButtonText: e.target.value })}
                      placeholder="ثبت و ارسال طرح رویداد"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold focus:border-[#FF3366] focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-xs text-slate-700 block">
                      متن زیر دکمه (Micro-copy):
                    </label>
                    <input
                      type="text"
                      value={formState.creatorSectionButtonSubtitle || ''}
                      onChange={(e) => setFormState({ ...formState, creatorSectionButtonSubtitle: e.target.value })}
                      placeholder="بررسی کمتر از ۲۴ ساعت و فعال‌سازی رایگان گیشه"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#FF3366] focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* 4 Cards Customization */}
              <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#FF3366]" />
                  <h4 className="font-bold text-sm text-slate-900">
                    شخصی‌سازی عناوین و توضیحات ۴ مزیت میزبانی
                  </h4>
                </div>

                <div className="space-y-4">
                  {/* Card 1 */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <span className="font-bold text-xs text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>کارت ۱: تسویه مالی</span>
                    </span>
                    <input
                      type="text"
                      value={formState.creatorSectionCard1Title || ''}
                      onChange={(e) => setFormState({ ...formState, creatorSectionCard1Title: e.target.value })}
                      placeholder="عنوان: تسویه حساب منظم و آنی"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#FF3366]"
                    />
                    <textarea
                      rows={2}
                      value={formState.creatorSectionCard1Desc || ''}
                      onChange={(e) => setFormState({ ...formState, creatorSectionCard1Desc: e.target.value })}
                      placeholder="توضیح کارت..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#FF3366]"
                    />
                  </div>

                  {/* Card 2 */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <span className="font-bold text-xs text-blue-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>کارت ۲: گیت و اسکنر</span>
                    </span>
                    <input
                      type="text"
                      value={formState.creatorSectionCard2Title || ''}
                      onChange={(e) => setFormState({ ...formState, creatorSectionCard2Title: e.target.value })}
                      placeholder="عنوان: سامانه هوشمند گیت و اسکنر"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#FF3366]"
                    />
                    <textarea
                      rows={2}
                      value={formState.creatorSectionCard2Desc || ''}
                      onChange={(e) => setFormState({ ...formState, creatorSectionCard2Desc: e.target.value })}
                      placeholder="توضیح کارت..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#FF3366]"
                    />
                  </div>

                  {/* Card 3 */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <span className="font-bold text-xs text-purple-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>کارت ۳: آمار و گزارش‌ها</span>
                    </span>
                    <input
                      type="text"
                      value={formState.creatorSectionCard3Title || ''}
                      onChange={(e) => setFormState({ ...formState, creatorSectionCard3Title: e.target.value })}
                      placeholder="عنوان: گزارش‌ها و آمار لحظه‌ای"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#FF3366]"
                    />
                    <textarea
                      rows={2}
                      value={formState.creatorSectionCard3Desc || ''}
                      onChange={(e) => setFormState({ ...formState, creatorSectionCard3Desc: e.target.value })}
                      placeholder="توضیح کارت..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#FF3366]"
                    />
                  </div>

                  {/* Card 4 */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <span className="font-bold text-xs text-amber-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>کارت ۴: پشتیبانی گیشه</span>
                    </span>
                    <input
                      type="text"
                      value={formState.creatorSectionCard4Title || ''}
                      onChange={(e) => setFormState({ ...formState, creatorSectionCard4Title: e.target.value })}
                      placeholder="عنوان: پشتیبانی اختصاصی گیشه"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#FF3366]"
                    />
                    <textarea
                      rows={2}
                      value={formState.creatorSectionCard4Desc || ''}
                      onChange={(e) => setFormState({ ...formState, creatorSectionCard4Desc: e.target.value })}
                      placeholder="توضیح کارت..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#FF3366]"
                    />
                  </div>

                  {/* Card 5: Test / Sandbox before submit */}
                  <div className="p-4 rounded-2xl border border-rose-200/80 bg-rose-50/40 space-y-3">
                    <span className="font-bold text-xs text-rose-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>کارت ۵: امکان تست آزمایشی قبل از درخواست</span>
                    </span>
                    <input
                      type="text"
                      value={formState.creatorSectionCard5Title || ''}
                      onChange={(e) => setFormState({ ...formState, creatorSectionCard5Title: e.target.value })}
                      placeholder="عنوان: امکان تست آزمایشی قبل از ثبت"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#FF3366]"
                    />
                    <textarea
                      rows={2}
                      value={formState.creatorSectionCard5Desc || ''}
                      onChange={(e) => setFormState({ ...formState, creatorSectionCard5Desc: e.target.value })}
                      placeholder="توضیح: امکان تست کامل و رایگان محیط گیشه قبل از ارسال نهایی طرح..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#FF3366]"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right 5 cols: Live Mockup Preview */}
            <div className="lg:col-span-5 sticky top-36 space-y-4">
              <div className="p-4 rounded-3xl border border-slate-200 bg-slate-900 text-white shadow-xl space-y-4">
                
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-bold text-xs text-slate-300 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#FF3366]" />
                    <span>پیش‌نمایش زنده در صفحه اصلی</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                    {formState.creatorSectionEnabled !== false ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>

                {/* Render Mini Mockup */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#11162B] to-[#0A0C16] border border-white/10 space-y-3 text-right">
                  
                  {/* Badge & Title */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold text-white border border-white/15">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3366] animate-ping" />
                      <Sparkles className="w-2.5 h-2.5 text-[#FF3366]" />
                      <span>{formState.creatorSectionBadge || 'ویژه برگزارکنندگان'}</span>
                    </span>

                    <h4 className="font-display font-black text-xs text-white flex items-center gap-1">
                      <span>{formState.creatorSectionTitle || 'میزبانی و فروش بلیت آثار هنری شما'}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-[#FF3366] to-[#F59E0B] animate-pulse" />
                    </h4>
                  </div>


                  {/* Subtitle */}
                  <p className="text-[10px] text-zinc-300 leading-snug line-clamp-1">
                    {formState.creatorSectionSubtitle || 'رویداد خود را با زیرساخت پیشرفته گیشه، اسکنر اختصاصی و تسویه آنی عرضه کنید.'}
                  </p>

                  {/* Mini Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] text-zinc-300">
                      ⚡ {formState.creatorSectionCard1Title || 'تسویه حساب آنی'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] text-zinc-300">
                      📲 {formState.creatorSectionCard2Title || 'سامانه گیت و اسکنر'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] text-zinc-300">
                      📊 {formState.creatorSectionCard3Title || 'گزارش و آمار زنده'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] text-zinc-300">
                      🛡️ {formState.creatorSectionCard4Title || 'پشتیبانی اختصاصی'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-[9px] text-rose-300 font-bold">
                      🧪 {formState.creatorSectionCard5Title || 'امکان تست آزمایشی قبل از ثبت'}
                    </span>
                  </div>


                  {/* CTA Button */}
                  <div className="pt-2">
                    <div className="py-2 px-3 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white font-bold text-[11px] text-center shadow-md">
                      {formState.creatorSectionButtonText || 'ثبت و ارسال طرح رویداد'}
                    </div>
                  </div>

                </div>


                <div className="text-center pt-2">
                  <p className="text-[11px] text-zinc-400">
                    برای ذخیره تغییرات روی دکمه «ذخیره تغییرات» در بالای استودیو کلیک کنید.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}


      {/* Modern Logo Image Editor Modal */}
      {isLogoModalOpen && (
        <LogoImageEditorModal
          currentLogoUrl={formState.headerLogoUrl}
          onSave={(croppedUrl) => {
            setFormState({
              ...formState,
              headerLogoUrl: croppedUrl,
              headerShowLogo: true,
            });
          }}
          onClose={() => setIsLogoModalOpen(false)}
        />
      )}
    </div>
  );
};
