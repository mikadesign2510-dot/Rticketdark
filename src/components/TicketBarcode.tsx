import React, { useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import JsBarcode from 'jsbarcode';

interface TicketQrCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
  includeMargin?: boolean;
}

/**
 * رندر کننده کیوآرکد (QR Code) کاملاً واقعی و استاندارد
 * قابل اسکن با تمامی دوربین‌های تلفن همراه و اسکنرهای گیت تردد سالن
 */
export const TicketQrCode: React.FC<TicketQrCodeProps> = ({
  value,
  size = 76,
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  level = 'M',
  className = '',
  includeMargin = false,
}) => {
  return (
    <div className={`inline-flex items-center justify-center p-1 rounded-xl ${className}`}>
      <QRCodeSVG
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level={level}
        includeMargin={includeMargin}
      />
    </div>
  );
};

interface TicketBarcodeProps {
  value: string;
  height?: number;
  width?: number;
  displayValue?: boolean;
  lineColor?: string;
  background?: string;
  className?: string;
}

/**
 * رندر کننده بارکد خطی استاندارد Code 128 (Linear Barcode)
 * کاملاً واقعی، استاندارد و قابل خواندن با بارکدخوان‌های لیزری و نوری سالن
 */
export const TicketBarcode: React.FC<TicketBarcodeProps> = ({
  value,
  height = 36,
  width = 1.6,
  displayValue = false,
  lineColor = '#000000',
  background = 'transparent',
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        // فیلتر کردن کاراکترهای مجاز برای استاندارد Code 128
        const cleanValue = String(value).replace(/[^a-zA-Z0-9_-]/g, '') || 'ARTIS-TICKET';
        JsBarcode(svgRef.current, cleanValue, {
          format: 'CODE128',
          lineColor: lineColor,
          width: width,
          height: height,
          displayValue: displayValue,
          font: 'monospace',
          fontSize: 11,
          textMargin: 3,
          margin: 0,
          background: background,
        });
      } catch (err) {
        console.error('Error generating barcode for ticket:', err);
      }
    }
  }, [value, height, width, displayValue, lineColor, background]);

  return <svg ref={svgRef} className={`max-w-full ${className}`} />;
};
