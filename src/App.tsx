import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  Sidebar 
} from './components/Sidebar';
import { 
  StatsCards 
} from './components/StatsCards';
import { 
  FilterBar 
} from './components/FilterBar';
import { 
  DriverTable 
} from './components/DriverTable';
import { 
  MessageModal 
} from './components/MessageModal';
import { 
  BatchQueueModal 
} from './components/BatchQueueModal';
import { 
  SheetConfigModal 
} from './components/SheetConfigModal';
import { 
  SettingsModal 
} from './components/SettingsModal';
import { 
  UploadModal 
} from './components/UploadModal';
import { 
  DriverRecord, 
  FilterSettings, 
  MessageTemplates, 
  ActiveTab 
} from './types';
import { 
  parseDriversData, 
  formatCurrency, 
  getCleanDriverName 
} from './utils/parser';
import { 
  DEFAULT_TEMPLATES 
} from './utils/whatsapp';
import { 
  AlertTriangle, 
  Clock, 
  Wallet, 
  RefreshCw, 
  Layers, 
  Flame, 
  CheckCircle,
  FileSpreadsheet,
  Download,
  MessageSquareShare,
  SlidersHorizontal,
  Menu
} from 'lucide-react';

const DEFAULT_SHEET_ID = '1OkLAv21jl36iQQO_x9EeWq0sSLYtPFt1VCgtgC8CUBA';

const DEFAULT_FILTER_SETTINGS: FilterSettings = {
  debtThreshold: 1000,
  inactiveDaysThreshold: 3,
  debtCalculationMode: 'all_nonzero',
  selectedZone: '',
  selectedArea: '',
  selectedSupervisor: '',
  searchQuery: '',
  statusFilter: '',
};

