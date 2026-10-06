import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Coupon } from '../../types';
import { toPersianDigits, formatPrice } from '../../utils/persianNumbers';

interface CouponsManagementTabProps {
  coupons: Coupon[];
  onSaveCoupon: (coupon: Partial<Coupon>) => Promise<void>;
  onDeleteCoupon: (id: string) => Promise<void>;
}

export const CouponsManagementTab: React.FC<CouponsManagementTabProps> = ({
  coupons,
  onSaveCoupon,
  onDeleteCoupon,
}) => {
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);

  const handleCreateNew = () => {
    setEditingCoupon({
      code: 'OFF20',
      title: 'تخفیف ویژه جشنواره',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscount: 50,
      minOrderAmount: 100,
      expiryDate: '۱۴۰۵/۰۹/۳۰',
      usageLimit: 200,
      usedCount: 0,
      isActive: true,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Header and Add Button */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-2xs">
        <div>
          <h3 className="font-display font-black text-base text-slate-900">کدهای تخفیف و پروموشن‌ها</h3>
          <p className="text-xs text-slate-500 font-medium">تعریف کدهای تخفیف درصدی و نقدی برای افزایش فروش و جذب مشتری</p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white text-xs font-black shadow-md shadow-[#FF3366]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>کد تخفیف جدید</span>
        </button>
      </div>

      {/* Coupons Table in Light Mode */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="py-3.5 pr-4">کد اختصاصی</th>
                <th className="py-3.5">عنوان کمپین</th>
                <th className="py-3.5">نوع و مقدار تخفیف</th>
                <th className="py-3.5">سقف تخفیف</th>
                <th className="py-3.5">حداقل خرید</th>
                <th className="py-3.5">تعداد مصرف شده</th>
                <th className="py-3.5">تاریخ انقضا</th>
                <th className="py-3.5">وضعیت</th>
                <th className="py-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 pr-4 font-mono font-bold text-sm text-[#FF3366] tracking-wider" dir="ltr">
                    {coupon.code}
                  </td>
                  <td className="py-3.5 font-bold text-slate-900">
                    {coupon.title}
                  </td>
                  <td className="py-3.5">
                    {coupon.discountType === 'percentage' ? (
                      <span className="font-bold text-amber-700 font-sans">
                        {toPersianDigits(coupon.discountValue)}٪ تخفیف درصدی
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-600 font-sans">
                        {formatPrice(coupon.discountValue)} ت تخفیف نقدی
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 font-sans text-slate-700">
                    {coupon.maxDiscount ? `${formatPrice(coupon.maxDiscount)} ت` : 'نامحدود'}
                  </td>
                  <td className="py-3.5 font-sans text-slate-700">
                    {coupon.minOrderAmount ? `${formatPrice(coupon.minOrderAmount)} ت` : 'بدون حداقل'}
                  </td>
                  <td className="py-3.5 font-sans text-slate-700">
                    {toPersianDigits(coupon.usedCount)} / {toPersianDigits(coupon.usageLimit)}
                  </td>
                  <td className="py-3.5 text-slate-700 font-mono">
                    {toPersianDigits(coupon.expiryDate)}
                  </td>
                  <td className="py-3.5">
                    <button
                      type="button"
                      onClick={() => onSaveCoupon({ ...coupon, isActive: !coupon.isActive })}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        coupon.isActive 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {coupon.isActive ? 'فعال' : 'غیرفعال'}
                    </button>
                  </td>
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingCoupon(coupon)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`آیا از حذف کد تخفیف «${coupon.code}» مطمئن هستید؟`)) {
                            onDeleteCoupon(coupon.id);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer shadow-2xs"
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

      {/* Edit Coupon Modal in Light Mode */}
      {editingCoupon && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" dir="rtl">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display font-black text-base text-slate-900">
                {editingCoupon.id ? 'ویرایش کد تخفیف' : 'تعریف کد تخفیف جدید'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">کد کوپن (حروف انگلیسی یا عدد) *</label>
                <input
                  type="text"
                  value={editingCoupon.code || ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="مثال: ART20"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold tracking-wider focus:bg-white focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">عنوان و مناسبت تخفیف</label>
                <input
                  type="text"
                  value={editingCoupon.title || ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, title: e.target.value })}
                  placeholder="مثال: تخفیف ویژه افتتاحیه"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">نوع تخفیف</label>
                  <select
                    value={editingCoupon.discountType || 'percentage'}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="percentage">درصدی (٪)</option>
                    <option value="fixed">مبلغ ثابت (تومان)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">مقدار تخفیف</label>
                  <input
                    type="number"
                    value={editingCoupon.discountValue || 0}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountValue: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">سقف تخفیف (هزار تومان)</label>
                  <input
                    type="number"
                    value={editingCoupon.maxDiscount || 0}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, maxDiscount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">حداکثر دفعات استفاده</label>
                  <input
                    type="number"
                    value={editingCoupon.usageLimit || 100}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, usageLimit: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">تاریخ انقضا</label>
                <input
                  type="text"
                  value={editingCoupon.expiryDate || ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })}
                  placeholder="۱۴۰۵/۰۹/۳۰"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                className="py-2 px-4 rounded-xl text-xs text-slate-600 hover:text-slate-900"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingCoupon.code) {
                    alert('لطفاً کد کوپن را وارد نمایید.');
                    return;
                  }
                  await onSaveCoupon(editingCoupon);
                  setEditingCoupon(null);
                }}
                className="py-2 px-5 rounded-xl bg-gradient-to-l from-[#FF3366] to-[#F59E0B] text-white text-xs font-black shadow-md cursor-pointer"
              >
                ذخیره کد تخفیف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
