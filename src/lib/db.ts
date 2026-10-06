import { ArtEvent, Coupon, Venue, PurchasedTicket, SiteUser, AdminOrganizer, EventProposal, ProposalDocument, LegalHostingRuleItem, EventReview } from '../types';
import { FEATURED_ART_EVENTS } from '../data/mockEvents';

export const EVENTS_COLLECTION = 'events';
export const SETTINGS_COLLECTION = 'settings';
export const USERS_COLLECTION = 'site_users';
export const ADMINS_COLLECTION = 'admin_organizers';
export const PROPOSALS_COLLECTION = 'event_proposals';
export const REVIEWS_COLLECTION = 'event_reviews';

// Helper to get from localstorage safely
const getLS = <T = any>(key: string): T | null => {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data) as T;
    } catch (e) {
      return null;
    }
  }
  return null;
};

const setLS = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Fetch all events
export const fetchEvents = async (): Promise<ArtEvent[]> => {
  let events = getLS(EVENTS_COLLECTION);
  if (!events || !Array.isArray(events) || events.length === 0) {
    events = [...FEATURED_ART_EVENTS];
    setLS(EVENTS_COLLECTION, events);
  } else {
    // If existing cached items lack enriched properties, merge from FEATURED_ART_EVENTS
    let updated = false;
    events = events.map((ev: ArtEvent) => {
      const defaultEv = FEATURED_ART_EVENTS.find(d => d.id === ev.id);
      if (defaultEv) {
        if (!ev.castAndCrew || !ev.specs || !ev.wideBannerUrl) {
          updated = true;
          return {
            ...defaultEv,
            ...ev,
            castAndCrew: ev.castAndCrew || defaultEv.castAndCrew,
            specs: ev.specs || defaultEv.specs,
            wideBannerUrl: ev.wideBannerUrl || defaultEv.wideBannerUrl,
            galleryImages: (ev.galleryImages && ev.galleryImages.length > 2) ? ev.galleryImages : defaultEv.galleryImages,
          };
        }
      }
      return ev;
    });
    const seen = new Set<string>();
    events = events.filter((ev: ArtEvent) => {
      if (!ev || !ev.id || seen.has(ev.id)) return false;
      seen.add(ev.id);
      return true;
    });
    if (updated) {
      setLS(EVENTS_COLLECTION, events);
    }
  }
  return events;
};

// Add or Update Event
export const saveEvent = async (event: Partial<ArtEvent> & { id?: string }) => {
  const events = await fetchEvents();
  if (event.id) {
    const idx = events.findIndex(e => e.id === event.id);
    if (idx !== -1) {
      events[idx] = { ...events[idx], ...event } as ArtEvent;
    } else {
      events.push(event as ArtEvent);
    }
    setLS(EVENTS_COLLECTION, events);
    return event.id;
  } else {
    const newId = 'evt-' + Math.random().toString(36).substr(2, 9);
    event.id = newId;
    events.push(event as ArtEvent);
    setLS(EVENTS_COLLECTION, events);
    return newId;
  }
};

// Delete Event
export const deleteEvent = async (id: string) => {
  let events = await fetchEvents();
  events = events.filter(e => e.id !== id);
  setLS(EVENTS_COLLECTION, events);
};

// Site Settings
export interface MenuLink {
  id: string;
  title: string;
  url: string;
}

export interface SecondBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
}

const SECOND_BANNERS_COLLECTION = 'artis_second_banners';

export const fetchSecondBanners = async (): Promise<SecondBanner[]> => {
  const banners = getLS(SECOND_BANNERS_COLLECTION);
  if (banners) return banners;
  // Default dummy second banners
  return [
    {
      id: 'sb-1',
      title: 'پیشنهاد ویژه این هفته',
      subtitle: '۲۰٪ تخفیف برای تئاترهای منتخب',
      imageUrl: 'https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
      order: 1
    },
    {
      id: 'sb-2',
      title: 'گالری‌های تابستانی',
      subtitle: 'کشف آثار هنرمندان جوان',
      imageUrl: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
      order: 2
    }
  ];
};

export const saveSecondBanner = async (banner: Partial<SecondBanner> & { id?: string }) => {
  const banners = await fetchSecondBanners();
  if (banner.id) {
    const idx = banners.findIndex(b => b.id === banner.id);
    if (idx !== -1) {
      banners[idx] = { ...banners[idx], ...banner } as SecondBanner;
    } else {
      banners.push(banner as SecondBanner);
    }
    setLS(SECOND_BANNERS_COLLECTION, banners);
    return banner.id;
  } else {
    const newId = 'sb-' + Math.random().toString(36).substr(2, 9);
    banner.id = newId;
    banner.order = banners.length;
    banners.push(banner as SecondBanner);
    setLS(SECOND_BANNERS_COLLECTION, banners);
    return newId;
  }
};

export const deleteSecondBanner = async (id: string) => {
  let banners = await fetchSecondBanners();
  banners = banners.filter(b => b.id !== id);
  setLS(SECOND_BANNERS_COLLECTION, banners);
};

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText?: string;
  buttonUrl?: string;
  layout?: 'cinematic' | 'split' | 'modern';
  overlayOpacity?: number;
  textAlignment?: 'right' | 'center' | 'left';
  imagePosition?: 'right' | 'left';
  isActive: boolean;
  order: number;
}

export const BANNERS_COLLECTION = 'hero_banners';

const DEFAULT_BANNERS: HeroBanner[] = [
  {
    id: 'bnr-cinematic1',
    title: 'جشنواره فیلم‌های مستقل',
    subtitle: 'تجربه تماشای برترین آثار سینمای مستقل جهان در فضایی بی‌نظیر و کلاسیک. همراه با نشست‌های نقد و بررسی.',
    imageUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=2000',
    buttonText: 'تهیه بلیت جشنواره',
    buttonUrl: '#',
    layout: 'cinematic',
    isActive: true,
    order: 0
  },
  {
    id: 'bnr-split1',
    title: 'نمایشگاه هنر مدرن خاورمیانه',
    subtitle: 'آثار برجسته هنرمندان معاصر در گالری هنرهای تجسمی. به همراه نشست‌های تخصصی با حضور هنرمندان و منتقدان بین‌المللی.',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&q=80&w=1000',
    buttonText: 'اطلاعات بیشتر',
    buttonUrl: '#',
    layout: 'split',
    isActive: true,
    order: 1
  },
  {
    id: 'bnr-modern1',
    title: 'کنسرت الکترونیک: شب‌های نئون',
    subtitle: 'غرق در موسیقی و نور. یک تجربه صوتی و تصویری تکرارنشدنی با برترین دی‌جی‌های بین‌المللی و جلوه‌های بصری خیره‌کننده.',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=2000',
    buttonText: 'رزرو وی‌آی‌پی',
    buttonUrl: '#',
    layout: 'modern',
    isActive: true,
    order: 2
  }
];

export const fetchBanners = async (): Promise<HeroBanner[]> => {
  const existing = getLS(BANNERS_COLLECTION);
  if (!existing || existing.length === 0) {
    setLS(BANNERS_COLLECTION, DEFAULT_BANNERS);
    return DEFAULT_BANNERS;
  }
  return existing;
};

export const saveBanner = async (banner: Partial<HeroBanner> & { id?: string }) => {
  const banners = await fetchBanners();
  if (banner.id) {
    const idx = banners.findIndex(b => b.id === banner.id);
    if (idx !== -1) {
      banners[idx] = { ...banners[idx], ...banner } as HeroBanner;
    } else {
      banners.push(banner as HeroBanner);
    }
  } else {
    banner.id = 'bnr-' + Math.random().toString(36).substr(2, 9);
    banner.order = banners.length;
    banners.push(banner as HeroBanner);
  }
  setLS(BANNERS_COLLECTION, banners);
  return banner.id;
};

export const deleteBanner = async (id: string) => {
  let banners = await fetchBanners();
  banners = banners.filter(b => b.id !== id);
  setLS(BANNERS_COLLECTION, banners);
};

export interface SiteSettings {
  siteTitle: string;
  brandName?: string;
  siteSlogan?: string;
  supportPhone?: string;
  supportEmail?: string;
  paymentGateway?: 'shaparak' | 'zarinpal' | 'saman';
  gatewayMode?: 'live' | 'test';
  currency?: string;
  primaryAccent?: string;
  enableTicketDownload?: boolean;
  enableSeatSelection?: boolean;
  smsNotificationEnabled?: boolean;

