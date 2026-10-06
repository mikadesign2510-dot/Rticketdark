import React, { useRef, useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Clock, 
  Ticket, 
  QrCode, 
  Info,
  Check,
  FileDown,
  Sparkles,
  Share2
} from 'lucide-react';
import { PurchasedTicket, ArtEvent } from '../types';
import { toPersianDigits, formatPrice } from '../utils/persianNumbers';

interface PrintableTicketModalProps {
  ticket: PurchasedTicket;
  event?: ArtEvent;
  onClose: () => void;
}

export const PrintableTicketModal: React.FC<PrintableTicketModalProps> = ({
  ticket,
  event,
  onClose
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const venueName = event?.venue || 'تالار اصلی رویداد';
  const eventDate = ticket.selectedDate || '۱۵ اردیبهشت ۱۴۰۵';
  const eventTime = ticket.selectedTime || '۲۱:۰۰';

  // 1. Generate & Download Official High-Res PNG Ticket Pass
  const handleDownloadImage = () => {
    setStatusMessage('در حال آماده‌سازی تصویر بلیت...');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1050;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border frame
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

      // Top decorative header bar
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(24, 24, canvas.width - 48, 90);

      // Header Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px Tahoma, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('سامانه رسمی صدور و رزرواسیون بلیت آرتیکت', canvas.width / 2, 78);

      // Event Details Header
      ctx.fillStyle = '#e11d48';
      ctx.font = 'bold 20px Tahoma, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(ticket.tier?.name || 'جایگاه عادی', canvas.width - 60, 165);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 30px Tahoma, sans-serif';
      ctx.fillText(ticket.eventTitle || 'رویداد هنری', canvas.width - 60, 215);

      // Separator Line
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 245);
      ctx.lineTo(canvas.width - 60, 245);
      ctx.stroke();

      // Info Rows
      const details = [
        ['محل برگزاری و سالن:', venueName],
        ['تاریخ و روز اجرا:', toPersianDigits(eventDate)],
        ['ساعت و سانس:', `ساعت ${toPersianDigits(eventTime)}`],
        ['شماره صندلی / ردیف:', toPersianDigits(ticket.seatLabel || 'آزاد')],
        ['نام خریدار:', ticket.customerName || 'مخاطب گرامی'],
        ['مبلغ پرداخت شده:', `${toPersianDigits(formatPrice(ticket.price))} تومان`],
        ['کد امنیتی ورود:', ticket.qrCodeSeed || 'ART-882910'],
      ];

      let currentY = 295;
      details.forEach(([label, val]) => {
        ctx.fillStyle = '#64748b';
        ctx.font = '18px Tahoma, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(label, canvas.width - 60, currentY);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 20px Tahoma, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(val, 60, currentY);

        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(60, currentY + 12);
        ctx.lineTo(canvas.width - 60, currentY + 12);
        ctx.stroke();

        currentY += 50;
      });

      // QR Code Representation box
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(canvas.width / 2 - 100, currentY + 20, 200, 200);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(canvas.width / 2 - 100, currentY + 20, 200, 200);

      // Simulated QR squares
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(canvas.width / 2 - 80, currentY + 40, 40, 40);
      ctx.fillRect(canvas.width / 2 + 40, currentY + 40, 40, 40);
      ctx.fillRect(canvas.width / 2 - 80, currentY + 140, 40, 40);
      ctx.fillRect(canvas.width / 2 - 20, currentY + 90, 40, 40);
      ctx.fillRect(canvas.width / 2 + 20, currentY + 120, 30, 30);

      // Rules footer
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Tahoma, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('• ارائه این تصویر یا بارکد هنگام ورود به گیت تالار الزامی است.', canvas.width / 2, currentY + 255);
      ctx.fillText('• لطفاً حداقل ۳۰ دقیقه قبل از آغاز سانس در محل حضور داشته باشید.', canvas.width / 2, currentY + 285);
      ctx.fillText('پشتیبانی گیشه: ۰۲۱-۸۸۹۹۰۰۱۱ • شناسه پیگیری: ' + toPersianDigits(ticket.id?.slice(-8) || '8849201'), canvas.width / 2, currentY + 315);

      // Trigger download
      const link = document.createElement('a');
      link.download = `ticket-${ticket.qrCodeSeed || 'pass'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setDownloadSuccess(true);
      setStatusMessage('تصویر باکیفیت بلیت با موفقیت دانلود شد.');
      setTimeout(() => {
        setDownloadSuccess(false);
        setStatusMessage(null);
      }, 3000);
    } catch (e) {
      console.error('Image download error', e);
      setStatusMessage('خطا در ایجاد تصویر، لطفاً از دکمه کپی استفاده فرمایید.');
    }
  };

  // 2. Download Offline HTML Printable Document
  const handleDownloadHtml = () => {
    try {
      const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="utf-8">
  <title>بلیت رسمی ${ticket.eventTitle || 'آرتیکت'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Vazirmatn', Tahoma, sans-serif; }
    body { background: #fff; color: #0f172a; padding: 30px; direction: rtl; }
    .ticket { max-width: 650px; margin: 0 auto; border: 2px solid #0f172a; border-radius: 16px; padding: 24px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 20px; }
    .title { font-size: 20px; font-weight: 900; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
    .qr { text-align: center; margin: 20px 0; padding: 15px; border: 2px dashed #cbd5e1; border-radius: 12px; }
    .rules { margin-top: 15px; font-size: 11px; color: #64748b; line-height: 1.8; }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body onload="window.print()">
  <div class="ticket">
    <div class="header">
      <div>
        <div style="font-size: 11px; color: #64748b; font-weight: bold;">سامانه رسمی آرتیکت</div>
        <div class="title">بلیت ورود به سالن</div>
      </div>
      <div style="text-align: left;">
        <span style="background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold;">معتبر جهت ورود</span>
        <div style="font-family: monospace; font-size: 11px; color: #64748b; margin-top: 4px;">${ticket.qrCodeSeed}</div>
      </div>
    </div>
    <div style="font-size: 14px; color: #e11d48; font-weight: bold;">${ticket.tier?.name || 'جایگاه عادی'}</div>
    <div style="font-size: 22px; font-weight: 900; margin-bottom: 15px;">${ticket.eventTitle}</div>
    <div class="row"><span>محل برگزاری:</span><strong>${venueName}</strong></div>
    <div class="row"><span>تاریخ اجرا:</span><strong>${toPersianDigits(eventDate)}</strong></div>
    <div class="row"><span>ساعت و سانس:</span><strong>ساعت ${toPersianDigits(eventTime)}</strong></div>
    <div class="row"><span>شماره صندلی:</span><strong style="color: #16a34a;">${toPersianDigits(ticket.seatLabel || 'آزاد')}</strong></div>
    <div class="row"><span>نام خریدار:</span><strong>${ticket.customerName || 'مخاطب گرامی'}</strong></div>
    <div class="row"><span>مبلغ پرداخت شده:</span><strong>${toPersianDigits(formatPrice(ticket.price))} تومان</strong></div>
    <div class="qr">
      <div style="font-size: 16px; font-weight: bold; font-family: monospace;">${ticket.qrCodeSeed}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">اسکن بارکد در گیت ورودی</div>
    </div>
    <div class="rules">
      <strong>قوانین سالن:</strong> حضور ۳۰ دقیقه قبل از سانس الزامی است. ارائه این برگه یا بارکد جهت ورود ضروری است.
    </div>
  </div>
</body>
</html>
      `;
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${ticket.qrCodeSeed || 'official'}.html`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage('فایل چاپی خودکار بلیت دانلود شد. با باز کردن آن پنجره پرینت ظاهر می‌شود.');
    } catch (e) {
      console.error('HTML ticket download error', e);
    }
  };

  // 3. Direct Print with fallback
  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Direct print blocked by iframe sandbox, downloading image pass...', e);
      handleDownloadImage();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `🎫 بلیت رسمی رویداد: ${ticket.eventTitle}\n🏛️ سالن: ${venueName}\n📅 تاریخ: ${eventDate}\n⏰ سانس: ${eventTime}\n💺 صندلی: ${ticket.seatLabel || 'آزاد'}\n🔑 کد رهگیری: ${ticket.qrCodeSeed}`
    );
    setCopied(true);
    setStatusMessage('مشخصات کامل بلیت در کلیپ‌بورد کپی شد.');
    setTimeout(() => {
      setCopied(false);
      setStatusMessage(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in" dir="rtl">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-200">
        
        {/* Action Bar */}
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#FF3366]" />
            <h3 className="font-bold text-sm">بلیت رسمی ورود به تالار (نسخه الکترونیک و چاپی)</h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Action 1: Download High-Res Image Pass */}
            <button
              type="button"
              onClick={handleDownloadImage}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#FF5533] text-white text-xs font-bold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md shadow-[#FF3366]/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ذخیره تصویر بلیت (PNG)</span>
            </button>

            {/* Primary Action 2: Download Auto-Print HTML */}
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="دانلود فایل مخصوص چاپگر"
            >
              <FileDown className="w-4 h-4 text-purple-400" />
              <span>فایل چاپ (HTML)</span>
            </button>

            {/* Primary Action 3: Copy Text */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
              title="کپی مشخصات بلیت"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer mr-1"
              title="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert if triggered */}
        {statusMessage && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Ticket Visual Container */}
        <div ref={printRef} className="p-6 sm:p-8 space-y-6 bg-white text-slate-900">
          
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                سامانه رسمی صدور و رزرواسیون بلیت آرتیکت
              </span>
              <h2 className="font-display font-black text-xl text-slate-900">
                بلیت دیجیتال رسمی رویداد
              </h2>
            </div>

            <div className="text-left flex flex-col items-end">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>معتبر جهت ورود</span>
              </span>
              <span className="text-xs font-bold text-slate-600 mt-1">
                {toPersianDigits(ticket.qrCodeSeed || '')}
              </span>
            </div>
          </div>

          {/* Main Content Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left/Center 8 cols: Event & Seat Information */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <span className="text-xs font-bold text-[#FF3366] block mb-1">
                  {ticket.tier?.name || 'جایگاه عادی'}
                </span>
                <h1 className="font-display font-black text-2xl text-slate-900 leading-snug">
                  {ticket.eventTitle}
                </h1>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 block text-[11px]">محل برگزاری:</span>
                  <div className="font-bold flex items-center gap-1 text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{venueName}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 block text-[11px]">تاریخ و روز:</span>
                  <div className="font-bold flex items-center gap-1 text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{toPersianDigits(eventDate)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 block text-[11px]">سانس اجرا:</span>
                  <div className="font-bold flex items-center gap-1 text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>ساعت {toPersianDigits(eventTime)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 block text-[11px]">صندلی / ردیف:</span>
                  <div className="font-bold text-emerald-600">
                    {toPersianDigits(ticket.seatLabel || 'آزاد')}
                  </div>
                </div>
              </div>

              {/* Buyer & Price Info */}
              <div className="flex items-center justify-between text-xs px-2">
                <div className="space-y-0.5">
                  <span className="text-slate-500 block text-[10px]">نام خریدار:</span>
                  <span className="font-bold text-slate-800">{ticket.customerName || 'مخاطب گرامی'}</span>
                </div>

                <div className="space-y-0.5 text-left">
                  <span className="text-slate-500 block text-[10px]">مبلغ پرداخت شده:</span>
                  <span className="font-bold text-sm text-slate-900">
                    {toPersianDigits(formatPrice(ticket.price))} تومان
                  </span>
                </div>
              </div>
            </div>

            {/* Right 4 cols: QR Code Gate Stamp */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 text-center space-y-2">
              <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-200">
                <QrCode className="w-36 h-36 text-slate-900" />
              </div>
              <span className="text-xs font-bold text-slate-700 tracking-wider">
                {toPersianDigits(ticket.qrCodeSeed || '')}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight">
                اسکن در گیت ورودی تالار
              </span>
            </div>

          </div>

          {/* Hall Rules & Notice */}
          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1 mb-1">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>قوانین و ضوابط ورود به سالن:</span>
            </div>
            <p>• لطفاً حداقل ۳۰ دقیقه قبل از شروع سانس در محل تالار حضور به‌هم رسانید.</p>
            <p>• ارائه بارکد روی گوشی یا پرینت بلیت جهت عبور از گیت ورودی الزامی است.</p>
            <p>• پس از شروع اجرا، درب‌های ورودی سالن اصلی بسته خواهند شد.</p>
          </div>

          {/* Footer Barcode */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            <span>شماره پیگیری مالی: {toPersianDigits(ticket.id?.slice(-8) || '8849201')}</span>
            <span>پشتیبانی گیشه: ۰۲۱-۸۸۹۹۰۰۱۱</span>
          </div>

        </div>

      </div>

    </div>
  );
};
