import React, { useState } from 'react';
import { X, Settings, Check, RotateCcw, MessageSquare, Sliders, Shield } from 'lucide-react';
import { MessageTemplates, FilterSettings } from '../types';
import { DEFAULT_TEMPLATES } from '../utils/whatsapp';

interface SettingsModalProps {
  templates: MessageTemplates;
  settings: FilterSettings;
  isOpen: boolean;
  onClose: () => void;
  onSaveTemplates: (newTemplates: MessageTemplates) => void;
  onSaveSettings: (newSettings: Partial<FilterSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  templates,
  settings,
  isOpen,
  onClose,
  onSaveTemplates,
  onSaveSettings,
}) => {
  const [tempTemplates, setTempTemplates] = useState<MessageTemplates>({ ...templates });
  const [activeSubTab, setActiveSubTab] = useState<'templates' | 'thresholds'>('templates');

  if (!isOpen) return null;

  const handleResetTemplates = () => {
    setTempTemplates({ ...DEFAULT_TEMPLATES });
  };

  const handleSave = () => {
    onSaveTemplates(tempTemplates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">إعدادات النظام وقوالب الرسائل</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">تخصيص نصوص رسائل الواتساب وقواعد الفلترة</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="px-4 sm:px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-4 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveSubTab('templates')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'templates'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>نصوص رسائل الواتساب</span>
          </button>

          <button
            onClick={() => setActiveSubTab('thresholds')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'thresholds'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>بيانات المشرف والشركة</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          
          {activeSubTab === 'templates' ? (
            <>
              {/* Template 1: High Debt (Positive Balance = Debt on Driver) */}
              <div>
                <label className="text-xs font-bold text-red-700 flex items-center justify-between mb-1">
                  <span>1. قالب رسالة مديونية المحفظة (رصيد موجب - مديونية على المندوب مطلوب توريدها):</span>
                  <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">موجب (+)</span>
                </label>
                <textarea
                  rows={4}
                  value={tempTemplates.highDebtTemplate}
                  onChange={(e) => setTempTemplates({ ...tempTemplates, highDebtTemplate: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-red-500 text-slate-900 font-sans leading-relaxed"
                />
              </div>

              {/* Template 2: Credit (Negative Balance = Money for Driver) */}
              <div>
                <label className="text-xs font-bold text-emerald-700 flex items-center justify-between mb-1">
                  <span>2. قالب رسالة مستحقات المندوب (رصيد سالب - فلوس للمندوب طرف الشركة):</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">سالب (-)</span>
                </label>
                <textarea
                  rows={4}
                  value={tempTemplates.creditTemplate || DEFAULT_TEMPLATES.creditTemplate}
                  onChange={(e) => setTempTemplates({ ...tempTemplates, creditTemplate: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 text-slate-900 font-sans leading-relaxed"
                />
              </div>

              {/* Template 3: Inactive Drivers */}
              <div>
                <label className="text-xs font-bold text-amber-800 flex items-center justify-between mb-1">
                  <span>3. قالب رسالة المناديب المتوقفين (الاستفسار عن الغياب + موقف المحفظة):</span>
                  <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">متوقف</span>
                </label>
                <textarea
                  rows={4}
                  value={tempTemplates.inactiveTemplate}
                  onChange={(e) => setTempTemplates({ ...tempTemplates, inactiveTemplate: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 text-slate-900 font-sans leading-relaxed"
                />
              </div>

              {/* Template 4: Critical */}
              <div>
                <label className="text-xs font-bold text-purple-800 flex items-center justify-between mb-1">
                  <span>4. قالب رسالة الحالات الحرجة (متوقف + مديونية كبيرة):</span>
                  <span className="text-[10px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200">حرج</span>
                </label>
                <textarea
                  rows={4}
                  value={tempTemplates.criticalTemplate}
                  onChange={(e) => setTempTemplates({ ...tempTemplates, criticalTemplate: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-purple-500 text-slate-900 font-sans leading-relaxed"
                />
              </div>

              {/* Tags Helper */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                <p className="font-bold text-slate-800 mb-1">المتغيرات التلقائية المتاحة داخل النصوص:</p>
                <div className="flex flex-wrap gap-1.5 font-mono text-emerald-800">
                  <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">{"{اسم_المندوب}"}</span>
                  <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">{"{كود_المندوب}"}</span>
                  <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded" title="يظهر معه توضيح (مديونية عليك / مستحقات لك)">{"{رصيد_المحفظة}"}</span>
                  <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">{"{نوع_الرصيد}"}</span>
                  <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">{"{مطلوب_المحفظة}"}</span>
                  <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">{"{عدد_الايام}"}</span>
                  <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">{"{تاريخ_المعاملة}"}</span>
                  <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">{"{المشرف}"}</span>
                  <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">{"{الشركة}"}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  اسم المشرف الافتراضي (المرسل):
                </label>
                <input
                  type="text"
                  value={tempTemplates.supervisorName}
                  onChange={(e) => setTempTemplates({ ...tempTemplates, supervisorName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  اسم الشركة / الإدارة:
                </label>
                <input
                  type="text"
                  value={tempTemplates.companyName}
                  onChange={(e) => setTempTemplates({ ...tempTemplates, companyName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={handleResetTemplates}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة القوالب الافتراضية</span>
          </button>

          <div className="flex items-center gap-2">
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
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