  heroBannerActive: boolean;
  featuredEventsEnabled: boolean;
  categoriesEnabled: boolean;
  curatorSectionEnabled: boolean;
  footerEnabled: boolean;

  // Header/Navbar
  headerLogoUrl?: string;
  headerLogoTitle?: string;
  headerLogoSubtitle?: string;
  headerShowTextNextToLogo?: boolean;
  headerShowLogo?: boolean;
  headerLogoHeight?: number;
  headerLogoRadius?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  headerMenuLinks?: MenuLink[];
  headerBorderColor?: string;
  headerBorderRadius?: string;

  // Intro Box Settings
  introBoxEnabled?: boolean;
  introBoxLogoUrl?: string;
  introBoxLogoSize?: string;
  introBoxLogoRadius?: string;
  introBoxTitle?: string;
  introBoxDescription?: string;
  introBoxBgColor?: string;
  introBoxTextColor?: string;
  introBoxBorderColor?: string;
  introBoxRadius?: string;

  // Main Slider (Featured Cinema Banner) Settings
  mainSliderActive?: boolean;
  mainSliderBgColor?: string;
  mainSliderBorderColor?: string;
  mainSliderEventIds?: string[];

  // Second Slider Settings
  secondSliderActive?: boolean;
  secondSliderBgColor?: string;
  secondSliderRadius?: string;
  secondSliderHeight?: string;
  secondSliderTextColor?: string;

  // Hero Banner Layout & Content
  heroLayout?: 'bento' | 'wide';
  heroTitle?: string;
  heroSubtitle?: string;
  heroBgUrl?: string;

  // Search Box
  searchPlaceholder?: string;
  searchButtonText?: string;
  searchBgColor?: string;
  searchBorderColor?: string;
  searchBorderRadius?: string;

  // Event Cards
  cardBgColor?: string;
  cardTextColor?: string;
  cardBorderRadius?: string;

  // Footer
  footerLogoUrl?: string;
  footerText?: string;
  footerBgColor?: string;
  footerTextColor?: string;
  footerMenuLinks?: MenuLink[];
  footerBorderColor?: string;

  // Event Hosting Terms & Legal Policies (قابل ویرایش و شخصی‌سازی در پنل مدیریت)
  hostingRulesTitle?: string;
  hostingRulesSubtitle?: string;
  hostingRulesItems?: LegalHostingRuleItem[];
  hostingCommissionRate?: number;
  hostingRequiresErshadLicense?: boolean;
  hostingRequiresAmakenPermit?: boolean;
  hostingRequiresVenueContract?: boolean;

  // Creator & Producer Box (باکس میزبانی و ایجاد رویداد ویژه صاحبان آثار)
  creatorSectionEnabled?: boolean;
  creatorSectionBadge?: string;
  creatorSectionTitle?: string;
  creatorSectionSubtitle?: string;
  creatorSectionButtonText?: string;
  creatorSectionButtonSubtitle?: string;
  creatorSectionCard1Title?: string;
  creatorSectionCard1Desc?: string;
  creatorSectionCard2Title?: string;
  creatorSectionCard2Desc?: string;
  creatorSectionCard3Title?: string;
  creatorSectionCard3Desc?: string;
  creatorSectionCard4Title?: string;
  creatorSectionCard4Desc?: string;
  creatorSectionCard5Title?: string;
  creatorSectionCard5Desc?: string;

  // Auth / Login & Register Page Appearance (شخصی‌سازی صفحه ورود و ثبت‌نام در پنل ادمین)
  authPageTitle?: string;
  authPageSubtitle?: string;
  authLoginTabTitle?: string;
  authRegisterTabTitle?: string;
  authSubmitLoginText?: string;
  authSubmitRegisterText?: string;
  authWelcomeNotice?: string;
  authTermsText?: string;
  authShowSideBanner?: boolean;
  authSideBannerTitle?: string;
  authSideBannerSubtitle?: string;
  authCardBgColor?: string;
  authCardBorderColor?: string;
}


