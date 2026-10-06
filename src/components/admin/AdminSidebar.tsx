import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  MapPin, 
  Image as ImageIcon, 
  Tag, 
  Palette, 
  Settings, 
  ExternalLink,
  ChevronLeft,
  ShieldCheck,
  Users,
  UserCheck,
  FileCheck2
} from 'lucide-react';

export type AdminTab = 
  | 'dashboard' 
  | 'events' 
  | 'proposals'
  | 'orders' 
  | 'users' 
  | 'admins' 
  | 'venues' 
  | 'banners' 
  | 'coupons' 
  | 'appearance' 
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  counts: {
    events: number;
    orders: number;
    proposals?: number;
    users?: number;
    admins?: number;
    venues: number;
    banners: number;
    coupons: number;
  };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const menuItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { id: 'dashboard', label: 'داشبورد و آمار', icon: LayoutDashboard },
    { id: 'events', label: 'مدیریت رویدادها', icon: Calendar, count: counts.events },
    { id: 'proposals', label: 'درخواست‌های رویداد', icon: FileCheck2, count: counts.proposals },
    { id: 'orders', label: 'سفارش‌ها و بلیت‌ها', icon: Ticket, count: counts.orders },
    { id: 'users', label: 'مدیریت کاربران', icon: Users, count: counts.users },
    { id: 'admins', label: 'ادمین‌ها و صاحبان اثر', icon: UserCheck, count: counts.admins },
    { id: 'venues', label: 'سالن‌ها و مکان‌ها', icon: MapPin, count: counts.venues },
    { id: 'banners', label: 'اسلایدرها و بنرها', icon: ImageIcon, count: counts.banners },
    { id: 'coupons', label: 'کدهای تخفیف', icon: Tag, count: counts.coupons },
    { id: 'appearance', label: 'شخصی‌سازی ظاهر سایت', icon: Palette },
    { id: 'settings', label: 'تنظیمات سامانه', icon: Settings },
  ];

  return (
    <aside 
      className="w-64 lg:w-72 shrink-0 border-l border-slate-200 bg-white flex flex-col justify-between min-h-screen text-slate-800 shadow-sm"
      dir="rtl"
    >
      <div>
        {/* Logo and Brand */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF3366] via-[#FF5533] to-[#F59E0B] flex items-center justify-center text-white shadow-md shadow-[#FF3366]/25">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg text-slate-900">آرتیکت</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF3366]/10 text-[#FF3366] font-mono font-black">PRO</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">پنل مدیریت جامع سامانه</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-l from-[#FF3366] to-[#FF5533] text-white shadow-md shadow-[#FF3366]/20 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Exit & Version */}
      <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
        <a
          href="/"
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>مشاهده سایت اصلی گیشه</span>
        </a>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
          <span>نسخه ۵.۴.۰</span>
          <span className="flex items-center gap-1 text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            سیستم آنلاین
          </span>
        </div>
      </div>
    </aside>
  );
};
