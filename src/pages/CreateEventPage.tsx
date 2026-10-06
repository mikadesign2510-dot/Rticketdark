import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  FileText, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  Ticket, 
  Building, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Search, 
  FileCheck2, 
  Trash2, 
  Eye, 
  ExternalLink,
  BookOpen,
  Scale,
  Award,
  Layers,
  HelpCircle
} from 'lucide-react';
import { 
  fetchSettings, 
  SiteSettings, 
  defaultSettings, 
  saveEventProposal, 
  fetchEventProposals 
} from '../lib/db';
import { EventProposal, ProposalDocument, ProposalDocumentType } from '../types';
import { toPersianDigits, formatPrice } from '../utils/persianNumbers';
import { useAuth } from '../context/AuthContext';

const SAMPLE_POSTERS = [
  { label: 'تئاتر و درام معاصر', url: 'https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=800&q=80' },
  { label: 'ارکستر و کنسرت کلاسیک', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80' },
  { label: 'گالری و نقاشی مدرن', url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=800&q=80' },
  { label: 'هنر تعاملی و پرفورمنس', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
];

const SAMPLE_DOCUMENT_URLS: Record<ProposalDocumentType, { fileName: string; url: string; size: string }> = {
  ershad_license: {
    fileName: 'ershad_official_permit_approved.pdf',
    url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80',
    size: '۱.۹ مگابایت'
  },
  amaken_permit: {
    fileName: 'amaken_security_police_license.jpg',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    size: '۹۵۰ کیلوبایت'
  },
  venue_contract: {
    fileName: 'theater_hall_rental_contract.pdf',
    url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    size: '۲.۶ مگابایت'
  },
  intellectual_property: {
    fileName: 'playwright_copyright_assignment.pdf',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    size: '۱.۲ مگابایت'
  },
  national_card: {
    fileName: 'national_id_producer_scan.jpg',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    size: '۶۸۰ کیلوبایت'
  },
  other: {
    fileName: 'extra_attachments_documents.pdf',
    url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80',
    size: '۱.۱ مگابایت'
  }
};

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isLoading: authLoading } = useAuth();

  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Auth gate: To create an event, the producer MUST be logged in!
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/create-event', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Steps: 0: Rules, 1: Identity, 2: Event Details, 3: Schedule & Pricing, 4: Documents & Licenses, 5: Review & Submit
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Legal rules acknowledgement state for Step 0
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [copyrightAgreed, setCopyrightAgreed] = useState(false);
  const [licenseAgreed, setLicenseAgreed] = useState(false);
  const [financialAgreed, setFinancialAgreed] = useState(false);
  const [representativeNationalCode, setRepresentativeNationalCode] = useState('');

  // Proposal Form State
  const [formData, setFormData] = useState<Partial<EventProposal>>({
    producerName: '',
    producerRole: 'تهیه‌کننده',
    companyOrGroup: '',
    phoneNumber: '',
    email: '',
    nationalCode: '',
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
    estimatedCapacity: 450,
    posterUrl: SAMPLE_POSTERS[0].url,
    description: '',
    castAndCrewSummary: '',
    licenseCode: '',
    documents: [],
  });

  const [timeSlotInput, setTimeSlotInput] = useState('');

  // Specific inputs for mandatory licenses
  const [ershadNumber, setErshadNumber] = useState('');
  const [ershadIssueDate, setErshadIssueDate] = useState('');
  const [amakenLetterNumber, setAmakenLetterNumber] = useState('');

  // Quick Tracker Mode
  const [showTrackerModal, setShowTrackerModal] = useState(false);
  const [trackQuery, setTrackQuery] = useState('');
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);
  const [trackedItem, setTrackedItem] = useState<EventProposal | null | 'not_found'>(null);

  useEffect(() => {
    async function load() {
      try {
        const s = await fetchSettings();
        if (s) setSettings(s);
      } catch (e) {
        console.error('Error fetching settings:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Pre-fill form with logged in user profile
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        producerName: prev.producerName || currentUser.fullName,
        phoneNumber: prev.phoneNumber || currentUser.phoneNumber,
        nationalCode: prev.nationalCode || currentUser.nationalCode || '',
        email: prev.email || currentUser.email || '',
        producerRole: prev.producerRole || (currentUser.userRole === 'director' ? 'کارگردان' : 'تهیه‌کننده'),
      }));
      if (currentUser.nationalCode && !representativeNationalCode) {
        setRepresentativeNationalCode(currentUser.nationalCode);
      }
    }
  }, [currentUser]);

  // Time slot handlers
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

  // Poster file upload
  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم تصویر نباید از ۵ مگابایت بیشتر باشد.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, posterUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Document upload handler
  const handleDocumentUpload = (
    type: ProposalDocumentType, 
    typeLabel: string, 
    e: React.ChangeEvent<HTMLInputElement>,
    customLicenseNumber?: string,
    customIssueDate?: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('حجم فایل نباید از ۱۵ مگابایت بیشتر باشد.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const newDoc: ProposalDocument = {
          id: 'doc-' + Date.now(),
          type,
          typeLabel,
          fileName: file.name,
          fileUrl: reader.result as string,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} مگابایت`,
          uploadedAt: 'همین الان',
          licenseNumber: customLicenseNumber || ershadNumber || undefined,
          issueDate: customIssueDate || ershadIssueDate || undefined,
        };

        const existingDocs = (formData.documents || []).filter(d => d.type !== type);
        setFormData({
          ...formData,
          documents: [...existingDocs, newDoc]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSampleDocument = (
    type: ProposalDocumentType,
    typeLabel: string,
    licenseNo?: string
  ) => {
    const sample = SAMPLE_DOCUMENT_URLS[type];
    const newDoc: ProposalDocument = {
      id: 'doc-' + Date.now(),
      type,
      typeLabel,
      fileName: sample.fileName,
      fileUrl: sample.url,
      fileSize: sample.size,
      uploadedAt: 'همین الان (نمونه استعلامی)',
      licenseNumber: licenseNo || (type === 'ershad_license' ? 'IRC-940214-TH' : type === 'amaken_permit' ? 'AMK-84102-SEC' : 'VN-5921-GOV'),
      issueDate: '۱۴۰۵/۰۶/۱۵',
    };

    const existingDocs = (formData.documents || []).filter(d => d.type !== type);
    setFormData({
      ...formData,
      documents: [...existingDocs, newDoc]
    });
  };

  const handleRemoveDocument = (type: ProposalDocumentType) => {
    const docs = (formData.documents || []).filter(d => d.type !== type);
    setFormData({ ...formData, documents: docs });
  };

  // Step validations
  const handleProceedFromStep0 = () => {
    if (!termsAgreed || !copyrightAgreed || !licenseAgreed || !financialAgreed) {
      alert('لطفاً جهت ورود به مراحل ایجاد رویداد، تمامی مفاد حقوقی و تعهدات قانونی را مطالعه و تایید فرمایید.');
      return;
    }
    if (!representativeNationalCode.trim() || representativeNationalCode.length < 8) {
      alert('لطفاً کدملی یا شناسه ملی نماینده قانونی اثر را وارد فرمایید.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      termsAccepted: true,
      termsAcceptedDate: '۱۴۰۵/۰۱/۱۵',
      nationalCode: representativeNationalCode.trim(),
    }));
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.producerName?.trim() || !formData.phoneNumber?.trim()) {
        alert('لطفاً نام صاحب اثر و شماره همراه معتبر را وارد کنید.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.eventTitle?.trim() || !formData.proposedVenue?.trim()) {
        alert('لطفاً عنوان رویداد و نام سالن یا تالار را وارد کنید.');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.proposedStartDate || (formData.estimatedPriceFrom || 0) <= 0) {
        alert('لطفاً تاریخ شروع و کف قیمت بلیت را مشخص نمایید.');
        return;
      }
    } else if (currentStep === 4) {
      // Check for Ershad license if required
      const hasErshad = (formData.documents || []).some(d => d.type === 'ershad_license');
      if (settings.hostingRequiresErshadLicense !== false && !hasErshad && !formData.licenseCode) {
        alert('بارگذاری مجوز رسمی وزارت فرهنگ و ارشاد اسلامی یا درج شماره پروانه الزامی است.');
        return;
      }
    }

    setCurrentStep(prev => Math.min(5, prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Proposal
  const handleSubmitProposal = async () => {
    setIsSubmitting(true);
    try {
      const tracking = 'REQ-' + Math.floor(10000 + Math.random() * 90000);
      const newProposal: Partial<EventProposal> = {
        ...formData,
        trackingCode: tracking,
        status: 'pending',
        createdAt: 'همین الان',
        termsAccepted: true,
        termsAcceptedDate: new Date().toLocaleDateString('fa-IR'),
        licenseCode: ershadNumber || formData.licenseCode || 'در انتظار تایید مدارک',
      };

      await saveEventProposal(newProposal);
      setSubmittedCode(tracking);
    } catch (e) {
      console.error(e);
      alert('خطا در ثبت درخواست. لطفاً دوباره تلاش نمایید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Tracker Search
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

  const stepsList = [
    { num: 0, label: 'قوانین و تعهدات حقوقی', icon: Scale },
    { num: 1, label: 'هویت متقاضی و صاحب اثر', icon: User },
    { num: 2, label: 'مشخصات و محتوای اثر', icon: Sparkles },
    { num: 3, label: 'زمان‌بندی و گیشه مالی', icon: Calendar },
    { num: 4, label: 'بارگذاری مدارک و مجوزها', icon: FileCheck2 },
    { num: 5, label: 'بازبینی و ارسال نهایی', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-[#FF3366] selection:text-white" dir="rtl">
      
      {/* 1. Header Bar with Brand and Navigation */}
      <header className="sticky top-0 z-50 bg-[#0A0C14]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF3366] via-[#FF5533] to-[#F59E0B] p-[1.5px] shadow-lg shadow-[#FF3366]/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0D0F18] rounded-[14px] flex items-center justify-center font-display font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF3366] to-[#F59E0B]">
                آ
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg text-white">آرتیکت</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF3366]/20 text-[#FF3366] font-bold border border-[#FF3366]/30">
                  سامانه میزبانی
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">درگاه رسمی درخواست ایجاد رویداد و گیشه آثار</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {currentUser && (
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-200 transition-colors"
              title="مشاهده حساب کاربری"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF3366] to-[#F59E0B] flex items-center justify-center text-[10px] text-white font-black">
                {currentUser.fullName ? currentUser.fullName[0] : 'U'}
              </div>
              <span className="hidden sm:inline">{currentUser.fullName}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setShowTrackerModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#FF3366]" />
            <span>پیگیری پرونده</span>
          </button>

          <Link
            to="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white transition-all cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">سایت اصلی</span>
          </Link>
        </div>
      </header>

      {/* 2. Top Progress Stepper (Only visible when not completed) */}
      {!submittedCode && (
        <div className="bg-[#0B0E19] border-b border-white/[0.06] py-4 px-4 sm:px-8 overflow-x-auto">
          <div className="max-w-5xl mx-auto flex items-center justify-between min-w-[650px] gap-2">
            {stepsList.map((s, idx) => {
              const Icon = s.icon;
              const isPassed = currentStep > s.num;
              const isCurrent = currentStep === s.num;

              return (
                <div key={s.num} className="flex items-center gap-2 flex-1 last:flex-none">
                  <button
                    type="button"
                    disabled={s.num > currentStep}
                    onClick={() => setCurrentStep(s.num)}
                    className={`flex items-center gap-2 text-xs font-bold transition-all text-right ${
                      isCurrent
                        ? 'text-[#FF3366]'
                        : isPassed
                        ? 'text-emerald-400 hover:text-emerald-300 cursor-pointer'
                        : 'text-zinc-600 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-tr from-[#FF3366] to-[#FF5533] text-white shadow-lg shadow-[#FF3366]/30 ring-2 ring-[#FF3366]/40 scale-105'
                        : isPassed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-zinc-500 border border-white/5'
                    }`}>
                      {isPassed ? <Check className="w-4 h-4" /> : toPersianDigits(s.num)}
                    </div>
                    <span className="whitespace-nowrap">{s.label}</span>
                  </button>

                  {idx < stepsList.length - 1 && (
                    <div className={`flex-1 h-[2px] mx-2 rounded-full transition-colors ${
                      isPassed ? 'bg-emerald-500/40' : 'bg-white/5'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Main Form Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* SUCCESS CONFIRMATION SCREEN & DIGITAL RECEIPT */}
        {submittedCode ? (
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#111425] via-[#0D101D] to-[#080A12] p-6 sm:p-12 space-y-8 shadow-2xl animate-fade-in text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-500/15 px-3.5 py-1.5 rounded-full border border-emerald-500/30">
                <Check className="w-3.5 h-3.5" />
                <span>پرونده با موفقیت در دبیرخانه گیشه ثبت گردید</span>
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                درخواست میزبانی رویداد شما رسماً دریافت شد
              </h2>
              <p className="text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
                مدارک و تاییدیه‌های ارسالی توسط کارشناسان حقوقی و گیشه آرتیکت بررسی خواهند شد. نتیجه استعلام و هماهنگی سالن ظرف ۴۸ ساعت کاری از طریق پیامک به اطلاع شما خواهد رسید.
              </p>
            </div>

            {/* Tracking Code Highlight Box */}
            <div className="max-w-md mx-auto p-5 rounded-3xl bg-black/60 border border-white/15 space-y-3 shadow-xl">
              <span className="text-xs text-zinc-400 font-bold block">کد رهگیری اختصاصی پرونده شما:</span>
              <div className="flex items-center justify-between bg-[#14182B] p-3.5 rounded-2xl border border-white/10">
                <span className="font-mono font-black text-2xl text-[#FF3366] tracking-wider" dir="ltr">
                  {submittedCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(submittedCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'کپی شد' : 'کپی کد'}</span>
                </button>
              </div>
              <p className="text-xs text-zinc-400 leading-normal">
                پیامک حاوی کد رهگیری و لینک پیگیری لحظه‌ای نیز به شماره همراه شما ارسال گردید.
              </p>
            </div>

            {/* Submitted Proposal Digital Receipt */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.03] border border-white/10 text-right space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">خلاصه فیش ثبت درخواست گیشه</h4>
                </div>
                <span className="text-xs text-zinc-400 font-mono">
                  {toPersianDigits(new Date().toLocaleDateString('fa-IR'))}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
                <div>
                  <span className="text-zinc-500 block text-[11px]">عنوان اثر:</span>
                  <strong className="text-white font-bold text-sm">{formData.eventTitle || 'رویداد هنری'}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">دسته‌بندی:</span>
                  <strong className="text-white font-bold">{formData.categoryLabel || 'تئاتر و نمایش'}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">محل و شهر اجرا:</span>
                  <strong className="text-white font-bold">{formData.proposedVenue || 'تعیین نشده'} ({formData.city || 'تهران'})</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">صاحب اثر / متقاضی:</span>
                  <strong className="text-white font-bold">{formData.producerName} ({formData.producerRole})</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">تاریخ پیشنهادی اجرا:</span>
                  <strong className="text-white font-bold">{toPersianDigits(formData.proposedStartDate || '')} تا {toPersianDigits(formData.proposedEndDate || 'پایان دوره')}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">مدارک پیوست‌شده:</span>
                  <strong className="text-emerald-400 font-bold">{toPersianDigits((formData.documents || []).length)} مدرک رسمی</strong>
                </div>
              </div>

              {/* Progress Stepper Mini */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-xs font-bold gap-2">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>۱. ثبت پرونده</span>
                  </div>
                  <div className="flex-1 h-[2px] bg-emerald-500/40 mx-2" />
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Clock className="w-4 h-4 shrink-0 animate-pulse" />
                    <span>۲. بررسی مدارک و ارشاد</span>
                  </div>
                  <div className="flex-1 h-[2px] bg-white/10 mx-2" />
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Ticket className="w-4 h-4 shrink-0" />
                    <span>۳. فعال‌سازی گیشه</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTrackQuery(submittedCode);
                  setShowTrackerModal(true);
                }}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold border border-white/15 transition-all cursor-pointer flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-[#FF3366]" />
                <span>پیگیری آنی این پرونده</span>
              </button>

              <Link
                to="/"
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white text-xs sm:text-sm font-black shadow-lg shadow-[#FF3366]/25 hover:brightness-110 active:scale-95 transition-all"
              >
                بازگشت به صفحه اصلی آرتیکت
              </Link>

              <button
                type="button"
                onClick={() => {
                  setSubmittedCode(null);
                  setCurrentStep(0);
                }}
                className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs sm:text-sm font-bold border border-white/5 transition-all cursor-pointer"
              >
                ثبت رویداد جدید دیگر
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#0E111E]/80 backdrop-blur-xl p-6 sm:p-10 shadow-2xl space-y-8">
            
            {/* ============================================================== */}
            {/* STEP 0: LEGAL RULES, COMPLIANCE & HOSTING POLICIES GATE       */}
            {/* ============================================================== */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-white/10 pb-5 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-400 border border-amber-500/25">
                    <Scale className="w-4 h-4" />
                    <span>مرحله الزامی: منشور حقوقی و ضوابط میزبانی</span>
                  </div>
                  <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
                    {settings.hostingRulesTitle || 'منشور حقوقی، ضوابط و تعهدات میزبانی رویداد در آرتیکت'}
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {settings.hostingRulesSubtitle || 'مجموعه ضوابط رسمی، الزامات وزارت فرهنگ و ارشاد اسلامی، نظارت اماکن عمومی فراجا، حقوق پدیدآورندگان و تسویه‌حساب گیشه'}
                  </p>
                </div>

                {/* Platform Commission & Transparency Badge */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-l from-[#FF3366]/10 via-[#3B82F6]/10 to-transparent border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF3366] to-[#F59E0B] text-white flex items-center justify-center shrink-0 shadow-md">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">سهم درآمد و کارمزد شفاف گیشه</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        سهم خالص صاحب اثر از فروش گیشه: <strong className="text-emerald-400 font-mono text-sm">{toPersianDigits(settings.hostingCommissionRate || 85)}٪</strong> • کارمزد پلتفرم و خدمات فنی: <span className="font-mono">{toPersianDigits(100 - (settings.hostingCommissionRate || 85))}٪</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/10 text-zinc-300 border border-white/10 shrink-0">
                    تسویه حساب پایا در ۴۸ ساعت
                  </span>
                </div>

                {/* Legal Clauses List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#FF3366]" />
                    <span>مفاد قانونی و ضوابط رسمی همکاری:</span>
                  </h3>

                  <div className="space-y-3">
                    {(settings.hostingRulesItems || defaultSettings.hostingRulesItems || []).map((rule, idx) => (
                      <div
                        key={rule.id || idx}
                        className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-white/10 text-[#FF3366] text-[11px] font-mono font-bold flex items-center justify-center">
                              {toPersianDigits(idx + 1)}
                            </span>
                            <span>{rule.title}</span>
                          </h4>
                          {rule.isRequiredAck && (
                            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 shrink-0">
                              الزام قانونی
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed pr-7">
                          {rule.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mandatory Agreements Checkboxes */}
                <div className="p-5 rounded-2xl bg-black/40 border border-amber-500/20 space-y-4">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>اقرارنامه و تایید رسمی نماینده قانونی اثر:</span>
                  </h4>

                  <div className="space-y-3 text-xs text-zinc-300">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-zinc-700 text-[#FF3366] focus:ring-[#FF3366] bg-black cursor-pointer"
                      />
                      <span className="group-hover:text-white transition-colors leading-relaxed">
                        اینجانب به عنوان تهیه‌کننده یا نماینده قانونی اثر، تمامی مفاد منشور حقوقی، ضوابط فنی و شیوه‌نامه میزبانی آرتیکت را به دقت مطالعه نموده و به آن متعهد می‌گردم.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={copyrightAgreed}
                        onChange={(e) => setCopyrightAgreed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-zinc-700 text-[#FF3366] focus:ring-[#FF3366] bg-black cursor-pointer"
                      />
                      <span className="group-hover:text-white transition-colors leading-relaxed">
                        اصالت مالکیت فکری، حق نشر، متن نمایشنامه و قطعات اجرایی را تایید کرده و مسئولیت هرگونه ادعای کپی‌رایت شخص ثالث را عهده‌دار می‌شوم.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={licenseAgreed}
                        onChange={(e) => setLicenseAgreed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-zinc-700 text-[#FF3366] focus:ring-[#FF3366] bg-black cursor-pointer"
                      />
                      <span className="group-hover:text-white transition-colors leading-relaxed">
                        متعهد می‌گردم کلیه مجوزهای رسمی وزارت فرهنگ و ارشاد اسلامی، تاییدیه پلیس اماکن و قرارداد سالن را در مرحله نهایی بارگذاری نمایم.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={financialAgreed}
                        onChange={(e) => setFinancialAgreed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-zinc-700 text-[#FF3366] focus:ring-[#FF3366] bg-black cursor-pointer"
                      />
                      <span className="group-hover:text-white transition-colors leading-relaxed">
                        ضوابط مالی، کسر کارمزد مصوب و الزام استرداد ۱۰۰٪ وجوه به تماشاگران در صورت لغو یا جابجایی سانس را می‌پذیرم.
                      </span>
                    </label>
                  </div>

                  {/* Representative National Code Input */}
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 block">
                      کدملی / شناسه ملی نماینده قانونی یا تهیه‌کننده *
                    </label>
                    <input
                      type="text"
                      value={representativeNationalCode}
                      onChange={(e) => setRepresentativeNationalCode(e.target.value)}
                      placeholder="۱۰ رقم کدملی (مثال: ۰۰۱۲۳۴۵۶۷۸)"
                      dir="ltr"
                      className="w-full sm:w-72 p-2.5 rounded-xl border border-white/10 bg-white/5 font-mono text-xs text-white focus:outline-none focus:border-[#FF3366]"
                    />
                  </div>
                </div>

                {/* Proceed Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleProceedFromStep0}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs font-black shadow-xl shadow-[#FF3366]/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>تایید قوانین و ورود به مراحل ایجاد رویداد</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 1: PRODUCER & APPLICANT IDENTITY                          */}
            {/* ============================================================== */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in text-sm">
                <div className="border-b border-white/10 pb-4 space-y-1">
                  <span className="text-xs font-bold text-[#FF3366]">گام ۱ از ۵</span>
                  <h2 className="font-display font-black text-xl sm:text-2xl text-white">
                    مشخصات تهیه‌کننده، کارگردان یا صاحب اثر
                  </h2>
                  <p className="text-sm text-zinc-400">
                    اطلاعات صاحب امتیاز اثر جهت تنظیم قرارداد گیشه و ارتباط رسمی درج می‌گردد.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-300">نام و نام خانوادگی متقاضی *</label>
                    <input
                      type="text"
                      value={formData.producerName || ''}
                      onChange={(e) => setFormData({ ...formData, producerName: e.target.value })}
                      placeholder="مثال: دکتر علی رفیعی"
                      className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white font-bold focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-300">سمت و عنوان رسمی در اثر *</label>
                    <select
                      value={formData.producerRole || 'تهیه‌کننده'}
                      onChange={(e) => setFormData({ ...formData, producerRole: e.target.value })}
                      className="w-full p-3 rounded-xl border border-white/10 bg-[#121626] text-white font-bold focus:border-[#FF3366] focus:outline-none"
                    >
                      <option value="تهیه‌کننده">تهیه‌کننده رسمی اثر</option>
                      <option value="کارگردان">کارگردان و مولف</option>
                      <option value="سرپرست گروه هنری">سرپرست گروه هنری / ارکستر</option>
                      <option value="مدیر برنامه و آژانس هنری">مدیر برنامه و آژانس تبلیغاتی</option>
                      <option value="کیوریتور و هنرمند تجسمی">کیوریتور و هنرمند تجسمی</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-300">شماره همراه معتبر (جهت پیامک و تماس) *</label>
                    <input
                      type="text"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      dir="ltr"
                      className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white font-mono font-bold focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-300">شرکت، موسسه فرهنگی یا نام گروه</label>
                    <input
                      type="text"
                      value={formData.companyOrGroup || ''}
                      onChange={(e) => setFormData({ ...formData, companyOrGroup: e.target.value })}
                      placeholder="مثال: موسسه آوای باران / گروه تئاتر مانی"
                      className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-300">کدملی صاحب اثر</label>
                    <input
                      type="text"
                      value={formData.nationalCode || ''}
                      onChange={(e) => setFormData({ ...formData, nationalCode: e.target.value })}
                      placeholder="۰۰۱۲۳۴۵۶۷۸"
                      dir="ltr"
                      className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white font-mono focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-300">پست الکترونیک (ایمیل رسمی)</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="producer@example.com"
                      dir="ltr"
                      className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white font-mono focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 2: EVENT DETAILS & POSTER                                 */}
            {/* ============================================================== */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in text-sm">
                <div className="border-b border-white/10 pb-4 space-y-1">
                  <span className="text-xs font-bold text-[#FF3366]">گام ۲ از ۵</span>
                  <h2 className="font-display font-black text-xl sm:text-2xl text-white">
                    مشخصات و محتوای اثر هنری
                  </h2>
                  <p className="text-sm text-zinc-400">
                    عنوان اثر، دسته‌بندی، خلاصه اجرایی و تصویر پوستر روی کارت‌های سایت نمایش داده خواهد شد.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-bold text-zinc-300">عنوان اصلی رویداد یا اثر *</label>
                    <input
                      type="text"
                      value={formData.eventTitle || ''}
                      onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                      placeholder="مثال: نمایش هملت در صحنه معاصر"
                      className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white font-bold text-sm focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-bold text-zinc-300">زیرعنوان یا شعار رویداد</label>
                    <input
                      type="text"
                      value={formData.eventSubtitle || ''}
                      onChange={(e) => setFormData({ ...formData, eventSubtitle: e.target.value })}
                      placeholder="مثال: روایتی نو از درام تراژیک شکسپیر با بازیگران برگزیده تئاتر"
                      className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-300">دسته‌بندی اثر</label>
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
                      className="w-full p-3 rounded-xl border border-white/10 bg-[#121626] text-white font-bold focus:border-[#FF3366] focus:outline-none"
                    >
                      <option value="theater">تئاتر و نمایش صحنه‌ای</option>
                      <option value="concert">کنسرت و موسیقی زنده</option>
                      <option value="gallery">نمایشگاه و گالری تجسمی</option>
                      <option value="immersive">هنر تعاملی و پرفورمنس</option>
                      <option value="comedy">کمدی و استندآپ آرت</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-300">شهر برگزاری</label>
                    <input
                      type="text"
                      value={formData.city || 'تهران'}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="تهران، اصفهان، شیراز..."
                      className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white font-bold focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-bold text-zinc-300">سالن یا تالار پیشنهادی *</label>
                    <input
                      type="text"
                      value={formData.proposedVenue || ''}
                      onChange={(e) => setFormData({ ...formData, proposedVenue: e.target.value })}
                      placeholder="مثال: تالار وحدت، سالن اصلی تئاتر شهر، سالن میلاد..."
                      className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white font-bold focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>

                  {/* Poster Image Management */}
                  <div className="space-y-2 sm:col-span-2 pt-2">
                    <label className="font-bold text-zinc-300 block">پوستر اصلی رویداد</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                      {formData.posterUrl && (
                        <div className="relative w-28 h-36 rounded-xl overflow-hidden border border-white/20 shrink-0 shadow-lg group">
                          <img src={formData.posterUrl} alt="پوستر" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, posterUrl: '' })}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                            title="حذف پوستر"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <div className="flex-1 space-y-2.5 w-full">
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold cursor-pointer transition-colors text-xs">
                          <Upload className="w-4 h-4 text-[#FF3366]" />
                          <span>بارگذاری پوستر از رایانه / گوشی</span>
                          <input type="file" accept="image/*" onChange={handlePosterUpload} className="hidden" />
                        </label>

                        <input
                          type="text"
                          value={formData.posterUrl || ''}
                          onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                          placeholder="یا پیوند (URL) تصویر پوستر را وارد نمایید..."
                          dir="ltr"
                          className="w-full p-2.5 rounded-xl border border-white/10 bg-black/40 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#FF3366]"
                        />

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-zinc-500">پوسترهای نمونه:</span>
                          {SAMPLE_POSTERS.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setFormData({ ...formData, posterUrl: s.url })}
                              className="text-[10px] px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 font-bold border border-white/5 cursor-pointer"
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-bold text-zinc-300">عوامل اجرایی و بازیگران شاخص</label>
                    <input
                      type="text"
                      value={formData.castAndCrewSummary || ''}
                      onChange={(e) => setFormData({ ...formData, castAndCrewSummary: e.target.value })}
                      placeholder="مثال: بازیگران: صابر ابر، الهام کردا • موسیقی متن: کریستف رضاعی"
                      className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-bold text-zinc-300">خلاصه داستان و معرفی اثر</label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="متن توصیفی اثر جهت چاپ بروشور و صفحه اختصاصی اثر..."
                      className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white text-xs focus:border-[#FF3366] focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 3: SCHEDULE, PRICING & VENUE                              */}
            {/* ============================================================== */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in text-sm">
                <div className="border-b border-white/10 pb-4 space-y-1">
                  <span className="text-xs font-bold text-[#FF3366]">گام ۳ از ۵</span>
                  <h2 className="font-display font-black text-xl sm:text-2xl text-white">
                    زمان‌بندی اجرا و برآورد ظرفیت و قیمت بلیت
                  </h2>
                  <p className="text-sm text-zinc-400">
                    تعیین بازه تاریخی اجراها، سانس‌های روزانه و کف قیمت جهت پیکربندی نقشه صندلی.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-300">تاریخ شروع پیشنهادی *</label>
                    <input
                      type="text"
                      value={formData.proposedStartDate || ''}
                      onChange={(e) => setFormData({ ...formData, proposedStartDate: e.target.value })}
                      placeholder="۱۴۰۵/۰۹/۰۱"
                      className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white font-mono font-bold focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-300">تاریخ پایان اجراها (اختیاری)</label>
                    <input
                      type="text"
                      value={formData.proposedEndDate || ''}
                      onChange={(e) => setFormData({ ...formData, proposedEndDate: e.target.value })}
                      placeholder="۱۴۰۵/۱۰/۰۱"
                      className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white font-mono focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-300">کف قیمت بلیت پیشنهادی (هزار تومان) *</label>
                    <input
                      type="number"
                      value={formData.estimatedPriceFrom || 180}
                      onChange={(e) => setFormData({ ...formData, estimatedPriceFrom: Number(e.target.value) })}
                      className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-emerald-400 font-mono font-bold text-sm focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-300">برآورد ظرفیت تماشاگر هر سانس</label>
                    <input
                      type="number"
                      value={formData.estimatedCapacity || 400}
                      onChange={(e) => setFormData({ ...formData, estimatedCapacity: Number(e.target.value) })}
                      className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white font-mono font-bold focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>

                  {/* Proposed Time Slots Tag Editor */}
                  <div className="space-y-2 sm:col-span-2 pt-2">
                    <label className="font-bold text-zinc-300 block">سانس‌ها و ساعت‌های پیشنهادی اجرا</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={timeSlotInput}
                        onChange={(e) => setTimeSlotInput(e.target.value)}
                        placeholder="مثال: ۱۹:۳۰ یا ۲۱:۱۵"
                        className="p-2.5 rounded-xl border border-white/10 bg-white/5 font-mono text-xs w-36 text-center text-white focus:outline-none focus:border-[#FF3366]"
                      />
                      <button
                        type="button"
                        onClick={handleAddTimeSlot}
                        className="py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold cursor-pointer text-xs transition-colors"
                      >
                        افزودن سانس
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {(formData.proposedTimeSlots || []).map((slot, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-white font-mono text-xs font-bold flex items-center gap-2"
                        >
                          <span>ساعت {slot}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTimeSlot(idx)}
                            className="text-zinc-400 hover:text-rose-400 cursor-pointer text-sm"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 4: MANDATORY LICENSES & OFFICIAL DOCUMENTS UPLOAD         */}
            {/* ============================================================== */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in text-sm">
                <div className="border-b border-white/10 pb-5 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-rose-500/15 text-[#FF3366] border border-[#FF3366]/25">
                    <ShieldCheck className="w-4 h-4" />
                    <span>مرحله حیاتی و الزامی: بارگذاری مجوزهای رسمی</span>
                  </div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                    مجوز وزارت ارشاد، پلیس اماکن و قرارداد سالن
                  </h2>
                  <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
                    مطابق ضوابط شورای نظارت و ارزشیابی و پلیس امنیت عمومی، فعال‌سازی گیشه منوط به رویت فایل معتبر مجوزها است.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Document 1: Ershad License */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base text-white">۱. پروانه اجرای رسمی از وزارت فرهنگ و ارشاد اسلامی *</h4>
                            <span className="text-[11px] text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full font-bold border border-rose-500/20">
                              الزامی
                            </span>
                          </div>
                          <p className="text-zinc-400 text-xs mt-1">
                            صادره از شورای ارزشیابی و نظارت اداره کل هنرهای نمایشی یا دفتر موسیقی
                          </p>
                        </div>
                      </div>

                      {/* Status indicator */}
                      {(formData.documents || []).some(d => d.type === 'ershad_license') && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>بارگذاری شد</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-300">شماره ثبت مجوز ارشاد</label>
                        <input
                          type="text"
                          value={ershadNumber}
                          onChange={(e) => setErshadNumber(e.target.value)}
                          placeholder="مثال: IRC-940214-TH"
                          dir="ltr"
                          className="w-full p-3 rounded-xl border border-white/10 bg-black/40 font-mono text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF3366]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-300">تاریخ صدور / اعتبار پروانه</label>
                        <input
                          type="text"
                          value={ershadIssueDate}
                          onChange={(e) => setErshadIssueDate(e.target.value)}
                          placeholder="۱۴۰۵/۰۶/۱۵"
                          dir="ltr"
                          className="w-full p-3 rounded-xl border border-white/10 bg-black/40 font-mono text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF3366]"
                        />
                      </div>
                    </div>

                    {/* Upload button or current document display */}
                    {(formData.documents || []).find(d => d.type === 'ershad_license') ? (
                      <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs">
                        <div className="min-w-0 flex items-center gap-2 text-purple-300 font-bold">
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="truncate">{(formData.documents || []).find(d => d.type === 'ershad_license')?.fileName}</span>
                          <span className="text-zinc-400 font-normal shrink-0">({(formData.documents || []).find(d => d.type === 'ershad_license')?.fileSize})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument('ershad_license')}
                          className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer shrink-0 mr-2"
                        >
                          حذف و بارگذاری مجدد
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 font-bold cursor-pointer transition-colors text-xs">
                          <Upload className="w-4 h-4" />
                          <span>بارگذاری فایل پروانه ارشاد (PDF یا عکس)</span>
                          <input 
                            type="file" 
                            accept=".pdf,image/*" 
                            onChange={(e) => handleDocumentUpload('ershad_license', 'پروانه اجرای وزارت فرهنگ و ارشاد اسلامی', e, ershadNumber, ershadIssueDate)} 
                            className="hidden" 
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => handleAddSampleDocument('ershad_license', 'پروانه اجرای وزارت فرهنگ و ارشاد اسلامی', ershadNumber || 'IRC-940214-TH')}
                          className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold border border-white/5 cursor-pointer"
                        >
                          استفاده از نمونه تاییدیه معتبر
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Document 2: Amaken Security Permit */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base text-white">۲. تاییدیه پلیس نظارت بر اماکن عمومی فراجا</h4>
                            <span className="text-[11px] text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full font-bold border border-blue-500/20">
                              انتظامی
                            </span>
                          </div>
                          <p className="text-zinc-400 text-xs mt-1">
                            نامه موافقت انتظامی با تاریخ و سانس‌های برگزاری رویداد
                          </p>
                        </div>
                      </div>

                      {(formData.documents || []).some(d => d.type === 'amaken_permit') && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>بارگذاری شد</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-300">شماره نامه / کد رهگیری اماکن</label>
                      <input
                        type="text"
                        value={amakenLetterNumber}
                        onChange={(e) => setAmakenLetterNumber(e.target.value)}
                        placeholder="مثال: AMK-84102-SEC"
                        dir="ltr"
                        className="w-full sm:w-80 p-3 rounded-xl border border-white/10 bg-black/40 font-mono text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF3366]"
                      />
                    </div>

                    {(formData.documents || []).find(d => d.type === 'amaken_permit') ? (
                      <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
                        <div className="min-w-0 flex items-center gap-2 text-blue-300 font-bold">
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="truncate">{(formData.documents || []).find(d => d.type === 'amaken_permit')?.fileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument('amaken_permit')}
                          className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer shrink-0 mr-2"
                        >
                          حذف و جایگزینی
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/15 hover:bg-blue-500/25 text-blue-200 font-bold cursor-pointer transition-colors text-xs">
                          <Upload className="w-4 h-4" />
                          <span>بارگذاری تاییدیه اماکن (PDF یا تصویر)</span>
                          <input 
                            type="file" 
                            accept=".pdf,image/*" 
                            onChange={(e) => handleDocumentUpload('amaken_permit', 'تاییدیه پلیس نظارت بر اماکن عمومی فراجا', e, amakenLetterNumber)} 
                            className="hidden" 
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => handleAddSampleDocument('amaken_permit', 'تاییدیه پلیس نظارت بر اماکن عمومی فراجا', amakenLetterNumber || 'AMK-84102-SEC')}
                          className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold border border-white/5 cursor-pointer"
                        >
                          انتخاب نمونه تاییدیه اماکن
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Document 3: Venue / Hall Contract */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base text-white">۳. قرارداد اجاره یا معرفی‌نامه تالار و سالن</h4>
                            <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/20">
                              سالن
                            </span>
                          </div>
                          <p className="text-zinc-400 text-xs mt-1">
                            قرارداد ممهور به مهر تالار با قید ظرفیت صندلی‌ها و بازه تاریخ اجراها
                          </p>
                        </div>
                      </div>

                      {(formData.documents || []).some(d => d.type === 'venue_contract') && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>بارگذاری شد</span>
                        </span>
                      )}
                    </div>

                    {(formData.documents || []).find(d => d.type === 'venue_contract') ? (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                        <div className="min-w-0 flex items-center gap-2 text-amber-300 font-bold">
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="truncate">{(formData.documents || []).find(d => d.type === 'venue_contract')?.fileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument('venue_contract')}
                          className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer shrink-0 mr-2"
                        >
                          حذف و جایگزینی
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 font-bold cursor-pointer transition-colors text-xs">
                          <Upload className="w-4 h-4" />
                          <span>بارگذاری فایل قرارداد تالار (PDF یا تصویر)</span>
                          <input 
                            type="file" 
                            accept=".pdf,image/*" 
                            onChange={(e) => handleDocumentUpload('venue_contract', 'قرارداد اجاره یا رزرو سالن و تالار', e)} 
                            className="hidden" 
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => handleAddSampleDocument('venue_contract', 'قرارداد اجاره یا رزرو سالن و تالار')}
                          className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold border border-white/5 cursor-pointer"
                        >
                          نمونه قرارداد تالار
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Document 4: Intellectual Property / Author Contract (Optional) */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                          <Scale className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base text-white">۴. واگذاری حق مولف / حق نشر اثر (اختیاری)</h4>
                            <span className="text-[11px] text-zinc-400 bg-white/10 px-2.5 py-0.5 rounded-full font-bold border border-white/10">
                              تکمیلی
                            </span>
                          </div>
                          <p className="text-zinc-400 text-xs mt-1">
                            قرارداد نویسنده نمایشنامه، آهنگساز، مترجم یا صاحب امتیاز اثر
                          </p>
                        </div>
                      </div>

                      {(formData.documents || []).some(d => d.type === 'intellectual_property') && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>بارگذاری شد</span>
                        </span>
                      )}
                    </div>

                    {(formData.documents || []).find(d => d.type === 'intellectual_property') ? (
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                        <div className="min-w-0 flex items-center gap-2 text-emerald-300 font-bold">
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="truncate">{(formData.documents || []).find(d => d.type === 'intellectual_property')?.fileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument('intellectual_property')}
                          className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer shrink-0 mr-2"
                        >
                          حذف و جایگزینی
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 font-bold cursor-pointer transition-colors text-xs">
                          <Upload className="w-4 h-4" />
                          <span>بارگذاری قرارداد حق مولف (PDF یا تصویر)</span>
                          <input 
                            type="file" 
                            accept=".pdf,image/*" 
                            onChange={(e) => handleDocumentUpload('intellectual_property', 'قرارداد واگذاری حق مولف و پدیدآورنده', e)} 
                            className="hidden" 
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => handleAddSampleDocument('intellectual_property', 'قرارداد واگذاری حق مولف و پدیدآورنده')}
                          className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold border border-white/5 cursor-pointer"
                        >
                          نمونه قرارداد کپی‌رایت
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 5: FINAL REVIEW & OFFICIAL SUBMISSION                     */}
            {/* ============================================================== */}
            {/* ============================================================== */}
            {/* STEP 5: FINAL REVIEW & OFFICIAL SUBMISSION                     */}
            {/* ============================================================== */}
            {currentStep === 5 && (
              <div className="space-y-7 animate-fade-in text-sm">
                {/* Step Header */}
                <div className="border-b border-white/10 pb-5 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    <ShieldCheck className="w-4 h-4" />
                    <span>گام پایانی و بازبینی جامع پرونده</span>
                  </div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                    بازبینی نهایی مشخصات رویداد و ارسال رسمی به گیشه
                  </h2>
                  <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
                    لطفاً خلاصه اطلاعات هویتی، زمان‌بندی اجراها، نرخ بلیت و مدارک بارگذاری‌شده را بررسی فرمایید. پس از تایید، پرونده جهت کارشناسی و صدور نقشه صندلی ارسال می‌گردد.
                  </p>
                </div>

                {/* Event Hero Card */}
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white/[0.06] via-[#101426] to-[#0A0C16] border border-white/10 shadow-2xl space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {formData.posterUrl ? (
                      <div className="w-32 h-44 sm:w-36 sm:h-48 rounded-2xl overflow-hidden border border-white/20 shrink-0 shadow-2xl bg-black/60 group relative">
                        <img 
                          src={formData.posterUrl} 
                          alt="پوستر رویداد" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ) : (
                      <div className="w-32 h-44 sm:w-36 sm:h-48 rounded-2xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-zinc-500 shrink-0 gap-2">
                        <Award className="w-8 h-8 opacity-40" />
                        <span className="text-xs font-bold">بدون پوستر</span>
                      </div>
                    )}

                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#FF3366]/20 text-[#FF3366] border border-[#FF3366]/30">
                          <Sparkles className="w-3 h-3" />
                          <span>{formData.categoryLabel || 'رویداد هنری'}</span>
                        </span>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 text-zinc-300 border border-white/10">
                          شهر {formData.city || 'تهران'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-display font-black text-xl sm:text-2xl text-white leading-snug">
                          {formData.eventTitle || 'عنوان ثبت‌نشده رویداد'}
                        </h3>
                        {formData.eventSubtitle && (
                          <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                            {formData.eventSubtitle}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs text-zinc-300">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-[#FF3366] shrink-0" />
                          <span className="text-zinc-400">محل اجرا:</span>
                          <strong className="text-white font-bold">{formData.proposedVenue || 'تعیین‌نشده'}</strong>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-zinc-400">کف قیمت بلیت:</span>
                          <strong className="text-emerald-400 font-bold">{toPersianDigits(formData.estimatedPriceFrom || 0)} هزار تومان</strong>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-zinc-400">تاریخ آغاز:</span>
                          <strong className="text-white font-bold">{toPersianDigits(formData.proposedStartDate || '')}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Structured Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    {/* Column 1: Financial & Schedule */}
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black text-amber-400 border-b border-white/5 pb-2">
                        <Clock className="w-4 h-4" />
                        <span>زمان‌بندی و ظرفیت فروش گیشه</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">دوره پیشنهادی اجرا:</span>
                          <span className="font-bold text-white">
                            از {toPersianDigits(formData.proposedStartDate || '')} تا {toPersianDigits(formData.proposedEndDate || 'پایان دوره')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">ظرفیت تخمینی هر سانس:</span>
                          <span className="font-bold text-white">
                            {toPersianDigits(formData.estimatedCapacity || 400)} تماشاگر
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">کف نرخ بلیت صندلی‌ها:</span>
                          <span className="font-black text-emerald-400 text-sm">
                            {toPersianDigits(formData.estimatedPriceFrom || 180)} هزار تومان
                          </span>
                        </div>

                        <div className="pt-2 border-t border-white/5">
                          <span className="text-zinc-400 block mb-1.5">سانس‌ها و ساعت‌های پیشنهادی:</span>
                          {formData.proposedTimeSlots && formData.proposedTimeSlots.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {formData.proposedTimeSlots.map((slot, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-bold text-xs border border-white/10 flex items-center gap-1"
                                >
                                  <Clock className="w-3 h-3 text-[#FF3366]" />
                                  <span>ساعت {toPersianDigits(slot)}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-zinc-500 text-xs">سانسی ثبت نشده است (پیش‌فرض ۱۹:۳۰)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Producer & Contact */}
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black text-blue-400 border-b border-white/5 pb-2">
                        <User className="w-4 h-4" />
                        <span>اطلاعات صاحب اثر و هماهنگی</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">نام متقاضی رسمی:</span>
                          <span className="font-bold text-white">
                            {formData.producerName || 'تعیین نشده'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">سمت در رویداد:</span>
                          <span className="font-bold text-white">
                            {formData.producerRole || 'تهیه‌کننده'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">شرکت یا گروه هنری:</span>
                          <span className="font-bold text-white">
                            {formData.companyOrGroup || 'شخصی / مستقل'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">شماره همراه تماس:</span>
                          <span className="font-bold text-white" dir="ltr">
                            {formData.phoneNumber || 'ثبت نشده'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">کدملی / شناسه متقاضی:</span>
                          <span className="font-bold text-white" dir="ltr">
                            {formData.nationalCode || representativeNationalCode || 'ثبت شده'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cast & Crew Summary (if available) */}
                  {formData.castAndCrewSummary && (
                    <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-1 text-xs">
                      <span className="font-bold text-zinc-400 block">عوامل اجرایی و هنرمندان شاخص:</span>
                      <p className="text-white font-medium leading-relaxed">
                        {formData.castAndCrewSummary}
                      </p>
                    </div>
                  )}

                  {/* Event Synopsis (if available) */}
                  {formData.description && (
                    <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-1 text-xs">
                      <span className="font-bold text-zinc-400 block">معرفی و خلاصه اثر:</span>
                      <p className="text-zinc-200 leading-relaxed">
                        {formData.description}
                      </p>
                    </div>
                  )}

                  {/* Documents & Official Permits Summary */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-emerald-400" />
                        <span>مدارک و تاییدیه‌های رسمی ضمیمه‌شده به پرونده:</span>
                      </span>
                      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        {toPersianDigits((formData.documents || []).length)} مدرک معتبر
                      </span>
                    </div>

                    {(formData.documents && formData.documents.length > 0) ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {formData.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3.5 rounded-2xl bg-black/50 border border-white/10 hover:border-white/20 transition-all flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0 flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30 mt-0.5">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 space-y-0.5">
                                <h5 className="font-bold text-white text-xs leading-snug">
                                  {doc.typeLabel}
                                </h5>
                                <p className="text-[11px] text-zinc-400 truncate">
                                  {doc.fileName}
                                </p>
                                {doc.licenseNumber && (
                                  <span className="inline-block text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded mt-1">
                                    کد ثبت: {doc.licenseNumber}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-left shrink-0 space-y-1">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>تایید شد</span>
                              </span>
                              <span className="block text-[10px] text-zinc-500 font-medium">
                                {doc.fileSize}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
                        <p className="leading-relaxed">
                          هیچ مدرکی در این مرحله بارگذاری نشده است. مجوزهای مربوطه (ارشاد، اماکن و قرارداد تالار) پس از ثبت اولیه نیز قابل ارسال و استعلام خواهند بود.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Legal Guarantee & Final Notice */}
                <div className="p-5 rounded-2xl bg-gradient-to-l from-[#FF3366]/10 via-[#121626] to-transparent border border-white/10 flex items-start gap-3.5 text-xs text-zinc-300 leading-relaxed shadow-md">
                  <div className="w-8 h-8 rounded-xl bg-[#FF3366]/20 text-[#FF3366] flex items-center justify-center shrink-0 border border-[#FF3366]/30 mt-0.5">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <strong className="text-white font-bold block text-sm">
                      تعهد حقوقی و ارسال نهایی به دبیرخانه گیشه آرتیکت:
                    </strong>
                    <p>
                      با کلیک بر روی دکمه زیر، پرونده شما با کد رهگیری اختصاصی به پایگاه داده سامانه منتقل شده و نسخه پیامکی آن به شماره همراه شما ارسال می‌شود. کارشناسان حقوقی و پشتیبانی گیشه ظرف حداکثر ۴۸ ساعت کاری پرونده را بررسی و هماهنگی سالن را آغاز می‌نمایند.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step Action Buttons (Footer of the container) */}
            {currentStep > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer order-2 sm:order-1"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>{currentStep === 5 ? 'بازگشت و ویرایش اطلاعات (مرحله قبل)' : 'مرحله قبل'}</span>
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white shadow-lg shadow-[#FF3366]/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer order-1 sm:order-2"
                  >
                    <span>گام بعدی</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitProposal}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-black bg-gradient-to-l from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 order-1 sm:order-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}
                    <span>{isSubmitting ? 'در حال ثبت رسمی پرونده...' : 'تایید نهایی و ثبت رسمی در گیشه آرتیکت'}</span>
                  </button>
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* TRACKER MODAL (Inquiry by Tracking Code REQ-XXXXX) */}
      {showTrackerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#0F1221] text-white p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FF3366]/20 text-[#FF3366] flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <h3 className="font-display font-black text-base text-white">استعلام وضعیت درخواست رویداد</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowTrackerModal(false);
                  setTrackedItem(null);
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTrackSearch} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="کد رهگیری (مانند REQ-84920) یا شماره موبایل..."
                  dir="ltr"
                  className="w-full p-3 rounded-2xl border border-white/10 bg-black/50 text-xs font-mono font-bold text-center tracking-wider text-white focus:outline-none focus:border-[#FF3366]"
                />
              </div>

              <button
                type="submit"
                disabled={isSearchingTrack || !trackQuery.trim()}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSearchingTrack ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'استعلام پرونده'}
              </button>
            </form>

            {trackedItem === 'not_found' && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>پرونده‌ای با این کد رهگیری یا شماره همراه یافت نشد.</span>
              </div>
            )}

            {trackedItem && trackedItem !== 'not_found' && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-xs animate-fade-in">
                <div className="flex items-start justify-between border-b border-white/5 pb-2.5">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-mono">کد: {trackedItem.trackingCode}</span>
                    <h4 className="font-bold text-sm text-white mt-0.5">{trackedItem.eventTitle}</h4>
                    <p className="text-zinc-400 text-[11px] mt-0.5">{trackedItem.producerName} ({trackedItem.producerRole})</p>
                  </div>
                  <div>
                    {trackedItem.status === 'pending' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">در انتظار بررسی</span>}
                    {trackedItem.status === 'under_review' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">در حال بررسی مدارک</span>}
                    {trackedItem.status === 'approved' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">تایید شده</span>}
                    {trackedItem.status === 'published' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">منتشر شده در گیشه</span>}
                    {trackedItem.status === 'rejected' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">رد شده</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
                  <div>
                    <span className="text-zinc-500 block">محل اجرا:</span>
                    <span className="font-bold text-white">{trackedItem.proposedVenue}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">تاریخ شروع:</span>
                    <span className="font-bold text-white">{trackedItem.proposedStartDate}</span>
                  </div>
                </div>

                {trackedItem.adminNotes && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] leading-relaxed">
                    <strong className="block mb-0.5 text-white">پیام کارشناس گیشه:</strong>
                    {trackedItem.adminNotes}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