export const defaultSettings: SiteSettings = {
  siteTitle: 'آرتیکت',
  brandName: 'آرتیکت',
  siteSlogan: 'سامانه هوشمند کشف و رزرو رسمی بلیت رویدادهای هنری',
  supportPhone: '۰۲۱-۸۸۲۹۰۰۰۰',
  supportEmail: 'support@articket.ir',
  paymentGateway: 'shaparak',
  gatewayMode: 'live',
  currency: 'تومان',
  primaryAccent: '#FF3366',
  enableTicketDownload: true,
  enableSeatSelection: true,
  smsNotificationEnabled: true,

  heroBannerActive: true,
  heroLayout: 'bento',
  featuredEventsEnabled: true,
  categoriesEnabled: true,
  curatorSectionEnabled: true,
  footerEnabled: true,
  
  introBoxEnabled: true,
  introBoxTitle: 'به آرتیکت، پلتفرم رسمی رویدادهای هنری خوش آمدید',
  introBoxDescription: 'در اینجا می‌توانید جدیدترین و محبوب‌ترین رویدادهای هنری، تئاتر، کنسرت و گالری‌ها را مشاهده کرده و بلیت خود را به سادگی رزرو کنید.',
  introBoxLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=256&h=256&auto=format&fit=crop',
  introBoxLogoRadius: '100%',
  introBoxLogoSize: '100px',
  introBoxBgColor: 'rgba(255, 51, 102, 0.1)',
  introBoxBorderColor: 'rgba(255, 51, 102, 0.3)',
  introBoxTextColor: '#ffffff',
  introBoxRadius: '1.5rem',
  
  mainSliderActive: false,
  mainSliderBgColor: '#0A0C13',
  mainSliderBorderColor: '#2B314B',
  mainSliderEventIds: [],

  secondSliderActive: false,
  secondSliderBgColor: '#0A0C13',
  secondSliderRadius: '1.5rem',
  secondSliderHeight: '180px',
  secondSliderTextColor: '#ffffff',

  headerLogoUrl: '',
  headerLogoTitle: 'آرتیکت',
  headerLogoSubtitle: 'پلتفرم کشف و رزرو رویدادهای هنری',
  headerShowTextNextToLogo: true,
  headerShowLogo: true,
  headerLogoHeight: 44,
  headerLogoRadius: '14px',
  headerBgColor: '#0A0C13',
  headerTextColor: '#FFFFFF',
  headerBorderColor: 'transparent',
  headerBorderRadius: '40px',
  headerMenuLinks: [
    { id: '1', title: 'همه رویدادها', url: 'all' },
    { id: '2', title: 'تئاتر و نمایش', url: 'theater' },
    { id: '3', title: 'موسیقی و کنسرت', url: 'concert' },
    { id: '4', title: 'گالری و تجسمی', url: 'gallery' },
    { id: '5', title: 'هنر تعاملی', url: 'immersive' },
  ],
  
  heroTitle: 'پلتفرم کشف و رزرو رویدادهای هنری',
  heroSubtitle: 'جدیدترین نمایش‌ها، گالری‌ها و کنسرت‌های برگزیده را کشف و تجربه کنید.',
  heroBgUrl: '',
  
  searchPlaceholder: 'جستجو در رویدادها، هنرمندان و مکان‌ها...',
  searchButtonText: 'جستجو',
  searchBgColor: '#0A0C13',
  searchBorderColor: '#242A42',
  searchBorderRadius: '24px',
  
  cardBgColor: '#0A0C13',
  cardTextColor: '#FFFFFF',
  cardBorderRadius: '16px',
  
  footerText: 'تمامی حقوق برای سامانه بلیت الکترونیک آرتیکت محفوظ است.',
  footerBgColor: '#06070B',
  footerTextColor: '#9ca3af',
  footerBorderColor: '#191C2C',
  footerMenuLinks: [
    { id: '1', title: 'درباره ما', url: '#' },
    { id: '2', title: 'تماس با ما', url: '#' },
    { id: '3', title: 'قوانین و مقررات', url: '#' },
  ],

  // Event Hosting Terms & Policies Defaults
  hostingRulesTitle: 'منشور حقوقی، ضوابط و تعهدات میزبانی رویداد در آرتیکت',
  hostingRulesSubtitle: 'مجموعه ضوابط رسمی، الزامات وزارت فرهنگ و ارشاد اسلامی، نظارت اماکن عمومی فراجا، حقوق پدیدآورندگان و تسویه‌حساب گیشه',
  hostingCommissionRate: 85,
  hostingRequiresErshadLicense: true,
  hostingRequiresAmakenPermit: true,
  hostingRequiresVenueContract: true,
  hostingRulesItems: [
    {
      id: 'rule-1',
      title: 'ماده ۱: احراز اصالت مالکیت فکری و حقوق پدیدآورندگان (کپی‌رایت)',
      content: 'تهیه‌کننده یا متقاضی رسماً اقرار و متعهد می‌گردد که کلیه حقوق مادی و معنوی اثر اعم از نمایشنامه، قطعات موسیقی، اشعار، طراحی صحنه و پوستر متعلق به وی بوده یا دارای قرارداد رسمی معتبر واگذاری حق نشر و اجرا از پدیدآورنده می‌باشد. مسئولیت هرگونه ادعای ثالث بر عهده متقاضی است.',
      category: 'legal',
      isRequiredAck: true,
    },
    {
      id: 'rule-2',
      title: 'ماده ۲: اخذ و ارائه مجوز رسمی وزارت فرهنگ و ارشاد اسلامی',
      content: 'بارگذاری پروانه اجرای رسمی و دارای اعتبار زمانی صادره از شورای نظارت و ارزشیابی اداره کل هنرهای نمایشی یا دفتر موسیقی وزارت فرهنگ و ارشاد اسلامی الزامی است. گیشه بلیت‌فروشی تا پیش از رویت و استعلام اصالت این مجوز فعال نخواهد شد.',
      category: 'license',
      isRequiredAck: true,
    },
    {
      id: 'rule-3',
      title: 'ماده ۳: تاییدیه پلیس نظارت بر اماکن عمومی فراجا و امنیت سالن',
      content: 'مطابق مقررات انتظامی کشور، اخذ تاییدیه انتظامی پلیس اماکن برای کلیه کنسرت‌ها، نمایش‌ها و رویدادهای عمومی الزامی است. تهیه‌کننده موظف به رعایت کامل شئونات اسلامی، ظرفیت ایمن سالن و ضوابط ورود و خروج تماشاگران است.',
      category: 'license',
      isRequiredAck: true,
    },
    {
      id: 'rule-4',
      title: 'ماده ۴: قرارداد معتبر رزرو سالن و رعایت ظرفیت مصوب',
      content: 'تهیه‌کننده ملزم به ارائه قرارداد رسمی سالن یا تالار محل برگزاری با ذکر دقیق ظرفیت صندلی‌ها و سانس‌ها می‌باشد. فروش بلیت بدون صندلی، فروش مازاد بر ظرفیت استاندارد مصوب آتش‌نشانی یا ایجاد بازار سیاه پیگرد قانونی دارد.',
      category: 'license',
      isRequiredAck: true,
    },
    {
      id: 'rule-5',
      title: 'ماده ۵: تسویه‌حساب مالی، کارمزد گیشه و ضوابط لغو اجرا (استرداد ۱۰۰٪)',
      content: 'کارمزد خدمات فنی و گیشه آنلاین آرتیکت طبق توافق کسر و مابقی سهم فروش به شبای رسمی تهیه‌کننده واریز می‌گردد. در صورت لغو رویداد به هر علت (فنی، بیماری یا دستور مراجع)، تهیه‌کننده متعهد به استرداد ۱۰۰٪ مبالغ به خریداران در کمترین زمان ممکن می‌باشد.',
      category: 'financial',
      isRequiredAck: true,
    }
  ],

  // Creator Box Defaults (باکس میزبانی و ایجاد رویداد ویژه صاحبان آثار)
  creatorSectionEnabled: true,
  creatorSectionBadge: 'ویژه برگزارکنندگان، تهیه‌کنندگان و هنرمندان',
  creatorSectionTitle: 'میزبانی و فروش بلیت آثار هنری شما در آرتیکت',
  creatorSectionSubtitle: 'اگر پدیدآورنده، تهیه‌کننده یا صاحب سالن هستید، رویداد خود را با زیرساخت پیشرفته گیشه، اسکنر اختصاصی و تسویه آنی به هزاران علاقه‌مند هنر عرضه کنید.',
  creatorSectionButtonText: 'ثبت و ارسال طرح رویداد',
  creatorSectionButtonSubtitle: 'بررسی کمتر از ۲۴ ساعت و فعال‌سازی رایگان',
  creatorSectionCard1Title: 'تسویه حساب منظم و آنی',
  creatorSectionCard1Desc: 'انتقال خودکار درآمدهای حاصل از فروش بلیت به شماره شبای رسمی برگزارکننده',
  creatorSectionCard2Title: 'سامانه هوشمند گیت و اسکنر',
  creatorSectionCard2Desc: 'اعتبارسنجی آنلاین و سریع بارکد بلیت‌ها در درب ورودی سالن بدون نیاز به تجهیزات خاص',
  creatorSectionCard3Title: 'گزارش‌ها و آمار لحظه‌ای',
  creatorSectionCard3Desc: 'داشبورد اختصاصی رصد میزان فروش صندلی‌ها، سانس‌ها و تراکنش‌های مالی',
  creatorSectionCard4Title: 'پشتیبانی اختصاصی گیشه',
  creatorSectionCard4Desc: 'همراهی تیم فروش و امور مشتریان در تمامی مراحل از ثبت تا پایان اجرا',
  creatorSectionCard5Title: 'تست آزمایشی قبل از درخواست',
  creatorSectionCard5Desc: 'امکان تست رایگان عملکرد گیشه و سامانه قبل از ثبت نهایی طرح رویداد',

  // Auth / Login & Register Default Appearance
  authPageTitle: 'ورود به سامانه آرتیکت',
  authPageSubtitle: 'سامانه یکپارچه رزرواسیون، میزبانی و صدور بلیت رویدادهای هنری',
  authLoginTabTitle: 'ورود به حساب کاربری',
  authRegisterTabTitle: 'عضویت و ثبت‌نام سریع',
  authSubmitLoginText: 'ورود به حساب کاربری',
  authSubmitRegisterText: 'تکمیل ثبت‌نام',
  authWelcomeNotice: 'برای ایجاد و میزبانی رویداد، داشتن حساب کاربری تاییدشده الزامی است.',
  authTermsText: 'تمامی قوانین و منشور حقوقی میزبانی رویداد و ضوابط حریم خصوصی آرتیکت را مطالعه نموده و می‌پذیرم.',
  authShowSideBanner: false,
  authSideBannerTitle: 'ورود به سامانه رسمی آرتیکت',
  authSideBannerSubtitle: 'جهت ثبت و ارسال درخواست ایجاد رویداد، پیگیری مجوزها و دسترسی به بلیت‌های خریداری‌شده، لطفاً به حساب خود وارد شوید.',
  authCardBgColor: '#0D101C',
  authCardBorderColor: 'rgba(255, 255, 255, 0.08)',
};


export const fetchSettings = async (): Promise<SiteSettings> => {
  const settings = getLS(SETTINGS_COLLECTION);
  if (settings) {
    return { ...defaultSettings, ...settings };
  }
  return defaultSettings;
};

export const saveSettings = async (settings: SiteSettings) => {
  setLS(SETTINGS_COLLECTION, settings);
};

// ==========================================
// VENUES (سالن‌ها و اماکن برگزاری)
// ==========================================
export const VENUES_COLLECTION = 'articket_venues';