export default function App() {
  // 1. Data State
  const [sheetId, setSheetId] = useState<string>(() => {
    return localStorage.getItem('el_ezz_sheet_id') || DEFAULT_SHEET_ID;
  });
  const [rawCSV, setRawCSV] = useState<string>('');
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Settings & Templates State
  const [settings, setSettings] = useState<FilterSettings>(() => {
    try {
      const saved = localStorage.getItem('el_ezz_filter_settings');
      return saved ? { ...DEFAULT_FILTER_SETTINGS, ...JSON.parse(saved) } : DEFAULT_FILTER_SETTINGS;
    } catch {
      return DEFAULT_FILTER_SETTINGS;
    }
  });

  const [templates, setTemplates] = useState<MessageTemplates>(() => {
    try {
      const saved = localStorage.getItem('el_ezz_message_templates');
      return saved ? { ...DEFAULT_TEMPLATES, ...JSON.parse(saved) } : DEFAULT_TEMPLATES;
    } catch {
      return DEFAULT_TEMPLATES;
    }
  });

  const [savedStatuses, setSavedStatuses] = useState<Record<string, { status: DriverRecord['status']; notes?: string; lastContactedAt?: string }>>(() => {
    try {
      const saved = localStorage.getItem('el_ezz_driver_statuses');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // 3. UI Navigation & Modals State
  const [activeTab, setActiveTab] = useState<ActiveTab>('high_debt');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDriverForMessage, setSelectedDriverForMessage] = useState<DriverRecord | null>(null);
  const [messageTypeForModal, setMessageTypeForModal] = useState<'high_debt' | 'inactive' | 'critical'>('high_debt');
  
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isBatchQueueOpen, setIsBatchQueueOpen] = useState(false);
  const [isSheetConfigOpen, setIsSheetConfigOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('el_ezz_filter_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('el_ezz_message_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('el_ezz_driver_statuses', JSON.stringify(savedStatuses));
  }, [savedStatuses]);

  useEffect(() => {
    localStorage.setItem('el_ezz_sheet_id', sheetId);
  }, [sheetId]);

  // Fetch Sheet Data with robust multi-strategy fetching (Google Sheets Direct + Proxy + Fallbacks)
  const fetchSheetData = useCallback(async (targetSheetId = sheetId) => {
    setIsLoading(true);
    setError(null);

    let csvText = '';
    let loadSuccess = false;
    let errorDetails = '';

    // Strategy 1: Direct fetch from Google Sheets GViz CSV (CORS-enabled by Google, works everywhere including Vercel and mobile browser)
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${targetSheetId}/gviz/tq?tqx=out:csv`;
      const res = await fetch(gvizUrl, {
        method: 'GET',
        headers: { Accept: 'text/csv,text/plain,*/*' },
      });

      if (res.ok) {
        const text = await res.text();
        if (text && (text.includes('المندوب') || text.includes('كود') || text.includes('الزون') || text.includes(','))) {
          csvText = text;
          loadSuccess = true;
        }
      }
    } catch (e: any) {
      console.warn('Direct Google GViz fetch failed, trying proxy...', e);
      errorDetails = e?.message || '';
    }

    // Strategy 2: Try local / Vercel API proxy endpoint (/api/sheet-data)
    if (!loadSuccess) {
      try {
        const res = await fetch(`/api/sheet-data?sheetId=${encodeURIComponent(targetSheetId)}`);
        const contentType = res.headers.get('content-type') || '';
        
        // Ensure the response is actual JSON before attempting parse (prevents "Unexpected token T" on HTML 404s)
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok && data.success) {
            if (data.source === 'csv_export' && data.csv) {
              csvText = data.csv;
              loadSuccess = true;
            } else if (data.source === 'oauth_api' && Array.isArray(data.values)) {
              csvText = data.values
                .map((row: any[]) =>
                  row
                    .map((cell: any) => {
                      const s = String(cell ?? '');
                      return s.includes(',') || s.includes('"') || s.includes('\n')
                        ? `"${s.replace(/"/g, '""')}"`
                        : s;
                    })
                    .join(',')
                )
                .join('\n');
              loadSuccess = true;
            }
          } else if (data.error) {
            errorDetails = data.error;
          }
        }
      } catch (err: any) {
        console.warn('API proxy fetch failed:', err);
        if (!errorDetails) errorDetails = err?.message || '';
      }
    }

    // Strategy 3: Direct export link
    if (!loadSuccess) {
      try {
        const exportUrl = `https://docs.google.com/spreadsheets/d/${targetSheetId}/export?format=csv`;
        const res = await fetch(exportUrl);
        if (res.ok) {
          const text = await res.text();
          if (text && !text.trim().startsWith('<!DOCTYPE html') && !text.trim().startsWith('<html')) {
            csvText = text;
            loadSuccess = true;
          }
        }
      } catch (e: any) {
        console.warn('Direct export link fetch failed:', e);
      }
    }

    // Strategy 4: Fallback via public CORS gateway
    if (!loadSuccess) {
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://docs.google.com/spreadsheets/d/${targetSheetId}/export?format=csv`)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const text = await res.text();
          if (text && !text.trim().startsWith('<') && text.length > 30) {
            csvText = text;
            loadSuccess = true;
          }
        }
      } catch (e: any) {
        console.warn('CORS gateway fetch failed:', e);
      }
    }

    if (loadSuccess && csvText) {
      setRawCSV(csvText);
      const parsedDrivers = parseDriversData(csvText, settings, savedStatuses);
      setDrivers(parsedDrivers);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setError(errorDetails || 'تعذر جلب بيانات الشيت تلقائياً. تأكد من إمكانية الوصول إلى جدول Google Sheets أو استخدم زر رفع ملف يدوياً.');
    }
  }, [sheetId, settings, savedStatuses]);

  // Initial load
  useEffect(() => {
    fetchSheetData();
  }, []);

  // Update drivers if filters/statuses change without re-fetching CSV
  useEffect(() => {
    if (rawCSV) {
      const parsed = parseDriversData(rawCSV, settings, savedStatuses);
      setDrivers(parsed);
    }
  }, [settings.debtThreshold, settings.inactiveDaysThreshold, settings.debtCalculationMode, savedStatuses]);

  // Distinct areas & supervisors for dropdown filters
  const distinctAreas = useMemo(() => {
    const set = new Set<string>();
    drivers.forEach(d => {
      if (d.area) set.add(d.area);
    });
    return Array.from(set).sort();
  }, [drivers]);

  const distinctSupervisors = useMemo(() => {
    const set = new Set<string>();
    drivers.forEach(d => {
      if (d.supervisor) set.add(d.supervisor);
    });
    return Array.from(set).sort();
  }, [drivers]);

  // Pull date from raw data
  const pullDate = useMemo(() => {
    if (drivers.length > 0 && drivers[0].pullDate) {
      return drivers[0].pullDate;
    }
    return '';
  }, [drivers]);

  // Filtered drivers based on active tab and search/filter inputs
  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      // 1. Tab filter
      if (activeTab === 'high_debt' && !driver.isHighDebt) return false;
      if (activeTab === 'inactive' && !driver.isInactive) return false;
      if (activeTab === 'critical' && !driver.isCritical) return false;
      
      // 2. Search query (name, code, phone)
      if (settings.searchQuery.trim()) {
        const query = settings.searchQuery.toLowerCase().trim();
        const matchesName = driver.driverName.toLowerCase().includes(query);
        const matchesCode = driver.driverCode.toLowerCase().includes(query);
        const matchesPhone = driver.phone.includes(query) || driver.normalizedPhone.includes(query);
        if (!matchesName && !matchesCode && !matchesPhone) return false;
      }

      // 3. Area filter
      if (settings.selectedArea && driver.area !== settings.selectedArea) {
        return false;
      }

      // 4. Supervisor filter
      if (settings.selectedSupervisor && driver.supervisor !== settings.selectedSupervisor) {
        return false;
      }

      // 5. Contact Status Filter
      if (settings.statusFilter) {
        if (settings.statusFilter === 'sent' && !(driver.status.startsWith('sent_') || driver.status === 'resolved')) {
          return false;
        }
        if (settings.statusFilter === 'pending' && (driver.status.startsWith('sent_') || driver.status === 'resolved')) {
          return false;
        }
      }

      return true;
    });
  }, [drivers, activeTab, settings]);

  // Action handlers
  const handleToggleStatus = (driverCode: string, newStatus: DriverRecord['status']) => {
    setSavedStatuses(prev => ({
      ...prev,
      [driverCode]: {
        ...(prev[driverCode] || {}),
        status: newStatus,
        lastContactedAt: newStatus !== 'pending' ? new Date().toISOString() : undefined,
      }
    }));
  };

  const handleOpenMessageModal = (driver: DriverRecord, type: 'high_debt' | 'inactive' | 'critical') => {
    setSelectedDriverForMessage(driver);
    setMessageTypeForModal(type);
    setIsMessageModalOpen(true);
  };

  const handleMarkSent = (driverCode: string, type?: 'high_debt' | 'inactive' | 'critical') => {
    const nextStatus = type === 'high_debt' ? 'sent_debt' : 
                       type === 'inactive' ? 'sent_inactive' : 'sent_both';
    handleToggleStatus(driverCode, nextStatus);
  };

  // Export filtered drivers to CSV
  const handleExportCSV = () => {
    if (filteredDrivers.length === 0) return;

    const headers = [
      'كود المندوب',
      'اسم المندوب',
      'رقم التليفون',
      'المنطقة',
      'الزون',
      'المشرف',
      'رصيد المحفظة',
      'عدد أيام التوقف',
      'تاريخ آخر معاملة',
      'حالة التواصل'
    ];

    const rows = filteredDrivers.map(d => [
      `"${d.driverCode}"`,
      `"${d.driverName}"`,
      `"${d.phone}"`,
      `"${d.area}"`,
      `"${d.zone}"`,
      `"${d.supervisor}"`,
      d.walletBalance,
      d.daysInactive,
      `"${d.lastTransactionDate}"`,
      `"${d.status}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `كباتن_العز_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Tajawal',sans-serif]">
      {/* 1. App Top Header */}
      <Header
        sheetId={sheetId}
        pullDate={pullDate}
        totalDrivers={drivers.length}
        isLoading={isLoading}
        onRefresh={() => fetchSheetData(sheetId)}
        onChangeSheetClick={() => setIsSheetConfigOpen(true)}
        onUploadClick={() => setIsUploadOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onStartBatchQueue={() => setIsBatchQueueOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* Main Layout Body: Sidebar + Content Area */}
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 lg:px-8 py-4 sm:py-6 flex flex-col lg:flex-row gap-5 flex-1">
        
        {/* Responsive Drawer / Desktop Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          drivers={drivers}
          settings={settings}
          sheetId={sheetId}
          pullDate={pullDate}
          isLoading={isLoading}
          onRefresh={() => fetchSheetData(sheetId)}
          onChangeSheetClick={() => setIsSheetConfigOpen(true)}
          onUploadClick={() => setIsUploadOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onStartBatchQueue={() => setIsBatchQueueOpen(true)}
        />

        {/* Center / Main Content Column */}
        <main className="flex-1 min-w-0">
          
          {/* Error Notice */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-900 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">تعذر سحب البيانات تلقائياً من Google Sheets</h4>
                  <p className="text-xs text-red-700 mt-0.5">{error}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchSheetData(sheetId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة المحاولة</span>
                </button>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  رفع ملف يدوي
                </button>
              </div>
            </div>
          )}

          {/* 2. Executive KPI Cards */}
          <StatsCards
            drivers={drivers}
            settings={settings}
            onSelectTab={setActiveTab}
          />

          {/* 3. Section Banner / Explanation of Active Tab */}
          <div className="mb-4 bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                activeTab === 'high_debt' ? 'bg-red-600' :
                activeTab === 'inactive' ? 'bg-amber-600' :
                activeTab === 'critical' ? 'bg-purple-700' :
                activeTab === 'overview' ? 'bg-slate-800' : 'bg-emerald-600'
              }`}>
                {activeTab === 'high_debt' && <Wallet className="w-5 h-5" />}
                {activeTab === 'inactive' && <Clock className="w-5 h-5" />}
                {activeTab === 'critical' && <Flame className="w-5 h-5" />}
                {activeTab === 'overview' && <Layers className="w-5 h-5" />}
                {activeTab === 'all_drivers' && <CheckCircle className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {activeTab === 'high_debt' && '🔴 مديونيات المحافظ المرتفعة (رسائل طلب التوريد)'}
                  {activeTab === 'inactive' && '🟡 المناديب المتوقفين عن العمل (رسائل مدة التوقف وتوريد المحفظة ومعرفة سبب الغياب)'}
                  {activeTab === 'critical' && '🚨 الحالات الحرجة المشتركة (توقف طويل + مديونية كبيرة)'}
                  {activeTab === 'overview' && '📊 لوحة التحليلات وخطة العمل اليومية'}
                  {activeTab === 'all_drivers' && '📋 جميع مناديب الشيت (سجل المتابعة الشامل)'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {activeTab === 'high_debt' && 'المناديب الذين تجاوزت محفظتهم الحد المحدد - إرسال رسالة واتساب بنقرة واحدة لتوريد الكاش.'}
                  {activeTab === 'inactive' && 'المناديب الذين لم يسجلوا حركة منذ عدة أيام - ترسل الرسالة عدد الأيام بدقة وتطلب التوريد وتوضح سبب التوقف.'}
                  {activeTab === 'critical' && 'المناديب ذوو المخاطر العالية: متوقفون عن العمل مع وجود مبالغ معلقة بالمحفظة.'}
                  {activeTab === 'overview' && 'ملخص تنفيذي للمحفظة وتوزيع المناديب ومعدلات التوريد.'}
                  {activeTab === 'all_drivers' && 'استعراض وبحث وفلترة لكل الكباتن المسجلين في الشيت مع إمكانية التصدير.'}
                </p>
              </div>
            </div>

            {/* Quick Batch Sender Queue Trigger */}
            {filteredDrivers.length > 0 && activeTab !== 'overview' && (
              <button
                onClick={() => setIsBatchQueueOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all shrink-0"
              >
                <MessageSquareShare className="w-4 h-4" />
                <span>بدء المراسلة ({filteredDrivers.length} كابتن)</span>
              </button>
            )}
          </div>

          {/* 4. Filters Bar */}
          {activeTab !== 'overview' && (
            <FilterBar
              settings={settings}
              onUpdateSettings={(newVals) => setSettings(prev => ({ ...prev, ...newVals }))}
              onResetFilters={() => setSettings(DEFAULT_FILTER_SETTINGS)}
              onExportCSV={handleExportCSV}
              activeTab={activeTab}
              areas={distinctAreas}
              supervisors={distinctSupervisors}
              filteredCount={filteredDrivers.length}
              totalCount={drivers.length}
            />
          )}

          {/* 5. Main Content Area */}
          {isLoading && drivers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">جاري قراءة وتحليل بيانات الشيت من Google...</h3>
              <p className="text-xs text-slate-500 mt-1">يتم الآن تصنيف المديونيات وحساب أيام التوقف وتجهيز قوالب الواتساب.</p>
            </div>
          ) : activeTab === 'overview' ? (
            /* Overview Analytic Dashboard */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Box 1: Inactivity Breakdown */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>توزيع أيام التوقف عن العمل (الغياب)</span>
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { label: 'متوقف 10 أيام فأكثر (انقطاع حرج)', min: 10, max: 999, color: 'bg-red-500' },
                      { label: 'متوقف من 5 إلى 9 أيام', min: 5, max: 9, color: 'bg-orange-500' },
                      { label: 'متوقف من 2 إلى 4 أيام', min: 2, max: 4, color: 'bg-amber-400' },
                      { label: 'متوقف يوم واحد فقط', min: 1, max: 1, color: 'bg-blue-400' },
                      { label: 'شغال اليوم (نشط)', min: 0, max: 0, color: 'bg-emerald-500' },
                    ].map((group) => {
                      const count = drivers.filter(d => d.daysInactive >= group.min && d.daysInactive <= group.max).length;
                      const percentage = drivers.length > 0 ? Math.round((count / drivers.length) * 100) : 0;
                      return (
                        <div key={group.label} className="text-xs">
                          <div className="flex justify-between mb-1 text-slate-600">
                            <span className="font-medium">{group.label}</span>
                            <span className="font-bold">{count} مندوب ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className={`${group.color} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Box 2: Debt Ranges */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-red-600" />
                    <span>شرائح مبالغ المحافظ المعلقة</span>
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { label: 'أكثر من 3,000 ج.م', min: 3000, max: 999999, color: 'bg-red-600' },
                      { label: 'من 2,000 إلى 2,999 ج.م', min: 2000, max: 2999.99, color: 'bg-red-400' },
                      { label: 'من 1,000 إلى 1,999 ج.م', min: 1000, max: 1999.99, color: 'bg-amber-500' },
                      { label: 'أقل من 1,000 ج.م', min: 0.01, max: 999.99, color: 'bg-slate-400' },
                      { label: 'محفظة صفرية / مسواة', min: 0, max: 0, color: 'bg-emerald-500' },
                    ].map((group) => {
                      const count = drivers.filter(d => Math.abs(d.walletBalance) >= group.min && Math.abs(d.walletBalance) <= group.max).length;
                      const percentage = drivers.length > 0 ? Math.round((count / drivers.length) * 100) : 0;
                      return (
                        <div key={group.label} className="text-xs">
                          <div className="flex justify-between mb-1 text-slate-600">
                            <span className="font-medium">{group.label}</span>
                            <span className="font-bold">{count} مندوب ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className={`${group.color} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Driver Table / Cards */
            <DriverTable
              drivers={filteredDrivers}
              templates={templates}
              activeTab={activeTab}
              onPreviewMessage={handleOpenMessageModal}
              onToggleStatus={handleToggleStatus}
            />
          )}

        </main>
      </div>

      {/* 6. Modals */}
      <MessageModal
        driver={selectedDriverForMessage}
        messageType={messageTypeForModal}
        templates={templates}
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        onMarkSent={handleMarkSent}
      />

      <BatchQueueModal
        drivers={filteredDrivers}
        templates={templates}
        isOpen={isBatchQueueOpen}
        onClose={() => setIsBatchQueueOpen(false)}
        onMarkSent={handleMarkSent}
      />

      <SheetConfigModal
        currentSheetId={sheetId}
        isOpen={isSheetConfigOpen}
        onClose={() => setIsSheetConfigOpen(false)}
        onSaveSheetId={(newId) => {
          setSheetId(newId);
          fetchSheetData(newId);
        }}
      />

      <SettingsModal
        templates={templates}
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveTemplates={setTemplates}
        onSaveSettings={(newSettings) => setSettings(prev => ({ ...prev, ...newSettings }))}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={(csv) => {
          setRawCSV(csv);
          const parsed = parseDriversData(csv, settings, savedStatuses);
          setDrivers(parsed);
        }}
      />

    </div>
  );
}
