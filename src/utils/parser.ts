import { DriverRecord, FilterSettings, MessageTemplates } from '../types';

/**
 * Convert Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) and Persian numerals to Western digits (0123456789)
 */
export function convertArabicDigitsToEnglish(str: string): string {
  if (!str) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replaceAll(arabicDigits[i], String(i));
    result = result.replaceAll(persianDigits[i], String(i));
  }
  return result;
}

/**
export function parseWalletBalance(rawVal: string | number | undefined | null): number {
  if (rawVal === undefined || rawVal === null) return 0;
  if (typeof rawVal === 'number') return isNaN(rawVal) ? 0 : rawVal;
  
  let str = String(rawVal).trim();
  str = convertArabicDigitsToEnglish(str);
  
  // Check if negative: detects standard minus '-', unicode minus '−', dashes '–', '—', parentheses '(100)', or trailing minus '100-'
  const isNegative = str.includes('-') || 
                     str.includes('−') || 
                     str.includes('–') || 
                     str.includes('—') || 
                     (str.startsWith('(') && str.endsWith(')'));
  
  // Replace Arabic decimal separator (٫) with standard dot (.)
  str = str.replace(/٫/g, '.');
  
  // Remove thousand separators
  if (str.includes(',') && !str.includes('.')) {
    const parts = str.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      str = parts[0] + '.' + parts[1];
    } else {
      str = str.replace(/,/g, '');
    }
  } else {
    str = str.replace(/,/g, '');
  }
  
  // Remove all non-digits and non-dot
  str = str.replace(/[^\d.]/g, '');
  
  const num = parseFloat(str);
  if (isNaN(num)) return 0;
  
  const finalVal = isNegative ? -Math.abs(num) : Math.abs(num);
  return Math.round(finalVal * 100) / 100;
}

/**
 * Determine balance type:
 * - 'debt' (موجب +): عليه توريد كاش لصالح الشركة
 * - 'credit' (سالب -): ليه مستحقات عند الشركة
 * - 'zero' (صفر 0): رصيد خالص متزن
 */
export function getBalanceType(balance: number): 'debt' | 'credit' | 'zero' {
  if (balance > 0.001) return 'debt';
  if (balance < -0.001) return 'credit';
  return 'zero';
}

/**
 * Get clear Arabic label for the balance status
 */
export function getBalanceLabel(balance: number): string {
  if (balance > 0.001) return 'عليه توريد للشركة';
  if (balance < -0.001) return 'ليه مستحقات عند الشركة';
  return 'رصيد خالص';
}


/**
 * Parse days inactive
 */
