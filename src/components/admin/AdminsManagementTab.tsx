import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  UserCheck, 
  Crown, 
  Building2, 
  QrCode, 
  DollarSign, 
  Edit2, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  CreditCard, 
  Percent, 
  Calendar,
  Layers,
  FileCheck
} from 'lucide-react';
import { AdminOrganizer, AdminRole, ArtEvent } from '../../types';
import { toPersianDigits, formatPrice } from '../../utils/persianNumbers';

interface AdminsManagementTabProps {
  admins: AdminOrganizer[];
  events: ArtEvent[];
  onSaveAdmin: (admin: Partial<AdminOrganizer>) => Promise<void>;
  onDeleteAdmin: (id: string) => Promise<void>;
}

const ROLE_OPTIONS: { role: AdminRole; label: string; badgeColor: string; icon: React.FC<{ className?: string }> }[] = [
  { role: 'super_admin', label: 'مدیر ارشد و سوپرادمین', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200', icon: Crown },
  { role: 'event_producer', label: 'تهیه‌کننده و صاحب اثر', badgeColor: 'bg-rose-100 text-[#FF3366] border-rose-200', icon: Layers },
  { role: 'box_office_admin', label: 'مدیر ارشد گیشه و فروش', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200', icon: ShieldCheck },
  { role: 'hall_manager', label: 'مدیر سالن و اجرا', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200', icon: Building2 },
  { role: 'gate_operator', label: 'اپراتور گیت و اسکنر', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: QrCode },
];

export const AdminsManagementTab: React.FC<AdminsManagementTabProps> = ({
  admins,
  events,
  onSaveAdmin,
  onDeleteAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [editingAdmin, setEditingAdmin] = useState<Partial<AdminOrganizer> | null>(null);
  const [settlementAdmin, setSettlementAdmin] = useState<AdminOrganizer | null>(null);
  const [settlementAmountInput, setSettlementAmountInput] = useState<number>(0);
  const [settlementRefCode, setSettlementRefCode] = useState<string>('');

  // Filter admins
  const filteredAdmins = admins.filter((adm) => {
    if (selectedRoleFilter !== 'all' && adm.role !== selectedRoleFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = adm.fullName.toLowerCase().includes(q);
      const matchEmail = adm.email.toLowerCase().includes(q);
      const matchPhone = adm.phoneNumber.includes(q);
      const matchEvents = (adm.assignedEventTitles || []).some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchPhone && !matchEvents) return false;
    }
    return true;
  });

  // Financial KPIs
  const totalProducers = admins.filter(a => a.role === 'event_producer').length;
  const totalProducerRevenue = admins.reduce((sum, a) => sum + (a.totalRevenueGenerated || 0), 0);
  const totalUnsettled = admins.reduce((sum, a) => sum + (a.unsettledAmount || 0), 0);
  const totalSettled = admins.reduce((sum, a) => sum + (a.settledAmount || 0), 0);

  const handleCreateNewAdmin = () => {
    setEditingAdmin({
      fullName: '',
      email: '',
      phoneNumber: '',
      role: 'event_producer',
      roleLabel: 'تهیه‌کننده و صاحب اثر',
      status: 'active',
      assignedEventIds: events.length > 0 ? [events[0].id] : [],
      assignedEventTitles: events.length > 0 ? [events[0].title] : [],
      commissionRate: 85,
      totalRevenueGenerated: 0,
      settledAmount: 0,
      unsettledAmount: 0,
      iban: '',
      notes: '',
    });
  };

  const handleConfirmSettlement = async () => {
    if (!settlementAdmin) return;
    if (settlementAmountInput <= 0) {
      alert('لطفاً مبلغ معتبری برای تسویه وارد فرمایید.');
      return;
    }
    const newSettled = (settlementAdmin.settledAmount || 0) + settlementAmountInput;
    const newUnsettled = Math.max(0, (settlementAdmin.unsettledAmount || 0) - settlementAmountInput);

    await onSaveAdmin({
      ...settlementAdmin,
      settledAmount: newSettled,
      unsettledAmount: newUnsettled,
      notes: `${settlementAdmin.notes || ''}\nواریز مبلغ ${formatPrice(settlementAmountInput)} تومان با کد رهگیری ${settlementRefCode || 'بانکی'}`.trim(),
    });

    setSettlementAdmin(null);
    setSettlementAmountInput(0);
    setSettlementRefCode('');
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Top Banner & Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>صاحبان اثر و تهیه‌کنندگان</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#FF3366] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-slate-900">
            {toPersianDigits(totalProducers)} <span className="text-xs font-normal text-slate-500">تهیه‌کننده</span>
          </div>
          <div className="text-[11px] text-slate-500">
            دارای قرارداد رسمی سهم گیشه
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>کل فروش رویدادهای منتسب</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-slate-900">
            {formatPrice(totalProducerRevenue)} <span className="text-xs font-normal text-slate-500">تومان</span>
          </div>
          <div className="text-[11px] text-purple-600 font-bold">
            ناخالص فروش بلیت‌های گیشه
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>مبالغ تسویه شده به مالکان</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-emerald-600">
            {formatPrice(totalSettled)} <span className="text-xs font-normal text-slate-500">تومان</span>
          </div>
          <div className="text-[11px] text-slate-500">
            واریز قطعی به شماره شبا
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>در صف تسویه و پرداخت</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-amber-600">
            {formatPrice(totalUnsettled)} <span className="text-xs font-normal text-slate-500">تومان</span>
          </div>
          <div className="text-[11px] text-amber-700 font-bold">
            آماده واریز پس از پایان سانس‌ها
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Role Filter & Add */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-64 sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو با نام، رویداد، موبایل یا شبا..."
              className="w-full py-2.5 pr-9 pl-3 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF3366]/30"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Role Filter Tabs */}
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none"
          >
            <option value="all">همه رده‌های سازمانی و صاحبان اثر</option>
            <option value="super_admin">مدیران ارشد و سوپرادمین</option>
            <option value="event_producer">تهیه‌کنندگان و صاحبان اثر</option>
            <option value="box_office_admin">مدیران گیشه و فروش</option>
            <option value="hall_manager">مدیران سالن و صحنه</option>
            <option value="gate_operator">اپراتورهای گیت و اسکنر</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleCreateNewAdmin}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs font-black shadow-md shadow-[#FF3366]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن مدیر یا صاحب اثر جدید</span>
        </button>
      </div>

      {/* Admins & Organizers Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="py-3.5 pr-4">مدیر / تهیه‌کننده</th>
                <th className="py-3.5">نقش سازمانی</th>
                <th className="py-3.5">تماس و شبا</th>
                <th className="py-3.5">رویدادهای تحت مالکیت</th>
                <th className="py-3.5">درصد سهم</th>
                <th className="py-3.5">فروش کل رویدادها</th>
                <th className="py-3.5">سهم تسویه‌نشده</th>
                <th className="py-3.5">وضعیت</th>
                <th className="py-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdmins.map((adm) => {
                const roleConfig = ROLE_OPTIONS.find(r => r.role === adm.role) || ROLE_OPTIONS[0];
                const RoleIcon = roleConfig.icon;
                return (
                  <tr key={adm.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name & Avatar */}
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          <RoleIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{adm.fullName}</span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5" dir="ltr">{adm.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${roleConfig.badgeColor}`}>
                        <RoleIcon className="w-3 h-3" />
                        <span>{adm.roleLabel}</span>
                      </span>
                    </td>

                    {/* Contact & IBAN */}
                    <td className="py-3.5">
                      <span className="font-mono text-slate-800 font-bold block" dir="ltr">{adm.phoneNumber}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5" dir="ltr">{adm.email}</span>
                      {adm.iban && (
                        <span className="text-[9px] text-slate-500 font-mono block mt-1 tracking-wider" dir="ltr">
                          {adm.iban}
                        </span>
                      )}
                    </td>

                    {/* Assigned Events */}
                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {adm.assignedEventTitles && adm.assignedEventTitles.length > 0 ? (
                          adm.assignedEventTitles.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[10px]">بدون رویداد</span>
                        )}
                      </div>
                    </td>

                    {/* Commission Rate */}
                    <td className="py-3.5 font-sans font-bold text-slate-800">
                      {adm.commissionRate ? `${toPersianDigits(adm.commissionRate)}٪` : '—'}
                    </td>

                    {/* Total Generated */}
                    <td className="py-3.5 font-sans font-bold text-slate-900">
                      {adm.totalRevenueGenerated ? `${formatPrice(adm.totalRevenueGenerated)} ت` : '—'}
                    </td>

                    {/* Unsettled Amount & Quick Settlement button */}
                    <td className="py-3.5">
                      {adm.unsettledAmount && adm.unsettledAmount > 0 ? (
                        <div className="space-y-1">
                          <span className="font-sans font-bold text-amber-600 block">
                            {formatPrice(adm.unsettledAmount)} ت
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSettlementAdmin(adm);
                              setSettlementAmountInput(adm.unsettledAmount || 0);
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold cursor-pointer"
                          >
                            ثبت واریز
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">تسویه کامل</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5">
                      <button
                        type="button"
                        onClick={() => onSaveAdmin({ ...adm, status: adm.status === 'active' ? 'inactive' : 'active' })}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          adm.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {adm.status === 'active' ? 'دسترسی فعال' : 'غیرفعال'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingAdmin(adm)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shadow-2xs"
                          title="ویرایش دسترسی‌ها و مشخصات"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`آیا از حذف دسترسی «${adm.fullName}» اطمینان دارید؟`)) {
                              onDeleteAdmin(adm.id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer shadow-2xs"
                          title="حذف دسترسی"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Admin & Organizer Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto" dir="rtl">
          <div className="relative w-full max-w-xl my-auto rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FF3366]/10 text-[#FF3366] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-display font-black text-base text-slate-900">
                  {editingAdmin.id ? `ویرایش دسترسی: ${editingAdmin.fullName}` : 'افزودن مدیر یا صاحب اثر جدید'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs max-h-[70vh] overflow-y-auto pl-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">نام و نام خانوادگی / نام گروه *</label>
                  <input
                    type="text"
                    value={editingAdmin.fullName || ''}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, fullName: e.target.value })}
                    placeholder="مثال: دکتر علی رفیعی"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">شماره موبایل *</label>
                  <input
                    type="text"
                    value={editingAdmin.phoneNumber || ''}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, phoneNumber: e.target.value })}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ایمیل سازمانی / ورود *</label>
                  <input
                    type="email"
                    value={editingAdmin.email || ''}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                    placeholder="producer@articket.ir"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">نقش سازمانی و سطح دسترسی</label>
                  <select
                    value={editingAdmin.role || 'event_producer'}
                    onChange={(e) => {
                      const r = e.target.value as AdminRole;
                      const opt = ROLE_OPTIONS.find(o => o.role === r);
                      setEditingAdmin({ 
                        ...editingAdmin, 
                        role: r, 
                        roleLabel: opt ? opt.label : 'صاحب اثر' 
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                  >
                    {ROLE_OPTIONS.map(opt => (
                      <option key={opt.role} value={opt.role}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Commission and IBAN for Producers */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80">
                <div className="space-y-1">
                  <label className="font-bold text-amber-900">درصد سهم صاحب اثر از فروش (کمیسیون)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingAdmin.commissionRate !== undefined ? editingAdmin.commissionRate : 85}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, commissionRate: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-amber-200 bg-white text-slate-900 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-amber-900">شماره شبا بانکی (جهت تسویه)</label>
                  <input
                    type="text"
                    value={editingAdmin.iban || ''}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, iban: e.target.value })}
                    placeholder="IR920170000000..."
                    className="w-full p-2.5 rounded-xl border border-amber-200 bg-white text-slate-900 font-mono text-[11px] focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Assign Events to Producer */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  رویدادهای منتسب به این صاحب اثر / تهیه‌کننده:
                </label>
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 max-h-40 overflow-y-auto space-y-2">
                  {events.map((ev) => {
                    const isChecked = (editingAdmin.assignedEventIds || []).includes(ev.id);
                    return (
                      <label key={ev.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const curIds = [...(editingAdmin.assignedEventIds || [])];
                            const curTitles = [...(editingAdmin.assignedEventTitles || [])];
                            if (e.target.checked) {
                              curIds.push(ev.id);
                              curTitles.push(ev.title);
                            } else {
                              const i = curIds.indexOf(ev.id);
                              if (i !== -1) {
                                curIds.splice(i, 1);
                                curTitles.splice(i, 1);
                              }
                            }
                            setEditingAdmin({
                              ...editingAdmin,
                              assignedEventIds: curIds,
                              assignedEventTitles: curTitles,
                            });
                          }}
                          className="w-4 h-4 rounded text-[#FF3366]"
                        />
                        <span className="font-bold text-slate-800">{ev.title}</span>
                        <span className="text-[10px] text-slate-500">({ev.artist} • {ev.venue})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">یادداشت‌های قراردادی و حقوقی</label>
                <textarea
                  rows={2}
                  value={editingAdmin.notes || ''}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, notes: e.target.value })}
                  placeholder="شماره قرارداد، بندهای اختصاصی و شرایط تسویه..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                className="py-2 px-4 rounded-xl text-xs text-slate-600 hover:text-slate-900"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingAdmin.fullName || !editingAdmin.phoneNumber) {
                    alert('لطفاً نام و شماره تماس را وارد کنید.');
                    return;
                  }
                  await onSaveAdmin(editingAdmin);
                  setEditingAdmin(null);
                }}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>ذخیره مشخصات مدیر / تهیه‌کننده</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Settlement Modal */}
      {settlementAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" dir="rtl">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="font-display font-black text-base text-slate-900">
                  ثبت واریز و تسویه حساب سهم گیشه
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSettlementAdmin(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">تهیه‌کننده:</span>
                <span className="font-bold text-slate-900">{settlementAdmin.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">شماره شبا:</span>
                <span className="font-mono font-bold text-slate-800" dir="ltr">{settlementAdmin.iban || 'ثبت نشده'}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">سهم در انتظار تسویه:</span>
                <span className="font-sans font-black text-amber-600">{formatPrice(settlementAdmin.unsettledAmount)} تومان</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">مبلغ واریزی (تومان)</label>
                <input
                  type="number"
                  value={settlementAmountInput}
                  onChange={(e) => setSettlementAmountInput(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">کد پیگیری بانکی / شناسه واریز پایا</label>
                <input
                  type="text"
                  value={settlementRefCode}
                  onChange={(e) => setSettlementRefCode(e.target.value)}
                  placeholder="مثال: PAYA-9402188"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setSettlementAdmin(null)}
                className="py-2 px-4 rounded-xl text-xs text-slate-600 hover:text-slate-900"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmSettlement}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>ثبت قطعی و کسر از مانده</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
