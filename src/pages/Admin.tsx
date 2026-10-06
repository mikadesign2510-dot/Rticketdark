import React, { useState, useEffect } from 'react';
import { 
  ArtEvent, 
  PurchasedTicket, 
  Venue, 
  Coupon,
  SiteUser,
  AdminOrganizer,
  EventProposal
} from '../types';
import { 
  fetchEvents, 
  saveEvent, 
  deleteEvent, 
  fetchSettings, 
  saveSettings, 
  SiteSettings, 
  defaultSettings,
  fetchBanners, 
  saveBanner, 
  deleteBanner, 
  HeroBanner, 
  fetchSecondBanners, 
  saveSecondBanner, 
  deleteSecondBanner, 
  SecondBanner,
  fetchVenues,
  saveVenue,
  deleteVenue,
  fetchCoupons,
  saveCoupon,
  deleteCoupon,
  fetchOrders,
  deleteOrder,
  fetchSiteUsers,
  saveSiteUser,
  deleteSiteUser,
  fetchAdminOrganizers,
  saveAdminOrganizer,
  deleteAdminOrganizer,
  fetchEventProposals,
  saveEventProposal,
  deleteEventProposal,
  approveAndPublishProposal
} from '../lib/db';
import { useTheme } from '../context/ThemeContext';
import { AdminSidebar, AdminTab } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { DashboardOverviewTab } from '../components/admin/DashboardOverviewTab';
import { EventsManagementTab } from '../components/admin/EventsManagementTab';
import { EventProposalsTab } from '../components/admin/EventProposalsTab';
import { OrdersManagementTab } from '../components/admin/OrdersManagementTab';
import { UsersManagementTab } from '../components/admin/UsersManagementTab';
import { AdminsManagementTab } from '../components/admin/AdminsManagementTab';
import { VenuesManagementTab } from '../components/admin/VenuesManagementTab';
import { BannersManagementTab } from '../components/admin/BannersManagementTab';
import { CouponsManagementTab } from '../components/admin/CouponsManagementTab';
import { AppearanceTab } from '../components/admin/AppearanceTab';
import { SettingsTab } from '../components/admin/SettingsTab';
import { PrintableTicketPdf } from '../components/PrintableTicketPdf';
import { Loader2 } from 'lucide-react';

