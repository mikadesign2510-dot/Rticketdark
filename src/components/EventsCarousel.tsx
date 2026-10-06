import React, { useRef } from 'react';
import { ArtEvent } from '../types';
import { SleekLiveEventCard } from './SleekLiveEventCard';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { SiteSettings } from '../lib/db';

interface EventsCarouselProps {
  events: ArtEvent[];
  savedEventIds: string[];
  toggleSaveEvent: (id: string) => void;
  setActiveModalEvent: (event: ArtEvent) => void;
  setActiveBookingEvent: (event: ArtEvent) => void;
  siteSettings?: SiteSettings;
}

export const EventsCarousel: React.FC<EventsCarouselProps> = ({
  events,
  savedEventIds,
  toggleSaveEvent,
  setActiveModalEvent,
  setActiveBookingEvent,
  siteSettings,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // For RTL, scrolling "right" visually means scrolling to a less negative or more positive value depending on browser
      // Using standard clientWidth for step
      const step = scrollContainerRef.current.clientWidth;
      
      // Since it's RTL, scrolling "left" (towards the end of the list) usually means negative scrollBy in standard browsers
      // Or we can just use behavior: 'smooth' and figure out the exact scroll.
      // A standard way in React for RTL scroll is simply flipping the sign, but let's test a generic approach:
      const scrollAmount = direction === 'left' ? -step : step;
      
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative w-full">
      {/* Header and Controls */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
        <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white flex items-center gap-2">
          <span className="w-6 sm:w-8 h-1.5 bg-[#FF3366] rounded-full"></span>
          همه رویدادها و اجراها
        </h2>
        
        {/* Navigation Arrows */}
        <div className="flex items-center gap-2" dir="ltr">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#161B2D] hover:bg-[#1E253A] border border-[#2B314B] text-zinc-300 hover:text-white transition-all cursor-pointer shadow-lg active:scale-95"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#161B2D] hover:bg-[#1E253A] border border-[#2B314B] text-zinc-300 hover:text-white transition-all cursor-pointer shadow-lg active:scale-95"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 sm:gap-5 lg:gap-6 pb-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {events.map((evt) => (
            <div 
              key={evt.id} 
              className="snap-start shrink-0 w-full sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            >
              <SleekLiveEventCard
                event={evt}
                isSaved={savedEventIds.includes(evt.id)}
                onToggleSave={toggleSaveEvent}
                onOpenDetails={setActiveModalEvent}
                onBuyTicket={setActiveBookingEvent}
                siteSettings={siteSettings}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
