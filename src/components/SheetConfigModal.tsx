import React, { useState } from 'react';
import { X, FileSpreadsheet, Check, AlertCircle, ExternalLink, Link, Layers, RefreshCw } from 'lucide-react';

interface SheetConfigModalProps {
  currentSheetId: string;
  currentGid?: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveSheetConfig: (sheetId: string, gid: string) => void;
  onRefreshNow?: () => void;
}

export function extractSheetConfig(input: string): { sheetId: string; gid: string } {
  const trimmed = input.trim();
  let sheetId = trimmed;
  let gid = '0';

  // Extract /spreadsheets/d/<ID>
  const matchId = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (matchId && matchId[1]) {
    sheetId = matchId[1];
  }

  // Extract gid from #gid=... or ?gid=... or &gid=...
  const matchGid = trimmed.match(/[#?&]gid=([0-9]+)/);
  if (matchGid && matchGid[1]) {
    gid = matchGid[1];
  }

  return { sheetId, gid };
}

export const SheetConfigModal: React.FC<SheetConfigModalProps> = ({
  currentSheetId,
  currentGid = '0',
  isOpen,
  onClose,
  onSaveSheetConfig,
  onRefreshNow,
}) => {
  const [inputVal, setInputVal] = useState(
    currentGid && currentGid !== '0'
      ? `https://docs.google.com/spreadsheets/d/${currentSheetId}/edit#gid=${currentGid}`
      : currentSheetId
  );
  const [gidVal, setGidVal] = useState(currentGid);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    const extracted = extractSheetConfig(inputVal);
    if (!extracted.sheetId) {
      setError('يرجى إدخال رابط أو معرف Google Sheets صالح');
      return;
    }
    const finalGid = gidVal !== currentGid && gidVal ? gidVal : extracted.gid;
    setError('');
    onSaveSheetConfig(extracted.sheetId, finalGid || '0');
    onClose();
  };

  const handleUseDefault = () => {
    const defaultId = '1OkLAv21jl36iQQO_x9EeWq0sSLYtPFt1VCgtgC8CUBA';
    setInputVal(defaultId);
    setGidVal('0');
    onSaveSheetConfig(defaultId, '0');
    onClose();
  };

  const currentParsed = extractSheetConfig(inputVal);
  const currentGoogleUrl = `https://docs.google.com/spreadsheets/d/${currentParsed.sheetId || currentSheetId}/edit#gid=${gidVal || currentParsed.gid || '0'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">إعدادات وتحديث رابط Google Sheets</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">توصيل الشيت وجلب البيانات المحدثة فوراً</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              رابط الشيت بالكامل أو معرف الجدول (Spreadsheet Link):
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  const parsed = extractSheetConfig(e.target.value);
                  if (parsed.gid) {
                    setGidVal(parsed.gid);
                  }
                  setError('');
                }}
                className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-mono text-slate-900"
              />
              <Link className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {error && (
              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Tab GID (Optional) */}
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <Layers className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="flex-1">
              <span className="text-[11px] font-bold text-slate-700 block">رقم ورقة العمل (Tab GID):</span>
              <span className="text-[10px] text-slate-400">يتم استخراجه تلقائياً من الرابط (الافتراضي: 0 للورقة الأولى)</span>
            </div>
            <input
              type="text"
              value={gidVal}
              onChange={(e) => setGidVal(e.target.value)}
              className="w-24 px-2 py-1 text-center font-mono text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800"
              placeholder="0"
            />
          </div>

          {/* Direct verification link */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            <p className="font-bold mb-1">🔍 التحقق من الملف المربوط:</p>
            <p className="mb-2">
              إذا قمت بإنشاء ملف جديد لتاريخ اليوم أو جدول منفصل في درايف، تأكد من نسخه ووضعه في الحقل أعلاه. يمكنك الضغط أدناه للتأكد من الشيت المفتوح حالياً:
            </p>
            <a
              href={currentGoogleUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950 underline bg-white/80 px-2.5 py-1 rounded-lg border border-amber-300"
            >
              <span>فتح الشيت في Google Sheets في تبويب جديد</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleUseDefault}
              className="text-emerald-700 hover:underline font-medium"
            >
              استعادة الشيت الافتراضي للشركة
            </button>

            {onRefreshNow && (
              <button
                type="button"
                onClick={() => {
                  onRefreshNow();
                  onClose();
                }}
                className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة سحب البيانات الآن</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>حفظ وسحب البيانات فوراً</span>
          </button>
        </div>

      </div>
    </div>
  );
};
