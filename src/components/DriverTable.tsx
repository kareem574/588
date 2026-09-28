import React from 'react';
import { 
  MessageSquare, 
  Phone, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  Wallet, 
  AlertCircle,
  Eye,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Share2,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  TrendingUp
} from 'lucide-react';
import { DriverRecord, ActiveTab, MessageTemplates, MessageType } from '../types';
import { formatCurrency, getCleanDriverName } from '../utils/parser';
import { buildMessage, openWhatsAppChat } from '../utils/whatsapp';

interface DriverTableProps {
  drivers: DriverRecord[];
  templates: MessageTemplates;
  activeTab: ActiveTab;
  onPreviewMessage: (driver: DriverRecord, type: MessageType) => void;
  onToggleStatus: (driverCode: string, newStatus: DriverRecord['status']) => void;
}

export const DriverTable: React.FC<DriverTableProps> = ({
  drivers,
  templates,
  activeTab,
  onPreviewMessage,
  onToggleStatus,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickWhatsApp = (driver: DriverRecord, type: MessageType) => {
    const text = buildMessage(driver, type, templates);
    openWhatsAppChat(driver.normalizedPhone, text);
    
    // Automatically record status if currently pending
    if (driver.status === 'pending') {
      const nextStatus = type === 'high_debt' ? 'sent_debt' : 
                         type === 'credit' ? 'sent_debt' :
                         type === 'inactive' ? 'sent_inactive' : 'sent_both';
      onToggleStatus(driver.driverCode, nextStatus);
    }
  };

  if (drivers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-slate-800">لا توجد سجلات مناديب مطابقة للفلاتر الحالية</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          يرجى تجربة تعديل حد المديونية أو حد أيام الغياب أو إزالة كلمات البحث لعرض المناديب.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 
        ========================================================================
        1. MOBILE CARD VIEW (Shown on screens < 768px: sm & mobile)
        Designed specifically for mobile touch with large tap targets & WhatsApp button
        ========================================================================
      */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {drivers.map((driver) => {
          const cleanName = getCleanDriverName(driver.driverName);
          const isSent = driver.status.startsWith('sent_') || driver.status === 'resolved';
          const targetType: MessageType = driver.isCritical ? 'critical' : 
                                          driver.walletBalance < 0 ? 'credit' : 
                                          driver.isHighDebt ? 'high_debt' : 'inactive';
          const isPositiveDebt = driver.walletBalance > 0;
          const isNegativeCredit = driver.walletBalance < 0;

          return (
            <div
              key={`card-${driver.id}`}
              className={`bg-white rounded-2xl border p-4 shadow-xs transition-all relative ${
                driver.isCritical 
                  ? 'border-purple-200 bg-purple-50/20' 
                  : driver.isHighDebt 
                  ? 'border-red-200 bg-red-50/10' 
                  : isNegativeCredit
                  ? 'border-emerald-200 bg-emerald-50/10'
                  : driver.isInactive 
                  ? 'border-amber-200 bg-amber-50/10' 
                  : 'border-slate-200'
              }`}
            >
              {/* Card Top: Name, Code & Status */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 leading-snug">
                      {cleanName}
                    </span>
                    {driver.isCritical && (
                      <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        حرج
                      </span>
                    )}
                    {driver.isHighDebt && !driver.isCritical && (
                      <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        مديونية توريد
                      </span>
                    )}
                    {isNegativeCredit && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        له مستحقات
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                    <span>كود: {driver.driverCode}</span>
                    {driver.supervisor && (
                      <span className="text-slate-400 truncate">| {driver.supervisor}</span>
                    )}
                  </div>
                </div>

                {/* Status Toggle Badge */}
                <button
                  onClick={() => onToggleStatus(
                    driver.driverCode, 
                    isSent ? 'pending' : 'sent_debt'
                  )}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full border shrink-0 transition-all ${
                    isSent
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {isSent ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>تم</span>
                    </>
                  ) : (
                    <span>لم يُرسل</span>
                  )}
                </button>
              </div>

              {/* Card Middle: Key Metrics (Wallet & Inactivity) */}
              <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                
                {/* Balance Block */}
                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5 font-medium">رصيد المحفظة:</span>
                  
                  {isPositiveDebt ? (
                    <div className="space-y-1">
                      <span 
                        className={`font-black text-sm px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                          driver.isHighDebt
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-red-600" />
                        <span dir="ltr">+{formatCurrency(driver.walletBalance)}</span>
                      </span>
                      <span className="text-[10px] font-bold text-red-700 block">
                        مديونية على المندوب
                      </span>
                    </div>
                  ) : isNegativeCredit ? (
                    <div className="space-y-1">
                      <span className="font-black text-sm px-2 py-0.5 rounded-md inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <ArrowDownLeft className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                        <span dir="ltr">{formatCurrency(driver.walletBalance)}</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 block">
                        مستحقات للمندوب (له)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="font-bold text-sm px-2 py-0.5 rounded-md inline-flex items-center gap-1 bg-slate-200 text-slate-700 border border-slate-300">
                        <Check className="w-3 h-3 text-slate-500" />
                        <span>0.00 ج.م</span>
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        حساب خالص
                      </span>
                    </div>
                  )}
                </div>

                {/* Inactive Duration */}
                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5 font-medium">مدة التوقف:</span>
                  <span
                    className={`font-bold text-xs px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                      driver.daysInactive >= 10
                        ? 'bg-red-600 text-white'
                        : driver.daysInactive >= 3
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>
                      {driver.daysInactive === 0 ? 'شغال اليوم' : 
                       driver.daysInactive === 1 ? 'منذ يوم' : 
                       driver.daysInactive === 2 ? 'منذ يومين' :
                       `${driver.daysInactive} أيام`}
                    </span>
                  </span>
                </div>

                {/* Area info */}
                <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>المنطقة: <strong className="text-slate-700">{driver.area || 'غير محدد'}</strong></span>
                  <span>آخر معاملة: <span className="font-mono text-slate-600">{driver.lastTransactionDate?.split(',')[0] || '-'}</span></span>
                </div>
              </div>

              {/* Card Bottom: Phone Actions & Direct WhatsApp Button */}
              <div className="flex items-center gap-2 pt-1">
                {/* Phone call & copy */}
                {driver.phone && (
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`tel:${driver.phone}`}
                      className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 active:scale-90 rounded-xl transition-all"
                      title="اتصال هاتفي"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleCopyPhone(driver.phone, driver.id)}
                      className="p-2.5 text-slate-500 bg-slate-100 hover:bg-slate-200 active:scale-90 rounded-xl transition-all"
                      title="نسخ الرقم"
                    >
                      {copiedId === driver.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}

                {/* Primary WhatsApp Action Button (Full Width on mobile) */}
                <button
                  onClick={() => handleQuickWhatsApp(driver, targetType)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-xs transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {targetType === 'critical' ? 'واتساب عاجل (توقف+مديونية)' : 
                     targetType === 'credit' ? 'واتساب المستحقات (فلوس له)' :
                     targetType === 'high_debt' ? 'واتساب طلب التوريد (مديونية عليه)' : 
                     driver.isInactive ? 'واتساب مدة الغياب' : 'واتساب المندوب'}
                  </span>
                </button>

                {/* Preview Message Modal */}
                <button
                  onClick={() => onPreviewMessage(driver, targetType)}
                  className="p-2.5 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-xl transition-colors shrink-0"
                  title="معاينة الرسالة"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 
        ========================================================================
        2. DESKTOP / TABLET DATA TABLE (Shown on screens >= 768px: md & lg)
        ========================================================================
      */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600">
                <th className="py-3.5 px-4">المندوب والكود</th>
                <th className="py-3.5 px-4">رقم الهاتف</th>
                <th className="py-3.5 px-4">المنطقة والزون</th>
                <th className="py-3.5 px-4 min-w-[210px]">
                  <span>رصيد المحفظة (المديونية والمستحقات)</span>
                </th>
                <th className="py-3.5 px-4">مدة التوقف (بقاله قد ايه)</th>
                <th className="py-3.5 px-4">تاريخ آخر معاملة</th>
                <th className="py-3.5 px-4 text-center">إجراءات الواتساب والمراسلة</th>
                <th className="py-3.5 px-4 text-center">حالة التواصل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {drivers.map((driver) => {
                const cleanName = getCleanDriverName(driver.driverName);
                const isSent = driver.status.startsWith('sent_') || driver.status === 'resolved';
                const targetType: MessageType = driver.isCritical ? 'critical' : 
                                                driver.walletBalance < 0 ? 'credit' : 
                                                driver.isHighDebt ? 'high_debt' : 'inactive';
                const isPositiveDebt = driver.walletBalance > 0;
                const isNegativeCredit = driver.walletBalance < 0;

                return (
                  <tr 
                    key={`row-${driver.id}`} 
                    className={`hover:bg-slate-50/80 transition-colors ${
                      driver.isCritical ? 'bg-purple-50/25' : 
                      driver.isHighDebt ? 'bg-red-50/15' : 
                      isNegativeCredit ? 'bg-emerald-50/10' :
                      driver.isInactive ? 'bg-amber-50/15' : ''
                    }`}
                  >
                    
                    {/* 1. Driver Name & Code */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{cleanName}</span>
                        {driver.isCritical && (
                          <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            حرج
                          </span>
                        )}
                        {driver.isHighDebt && !driver.isCritical && (
                          <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            مديونية
                          </span>
                        )}
                        {isNegativeCredit && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            له مستحقات
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        <span>كود: {driver.driverCode}</span>
                        {driver.supervisor && (
                          <span className="text-slate-400">| مشرف: {driver.supervisor}</span>
                        )}
                      </div>
                    </td>

                    {/* 2. Phone Number */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-slate-700" dir="ltr">
                          {driver.phone || 'بدون هاتف'}
                        </span>
                        {driver.phone && (
                          <>
                            <button
                              onClick={() => handleCopyPhone(driver.phone, driver.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                              title="نسخ رقم الهاتف"
                            >
                              {copiedId === driver.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <a
                              href={`tel:${driver.phone}`}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                              title="اتصال هاتفي سريع"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </>
                        )}
                      </div>
                    </td>

                    {/* 3. Area & Zone */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-medium text-slate-800">
                        {driver.area || 'غير محدد'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {driver.zone || ''}
                      </div>
                    </td>

                    {/* 4. Wallet Balance (Distinguishing Positive Debt vs Negative Credit) */}
                    <td className="py-3.5 px-4">
                      {isPositiveDebt ? (
                        /* Positive Balance: مديونية على المندوب */
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span 
                              className={`text-sm font-black px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1.5 ${
                                driver.isHighDebt
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : 'bg-amber-50 text-amber-900 border border-amber-200'
                              }`}
                            >
                              <ArrowUpRight className={`w-3.5 h-3.5 shrink-0 ${driver.isHighDebt ? 'text-red-600' : 'text-amber-600'}`} />
                              <span dir="ltr">+{formatCurrency(driver.walletBalance)}</span>
                            </span>
                          </div>
                          
                          {/* Explanatory text badge next to / under balance */}
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            driver.isHighDebt 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${driver.isHighDebt ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                            <span>{driver.isHighDebt ? 'مديونية على المندوب (مطلوب توريدها)' : 'مديونية على المندوب'}</span>
                          </div>
                        </div>
                      ) : isNegativeCredit ? (
                        /* Negative Balance: مستحقات للمندوب (له لدى الشركة) */
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <ArrowDownLeft className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                              <span dir="ltr">{formatCurrency(driver.walletBalance)}</span>
                            </span>
                          </div>

                          {/* Explanatory text badge next to / under balance */}
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                            <span>مستحقات للمندوب (له لدى الشركة)</span>
                          </div>
                        </div>
                      ) : (
                        /* Zero Balance: حساب خالص ومسدد */
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200">
                              <Check className="w-3 h-3 text-slate-500" />
                              <span>0.00 ج.م</span>
                            </span>
                          </div>
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                            <span>حساب خالص (لا توجد مديونية)</span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* 5. Inactive Days (بقاله قد ايه مش شغال) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                            driver.daysInactive >= 10
                              ? 'bg-red-600 text-white'
                              : driver.daysInactive >= 5
                              ? 'bg-amber-500 text-white'
                              : driver.daysInactive >= 2
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {driver.daysInactive === 0 ? 'شغال اليوم' : 
                             driver.daysInactive === 1 ? 'متوقف منذ يوم' :
                             driver.daysInactive === 2 ? 'متوقف منذ يومين' :
                             `متوقف منذ ${driver.daysInactive} أيام`}
                          </span>
                        </span>
                      </div>
                    </td>

                    {/* 6. Last Transaction Date */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-600 font-mono">
                        {driver.lastTransactionDate || 'غير مسجل'}
                      </div>
                    </td>

                    {/* 7. WhatsApp Action Buttons */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* WhatsApp Direct Action Button */}
                        <button
                          onClick={() => handleQuickWhatsApp(driver, targetType)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-xs hover:shadow transition-all"
                          title="إرسال رسالة واتساب مباشرة للمندوب"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>
                            {targetType === 'critical' ? 'واتساب عاجل' : 
                             targetType === 'credit' ? 'إشعار مستحقات' :
                             targetType === 'high_debt' ? 'طلب توريد (عليه)' : 
                             driver.isInactive ? 'سؤال الغياب' : 'واتساب المندوب'}
                          </span>
                        </button>

                        {/* Preview Button */}
                        <button
                          onClick={() => onPreviewMessage(driver, targetType)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors"
                          title="معاينة وتعديل نص الرسالة قبل الإرسال"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    {/* 8. Contact Status Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onToggleStatus(
                          driver.driverCode, 
                          isSent ? 'pending' : 'sent_debt'
                        )}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                          isSent
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                        title={isSent ? 'تم التواصل (انقر لإلغاء التحديد)' : 'انقر لتحديده كـ تم التواصل'}
                      >
                        {isSent ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>تم التواصل</span>
                          </>
                        ) : (
                          <span>لم يُرسل</span>
                        )}
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
