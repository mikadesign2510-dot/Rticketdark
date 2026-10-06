import React, { useState } from 'react';
import { PurchasedTicket } from '../types';
import { X, Ticket, Calendar, Clock, MapPin, QrCode, Download, Armchair, FileText, Printer } from 'lucide-react';
import { toPersianDigits, formatPrice } from '../utils/persianNumbers';
import { useTheme } from '../context/ThemeContext';
import { TicketPassCard } from './TicketPassCard';
import { PrintableTicketPdf } from './PrintableTicketPdf';

interface MyTicketsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tickets?: PurchasedTicket[];
  onSelectEvent?: (eventId: string) => void;
}

export const MyTicketsDrawer: React.FC<MyTicketsDrawerProps> = ({
  isOpen,
  onClose,
  tickets = [],
  onSelectEvent = (_eventId: string) => {},
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activePassTicket, setActivePassTicket] = useState<PurchasedTicket | null>(null);
  const [activePdfTicket, setActivePdfTicket] = useState<PurchasedTicket | null>(null);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-start bg-black/60 backdrop-blur-md animate-fade-in text-right" dir="rtl">
        <div 
          id="my-tickets-drawer"
          className={`w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden transition-colors border-l ${
            isDark 
              ? 'bg-[#0D101C] border-[#242A42] text-white' 
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Drawer Header */}
          <div className={`p-5 border-b flex items-center justify-between ${
            isDark ? 'border-[#21273F] bg-[#121524]' : 'border-slate-100 bg-slate-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF3366]/20 flex items-center justify-center text-[#FF3366]">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`font-display font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  کارت‌ها و بلیت‌های دیجیتال من
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {toPersianDigits(tickets.length)} بلیت فعال
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isDark 
                  ? 'hover:bg-white/10 text-zinc-400 hover:text-white' 
                  : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
              }`}
              title="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tickets List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {tickets.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
                  isDark ? 'bg-[#171B2B] border-[#262C45] text-zinc-500' : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                  <Ticket className="w-8 h-8" />
                </div>
                <h4 className={`font-display font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  هنوز بلیتی رزرو نکرده‌اید
                </h4>
                <p className={`text-xs mt-2 max-w-xs mx-auto leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  نمایشگاه‌ها، چیدمان‌ها و کنسرت‌های برگزیده را بررسی کنید و گذر ورود خود را اختصاصی دریافت نمایید.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2.5 rounded-full bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-xs font-bold text-white tracking-wide shadow-lg shadow-[#FF3366]/20 cursor-pointer"
                >
                  مشاهده رویدادهای برگزیده
                </button>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.ticketId}
                  className={`relative border rounded-2xl p-5 shadow-xl overflow-hidden group ${
                    isDark 
                      ? 'bg-gradient-to-b from-[#161B2C] to-[#111422] border-[#272F47]' 
                      : 'bg-white border-slate-200 shadow-slate-200'
                  }`}
                >
                  {/* Visual Top Ribbon */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-[#FF3366] to-[#F59E0B]" />

                  <div className={`flex items-center justify-between text-xs pb-3 border-b ${
                    isDark ? 'border-[#21273D]' : 'border-slate-100'
                  }`}>
                    <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>
                      کد پیگیری: <strong className="text-[#F59E0B] font-mono">{toPersianDigits(ticket.bookingRef)}</strong>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-semibold text-[10px]">
                      تأیید شده
                    </span>
                  </div>

                  <div className="pt-3 pb-2">
                    <h4 className={`font-display font-bold text-base group-hover:text-[#FF884D] transition-colors leading-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {ticket.event.title}
                    </h4>
                    <p className="text-xs text-[#FF884D] font-medium mt-1">
                      {ticket.event.artist}
                    </p>
                  </div>

                  <div className={`grid grid-cols-2 gap-2 my-2 p-2.5 rounded-xl text-xs ${
                    isDark ? 'bg-[#0B0D16]' : 'bg-slate-50 border border-slate-100'
                  }`}>
                    <div className={`flex items-center gap-2 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      <Calendar className="w-3.5 h-3.5 text-[#FF3366] shrink-0" />
                      <span className="truncate">{toPersianDigits(ticket.selectedDate)}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                      <Clock className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                      <span className="truncate">{toPersianDigits(ticket.selectedTime)}</span>
                    </div>
                    <div className={`col-span-2 flex items-center gap-2 text-[11px] pt-1 border-t ${
                      isDark ? 'text-zinc-400 border-[#1C2133]' : 'text-slate-500 border-slate-200'
                    }`}>
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{ticket.event.hallName || ticket.event.venue}، {ticket.event.city}</span>
                    </div>
                  </div>

                  {/* QR Section */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs">
                      <span className={`text-[10px] font-bold block mb-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>جایگاه و تعداد</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{ticket.tier.name}</span>
                      {ticket.selectedSeats && ticket.selectedSeats.length > 0 ? (
                        <span className="flex items-center gap-1 font-bold text-[#FF884D] text-[11px] mt-0.5">
                          <Armchair className="w-3.5 h-3.5 shrink-0" />
                          صندلی‌ها: {ticket.selectedSeats.map(s => `ردیف ${toPersianDigits(s.row)} ص ${toPersianDigits(s.seatNumber)}`).join('، ')}
                        </span>
                      ) : (
                        <span className={`block text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                          {toPersianDigits(ticket.quantity)} بلیت • مجموع {formatPrice(ticket.totalAmount)}
                        </span>
                      )}
                    </div>
                    
                    <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                      <div className="w-full h-full bg-[#0A0B10] rounded-md p-1 flex items-center justify-center">
                        <QrCode className="w-full h-full text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className={`mt-3 pt-3 border-t flex items-center justify-between text-xs ${
                    isDark ? 'border-[#21273D]' : 'border-slate-100'
                  }`}>
                    <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      صادر شده برای {ticket.customerName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActivePdfTicket(ticket)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 font-bold cursor-pointer transition-colors"
                        title="خروجی فایل PDF با استایل روشن و دو پوستر"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>دریافت بلیط</span>
                      </button>

                      <button
                        onClick={() => setActivePassTicket(ticket)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF3366]/20 text-[#FF3366] hover:bg-[#FF3366]/30 font-bold cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>گذر بلیت</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {tickets.length > 0 && (
            <div className={`p-4 border-t ${
              isDark ? 'border-[#21273F] bg-[#121524]' : 'border-slate-100 bg-slate-50'
            }`}>
              <button
                onClick={() => alert("تمامی بلیت‌ها با کیف پول دیجیتال همگام‌سازی شدند.")}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isDark ? 'bg-[#1C2134] hover:bg-[#262D45] text-zinc-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                <Download className="w-4 h-4 ml-1" />
                <span>انتقال همه کارت‌ها به Apple / Google Wallet</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Full Luxury Pass Card */}
      {activePassTicket && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-right overflow-y-auto" dir="rtl">
          <div className="relative w-full max-w-lg my-auto space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setActivePassTicket(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer backdrop-blur-md"
              >
                ✕ بستن پنجره گذر
              </button>
            </div>
            <TicketPassCard ticket={activePassTicket} />
          </div>
        </div>
      )}

      {/* Modal for Printable Light-Styled PDF Ticket */}
      {activePdfTicket && (
        <PrintableTicketPdf
          ticket={activePdfTicket}
          onClose={() => setActivePdfTicket(null)}
        />
      )}
    </>
  );
};

export default MyTicketsDrawer;
