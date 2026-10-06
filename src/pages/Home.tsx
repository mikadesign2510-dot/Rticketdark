import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchEvents, fetchSettings, fetchBanners, fetchSecondBanners, SiteSettings, HeroBanner, SecondBanner } from '../lib/db';
import { ArtEvent, EventCategory, PurchasedTicket, SelectedSeat, TicketingType } from '../types';
import { FEATURED_ART_EVENTS, CITIES_LIST } from '../data/mockEvents';
import { Navbar } from '../components/Navbar';
import { CompactHeroSearch } from '../components/CompactHeroSearch';
import TrendingSection from '../components/TrendingSection';
import CategoriesSection from '../components/CategoriesSection';
import { HeroSection } from '../components/HeroSection';
import { SecondSlider } from '../components/SecondSlider';
import { EventCard } from '../components/EventCard';
import { EventDetailModal } from '../components/EventDetailModal';
import { BookingModal } from '../components/BookingModal';
import { MyTicketsDrawer } from '../components/MyTicketsDrawer';
import { SavedEventsModal } from '../components/SavedEventsModal';
import { CreateEventModal } from '../components/CreateEventModal';
import { CreateEventSection } from '../components/CreateEventSection';
import { Footer } from '../components/Footer';
import { Search, LayoutGrid, List, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { toPersianDigits } from '../utils/persianNumbers';

const eventContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.15 },
  },
};

