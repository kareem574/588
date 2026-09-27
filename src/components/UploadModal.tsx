import React, { useRef, useState } from 'react';
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (csvText: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasteText, setPasteText] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onDataLoaded(content);
        onClose();
      }
    };
    reader.onerror = () => {
      setError('حدث خطأ أثناء قراءة الملف.');
    };
    reader.readAsText(file);
  };

  const handleApplyPasted = () => {
    if (!pasteText.trim()) {
      setError('يرجى لصق بيانات CSV أو نص مفصول بفواصل');
      return;
    }
    onDataLoaded(pasteText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">رفع ملف أو لصق بيانات يدوياً</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">استيراد بيانات المناديب والمحافظ من ملف محلي</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          
          {/* File input box */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/20"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".csv,.txt" 
              className="hidden" 
            />
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">انقر هنا لاختيار ملف CSV من جهازك</p>
            <p className="text-[11px] text-slate-500 mt-1">يدعم ملفات CSV أو الملفات النصية المفصولة بفواصل</p>
          </div>

          <div className="relative text-center my-3">
            <span className="bg-white px-2 text-xs text-slate-400 font-medium">أو الصق النص مباشرة</span>
            <div className="absolute inset-x-0 top-1/2 -z-10 border-t border-slate-200"></div>
          </div>

          <div>
            <textarea
              rows={4}
              placeholder="الصق أسطر CSV هنا مباشرة..."
              value={pasteText}
              onChange={(e) => {
                setPasteText(e.target.value);
                setError('');
              }}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-indigo-500 font-mono text-slate-800"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </p>
          )}

        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl"
          >
            إلغاء
          </button>
          <button
            onClick={handleApplyPasted}
            disabled={!pasteText.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-40 transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>تطبيق البيانات</span>
          </button>
        </div>

      </div>
    </div>
  );
};
