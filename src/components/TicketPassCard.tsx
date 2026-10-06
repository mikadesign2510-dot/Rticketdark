import React, { useState } from 'react';
import { PurchasedTicket } from '../types';
import { toPersianDigits, formatPrice } from '../utils/persianNumbers';
import { useTheme } from '../context/ThemeContext';
import { QrCode, Armchair, Calendar, Clock, MapPin, User, Download, Printer, Award, ShieldCheck, FileText } from 'lucide-react';
import { PrintableTicketPdf } from './PrintableTicketPdf';
import { TicketQrCode, TicketBarcode } from './TicketBarcode';

interface TicketPassCardProps {
  ticket: PurchasedTicket;
  onDownload?: () => void;
}

export const TicketPassCard: React.FC<TicketPassCardProps> = ({ ticket, onDownload }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { event } = ticket;
  const [showPrintablePdf, setShowPrintablePdf] = useState(false);

  const handleOpenPdf = () => {
    setShowPrintablePdf(true);
    if (onDownload) {
      onDownload();
    }
  };

  return (
    <div className={`relative max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl border transition-all print:shadow-none print:border-none ${
      isDark 
        ? 'bg-gradient-to-b from-[#161A2B] via-[#111422] to-[#0D101A] border-[#2A3350] text-white' 
        : 'bg-gradient-to-b from-white via-slate-50 to-slate-100 border-slate-200 text-slate-900 shadow-slate-300'
    }`}>
      {/* Gold & Neon Top Gradient Ribbon */}
      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#FF3366] via-[#FF884D] to-[#F59E0B]" />

      {/* بخش هدر با پوستر رسمی اثر */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-950">
        <img
          src={event.imageUrl}
          alt={event.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-75 hover:scale-105 transition-transform duration-700"
        />
        {/* گرادیان تیره روی پوستر برای خوانایی متون */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111422] via-black/40 to-transparent flex flex-col justify-end p-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF3366] text-white shadow-md">
              {event.categoryLabel}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
              گذر رسمی ورود (ARTIS VIP PASS)
            </span>
          </div>
          <h2 className="font-display font-black text-xl sm:text-2xl text-white leading-tight">
            {event.title}
          </h2>
          <p className="text-xs text-zinc-300 font-medium mt-0.5">
            {event.artist} {event.artistRole ? `• ${event.artistRole}` : ''}
          </p>
        </div>
      </div>

      {/* اطلاعات اصلی بلیت */}
      <div className="p-5 sm:p-6 space-y-4">
        
        {/* کد پیگیری و نوع جایگاه */}
        <div className="flex items-center justify-between pb-3.5 border-b border-black/5 dark:border-white/10 text-xs">
          <div>
            <span className={`text-[10px] font-bold block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>شماره پیگیری سفارش</span>
            <span className="font-mono font-bold text-sm text-[#F59E0B] tracking-wider">
              {toPersianDigits(ticket.bookingRef)}
            </span>
          </div>
          <div className="text-left">
            <span className={`text-[10px] font-bold block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>نوع بلیت / رده</span>
            <span className="font-bold text-[#FF3366]">{ticket.tier.name}</span>
          </div>
        </div>

        {/* زمان، مکان و مشخصات خریدار */}
        <div className={`grid grid-cols-2 gap-3 p-3.5 rounded-2xl border text-xs ${
          isDark ? 'bg-[#0A0C14] border-[#1F2538]' : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold">
              <Calendar className="w-3.5 h-3.5 text-[#FF3366]" />
              <span>تاریخ و سانس</span>
            </div>
            <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {toPersianDigits(ticket.selectedDate)}
            </div>
            <div className="text-[11px] text-[#FF884D] font-bold">
              ساعت {toPersianDigits(ticket.selectedTime)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold">
              <MapPin className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>محل برگزاری</span>
            </div>
            <div className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`} title={event.hallName || event.venue}>
              {event.hallName || event.venue}
            </div>
            <div className="text-[11px] text-zinc-400 truncate">
              {event.city} • {event.country}
            </div>
          </div>
        </div>

        {/* صندلی‌های اختصاصی (در صورت وجود) یا تعداد نفرات */}
        {ticket.selectedSeats && ticket.selectedSeats.length > 0 ? (
          <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
            isDark ? 'bg-amber-500/10 border-amber-500/25 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              <Armchair className="w-4 h-4 text-amber-500 shrink-0" />
              <span>صندلی‌های شماره‌دار سالن:</span>
            </div>
            <div className="flex flex-wrap gap-1 font-bold">
              {ticket.selectedSeats.map(s => (
                <span key={s.id} className="px-2 py-0.5 rounded-lg bg-black/20 border border-black/10 text-[11px]">
                  ردیف {toPersianDigits(s.row)} ص {toPersianDigits(s.seatNumber)}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
            isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="font-semibold text-zinc-400">تعداد نفرات / بلیت ورود:</span>
            <span className="font-bold text-emerald-400">{toPersianDigits(ticket.quantity)} بلیت استاندارد</span>
          </div>
        )}

        {/* دارنده بلیت */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>مخاطب: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{ticket.customerName}</strong></span>
          </div>
          <span className="font-sans text-[10px] text-zinc-500">{toPersianDigits(ticket.purchasedAt)}</span>
        </div>

        {/* خط برش پرفراژ دار */}
        <div className="relative py-2 flex items-center justify-between">
          <div className={`absolute -left-8 w-6 h-6 rounded-full ${isDark ? 'bg-[#0D101A]' : 'bg-white'}`} />
          <div className={`w-full border-t-2 border-dashed ${isDark ? 'border-[#2A3350]' : 'border-slate-300'}`} />
          <div className={`absolute -right-8 w-6 h-6 rounded-full ${isDark ? 'bg-[#0D101A]' : 'bg-white'}`} />
        </div>

        {/* بخش دو بارکد: ۱. کیوآرکد اختصاصی و ۲. بارکد استاندارد خطی Code 128 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
          
          {/* ۱. کیو آر کد هوشمند (QR Code) با محتوای اختصاصی بلیت */}
          <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
            isDark ? 'bg-[#080A12] border-white/10' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="bg-white p-1 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
              <TicketQrCode 
                value={`https://artis.ir/ticket/verify?ref=${ticket.bookingRef}&id=${ticket.ticketId}&event=${encodeURIComponent(ticket.event.id)}`} 
                size={58} 
              />
            </div>
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold block text-emerald-400">اسکن در گیت ورودی</span>
              <span className="text-zinc-400 text-[10px]">کیوآرکد اختصاصی با اعتبارسنجی آنی در سامانه کنترل تردد</span>
            </div>
          </div>

          {/* ۲. بارکد سریالی خطی واقعی Code 128 (Linear Serial Barcode) */}
          <div className={`p-3 rounded-2xl border flex flex-col justify-center items-center ${
            isDark ? 'bg-[#080A12] border-white/10' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="w-full bg-white px-2 py-1 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200" dir="ltr">
              <TicketBarcode 
                value={ticket.bookingRef.startsWith('ART-') ? ticket.bookingRef : `ART-${ticket.bookingRef}`} 
                height={32} 
                width={1.4} 
              />
            </div>
            <div className="flex items-center justify-between w-full mt-1.5 px-1">
              <span className="font-mono font-bold text-[9px] tracking-wider text-zinc-400" dir="ltr">
                *{ticket.bookingRef.startsWith('ART-') ? ticket.bookingRef : `ART-${ticket.bookingRef}`}*
              </span>
              <span className="font-sans text-[10px] text-zinc-400 font-bold">
                سریال: {toPersianDigits(ticket.bookingRef)}
              </span>
            </div>
          </div>

        </div>

        {/* دکمه‌های عملیاتی تک‌خطی و متقارن (دریافت و چاپ بلیت) */}
        <div className="pt-3 grid grid-cols-2 gap-2.5 print:hidden">
          <button
            type="button"
            onClick={handleOpenPdf}
            className="py-3 px-3 sm:px-4 rounded-xl font-black text-xs text-white bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] shadow-lg shadow-[#FF3366]/25 hover:shadow-xl hover:shadow-[#FF3366]/35 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap border border-white/20"
          >
            <Download className="w-4 h-4 shrink-0 text-white" />
            <span className="whitespace-nowrap font-display font-black">دریافت بلیط</span>
          </button>

          <button
            type="button"
            onClick={handleOpenPdf}
            className={`py-3 px-3 sm:px-4 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap border active:scale-[0.98] ${
              isDark 
                ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/40 shadow-md shadow-emerald-950/40' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
            }`}
          >
            <Printer className="w-4 h-4 shrink-0 text-emerald-300 sm:text-inherit" />
            <span className="whitespace-nowrap font-display font-black">چاپ بلیط</span>
          </button>
        </div>

      </div>

      {/* مدال ویژه خروجی فایل PDF و برگه چاپی با استایل روشن */}
      {showPrintablePdf && (
        <PrintableTicketPdf
          ticket={ticket}
          onClose={() => setShowPrintablePdf(false)}
        />
      )}
    </div>
  );
};

export default TicketPassCard;
