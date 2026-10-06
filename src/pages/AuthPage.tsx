import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Lock, 
  Phone, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  CreditCard,
  Building,
  BarChart3,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchSettings, SiteSettings, defaultSettings } from '../lib/db';
import { toPersianDigits } from '../utils/persianNumbers';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/profile';

  const { currentUser, login, register, isLoading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Load site appearance settings
  useEffect(() => {
    fetchSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  // If already logged in, redirect
  useEffect(() => {
    if (currentUser) {
      navigate(redirectPath, { replace: true });
    }
  }, [currentUser, navigate, redirectPath]);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State (Note: userRole removed per user request)
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Feedback State
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Requirements Validation
  const passwordValidation = useMemo(() => {
    const minLength = password.length >= 6;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const matches = password.length > 0 && password === confirmPassword;

    let score = 0;
    if (minLength) score++;
    if (hasLower) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;
    if (hasSymbol) score++;

    const isStrong = minLength && hasLower && hasUpper && hasNumber && hasSymbol;
    return {
      minLength,
      hasLower,
      hasUpper,
      hasNumber,
      hasSymbol,
      matches,
      score,
      isStrong,
    };
  }, [password, confirmPassword]);

  // Fast Demo Login
  const handleQuickDemoProducerLogin = async () => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await login('۰۹۱۲۳۴۵۶۷۸۹'); // Default test user
      if (res.success) {
        setFormSuccess('ورود موفقیت‌آمیز تهیه‌کننده! در حال انتقال...');
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 800);
      } else {
        // If not found, register test account
        const reg = await register({
          fullName: 'دکتر علی رفیعی (تهیه‌کننده)',
          phoneNumber: '۰۹۱۲۳۴۵۶۷۸۹',
          nationalCode: '۰۰۱۲۳۴۵۶۷۸',
          email: 'producer.rafiee@articket.ir',
          password: 'Password123!',
        });
        if (reg.success) {
          setFormSuccess('ورود خودکار با حساب کاربری آزمایشی...');
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 800);
        }
      }
    } catch (e) {
      setFormError('خطا در ورود آزمایشی.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!loginIdentifier.trim()) {
      setFormError('لطفاً شماره همراه، کدملی یا نام کاربری خود را وارد فرمایید.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(loginIdentifier.trim(), loginPassword);
      if (res.success) {
        setFormSuccess(`خوش آمدید ${res.user?.fullName}! در حال هدایت...`);
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 700);
      } else {
        setFormError(res.message || 'مشخصات وارد شده در سامانه یافت نشد.');
      }
    } catch (err) {
      setFormError('خطا در پردازش ورود. لطفاً دوباره تلاش فرمایید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!fullName.trim()) {
      setFormError('نام و نام خانوادگی الزامی است.');
      return;
    }

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setFormError('لطفاً شماره تلفن همراه معتبر وارد نمایید.');
      return;
    }

    const cleanNational = nationalCode.replace(/[^0-9]/g, '');
    if (!cleanNational || cleanNational.length < 8) {
      setFormError('کدملی باید حداقل ۸ تا ۱۰ رقم باشد.');
      return;
    }

    // Password validation requirements
    if (!passwordValidation.minLength) {
      setFormError('کلمه عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    if (!passwordValidation.hasNumber) {
      setFormError('کلمه عبور باید حداقل شامل یک عدد (0-9) باشد.');
      return;
    }
    if (!passwordValidation.hasLower) {
      setFormError('کلمه عبور باید حداقل شامل یک حرف کوچک انگلیسی (a-z) باشد.');
      return;
    }
    if (!passwordValidation.hasUpper) {
      setFormError('کلمه عبور باید حداقل شامل یک حرف بزرگ انگلیسی (A-Z) باشد.');
      return;
    }
    if (!passwordValidation.hasSymbol) {
      setFormError('کلمه عبور باید حداقل شامل یک نماد یا نشانه خاص (@, #, $, ...) باشد.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('کلمه عبور با تکرار آن همخوانی ندارد.');
      return;
    }

    if (!termsAccepted) {
      setFormError('پذیرش قوانین و شرایط سامانه الزامی است.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        nationalCode: nationalCode.trim(),
        email: email.trim() || undefined,
        password: password,
      });

      if (res.success) {
        setFormSuccess('ثبت‌نام شما با موفقیت انجام شد! در حال انتقال...');
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 900);
      } else {
        setFormError(res.message || 'خطا در انجام ثبت‌نام.');
      }
    } catch (err) {
      setFormError('خطا در ذخیره‌سازی اطلاعات.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSideBanner = settings.authShowSideBanner ?? false;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-[#FF3366] selection:text-white flex flex-col justify-between" dir="rtl">
      
      {/* Minimalistic Header */}
      <header className="w-full border-b border-white/[0.06] bg-[#0A0C14]/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between z-20">
        <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF3366] via-[#FF5533] to-[#F59E0B] p-[1.5px] shadow-sm shadow-[#FF3366]/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0D0F18] rounded-[10px] flex items-center justify-center font-display font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#FF3366] to-[#F59E0B]">
              آ
            </div>
          </div>
          <div>
            <span className="font-display font-black text-base text-white tracking-tight">
              {settings.siteTitle || 'آرتیکت'}
            </span>
            <span className="text-[10px] text-zinc-400 block font-medium">ورود و عضویت</span>
          </div>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>بازگشت به سایت</span>
        </Link>
      </header>

      {/* Main Minimalist Auth Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-[#FF3366]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 -left-32 w-80 h-80 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className={`w-full ${showSideBanner ? 'max-w-4xl grid grid-cols-1 lg:grid-cols-12' : 'max-w-md'} rounded-3xl border border-white/[0.08] bg-[#0A0D18]/90 backdrop-blur-xl shadow-2xl overflow-hidden relative z-10 transition-all`}>
          
          {/* Optional Side Banner (Controlled from Admin Appearance Tab) */}
          {showSideBanner && (
            <div className="lg:col-span-5 p-8 bg-gradient-to-br from-[#12162B] via-[#0E1122] to-[#0A0C16] border-b lg:border-b-0 lg:border-l border-white/[0.08] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/25">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>سامانه رسمی آرتیکت</span>
                </div>

                <div className="space-y-2">
                  <h1 className="font-display font-black text-2xl text-white leading-tight">
                    {settings.authSideBannerTitle || 'ورود به سامانه آرتیکت'}
                  </h1>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {settings.authSideBannerSubtitle || 'جهت ارسال درخواست میزبانی رویداد و دسترسی به بلیت‌های خریداری‌شده وارد حساب کاربری خود شوید.'}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5">
                    <Building className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">میزبانی و فروش بلیت</h4>
                      <p className="text-[11px] text-zinc-400">ثبت اثر و تخصیص صندلی‌های سالن</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5">
                    <BarChart3 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">گزارش زنده گیشه</h4>
                      <p className="text-[11px] text-zinc-400">آمار لحظه‌ای فروش و تسویه‌حساب</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo Login inside Side Banner */}
              <div className="pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleQuickDemoProducerLogin}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 font-bold text-xs border border-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-[#FF3366]" />
                  <span>ورود آزمایشی با اکانت تست</span>
                </button>
              </div>
            </div>
          )}

          {/* Interactive Minimalist Form Container */}
          <div className={`${showSideBanner ? 'lg:col-span-7' : 'w-full'} p-6 sm:p-8 flex flex-col justify-center space-y-6`}>
            
            {/* Header Titles */}
            <div className="space-y-1 text-center sm:text-right">
              <h2 className="font-display font-black text-xl sm:text-2xl text-white">
                {mode === 'login' ? (settings.authPageTitle || 'ورود به حساب کاربری') : (settings.authRegisterTabTitle || 'عضویت و ثبت‌نام سریع')}
              </h2>
              <p className="text-xs text-zinc-400">
                {settings.authPageSubtitle || 'سامانه یکپارچه رزرواسیون و میزبانی رویدادهای هنری'}
              </p>
            </div>

            {/* Minimalist Switch Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setFormError(null);
                  setFormSuccess(null);
                }}
                className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white shadow-md shadow-[#FF3366]/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{settings.authLoginTabTitle || 'ورود به حساب'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setFormError(null);
                  setFormSuccess(null);
                }}
                className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white shadow-md shadow-[#FF3366]/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{settings.authRegisterTabTitle || 'ثبت‌نام جدید'}</span>
              </button>
            </div>

            {/* Notice if redirected from create-event */}
            {redirectPath.includes('create-event') && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  {settings.authWelcomeNotice || 'برای ایجاد و میزبانی رویداد، داشتن حساب کاربری تاییدشده الزامی است. پس از ورود یا ثبت‌نام، مستقیماً به فرم هدایت می‌شوید.'}
                </p>
              </div>
            )}

            {/* Error & Success Feedback Alerts */}
            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* ============================================================== */}
            {/* LOGIN FORM                                                     */}
            {/* ============================================================== */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">
                    شماره همراه یا نام کاربری / کدملی
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹ یا کدملی"
                      dir="ltr"
                      className="w-full py-2.5 pr-3.5 pl-10 rounded-xl border border-white/10 bg-white/[0.04] text-white font-mono text-xs focus:border-[#FF3366] focus:bg-white/[0.07] focus:outline-none transition-all placeholder:text-zinc-600"
                    />
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300">کلمه عبور</label>
                    <span className="text-[11px] text-zinc-500">اختیاری در ورود سریع</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      dir="ltr"
                      className="w-full py-2.5 pr-3.5 pl-10 rounded-xl border border-white/10 bg-white/[0.04] text-white font-mono text-xs focus:border-[#FF3366] focus:bg-white/[0.07] focus:outline-none transition-all placeholder:text-zinc-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="p-1 text-zinc-500 hover:text-white absolute left-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || authLoading}
                  className="w-full py-3 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white shadow-md shadow-[#FF3366]/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'در حال ورود...' : (settings.authSubmitLoginText || 'ورود به حساب کاربری')}</span>
                </button>

                {/* Quick test account button if side banner is hidden */}
                {!showSideBanner && (
                  <button
                    type="button"
                    onClick={handleQuickDemoProducerLogin}
                    disabled={isSubmitting}
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-[#FF3366]" />
                    <span>ورود سریع آزمایشی (اکانت تست)</span>
                  </button>
                )}

                <div className="text-center pt-2">
                  <p className="text-xs text-zinc-400">
                    حساب کاربری ندارید؟{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-[#FF3366] font-bold hover:underline cursor-pointer"
                    >
                      ثبت‌نام سریع
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* ============================================================== */
              /* REGISTER FORM (Minimal, No Role field, 2x Password + Checklist) */
              /* ============================================================== */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fade-in text-xs">
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">نام و نام خانوادگی *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: علی رضایی"
                    className="w-full p-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white font-bold text-xs focus:border-[#FF3366] focus:outline-none"
                  />
                </div>

                {/* Mobile & National Code (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-300">شماره تلفن همراه *</label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      dir="ltr"
                      className="w-full p-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white font-mono text-xs focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-300">کد ملی ۱۰ رقمی *</label>
                    <input
                      type="text"
                      value={nationalCode}
                      onChange={(e) => setNationalCode(e.target.value)}
                      placeholder="۰۰۱۲۳۴۵۶۷۸"
                      dir="ltr"
                      className="w-full p-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white font-mono text-xs focus:border-[#FF3366] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email (Optional) */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">پست الکترونیک (ایمیل - اختیاری)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    dir="ltr"
                    className="w-full p-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white font-mono text-xs focus:border-[#FF3366] focus:outline-none"
                  />
                </div>

                {/* Password & Confirm Password (2x Inputs) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 1. Password */}
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-300">کلمه عبور *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="حداقل ۶ کاراکتر"
                        dir="ltr"
                        className={`w-full py-2.5 pr-3 pl-9 rounded-xl border ${
                          password.length > 0 && passwordValidation.isStrong
                            ? 'border-emerald-500/50 bg-emerald-500/5'
                            : 'border-white/10 bg-white/[0.04]'
                        } text-white font-mono text-xs focus:border-[#FF3366] focus:outline-none`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-zinc-500 hover:text-white absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* 2. Confirm Password */}
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-300">تکرار کلمه عبور *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="تکرار دقیق کلمه عبور"
                        dir="ltr"
                        className={`w-full py-2.5 pr-3 pl-9 rounded-xl border ${
                          confirmPassword.length > 0
                            ? passwordValidation.matches
                              ? 'border-emerald-500/50 bg-emerald-500/5'
                              : 'border-rose-500/50 bg-rose-500/5'
                            : 'border-white/10 bg-white/[0.04]'
                        } text-white font-mono text-xs focus:border-[#FF3366] focus:outline-none`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="p-1 text-zinc-500 hover:text-white absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Password Strength & Checklist Guide */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.07] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">الزامات امنیتی کلمه عبور:</span>
                    <span className={`font-bold ${
                      passwordValidation.score >= 5 ? 'text-emerald-400' : passwordValidation.score >= 3 ? 'text-amber-400' : 'text-zinc-500'
                    }`}>
                      {passwordValidation.score >= 5 ? 'امنیت بسیار عالی' : passwordValidation.score >= 3 ? 'امنیت متوسط' : 'در حال تکمیل...'}
                    </span>
                  </div>

                  {/* Strength Bar */}
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordValidation.score === 5
                          ? 'w-full bg-emerald-400'
                          : passwordValidation.score >= 3
                          ? 'w-3/5 bg-amber-400'
                          : passwordValidation.score >= 1
                          ? 'w-1/4 bg-rose-500'
                          : 'w-0'
                      }`}
                    />
                  </div>

                  {/* Checklist Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1 pt-1 text-[10px]">
                    <div className={`flex items-center gap-1.5 ${passwordValidation.minLength ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                      {passwordValidation.minLength ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 inline-block" />}
                      <span>حداقل ۶ کاراکتر</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${passwordValidation.hasNumber ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                      {passwordValidation.hasNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 inline-block" />}
                      <span>شامل عدد (0-9)</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${passwordValidation.hasLower ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                      {passwordValidation.hasLower ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 inline-block" />}
                      <span>حرف کوچک (a-z)</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${passwordValidation.hasUpper ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                      {passwordValidation.hasUpper ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 inline-block" />}
                      <span>حرف بزرگ (A-Z)</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${passwordValidation.hasSymbol ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                      {passwordValidation.hasSymbol ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 inline-block" />}
                      <span>نماد خاص (@, #, ...)</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${passwordValidation.matches ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                      {passwordValidation.matches ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 inline-block" />}
                      <span>تطابق دو رمز</span>
                    </div>
                  </div>
                </div>

                {/* Terms agreement checkbox */}
                <label className="flex items-start gap-2 pt-1 text-[11px] text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#FF3366] focus:ring-[#FF3366] border-white/20 bg-white/5 mt-0.5"
                  />
                  <span>
                    {settings.authTermsText || 'تمامی قوانین و مقررات میزبانی رویداد و حریم خصوصی آرتیکت را می‌پذیرم.'}
                  </span>
                </label>

                {/* Button ONLY saying: "تکمیل ثبت‌نام" per user prompt */}
                <button
                  type="submit"
                  disabled={isSubmitting || authLoading}
                  className="w-full py-3 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-l from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>{settings.authSubmitRegisterText || 'تکمیل ثبت‌نام'}</span>
                </button>

                <div className="text-center pt-1">
                  <p className="text-xs text-zinc-400">
                    قبلاً ثبت‌نام کرده‌اید؟{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-[#FF3366] font-bold hover:underline cursor-pointer"
                    >
                      ورود به حساب
                    </button>
                  </p>
                </div>
              </form>
            )}

          </div>

        </div>
      </main>

      {/* Minimalistic Footer */}
      <footer className="w-full border-t border-white/[0.06] bg-[#0A0C14] px-4 py-3 text-center text-[11px] text-zinc-500">
        تمامی حقوق برای سامانه رویدادهای هنری {settings.siteTitle || 'آرتیکت'} محفوظ است © {toPersianDigits(1405)}
      </footer>

    </div>
  );
}
