import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  RotateCcw
} from 'lucide-react';
import { DriverRecord, MessageTemplates } from '../types';
import { buildMessage, openWhatsAppChat } from '../utils/whatsapp';
import { formatCurrency, getCleanDriverName } from '../utils/parser';

interface MessageModalProps {
  driver: DriverRecord | null;
  messageType: 'high_debt' | 'inactive' | 'critical';
  templates: MessageTemplates;
  isOpen: boolean;
  onClose: () => void;
  onMarkSent: (driverCode: string) => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({
  driver,
  messageType,
  templates,
  isOpen,
  onClose,
  onMarkSent,
}) => {
  const [currentText, setCurrentText] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedType, setSelectedType] = useState<'high_debt' | 'inactive' | 'critical'>(messageType);

  useEffect(() => {
    setSelectedType(messageType);
  }, [messageType]);

  useEffect(() => {
    if (driver) {
      setCurrentText(buildMessage(driver, selectedType, templates));
    }
  }, [driver, selectedType, templates]);

  if (!isOpen || !driver) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    openWhatsAppChat(driver.normalizedPhone, currentText);
    onMarkSent(driver.driverCode);
    onClose();
  };

  const handleResetToDefault = () => {
    setCurrentText(buildMessage(driver, selectedType, templates));
  };

  const cleanName = getCleanDriverName(driver.driverName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in fade-in zoom-in duration-150"
      >
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">تجهيز وإرسال رسالة واتساب</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">إرسال مباشر إلى الكابتن عبر الواتساب</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Driver Quick Badge */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 text-sm">{cleanName}</span>
            <span className="font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
              كود: {driver.driverCode}
            </span>
            <span className="text-slate-600 font-mono text-[11px]" dir="ltr">{driver.phone}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-md font-bold border border-red-200 text-[11px]">
              {formatCurrency(driver.walletBalance)}
            </span>
            <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-bold border border-amber-200 text-[11px]">
              توقف: {driver.daysInactive} أيام
            </span>
          </div>
        </div>

        {/* Message Type Selector */}
        <div className="px-4 sm:px-6 pt-2.5 pb-1 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
          <button
            onClick={() => setSelectedType('high_debt')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === 'high_debt'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            طلب توريد المحفظة
          </button>
          <button
            onClick={() => setSelectedType('inactive')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === 'inactive'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            استفسار الغياب + التوريد
          </button>
          <button
            onClick={() => setSelectedType('critical')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === 'critical'
                ? 'bg-purple-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            إنذار حرج وعاجل
          </button>

          <button
            onClick={handleResetToDefault}
            className="mr-auto text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 whitespace-nowrap"
            title="إعادة ضبط النص للقالب الافتراضي"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">إعادة النص الأصلي</span>
          </button>
        </div>

        {/* Message Textarea */}
        <div className="px-4 sm:px-6 py-2.5 flex-1 flex flex-col min-h-0">
          <label className="text-[11px] sm:text-xs font-semibold text-slate-700 mb-1 block">
            نص الرسالة المرسلة (يمكنك تعديل أي تفاصيل قبل الإرسال):
          </label>
          <textarea
            rows={7}
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            className="w-full flex-1 p-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 leading-relaxed font-sans resize-none"
          />
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl"
            >
              إلغاء
            </button>
            <button
              onClick={handleSend}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>إرسال واتساب</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
