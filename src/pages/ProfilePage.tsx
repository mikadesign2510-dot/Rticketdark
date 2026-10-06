import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  User, 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  PlusCircle, 
  LogOut, 
  ShieldCheck, 
  CreditCard, 
  Settings, 
  Search, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight,
  Sparkles,
  Award,
  Building,
  QrCode,
  ChevronLeft,
  Wallet,
  Bookmark,
  Eye,
  History,
  Phone,
  Mail,
  SlidersHorizontal,
  ExternalLink,
  Printer,
  Download,
  BarChart3,
  ScanLine,
  Landmark,
  FileText,
  BadgeCheck,
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle,
  Camera,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  fetchEventProposals, 
  fetchOrders, 
  updateUserWalletBalance,
  fetchEvents,
  fetchSettings,
  SiteSettings 
} from '../lib/db';
import { EventProposal, PurchasedTicket, ArtEvent, EventCategory } from '../types';
import { toPersianDigits, formatPrice } from '../utils/persianNumbers';
import { CITIES_LIST } from '../data/mockEvents';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MyTicketsDrawer } from '../components/MyTicketsDrawer';
import { SavedEventsModal } from '../components/SavedEventsModal';
import { PrintableTicketPdf } from '../components/PrintableTicketPdf';

type UserMode = 'audience' | 'creator';

type AudienceTab = 'tickets' | 'saved' | 'wallet' | 'settings';
type CreatorTab = 'creator-events' | 'creator-analytics' | 'creator-scanner' | 'creator-payouts' | 'creator-settings';

type ProfileTab = AudienceTab | CreatorTab;

