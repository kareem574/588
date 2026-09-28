import React from 'react';
import { 
  AlertTriangle, 
  Users, 
  Clock, 
  Wallet, 
  CheckCircle, 
  Flame, 
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  CheckCircle2,
  Info
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

  // Positive balance: مديونية على المندوب (مطلوب توريده للشركة)
  const driversInDebt = drivers.filter(d => d.walletBalance > 0);
  const highDebtDrivers = drivers.filter(d => d.isHighDebt && d.walletBalance > 0);
  const totalDebtSum = driversInDebt.reduce((acc, d) => acc + d.walletBalance, 0);

  // Negative balance: مستحقات للمندوب (رصيد دائن له لدى الشركة)
  const creditDrivers = drivers.filter(d => d.walletBalance < 0);
  const totalCreditSum = creditDrivers.reduce((acc, d) => acc + Math.abs(d.walletBalance), 0);

  // Zero balance: حساب خالص
  const zeroBalanceDrivers = drivers.filter(d => d.walletBalance === 0);

  const inactiveDrivers = drivers.filter(d => d.isInactive);
  const criticalDrivers = drivers.filter(d => d.isCritical);
  const sentCount = drivers.filter(d => d.status.startsWith('sent_') || d.status === 'resolved').length;
  const maxInactiveDays = drivers.reduce((max, d) => Math.max(max, d.daysInactive), 0);

  return (
    <div className="space-y-3 mb-4 sm:mb-6">
      
      {/* 1. Main 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Card 1: Positive Balance = مديونية على المناديب */}
        <div 
          onClick={() => onSelectTab('high_debt')}
          className="bg-white rounded-xl border border-red-200 p-3 sm:p-5 shadow-xs hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group hover:border-red-400 relative overflow-hidden"
          title="عرض المناديب الذين عليهم مديونيات للتوريد"
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-[11px] sm:text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1 truncate">
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-red-600" />
                  <span className="truncate">مديونيات على المناديب</span>
                </p>
                <span className="bg-red-100 text-red-700 text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  موجب (+)
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2">
                {highDebtDrivers.length} <span className="text-xs sm:text-sm font-normal text-slate-500">مرتفع</span>
                <span className="text-[11px] sm:text-xs font-normal text-slate-400 mr-1.5">({driversInDebt.length} مدين)</span>
              </h3>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1 truncate">
                المطلوب توريده: <span className="text-red-700 font-bold">{formatCurrency(totalDebtSum)}</span>
              </p>
            </div>
            <span className="p-1.5 sm:p-2.5 rounded-xl bg-red-50 text-red-600 shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-slate-500 truncate">حد {formatCurrency(settings.debtThreshold)}</span>
            <span className="text-red-600 font-medium flex items-center gap-0.5 shrink-0">
              <span>طلب التوريد</span>
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Negative Balance = مستحقات للمناديب */}
        <div 
          onClick={() => onSelectTab('credit_drivers')}
          className="bg-white rounded-xl border border-emerald-200 p-3 sm:p-5 shadow-xs hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group hover:border-emerald-400 relative overflow-hidden"
          title="عرض المناديب الذين لديهم مستحقات ورصيد دائن"
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-[11px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1 truncate">
                  <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-emerald-600" />
                  <span className="truncate">مستحقات للمناديب</span>
                </p>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  سالب (-)
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2">
                {creditDrivers.length} <span className="text-xs sm:text-sm font-normal text-slate-500">مندوب</span>
              </h3>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1 truncate">
                إجمالي المستحق لهم: <span className="text-emerald-700 font-bold">{formatCurrency(totalCreditSum)}</span>
              </p>
            </div>
            <span className="p-1.5 sm:p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-emerald-700 font-medium truncate">رصيد دائن للمندوب</span>
            <span className="text-emerald-700 font-medium flex items-center gap-0.5 shrink-0">
              <span>عرض المستحقين</span>
              <ArrowDownLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 3: Inactive Drivers Card */}
        <div 
          onClick={() => onSelectTab('inactive')}
          className="bg-white rounded-xl border border-amber-200 p-3 sm:p-5 shadow-xs hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group hover:border-amber-400 relative overflow-hidden"
          title="عرض المناديب المتوقفين عن العمل لمعرفة سبب الغياب"
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500"></div>
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1 truncate">
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
              <span>استفسار الغياب</span>
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 4: Critical Drivers Card */}
        <div 
          onClick={() => onSelectTab('critical')}
          className="bg-white rounded-xl border border-purple-200 p-3 sm:p-5 shadow-xs hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group hover:border-purple-400 relative overflow-hidden"
          title="عرض الحالات الحرجة المشتركة"
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1 truncate">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">حالات حرجة مشتركة</span>
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2">
                {criticalDrivers.length} <span className="text-xs sm:text-sm font-normal text-slate-500">مندوب</span>
              </h3>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1 truncate">
                توقف طويل + مديونية عليه
              </p>
            </div>
            <span className="p-1.5 sm:p-2.5 rounded-xl bg-purple-50 text-purple-700 shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-purple-700 font-semibold truncate">أولوية أولى للتوريد</span>
            <span className="text-purple-700 font-medium flex items-center gap-0.5 shrink-0">
              <span>متابعة</span>
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </span>
          </div>
        </div>

      </div>

      {/* 2. Executive Balance Guide & Visual Indicator Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-bold shrink-0">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>دليل تصنيف الأرصدة المالية:</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-[11px] sm:text-xs">
          {/* Positive Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-900 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
            <span className="font-bold">رصيد موجب (+) :</span>
            <span>مديونية على المندوب ({driversInDebt.length} كابتن - {formatCurrency(totalDebtSum)})</span>
          </div>

          {/* Negative Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="font-bold">رصيد سالب (-) :</span>
            <span>مستحقات للمندوب ({creditDrivers.length} كابتن - {formatCurrency(totalCreditSum)})</span>
          </div>

          {/* Zero Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
            <span className="font-bold">رصيد صفر (0) :</span>
            <span>حساب خالص ({zeroBalanceDrivers.length} كابتن)</span>
          </div>
        </div>

        {/* WhatsApp progress summary */}
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-slate-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>تم التواصل: <strong className="text-slate-800">{sentCount}</strong> من {totalCount}</span>
        </div>
      </div>

    </div>
  );
};
