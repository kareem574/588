import React from 'react';
import { 
  AlertTriangle, 
  Users, 
  Clock, 
  Wallet, 
  CheckCircle, 
  Flame, 
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { DriverRecord, ActiveTab, FilterSettings } from '../types';
import { formatCurrency } from '../utils/parser';

interface StatsCardsProps {
  drivers: DriverRecord[];
  settings: FilterSettings;
  onSelectTab: (tab: ActiveTab) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  drivers,
  settings,
  onSelectTab,
}) => {
  const totalCount = drivers.length;
  const highDebtDrivers = drivers.filter(d => d.isHighDebt);
  const inactiveDrivers = drivers.filter(d => d.isInactive);
  const criticalDrivers = drivers.filter(d => d.isCritical);
  const sentCount = drivers.filter(d => d.status.startsWith('sent_') || d.status === 'resolved').length;

  const totalDebtSum = highDebtDrivers.reduce((acc, d) => acc + Math.abs(d.walletBalance), 0);
  const maxInactiveDays = drivers.reduce((max, d) => Math.max(max, d.daysInactive), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
      
      {/* 1. High Debt Card */}
      <div 
        onClick={() => onSelectTab('high_debt')}
        className="bg-white rounded-xl border border-red-200 p-3 sm:p-5 shadow-xs hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group hover:border-red-400 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-red-600 uppercase tracking-wider flex items-center gap-1 truncate">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">مديونيات المحافظ</span>
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2">
              {highDebtDrivers.length} <span className="text-xs sm:text-sm font-normal text-slate-500">مندوب</span>
            </h3>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1 truncate">
              المجموع: <span className="text-red-700 font-bold">{formatCurrency(totalDebtSum)}</span>
            </p>
          </div>
          <span className="p-1.5 sm:p-2.5 rounded-xl bg-red-50 text-red-600 shrink-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
        </div>
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs">
          <span className="text-slate-500 truncate">حد {formatCurrency(settings.debtThreshold)}</span>
          <span className="text-red-600 font-medium flex items-center gap-0.5 shrink-0">
            <span>مراسلة</span>
            <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </span>
        </div>
      </div>

      {/* 2. Inactive Drivers Card */}
      <div 
        onClick={() => onSelectTab('inactive')}
        className="bg-white rounded-xl border border-amber-200 p-3 sm:p-5 shadow-xs hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group hover:border-amber-400 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500"></div>
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1 truncate">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">متوقفون عن العمل</span>
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2">
              {inactiveDrivers.length} <span className="text-xs sm:text-sm font-normal text-slate-500">مندوب</span>
            </h3>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1 truncate">
              أقصى غياب: <span className="text-amber-800 font-bold">{maxInactiveDays} أيام</span>
            </p>
          </div>
          <span className="p-1.5 sm:p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
        </div>
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs">
          <span className="text-slate-500 truncate">{settings.inactiveDaysThreshold}+ أيام غياب</span>
          <span className="text-amber-700 font-medium flex items-center gap-0.5 shrink-0">
            <span>استفسار</span>
            <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </span>
        </div>
      </div>

      {/* 3. Critical Drivers Card */}
      <div 
        onClick={() => onSelectTab('critical')}
        className="bg-white rounded-xl border border-purple-200 p-3 sm:p-5 shadow-xs hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group hover:border-purple-400 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-purple-700 uppercase tracking-wider flex items-center gap-1 truncate">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">حالات حرجة مشتركة</span>
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2">
              {criticalDrivers.length} <span className="text-xs sm:text-sm font-normal text-slate-500">مندوب</span>
            </h3>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1 truncate">
              توقف طويل + مديونية
            </p>
          </div>
          <span className="p-1.5 sm:p-2.5 rounded-xl bg-purple-50 text-purple-700 shrink-0">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
        </div>
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs">
          <span className="text-slate-500 truncate">أولوية أولى</span>
          <span className="text-purple-700 font-medium flex items-center gap-0.5 shrink-0">
            <span>متابعة</span>
            <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </span>
        </div>
      </div>

      {/* 4. Total Drivers & WhatsApp Sent Tracker */}
      <div 
        onClick={() => onSelectTab('all_drivers')}
        className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-xs hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group hover:border-slate-400 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1 truncate">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">إجمالي المناديب</span>
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2">
              {totalCount} <span className="text-xs sm:text-sm font-normal text-slate-500">مندوب</span>
            </h3>
            <p className="text-[11px] sm:text-xs font-medium text-emerald-700 mt-0.5 sm:mt-1 flex items-center gap-1 truncate">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">تواصل: {sentCount} مندوب</span>
            </p>
          </div>
          <span className="p-1.5 sm:p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
        </div>
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mr-2">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${totalCount > 0 ? (sentCount / totalCount) * 100 : 0}%` }}
            ></div>
          </div>
          <span className="text-slate-500 whitespace-nowrap">
            {totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0}%
          </span>
        </div>
      </div>

    </div>
  );
};