const eventCardVariants = {
  hidden: {
    opacity: 0,
    y: 22,
    scale: 0.92,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 24,
      mass: 0.7,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -8,
    transition: { duration: 0.15 },
  },
};

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [dbEvents, setDbEvents] = useState<ArtEvent[]>(FEATURED_ART_EVENTS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [secondBanners, setSecondBanners] = useState<SecondBanner[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Navigate to create event or prompt login if not authenticated
  const handleOpenCreateEvent = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/create-event');
    } else {
      navigate('/create-event');
    }
  };

  // Search & Filter State
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [artistQuery, setArtistQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('همه شهرها');
  const [dateFilter, setDateFilter] = useState<'all' | 'this-week' | 'this-month' | 'weekend'>('all');
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');

  // Bookmarks & Tickets State (persisted locally)
  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('artis_saved_event_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>(() => {
    try {
      const saved = localStorage.getItem('artis_purchased_tickets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [activeModalEvent, setActiveModalEvent] = useState<ArtEvent | null>(null);
  const [activeBookingEvent, setActiveBookingEvent] = useState<ArtEvent | null>(null);
  const [bookingInitialSlot, setBookingInitialSlot] = useState<string | undefined>(undefined);
  const [bookingInitialDate, setBookingInitialDate] = useState<string | undefined>(undefined);
  const [bookingTicketingType, setBookingTicketingType] = useState<TicketingType | undefined>(undefined);
  const [bookingSelectedSeats, setBookingSelectedSeats] = useState<SelectedSeat[] | undefined>(undefined);
  const [isTicketsDrawerOpen, setIsTicketsDrawerOpen] = useState(false);
  const [isSavedEventsModalOpen, setIsSavedEventsModalOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);

  const handleToggleSave = (eventId: string) => {
    setSavedEventIds((prev) => {
      const next = prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId];
      try {
        localStorage.setItem('artis_saved_event_ids', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleTicketPurchased = (newTicket: PurchasedTicket) => {
    setPurchasedTickets((prev) => {
      const next = [newTicket, ...prev];
      try {
        localStorage.setItem('artis_purchased_tickets', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const savedEventsList = useMemo(() => {
    return dbEvents.filter((e) => savedEventIds.includes(e.id));
  }, [dbEvents, savedEventIds]);

  useEffect(() => {
    async function load() {
      try {
        const [evts, sets, bans, secBans] = await Promise.all([
          fetchEvents(),
          fetchSettings(),
          fetchBanners(),
          fetchSecondBanners()
        ]);
        if (evts.length > 0) setDbEvents(evts);
        if (sets) setSiteSettings(sets);
        if (bans) setBanners(bans);
        if (secBans) setSecondBanners(secBans);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDb(false);
      }
    }
    load();
  }, []);

  const filteredEvents = useMemo(() => {
    return dbEvents.filter(e => {
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'comedy') {
          const isComedy = e.title?.includes('کمدی') || 
                           e.subtitle?.includes('کمدی') || 
                           e.categoryLabel?.includes('کمدی') ||
                           e.categoryLabel?.includes('طنز') ||
                           (e.category === 'theater' && (e.title?.includes('خنده') || e.title?.includes('مکبث')));
          if (!isComedy) return false;
        } else if (e.category !== selectedCategory) {
          return false;
        }
      }
      if (searchQuery && !e.title.includes(searchQuery)) return false;
      if (artistQuery && !e.artist?.includes(artistQuery)) return false;
      if (selectedCity !== 'همه شهرها' && e.city !== selectedCity) return false;
      return true;
    });
  }, [dbEvents, selectedCategory, searchQuery, artistQuery, selectedCity, dateFilter]);

  if (loadingDb) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0A0B10]' : 'bg-[#F8FAFC]'}`}>
        <div className="w-8 h-8 border-4 border-[#FF3366] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans text-right transition-colors duration-300 ${
      isDark ? 'bg-[#0A0B10] text-[#E8EAED]' : 'bg-[#F8FAFC] text-slate-900'
    }`} dir="rtl">
      
      {/* 1. Sleek Minimalist Navigation Bar */}
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenTickets={() => setIsTicketsDrawerOpen(true)}
        onOpenSaved={() => setIsSavedEventsModalOpen(true)}
        onOpenCreateEvent={() => setIsCreateEventModalOpen(true)}
        siteSettings={siteSettings!}
        cities={CITIES_LIST}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        savedCount={savedEventIds.length}
        ticketsCount={purchasedTickets.length}
      />

      <main className={`flex-1 ${siteSettings?.heroBannerActive === false ? 'pt-28 sm:pt-36' : ''}`}>

        {/* 2. Top Cinema Banner + Compact Optimized Search Box */}
        {siteSettings?.heroBannerActive !== false && <HeroSection
          onOpenDetails={setActiveModalEvent}
          onBuyTicket={setActiveBookingEvent}
          featuredEvents={dbEvents}
          siteSettings={siteSettings!}
          banners={banners}
        />}

        {/* OPTIMIZED & COMPACT SEARCH BAR (Moved from Hero) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 mb-10 relative z-20">
          <CompactHeroSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            artistQuery={artistQuery}
            onArtistChange={setArtistQuery}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            cities={CITIES_LIST}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            onExecuteSearch={() => {
              const el = document.getElementById('events-grid-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            siteSettings={siteSettings!}
          />
        </div>

        {/* TRENDING / BESTSELLERS SECTION */}
        <TrendingSection />

        {/* CATEGORIES SECTION */}
        <CategoriesSection 
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            const el = document.getElementById('events-grid-section');
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top > window.innerHeight * 0.85 || rect.top < 0) {
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }
          }} 
        />

        {siteSettings?.secondSliderEnabled !== false && <SecondSlider banners={secondBanners} siteSettings={siteSettings!} />}

        <section id="events-grid-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[400px]">
          {/* Orderly Section Title & View Switcher Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-black/5 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1 text-xs font-bold text-[#FF3366]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>تقویم و برنامه اجراها</span>
              </div>
              <h2 className={`font-display font-black text-2xl sm:text-3xl ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                تمام رویدادها
              </h2>
            </div>

            {/* Event Count & Grid/List Toggle */}
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                isDark ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                {toPersianDigits(filteredEvents.length)} رویداد فعال
              </span>

              <div className={`flex items-center p-1 rounded-xl border ${
                isDark ? 'bg-[#111422] border-[#22283E]' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? isDark ? 'bg-white text-black shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                      : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="نمایش شبکه‌ای"
                  aria-label="نمایش شبکه‌ای"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? isDark ? 'bg-white text-black shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                      : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="نمایش لیستی"
                  aria-label="نمایش لیستی"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <AnimatePresence mode="wait">
            {filteredEvents.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`py-16 text-center rounded-3xl p-6 sm:p-8 max-w-lg mx-auto border transition-colors ${
                  isDark
                    ? 'bg-[#111422] border-[#22283E]'
                    : 'bg-white border-slate-200 shadow-md'
                }`}
              >
                <Search className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`} />
                <h3 className={`font-display font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  هیچ رویدادی منطبق بر جستجوی شما یافت نشد
                </h3>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  لطفاً فیلترها را تغییر دهید یا عبارت دیگری را جستجو کنید.
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setArtistQuery('');
                    setSelectedCategory('all');
                    setSelectedCity('همه شهرها');
                    setDateFilter('all');
                  }}
                  className="mt-4 px-5 py-2 rounded-full bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-xs font-bold text-white shadow-lg shadow-[#FF3366]/20 cursor-pointer"
                >
                  بازنشانی همه فیلترها
                </button>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <motion.div 
                key={`grid-${selectedCategory}-${selectedCity}-${searchQuery}-${artistQuery}`}
                variants={eventContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5"
              >
                {filteredEvents.map((event, idx) => (
                  <motion.div
                    key={`grid-event-${event.id}-${idx}`}
                    variants={eventCardVariants}
                    layout
                    className="w-full flex justify-center"
                  >
                    <EventCard
                      event={event}
                      isSaved={savedEventIds.includes(event.id)}
                      onToggleSave={handleToggleSave}
                      onOpenDetails={setActiveModalEvent}
                      onBuyTicket={setActiveBookingEvent}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key={`list-${selectedCategory}-${selectedCity}-${searchQuery}-${artistQuery}`}
                variants={eventContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col gap-3"
              >
                {filteredEvents.map((event, idx) => (
                  <motion.div
                    key={`list-event-${event.id}-${idx}`}
                    variants={eventCardVariants}
                    layout
                    className="w-full"
                  >
                    <EventCard
                      event={event}
                      viewMode="list"
                      isSaved={savedEventIds.includes(event.id)}
                      onToggleSave={handleToggleSave}
                      onOpenDetails={setActiveModalEvent}
                      onBuyTicket={setActiveBookingEvent}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 3. DEDICATED PRODUCER & CREATOR EVENT SUBMISSION SECTION */}
        <CreateEventSection 
          onOpenModal={handleOpenCreateEvent} 
          siteSettings={siteSettings!} 
        />


      </main>

      <Footer 
        siteSettings={siteSettings!} 
        onOpenCreateEvent={handleOpenCreateEvent} 
      />

      <AnimatePresence>
        {activeModalEvent && (
          <EventDetailModal
            key={`detail-modal-${activeModalEvent.id}`}
            event={activeModalEvent}
            isSaved={savedEventIds.includes(activeModalEvent.id)}
            onToggleSave={handleToggleSave}
            onClose={() => setActiveModalEvent(null)}
            onBuyTicket={(evt, initialSlot, initialDate, ticketingType, selectedSeats) => {
              // باز شدن پنجره رزرو بلیت دقیقاً روی همان صفحه اثر؛ با بستن پاپ‌آپ، مخاطب در همین صفحه می‌ماند
              setBookingInitialSlot(initialSlot);
              setBookingInitialDate(initialDate);
              setBookingTicketingType(ticketingType);
              setBookingSelectedSeats(selectedSeats);
              setActiveBookingEvent(evt || activeModalEvent);
            }}
            onTicketPurchased={handleTicketPurchased}
            siteSettings={siteSettings!}
            onOpenTickets={() => {
              setActiveModalEvent(null);
              setIsTicketsDrawerOpen(true);
            }}
            onOpenSaved={() => {
              setActiveModalEvent(null);
              setIsSavedEventsModalOpen(true);
            }}
            savedCount={savedEventIds.length}
            ticketsCount={purchasedTickets.length}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
            cities={CITIES_LIST}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {activeBookingEvent && (
          <BookingModal
            key={`booking-modal-${activeBookingEvent.id}`}
            event={activeBookingEvent}
            onClose={() => {
              setActiveBookingEvent(null);
              setBookingInitialSlot(undefined);
              setBookingInitialDate(undefined);
              setBookingTicketingType(undefined);
              setBookingSelectedSeats(undefined);
            }}
            onTicketPurchased={handleTicketPurchased}
            initialTimeSlot={bookingInitialSlot}
            initialDate={bookingInitialDate}
            ticketingType={bookingTicketingType}
            selectedSeats={bookingSelectedSeats}
          />
        )}
      </AnimatePresence>

      <MyTicketsDrawer
        isOpen={isTicketsDrawerOpen}
        onClose={() => setIsTicketsDrawerOpen(false)}
        tickets={purchasedTickets}
        onSelectEvent={(eventId) => {
          const ev = dbEvents.find(e => e.id === eventId);
          if (ev) setActiveModalEvent(ev);
          setIsTicketsDrawerOpen(false);
        }}
      />

      <SavedEventsModal
        isOpen={isSavedEventsModalOpen}
        onClose={() => setIsSavedEventsModalOpen(false)}
        savedEvents={savedEventsList}
        onRemoveSave={handleToggleSave}
        onBuyTicket={(evt) => {
          setIsSavedEventsModalOpen(false);
          setActiveBookingEvent(evt);
        }}
        onOpenDetails={(evt) => {
          setIsSavedEventsModalOpen(false);
          setActiveModalEvent(evt);
        }}
      />

      {/* Producer & Creator Event Submission Modal */}
      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
      />

    </div>
  );
}