export const DEFAULT_VENUES: Venue[] = [
  {
    id: 'vn-1',
    name: 'تالار وحدت',
    city: 'تهران',
    address: 'خیابان حافظ، پایین‌تر از چهارراه کالج، بلوار استاد شهریار',
    capacity: 750,
    hasSeatedMap: true,
    sections: ['همکف VIP', 'بالکن اول', 'بالکن دوم', 'بالکن سوم'],
    hallCount: 2,
    contactPhone: '۰۲۱-۶۶۷۳۱۴۱۹',
  },
  {
    id: 'vn-2',
    name: 'سالن رویال هال هتل اسپیناس پالاس',
    city: 'تهران',
    address: 'سعادت‌آباد، میدان بهرود، خیابان عابدی، خیابان ۳۳',
    capacity: 2500,
    hasSeatedMap: true,
    sections: ['همکف VIP', 'همکف عادی', 'بالکن اختصاصی'],
    hallCount: 1,
    contactPhone: '۰۲۱-۷۵۶۷۵۰۰۰',
  },
  {
    id: 'vn-3',
    name: 'تئاتر شهر',
    city: 'تهران',
    address: 'تقاطع خیابان انقلاب و ولی‌عصر، پارک دانشجو',
    capacity: 580,
    hasSeatedMap: true,
    sections: ['سالن اصلی', 'سالن چهارسو', 'سالن قشقایی', 'سالن سایه'],
    hallCount: 4,
    contactPhone: '۰۲۱-۶۶۴۶۰۵۹۲',
  },
  {
    id: 'vn-4',
    name: 'سالن همایش‌های برج میلاد',
    city: 'تهران',
    address: 'بزرگراه شهید همت غرب، خروجی برج میلاد',
    capacity: 1600,
    hasSeatedMap: true,
    sections: ['همکف A', 'همکف B', 'بالکن شرقی', 'بالکن غربی'],
    hallCount: 2,
    contactPhone: '۰۲۱-۸۵۸۵',
  },
  {
    id: 'vn-5',
    name: 'خانه هنرمندان ایران',
    city: 'تهران',
    address: 'خیابان طالقانی، خیابان شهید موسوی شمالی، بوستان هنرمندان',
    capacity: 350,
    hasSeatedMap: false,
    sections: ['نگارخانه ممیز', 'نگارخانه زمستان', 'تماشاخانه ایران‌شهر'],
    hallCount: 5,
    contactPhone: '۰۲۱-۸۸۳۱۰۴۶۳',
  },
];

export const fetchVenues = async (): Promise<Venue[]> => {
  const venues = getLS(VENUES_COLLECTION);
  if (!venues || !Array.isArray(venues) || venues.length === 0) {
    setLS(VENUES_COLLECTION, DEFAULT_VENUES);
    return DEFAULT_VENUES;
  }
  return venues;
};

export const saveVenue = async (venue: Partial<Venue> & { id?: string }) => {
  const venues = await fetchVenues();
  if (venue.id) {
    const idx = venues.findIndex(v => v.id === venue.id);
    if (idx !== -1) {
      venues[idx] = { ...venues[idx], ...venue } as Venue;
    } else {
      venues.push(venue as Venue);
    }
    setLS(VENUES_COLLECTION, venues);
    return venue.id;
  } else {
    const newId = 'vn-' + Math.random().toString(36).substr(2, 9);
    venue.id = newId;
    venues.push(venue as Venue);
    setLS(VENUES_COLLECTION, venues);
    return newId;
  }
};

export const deleteVenue = async (id: string) => {
  let venues = await fetchVenues();
  venues = venues.filter(v => v.id !== id);
  setLS(VENUES_COLLECTION, venues);
};

// ==========================================
// COUPONS (کدهای تخفیف و پروموشن)
// ==========================================
export const COUPONS_COLLECTION = 'articket_coupons';

export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'cp-1',
    code: 'ARTICKET20',
    title: 'تخفیف ویژه خوش‌آمدگویی',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 50,
    minOrderAmount: 100,
    expiryDate: '۱۴۰۵/۰۸/۳۰',
    usageLimit: 500,
    usedCount: 134,
    isActive: true,
  },
  {
    id: 'cp-2',
    code: 'NOWRUZ1405',
    title: 'جشنواره بهاره',
    discountType: 'percentage',
    discountValue: 15,
    maxDiscount: 70,
    minOrderAmount: 150,
    expiryDate: '۱۴۰۵/۰۱/۳۱',
    usageLimit: 1000,
    usedCount: 421,
    isActive: true,
  },
  {
    id: 'cp-3',
    code: 'VIP50K',
    title: 'تخفیف نقدی ۵۰ هزار تومانی جایگاه VIP',
    discountType: 'fixed',
    discountValue: 50,
    minOrderAmount: 200,
    expiryDate: '۱۴۰۵/۰۹/۱۵',
    usageLimit: 200,
    usedCount: 68,
    isActive: true,
  },
];

export const fetchCoupons = async (): Promise<Coupon[]> => {
  const coupons = getLS(COUPONS_COLLECTION);
  if (!coupons || !Array.isArray(coupons) || coupons.length === 0) {
    setLS(COUPONS_COLLECTION, DEFAULT_COUPONS);
    return DEFAULT_COUPONS;
  }
  return coupons;
};

export const saveCoupon = async (coupon: Partial<Coupon> & { id?: string }) => {
  const coupons = await fetchCoupons();
  if (coupon.id) {
    const idx = coupons.findIndex(c => c.id === coupon.id);
    if (idx !== -1) {
      coupons[idx] = { ...coupons[idx], ...coupon } as Coupon;
    } else {
      coupons.push(coupon as Coupon);
    }
    setLS(COUPONS_COLLECTION, coupons);
    return coupon.id;
  } else {
    const newId = 'cp-' + Math.random().toString(36).substr(2, 9);
    coupon.id = newId;
    coupon.usedCount = 0;
    coupons.push(coupon as Coupon);
    setLS(COUPONS_COLLECTION, coupons);
    return newId;
  }
};

export const deleteCoupon = async (id: string) => {
  let coupons = await fetchCoupons();
  coupons = coupons.filter(c => c.id !== id);
  setLS(COUPONS_COLLECTION, coupons);
};

// ==========================================
// ORDERS & TICKETS (سفارشات و بلیت‌های صادرشده)
// ==========================================
export const TICKETS_COLLECTION = 'artis_purchased_tickets';

export const fetchOrders = async (): Promise<PurchasedTicket[]> => {
  let orders = getLS(TICKETS_COLLECTION);
  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    const events = await fetchEvents();
    const ev1 = events[0] || FEATURED_ART_EVENTS[0];
    const ev2 = events[1] || FEATURED_ART_EVENTS[1];
    orders = [
      {
        ticketId: 'tkt-1741289012345',
        bookingRef: 'ART-849201',
        event: ev1,
        tier: ev1.tiers?.[0] || { id: 't1', name: 'همکف ردیف VIP', description: 'ویژه', price: ev1.priceFrom, availableCount: 50, perks: ['ورود بدون صف'] },
        quantity: 2,
        selectedTime: '۱۹:۳۰',
        selectedDate: ev1.startDate,
        purchasedAt: 'دیروز، ساعت ۲۰:۱۵',
        customerName: 'سارا کاظمی',
        customerEmail: 'sara.kazemi@gmail.com',
        totalAmount: ev1.priceFrom * 2 + 5,
        qrCodeSeed: 'ART-849201',
        ticketingType: 'normal',
      },
      {
        ticketId: 'tkt-1741288491204',
        bookingRef: 'ART-492104',
        event: ev2,
        tier: ev2.tiers?.[0] || { id: 't2', name: 'جایگاه اختصاصی', description: 'ویژه', price: ev2.priceFrom, availableCount: 30, perks: ['پذیرایی'] },
        quantity: 1,
        selectedTime: '۲۱:۰۰',
        selectedDate: ev2.startDate,
        purchasedAt: 'امروز، ساعت ۱۱:۴۰',
        customerName: 'امیرحسین مهدوی',
        customerEmail: 'a.mahdavi@yahoo.com',
        totalAmount: ev2.priceFrom + 5,
        qrCodeSeed: 'ART-492104',
        ticketingType: 'seated',
        selectedSeats: [{ id: 's-1', row: 4, seatNumber: 12, section: 'همکف', price: ev2.priceFrom }],
      },
    ];
    setLS(TICKETS_COLLECTION, orders);
  }
  return orders;
};

export const saveOrder = async (order: PurchasedTicket) => {
  const orders = await fetchOrders();
  const idx = orders.findIndex(o => o.ticketId === order.ticketId || o.bookingRef === order.bookingRef);
  if (idx !== -1) {
    orders[idx] = { ...orders[idx], ...order };
  } else {
    orders.unshift(order);
  }
  setLS(TICKETS_COLLECTION, orders);
  return order.ticketId;
};

export const deleteOrder = async (ticketId: string) => {
  let orders = await fetchOrders();
  orders = orders.filter(o => o.ticketId !== ticketId && o.bookingRef !== ticketId);
  setLS(TICKETS_COLLECTION, orders);
};

