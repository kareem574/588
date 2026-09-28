import React, { useState } from 'react';
import { 
  X, 
  Send, 
  SkipForward, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare, 
  Check, 
  Copy,
  Clock,
  Wallet,
  UserCheck
} from 'lucide-react';
import { DriverRecord, MessageTemplates, MessageType } from '../types';
import { buildMessage, openWhatsAppChat } from '../utils/whatsapp';
import { formatCurrency, getCleanDriverName } from '../utils/parser';

interface BatchQueueModalProps {
  drivers: DriverRecord[];
  templates: MessageTemplates;
  isOpen: boolean;
  onClose: () => void;
  onMarkSent: (driverCode: string, type?: MessageType) => void;
}

export const BatchQueueModal: React.FC<BatchQueueModalProps> = ({
  drivers,
  templates,
  isOpen,
  onClose,
  onMarkSent,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen || drivers.length === 0) return null;

  const currentDriver = drivers[currentIndex];
  const cleanName = getCleanDriverName(currentDriver.driverName);

  const messageType: MessageType = currentDriver.isCritical ? 'critical' : 
                                   currentDriver.walletBalance < 0 ? 'credit' :
                                   currentDriver.isHighDebt ? 'high_debt' : 'inactive';
  const messageText = buildMessage(currentDriver, messageType, templates);

  const handleSendAndNext = () => {
    openWhatsAppChat(currentDriver.normalizedPhone, messageText);
    onMarkSent(currentDriver.driverCode, messageType);
    if (currentIndex < drivers.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    if (currentIndex < drivers.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPercent = Math.round(((currentIndex + 1) / drivers.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        
        {/* Header with Progress Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 shrink-0">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-sm sm:text-base font-bold">طابور المراسلة المتتابعة عبر واتساب</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span>المندوب <strong>{currentIndex + 1}</strong> من إجمالي <strong>{drivers.length}</strong></span>
            <span>{progressPercent}% مكتمل</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Current Driver Card Info */}
        <div className="p-3.5 sm:p-5 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base sm:text-lg font-bold text-slate-900">{cleanName}</h4>
                <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                  كود: {currentDriver.driverCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-slate-700 font-bold" dir="ltr">{currentDriver.phone}</span>
                <span>• {currentDriver.area || currentDriver.zone}</span>
                {currentDriver.supervisor && (
                  <span>• مشرف: {currentDriver.supervisor}</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {currentDriver.walletBalance > 0 ? (
                <div className="bg-red-50 border border-red-200 p-2 sm:p-2.5 rounded-xl text-center flex-1 sm:min-w-[110px]">
                  <span className="text-[10px] text-red-600 font-bold block">مديونية عليه (+)</span>
                  <span className="text-xs sm:text-sm font-black text-red-700" dir="ltr">+{formatCurrency(currentDriver.walletBalance)}</span>
                </div>
              ) : currentDriver.walletBalance < 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 p-2 sm:p-2.5 rounded-xl text-center flex-1 sm:min-w-[110px]">
                  <span className="text-[10px] text-emerald-700 font-bold block">مستحقات له (-)</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-800" dir="ltr">{formatCurrency(currentDriver.walletBalance)}</span>
                </div>
              ) : (
                <div className="bg-slate-100 border border-slate-200 p-2 sm:p-2.5 rounded-xl text-center flex-1 sm:min-w-[110px]">
                  <span className="text-[10px] text-slate-500 font-semibold block">المحفظة</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-700">0.00 ج.م (خالص)</span>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 p-2 sm:p-2.5 rounded-xl text-center flex-1 sm:min-w-[90px]">
                <span className="text-[10px] text-amber-700 font-semibold block">مدة التوقف</span>
                <span className="text-xs sm:text-sm font-bold text-amber-800">{currentDriver.daysInactive} أيام</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Preview */}
        <div className="p-3.5 sm:p-5 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">
              نوع الرسالة: {
                messageType === 'critical' ? '🚨 إنذار حرج (توقف + مديونية عليه)' : 
                messageType === 'credit' ? '💰 إشعار مستحقات المندوب (فلوس له طرف الشركة)' :
                messageType === 'high_debt' ? '🔴 طلب توريد المديونية (مديونية مسجلة عليه)' : 
                '🟡 استفسار عن الغياب وموقف المحفظة'
              }
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 text-xs font-sans text-slate-800 whitespace-pre-wrap leading-relaxed">
            {messageText}
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-40"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">السابق</span>
            </button>

            <button
              onClick={handleSkip}
              disabled={currentIndex >= drivers.length - 1}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-40"
            >
              <span>تخطي</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleSendAndNext}
            className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>إرسال واتساب {currentIndex < drivers.length - 1 ? 'والتالي' : ''}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
