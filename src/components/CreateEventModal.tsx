import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Layers, 
  User, 
  Phone, 
  Mail, 
  Image as ImageIcon, 
  FileText, 
  Award, 
  ChevronRight, 
  ChevronLeft,
  Building,
  ShieldCheck,
  Copy,
  Check,
  Upload,
  Search,
  AlertCircle,
  FileCheck2,
  Trash2,
  LogIn
} from 'lucide-react';
import { EventProposal } from '../types';
import { saveEventProposal, fetchEventProposals } from '../lib/db';
import { toPersianDigits, formatPrice } from '../utils/persianNumbers';
import { useAuth } from '../context/AuthContext';

interface CreateEventModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: (trackingCode: string) => void;
  initialTab?: 'submit' | 'track';
}

const SAMPLE_POSTERS = [
  { label: 'تئاتر کلاسیک و درام', url: 'https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=800&q=80' },
  { label: 'کنسرت موسیقی و ارکستر', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80' },
  { label: 'گالری و نقاشی مدرن', url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=800&q=80' },
  { label: 'هنر دیجیتال و تعاملی', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen = true,
  onClose,
  onSuccess,
  initialTab = 'submit',
}) => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>(initialTab);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTrackingCode, setSubmittedTrackingCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Tracking query state
  const [trackQuery, setTrackQuery] = useState('');
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);
  const [trackedItem, setTrackedItem] = useState<EventProposal | null | 'not_found'>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<EventProposal>>({
    producerName: '',
    producerRole: 'تهیه‌کننده',
    companyOrGroup: '',
    phoneNumber: '',
    email: '',
    eventTitle: '',
    eventSubtitle: '',
    category: 'theater',
    categoryLabel: 'تئاتر و نمایش',
    proposedVenue: 'تالار وحدت',
    city: 'تهران',
    proposedStartDate: '۱۴۰۵/۰۹/۰۱',
    proposedEndDate: '۱۴۰۵/۱۰/۰۱',
    proposedTimeSlots: ['۱۹:۳۰'],
    estimatedPriceFrom: 180,
    estimatedCapacity: 400,
    posterUrl: 'https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=800&q=80',
    description: '',
    castAndCrewSummary: '',
    licenseCode: '',
  });

  const [timeSlotInput, setTimeSlotInput] = useState('');

  // Auto-fill user profile info if logged in
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        producerName: prev.producerName || currentUser.fullName,
        phoneNumber: prev.phoneNumber || currentUser.phoneNumber,
        email: prev.email || currentUser.email || '',
        producerRole: prev.producerRole || (currentUser.userRole === 'director' ? 'کارگردان' : 'تهیه‌کننده')
      }));
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.producerName?.trim() || !formData.phoneNumber?.trim()) {
        alert('لطفاً نام صاحب اثر و شماره همراه جهت هماهنگی را وارد فرمایید.');
        return;
      }
    } else if (step === 2) {
      if (!formData.eventTitle?.trim() || !formData.proposedVenue?.trim()) {
        alert('لطفاً عنوان رویداد و نام سالن یا محل اجرا را وارد فرمایید.');
        return;
      }
    }
    setStep((prev) => Math.min(4, prev + 1) as any);
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1) as any);
  };

  const handleAddTimeSlot = () => {
    if (!timeSlotInput.trim()) return;
    const current = formData.proposedTimeSlots || [];
    setFormData({
      ...formData,
      proposedTimeSlots: [...current, timeSlotInput.trim()],
    });
    setTimeSlotInput('');
  };

  const handleRemoveTimeSlot = (index: number) => {
    const current = [...(formData.proposedTimeSlots || [])];
    current.splice(index, 1);
    setFormData({ ...formData, proposedTimeSlots: current });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم تصویر نباید بیشتر از ۵ مگابایت باشد.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, posterUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login?redirect=/create-event');
      return;
    }
    setIsSubmitting(true);
    try {
      const tracking = 'REQ-' + Math.floor(10000 + Math.random() * 90000);
      const newProposal: Partial<EventProposal> = {
        ...formData,
        trackingCode: tracking,
        status: 'pending',
        createdAt: 'همین الان',
        posterUrl: formData.posterUrl || 'https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=800&q=80',
      };
      await saveEventProposal(newProposal);
      setSubmittedTrackingCode(tracking);
      if (onSuccess) onSuccess(tracking);
    } catch (e) {
      console.error('Error submitting proposal:', e);
      alert('خطا در ارسال درخواست. لطفاً دوباره تلاش فرمایید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTrackingCode = () => {
    if (!submittedTrackingCode) return;
    navigator.clipboard.writeText(submittedTrackingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    setIsSearchingTrack(true);
    setTrackedItem(null);

    try {
      const proposals = await fetchEventProposals();
      const codeClean = trackQuery.trim().toUpperCase();
      const found = proposals.find(
        (p) => p.trackingCode.toUpperCase() === codeClean || p.id === codeClean || p.phoneNumber.includes(codeClean)
      );
      if (found) {
        setTrackedItem(found);
      } else {
        setTrackedItem('not_found');
      }
    } catch (err) {
      console.error(err);
      setTrackedItem('not_found');
    } finally {
      setIsSearchingTrack(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-2xl my-auto rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-l from-slate-50 via-white to-rose-50/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white flex items-center justify-center shadow-md shadow-[#FF3366]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-slate-900">
                درگاه میزبانی و ایجاد رویداد در آرتیکت
              </h3>
              <p className="text-xs text-slate-500 font-medium">ویژه تهیه‌کنندگان، کارگردانان و صاحبان آثار هنری</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Segmented Tab Switcher (Form vs Tracker) */}
        {!submittedTrackingCode && (
          <div className="px-5 pt-3 pb-2 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center p-1 rounded-xl bg-slate-200/80 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'submit'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF3366]" />
                <span>ثبت درخواست جدید</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('track')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'track'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-[#FF3366]" />
                <span>پیگیری با کد رهگیری</span>
              </button>
            </div>

            {activeTab === 'submit' && (
              <span className="hidden sm:inline-block text-[11px] font-bold text-slate-500">
                مرحله {toPersianDigits(step)} از ۴
              </span>
            )}
          </div>
        )}

        {/* Stepper Indicator (Only on Submit tab & not submitted) */}
        {activeTab === 'submit' && !submittedTrackingCode && (
          <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
            {[
              { num: 1, label: 'مشخصات متقاضی' },
              { num: 2, label: 'محتوای اثر' },
              { num: 3, label: 'زمان و برآورد مالی' },
              { num: 4, label: 'بازبینی و ارسال' },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === s.num
                    ? 'text-[#FF3366]'
                    : step > s.num
                    ? 'text-emerald-600'
                    : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-black ${
                    step === s.num
                      ? 'bg-[#FF3366] text-white shadow-xs'
                      : step > s.num
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Body Container */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(92vh-140px)] space-y-5">
          
          {/* TAB 1: TRACKING QUERY */}
          {activeTab === 'track' && (
            <div className="space-y-5 animate-fade-in text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Search className="w-4 h-4 text-[#FF3366]" />
                  <span>استعلام و پیگیری آخرین وضعیت درخواست</span>
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  کد رهگیری پیامک‌شده (مانند <span className="font-mono text-[#FF3366]">REQ-84920</span>) یا شماره همراه ثبت‌شده را وارد کنید:
                </p>

                <form onSubmit={handleTrackSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    placeholder="REQ-XXXXX یا شماره تماس..."
                    dir="ltr"
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-center font-bold focus:outline-none focus:border-[#FF3366]"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingTrack || !trackQuery.trim()}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSearchingTrack ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'جستجو'}
                  </button>
                </form>
              </div>

              {trackedItem === 'not_found' && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>هیچ رویدادی با این کد رهگیری یا شماره همراه یافت نشد.</span>
                </div>
              )}

              {trackedItem && trackedItem !== 'not_found' && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono">کد رهگیری: {trackedItem.trackingCode}</span>
                      <h4 className="font-display font-black text-sm text-slate-900 mt-0.5">{trackedItem.eventTitle}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{trackedItem.producerName} ({trackedItem.producerRole})</p>
                    </div>

                    <div>
                      {trackedItem.status === 'pending' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          در انتظار بررسی
                        </span>
                      )}
                      {trackedItem.status === 'under_review' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
                          <FileCheck2 className="w-3.5 h-3.5" />
                          در حال بررسی مجوزها
                        </span>
                      )}
                      {trackedItem.status === 'approved' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          تایید شده
                        </span>
                      )}
                      {trackedItem.status === 'published' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          منتشر شده روی گیشه
                        </span>
                      )}
                      {trackedItem.status === 'rejected' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          رد شده
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block">محل اجرا:</span>
                      <span className="font-bold text-slate-900">{trackedItem.proposedVenue} ({trackedItem.city})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">تاریخ اجرا:</span>
                      <span className="font-bold text-slate-900">{trackedItem.proposedStartDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">کف قیمت برآوردی:</span>
                      <span className="font-bold text-emerald-600">{toPersianDigits(trackedItem.estimatedPriceFrom)} هزار تومان</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">تاریخ ثبت:</span>
                      <span className="font-bold text-slate-900">{trackedItem.createdAt}</span>
                    </div>
                  </div>

                  {trackedItem.adminNotes && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                      <span className="font-bold block mb-1">یادداشت کارشناس گیشه:</span>
                      <p className="leading-relaxed">{trackedItem.adminNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUBMIT PROPOSAL */}
          {activeTab === 'submit' && (
            <>
              {/* Success Screen */}
              {submittedTrackingCode ? (
                <div className="text-center py-6 space-y-5 animate-fade-in">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-200">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display font-black text-xl text-slate-900">
                      درخواست میزبانی رویداد شما با موفقیت ثبت گردید!
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      اطلاعات اثر هنری شما در صف بررسی کارشناسان گیشه آرتیکت قرار گرفت. هماهنگی‌های لازم ظرف حداکثر ۴۸ ساعت کاری از طریق تماس و پیامک اعلام خواهد شد.
                    </p>
                  </div>

                  {/* Tracking Code Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto space-y-2">
                    <span className="text-[11px] text-slate-500 font-bold block">کد رهگیری اختصاصی درخواست شما:</span>
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="font-mono font-black text-base text-[#FF3366] tracking-wider" dir="ltr">
                        {submittedTrackingCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyTrackingCode}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'کپی شد' : 'کپی'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="py-2.5 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      متوجه شدم، بازگشت به سایت
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* STEP 1: PRODUCER & CONTACT INFO */}
                  {step === 1 && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 text-[#FF3366] flex items-center gap-2">
                        <User className="w-4 h-4 shrink-0" />
                        <span className="font-bold">مرحله ۱ از ۴: اطلاعات تهیه‌کننده، کارگردان یا صاحب اثر</span>
                      </div>

                      {!isAuthenticated && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <div className="text-xs">
                              <span className="font-bold block">برای ایجاد رویداد حتماً باید عضو سایت باشید</span>
                              <span className="text-[11px] text-amber-800/80">برای پیگیری پرونده، صدور قرارداد و واریز عواید گیشه، لطفاً وارد شوید یا ثبت‌نام کنید.</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              navigate('/login?redirect=/create-event');
                            }}
                            className="px-4 py-2 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>ورود یا ثبت‌نام سریع</span>
                          </button>
                        </div>
                      )}

                      {isAuthenticated && currentUser && (
                        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-bold">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>وارد شده با حساب: {currentUser.fullName} ({currentUser.phoneNumber})</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">هویت تایید شده</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">نام و نام خانوادگی متقاضی *</label>
                          <input
                            type="text"
                            value={formData.producerName || ''}
                            onChange={(e) => setFormData({ ...formData, producerName: e.target.value })}
                            placeholder="مثال: دکتر علی رفیعی"
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">سمت در رویداد</label>
                          <select
                            value={formData.producerRole || 'تهیه‌کننده'}
                            onChange={(e) => setFormData({ ...formData, producerRole: e.target.value })}
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                          >
                            <option value="تهیه‌کننده">تهیه‌کننده رسمی</option>
                            <option value="کارگردان">کارگردان و صاحب اثر</option>
                            <option value="سرپرست گروه هنری">سرپرست گروه هنری / ارکستر</option>
                            <option value="مدیر برنامه و آژانس هنری">مدیر برنامه و آژانس هنری</option>
                            <option value="کیوریتور و هنرمند تجسمی">کیوریتور و هنرمند تجسمی</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">شرکت، موسسه فرهنگی یا نام گروه</label>
                          <input
                            type="text"
                            value={formData.companyOrGroup || ''}
                            onChange={(e) => setFormData({ ...formData, companyOrGroup: e.target.value })}
                            placeholder="مثال: گروه تئاتر مانی / موسسه آوای باران"
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">شماره همراه معتبر (جهت تماس و پیامک) *</label>
                          <input
                            type="text"
                            value={formData.phoneNumber || ''}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none"
                            dir="ltr"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="font-bold text-slate-700">پست الکترونیک (ایمیل رسمی)</label>
                          <input
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="producer@example.com"
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: EVENT DETAILS & POSTER */}
                  {step === 2 && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-indigo-700 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 shrink-0 text-indigo-600" />
                        <span className="font-bold">مرحله ۲ از ۴: مشخصات اثر، دسته‌بندی و پوستر</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="font-bold text-slate-700">عنوان اصلی رویداد یا اثر *</label>
                          <input
                            type="text"
                            value={formData.eventTitle || ''}
                            onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                            placeholder="مثال: کنسرت بزرگ ارکستر سمفونیک شهر آفتاب"
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="font-bold text-slate-700">زیرعنوان یا شعار رویداد</label>
                          <input
                            type="text"
                            value={formData.eventSubtitle || ''}
                            onChange={(e) => setFormData({ ...formData, eventSubtitle: e.target.value })}
                            placeholder="مثال: شب نغمه‌های ماندگار موسیقی دستگاهی ایران"
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">دسته‌بندی اثر</label>
                          <select
                            value={formData.category || 'theater'}
                            onChange={(e) => {
                              const cat = e.target.value as any;
                              const labels: Record<string, string> = {
                                theater: 'تئاتر و نمایش',
                                concert: 'کنسرت و موسیقی',
                                gallery: 'گالری و تجسمی',
                                immersive: 'هنر تعاملی',
                                comedy: 'کمدی و استندآپ',
                              };
                              setFormData({ ...formData, category: cat, categoryLabel: labels[cat] || 'رویداد هنری' });
                            }}
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                          >
                            <option value="theater">تئاتر و نمایش صحنه‌ای</option>
                            <option value="concert">کنسرت و موسیقی زنده</option>
                            <option value="gallery">نمایشگاه و گالری تجسمی</option>
                            <option value="immersive">هنر تعاملی و پرفورمنس</option>
                            <option value="comedy">کمدی و استندآپ آرت</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">شهر محل اجرا</label>
                          <input
                            type="text"
                            value={formData.city || 'تهران'}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="تهران، شیراز، اصفهان..."
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="font-bold text-slate-700">سالن یا تالار پیشنهادی *</label>
                          <input
                            type="text"
                            value={formData.proposedVenue || ''}
                            onChange={(e) => setFormData({ ...formData, proposedVenue: e.target.value })}
                            placeholder="مثال: تالار وحدت، سالن اصلی تئاتر شهر، سالن رویال اسپیناس..."
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                          />
                        </div>

                        {/* Poster Upload & Presets */}
                        <div className="space-y-2 sm:col-span-2">
                          <label className="font-bold text-slate-700 block">پوستر یا تصویر اثر</label>
                          
                          <div className="flex flex-col sm:flex-row gap-3 items-start">
                            {formData.posterUrl && (
                              <div className="relative w-24 h-32 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-xs">
                                <img src={formData.posterUrl} alt="پوستر" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, posterUrl: '' })}
                                  className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                                  title="حذف پوستر"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            <div className="flex-1 space-y-2 w-full">
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer transition-colors text-xs">
                                  <Upload className="w-4 h-4 text-[#FF3366]" />
                                  <span>بارگذاری از حافظه گوشی / کامپیوتر</span>
                                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                </label>
                              </div>

                              <input
                                type="text"
                                value={formData.posterUrl || ''}
                                onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                                placeholder="یا لینک تصویر (URL) را اینجا وارد کنید..."
                                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-mono focus:bg-white focus:outline-none"
                                dir="ltr"
                              />

                              {/* Sample Presets */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                <span className="text-[10px] text-slate-400 self-center">نمونه‌های آماده:</span>
                                {SAMPLE_POSTERS.map((samp, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, posterUrl: samp.url })}
                                    className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                                  >
                                    {samp.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="font-bold text-slate-700">عوامل اجرایی و بازیگران شاخص</label>
                          <input
                            type="text"
                            value={formData.castAndCrewSummary || ''}
                            onChange={(e) => setFormData({ ...formData, castAndCrewSummary: e.target.value })}
                            placeholder="مثال: بازیگران: نوید محمدزاده، صابر ابر • آهنگساز: کریستف رضاعی"
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="font-bold text-slate-700">خلاصه داستان و معرفی اثر</label>
                          <textarea
                            rows={3}
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="شرح و خلاصه اجرایی اثر برای اطلاع کارشناسان و تماشاگران..."
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: SCHEDULE & FINANCIAL ESTIMATION */}
                  {step === 3 && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 text-amber-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 shrink-0 text-amber-600" />
                        <span className="font-bold">مرحله ۳ از ۴: زمان‌بندی اجرا و برآورد ظرفیت و قیمت بلیت</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">تاریخ شروع پیشنهادی</label>
                          <input
                            type="text"
                            value={formData.proposedStartDate || ''}
                            onChange={(e) => setFormData({ ...formData, proposedStartDate: e.target.value })}
                            placeholder="۱۴۰۵/۰۹/۰۱"
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">تاریخ پایان (اختیاری)</label>
                          <input
                            type="text"
                            value={formData.proposedEndDate || ''}
                            onChange={(e) => setFormData({ ...formData, proposedEndDate: e.target.value })}
                            placeholder="۱۴۰۵/۱۰/۰۱"
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">کف قیمت بلیت پیشنهادی (هزار تومان)</label>
                          <input
                            type="number"
                            value={formData.estimatedPriceFrom || 180}
                            onChange={(e) => setFormData({ ...formData, estimatedPriceFrom: Number(e.target.value) })}
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">برآورد ظرفیت تماشاگر هر سانس</label>
                          <input
                            type="number"
                            value={formData.estimatedCapacity || 400}
                            onChange={(e) => setFormData({ ...formData, estimatedCapacity: Number(e.target.value) })}
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none"
                          />
                        </div>

                        {/* Time slots tags */}
                        <div className="space-y-1 sm:col-span-2">
                          <label className="font-bold text-slate-700 block">سانس‌ها و ساعت‌های پیشنهادی اجرا</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={timeSlotInput}
                              onChange={(e) => setTimeSlotInput(e.target.value)}
                              placeholder="مثال: ۱۹:۳۰ یا ۲۱:۱۵"
                              className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs w-36 font-mono focus:bg-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleAddTimeSlot}
                              className="py-2 px-3.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer text-xs"
                            >
                              افزودن سانس
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {(formData.proposedTimeSlots || []).map((slot, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-mono text-xs font-bold flex items-center gap-1.5"
                              >
                                <span>ساعت {slot}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTimeSlot(idx)}
                                  className="text-slate-400 hover:text-red-600 cursor-pointer"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="font-bold text-slate-700">شماره یا کد مجوز ارشاد (در صورت صدور)</label>
                          <input
                            type="text"
                            value={formData.licenseCode || ''}
                            onChange={(e) => setFormData({ ...formData, licenseCode: e.target.value })}
                            placeholder="مثال: IRC-9402-TH یا خالی بگذارید در صورت اقدام"
                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: REVIEW & CONFIRM */}
                  {step === 4 && (
                    <div className="space-y-4 animate-fade-in text-sm">
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
                        <span className="font-bold text-xs sm:text-sm">مرحله ۴ از ۴: بازبینی نهایی اطلاعات و ارسال رسمی درخواست</span>
                      </div>

                      <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
                          <span className="text-zinc-400 text-xs font-bold">عنوان اصلی رویداد:</span>
                          <span className="font-display font-black text-base sm:text-lg text-white">{formData.eventTitle || 'تعیین نشده'}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                            <span className="text-zinc-400 block text-[11px]">صاحب اثر / متقاضی:</span>
                            <span className="font-bold text-white text-xs">{formData.producerName} ({formData.producerRole})</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                            <span className="text-zinc-400 block text-[11px]">شماره تماس:</span>
                            <span className="font-bold text-white text-xs" dir="ltr">{formData.phoneNumber}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                            <span className="text-zinc-400 block text-[11px]">محل و شهر اجرا:</span>
                            <span className="font-bold text-white text-xs">{formData.proposedVenue} • {formData.city}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                            <span className="text-zinc-400 block text-[11px]">کف قیمت برآوردی:</span>
                            <span className="font-black text-emerald-400 text-xs">{toPersianDigits(formData.estimatedPriceFrom || 0)} هزار تومان</span>
                          </div>
                        </div>

                        {formData.proposedTimeSlots && formData.proposedTimeSlots.length > 0 && (
                          <div className="pt-2 border-t border-white/10 text-xs">
                            <span className="text-zinc-400 block mb-2 font-bold">سانس‌های انتخابی:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {formData.proposedTimeSlots.map((ts, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#FF3366]" />
                                  <span>ساعت {toPersianDigits(ts)}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-300 leading-relaxed">
                        با کلیک روی «ثبت نهایی و ارسال»، درخواست شما مستقیماً به داشبورد داوری و مدیریت گیشه آرتیکت ارسال شده و کد رهگیری اختصاصی به شما تخصیص می‌یابد.
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

        </div>

        {/* Footer Actions (Only for submit tab & when not completed) */}
        {activeTab === 'submit' && !submittedTrackingCode && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>مرحله قبل</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                انصراف
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>مرحله بعد</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="py-2.5 px-7 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs font-black shadow-md shadow-[#FF3366]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'در حال ثبت درخواست...' : 'ثبت نهایی و ارسال به گیشه'}</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