// ==========================================
// 1. SITE USERS (مشتریان و خریداران بلیت)
// ==========================================
const INITIAL_SITE_USERS: SiteUser[] = [
  {
    id: 'usr-101',
    fullName: 'سارا تهرانی',
    email: 'sara.tehrani@gmail.com',
    phoneNumber: '۰۹۱۲۳۴۵۶۷۸۹',
    nationalCode: '۰۰۱۲۳۴۵۶۷۸',
    joinedDate: '۱۴۰۴/۰۷/۱۵',
    status: 'active',
    ticketsCount: 4,
    totalSpent: 650000,
    walletBalance: 85000,
    notes: 'خریدار دائمی تئاتر و گالری‌های تجسمی VIP',
    lastLogin: 'امروز، ساعت ۱۴:۲۰',
    purchasedEventTitles: ['نمایش هملت در صحنه معاصر', 'گالری مدرن هفت‌رنگ'],
  },
  {
    id: 'usr-102',
    fullName: 'محمدرضا صادقی',
    email: 'm.sadeghi@yahoo.com',
    phoneNumber: '۰۹۳۵۱۲۳۴۵۶۷',
    nationalCode: '۰۴۵۶۷۸۹۰۱۲',
    joinedDate: '۱۴۰۴/۰۸/۰۲',
    status: 'active',
    ticketsCount: 2,
    totalSpent: 360000,
    walletBalance: 0,
    notes: 'ترجیح صندلی‌های ردیف همکف تالار وحدت',
    lastLogin: 'دیروز، ساعت ۱۹:۴۵',
    purchasedEventTitles: ['کنسرت سمفونیک شهر آفتاب'],
  },
  {
    id: 'usr-103',
    fullName: 'نیلوفر راد',
    email: 'niloofar.rad@outlook.com',
    phoneNumber: '۰۹۱۸۹۸۷۶۵۴۳',
    nationalCode: '۱۲۳۴۵۶۷۸۹۰',
    joinedDate: '۱۴۰۴/۰۵/۲۲',
    status: 'active',
    ticketsCount: 6,
    totalSpent: 1450000,
    walletBalance: 120000,
    notes: 'مشتری طلایی با سابقه خریدهای گروهی',
    lastLogin: '۳ روز پیش',
    purchasedEventTitles: ['شب موسیقی کلاسیک', 'نمایش در اعماق'],
  },
  {
    id: 'usr-104',
    fullName: 'امیرحسین فتاحی',
    email: 'amir.fattahi@gmail.com',
    phoneNumber: '۰۹۲۱۷۶۵۴۳۲۱',
    nationalCode: '',
    joinedDate: '۱۴۰۴/۰۹/۱۰',
    status: 'pending',
    ticketsCount: 0,
    totalSpent: 0,
    walletBalance: 0,
    notes: 'در انتظار تایید شماره موبایل و کد پیامک',
    lastLogin: '۱ هفته پیش',
    purchasedEventTitles: [],
  },
  {
    id: 'usr-105',
    fullName: 'کامران بهرامی',
    email: 'k.bahrami@domain.ir',
    phoneNumber: '۰۹۰۲۳۴۵۹۸۷۶',
    nationalCode: '۳۲۴۰۹۸۷۱۱۲',
    joinedDate: '۱۴۰۴/۰۶/۱۸',
    status: 'blocked',
    ticketsCount: 1,
    totalSpent: 180000,
    walletBalance: 0,
    notes: 'مسدود شده به علت ثبت مکرر سفارش بدون پرداخت',
    lastLogin: 'یک ماه پیش',
    purchasedEventTitles: ['نمایش عروسکی شهر قصه'],
  },
];

export const fetchSiteUsers = async (): Promise<SiteUser[]> => {
  let users = getLS(USERS_COLLECTION);
  if (!users || !Array.isArray(users) || users.length === 0) {
    users = [...INITIAL_SITE_USERS];
    setLS(USERS_COLLECTION, users);
  }
  return users;
};

export const saveSiteUser = async (user: Partial<SiteUser>): Promise<string> => {
  const users = await fetchSiteUsers();
  const id = user.id || 'usr-' + Date.now();
  const existingIdx = users.findIndex(u => u.id === id);

  const fullUser: SiteUser = {
    id,
    fullName: user.fullName || 'کاربر جدید',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    nationalCode: user.nationalCode || '',
    joinedDate: user.joinedDate || '۱۴۰۵/۰۱/۰۱',
    status: user.status || 'active',
    ticketsCount: user.ticketsCount !== undefined ? user.ticketsCount : 0,
    totalSpent: user.totalSpent !== undefined ? user.totalSpent : 0,
    walletBalance: user.walletBalance !== undefined ? user.walletBalance : 0,
    notes: user.notes || '',
    lastLogin: user.lastLogin || 'اکنون',
    purchasedEventTitles: user.purchasedEventTitles || [],
  };

  if (existingIdx !== -1) {
    users[existingIdx] = { ...users[existingIdx], ...fullUser };
  } else {
    users.unshift(fullUser);
  }

  setLS(USERS_COLLECTION, users);
  return id;
};

export const deleteSiteUser = async (id: string): Promise<void> => {
  let users = await fetchSiteUsers();
  users = users.filter(u => u.id !== id);
  setLS(USERS_COLLECTION, users);
};

// ==========================================
// SESSION & AUTH HELPERS (نشست فعال کاربر و اهراز هویت)
// ==========================================
export const SESSION_USER_KEY = 'articket_session_user';

export const getCurrentSessionUser = (): SiteUser | null => {
  return getLS<SiteUser | null>(SESSION_USER_KEY);
};

export const setCurrentSessionUser = (user: SiteUser | null): void => {
  setLS(SESSION_USER_KEY, user);
};

export const findUserForAuth = async (identifier: string): Promise<SiteUser | null> => {
  const users = await fetchSiteUsers();
  const clean = identifier.trim().toLowerCase();
  const cleanDigits = identifier.replace(/[^0-9]/g, '');

  return users.find(u => {
    const userPhoneClean = (u.phoneNumber || '').replace(/[^0-9]/g, '');
    const userNationalClean = (u.nationalCode || '').replace(/[^0-9]/g, '');
    const userEmailClean = (u.email || '').toLowerCase().trim();
    const userNameClean = (u.fullName || '').toLowerCase().trim();

    if (cleanDigits && (userPhoneClean === cleanDigits || (cleanDigits.length >= 8 && userPhoneClean.endsWith(cleanDigits)))) return true;
    if (cleanDigits && userNationalClean && userNationalClean === cleanDigits) return true;
    if (clean && userEmailClean === clean) return true;
    if (clean && userNameClean === clean) return true;
    return false;
  }) || null;
};

export const registerSiteUser = async (data: {
  fullName: string;
  phoneNumber: string;
  nationalCode: string;
  email?: string;
  userRole?: 'producer' | 'director' | 'customer' | 'artist';
  password?: string;
}): Promise<SiteUser> => {
  const users = await fetchSiteUsers();
  const cleanPhone = data.phoneNumber.trim();
  const cleanNational = data.nationalCode.trim();

  // Check if user already exists
  const existing = users.find(u => 
    (u.phoneNumber && u.phoneNumber.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, '')) ||
    (u.nationalCode && cleanNational && u.nationalCode.replace(/[^0-9]/g, '') === cleanNational.replace(/[^0-9]/g, ''))
  );

  if (existing) {
    // Update existing user with any new info
    existing.fullName = data.fullName || existing.fullName;
    existing.nationalCode = data.nationalCode || existing.nationalCode;
    existing.userRole = data.userRole || existing.userRole || 'producer';
    if (data.email) existing.email = data.email;
    existing.lastLogin = 'همین الان';
    await saveSiteUser(existing);
    setCurrentSessionUser(existing);
    return existing;
  }

  const newUser: SiteUser = {
    id: 'usr-' + Date.now(),
    fullName: data.fullName,
    phoneNumber: data.phoneNumber,
    nationalCode: data.nationalCode,
    email: data.email || `${cleanPhone}@articket.ir`,
    joinedDate: new Date().toLocaleDateString('fa-IR'),
    status: 'active',
    ticketsCount: 0,
    totalSpent: 0,
    walletBalance: 100000, // 100,000 Tomans welcome bonus credit!
    notes: 'ثبت‌نام جدید جهت ایجاد رویداد و خرید بلیت',
    lastLogin: 'همین الان',
    purchasedEventTitles: [],
    userRole: data.userRole || 'producer',
  };

  await saveSiteUser(newUser);
  setCurrentSessionUser(newUser);
  return newUser;
};

