import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RotateCcw, 
  Sliders, 
  ChevronDown,
  Layers,
  MapPin,
  UserCheck,
  ChevronUp
} from 'lucide-react';
import { FilterSettings, ActiveTab } from '../types';

interface FilterBarProps {
  settings: FilterSettings;
  onUpdateSettings: (newSettings: Partial<FilterSettings>) => void;
  onResetFilters: () => void;
  onExportCSV: () => void;
  activeTab: ActiveTab;
  areas: string[];
  supervisors: string[];
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  settings,
  onUpdateSettings,
  onResetFilters,
  onExportCSV,
  activeTab,
  areas,
  supervisors,
  filteredCount,
  totalCount,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 mb-4 sm:mb-6 shadow-xs">
      
      {/* Top Row: Search & Quick Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم، كود المندوب، أو رقم التليفون..."
            value={settings.searchQuery}
            onChange={(e) => onUpdateSettings({ searchQuery: e.target.value })}
            className="w-full pl-8 pr-10 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
          {settings.searchQuery && (
            <button
              onClick={() => onUpdateSettings({ searchQuery: '' })}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>

        {/* Dropdowns & Toggle Row on Mobile */}
        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
          {/* Areas Dropdown */}
          {areas.length > 0 && (
            <div className="relative flex-1 sm:flex-initial sm:min-w-[140px]">
              <select
                value={settings.selectedArea}
                onChange={(e) => onUpdateSettings({ selectedArea: e.target.value })}
                className="w-full appearance-none pl-7 pr-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 text-slate-700 cursor-pointer"
              >
                <option value="">جميع المناطق ({areas.length})</option>
                {areas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Supervisors Dropdown */}
          {supervisors.length > 0 && (
            <div className="relative flex-1 sm:flex-initial sm:min-w-[150px]">
              <select
                value={settings.selectedSupervisor}
                onChange={(e) => onUpdateSettings({ selectedSupervisor: e.target.value })}
                className="w-full appearance-none pl-7 pr-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 text-slate-700 cursor-pointer"
              >
                <option value="">المشرفين ({supervisors.length})</option>
                {supervisors.map((sup) => (
                  <option key={sup} value={sup}>{sup}</option>
                ))}
              </select>
              <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Toggle Advanced Filters on Mobile */}
          <button
            onClick={() => setShowAdvanced(prev => !prev)}
            className="sm:hidden inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>حدود التصفية</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Export Button */}
          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="تصدير النتائج المعروضة إلى ملف CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">تصدير CSV</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={onResetFilters}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="إعادة تعيين الفلاتر"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Bottom Row: Dynamic Sliders & Presets based on Active Tab */}
      <div className={`pt-2.5 border-t border-slate-100 flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-2.5 text-xs ${
        showAdvanced ? 'flex' : 'hidden sm:flex'
      }`}>
        
        {/* Debt Threshold Filter */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="font-semibold text-slate-700 shrink-0">حد المديونية:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg overflow-x-auto max-w-full">
            {[500, 1000, 2000, 3000].map((val) => (
              <button
                key={val}
                onClick={() => onUpdateSettings({ debtThreshold: val })}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                  settings.debtThreshold === val
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {val} ج.م
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              step="100"
              value={settings.debtThreshold}
              onChange={(e) => onUpdateSettings({ debtThreshold: Number(e.target.value) || 0 })}
              className="w-16 px-1.5 py-1 text-center font-bold bg-slate-50 border border-slate-300 rounded-md text-red-600 text-xs"
            />
            <span className="text-slate-500 text-[11px]">ج.م</span>
          </div>
        </div>

        {/* Days Inactive Filter */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="font-semibold text-slate-700 shrink-0">حد أيام التوقف:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg overflow-x-auto max-w-full">
            {[1, 2, 3, 5, 10].map((days) => (
              <button
                key={days}
                onClick={() => onUpdateSettings({ inactiveDaysThreshold: days })}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                  settings.inactiveDaysThreshold === days
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {days}+ {days === 1 ? 'يوم' : days === 2 ? 'يومان' : 'أيام'}
              </button>
            ))}
          </div>
        </div>

        {/* Filtered count badge */}
        <div className="text-slate-500 font-medium text-[11px] w-full sm:w-auto text-left sm:text-right pt-1 sm:pt-0">
          يظهر <span className="font-bold text-slate-900">{filteredCount}</span> من <span className="font-bold">{totalCount}</span> مندوب
        </div>

      </div>

    </div>
  );
};
