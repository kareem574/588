import React, { useState } from 'react';
import { X, FileSpreadsheet, Check, AlertCircle, ExternalLink, Link } from 'lucide-react';

interface SheetConfigModalProps {
  currentSheetId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveSheetId: (newSheetId: string) => void;
}

export const SheetConfigModal: React.FC<SheetConfigModalProps> = ({
  currentSheetId,
  isOpen,
  onClose,
  onSaveSheetId,
}) => {
  const [inputVal, setInputVal] = useState(currentSheetId);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const extractSheetId = (input: string): string => {
    const trimmed = input.trim();
    // If it's a full Google Docs URL: https://docs.google.com/spreadsheets/d/1OkLAv21jl36iQQO_x9EeWq0sSLYtPFt1VCgtgC8CUBA/edit...
    const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      return match[1];
    }
    // If it's just the ID
    return trimmed;
  };

  const handleSave = () => {
    const extracted = extractSheetId(inputVal);
    if (!extracted) {
      setError('يرجى إدخال رابط أو معرف Google Sheets صالح');
      return;
    }
    setError('');
    onSaveSheetId(extracted);
    onClose();
  };

  const handleUseDefault = () => {
    const defaultId = '1OkLAv21jl36iQQO_x9EeWq0sSLYtPFt1VCgtgC8CUBA';
    setInputVal(defaultId);
    onSaveSheetId(defaultId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">إعدادات رابط Google Sheets</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">ربط وتحديث مصدر بيانات المناديب</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <label className="text-xs font-bold text-slate-700 block mb-2">
            رابط الشيت أو معرف الجدول (Spreadsheet ID):
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setError('');
              }}
              className="w-full pl-4 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-mono text-slate-900"
            />
            <Link className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {error && (
            <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </p>
          )}

          <div className="mt-4 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
            <p className="font-bold mb-1">💡 ملاحظة هامة لربط الشيت:</p>
            <p>
              تأكد من أن ملف الشيت مشارك بوضع <span className="font-semibold">"أي شخص لديه الرابط يمكنه المشاهدة" (Anyone with the link can view)</span> أو مسجل الدخول بحساب جوجل المالك للشيت.
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleUseDefault}
              className="text-emerald-700 hover:underline font-medium"
            >
              استعادة الشيت الأصلي (مجموعة العز)
            </button>

            <a
              href={`https://docs.google.com/spreadsheets/d/${extractSheetId(inputVal)}/edit`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <span>فتح الشيت في نافذة جديدة</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>حفظ وتحميل البيانات</span>
          </button>
        </div>

      </div>
    </div>
  );
};