export const updateUserWalletBalance = async (userId: string, deltaAmount: number): Promise<number> => {
  const users = await fetchSiteUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return 0;
  user.walletBalance = Math.max(0, (user.walletBalance || 0) + deltaAmount);
  await saveSiteUser(user);
  const current = getCurrentSessionUser();
  if (current && current.id === userId) {
    current.walletBalance = user.walletBalance;
    setCurrentSessionUser(current);
  }
  return user.walletBalance;
};

// ==========================================
// 2. ADMINS & EVENT ORGANIZERS (ادمین‌ها و صاحبان اثر)
// ==========================================
const INITIAL_ADMIN_ORGANIZERS: AdminOrganizer[] = [
  {
    id: 'adm-01',
    fullName: 'مهران کمالی',
    email: 'kamali@articket.ir',
    phoneNumber: '۰۹۱۲۱۱۱۱۱۱۱',
    role: 'super_admin',
    roleLabel: 'مدیر ارشد و سوپرادمین',
    status: 'active',
    assignedEventIds: ['*'],
    assignedEventTitles: ['تمامی رویدادها (دسترسی کل سامانه)'],
    commissionRate: 100,
    totalRevenueGenerated: 8500000,
    settledAmount: 6000000,
    unsettledAmount: 2500000,
    iban: 'IR920170000000123456789012',
    lastActive: 'همین الان آنلاین',
    notes: 'دسترسی نامحدود فنی، مالی و امنیتی',
  },
  {
    id: 'adm-02',
    fullName: 'پریسا ابراهیمی',
    email: 'ebrahimi@articket.ir',
    phoneNumber: '۰۹۱۲۲۲۲۲۲۲۲',
    role: 'box_office_admin',
    roleLabel: 'مدیر ارشد گیشه و فروش',
    status: 'active',
    assignedEventIds: ['*'],
    assignedEventTitles: ['مدیریت گیشه‌های تهران و سالن‌های همکار'],
    commissionRate: 100,
    totalRevenueGenerated: 4200000,
    settledAmount: 4200000,
    unsettledAmount: 0,
    iban: 'IR450120000000987654321098',
    lastActive: 'امروز، ساعت ۱۲:۱۵',
    notes: 'تایید بلیت‌های مهمان و تسویه‌های بانکی شتاب',
  },
  {
    id: 'adm-03',
    fullName: 'دکتر علی رفیعی',
    email: 'rafiee.director@gmail.com',
    phoneNumber: '۰۹۱۲۳۳۳۳۳۳۳',
    role: 'event_producer',
    roleLabel: 'تهیه‌کننده و صاحب اثر',
    status: 'active',
    assignedEventIds: ['1'],
    assignedEventTitles: ['نمایش هملت در صحنه معاصر'],
    commissionRate: 85,
    totalRevenueGenerated: 2950000,
    settledAmount: 2000000,
    unsettledAmount: 507500,
    iban: 'IR180560000000456123789045',
    lastActive: 'دیروز، ساعت ۲۰:۳۰',
    notes: 'کارگردان و صاحب امتیاز اثر، سهم ۸۵٪ از خالص گیشه',
  },
  {
    id: 'adm-04',
    fullName: 'دفتر تولید کنسرت همایون شجریان',
    email: 'shajarian.concert@gmail.com',
    phoneNumber: '۰۹۱۲۴۴۴۴۴۴۴',
    role: 'event_producer',
    roleLabel: 'تهیه‌کننده کنسرت و موسیقی',
    status: 'active',
    assignedEventIds: ['2'],
    assignedEventTitles: ['کنسرت در هوای تو'],
    commissionRate: 90,
    totalRevenueGenerated: 5400000,
    settledAmount: 4000000,
    unsettledAmount: 860000,
    iban: 'IR770190000000888999111222',
    lastActive: '۲ روز پیش',
    notes: 'سهم ۹۰٪ از فروش سانس‌های برج میلاد و سالن رویال',
  },
  {
    id: 'adm-05',
    fullName: 'فرهاد توکلی',
    email: 'tavakoli@vahdathall.ir',
    phoneNumber: '۰۹۱۲۵۵۵۵۵۵۵',
    role: 'hall_manager',
    roleLabel: 'مدیر سالن و صحنه (تالار وحدت)',
    status: 'active',
    assignedEventIds: ['1', '3'],
    assignedEventTitles: ['سالن اصلی تالار وحدت'],
    commissionRate: 0,
    totalRevenueGenerated: 0,
    settledAmount: 0,
    unsettledAmount: 0,
    iban: 'IR330180000000777666555444',
    lastActive: 'امروز، ساعت ۱۰:۰۰',
    notes: 'مسئول هماهنگی سالن و گیت‌های ورود تماشاگران',
  },
  {
    id: 'adm-06',
    fullName: 'سمیرا کیانی',
    email: 'kiani.operator@articket.ir',
    phoneNumber: '۰۹۱۲۶۶۶۶۶۶۶',
    role: 'gate_operator',
    roleLabel: 'اپراتور گیت و اسکنر بلیت',
    status: 'active',
    assignedEventIds: ['1', '2', '3'],
    assignedEventTitles: ['گیت ورودی سالن اصلی'],
    commissionRate: 0,
    totalRevenueGenerated: 0,
    settledAmount: 0,
    unsettledAmount: 0,
    iban: '',
    lastActive: 'امشب، ساعت ۱۸:۳۰',
    notes: 'کنترل بارکد بلیت‌های ورودی با دستگاه اسکنر',
  },
];

export const fetchAdminOrganizers = async (): Promise<AdminOrganizer[]> => {
  let admins = getLS(ADMINS_COLLECTION);
  if (!admins || !Array.isArray(admins) || admins.length === 0) {
    admins = [...INITIAL_ADMIN_ORGANIZERS];
    setLS(ADMINS_COLLECTION, admins);
  }
  return admins;
};

export const saveAdminOrganizer = async (admin: Partial<AdminOrganizer>): Promise<string> => {
  const admins = await fetchAdminOrganizers();
  const id = admin.id || 'adm-' + Date.now();
  const existingIdx = admins.findIndex(a => a.id === id);

  const fullAdmin: AdminOrganizer = {
    id,
    fullName: admin.fullName || 'مدیر جدید',
    email: admin.email || '',
    phoneNumber: admin.phoneNumber || '',
    role: admin.role || 'event_producer',
    roleLabel: admin.roleLabel || 'تهیه‌کننده و صاحب اثر',
    status: admin.status || 'active',
    assignedEventIds: admin.assignedEventIds || [],
    assignedEventTitles: admin.assignedEventTitles || [],
    commissionRate: admin.commissionRate !== undefined ? admin.commissionRate : 85,
    totalRevenueGenerated: admin.totalRevenueGenerated || 0,
    settledAmount: admin.settledAmount || 0,
    unsettledAmount: admin.unsettledAmount || 0,
    iban: admin.iban || '',
    lastActive: admin.lastActive || 'به تازگی',
    notes: admin.notes || '',
  };

  if (existingIdx !== -1) {
    admins[existingIdx] = { ...admins[existingIdx], ...fullAdmin };
  } else {
    admins.unshift(fullAdmin);
  }

  setLS(ADMINS_COLLECTION, admins);
  return id;
};

export const deleteAdminOrganizer = async (id: string): Promise<void> => {
  let admins = await fetchAdminOrganizers();
  admins = admins.filter(a => a.id !== id);
  setLS(ADMINS_COLLECTION, admins);
};

