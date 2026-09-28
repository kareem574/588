export interface DriverRecord {
  id: string; // unique identifier (e.g. code or row index)
  pullDate: string; // تاريخ السحبه
  driverCode: string; // كود المندوب
  driverName: string; // اسم المندوب
  zone: string; // الزون
  area: string; // المنطقة
  supervisor: string; // المشرف
  phone: string; // رقم التليفون الأصلي
  normalizedPhone: string; // رقم الهاتف الدولي للواتساب
  lastTransactionDate: string; // تاريخ المعامله
  walletBalance: number; // رصيد المحفظة كرقم
  rawWalletBalance: string; // النص الأصلي
  balanceType?: 'debt' | 'credit' | 'zero'; // نوع الرصيد
  balanceLabel?: string; // وصف الرصيد بالعربية
  daysInactive: number; // عدد الأيام
  rawDaysInactive: string; // النص الأصلي
  
  // Computed flags
  isHighDebt: boolean; // هل المديونية مرتفعة
  isInactive: boolean; // هل متوقف عن العمل
  isCritical: boolean; // متوقف + مديونية كبيرة
  
  // Status tracking (local storage)
  status: 'pending' | 'sent_debt' | 'sent_inactive' | 'sent_both' | 'excused' | 'resolved';
  lastContactedAt?: string;
  notes?: string;
}

export interface FilterSettings {
  debtThreshold: number; // الحد الأدنى للمديونية الكبيرة (افتراضي 1000)
  inactiveDaysThreshold: number; // الحد الأدنى لأيام التوقف (افتراضي 3)
  debtCalculationMode: 'positive' | 'negative' | 'absolute' | 'all_nonzero'; // طبيعة حساب المديونية
  selectedZone: string; // فلترة بالزون
  selectedArea: string; // فلترة بالمنطقة
  selectedSupervisor: string; // فلترة بالمشرف
  searchQuery: string; // بحث بالاسم أو الكود أو الهاتف
  statusFilter: string; // حالة الإرسال
}

export type MessageType = 'high_debt' | 'credit' | 'inactive' | 'critical';

export interface MessageTemplates {
  highDebtTemplate: string;
  creditTemplate: string;
  inactiveTemplate: string;
  criticalTemplate: string;
  supervisorName: string;
  companyName: string;
}

export type ActiveTab = 'overview' | 'high_debt' | 'inactive' | 'critical' | 'all_drivers' | 'batch_queue' | 'settings' | 'credit_drivers';
