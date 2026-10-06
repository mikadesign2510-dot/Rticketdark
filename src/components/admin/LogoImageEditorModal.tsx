import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Upload, 
  Crop, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  Sparkles, 
  Image as ImageIcon, 
  Info, 
  Square, 
  Circle, 
  Maximize2,
  RefreshCw,
  Sun,
  Moon,
  ExternalLink
} from 'lucide-react';

interface LogoImageEditorModalProps {
  currentLogoUrl?: string;
  onSave: (logoUrl: string) => void;
  onClose: () => void;
}

type AspectRatioPreset = '1:1' | '3:1' | '4:1' | '2:1' | 'free';

interface PresetItem {
  id: AspectRatioPreset;
  label: string;
  sub: string;
  ratio: number | null; // width / height
}

const ASPECT_RATIO_PRESETS: PresetItem[] = [
  { id: '1:1', label: 'مربع ۱:۱', sub: '۲۵۶×۲۵۶ پیکسلی (آیکون و نماد)', ratio: 1 },
  { id: '3:1', label: 'افقی ۳:۱', sub: '۳۰۰×۱۰۰ (لوگوتایپ هدر استاندارد)', ratio: 3 },
  { id: '4:1', label: 'عریض ۴:۱', sub: '۳۲۰×۸۰ (افقی پانوراما)', ratio: 4 },
  { id: '2:1', label: 'مستطیل ۲:۱', sub: '۲۴۰×۱۲۰ (کلاسیک)', ratio: 2 },
  { id: 'free', label: 'برش آزاد', sub: 'تناسب دلخواه بدون قفل', ratio: null },
];

const CURATED_LOGO_PRESETS = [
  {
    name: 'هگزاگون مدرن نئون',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    type: 'نشان هنری تجریدی'
  },
  {
    name: 'ماسک طلایی کلاسیک تئاتر',
    url: 'https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=300&q=80',
    type: 'نماد صحنه و درام'
  },
  {
    name: 'موج مینیمال صوتی کنسرت',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
    type: 'موسیقی و ریتم'
  },
  {
    name: 'نگارخانه هندسی آرتیس',
    url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=300&q=80',
    type: 'گالری و تجسمی'
  }
];

