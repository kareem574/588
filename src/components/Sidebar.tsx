import React from 'react';
import { 
  Wallet, 
  Clock, 
  Flame, 
  Layers, 
  CheckCircle,
  FileSpreadsheet,
  Settings,
  Upload,
  RefreshCw,
  ExternalLink,
  PhoneCall,
  X,
  Sliders,
  TrendingDown,
  ChevronLeft,
  Share2,
  Coins,
  ArrowDownLeft
} from 'lucide-react';
import { ActiveTab, DriverRecord, FilterSettings } from '../types';
import { formatCurrency } from '../utils/parser';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  drivers: DriverRecord[];
  settings: FilterSettings;
  sheetId: string;
  pullDate: string;
  isLoading: boolean;
  onRefresh: () => void;
  onChangeSheetClick: () => void;
  onUploadClick: () => void;
  onOpenSettings: () => void;
  onStartBatchQueue: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  drivers,
  settings,
  sheetId,
  pullDate,
  isLoading,
  onRefresh,
  onChangeSheetClick,
  onUploadClick,
  onOpenSettings,
  onStartBatchQueue,
}) => {
  // Counts
  const highDebtCount = drivers.filter(d => d.isHighDebt).length;
  const inactiveCount = drivers.filter(d => d.isInactive).length;
  const criticalCount = drivers.filter(d => d.isCritical).length;
  const creditCount = drivers.filter(d => d.walletBalance < 0).length;
  const totalCount = drivers.length;

  const totalDebtSum = drivers
    .filter(d => d.isHighDebt)
    .reduce((acc, d) => acc + Math.abs(d.walletBalance), 0);

  const navItems = [
    {
      id: 'high_debt' as ActiveTab,
      label: 'مديونيات مرتفعة (توريد)',
      subtext: 'محافظ تتجاوز الحد المحدد (+)',
      icon: Wallet,
      count: highDebtCount,
      color: 'text-red-600',
      badgeBg: 'bg-red-100 text-red-700',
      activeBg: 'bg-red-50 text-red-700 border-r-4 border-red-600 font-bold',
    },
    {
      id: 'credit_drivers' as ActiveTab,
      label: 'مستحقات المناديب (له)',
      subtext: 'أرصدة سالبة دائنة للمندوب (-)',
      icon: Coins,
      count: creditCount,
      color: 'text-emerald-600',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      activeBg: 'bg-emerald-50 text-emerald-800 border-r-4 border-emerald-600 font-bold',
    },
    {
      id: 'inactive' as ActiveTab,
      label: 'متوقفون عن العمل',
      subtext: 'مدة التوقف وسبب الغياب',
      icon: Clock,
      count: inactiveCount,
      color: 'text-amber-600',
      badgeBg: 'bg-amber-100 text-amber-700',
      activeBg: 'bg-amber-50 text-amber-800 border-r-4 border-amber-600 font-bold',
    },
    {
      id: 'critical' as ActiveTab,
      label: 'حالات حرجة مشتركة',
      subtext: 'توقف طويل + مديونية معلقة',
      icon: Flame,
      count: criticalCount,
      color: 'text-purple-600',
      badgeBg: 'bg-purple-100 text-purple-700',
      activeBg: 'bg-purple-50 text-purple-800 border-r-4 border-purple-600 font-bold',
    },
    {
      id: 'all_drivers' as ActiveTab,
      label: 'جميع المناديب',
      subtext: 'سجل المتابعة والبحث الشامل',
      icon: CheckCircle,
      count: totalCount,
      color: 'text-emerald-600',
      badgeBg: 'bg-emerald-100 text-emerald-700',
      activeBg: 'bg-emerald-50 text-emerald-800 border-r-4 border-emerald-600 font-bold',
    },
    {
      id: 'overview' as ActiveTab,
      label: 'لوحة التحليلات والموجز',
      subtext: 'إحصائيات وخطة العمل',
      icon: Layers,
      count: null,
      color: 'text-slate-600',
      badgeBg: '',
      activeBg: 'bg-slate-100 text-slate-900 border-r-4 border-slate-700 font-bold',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 sm:w-80 bg-white border-l border-slate-200 flex flex-col shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } lg:static lg:z-20 lg:w-72 lg:shrink-0 lg:h-[calc(100vh-4.25rem)] lg:sticky lg:top-[4.25rem]`}
      >
        {/* Sidebar Header (Mobile & Brand) */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/30">
              <img src="/app-icon.svg" alt="App Icon" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">نظام إدارة المحافظ</h2>
              <p className="text-[11px] text-slate-500 font-medium">إدارة العز • المناديب</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 lg:hidden"
            title="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Refresh & Batch CTA inside sidebar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col gap-2">
          <button
            onClick={() => {
              onStartBatchQueue();
              if (window.innerWidth < 1024) onClose();
            }}
            disabled={drivers.length === 0}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            <span>المراسلة المتتابعة عبر واتساب</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'جاري تحديث الشيت...' : 'سحب وتحديث الشيت الآن'}</span>
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            التصنيفات والفلترة السريعة
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right transition-all group ${
                  isActive
                    ? item.activeBg
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white shadow-xs' : 'bg-slate-100 group-hover:bg-white'} ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold truncate leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{item.subtext}</div>
                  </div>
                </div>

                {item.count !== null && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive ? 'bg-white shadow-xs font-black' : item.badgeBg
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Summary Pill in Sidebar */}
          {highDebtCount > 0 && (
            <div className="mt-4 p-3 bg-red-50/70 border border-red-100 rounded-xl">
              <div className="flex items-center justify-between text-xs text-red-900 font-bold mb-1">
                <span>إجمالي مديونيات التوريد:</span>
              </div>
              <div className="text-base font-black text-red-600">
                {formatCurrency(totalDebtSum)}
              </div>
              <div className="text-[10px] text-red-600/80 mt-0.5">
                تتطلب متابعة سريعة وتوريد
              </div>
            </div>
          )}

          {/* Management / Settings Links */}
          <div className="pt-4 mt-3 border-t border-slate-200">
            <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              إعدادات النظام والمصدر
            </div>

            <button
              onClick={() => {
                onChangeSheetClick();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>رابط Google Sheet</span>
            </button>

            <button
              onClick={() => {
                onUploadClick();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>استيراد ملف يدوي (CSV/Excel)</span>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Sliders className="w-4 h-4 text-slate-500" />
              <span>حدود المديونية وقوالب الرسائل</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer with Sheet Info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">سحبة الشيت:</span>
            <span className="text-emerald-700 font-bold">{pullDate || 'مباشر'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>حد المديونية الحالي:</span>
            <span className="font-bold text-slate-800">{formatCurrency(settings.debtThreshold)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>حد أيام التوقف:</span>
            <span className="font-bold text-slate-800">{settings.inactiveDaysThreshold} أيام</span>
          </div>
        </div>
      </aside>
    </>
  );
};
