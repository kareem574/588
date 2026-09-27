import React from 'react';
import { 
  RotateCw, 
  Settings, 
  MessageSquareShare,
  Menu
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  sheetId: string;
  pullDate: string;
  totalDrivers: number;
  isLoading: boolean;
  onRefresh: () => void;
  onChangeSheetClick: () => void;
  onUploadClick: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  onStartBatchQueue: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sheetId,
  pullDate,
  totalDrivers,
  isLoading,
  onRefresh,
  activeTab,
  setActiveTab,
  onOpenSettings,
  onStartBatchQueue,
  onToggleSidebar,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 sm:py-3 gap-2 sm:gap-4">
          
          {/* Right Section: Mobile Hamburger + Logo + Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Button to open Sidebar */}
            <button
              onClick={onToggleSidebar}
              className="p-2 -mr-1 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-slate-100 lg:hidden focus:outline-hidden"
              aria-label="فتح القائمة الجانبية"
              title="القائمة والتصنيفات"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* App Icon */}
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <img src="/app-icon.svg" alt="App Icon" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
            </div>

            {/* Title & Sheet details */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 tracking-tight truncate">
                  نظام إدارة المحافظ والمناديب
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                  إدارة العز
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 sm:gap-2 mt-0.5 truncate">
                <span className="hidden sm:inline">سحب مباشر من Google Sheets</span>
                {pullDate && (
                  <>
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-300 hidden sm:inline"></span>
                    <span className="text-emerald-700 font-bold truncate">سحبة: {pullDate}</span>
                  </>
                )}
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-300"></span>
                <span className="text-slate-600 font-medium">({totalDrivers} مندوب)</span>
              </p>
            </div>
          </div>

          {/* Left Section: Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-lg transition-all disabled:opacity-50"
              title="تحديث البيانات من الشيت الآن"
            >
              <RotateCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden md:inline">{isLoading ? 'جاري التحديث...' : 'تحديث البيانات'}</span>
            </button>

            {/* Batch Messenger Button */}
            <button
              onClick={onStartBatchQueue}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-xs transition-all"
              title="بدء المراسلة المتتابعة للواتساب"
            >
              <MessageSquareShare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">المراسلة المتتابعة</span>
              <span className="sm:hidden">مراسلة</span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="الإعدادات وقوالب الرسائل"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Sub-nav on mobile / small screens for fast switching */}
        <div className="flex items-center gap-1.5 border-t border-slate-100 overflow-x-auto py-2 text-xs sm:text-sm font-medium no-scrollbar">
          <button
            onClick={() => setActiveTab('high_debt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'high_debt'
                ? 'bg-red-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span>مديونيات المحافظ</span>
          </button>

          <button
            onClick={() => setActiveTab('inactive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'inactive'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-amber-50 hover:text-amber-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>متوقفون عن العمل</span>
          </button>

          <button
            onClick={() => setActiveTab('critical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'critical'
                ? 'bg-purple-700 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-purple-50 hover:text-purple-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>حالات حرجة</span>
          </button>

          <button
            onClick={() => setActiveTab('all_drivers')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'all_drivers'
                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            جميع المناديب ({totalDrivers})
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            لوحة التحليلات
          </button>
        </div>

      </div>
    </header>
  );
};