// ==========================================
// 3. EVENT PROPOSALS (درخواست‌های ایجاد رویداد)
// ==========================================
const INITIAL_PROPOSALS: EventProposal[] = [
  {
    id: 'prop-101',
    trackingCode: 'REQ-84920',
    producerName: 'هومن بهمن‌پور',
    producerRole: 'کارگردان و سرپرست گروه',
    companyOrGroup: 'گروه تئاتر مانی',
    phoneNumber: '۰۹۱۲۷۷۷۸۸۹۹',
    email: 'h.bahmanpour@gmail.com',
    eventTitle: 'نمایش مرغان دریایی اثر آنتون چخوف',
    eventSubtitle: 'خوانشی معاصر از درام کلاسیک چخوف با گروه ۳۰ نفره',
    category: 'theater',
    categoryLabel: 'تئاتر و نمایش',
    proposedVenue: 'تئاتر شهر - سالن اصلی',
    city: 'تهران',
    proposedStartDate: '۱۴۰۵/۰۹/۱۵',
    proposedEndDate: '۱۴۰۵/۱۰/۱۵',
    proposedTimeSlots: ['۱۹:۰۰', '۲۱:۱۵'],
    estimatedPriceFrom: 200,
    estimatedCapacity: 500,
    posterUrl: 'https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=800&q=80',
    description: 'اجرای صحنه‌ای نمایشنامه ماندگار مرغ دریایی چخوف با رویکردی نو در طراحی صحنه و نورپردازی مینیمالیستی.',
    castAndCrewSummary: 'بازیگران: مریم کاظمی، آرش دادگر، بهرام افشاری • موسیقی متن: صبا علیزاده',
    licenseCode: 'IRC-940214-TH',
    documents: [
      {
        id: 'doc-1',
        type: 'ershad_license',
        typeLabel: 'مجوز وزارت فرهنگ و ارشاد اسلامی',
        fileName: 'ershad_license_chekhov_seagull.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80',
        fileSize: '۱.۸ مگابایت',
        uploadedAt: 'دیروز، ۱۵:۲۵',
        licenseNumber: 'IRC-940214-TH',
        issueDate: '۱۴۰۵/۰۶/۱۰',
      },
      {
        id: 'doc-2',
        type: 'venue_contract',
        typeLabel: 'قرارداد اجاره سالن اصلی تئاتر شهر',
        fileName: 'city_theater_hall_contract.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
        fileSize: '۲.۴ مگابایت',
        uploadedAt: 'دیروز، ۱۵:۲۸',
      },
      {
        id: 'doc-3',
        type: 'amaken_permit',
        typeLabel: 'تاییدیه پلیس نظارت بر اماکن عمومی فراجا',
        fileName: 'amaken_permit_security_stamp.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        fileSize: '۸۵۰ کیلوبایت',
        uploadedAt: 'دیروز، ۱۵:۲۹',
        licenseNumber: 'AMK-84102-SEC',
      }
    ],
    termsAccepted: true,
    termsAcceptedDate: '۱۴۰۵/۰۷/۱۰ - ساعت ۱۵:۳۰',
    createdAt: 'دیروز، ساعت ۱۵:۳۰',
    status: 'pending',
    adminNotes: 'مجوز وزارت ارشاد و اماکن ضمیمه شده است؛ در حال بررسی هماهنگی تاریخ سالن تئاتر شهر.',
  },
  {
    id: 'prop-102',
    trackingCode: 'REQ-72104',
    producerName: 'مهیار سپهری',
    producerRole: 'تهیه‌کننده کنسرت',
    companyOrGroup: 'موسسه فرهنگی آوای باران',
    phoneNumber: '۰۹۳۵۴۴۴۳۳۲۲',
    email: 'sepehri.music@yahoo.com',
    eventTitle: 'کنسرت بزرگ ارکستر سایه',
    eventSubtitle: 'شب تکنوازی و همنوازی سازهای سنتی ایرانی با آواز اصیل',
    category: 'concert',
    categoryLabel: 'کنسرت و موسیقی',
    proposedVenue: 'مرکز همایش‌های برج میلاد',
    city: 'تهران',
    proposedStartDate: '۱۴۰۵/۰۸/۲۵',
    proposedEndDate: '۱۴۰۵/۰۸/۲۶',
    proposedTimeSlots: ['۱۸:۳۰', '۲۱:۴۵'],
    estimatedPriceFrom: 350,
    estimatedCapacity: 1600,
    posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    description: 'کنسرت ملی ارکستر زهی و مضرابی سایه به رهبری استاد ارجمند با اجرای تصنیف‌های نوستالژیک و خاطره‌انگیز.',
    castAndCrewSummary: 'خواننده: سینا سرلک • رهبر ارکستر: فردین خلعتبری • سرپرست نوازندگان: علی قمصری',
    licenseCode: 'MS-849102-GOV',
    documents: [
      {
        id: 'doc-4',
        type: 'ershad_license',
        typeLabel: 'پروانه اجرای موسیقی از وزارت ارشاد',
        fileName: 'music_permit_sayeh_orchestra.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        fileSize: '۳.۱ مگابایت',
        uploadedAt: '۳ روز پیش',
        licenseNumber: 'MS-849102-GOV',
      }
    ],
    termsAccepted: true,
    termsAcceptedDate: '۱۴۰۵/۰۷/۰۸',
    createdAt: '۳ روز پیش',
    status: 'approved',
    adminNotes: 'قرارداد سالن برج میلاد تایید شد؛ درصد کمیسیون ۸۸٪ توافق گردید.',
  },
  {
    id: 'prop-103',
    trackingCode: 'REQ-61905',
    producerName: 'پروانه اخوان',
    producerRole: 'کیوریتور و هنرمند نقاش',
    companyOrGroup: 'استودیو تجسمی نگاره',
    phoneNumber: '۰۹۱۸۱۱۱۲۲۳۳',
    email: 'p.akhavan@artstudio.ir',
    eventTitle: 'نمایشگاه نقاشی‌خط مدرن سهراب',
    eventSubtitle: 'مجموعه ۳۰ اثر بدیع خوشنویسی انتزاعی و رنگ روغن روی بوم',
    category: 'gallery',
    categoryLabel: 'گالری و تجسمی',
    proposedVenue: 'فرهنگسرای نیاوران - گالری ۱',
    city: 'تهران',
    proposedStartDate: '۱۴۰۵/۰۷/۱۰',
    proposedEndDate: '۱۴۰۵/۰۷/۲۴',
    proposedTimeSlots: ['۱۶:۰۰ - ۲۰:۰۰'],
    estimatedPriceFrom: 50,
    estimatedCapacity: 300,
    posterUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=800&q=80',
    description: 'نمایشگاهی از ترکیب خط نستعلیق سنتی و نقاشی اکسپرسیونیستی معاصر با مضامین شعر نو فارسی.',
    castAndCrewSummary: 'خالق آثار: پروانه اخوان • کیوریتور مهمان: آیدین آغداشلو',
    licenseCode: 'GAL-39201',
    documents: [
      {
        id: 'doc-5',
        type: 'ershad_license',
        typeLabel: 'مجوز نمایشگاه تجسمی از مرکز هنرهای تجسمی',
        fileName: 'visual_arts_permit.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=800&q=80',
        fileSize: '۱.۲ مگابایت',
        uploadedAt: '۱ هفته پیش',
      }
    ],
    termsAccepted: true,
    termsAcceptedDate: '۱۴۰۵/۰۷/۰۱',
    createdAt: '۱ هفته پیش',
    status: 'published',
    adminNotes: 'رویداد رسماً روی گیشه آنلاین منتشر و بلیت‌فروشی آغاز شد.',
  }
];

export const fetchEventProposals = async (): Promise<EventProposal[]> => {
  let proposals = getLS(PROPOSALS_COLLECTION);
  if (!proposals || !Array.isArray(proposals) || proposals.length === 0) {
    proposals = [...INITIAL_PROPOSALS];
    setLS(PROPOSALS_COLLECTION, proposals);
  }
  return proposals;
};