export function parseDaysInactive(rawVal: string | number | undefined | null): number {
  if (rawVal === undefined || rawVal === null) return 0;
  if (typeof rawVal === 'number') return isNaN(rawVal) ? 0 : Math.max(0, Math.round(rawVal));
  
  let str = String(rawVal).trim();
  str = convertArabicDigitsToEnglish(str);
  str = str.replace(/[^\d]/g, '');
  const num = parseInt(str, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Format Egyptian and international phone numbers for WhatsApp API
 * Example: "01112133482" -> "201112133482"
 * Example: "+201009043384" -> "201009043384"
 */
export function normalizePhoneNumber(rawPhone: string | number | undefined | null): string {
  if (!rawPhone) return '';
  let phone = String(rawPhone).trim();
  phone = convertArabicDigitsToEnglish(phone);
  
  // Remove spaces, hyphens, parentheses, plus
  phone = phone.replace(/[\s\-_()+]/g, '');
  
  // If starts with 0020... -> 20...
  if (phone.startsWith('0020')) {
    phone = phone.slice(2);
  }
  
  // If starts with 010, 011, 012, 015 (Standard Egyptian mobile length 11 digits)
  if (phone.startsWith('01') && phone.length === 11) {
    phone = '20' + phone.slice(1);
  } else if (phone.startsWith('1') && phone.length === 10) {
    phone = '20' + phone;
  }
  
  return phone;
}

/**
 * Robust CSV parser that handles quotes, escaped quotes, multiline values, and commas
 */
export function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some(col => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(col => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Convert parsed matrix or raw CSV into DriverRecord[]
 */
export function parseDriversData(
  rawData: string[][] | string,
  settings: FilterSettings,
  savedStatuses: Record<string, { status: DriverRecord['status']; notes?: string; lastContactedAt?: string }> = {}
): DriverRecord[] {
  let matrix: string[][];
  if (typeof rawData === 'string') {
    matrix = parseCSV(rawData);
  } else {
    matrix = rawData;
  }

  if (!matrix || matrix.length < 2) return [];

  // Determine headers
  const headerRow = matrix[0].map(h => h.trim().toLowerCase());
  
  // Find column indices by flexible names
  const findCol = (keywords: string[]): number => {
    return headerRow.findIndex(h => keywords.some(k => h.includes(k.toLowerCase())));
  };

  const pullDateIdx = findCol(['تاريخ السحبه', 'تاريخ السحب', 'pull date', 'سحبه']);
  const codeIdx = findCol(['كود المندوب', 'كود', 'code', 'driver code', 'id']);
  const nameIdx = findCol(['اسم المندوب', 'اسم', 'name', 'driver name', 'الكابتن']);
  const zoneIdx = findCol(['الزون', 'zone']);
  const areaIdx = findCol(['area', 'المنطقة', 'منطقة', 'المحطة']);
  const supervisorIdx = findCol(['المشرف', 'مشرف', 'supervisor']);
  const phoneIdx = findCol(['رقم التليفون', 'تليفون', 'موبايل', 'phone', 'mobile']);
  const transDateIdx = findCol(['تاريخ المعامله', 'تاريخ المعاملة', 'آخر معامله', 'last transaction', 'date']);
  const walletIdx = findCol(['رصيد المحفظه', 'رصيد المحفظة', 'المحفظه', 'المحفظة', 'balance', 'wallet']);
  const daysIdx = findCol(['عدد الايام', 'عدد الأيام', 'الايام', 'الأيام', 'days', 'inactive']);

  const drivers: DriverRecord[] = [];

  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row || row.length === 0) continue;

    const driverCode = (codeIdx !== -1 && row[codeIdx] ? row[codeIdx] : `ROW_${r}`).trim();
    const driverName = (nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : '').trim();
    
    // Skip empty lines without name or code
    if (!driverCode && !driverName) continue;

    const pullDate = pullDateIdx !== -1 ? row[pullDateIdx] || '' : '';
    const zone = zoneIdx !== -1 ? row[zoneIdx] || '' : '';
    const area = areaIdx !== -1 ? row[areaIdx] || '' : '';
    const supervisor = supervisorIdx !== -1 ? row[supervisorIdx] || '' : '';
    const phone = phoneIdx !== -1 ? row[phoneIdx] || '' : '';
    const lastTransactionDate = transDateIdx !== -1 ? row[transDateIdx] || '' : '';
    const rawWallet = walletIdx !== -1 ? row[walletIdx] || '0' : '0';
    const rawDays = daysIdx !== -1 ? row[daysIdx] || '0' : '0';

    const walletBalance = parseWalletBalance(rawWallet);
    const daysInactive = parseDaysInactive(rawDays);
    const normalizedPhone = normalizePhoneNumber(phone);
    const balanceType = getBalanceType(walletBalance);
    const balanceLabel = getBalanceLabel(walletBalance);

    // Compute high debt based on business rules:
    // Positive (+): عليه توريد كاش لصالح الشركة (مديونية)
    // Negative (-): ليه مستحقات عند الشركة (رصيد دائن للمندوب)
    let isHighDebt = false;
    if (settings.debtCalculationMode === 'positive' || !settings.debtCalculationMode) {
      isHighDebt = walletBalance >= settings.debtThreshold;
    } else if (settings.debtCalculationMode === 'negative') {
      isHighDebt = walletBalance <= -settings.debtThreshold;
    } else if (settings.debtCalculationMode === 'absolute') {
      isHighDebt = Math.abs(walletBalance) >= settings.debtThreshold;
    } else {
      isHighDebt = walletBalance >= settings.debtThreshold;
    }

    const isInactive = daysInactive >= settings.inactiveDaysThreshold;
    const isCritical = isHighDebt && isInactive;

    const saved = savedStatuses[driverCode] || { status: 'pending' };

    drivers.push({
      id: driverCode,
      pullDate,
      driverCode,
      driverName,
      zone,
      area,
      supervisor,
      phone,
      normalizedPhone,
      lastTransactionDate,
      walletBalance,
      rawWalletBalance: rawWallet,
      balanceType,
      balanceLabel,
      daysInactive,
      rawDaysInactive: rawDays,
      isHighDebt,
      isInactive,
      isCritical,
      status: saved.status || 'pending',
      lastContactedAt: saved.lastContactedAt,
      notes: saved.notes,
    });
  }

  return drivers;
}

/**
 * Format currency in Egyptian Pounds (EGP) with clear sign (+/-) and optional status label
 */
export function formatCurrency(amount: number, options?: { showSign?: boolean; withLabel?: boolean }): string {
  const absAmount = Math.abs(amount);
  const formattedNum = new Intl.NumberFormat('ar-EG', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(absAmount);

  if (amount > 0.001) {
    const sign = options?.showSign ? '+ ' : '';
    const label = options?.withLabel ? ' (عليه توريد)' : '';
    return `${sign}${formattedNum} ج.م${label}`;
  } else if (amount < -0.001) {
    const label = options?.withLabel ? ' (ليه مستحقات)' : '';
    return `- ${formattedNum} ج.م${label}`;
  }
  return `0 ج.م`;
}

/**
 * Clean driver name (remove trailing company tags like _EL EZZ or _BC for clean messaging)
 */
export function getCleanDriverName(name: string): string {
  if (!name) return 'كابتن';
  // Strip suffixes like "_EL EZZ", "_EL EZZ_BC", "_ELEZZ"
  let clean = name.replace(/_?\s*EL\s*EZZ(_BC)?/gi, '');
  clean = clean.replace(/_+/g, ' ').trim();
  // Capitalize or clean words
  return clean || name;
}
