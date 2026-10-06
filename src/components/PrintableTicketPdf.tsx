import React, { useState, useRef } from 'react';
import { PurchasedTicket } from '../types';
import { toPersianDigits, formatPrice } from '../utils/persianNumbers';
import { 
  QrCode, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Armchair, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Scissors, 
  Award, 
  Loader2,
  Ticket
} from 'lucide-react';
import jsPDF from 'jspdf';
import { TicketQrCode, TicketBarcode } from './TicketBarcode';
import html2canvas from 'html2canvas-pro';

interface PrintableTicketPdfProps {
  ticket: PurchasedTicket;
  onClose?: () => void;
}

export const PrintableTicketPdf: React.FC<PrintableTicketPdfProps> = ({ ticket, onClose }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);
  const { event } = ticket;

  // انتخاب پوستر عریض (Landscape Panorama) و پوستر اصلی پرتره اثر (Portrait Poster)
  const wideBanner = event.wideBannerUrl || event.imageUrl;
  const portraitPoster = event.imageUrl;

  // متد چاپ مستقیم مرورگر با ساخت فریم ایزوله چاپی
  const handlePrint = () => {
    try {
      const ticketElement = ticketRef.current;
      if (ticketElement) {
        // ایجاد یک آی‌فریم اختصاصی جهت اجرای مستقیم دیالوگ پرینت مرورگر
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = 'none';
        document.body.appendChild(printFrame);

        const frameDoc = printFrame.contentWindow?.document;
        if (frameDoc) {
          frameDoc.open();
          frameDoc.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="fa">
            <head>
              <meta charset="utf-8">
              <title>چاپ بلیت رسمی ${ticket.event?.title || 'آرتیکت'}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Vazirmatn', Tahoma, sans-serif !important; }
                body { background: #fff !important; color: #0f172a !important; padding: 10mm; direction: rtl; }
                @page { size: A4 portrait; margin: 10mm; }
              </style>
            </head>
            <body>
              ${ticketElement.innerHTML}
            </body>
            </html>
          `);
          frameDoc.close();

          setTimeout(() => {
            try {
              printFrame.contentWindow?.focus();
              printFrame.contentWindow?.print();
            } catch (err) {
              console.warn('Iframe print restricted by sandbox:', err);
              window.print();
            }
            setTimeout(() => {
              if (document.body.contains(printFrame)) {
                document.body.removeChild(printFrame);
              }
            }, 2000);
          }, 350);
          return;
        }
      }
      window.print();
    } catch (e) {
      console.warn('Direct print failed, generating PDF file instead:', e);
      handleDownloadPdf();
    }
  };


  // ساخت و دانلود فایل PDF با متناسب‌سازی دقیق هندسی برای صفحه A4
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setDownloadSuccess(false);

    try {
      if (ticketRef.current) {
        // استفاده از html2canvas-pro جهت رندر دقیق صفحه
        const canvas = await html2canvas(ticketRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 5000,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.92);

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true,
        });

        const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
        const margin = 10;
        const targetWidth = pdfWidth - margin * 2;
        const targetHeight = Math.min((canvas.height * targetWidth) / canvas.width, pdfHeight - margin * 2);
        const xOffset = (pdfWidth - targetWidth) / 2;
        const yOffset = (pdfHeight - targetHeight) / 2;

        pdf.addImage(imgData, 'JPEG', xOffset, yOffset, targetWidth, targetHeight);
        pdf.save(`Articket_${ticket.bookingRef || ticket.ticketId || 'Pass'}.pdf`);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
        setIsGeneratingPdf(false);
        return;
      }
    } catch (err) {
      console.warn('html2canvas failed, using fallback direct canvas PDF generator:', err);
    }

    // Fallback direct Canvas PDF Generator if html2canvas meets CORS or errors
    try {
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 900;
      fallbackCanvas.height = 1250;
      const ctx = fallbackCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, fallbackCanvas.width - 40, fallbackCanvas.height - 40);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(20, 20, fallbackCanvas.width - 40, 90);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Tahoma, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('سامانه رسمی صدور و رزرواسیون بلیت آرتیکت', fallbackCanvas.width / 2, 75);

        ctx.fillStyle = '#e11d48';
        ctx.font = 'bold 20px Tahoma, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(ticket.tier?.name || 'جایگاه عادی', fallbackCanvas.width - 60, 160);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 28px Tahoma, sans-serif';
        ctx.fillText(ticket.event?.title || 'رویداد هنری', fallbackCanvas.width - 60, 205);

        const rows = [
          ['محل برگزاری:', ticket.event?.venue || 'تالار اصلی'],
          ['تاریخ اجرا:', toPersianDigits(ticket.selectedDate || '۱۴۰۵/۰۲/۱۵')],
          ['ساعت سانس:', `ساعت ${toPersianDigits(ticket.selectedTime || '۲۱:۰۰')}`],
          ['شماره صندلی:', toPersianDigits(ticket.selectedSeats?.map(s => `ردیف ${s.row} صندلی ${s.seatNumber}`).join('، ') || 'جایگاه آزاد')],
          ['خریدار بلیت:', ticket.customerName || 'مخاطب گرامی'],
          ['مبلغ پرداخت شده:', `${toPersianDigits(formatPrice(ticket.totalAmount || ticket.tier?.price || 0))} تومان`],
          ['کد رهگیری گیت:', ticket.qrCodeSeed || ticket.bookingRef || 'ART-PASS'],
        ];

        let yPos = 260;
        rows.forEach(([k, v]) => {
          ctx.fillStyle = '#64748b';
          ctx.font = '18px Tahoma, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(k, fallbackCanvas.width - 60, yPos);

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 19px Tahoma, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(v, 60, yPos);

          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(60, yPos + 10);
          ctx.lineTo(fallbackCanvas.width - 60, yPos + 10);
          ctx.stroke();

          yPos += 50;
        });

        // Barcode / QR
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(fallbackCanvas.width / 2 - 120, yPos + 20, 240, 240);
        ctx.strokeStyle = '#cbd5e1';
        ctx.strokeRect(fallbackCanvas.width / 2 - 120, yPos + 20, 240, 240);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ticket.qrCodeSeed || ticket.bookingRef || '', fallbackCanvas.width / 2, yPos + 220);

        const imgData = fallbackCanvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        pdf.addImage(imgData, 'JPEG', 10, 10, 190, 264);
        pdf.save(`Articket_${ticket.bookingRef || 'Pass'}.pdf`);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      }
    } catch (finalErr) {
      console.error('Final fallback PDF failed:', finalErr);
    } finally {
      setIsGeneratingPdf(false);
    }
  };


  return (
    <div 
      id="artis-printable-ticket-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto text-right font-sans" 
      dir="rtl"
      style={{ fontFamily: "'Vazirmatn', system-ui, -apple-system, sans-serif" }}
    >
      
      {/* استایل ویژه برای چاپ مستقیم استاندارد A4 تک‌صفحه‌ای */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: 'Vazirmatn', system-ui, -apple-system, sans-serif !important;
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
          }
          .no-print-area, header, nav, footer, button {
            display: none !important;
          }
          #artis-printable-ticket-modal {
            position: static !important;
            inset: auto !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
          }
          #artis-printable-ticket-document {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-3xl my-auto space-y-4 animate-fade-in">
        
        {/* نوار ابزار بالای مدال (غیرقابل چاپ) */}
        <div className="flex items-center justify-between bg-slate-900/95 text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-md no-print-area gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#FF3366] via-[#FF5533] to-[#F59E0B] flex items-center justify-center text-white shadow-md shadow-[#FF3366]/25 shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
                آرتیکت
              </h2>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 tracking-widest hidden xs:inline" dir="ltr">
                ARTICKET
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* دکمه دریافت بلیط */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 sm:px-5 py-2.5 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs sm:text-sm font-black hover:shadow-lg hover:shadow-[#FF3366]/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer disabled:opacity-50 whitespace-nowrap border border-white/20"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span className="whitespace-nowrap font-display font-black">در حال آماده‌سازی...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 shrink-0 text-white" />
                  <span className="whitespace-nowrap font-display font-black">دریافت بلیط</span>
                </>
              )}
            </button>

            {/* دکمه چاپ بلیط */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-md active:scale-[0.98] whitespace-nowrap border border-emerald-500/40"
            >
              <Printer className="w-4 h-4 shrink-0 text-emerald-100" />
              <span className="whitespace-nowrap font-display font-black">چاپ بلیط</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-white/10"
                title="بستن پنجره"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {downloadSuccess && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in no-print-area">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>فایل بلیت متناسب با ابعاد A4 با موفقیت دریافت گردید.</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* بدنه اصلی بلیت در استایل کاملاً روشن و هماهنگ با ابعاد استاندارد برگه A4 */}
        {/* ========================================================================= */}
        <div 
          ref={ticketRef}
          id="artis-printable-ticket-document"
          className="bg-white text-slate-900 rounded-2xl border border-slate-300 shadow-2xl overflow-hidden font-sans print:rounded-none print:shadow-none print:border-none"
          style={{ 
            width: '780px',
            maxWidth: '100%',
            margin: '0 auto',
            backgroundColor: '#ffffff', 
            color: '#0f172a',
            fontFamily: "'Vazirmatn', system-ui, -apple-system, sans-serif" 
          }}
        >
          {/* نوار سربرگ لوکس بالایی با لوگوی آرتیکت */}
          <div className="bg-gradient-to-r from-slate-900 via-[#1E293B] to-slate-900 text-white px-6 py-3 flex items-center justify-between border-b-4 border-[#F59E0B]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white flex items-center justify-center font-sans font-black text-base shadow-md shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-sans font-black text-sm sm:text-base tracking-wide text-white">
                  آرتیکت همراه رویدادهای شما
                </h1>
                <p className="text-[9px] text-zinc-300 tracking-wider font-mono font-medium" dir="ltr">
                  ARTICKET • YOUR EVENT COMPANION
                </p>
              </div>
            </div>

            <div className="text-left">
              <span className="text-[9px] text-zinc-400 block font-sans">کد پیگیری معتبر:</span>
              <span className="font-sans font-black text-[#F59E0B] text-base tracking-wider block">
                {toPersianDigits(ticket.bookingRef)}
              </span>
              <span className="text-[9px] text-zinc-400 font-mono block tracking-wider" dir="ltr">
                ({ticket.bookingRef})
              </span>
            </div>
          </div>

          {/* ۱. پوستر عریض رویداد (Wide Panoramic Banner) - ارتفاع متناسب و بهینه جهت جای‌گیری کامل در A4 */}
          <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-950 border-b border-slate-200">
            <img
              src={wideBanner}
              alt={event.title}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-2.5 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-[#FF3366] text-white shadow-md">
              پوستر عریض رویداد
            </div>
          </div>

          {/* ۲. باکس اختصاصی مشخصات اسم کار و تگ‌ها دقیقاً زیر پوستر عریض */}
          <div className="px-6 py-3.5 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1.5">
              {/* تگ‌های اثر */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-[#FF3366] text-white shadow-xs">
                  {event.categoryLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-900 border border-amber-300">
                  جایگاه: {ticket.tier.name}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-200 text-slate-800">
                  گذر رسمی ورود (OFFICIAL PASS)
                </span>
              </div>

              {/* نام و عنوان کامل اثر با فونت کاملاً واضح، بولد و باکیفیت وزیرمتن سایت */}
              <h2 className="font-sans font-black text-xl sm:text-2xl text-slate-950 leading-tight tracking-tight">
                {event.title}
              </h2>

              {/* نام هنرمند و سمت هنری */}
              <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                <User className="w-3.5 h-3.5 text-[#FF3366]" />
                <span>{event.artist}</span>
                {event.artistRole && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                    <span className="text-slate-500 font-medium">{event.artistRole}</span>
                  </>
                )}
              </div>
            </div>

            {/* پلاک اختصاصی شناسه اثر */}
            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 border-t md:border-t-0 md:border-r border-slate-200 pt-2 md:pt-0 md:pr-4">
              <span className="text-[9px] text-slate-400 font-bold block mb-0.5">شناسه رویداد:</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 font-sans font-bold text-xs">
                کد {toPersianDigits(event.id)}
              </span>
            </div>
          </div>

          {/* ۳. بدنه محتوایی بلیت - ترکیب متناسب پوستر اصلی، زمان، مکان، صندلی‌ها و بارکدها */}
          <div className="p-5 sm:p-6 space-y-4">

            {/* ترکیب ۲ پوستر: پوستر خود کار در کنار جزئیات کلیدی سانس و محل اجرا */}
            <div className="grid grid-cols-12 gap-5 items-start">
              
              {/* پوستر پرتره اثر */}
              <div className="col-span-4 flex flex-col items-center">
                <div className="relative w-full rounded-xl overflow-hidden shadow-md border border-slate-200 bg-slate-100">
                  <img
                    src={portraitPoster}
                    alt={event.title}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    className="w-full h-52 object-cover object-center"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/85 backdrop-blur-xs text-white p-1.5 text-center text-[9px] font-bold">
                    پوستر رسمی اثر
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1.5 text-center">
                  کیفیت تصویر: نسخه رسمی اثر
                </span>
              </div>

              {/* مشخصات سانس، سالن، صندلی و تسویه حساب */}
              <div className="col-span-8 space-y-3">
                
                {/* کارت مشخصات زمان و مکان */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* تاریخ و سانس */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-bold">
                      <Calendar className="w-3.5 h-3.5 text-[#FF3366]" />
                      <span>تاریخ و روز سانس:</span>
                    </div>
                    <div className="font-sans font-black text-sm text-slate-900">
                      {toPersianDigits(ticket.selectedDate)}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-bold pt-1">
                      <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>ساعت دقیق شروع:</span>
                    </div>
                    <div className="font-sans font-black text-sm text-[#D97706]">
                      ساعت {toPersianDigits(ticket.selectedTime)}
                    </div>
                  </div>

                  {/* تالار و آدرس */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-bold">
                      <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                      <span>مکان و تالار اجرا:</span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 leading-snug">
                      {event.hallName || event.venue}
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium pt-0.5">
                      {event.city} • {event.address || event.venue}
                    </div>
                    <div className="text-[9px] text-slate-400">
                      کشور: {event.country}
                    </div>
                  </div>

                </div>

                {/* اطلاعات صندلی‌های شماره‌دار یا تعداد بلیت */}
                {ticket.selectedSeats && ticket.selectedSeats.length > 0 ? (
                  <div className="p-3 rounded-xl border-2 border-amber-300 bg-amber-50/80 text-amber-950 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <Armchair className="w-3.5 h-3.5 text-amber-700" />
                        <span className="font-black text-amber-900">شماره صندلی‌های رزرو شده در سالن:</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-black text-[11px]">
                        {toPersianDigits(ticket.selectedSeats.length)} صندلی
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {ticket.selectedSeats.map((s) => (
                        <div 
                          key={s.id}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 shadow-2xs flex items-center gap-1.5 text-[11px] font-bold text-slate-900"
                        >
                          <span className="text-amber-700">ردیف {toPersianDigits(s.row)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-slate-900">صندلی {toPersianDigits(s.seatNumber)}</span>
                          <span className="text-[9px] text-slate-500">({s.section})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-950 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="text-xs font-bold">ظرفیت عمومی / ورود:</span>
                    </div>
                    <span className="font-sans font-black text-sm text-emerald-800">
                      {toPersianDigits(ticket.quantity)} بلیت استاندارد معتبر
                    </span>
                  </div>
                )}

                {/* مشخصات صاحب بلیت و فاکتور تسویه */}
                <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 text-[11px]">
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold block">نام دارنده بلیت:</span>
                    <span className="font-bold text-slate-900 block mt-0.5 truncate">{ticket.customerName || 'هنردوست گرامی'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold block">مبلغ پرداختی کل:</span>
                    <span className="font-sans font-black text-emerald-700 block mt-0.5">
                      {formatPrice(ticket.totalAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold block">وضعیت پرداخت:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      تسویه موفق
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* خط پرفراژ و برش بلیت با آیکون قیچی */}
            <div className="relative py-1.5 flex items-center justify-between">
              <div className="absolute -left-9 w-6 h-6 rounded-full bg-slate-800 print:bg-white border-r border-slate-300" />
              <div className="w-full flex items-center justify-center gap-2 border-t-2 border-dashed border-slate-300">
                <span className="bg-white px-2.5 text-[9px] text-slate-400 font-sans flex items-center gap-1 -mt-2">
                  <Scissors className="w-3 h-3 text-slate-400" />
                  محل تا کردن یا برش بلیت (Fold or Cut Line)
                </span>
              </div>
              <div className="absolute -right-9 w-6 h-6 rounded-full bg-slate-800 print:bg-white border-l border-slate-300" />
            </div>

            {/* بخش دو بارکد: ۱. کیوآرکد گیت + ۲. بارکد سریالی معمولی */}
            <div className="grid grid-cols-12 gap-4 items-center p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              
              {/* ۱. کیوآرکد ورود هوشمند با شناسه منحصربه‌فرد بلیت */}
              <div className="col-span-5 flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="bg-slate-950 p-1.5 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                  <TicketQrCode 
                    value={`https://artis.ir/ticket/verify?ref=${ticket.bookingRef}&id=${ticket.ticketId}&event=${encodeURIComponent(ticket.event.id)}`} 
                    size={68} 
                    bgColor="#020617" 
                    fgColor="#FFFFFF" 
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[9px] inline-block">
                    اسکن گیت ورود
                  </span>
                  <h4 className="font-bold text-[11px] text-slate-900 leading-tight">
                    بارکد دوبعدی هوشمند
                  </h4>
                  <p className="text-[9px] text-slate-500 leading-tight">
                    مخصوص اسکنرهای الکترونیکی و تردد بدون صف
                  </p>
                </div>
              </div>

              {/* ۲. بارکد سریالی خطی استاندارد Code 128 */}
              <div className="col-span-7 flex flex-col items-center justify-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[9px] text-slate-500 font-bold mb-1">
                  بارکد خطی استاندارد (Serial Barcode):
                </span>
                
                {/* بارکد وکتوری استاندارد با داده منحصر‌به‌فرد */}
                <div className="w-full bg-white px-2 py-1 flex items-center justify-center border border-slate-200 rounded overflow-hidden" dir="ltr">
                  <TicketBarcode 
                    value={ticket.bookingRef.startsWith('ART-') ? ticket.bookingRef : `ART-${ticket.bookingRef}`} 
                    height={34} 
                    width={1.5} 
                  />
                </div>

                <div className="flex items-center justify-between w-full mt-1.5 px-1 text-[9px] text-slate-600 font-bold" dir="ltr">
                  <span className="font-mono tracking-wider">* {ticket.bookingRef.startsWith('ART-') ? ticket.bookingRef : `ART-${ticket.bookingRef}`} *</span>
                  <span className="font-sans text-[9px] text-slate-500">سریال: {toPersianDigits(ticket.bookingRef)}</span>
                </div>
              </div>

            </div>

            {/* قوانین و مقررات مهم ورود */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-[10px] text-slate-600 leading-relaxed space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ضوابط و تذکرات مهم ورود به رویداد:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[9.5px]">
                <li>لطفاً حداقل {toPersianDigits(15)} دقیقه پیش از زمان شروع سانس در محل سالن حضور داشته باشید.</li>
                <li>همراه داشتن نسخه چاپی این برگه یا تصویر شفاف بارکد روی تلفن همراه الزامی است.</li>
                <li>این بلیت پس از یک‌بار اسکن در گیت ورودی ابطال می‌گردد؛ از اشتراک‌گذاری بارکد خودداری فرمایید.</li>
              </ul>
            </div>

            {/* پاورقی و نشان اصالت سند */}
            <div className="pt-1.5 flex flex-wrap items-center justify-between text-[9px] text-slate-500 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">سامانه بلیت الکترونیک آرتیکت (Articket)</span>
                <span>• پشتیبانی ۲۴ ساعته: {toPersianDigits('۰۲۱-۸۸۲۹۰۰۰۰')}</span>
              </div>
              <div>
                صادر شده در: {toPersianDigits(ticket.purchasedAt || '۱۴۰۵/۰۷/۱۵')} • شناسه: {toPersianDigits(ticket.bookingRef)}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default PrintableTicketPdf;
