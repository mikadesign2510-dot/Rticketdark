import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Ticket, 
  Wallet, 
  Phone, 
  Mail, 
  X, 
  Check, 
  Filter,
  DollarSign,
  TrendingUp,
  FileText
} from 'lucide-react';
import { SiteUser, UserAccountStatus } from '../../types';
import { toPersianDigits, formatPrice } from '../../utils/persianNumbers';

interface UsersManagementTabProps {
  users: SiteUser[];
  onSaveUser: (user: Partial<SiteUser>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}

export const UsersManagementTab: React.FC<UsersManagementTabProps> = ({
  users,
  onSaveUser,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserAccountStatus>('all');
  const [editingUser, setEditingUser] = useState<Partial<SiteUser> | null>(null);
  const [viewingHistoryUser, setViewingHistoryUser] = useState<SiteUser | null>(null);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = u.fullName.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phoneNumber.includes(q);
      const matchNational = (u.nationalCode || '').includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchNational) return false;
    }
    return true;
  });

  // KPI calculations
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const loyalUsers = users.filter(u => u.ticketsCount >= 3).length;
  const totalVolumeSpent = users.reduce((sum, u) => sum + (u.totalSpent || 0), 0);

  const handleCreateNewUser = () => {
    setEditingUser({
      fullName: '',
      email: '',
      phoneNumber: '',
      nationalCode: '',
      joinedDate: '۱۴۰۵/۰۱/۱۵',
      status: 'active',
      ticketsCount: 0,
      totalSpent: 0,
      walletBalance: 0,
      notes: '',
      purchasedEventTitles: [],
    });
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>کل اعضا و خریداران</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-slate-900">
            {toPersianDigits(totalUsers)} <span className="text-xs font-normal text-slate-500">کاربر</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold">
            {toPersianDigits(activeUsers)} کاربر فعال و تایید شده
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>مشتریان وفادار (VIP)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-slate-900">
            {toPersianDigits(loyalUsers)} <span className="text-xs font-normal text-slate-500">نفر</span>
          </div>
          <div className="text-[11px] text-amber-600 font-bold">
            دارای ۳ خرید بلیت یا بیشتر
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>مجموع پرداخت کاربران</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-slate-900">
            {formatPrice(totalVolumeSpent)} <span className="text-xs font-normal text-slate-500">تومان</span>
          </div>
          <div className="text-[11px] text-slate-500">
            تسویه شده در شاپرک متمرکز
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>وضعیت حساب‌های مسدود</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-2xl text-red-600">
            {toPersianDigits(users.filter(u => u.status === 'blocked').length)} <span className="text-xs font-normal text-slate-500">مسدود</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {toPersianDigits(users.filter(u => u.status === 'pending').length)} حساب نیازمند احراز
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter & Add */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-64 sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو با نام، موبایل، ایمیل یا کد ملی..."
              className="w-full py-2.5 pr-9 pl-3 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF3366]/30"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-[#FF3366] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              همه ({toPersianDigits(users.length)})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'active' ? 'bg-[#FF3366] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              فعال ({toPersianDigits(activeUsers)})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'pending' ? 'bg-[#FF3366] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              در انتظار
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('blocked')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'blocked' ? 'bg-[#FF3366] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مسدود
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateNewUser}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs font-black shadow-md shadow-[#FF3366]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          <span>افزودن کاربر جدید</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="py-3.5 pr-4">مشخصات کاربر</th>
                <th className="py-3.5">اطلاعات تماس</th>
                <th className="py-3.5">کد ملی</th>
                <th className="py-3.5">تاریخ عضویت</th>
                <th className="py-3.5">تعداد بلیت</th>
                <th className="py-3.5">مجموع خرید</th>
                <th className="py-3.5">کیف پول</th>
                <th className="py-3.5">وضعیت</th>
                <th className="py-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Name and avatar */}
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {user.fullName ? user.fullName[0] : 'ک'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{user.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5" dir="ltr">{user.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5">
                    <span className="font-mono text-slate-800 font-bold block" dir="ltr">{user.phoneNumber}</span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5" dir="ltr">{user.email || 'بدون ایمیل'}</span>
                  </td>

                  {/* National Code */}
                  <td className="py-3.5 font-mono text-slate-600">
                    {user.nationalCode ? toPersianDigits(user.nationalCode) : '—'}
                  </td>

                  {/* Joined Date */}
                  <td className="py-3.5 text-slate-600 font-mono">
                    {toPersianDigits(user.joinedDate)}
                  </td>

                  {/* Tickets Count */}
                  <td className="py-3.5">
                    <button
                      type="button"
                      onClick={() => setViewingHistoryUser(user)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#FF3366]/10 text-slate-800 hover:text-[#FF3366] font-bold transition-colors cursor-pointer"
                      title="مشاهده تاریخچه بلیت‌ها"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{toPersianDigits(user.ticketsCount)} بلیت</span>
                    </button>
                  </td>

                  {/* Total Spent */}
                  <td className="py-3.5 font-sans font-bold text-emerald-600">
                    {formatPrice(user.totalSpent)} ت
                  </td>

                  {/* Wallet Balance */}
                  <td className="py-3.5 font-sans font-bold text-amber-600">
                    {user.walletBalance > 0 ? `${formatPrice(user.walletBalance)} ت` : '۰'}
                  </td>

                  {/* Status */}
                  <td className="py-3.5">
                    {user.status === 'active' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        فعال
                      </span>
                    )}
                    {user.status === 'blocked' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                        <XCircle className="w-3 h-3" />
                        مسدود
                      </span>
                    )}
                    {user.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        در انتظار احراز
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Toggle status */}
                      <button
                        type="button"
                        onClick={async () => {
                          const newStatus: UserAccountStatus = user.status === 'active' ? 'blocked' : 'active';
                          await onSaveUser({ ...user, status: newStatus });
                        }}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
                          user.status === 'active'
                            ? 'border-red-200 bg-white hover:bg-red-50 text-red-600'
                            : 'border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-600'
                        }`}
                        title={user.status === 'active' ? 'مسدود کردن کاربر' : 'فعال‌سازی حساب'}
                      >
                        {user.status === 'active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => setEditingUser(user)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shadow-2xs"
                        title="ویرایش مشخصات"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`آیا از حذف کامل حساب کاربری «${user.fullName}» مطمئن هستید؟`)) {
                            onDeleteUser(user.id);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer shadow-2xs"
                        title="حذف کاربر"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" dir="rtl">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FF3366]/10 text-[#FF3366] flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-display font-black text-base text-slate-900">
                  {editingUser.id ? `ویرایش کاربر: ${editingUser.fullName}` : 'ثبت کاربر جدید'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">نام و نام خانوادگی *</label>
                  <input
                    type="text"
                    value={editingUser.fullName || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    placeholder="مثال: سارا تهرانی"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">شماره موبایل *</label>
                  <input
                    type="text"
                    value={editingUser.phoneNumber || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">پست الکترونیک (ایمیل)</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">کد ملی</label>
                  <input
                    type="text"
                    value={editingUser.nationalCode || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, nationalCode: e.target.value })}
                    placeholder="۰۰۱۲۳۴۵۶۷۸"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">وضعیت حساب کاربری</label>
                  <select
                    value={editingUser.status || 'active'}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as UserAccountStatus })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="active">فعال و مجاز به خرید</option>
                    <option value="pending">در انتظار احراز هویت پیامکی</option>
                    <option value="blocked">مسدود و عدم دسترسی به بلیت</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">اعتبار کیف پول (تومان)</label>
                  <input
                    type="number"
                    value={editingUser.walletBalance || 0}
                    onChange={(e) => setEditingUser({ ...editingUser, walletBalance: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">یادداشت مدیریتی (پنهان از کاربر)</label>
                <textarea
                  rows={2}
                  value={editingUser.notes || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                  placeholder="توضیحات و سوابق مشتری..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="py-2 px-4 rounded-xl text-xs text-slate-600 hover:text-slate-900"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingUser.fullName || !editingUser.phoneNumber) {
                    alert('لطفاً نام و شماره موبایل کاربر را وارد کنید.');
                    return;
                  }
                  await onSaveUser(editingUser);
                  setEditingUser(null);
                }}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-l from-[#FF3366] via-[#FF5533] to-[#F59E0B] text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>ذخیره مشخصات کاربر</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Purchase History Modal */}
      {viewingHistoryUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" dir="rtl">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-display font-black text-base text-slate-900">
                  سوابق و رویدادهای خریداری‌شده
                </h3>
                <p className="text-xs text-slate-500 font-medium">{viewingHistoryUser.fullName} • {viewingHistoryUser.phoneNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingHistoryUser(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {viewingHistoryUser.purchasedEventTitles && viewingHistoryUser.purchasedEventTitles.length > 0 ? (
                <div className="space-y-2">
                  {viewingHistoryUser.purchasedEventTitles.map((title, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{title}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        بلیت قطعی
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs">
                  هیچ سابقه خریدی برای این کاربر ثبت نشده است.
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between font-bold">
                <span>مجموع خرید ثبت‌شده:</span>
                <span className="font-sans text-emerald-600">{formatPrice(viewingHistoryUser.totalSpent)} تومان</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingHistoryUser(null)}
                className="py-2 px-5 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