export const LogoImageEditorModal: React.FC<LogoImageEditorModalProps> = ({
  currentLogoUrl = '',
  onSave,
  onClose,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(currentLogoUrl);
  const [urlInput, setUrlInput] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<AspectRatioPreset>('3:1');
  const [isCircularMask, setIsCircularMask] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'editor' | 'presets' | 'guide'>('editor');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');

  // Canvas and crop area state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  // Crop box normalized [0..1]
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 0.1,
    y: 0.2,
    w: 0.8,
    h: 0.6,
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialCropOnDrag, setInitialCropOnDrag] = useState<{ x: number; y: number; w: number; h: number }>({ x: 0, y: 0, w: 0, h: 0 });

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setLoadedImage(img);
      // reset crop box according to preset
      applyPresetRatio(selectedPreset, img.width, img.height);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Adjust crop box to ratio
  const applyPresetRatio = (presetKey: AspectRatioPreset, imgW?: number, imgH?: number) => {
    const preset = ASPECT_RATIO_PRESETS.find(p => p.id === presetKey);
    const wRef = imgW || (loadedImage?.width ?? 400);
    const hRef = imgH || (loadedImage?.height ?? 300);

    if (!preset || preset.ratio === null) {
      setCropBox({ x: 0.05, y: 0.05, w: 0.9, h: 0.9 });
      return;
    }

    const targetRatio = preset.ratio; // W / H
    const imgRatio = wRef / hRef;

    if (imgRatio > targetRatio) {
      // Image is wider than crop box
      const boxHeight = 0.8;
      const boxWidth = Math.min(0.9, (boxHeight * targetRatio) / imgRatio);
      setCropBox({
        x: (1 - boxWidth) / 2,
        y: (1 - boxHeight) / 2,
        w: boxWidth,
        h: boxHeight,
      });
    } else {
      // Image is taller than crop box
      const boxWidth = 0.8;
      const boxHeight = Math.min(0.9, (boxWidth / targetRatio) * imgRatio);
      setCropBox({
        x: (1 - boxWidth) / 2,
        y: (1 - boxHeight) / 2,
        w: boxWidth,
        h: boxHeight,
      });
    }
  };

  const handlePresetSelect = (presetKey: AspectRatioPreset) => {
    setSelectedPreset(presetKey);
    if (presetKey === '1:1') {
      setIsCircularMask(false);
    }
    applyPresetRatio(presetKey);
  };

  // Draw on Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Checkerboard pattern for transparency indication
    const tileSize = 12;
    for (let x = 0; x < width; x += tileSize) {
      for (let y = 0; y < height; y += tileSize) {
        ctx.fillStyle = ((x / tileSize + y / tileSize) % 2 === 0) ? '#F1F5F9' : '#E2E8F0';
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }

    // Save and transform image (Zoom + Rotation)
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Compute aspect-fit draw size
    const imgRatio = loadedImage.width / loadedImage.height;
    const canvasRatio = width / height;
    let drawW = width;
    let drawH = height;

    if (canvasRatio > imgRatio) {
      drawH = height;
      drawW = height * imgRatio;
    } else {
      drawW = width;
      drawH = width / imgRatio;
    }

    ctx.drawImage(loadedImage, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Dark semi-transparent overlay for outside crop
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.fillRect(0, 0, width, height);

    // Clear the crop box area
    const cropX = cropBox.x * width;
    const cropY = cropBox.y * height;
    const cropW = cropBox.w * width;
    const cropH = cropBox.h * height;

    ctx.save();
    ctx.beginPath();
    if (isCircularMask) {
      const radius = Math.min(cropW, cropH) / 2;
      ctx.arc(cropX + cropW / 2, cropY + cropH / 2, radius, 0, Math.PI * 2);
    } else {
      ctx.rect(cropX, cropY, cropW, cropH);
    }
    ctx.clip();

    // Re-draw clean image in crop zone
    ctx.clearRect(cropX, cropY, cropW, cropH);
    for (let x = cropX; x < cropX + cropW; x += tileSize) {
      for (let y = cropY; y < cropY + cropH; y += tileSize) {
        ctx.fillStyle = ((Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0) ? '#FFFFFF' : '#F8FAFC';
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.drawImage(loadedImage, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    ctx.restore();

    // Draw crop border & guidelines
    ctx.save();
    ctx.strokeStyle = '#FF3366';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    if (isCircularMask) {
      const radius = Math.min(cropW, cropH) / 2;
      ctx.beginPath();
      ctx.arc(cropX + cropW / 2, cropY + cropH / 2, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(cropX, cropY, cropW, cropH);

      // Rule of thirds lines
      ctx.strokeStyle = 'rgba(255, 51, 102, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical thirds
      ctx.beginPath();
      ctx.moveTo(cropX + cropW / 3, cropY);
      ctx.lineTo(cropX + cropW / 3, cropY + cropH);
      ctx.moveTo(cropX + (cropW * 2) / 3, cropY);
      ctx.lineTo(cropX + (cropW * 2) / 3, cropY + cropH);

      // Horizontal thirds
      ctx.moveTo(cropX, cropY + cropH / 3);
      ctx.lineTo(cropX + cropW, cropY + cropH / 3);
      ctx.moveTo(cropX, cropY + (cropH * 2) / 3);
      ctx.lineTo(cropX + cropW, cropY + (cropH * 2) / 3);
      ctx.stroke();

      // Corner handles
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#FF3366';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      const cornerSize = 8;
      const corners = [
        [cropX, cropY],
        [cropX + cropW, cropY],
        [cropX, cropY + cropH],
        [cropX + cropW, cropY + cropH],
      ];
      corners.forEach(([cx, cy]) => {
        ctx.fillRect(cx - cornerSize / 2, cy - cornerSize / 2, cornerSize, cornerSize);
        ctx.strokeRect(cx - cornerSize / 2, cy - cornerSize / 2, cornerSize, cornerSize);
      });
    }
    ctx.restore();
  }, [loadedImage, cropBox, isCircularMask, zoom, rotation]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle Dragging crop box
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = (e.clientY - rect.top) / rect.height;

    // Check if clicked inside crop box
    if (
      mouseX >= cropBox.x &&
      mouseX <= cropBox.x + cropBox.w &&
      mouseY >= cropBox.y &&
      mouseY <= cropBox.y + cropBox.h
    ) {
      setIsDragging(true);
      setDragStart({ x: mouseX, y: mouseY });
      setInitialCropOnDrag({ ...cropBox });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = (e.clientY - rect.top) / rect.height;

    const dx = mouseX - dragStart.x;
    const dy = mouseY - dragStart.y;

    const newX = Math.max(0, Math.min(1 - initialCropOnDrag.w, initialCropOnDrag.x + dx));
    const newY = Math.max(0, Math.min(1 - initialCropOnDrag.h, initialCropOnDrag.y + dy));

    setCropBox(prev => ({
      ...prev,
      x: newX,
      y: newY,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Upload Local File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم فایل انتخاب شده بیش از ۵ مگابایت است. لطفاً فایل کم‌حجم‌تری انتخاب فرمایید.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          setActiveTab('editor');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Perform Final Crop & Export
  const handleConfirmCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) {
      if (imageSrc) {
        onSave(imageSrc);
        onClose();
      }
      return;
    }

    try {
      // Create offscreen export canvas
      const cropW = cropBox.w * canvas.width;
      const cropH = cropBox.h * canvas.height;

      // Higher resolution export (multiply by 2 for crisp retina display)
      const exportCanvas = document.createElement('canvas');
      const exportScale = 2;
      exportCanvas.width = Math.max(64, cropW * exportScale);
      exportCanvas.height = Math.max(64, cropH * exportScale);
      const expCtx = exportCanvas.getContext('2d');

      if (!expCtx) {
        onSave(imageSrc);
        onClose();
        return;
      }

      expCtx.imageSmoothingEnabled = true;
      expCtx.imageSmoothingQuality = 'high';

      if (isCircularMask) {
        expCtx.beginPath();
        expCtx.arc(
          exportCanvas.width / 2,
          exportCanvas.height / 2,
          Math.min(exportCanvas.width, exportCanvas.height) / 2,
          0,
          Math.PI * 2
        );
        expCtx.clip();
      }

      // Draw from main canvas slice into export canvas
      expCtx.drawImage(
        canvas,
        cropBox.x * canvas.width,
        cropBox.y * canvas.height,
        cropW,
        cropH,
        0,
        0,
        exportCanvas.width,
        exportCanvas.height
      );

      const exportedDataUrl = exportCanvas.toDataURL('image/png', 0.95);
      onSave(exportedDataUrl);
      onClose();
    } catch (e) {
      console.warn('Cross-origin canvas issue, saving raw URL:', e);
      onSave(imageSrc);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-4xl my-auto rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white flex items-center justify-center shadow-md shadow-[#FF3366]/20">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-slate-900">
                ویرایشگر و برش‌دهنده مدرن لوگوی هدر
              </h3>
              <p className="text-xs text-slate-500 font-medium">تنظیم ابعاد استاندارد، برش هوشمند و پیش‌نمایش در هدر سایت</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-slate-200/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'editor' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                میز کار و برش
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'presets' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                لوگوهای آماده
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('guide')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'guide' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                راهنمای استاندارد
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(94vh-140px)] space-y-6">
          {activeTab === 'editor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Canvas Cropper (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Upload or URL Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>آپلود لوگو از سیستم</span>
                  </button>

                  <div className="flex-1 min-w-[200px] flex items-center gap-1.5">
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="یا وارد کردن آدرس مستقیم اینترنتی (URL)..."
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (urlInput.trim()) {
                          setImageSrc(urlInput.trim());
                        }
                      }}
                      className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      بارگذاری
                    </button>
                  </div>
                </div>

                {/* Canvas Canvas Area */}
                <div className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100 p-2 flex items-center justify-center overflow-hidden min-h-[300px] select-none">
                  {imageSrc ? (
                    <canvas
                      ref={canvasRef}
                      width={520}
                      height={340}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className="max-w-full h-auto rounded-xl shadow-xs cursor-move bg-slate-200"
                    />
                  ) : (
                    <div className="text-center p-8 space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center shadow-2xs">
                        <ImageIcon className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">هیچ تصویری بارگذاری نشده است</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          یک فایل تصویری انتخاب کنید یا یکی از لوگوهای آماده را برگزینید.
                        </p>
                      </div>
                    </div>
                  )}

                  {imageSrc && (
                    <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[11px] font-mono flex items-center gap-2">
                      <span>کادر برش را با ماوس بکشید (Drag)</span>
                    </div>
                  )}
                </div>

                {/* Crop & Transform Controls */}
                {imageSrc && (
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Zoom Slider */}
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                      <ZoomOut className="w-4 h-4 text-slate-400" />
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full accent-[#FF3366] cursor-pointer"
                      />
                      <ZoomIn className="w-4 h-4 text-slate-400" />
                      <span className="font-mono text-[11px] text-slate-600 font-bold w-12 text-left">
                        {Math.round(zoom * 100)}%
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
                        className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5 font-bold"
                        title="چرخش ۹۰ درجه"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>چرخش</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setZoom(1);
                          setRotation(0);
                          applyPresetRatio(selectedPreset);
                        }}
                        className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5 font-bold"
                        title="بازگردانی موقعیت کادر"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>ریست</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Presets & Live Header Preview (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* 1. Aspect Ratio Presets */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
                  <span className="font-bold text-xs text-slate-700 block">
                    نسبت‌های ابعاد و کادربندی‌های استاندارد:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {ASPECT_RATIO_PRESETS.map((preset) => {
                      const isSelected = selectedPreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handlePresetSelect(preset.id)}
                          className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#FF3366]/10 border-[#FF3366] text-[#FF3366] shadow-2xs'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span className="font-black text-xs block">{preset.label}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5 leading-tight">{preset.sub}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Circular Mask Option */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-xs mt-2">
                    <div className="flex items-center gap-2">
                      <Circle className="w-4 h-4 text-[#FF3366]" />
                      <span className="font-bold text-slate-800">ماسک برش دایره‌ای (لوگوی گرد)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isCircularMask}
                      onChange={(e) => setIsCircularMask(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF3366] cursor-pointer"
                    />
                  </label>
                </div>

                {/* 2. Live Header Mockup Preview */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-700">پیش‌نمایش زنده در هدر سایت:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {previewTheme === 'dark' ? <Moon className="w-3.5 h-3.5 text-blue-500" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                      <span>{previewTheme === 'dark' ? 'حالت تیره' : 'حالت روشن'}</span>
                    </button>
                  </div>

                  {/* Header mock strip */}
                  <div className={`p-3 rounded-2xl border transition-colors flex items-center justify-between shadow-xs ${
                    previewTheme === 'dark'
                      ? 'bg-[#0A0C13] border-white/10 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <div className="flex items-center gap-3">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt="Logo Preview"
                          className={`h-9 object-contain ${isCircularMask ? 'rounded-full' : 'rounded-lg'}`}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF3366] to-[#F59E0B] flex items-center justify-center text-white text-xs font-bold">
                          آرت
                        </div>
                      )}
                      <div>
                        <span className="font-display font-black text-sm block">آرتیکت</span>
                        <span className={`text-[9px] block ${previewTheme === 'dark' ? 'text-zinc-400' : 'text-slate-400'}`}>
                          رویدادهای هنری
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold opacity-60">
                      <span>همه رویدادها</span>
                      <span>تئاتر</span>
                      <span>کنسرت</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    این تصویر دقیقاً به همین نسبت در نوار هدر شناور سایت جایگذاری خواهد شد.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-display font-black text-sm text-slate-900">نشان‌واره‌های مدرن و آماده آرتیکت</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  می‌توانید یکی از نشان‌های آماده را انتخاب کنید و بلافاصله به کادر برش ببرید.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CURATED_LOGO_PRESETS.map((preset, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#FF3366] transition-all flex flex-col justify-between shadow-2xs group cursor-pointer"
                    onClick={() => {
                      setImageSrc(preset.url);
                      setActiveTab('editor');
                    }}
                  >
                    <div className="h-32 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center p-3 border border-slate-100">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="pt-3">
                      <span className="font-bold text-xs text-slate-900 block">{preset.name}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{preset.type}</span>
                      <button
                        type="button"
                        className="mt-3 w-full py-1.5 rounded-lg bg-slate-900 group-hover:bg-[#FF3366] text-white text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        انتخاب و برش
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs leading-relaxed max-w-2xl text-slate-700">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                <Info className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-900">راهنمای بهینه‌سازی لوگو برای هدر وب‌سایت</h4>
                  <p className="text-xs text-amber-800 mt-1">
                    برای اینکه نشان‌واره شما در تمام ابعاد گوشی، تبلت و دسکتاپ به زیبایی و بدون افت کیفیت بدرخشد، نکات زیر را رعایت فرمایید:
                  </p>
                </div>
              </div>

              <div className="space-y-3 divide-y divide-slate-100">
                <div className="pt-3">
                  <h5 className="font-bold text-slate-900">۱. فرمت بهینه (PNG با پس‌زمینه شفاف)</h5>
                  <p className="text-slate-600 mt-0.5">
                    لوگوهایی که زمینه ترنسپرنت (شفاف) دارند در پس‌زمینه شیشه‌ای و تار هدر (`backdrop-blur`) بهترین هماهنگی را ایجاد می‌کنند و هیچ کادر سفید اضافی ندارند.
                  </p>
                </div>

                <div className="pt-3">
                  <h5 className="font-bold text-slate-900">۲. نسبت ابعاد استاندارد هدر</h5>
                  <p className="text-slate-600 mt-0.5">
                    اگر لوگوی شما همراه با نام متنی است، نسبت **۳:۱** یا **۴:۱** مناسب‌ترین حالت است. اگر فقط آیکون نمادین است، نسبت **۱:۱** ایده‌آل است.
                  </p>
                </div>

                <div className="pt-3">
                  <h5 className="font-bold text-slate-900">۳. ارتفاع و فاصله امن (Safe Zone)</h5>
                  <p className="text-slate-600 mt-0.5">
                    ارتفاع نرمال لوگو در هدر بین **۳۶ تا ۴۸ پیکسل** رندر می‌شود. هنگام برش، اندکی فاصله خالی دور نشان بگذارید تا خطوط گرافیکی به لبه کادر نچسبند.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={handleConfirmCrop}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs font-black shadow-md shadow-[#FF3366]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>تایید و اعمال به عنوان لوگوی هدر</span>
          </button>
        </div>
      </div>
    </div>
  );
};