export default function Admin() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Entities state
  const [events, setEvents] = useState<ArtEvent[]>([]);
  const [orders, setOrders] = useState<PurchasedTicket[]>([]);
  const [users, setUsers] = useState<SiteUser[]>([]);
  const [admins, setAdmins] = useState<AdminOrganizer[]>([]);
  const [proposals, setProposals] = useState<EventProposal[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [secondBanners, setSecondBanners] = useState<SecondBanner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  // Modal states
  const [editingEvent, setEditingEvent] = useState<Partial<ArtEvent> | null>(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<PurchasedTicket | null>(null);

  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      const [
        loadedEvents,
        loadedOrders,
        loadedVenues,
        loadedBanners,
        loadedSecondBanners,
        loadedCoupons,
        loadedSettings,
        loadedUsers,
        loadedAdmins,
        loadedProposals
      ] = await Promise.all([
        fetchEvents(),
        fetchOrders(),
        fetchVenues(),
        fetchBanners(),
        fetchSecondBanners(),
        fetchCoupons(),
        fetchSettings(),
        fetchSiteUsers(),
        fetchAdminOrganizers(),
        fetchEventProposals()
      ]);

      setEvents(loadedEvents);
      setOrders(loadedOrders);
      setVenues(loadedVenues);
      setBanners(loadedBanners);
      setSecondBanners(loadedSecondBanners);
      setCoupons(loadedCoupons);
      setSettings(loadedSettings);
      setUsers(loadedUsers);
      setAdmins(loadedAdmins);
      setProposals(loadedProposals);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Events handlers
  const handleSaveEvent = async (event: Partial<ArtEvent>) => {
    await saveEvent(event);
    const updated = await fetchEvents();
    setEvents(updated);
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteEvent(id);
    const updated = await fetchEvents();
    setEvents(updated);
  };

  // Proposals handlers
  const handleSaveProposal = async (proposal: Partial<EventProposal>) => {
    await saveEventProposal(proposal);
    const updated = await fetchEventProposals();
    setProposals(updated);
  };

  const handleDeleteProposal = async (id: string) => {
    await deleteEventProposal(id);
    const updated = await fetchEventProposals();
    setProposals(updated);
  };

  const handleApproveAndPublish = async (id: string) => {
    const newEventId = await approveAndPublishProposal(id);
    const updatedProps = await fetchEventProposals();
    const updatedEvents = await fetchEvents();
    const updatedAdmins = await fetchAdminOrganizers();
    setProposals(updatedProps);
    setEvents(updatedEvents);
    setAdmins(updatedAdmins);
    return newEventId;
  };

  // Orders handlers
  const handleDeleteOrder = async (ticketId: string) => {
    await deleteOrder(ticketId);
    const updated = await fetchOrders();
    setOrders(updated);
  };

  // Users handlers
  const handleSaveUser = async (user: Partial<SiteUser>) => {
    await saveSiteUser(user);
    const updated = await fetchSiteUsers();
    setUsers(updated);
  };

  const handleDeleteUser = async (id: string) => {
    await deleteSiteUser(id);
    const updated = await fetchSiteUsers();
    setUsers(updated);
  };

  // Admins & Organizers handlers
  const handleSaveAdmin = async (admin: Partial<AdminOrganizer>) => {
    await saveAdminOrganizer(admin);
    const updated = await fetchAdminOrganizers();
    setAdmins(updated);
  };

  const handleDeleteAdmin = async (id: string) => {
    await deleteAdminOrganizer(id);
    const updated = await fetchAdminOrganizers();
    setAdmins(updated);
  };

  // Venues handlers
  const handleSaveVenue = async (venue: Partial<Venue>) => {
    await saveVenue(venue);
    const updated = await fetchVenues();
    setVenues(updated);
  };

  const handleDeleteVenue = async (id: string) => {
    await deleteVenue(id);
    const updated = await fetchVenues();
    setVenues(updated);
  };

  // Banners handlers
  const handleSaveBanner = async (banner: Partial<HeroBanner>) => {
    await saveBanner(banner);
    const updated = await fetchBanners();
    setBanners(updated);
  };

  const handleDeleteBanner = async (id: string) => {
    await deleteBanner(id);
    const updated = await fetchBanners();
    setBanners(updated);
  };

  const handleSaveSecondBanner = async (banner: Partial<SecondBanner>) => {
    await saveSecondBanner(banner);
    const updated = await fetchSecondBanners();
    setSecondBanners(updated);
  };

  const handleDeleteSecondBanner = async (id: string) => {
    await deleteSecondBanner(id);
    const updated = await fetchSecondBanners();
    setSecondBanners(updated);
  };

  // Coupons handlers
  const handleSaveCoupon = async (coupon: Partial<Coupon>) => {
    await saveCoupon(coupon);
    const updated = await fetchCoupons();
    setCoupons(updated);
  };

  const handleDeleteCoupon = async (id: string) => {
    await deleteCoupon(id);
    const updated = await fetchCoupons();
    setCoupons(updated);
  };

  // Settings handlers
  const handleSaveSettings = async (newSettings: SiteSettings) => {
    await saveSettings(newSettings);
    setSettings(newSettings);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'داشبورد و آمار تحلیلی';
      case 'events': return 'مدیریت رویدادها و سانس‌ها';
      case 'proposals': return 'درخواست‌های ایجاد و میزبانی رویداد';
      case 'orders': return 'سفارشات و بلیت‌های صادرشده';
      case 'users': return 'مدیریت کاربران و مشتریان';
      case 'admins': return 'مدیریت ادمین‌ها و صاحبان اثر';
      case 'venues': return 'سالن‌ها و نقشه‌های صندلی';
      case 'banners': return 'اسلایدرها و بنرهای تبلیغاتی';
      case 'coupons': return 'کدهای تخفیف و پروموشن‌ها';
      case 'appearance': return 'شخصی‌سازی ظاهر سایت';
      case 'settings': return 'تنظیمات درگاه و سامانه';
      default: return 'پنل مدیریت';
    }
  };

  const getTabSubtitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'خلاصه فروش، بلیت‌ها و رویدادهای روی گیشه';
      case 'events': return `${events.length} رویداد در پایگاه داده`;
      case 'proposals': return `${proposals.filter(p => p.status === 'pending').length} درخواست در انتظار بررسی کارشناسان`;
      case 'orders': return `${orders.length} بلیت و فاکتور تسویه شده در سیستم`;
      case 'users': return `${users.length} کاربر ثبت‌نامی و خریدار در سامانه`;
      case 'admins': return `${admins.length} مدیر ارشد، تهیه‌کننده و صاحب اثر فعال`;
      case 'venues': return `${venues.length} سالن و تالار فرهنگی`;
      case 'banners': return `${banners.length} اسلاید هدر و ${secondBanners.length} بنر تبلیغاتی`;
      case 'coupons': return `${coupons.length} کد تخفیف فعال`;
      case 'appearance': return 'استودیوی زنده، الگوهای آماده و پیش‌نمایش ماک‌آپ مرورگر';
      case 'settings': return 'پیکربندی درگاه بانکی شاپرک، پیامک و راه‌های ارتباطی';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF3366]" />
          <span className="font-bold text-sm text-slate-700">در حال بارگذاری پنل مدیریت آرتیکت...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-100/70 text-slate-900 font-sans" dir="rtl">
      {/* 1. Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          events: events.length,
          orders: orders.length,
          proposals: proposals.filter(p => p.status === 'pending').length,
          users: users.length,
          admins: admins.length,
          venues: venues.length,
          banners: banners.length + secondBanners.length,
          coupons: coupons.length,
        }}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title={getTabTitle()}
          subtitle={getTabSubtitle()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={loadAllData}
          isRefreshing={isRefreshing}
          quickActionLabel={activeTab === 'events' ? 'رویداد جدید' : undefined}
          onQuickAction={activeTab === 'events' ? () => {
            setEditingEvent({
              title: '',
              subtitle: '',
              category: 'theater',
              categoryLabel: 'تئاتر',
              artist: '',
              artistRole: 'کارگردان',
              venue: 'تالار وحدت',
              city: 'تهران',
              country: 'ایران',
              address: '',
              startDate: '۱۴۰۵/۰۸/۰۱',
              time: '۱۹:۳۰',
              timeSlots: ['۱۸:۰۰', '۲۰:۳۰'],
              imageUrl: 'https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=800&q=80',
              priceFrom: 180,
              status: 'ظرفیت موجود',
              rating: 4.8,
              reviewsCount: 10,
              tiers: [
                { id: 't-1', name: 'همکف VIP', description: 'ویژه', price: 250, availableCount: 50, perks: ['ورود بدون صف'] }
              ],
              ticketingType: 'normal',
              isActive: true,
            });
          } : undefined}
        />

        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {activeTab === 'dashboard' && (
            <DashboardOverviewTab
              events={events}
              orders={orders}
              onNavigateToTab={setActiveTab}
              onSelectOrderForPrint={setSelectedOrderForPrint}
              onAddNewEvent={() => {
                setActiveTab('events');
                setEditingEvent({
                  title: '',
                  subtitle: '',
                  category: 'theater',
                  categoryLabel: 'تئاتر',
                  artist: '',
                  artistRole: 'کارگردان',
                  venue: 'تالار وحدت',
                  city: 'تهران',
                  country: 'ایران',
                  address: '',
                  startDate: '۱۴۰۵/۰۸/۰۱',
                  time: '۱۹:۳۰',
                  timeSlots: ['۱۸:۰۰', '۲۰:۳۰'],
                  imageUrl: 'https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=800&q=80',
                  priceFrom: 180,
                  status: 'ظرفیت موجود',
                  rating: 4.8,
                  reviewsCount: 10,
                  tiers: [
                    { id: 't-1', name: 'همکف VIP', description: 'ویژه', price: 250, availableCount: 50, perks: ['ورود بدون صف'] }
                  ],
                  ticketingType: 'normal',
                  isActive: true,
                });
              }}
            />
          )}

          {activeTab === 'events' && (
            <EventsManagementTab
              events={events}
              onSaveEvent={handleSaveEvent}
              onDeleteEvent={handleDeleteEvent}
              editingEvent={editingEvent}
              setEditingEvent={setEditingEvent}
            />
          )}

          {activeTab === 'proposals' && (
            <EventProposalsTab
              proposals={proposals}
              onSaveProposal={handleSaveProposal}
              onDeleteProposal={handleDeleteProposal}
              onApproveAndPublish={handleApproveAndPublish}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersManagementTab
              orders={orders}
              onSelectOrderForPrint={setSelectedOrderForPrint}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {activeTab === 'users' && (
            <UsersManagementTab
              users={users}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'admins' && (
            <AdminsManagementTab
              admins={admins}
              events={events}
              onSaveAdmin={handleSaveAdmin}
              onDeleteAdmin={handleDeleteAdmin}
            />
          )}

          {activeTab === 'venues' && (
            <VenuesManagementTab
              venues={venues}
              onSaveVenue={handleSaveVenue}
              onDeleteVenue={handleDeleteVenue}
            />
          )}

          {activeTab === 'banners' && (
            <BannersManagementTab
              banners={banners}
              secondBanners={secondBanners}
              onSaveBanner={handleSaveBanner}
              onDeleteBanner={handleDeleteBanner}
              onSaveSecondBanner={handleSaveSecondBanner}
              onDeleteSecondBanner={handleDeleteSecondBanner}
            />
          )}

          {activeTab === 'coupons' && (
            <CouponsManagementTab
              coupons={coupons}
              onSaveCoupon={handleSaveCoupon}
              onDeleteCoupon={handleDeleteCoupon}
            />
          )}

          {activeTab === 'appearance' && (
            <AppearanceTab
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </main>
      </div>

      {/* Official PDF Ticket Printable Modal */}
      {selectedOrderForPrint && (
        <PrintableTicketPdf
          order={selectedOrderForPrint}
          onClose={() => setSelectedOrderForPrint(null)}
        />
      )}
    </div>
  );
}