export const saveEventProposal = async (proposal: Partial<EventProposal>): Promise<string> => {
  const proposals = await fetchEventProposals();
  const id = proposal.id || 'prop-' + Date.now();
  const trackingCode = proposal.trackingCode || 'REQ-' + Math.floor(10000 + Math.random() * 90000);
  const existingIdx = proposals.findIndex(p => p.id === id);

  const fullProposal: EventProposal = {
    id,
    trackingCode,
    producerName: proposal.producerName || 'متقاضی نامشخص',
    producerRole: proposal.producerRole || 'تهیه‌کننده',
    companyOrGroup: proposal.companyOrGroup || '',
    phoneNumber: proposal.phoneNumber || '',
    email: proposal.email || '',
    nationalCode: proposal.nationalCode || '',
    eventTitle: proposal.eventTitle || 'عنوان رویداد',
    eventSubtitle: proposal.eventSubtitle || '',
    category: proposal.category || 'theater',
    categoryLabel: proposal.categoryLabel || 'تئاتر و نمایش',
    proposedVenue: proposal.proposedVenue || 'سالن اصلی',
    city: proposal.city || 'تهران',
    proposedStartDate: proposal.proposedStartDate || '۱۴۰۵/۰۹/۰۱',
    proposedEndDate: proposal.proposedEndDate || '',
    proposedTimeSlots: proposal.proposedTimeSlots || ['۱۹:۰۰'],
    estimatedPriceFrom: proposal.estimatedPriceFrom || 150,
    estimatedCapacity: proposal.estimatedCapacity || 300,
    posterUrl: proposal.posterUrl || 'https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=800&q=80',
    description: proposal.description || '',
    castAndCrewSummary: proposal.castAndCrewSummary || '',
    licenseCode: proposal.licenseCode || '',
    documents: proposal.documents || [],
    termsAccepted: proposal.termsAccepted !== undefined ? proposal.termsAccepted : true,
    termsAcceptedDate: proposal.termsAcceptedDate || '۱۴۰۵/۰۱/۱۵',
    createdAt: proposal.createdAt || 'همین الان',
    status: proposal.status || 'pending',
    adminNotes: proposal.adminNotes || '',
    publishedEventId: proposal.publishedEventId,
  };

  if (existingIdx !== -1) {
    proposals[existingIdx] = { ...proposals[existingIdx], ...fullProposal };
  } else {
    proposals.unshift(fullProposal);
  }

  setLS(PROPOSALS_COLLECTION, proposals);
  return id;
};

export const deleteEventProposal = async (id: string): Promise<void> => {
  let proposals = await fetchEventProposals();
  proposals = proposals.filter(p => p.id !== id);
  setLS(PROPOSALS_COLLECTION, proposals);
};

// Publish proposal directly to live site events
export const approveAndPublishProposal = async (proposalId: string): Promise<string> => {
  const proposals = await fetchEventProposals();
  const prop = proposals.find(p => p.id === proposalId);
  if (!prop) throw new Error('درخواست یافت نشد');

  // 1. Create official ArtEvent
  const newEventId = 'ev-' + Date.now();
  const newEvent: ArtEvent = {
    id: newEventId,
    title: prop.eventTitle,
    subtitle: prop.eventSubtitle || prop.description.slice(0, 70),
    category: prop.category === 'comedy' ? 'theater' : prop.category,
    categoryLabel: prop.categoryLabel,
    artist: prop.producerName,
    artistRole: prop.producerRole,
    venue: prop.proposedVenue,
    city: prop.city,
    country: 'ایران',
    address: `${prop.city}، ${prop.proposedVenue}`,
    startDate: prop.proposedStartDate,
    endDate: prop.proposedEndDate,
    time: prop.proposedTimeSlots[0] || '۱۹:۳۰',
    timeSlots: prop.proposedTimeSlots.length ? prop.proposedTimeSlots : ['۱۹:۳۰'],
    imageUrl: prop.posterUrl || 'https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      prop.posterUrl || 'https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=800&q=80',
    ],
    priceFrom: prop.estimatedPriceFrom,
    status: 'ظرفیت موجود',
    rating: 5.0,
    reviewsCount: 1,
    description: prop.description,
    curatorStatement: prop.description,
    tiers: [
      {
        id: 't-1',
        name: 'جایگاه عادی',
        description: 'صندلی‌های سالن اصلی',
        price: prop.estimatedPriceFrom,
        availableCount: prop.estimatedCapacity || 250,
        perks: ['ورود استاندارد به سالن'],
      },
      {
        id: 't-2',
        name: 'جایگاه ویژه VIP',
        description: 'ردیف‌های ابتدایی با بهترین دید و پذیرایی',
        price: prop.estimatedPriceFrom * 1.4,
        availableCount: 40,
        perks: ['دید مستقیم صحنه', 'پذیرایی ویژه', 'ورود بدون صف'],
      }
    ],
    highlightTags: [prop.categoryLabel, 'جدید روی گیشه', 'صاحب اثر'],
    ticketingType: 'normal',
    isActive: true,
  };

  await saveEvent(newEvent);

  // 2. Link producer into AdminOrganizer
  await saveAdminOrganizer({
    fullName: prop.producerName,
    email: prop.email,
    phoneNumber: prop.phoneNumber,
    role: 'event_producer',
    roleLabel: prop.producerRole || 'تهیه‌کننده و صاحب اثر',
    status: 'active',
    assignedEventIds: [newEventId],
    assignedEventTitles: [newEvent.title],
    commissionRate: 85,
    notes: `ثبت خودکار از طریق پذیرش درخواست با کد رهگیری ${prop.trackingCode}`,
  });

  // 3. Mark proposal as published
  prop.status = 'published';
  prop.publishedEventId = newEventId;
  prop.adminNotes = (prop.adminNotes ? prop.adminNotes + '\n' : '') + `تایید و منتشر شد روی گیشه با شناسه ${newEventId}`;
  setLS(PROPOSALS_COLLECTION, proposals);

  return newEventId;
};

// ==========================================
// REVIEWS & AUDIENCE RATINGS
// ==========================================
const INITIAL_MOCK_REVIEWS: EventReview[] = [
  {
    id: 'rev-1',
    eventId: '1',
    userName: 'سارا کاظمی',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'اجرای بی‌نظیر و هماهنگی فوق‌العاده بازیگران! طراحی صحنه و نورپردازی در سطح بالایی بود و واقعاً تماشاگر را به وجد می‌آورد.',
    createdAt: '۱۴۰۵/۰۱/۱۴',
    isVerifiedBuyer: true,
    likesCount: 24,
    scores: {
      performance: 5,
      soundAndMusic: 5,
      stageDesign: 5,
      venueQuality: 4,
    }
  },
  {
    id: 'rev-2',
    eventId: '1',
    userName: 'علی رضایی',
    rating: 4.5,
    comment: 'کیفیت صدا در سالن اصلی بسیار شفاف و عالی بود. حتماً به دوستانم تماشای این اثر را پیشنهاد می‌کنم.',
    createdAt: '۱۴۰۵/۰۱/۱۲',
    isVerifiedBuyer: true,
    likesCount: 16,
    scores: {
      performance: 4.5,
      soundAndMusic: 5,
      stageDesign: 4,
      venueQuality: 4.5,
    }
  },
  {
    id: 'rev-3',
    eventId: '2',
    userName: 'مریم شمس',
    rating: 5,
    comment: 'کنسرت فوق‌العاده احساسی با قطعات به‌یادماندنی. جایگاه صندلی‌ها و برخورد کادر تالار وحدت بسیار محترمانه بود.',
    createdAt: '۱۴۰۵/۰۱/۱۰',
    isVerifiedBuyer: true,
    likesCount: 31,
    scores: {
      performance: 5,
      soundAndMusic: 5,
      stageDesign: 4.5,
      venueQuality: 5,
    }
  }
];

export const fetchEventReviews = async (eventId: string): Promise<EventReview[]> => {
  let allReviews = getLS<EventReview[]>(REVIEWS_COLLECTION);
  if (!allReviews || !Array.isArray(allReviews) || allReviews.length === 0) {
    allReviews = INITIAL_MOCK_REVIEWS;
    setLS(REVIEWS_COLLECTION, allReviews);
  }
  return allReviews.filter(r => r.eventId === eventId);
};

export const saveEventReview = async (review: EventReview): Promise<void> => {
  let allReviews = getLS<EventReview[]>(REVIEWS_COLLECTION) || [];
  if (!Array.isArray(allReviews)) allReviews = [];
  allReviews.unshift(review);
  setLS(REVIEWS_COLLECTION, allReviews);
};

export const likeEventReview = async (reviewId: string): Promise<number> => {
  let allReviews = getLS<EventReview[]>(REVIEWS_COLLECTION) || [];
  const target = allReviews.find(r => r.id === reviewId);
  if (target) {
    target.likesCount = (target.likesCount || 0) + 1;
    setLS(REVIEWS_COLLECTION, allReviews);
    return target.likesCount;
  }
  return 0;
};