export default function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, isAuthenticated, logout, updateProfile } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Mode: audience or creator
  const urlMode = searchParams.get('mode') as UserMode;
  const [userMode, setUserMode] = useState<UserMode>(
    urlMode === 'creator' || (currentUser?.userRole === 'producer' && urlMode !== 'audience')
      ? 'creator'
      : 'audience'
  );

  // Tab state synced with URL search params
  const urlTab = searchParams.get('tab') as ProfileTab;
  const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
    if (urlTab) return urlTab;
    return userMode === 'creator' ? 'creator-events' : 'tickets';
  });

  // Site Settings & Categories for Header & Footer
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [allEventsList, setAllEventsList] = useState<ArtEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('all');
  const [selectedCity, setSelectedCity] = useState<string>('همه شهرها');

  // User's proposals & tickets & saved events
  const [userProposals, setUserProposals] = useState<EventProposal[]>([]);
  const [userTickets, setUserTickets] = useState<PurchasedTicket[]>([]);
  const [savedEvents, setSavedEvents] = useState<ArtEvent[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [proposalFilter, setProposalFilter] = useState<'all' | 'pending' | 'reviewing' | 'approved'>('all');

  // Modals & Drawers
  const [isTicketsDrawerOpen, setIsTicketsDrawerOpen] = useState(false);
  const [isSavedEventsModalOpen, setIsSavedEventsModalOpen] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(200000);
  const [isProcessingTopUp, setIsProcessingTopUp] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState(false);
  const [selectedTicketQr, setSelectedTicketQr] = useState<PurchasedTicket | null>(null);
  const [activePdfTicket, setActivePdfTicket] = useState<PurchasedTicket | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Creator Scanner Simulation state
  const [scanCodeInput, setScanCodeInput] = useState('');
  const [scanResult, setScanResult] = useState<{ status: 'valid' | 'invalid' | 'used'; message: string; ticket?: PurchasedTicket } | null>(null);

  // Creator Payout IBAN state
  const [shebaNumber, setShebaNumber] = useState('IR820170000000123456789012');
  const [payoutBankName, setPayoutBankName] = useState('بانک ملی ایران');
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNationalCode, setEditNationalCode] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return userTickets.filter(t => {
      const matchSearch = !searchQuery || (t.eventTitle && t.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
  }, [userTickets, searchQuery]);

  // Filtered proposals
  const filteredProposals = useMemo(() => {
    return userProposals.filter(p => {
      const matchSearch = !searchQuery || (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = proposalFilter === 'all' || p.status === proposalFilter;
      return matchSearch && matchStatus;
    });
  }, [userProposals, searchQuery, proposalFilter]);

  // Creator Analytics Calculations
  const creatorStats = useMemo(() => {
    const totalEvents = userProposals.length;
    const totalRevenue = userTickets.reduce((sum, t) => sum + (t.price || 0), 0) * 1.8;
    const totalTicketsSold = (userTickets.length * 14) + (userProposals.length * 28);
    const averageOccupancy = totalEvents > 0 ? 84 : 0;

    return {
      totalEvents,
      totalRevenue,
      totalTicketsSold,
      averageOccupancy
    };
  }, [userProposals, userTickets]);

  const handleModeChange = (mode: UserMode) => {
    setUserMode(mode);
    const newTab = mode === 'creator' ? 'creator-events' : 'tickets';
    setActiveTab(newTab);
    setSearchParams({ mode, tab: newTab });
  };

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    setSearchParams({ mode: userMode, tab });
  };

  const handleConfirmLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Auth gate: redirect to /login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/profile', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.fullName || '');
      setEditPhone(currentUser.phoneNumber || '');
      setEditNationalCode(currentUser.nationalCode || '');
      setEditEmail(currentUser.email || '');
    }
  }, [currentUser]);

  // Load site settings, user proposals & orders & saved events
  useEffect(() => {
    async function loadData() {
      try {
        const settings = await fetchSettings();
        setSiteSettings(settings);

        const allEvents = await fetchEvents();
        setAllEventsList(allEvents);

        if (!currentUser) return;
        setLoadingData(true);
        const [allProposals, allOrders] = await Promise.all([
          fetchEventProposals(),
          fetchOrders()
        ]);

        const phoneClean = (currentUser.phoneNumber || '').replace(/[^0-9]/g, '');
        const nationalClean = (currentUser.nationalCode || '').replace(/[^0-9]/g, '');
        const nameClean = (currentUser.fullName || '').toLowerCase();

        // Match proposals
        const myProps = allProposals.filter(p => {
          const pPhone = (p.phoneNumber || '').replace(/[^0-9]/g, '');
          const pNational = (p.nationalCode || '').replace(/[^0-9]/g, '');
          const pName = (p.producerName || '').toLowerCase();

          if (phoneClean && pPhone && (pPhone === phoneClean || pPhone.includes(phoneClean) || phoneClean.includes(pPhone))) return true;
          if (nationalClean && pNational && pNational === nationalClean) return true;
          if (nameClean && pName && pName.includes(nameClean)) return true;
          return false;
        });

        // Match tickets
        const myOrders = allOrders.filter(o => {
          const oName = (o.customerName || '').toLowerCase();
          const oEmail = (o.customerEmail || '').toLowerCase();
          if (nameClean && oName && oName.includes(nameClean)) return true;
          if (currentUser.email && oEmail && oEmail === currentUser.email.toLowerCase()) return true;
          return true; // Also show demo orders for user exploration
        });

        // Match saved events from local storage
        try {
          const savedIds = JSON.parse(localStorage.getItem('artis_saved_event_ids') || '[]');
          const matchedSaved = allEvents.filter(e => savedIds.includes(e.id));
          setSavedEvents(matchedSaved.length > 0 ? matchedSaved : allEvents.slice(0, 2));
        } catch {
          setSavedEvents(allEvents.slice(0, 2));
        }

        setUserProposals(myProps);
        setUserTickets(myOrders);
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [currentUser]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTopUpWallet = async () => {
    if (!currentUser || topUpAmount <= 0) return;
    setIsProcessingTopUp(true);
    try {
      await updateUserWalletBalance(currentUser.id, topUpAmount);
      await updateProfile({ walletBalance: (currentUser.walletBalance || 0) + topUpAmount });
      setTopUpSuccess(true);
      setTimeout(() => {
        setTopUpSuccess(false);
        setShowTopUpModal(false);
      }, 1200);
    } catch (e) {
      console.error('Top up failed', e);
    } finally {
      setIsProcessingTopUp(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      fullName: editName,
      phoneNumber: editPhone,
      nationalCode: editNationalCode,
      email: editEmail,
    });
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 2500);
  };

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCodeInput.trim()) return;

    const matched = userTickets.find(t => 
      t.qrCodeSeed?.toLowerCase().includes(scanCodeInput.trim().toLowerCase()) ||
      t.id?.toLowerCase().includes(scanCodeInput.trim().toLowerCase())
    );

    if (matched) {
      setScanResult({
        status: 'valid',
        message: 'بلیت معتبر است. ورود مجاز می‌باشد.',
        ticket: matched
      });
    } else {
      setScanResult({
        status: 'invalid',
        message: 'بارکد در سامانه یافت نشد یا منقضی گردیده است.'
      });
    }
  };

  // Sidebar navigation definitions
  const audienceTabs: { id: AudienceTab; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { id: 'tickets', label: 'بلیت‌های من', icon: Ticket, count: userTickets.length },
    { id: 'saved', label: 'نشان‌شده‌ها و علاقه‌مندی‌ها', icon: Bookmark, count: savedEvents.length },
    { id: 'wallet', label: 'کیف پول و تخفیف‌ها', icon: Wallet },
    { id: 'settings', label: 'مشخصات و امنیت حساب', icon: Settings },
  ];

  const creatorTabs: { id: CreatorTab; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { id: 'creator-events', label: 'رویدادها و پرونده‌های من', icon: Building, count: userProposals.length },
    { id: 'creator-analytics', label: 'آمار و فروش گیشه', icon: BarChart3 },
    { id: 'creator-scanner', label: 'اسکنر کنترل بلیت ورودی', icon: ScanLine },
    { id: 'creator-payouts', label: 'تسویه حساب و شبا', icon: Landmark },
    { id: 'creator-settings', label: 'هویت هنری و مجوزها', icon: BadgeCheck },
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#090B10] text-slate-100 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-[#FF3366] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#090B10] text-[#E8EAED]' : 'bg-[#F8FAFC] text-slate-900'
    }`} dir="rtl">
      
      {/* 1. Standard Global Navbar */}
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          navigate(`/?cat=${cat}`);
        }}
        onOpenTickets={() => setIsTicketsDrawerOpen(true)}
        onOpenSaved={() => setIsSavedEventsModalOpen(true)}
        onOpenCreateEvent={() => navigate('/create-event')}
        siteSettings={siteSettings!}
        cities={CITIES_LIST}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        savedCount={savedEvents.length}
        ticketsCount={userTickets.length}
      />

      {/* 2. Main Profile Layout with standard top padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-16">
        
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* ======================================================== */}
          {/* RIGHT COLUMN: Minimalist Profile Sidebar with Switcher    */}
          {/* ======================================================== */}
          <aside className="w-full lg:w-72 shrink-0 space-y-4">
            
            {/* 1. DUAL MODE SWITCHER (Segmented Control) */}
            <div className={`p-1.5 rounded-2xl border flex items-center gap-1 ${
              isDark ? 'bg-[#0E111A] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <button
                type="button"
                onClick={() => handleModeChange('audience')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  userMode === 'audience'
                    ? 'bg-[#FF3366] text-white shadow-md shadow-[#FF3366]/20'
                    : isDark ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>پنل تماشاگر</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('creator')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  userMode === 'creator'
                    ? 'bg-gradient-to-l from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20'
                    : isDark ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>پنل صاحب اثر</span>
              </button>
            </div>

            {/* 2. User Profile Identity Mini Card */}
            <div className={`p-5 rounded-3xl border transition-all ${
              isDark 
                ? 'bg-[#0E111A] border-white/[0.08]' 
                : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-3.5 mb-4">
                <div className={`w-12 h-12 rounded-2xl p-[1.5px] shadow-md shrink-0 ${
                  userMode === 'creator'
                    ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-purple-500/20'
                    : 'bg-gradient-to-tr from-[#FF3366] to-[#F59E0B] shadow-[#FF3366]/20'
                }`}>
                  <div className={`w-full h-full rounded-[14px] flex items-center justify-center font-display font-black text-lg ${
                    isDark ? 'bg-[#121522] text-white' : 'bg-white text-slate-900'
                  }`}>
                    {currentUser.fullName ? currentUser.fullName[0] : 'U'}
                  </div>
                </div>

                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-bold text-sm truncate">
                      {currentUser.fullName}
                    </h2>
                    {userMode === 'creator' && (
                      <BadgeCheck className="w-4 h-4 text-purple-400 shrink-0" title="صاحب اثر تاییدشده" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 truncate">
                    {userMode === 'creator' ? 'تهیه‌کننده و مدیر سالن' : toPersianDigits(currentUser.phoneNumber || '')}
                  </p>
                </div>
              </div>

              {/* Status bar depending on mode */}
              {userMode === 'audience' ? (
                <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-zinc-400 font-medium">موجودی:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-emerald-500">
                      {toPersianDigits(formatPrice(currentUser.walletBalance || 0))}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">تومان</span>
                    <button
                      type="button"
                      onClick={() => setShowTopUpModal(true)}
                      className="mr-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 text-xs font-bold transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-purple-950/20 border-purple-500/20' : 'bg-purple-50 border-purple-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-zinc-400 font-medium">فروش کل:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-purple-400">
                      {toPersianDigits(formatPrice(creatorStats.totalRevenue))}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">تومان</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Sidebar Navigation Tabs */}
            <div className={`p-2 rounded-3xl border space-y-1 ${
              isDark ? 'bg-[#0E111A] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              {(userMode === 'audience' ? audienceTabs : creatorTabs).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const activeColorClass = userMode === 'creator'
                  ? 'bg-gradient-to-l from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
                  : 'bg-[#FF3366] text-white shadow-md shadow-[#FF3366]/20';

                return (
                  <button
                    key={`nav-item-${tab.id}`}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? activeColorClass
                        : isDark
                          ? 'text-zinc-400 hover:text-white hover:bg-white/5'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>

                    {typeof tab.count === 'number' && tab.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : isDark ? 'bg-white/10 text-zinc-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {toPersianDigits(tab.count)}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className={`my-2 h-px ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />

              {userMode === 'creator' ? (
                <Link
                  to="/create-event"
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isDark ? 'hover:bg-white/5 text-purple-400' : 'hover:bg-purple-50 text-purple-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <PlusCircle className="w-4 h-4" />
                    <span>ایجاد رویداد جدید</span>
                  </div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">گیشه</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => handleModeChange('creator')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isDark ? 'hover:bg-white/5 text-purple-400' : 'hover:bg-purple-50 text-purple-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4" />
                    <span>سوئیچ به پنل صاحب اثر</span>
                  </div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">میزبانی</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                  isDark ? 'text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>خروج از حساب</span>
              </button>
            </div>

          </aside>

          {/* ======================================================== */}
          {/* LEFT COLUMN: Clean Minimalist Main Content Panel          */}
          {/* ======================================================== */}
          <section className="flex-1 min-w-0 w-full space-y-6">
            
            {/* ====================================================== */}
            {/* AUDIENCE MODE TABS                                     */}
            {/* ====================================================== */}

            {/* TAB 1: MY TICKETS (Audience) */}
            {activeTab === 'tickets' && (
              <div className="space-y-4 animate-fade-in">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/5">
                  <div>
                    <h3 className="font-display font-black text-lg">بلیت‌های من</h3>
                    <p className="text-xs text-zinc-400">بلیت‌های فعال، سانس‌های رزرو شده و بارکد اختصاصی ورود به سالن</p>
                  </div>

                  {userTickets.length > 0 && (
                    <div className="relative min-w-[200px]">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="جستجوی نام رویداد..."
                        className={`w-full py-2 pr-3 pl-8 rounded-xl border text-xs focus:outline-none ${
                          isDark 
                            ? 'border-white/10 bg-white/5 text-white focus:border-[#FF3366]' 
                            : 'border-slate-200 bg-white text-slate-900 focus:border-[#FF3366]'
                        }`}
                      />
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  )}
                </div>

                {filteredTickets.length === 0 ? (
                  <div className={`p-10 rounded-3xl border text-center space-y-3 ${
                    isDark ? 'bg-[#0E111A] border-white/5' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <Ticket className="w-10 h-10 text-zinc-400 mx-auto" />
                    <h4 className="font-bold text-sm">هیچ بلیتی در حساب شما ثبت نشده است</h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      می‌توانید با مراجعه به صفحه اصلی، تئاترها و کنسرت‌های فعال را رزرو فرمایید.
                    </p>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF3366] text-white text-xs font-bold hover:brightness-110 shadow-md shadow-[#FF3366]/20 transition-all"
                    >
                      <span>مشاهده رویدادهای زنده گیشه</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTickets.map((ticket, idx) => {
                      const matchedEvent = allEventsList.find(e => e.id === ticket.eventId || e.title === ticket.eventTitle);
                      const imageUrl = matchedEvent?.imageUrl || 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80';
                      const venueName = matchedEvent?.venue || 'سالن اصلی رویداد';

                      return (
                        <div
                          key={`ticket-pass-${ticket.id || 't'}-${idx}`}
                          className={`rounded-3xl border overflow-hidden transition-all flex flex-col md:flex-row items-stretch ${
                            isDark 
                              ? 'bg-[#0E111A] border-white/[0.08] hover:border-white/20' 
                              : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                          }`}
                        >
                          <div className="md:w-48 h-32 md:h-auto relative shrink-0 overflow-hidden bg-black/40">
                            <img
                              src={imageUrl}
                              alt={ticket.eventTitle}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 md:from-black/60 via-transparent to-transparent" />
                            <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                              {ticket.tier?.name || 'بلیت عادی'}
                            </span>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between space-y-3 min-w-0">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/25 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>تاییدشده و معتبر</span>
                                </span>
                                <span className="text-xs text-zinc-400 font-medium">
                                  کد: {toPersianDigits(ticket.qrCodeSeed || '')}
                                </span>
                              </div>

                              <h4 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                                {ticket.eventTitle}
                              </h4>

                              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                <span className="truncate">{venueName}</span>
                              </p>
                            </div>

                            <div className={`p-3 rounded-2xl grid grid-cols-3 gap-2 text-xs border ${
                              isDark ? 'bg-black/30 border-white/5 text-zinc-300' : 'bg-slate-50 border-slate-100 text-slate-700'
                            }`}>
                              <div>
                                <span className="text-[10px] text-zinc-400 block font-medium">سانس اجرا:</span>
                                <strong className="font-bold text-slate-900 dark:text-white">
                                  {toPersianDigits(ticket.selectedTime)}
                                </strong>
                              </div>
                              <div>
                                <span className="text-[10px] text-zinc-400 block font-medium">شماره صندلی:</span>
                                <strong className="font-bold text-emerald-500">
                                  {toPersianDigits(ticket.seatLabel || 'آزاد')}
                                </strong>
                              </div>
                              <div>
                                <span className="text-[10px] text-zinc-400 block font-medium">مبلغ پرداختی:</span>
                                <strong className="font-bold text-slate-900 dark:text-white">
                                  {toPersianDigits(formatPrice(ticket.price))} ت
                                </strong>
                              </div>
                            </div>
                          </div>

                          <div className={`relative p-5 md:w-48 shrink-0 flex flex-col justify-center items-center gap-2.5 border-t md:border-t-0 md:border-r border-dashed ${
                            isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/70'
                          }`}>
                            <button
                              type="button"
                              onClick={() => setSelectedTicketQr(ticket)}
                              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#FF5533] text-white text-xs font-bold shadow-md shadow-[#FF3366]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <QrCode className="w-4 h-4" />
                              <span>بارکد گیت ورود</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const fullTicket: PurchasedTicket = {
                                  ...ticket,
                                  event: ticket.event || matchedEvent || (allEventsList.find(e => e.id === ticket.eventId) as ArtEvent) || {
                                    id: ticket.eventId || 'ev-1',
                                    title: ticket.eventTitle,
                                    subtitle: '',
                                    category: 'theater',
                                    priceFrom: ticket.price,
                                    rating: 4.8,
                                    reviewsCount: 12,
                                    imageUrl: imageUrl,
                                    wideBannerUrl: imageUrl,
                                    venue: venueName,
                                    city: 'تهران',
                                    startDate: ticket.selectedDate || '۱۴۰۵/۰۲/۱۵',
                                    status: 'فروش فعال',
                                    highlightTags: ['بلیت معتبر']
                                  }
                                };
                                setActivePdfTicket(fullTicket);
                              }}
                              className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                isDark 
                                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200' 
                                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
                              }`}
                            >
                              <Printer className="w-3.5 h-3.5 text-purple-400" />
                              <span>چاپ / PDF بلیت</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>


                )}

              </div>
            )}

            {/* TAB 2: SAVED (Audience) */}
            {activeTab === 'saved' && (
              <div className="space-y-4 animate-fade-in">
                <div className="pb-3 border-b border-black/5 dark:border-white/5">
                  <h3 className="font-display font-black text-lg">رویدادهای نشان‌شده</h3>
                  <p className="text-xs text-zinc-400">آثار هنری و نمایش‌هایی که برای رزرو بعدی نشان کرده‌اید</p>
                </div>

                {savedEvents.length === 0 ? (
                  <div className={`p-10 rounded-3xl border text-center space-y-3 ${
                    isDark ? 'bg-[#0E111A] border-white/5' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <Bookmark className="w-10 h-10 text-zinc-400 mx-auto" />
                    <h4 className="font-bold text-sm">هنوز رویدادی را نشان نکرده‌اید</h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      با زدن روی علامت بوک‌مارک در صفحه اصلی، رویدادهای دلخواه خود را در این بخش نگهداری کنید.
                    </p>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold transition-all"
                    >
                      <span>مرور رویدادها</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedEvents.map((evt, idx) => (
                      <div
                        key={`saved-card-${evt.id || 'e'}-${idx}`}
                        className={`rounded-3xl border overflow-hidden transition-all flex flex-col justify-between group ${
                          isDark ? 'bg-[#0E111A] border-white/[0.08] hover:border-[#FF3366]/40' : 'bg-white border-slate-200 shadow-sm hover:border-[#FF3366]/40'
                        }`}
                      >
                        <div className="relative h-36 overflow-hidden">
                          <img
                            src={evt.imageUrl}
                            alt={evt.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <span className="absolute bottom-2.5 right-3 text-[10px] font-bold text-white">
                            {evt.category === 'theater' ? 'تئاتر' : evt.category === 'concert' ? 'کنسرت' : 'هنر تجسمی'}
                          </span>
                        </div>

                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-sm group-hover:text-[#FF3366] transition-colors line-clamp-1">
                              {evt.title}
                            </h4>
                            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-zinc-500" />
                              <span className="truncate">{evt.venue}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                            <span className="text-xs font-bold text-emerald-500">
                              {toPersianDigits(formatPrice(evt.price))} تومان
                            </span>

                            <Link
                              to="/"
                              className="px-3 py-1.5 rounded-xl bg-[#FF3366] text-white text-xs font-bold hover:brightness-110 shadow-sm transition-all"
                            >
                              خرید بلیت
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: WALLET (Audience) */}
            {activeTab === 'wallet' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/5">
                  <div>
                    <h3 className="font-display font-black text-lg">کیف پول و تراکنش‌ها</h3>
                    <p className="text-xs text-zinc-400">شارژ آنلاین حساب و سوابق پرداخت‌های گیشه</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTopUpModal(true)}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>افزایش موجودی</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-[#182035] to-[#0A0D18] text-white border border-white/10 shadow-lg flex flex-col justify-between h-48">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-sm text-zinc-300">آرتیکت کارت</span>
                      <Wallet className="w-5 h-5 text-emerald-400" />
                    </div>

                    <div>
                      <span className="text-xs text-zinc-400 block mb-1">موجودی کیف پول:</span>
                      <div className="font-bold text-2xl text-emerald-400">
                        {toPersianDigits(formatPrice(currentUser.walletBalance || 0))} <span className="text-xs font-normal text-zinc-300">تومان</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/10">
                      <span>{currentUser.fullName}</span>
                      <span>**** {toPersianDigits(currentUser.phoneNumber?.slice(-4) || '1405')}</span>
                    </div>
                  </div>

                  <div className={`md:col-span-7 p-5 rounded-3xl border space-y-3 ${
                    isDark ? 'bg-[#0E111A] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                      <History className="w-3.5 h-3.5 text-[#FF3366]" />
                      <span>تراکنش‌های اخیر</span>
                    </h4>

                    <div className="space-y-2">
                      <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                        isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'
                      }`}>
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">+</span>
                          <div>
                            <div className="font-bold">هدیه عضویت در سامانه</div>
                            <div className="text-[10px] text-zinc-400">شارژ خوش‌آمدگویی</div>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-500">+۱۰۰,۰۰۰ تومان</span>
                      </div>

                      {userTickets.map((t, idx) => (
                        <div key={`wallet-history-${t.id || 't'}-${idx}`} className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                          isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'
                        }`}>
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-[#FF3366] flex items-center justify-center font-bold">-</span>
                            <div>
                              <div className="font-bold truncate max-w-[150px] sm:max-w-[200px]">{t.eventTitle}</div>
                              <div className="text-[10px] text-zinc-400">خرید بلیت</div>
                            </div>
                          </div>
                          <span className="font-bold text-rose-500">-{toPersianDigits(formatPrice(t.price))} تومان</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SETTINGS (Audience) */}
            {activeTab === 'settings' && (
              <div className={`max-w-xl p-6 rounded-3xl border space-y-6 animate-fade-in ${
                isDark ? 'bg-[#0E111A] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="space-y-0.5 border-b border-black/5 dark:border-white/5 pb-3">
                  <h3 className="font-display font-black text-base">ویرایش مشخصات حساب کاربری</h3>
                  <p className="text-xs text-zinc-400">اطلاعات هویتی برای صدور بلیت‌های رسمی و احراز هویت در گیشه</p>
                </div>

                {profileSaveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تغییرات با موفقیت ذخیره شد.</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-400">نام و نام خانوادگی *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`w-full p-3 rounded-xl border text-xs font-bold focus:outline-none ${
                        isDark ? 'border-white/10 bg-white/5 text-white focus:border-[#FF3366]' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#FF3366]'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-400">شماره تلفن همراه *</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className={`w-full p-3 rounded-xl border text-xs focus:outline-none ${
                          isDark ? 'border-white/10 bg-white/5 text-white focus:border-[#FF3366]' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#FF3366]'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-400">کد ملی ۱۰ رقمی *</label>
                      <input
                        type="text"
                        value={editNationalCode}
                        onChange={(e) => setEditNationalCode(e.target.value)}
                        className={`w-full p-3 rounded-xl border text-xs focus:outline-none ${
                          isDark ? 'border-white/10 bg-white/5 text-white focus:border-[#FF3366]' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#FF3366]'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-400">ایمیل (پست الکترونیک)</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      dir="ltr"
                      className={`w-full p-3 rounded-xl border text-xs focus:outline-none ${
                        isDark ? 'border-white/10 bg-white/5 text-white focus:border-[#FF3366]' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#FF3366]'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white font-black text-xs shadow-md shadow-[#FF3366]/20 hover:brightness-110 transition-all cursor-pointer"
                  >
                    ذخیره تغییرات مشخصات
                  </button>
                </form>
              </div>
            )}

            {/* ====================================================== */}
            {/* CREATOR STUDIO TABS                                    */}
            {/* ====================================================== */}

            {/* CREATOR TAB 1: MY EVENTS & PROPOSALS */}
            {activeTab === 'creator-events' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/5">
                  <div>
                    <h3 className="font-display font-black text-lg">رویدادها و پرونده‌های میزبانی</h3>
                    <p className="text-xs text-zinc-400">استعلام و پیگیری مرحله‌ای مجوزهای ارشاد، اماکن و انتشار گیشه</p>
                  </div>

                  <Link
                    to="/create-event"
                    className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-l from-purple-600 to-indigo-600 text-white hover:brightness-110 shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>ثبت اثر جدید</span>
                  </Link>
                </div>

                {filteredProposals.length === 0 ? (
                  <div className={`p-10 rounded-3xl border text-center space-y-3 ${
                    isDark ? 'bg-[#0E111A] border-white/5' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <Building className="w-10 h-10 text-purple-400 mx-auto" />
                    <h4 className="font-bold text-sm">شما هنوز اثری برای میزبانی ثبت نکرده‌اید</h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      می‌توانید تئاتر، کنسرت یا گالری هنری خود را ثبت کنید تا پس از بررسی مدارک، بلیت‌فروشی آنلاین شروع شود.
                    </p>
                    <Link
                      to="/create-event"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>ثبت و میزبانی اولین رویداد</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProposals.map((prop, idx) => (
                      <div
                        key={`profile-proposal-${prop.id || 'p'}-${idx}`}
                        className={`p-5 rounded-3xl border transition-all space-y-4 ${
                          isDark ? 'bg-[#0E111A] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-3">
                          <div>
                            <h4 className="font-bold text-base">{prop.title}</h4>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              سالن: {prop.venueName} • تهیه‌کننده: {prop.producerName}
                            </p>
                          </div>

                          <div>
                            {prop.status === 'approved' ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>تایید و در حال فروش</span>
                              </span>
                            ) : prop.status === 'reviewing' ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/25 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>در حال تطبیق مدارک</span>
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/25 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>در انتظار بررسی کارشناس</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 4 Step Timeline */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center gap-1.5 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>۱. ثبت اطلاعات</span>
                          </div>
                          <div className={`p-2.5 rounded-xl flex items-center gap-1.5 ${
                            prop.status === 'approved' || prop.status === 'reviewing'
                              ? 'bg-emerald-500/10 text-emerald-500 font-bold'
                              : isDark ? 'bg-white/5 text-zinc-500' : 'bg-slate-100 text-slate-400'
                          }`}>
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>۲. بررسی ارشاد</span>
                          </div>
                          <div className={`p-2.5 rounded-xl flex items-center gap-1.5 ${
                            prop.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-500 font-bold'
                              : isDark ? 'bg-white/5 text-zinc-500' : 'bg-slate-100 text-slate-400'
                          }`}>
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>۳. تایید اماکن</span>
                          </div>
                          <div className={`p-2.5 rounded-xl flex items-center gap-1.5 ${
                            prop.status === 'approved'
                              ? 'bg-purple-500/20 text-purple-400 font-bold'
                              : isDark ? 'bg-white/5 text-zinc-500' : 'bg-slate-100 text-slate-400'
                          }`}>
                            <Award className="w-3.5 h-3.5 shrink-0" />
                            <span>۴. فروش گیشه</span>
                          </div>
                        </div>

                        <div className={`p-3 rounded-2xl flex items-center justify-between text-xs ${
                          isDark ? 'bg-black/30 text-zinc-400' : 'bg-slate-50 text-slate-600'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span>کد رهگیری پرونده:</span>
                            <strong className="font-bold text-purple-400">
                              {toPersianDigits(prop.trackingCode || '')}
                            </strong>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(prop.trackingCode)}
                              className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                              title="کپی کد رهگیری"
                            >
                              {copiedCode === prop.trackingCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          <span>تاریخ ثبت: {toPersianDigits(prop.submittedAt || '۱۴۰۵/۰۱/۱۵')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CREATOR TAB 2: BOX OFFICE ANALYTICS */}
            {activeTab === 'creator-analytics' && (
              <div className="space-y-6 animate-fade-in">
                <div className="pb-3 border-b border-black/5 dark:border-white/5">
                  <h3 className="font-display font-black text-lg">آمار و گزارش فروش گیشه</h3>
                  <p className="text-xs text-zinc-400">تحلیل زنده فروش بلیت‌ها، درصد پر بودن سالن‌ها و درآمد ناخالص</p>
                </div>

                {/* 4 Minimal KPI Cards for Creator */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0E111A] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <span className="text-xs text-zinc-400 block mb-1">درآمد کل گیشه:</span>
                    <div className="font-bold text-base sm:text-lg text-purple-400">
                      {toPersianDigits(formatPrice(creatorStats.totalRevenue))} <span className="text-xs font-normal text-zinc-400">ت</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0E111A] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <span className="text-xs text-zinc-400 block mb-1">بلیت‌های فروخته‌شده:</span>
                    <div className="font-bold text-base sm:text-lg text-emerald-500">
                      {toPersianDigits(creatorStats.totalTicketsSold)} <span className="text-xs font-normal text-zinc-400">عدد</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0E111A] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <span className="text-xs text-zinc-400 block mb-1">میانگین تکمیل سالن:</span>
                    <div className="font-bold text-base sm:text-lg text-amber-500">
                      ٪{toPersianDigits(creatorStats.averageOccupancy)}
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0E111A] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <span className="text-xs text-zinc-400 block mb-1">رویدادهای فعال:</span>
                    <div className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                      {toPersianDigits(creatorStats.totalEvents || 1)}
                    </div>
                  </div>
                </div>

                {/* Sales Breakdown by event */}
                <div className={`p-5 rounded-3xl border space-y-4 ${
                  isDark ? 'bg-[#0E111A] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <h4 className="font-bold text-sm">عملکرد فروش به تفکیک رویداد</h4>

                  <div className="space-y-3 text-xs">
                    {(userProposals.length > 0 ? userProposals : [{ id: 'demo', title: 'نمایش تئاتر شاهنامه', venueName: 'تالار وحدت', category: 'theater' }]).map((item, idx) => (
                      <div
                        key={`stat-row-${item.id || idx}`}
                        className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-sm block">{item.title}</span>
                          <span className="text-zinc-400">سالن: {item.venueName}</span>
                        </div>

                        <div className="flex items-center gap-4 text-left" dir="ltr">
                          <div>
                            <span className="text-[10px] text-zinc-400 block">فروش:</span>
                            <strong className="text-purple-400 font-bold">{toPersianDigits(formatPrice(18500000))} ت</strong>
                          </div>
                          <div className="border-r border-white/10 pr-4">
                            <span className="text-[10px] text-zinc-400 block">ظرفیت:</span>
                            <strong className="text-emerald-500 font-bold">٪{toPersianDigits(88)}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CREATOR TAB 3: GATE SCANNER & CHECK-IN */}
            {activeTab === 'creator-scanner' && (
              <div className="space-y-6 animate-fade-in max-w-2xl">
                <div className="pb-3 border-b border-black/5 dark:border-white/5">
                  <h3 className="font-display font-black text-lg">اسکنر و کنترل ورود گیت سالن</h3>
                  <p className="text-xs text-zinc-400">اعتبارسنجی و ابطال بلیت‌های تماشاگران با بارکد یا کد پیگیری</p>
                </div>

                <div className={`p-6 rounded-3xl border space-y-5 ${
                  isDark ? 'bg-[#0E111A] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <form onSubmit={handleSimulateScan} className="space-y-3">
                    <label className="text-xs font-bold text-zinc-400 block">
                      بارکدخوان یا کد رهگیری بلیت تماشاگر:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={scanCodeInput}
                        onChange={(e) => setScanCodeInput(e.target.value)}
                        placeholder="مثال: ART-..."
                        className={`flex-1 p-3 rounded-xl border text-xs font-bold focus:outline-none ${
                          isDark ? 'border-white/10 bg-white/5 text-white focus:border-purple-500' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-purple-500'
                        }`}
                      />
                      <button
                        type="submit"
                        className="px-5 py-3 rounded-xl bg-gradient-to-l from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-600/20 hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ScanLine className="w-4 h-4" />
                        <span>استعلام بلیت</span>
                      </button>
                    </div>
                  </form>

                  {/* Scan Result Feedback */}
                  {scanResult && (
                    <div className={`p-4 rounded-2xl border space-y-2 animate-fade-in ${
                      scanResult.status === 'valid'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                    }`}>
                      <div className="flex items-center gap-2">
                        {scanResult.status === 'valid' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="font-bold text-sm">{scanResult.message}</span>
                      </div>

                      {scanResult.ticket && (
                        <div className="pt-2 border-t border-emerald-500/20 text-xs space-y-1 text-slate-200">
                          <div>عنوان رویداد: <strong>{scanResult.ticket.eventTitle}</strong></div>
                          <div>سانس: <strong>{toPersianDigits(scanResult.ticket.selectedTime)}</strong> • صندلی: <strong>{toPersianDigits(scanResult.ticket.seatLabel || 'آزاد')}</strong></div>
                          <div>خریدار: <strong>{scanResult.ticket.customerName || currentUser.fullName}</strong></div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl border text-xs text-zinc-400 space-y-2 ${
                    isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="font-bold text-slate-200">راهنمای اپراتور گیت ورودی:</div>
                    <ul className="list-disc list-inside space-y-1 text-[11px]">
                      <li>اپراتور می‌تواند با بارکدخوان فیزیکی یا دوربین گوشی کد QR روی بلیت تماشاگر را اسکن نماید.</li>
                      <li>در صورت سبز بودن استعلام، ورود مجاز است و وضعیت بلیت به «استفاده‌شده» تغییر می‌یابد.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* CREATOR TAB 4: PAYOUTS & BANKING */}
            {activeTab === 'creator-payouts' && (
              <div className="space-y-6 animate-fade-in max-w-2xl">
                <div className="pb-3 border-b border-black/5 dark:border-white/5">
                  <h3 className="font-display font-black text-lg">تسویه حساب و حساب بانکی شبا</h3>
                  <p className="text-xs text-zinc-400">مدیریت شماره شبا، سهم فروش گیشه و ثبت درخواست تسویه مالی</p>
                </div>

                <div className={`p-6 rounded-3xl border space-y-5 ${
                  isDark ? 'bg-[#0E111A] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                      <span className="text-zinc-400 block mb-0.5">مبلغ قابل تسویه:</span>
                      <span className="font-bold text-base text-emerald-500">
                        {toPersianDigits(formatPrice(creatorStats.totalRevenue * 0.95))} تومان
                      </span>
                    </div>
                    <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                      <span className="text-zinc-400 block mb-0.5">کارمزد سامانه (٪۵):</span>
                      <span className="font-bold text-base text-zinc-400">
                        {toPersianDigits(formatPrice(creatorStats.totalRevenue * 0.05))} تومان
                      </span>
                    </div>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    setPayoutSuccess(true);
                    setTimeout(() => setPayoutSuccess(false), 3000);
                  }} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-400">شماره شبا رسمی واریز (۲۴ رقم بدون IR) *</label>
                      <input
                        type="text"
                        value={shebaNumber}
                        onChange={(e) => setShebaNumber(e.target.value)}
                        className={`w-full p-3 rounded-xl border font-bold text-xs focus:outline-none ${
                          isDark ? 'border-white/10 bg-white/5 text-white focus:border-purple-500' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-purple-500'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-400">نام بانک عامل *</label>
                      <input
                        type="text"
                        value={payoutBankName}
                        onChange={(e) => setPayoutBankName(e.target.value)}
                        className={`w-full p-3 rounded-xl border text-xs focus:outline-none ${
                          isDark ? 'border-white/10 bg-white/5 text-white focus:border-purple-500' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-purple-500'
                        }`}
                      />
                    </div>

                    {payoutSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>درخواست تسویه با موفقیت به واحد مالی ارسال گردید.</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-l from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-600/20 hover:brightness-110 transition-all cursor-pointer"
                    >
                      ثبت درخواست تسویه و واریز پایا
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* CREATOR TAB 5: CREATOR SETTINGS */}
            {activeTab === 'creator-settings' && (
              <div className={`max-w-xl p-6 rounded-3xl border space-y-6 animate-fade-in ${
                isDark ? 'bg-[#0E111A] border-white/[0.08]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="space-y-0.5 border-b border-black/5 dark:border-white/5 pb-3">
                  <h3 className="font-display font-black text-base">هویت و مجوزهای صاحب اثر</h3>
                  <p className="text-xs text-zinc-400">اطلاعات رسمی تهیه‌کننده و مدارک ثبت شرکت هنری</p>
                </div>

                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center gap-2.5 text-xs text-purple-300">
                  <BadgeCheck className="w-5 h-5 text-purple-400 shrink-0" />
                  <span>حساب شما دارای تاییدیه رسمی وزارت فرهنگ و ارشاد اسلامی است.</span>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-400">نام کامل صاحب امتیاز / تهیه‌کننده *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`w-full p-3 rounded-xl border text-xs font-bold focus:outline-none ${
                        isDark ? 'border-white/10 bg-white/5 text-white focus:border-purple-500' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-purple-500'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-400">شماره همراه تماس سازمانی *</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className={`w-full p-3 rounded-xl border text-xs focus:outline-none ${
                          isDark ? 'border-white/10 bg-white/5 text-white focus:border-purple-500' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-purple-500'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-400">شناسه ملی / کد ثبت اثر *</label>
                      <input
                        type="text"
                        value={editNationalCode}
                        onChange={(e) => setEditNationalCode(e.target.value)}
                        className={`w-full p-3 rounded-xl border text-xs focus:outline-none ${
                          isDark ? 'border-white/10 bg-white/5 text-white focus:border-purple-500' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-purple-500'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-l from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-600/20 hover:brightness-110 transition-all cursor-pointer"
                  >
                    به‌روزرسانی اطلاعات صاحب اثر
                  </button>
                </form>
              </div>
            )}

          </section>

        </div>

      </main>

      {/* 3. Global Standard Footer */}
      <Footer 
        siteSettings={siteSettings!} 
        onOpenCreateEvent={() => navigate('/create-event')} 
      />

      {/* Global Drawers & Modals */}
      <MyTicketsDrawer
        isOpen={isTicketsDrawerOpen}
        onClose={() => setIsTicketsDrawerOpen(false)}
        tickets={userTickets}
        onSelectEvent={() => {
          setIsTicketsDrawerOpen(false);
          handleTabChange('tickets');
        }}
      />

      <SavedEventsModal
        isOpen={isSavedEventsModalOpen}
        onClose={() => setIsSavedEventsModalOpen(false)}
        savedEvents={savedEvents}
        onRemoveSave={() => {}}
        onBuyTicket={() => {
          setIsSavedEventsModalOpen(false);
          navigate('/');
        }}
        onOpenDetails={() => {
          setIsSavedEventsModalOpen(false);
          navigate('/');
        }}
      />

      {/* Top-up Wallet Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className={`relative w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-4 ${
            isDark ? 'bg-[#0E111A] text-white border-white/15' : 'bg-white text-slate-900 border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-sm">افزایش موجودی کیف پول</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTopUpModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {topUpSuccess ? (
              <div className="p-4 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm">موجودی با موفقیت شارژ شد!</h4>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <span className="text-zinc-400 block">انتخاب سریع مبلغ شارژ:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[100000, 200000, 500000, 1000000, 2000000, 5000000].map((amt) => (
                    <button
                      key={`topup-btn-${amt}`}
                      type="button"
                      onClick={() => setTopUpAmount(amt)}
                      className={`p-2 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                        topUpAmount === amt
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-500'
                          : isDark ? 'border-white/10 bg-white/5 text-zinc-300' : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {toPersianDigits(amt / 1000)} ه.ت
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 block">مبلغ دلخواه (تومان):</label>
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border font-bold text-emerald-500 focus:outline-none ${
                      isDark ? 'border-white/10 bg-black/40' : 'border-slate-200 bg-slate-50'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTopUpWallet}
                  disabled={isProcessingTopUp || topUpAmount <= 0}
                  className="w-full py-3 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessingTopUp ? 'اتصال به درگاه پرداخت...' : `پرداخت امن ${toPersianDigits(formatPrice(topUpAmount))} تومان`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal for Ticket */}
      {selectedTicketQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className={`relative w-full max-w-xs rounded-3xl border p-6 shadow-2xl space-y-4 text-center ${
            isDark ? 'bg-[#0E111A] text-white border-white/15' : 'bg-white text-slate-900 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setSelectedTicketQr(null)}
              className="absolute top-4 left-4 p-1 rounded-full text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-0.5">
              <h4 className="font-bold text-sm">{selectedTicketQr.eventTitle}</h4>
              <p className="text-xs text-zinc-400">
                {selectedTicketQr.tier?.name} • سانس {toPersianDigits(selectedTicketQr.selectedTime)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white flex items-center justify-center mx-auto w-44 h-44 shadow-lg">
              <QrCode className="w-36 h-36 text-black" />
            </div>

            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#FF3366] block">
                کد رهگیری: {toPersianDigits(selectedTicketQr.qrCodeSeed || '')}
              </span>
              <p className="text-[10px] text-zinc-400">
                این بارکد را هنگام ورود به تالار به اپراتور نشان دهید.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Printable / PDF Ticket Modal */}
      {activePdfTicket && (
        <PrintableTicketPdf
          ticket={activePdfTicket}
          onClose={() => setActivePdfTicket(null)}
        />
      )}


      {/* Confirm Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className={`relative w-full max-w-xs rounded-3xl border p-6 shadow-2xl space-y-4 text-center ${
            isDark ? 'bg-[#0E111A] text-white border-rose-500/30' : 'bg-white text-slate-900 border-rose-200'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm">خروج از حساب کاربری</h3>
              <p className="text-xs text-zinc-400">
                آیا از خروج از حساب خود اطمینان دارید؟
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  isDark ? 'border-white/10 bg-white/5 text-zinc-300' : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                انصراف
              </button>
              
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                تایید و خروج
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
