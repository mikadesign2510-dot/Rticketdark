import React, { useState } from 'react';
import { 
  Settings, 
  CreditCard, 
  Smartphone, 
  Check, 
  RotateCcw, 
  AlertTriangle,
  Scale,
  FileCheck2,
  Plus,
  Trash2,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { SiteSettings, defaultSettings } from '../../lib/db';
import { LegalHostingRuleItem } from '../../types';

interface SettingsTabProps {
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formState, setFormState] = useState<SiteSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    await onSaveSettings(formState);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetToDefaults = async () => {
    if (confirm('آیا از بازگردانی تمامی تنظیمات سامانه به حالت پیش‌فرض کارخانه اطمینان دارید؟')) {
      await onSaveSettings(defaultSettings);
      setFormState(defaultSettings);
      alert('تنظیمات با موفقیت به حالت اولیه بازگردانی شد.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl" dir="rtl">
      {/* Save Button Header */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-between gap-4 sticky top-16 z-20 shadow-xs">
        <div>
          <h3 className="font-display font-black text-lg text-slate-900">تنظیمات اصلی سامانه و درگاه‌ها</h3>
          <p className="text-xs text-slate-500 font-medium">مدیریت راه‌های ارتباطی، درگاه پرداخت شتاب، پیامک و پیکربندی امنیتی</p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="py-2.5 px-6 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs font-black shadow-md shadow-[#FF3366]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
        >
          {isSaved ? <Check className="w-4 h-4 text-white" /> : <Settings className="w-4 h-4 text-white" />}
          <span>{isSaved ? 'تنظیمات ذخیره شد!' : 'ذخیره تنظیمات'}</span>
        </button>
      </div>

      {/* 1. Payment Gateway */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <h4 className="font-display font-bold text-sm text-slate-900">پیکربندی درگاه پرداخت و تسویه الکترونیک</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">درگاه پرداخت پیش‌فرض</label>
            <select
              value={formState.paymentGateway || 'shaparak'}
              onChange={(e) => setFormState({ ...formState, paymentGateway: e.target.value as any })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
            >
              <option value="shaparak">شاپرک (شاپرک متمرکز بانکی)</option>
              <option value="saman">بانک سامان (سامان کیش)</option>
              <option value="zarinpal">زرین‌پال (ZarinPal IPG)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">حالت اتصال درگاه</label>
            <select
              value={formState.gatewayMode || 'live'}
              onChange={(e) => setFormState({ ...formState, gatewayMode: e.target.value as any })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
            >
              <option value="live">محیط واقعی و زنده (Live Production)</option>
              <option value="test">محیط سندباکس و شبیه‌ساز تست (Sandbox)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">واحد پول نمایش قیمت‌ها</label>
            <input
              type="text"
              value={formState.currency || 'تومان'}
              onChange={(e) => setFormState({ ...formState, currency: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Contact & Support */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Smartphone className="w-4 h-4 text-[#FF3366]" />
          <h4 className="font-display font-bold text-sm text-slate-900">پشتیبانی و راه‌های ارتباطی مشتریان</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">شماره تلفن مرکز تماس و پشتیبانی</label>
            <input
              type="text"
              value={formState.supportPhone || ''}
              onChange={(e) => setFormState({ ...formState, supportPhone: e.target.value })}
              placeholder="۰۲۱-۸۸۲۹۰۰۰۰"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none"
              dir="ltr"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">ایمیل رسمی پشتیبانی</label>
            <input
              type="email"
              value={formState.supportEmail || ''}
              onChange={(e) => setFormState({ ...formState, supportEmail: e.target.value })}
              placeholder="support@articket.ir"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none"
              dir="ltr"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.smsNotificationEnabled !== false}
                onChange={(e) => setFormState({ ...formState, smsNotificationEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-[#FF3366]"
              />
              <span className="font-bold text-slate-800">
                ارسال خودکار پیامک حاوی لینک بلیت و کد پیگیری به خریدار پس از تراکنش موفق
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Event Hosting Legal Rules & Policy Settings (ویژه صاحبان آثار و ایجاد رویداد) */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-slate-900">
                مدیریت منشور حقوقی، ضوابط میزبانی و الزامات صدور مجوز
              </h4>
              <p className="text-[11px] text-slate-500">
                شخصی‌سازی متون حقوقی، سهم کارمزد و قوانین نمایش داده‌شده در صفحه «ایجاد رویداد»
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            حقوقی و انتظامی
          </span>
        </div>

        {/* Title & Slogan */}
        <div className="grid grid-cols-1 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">عنوان اصلی منشور حقوقی میزبانی</label>
            <input
              type="text"
              value={formState.hostingRulesTitle || ''}
              onChange={(e) => setFormState({ ...formState, hostingRulesTitle: e.target.value })}
              placeholder="منشور حقوقی، ضوابط و تعهدات میزبانی رویداد در آرتیکت"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">توضیحات و زیرعنوان راهنما</label>
            <textarea
              rows={2}
              value={formState.hostingRulesSubtitle || ''}
              onChange={(e) => setFormState({ ...formState, hostingRulesSubtitle: e.target.value })}
              placeholder="مجموعه ضوابط رسمی، الزامات وزارت فرهنگ و ارشاد اسلامی، نظارت اماکن عمومی فراجا..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Commission Rate Settings */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">درصد سهم پیش‌فرض صاحب اثر از فروش گیشه:</span>
            </div>
            <span className="font-mono font-black text-base text-emerald-600">
              {formState.hostingCommissionRate || 85}٪
            </span>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={formState.hostingCommissionRate || 85}
              onChange={(e) => setFormState({ ...formState, hostingCommissionRate: Number(e.target.value) })}
              className="flex-1 accent-[#FF3366] cursor-pointer"
            />
            <div className="w-20 text-center font-mono font-bold text-xs p-1.5 rounded-lg bg-white border border-slate-200">
              {100 - (formState.hostingCommissionRate || 85)}٪ کارمزد
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            صاحب اثر {formState.hostingCommissionRate || 85}٪ از خالص گیشه را دریافت کرده و {100 - (formState.hostingCommissionRate || 85)}٪ به عنوان کارمزد فنی و درگاه آرتیکت کسر می‌شود.
          </p>
        </div>

        {/* Mandatory License Requirements */}
        <div className="space-y-2.5 text-xs">
          <span className="font-bold text-slate-800 block">مدارک و الزامات اجباری جهت فعال‌سازی گیشه:</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.hostingRequiresErshadLicense !== false}
                onChange={(e) => setFormState({ ...formState, hostingRequiresErshadLicense: e.target.checked })}
                className="w-4 h-4 rounded text-[#FF3366]"
              />
              <span className="font-bold text-slate-800 text-[11px]">پروانه وزارت ارشاد</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.hostingRequiresAmakenPermit !== false}
                onChange={(e) => setFormState({ ...formState, hostingRequiresAmakenPermit: e.target.checked })}
                className="w-4 h-4 rounded text-[#FF3366]"
              />
              <span className="font-bold text-slate-800 text-[11px]">تاییدیه پلیس اماکن</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.hostingRequiresVenueContract !== false}
                onChange={(e) => setFormState({ ...formState, hostingRequiresVenueContract: e.target.checked })}
                className="w-4 h-4 rounded text-[#FF3366]"
              />
              <span className="font-bold text-slate-800 text-[11px]">قرارداد اجاره سالن</span>
            </label>
          </div>
        </div>

        {/* Legal Clauses List Editor */}
        <div className="space-y-3 text-xs pt-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">
              مواد و بندهای حقوقی و قانونی منشور میزبانی ({(formState.hostingRulesItems || defaultSettings.hostingRulesItems || []).length} بند):
            </span>

            <button
              type="button"
              onClick={() => {
                const current = [...(formState.hostingRulesItems || defaultSettings.hostingRulesItems || [])];
                current.push({
                  id: 'rule-' + Date.now(),
                  title: `ماده ${current.length + 1}: عنوان بند جدید`,
                  content: 'متن تعهدات و الزامات مربوط به این بند قانونی...',
                  category: 'legal',
                  isRequiredAck: true,
                });
                setFormState({ ...formState, hostingRulesItems: current });
              }}
              className="py-1 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن ماده قانونی جدید</span>
            </button>
          </div>

          <div className="space-y-3">
            {(formState.hostingRulesItems || defaultSettings.hostingRulesItems || []).map((rule, idx) => (
              <div
                key={rule.id || idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5 relative group"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={rule.title}
                    onChange={(e) => {
                      const updated = [...(formState.hostingRulesItems || defaultSettings.hostingRulesItems || [])];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      setFormState({ ...formState, hostingRulesItems: updated });
                    }}
                    className="flex-1 p-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900 text-xs focus:outline-none focus:border-[#FF3366]"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const updated = (formState.hostingRulesItems || defaultSettings.hostingRulesItems || []).filter((_, i) => i !== idx);
                      setFormState({ ...formState, hostingRulesItems: updated });
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="حذف این ماده"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={rule.content}
                  onChange={(e) => {
                    const updated = [...(formState.hostingRulesItems || defaultSettings.hostingRulesItems || [])];
                    updated[idx] = { ...updated[idx], content: e.target.value };
                    setFormState({ ...formState, hostingRulesItems: updated });
                  }}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs leading-relaxed focus:outline-none focus:border-[#FF3366]"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.isRequiredAck}
                      onChange={(e) => {
                        const updated = [...(formState.hostingRulesItems || defaultSettings.hostingRulesItems || [])];
                        updated[idx] = { ...updated[idx], isRequiredAck: e.target.checked };
                        setFormState({ ...formState, hostingRulesItems: updated });
                      }}
                      className="w-3.5 h-3.5 rounded text-[#FF3366]"
                    />
                    <span>تایید این بند توسط صاحب اثر الزامی باشد</span>
                  </label>

                  <span className="font-mono text-[10px] text-slate-400">بند شماره {idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Factory Reset Zone */}
      <div className="p-6 rounded-2xl border border-red-200 bg-red-50/50 space-y-3">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h4 className="font-display font-bold text-sm">ناحیه حساس: بازگردانی به تنظیمات کارخانه</h4>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          در صورت بروز هرگونه مشکل در ساختار دیتابیس یا رنگ‌بندی، می‌توانید تمام پیکربندی سایت را به حالت استاندارد روز اول بازگردانید.
        </p>
        <button
          type="button"
          onClick={handleResetToDefaults}
          className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>بازگردانی پیش‌فرض‌ها</span>
        </button>
      </div>
    </div>
  );
};
