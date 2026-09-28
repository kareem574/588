import { DriverRecord, MessageTemplates, MessageType } from '../types';
import { getCleanDriverName, formatCurrency } from './parser';

export const DEFAULT_TEMPLATES: MessageTemplates = {
  highDebtTemplate: `السلام عليكم ورحمة الله وبركاته،
أهلاً بك كابتن {اسم_المندوب} (كود: {كود_المندوب})،
معاك {المشرف} - إدارة التشغيل بشركة {الشركة}.

⚠️ تنبيه بخصوص مديونية المحفظة:
مسجل بالنظام وجود مديونية عليك مستحقة للتوريد بقيمة: *{رصيد_المحفظة}*.
نرجو التكرم بسرعة توريد المبلغ المستحق عليك اليوم لتسوية الحساب وتفادي إيقاف الحساب على السيستم.

شكراً لتعاونك ونتمنى لك دوام التوفيق.`,

  creditTemplate: `السلام عليكم ورحمة الله وبركاته،
أهلاً بك كابتن {اسم_المندوب} (كود: {كود_المندوب})،
معاك {المشرف} - إدارة التشغيل بشركة {الشركة}.

💰 إشعار بمستحقاتك المالية:
نود إبلاغك بوجود رصيد مالي مستحق لك طرف الشركة بقيمة: *{رصيد_المحفظة}*.
يرجى التواصل معنا أو مراجعة الإدارة لتسوية واستلام مستحقاتك في أقرب وقت.

شكراً لجهودك ونتمنى لك دوام التوفيق دائماً.`,

  inactiveTemplate: `السلام عليكم ورحمة الله وبركاته،
أهلاً بك كابتن {اسم_المندوب} (كود: {كود_المندوب})،
معاك {المشرف} - إدارة التشغيل بشركة {الشركة}.

🔴 استفسار وتوضيح موقف:
لاحظنا عدم نزولك للشغل وتوقفك عن العمل منذ *{عدد_الايام}* (آخر حركة مسجلة بتاريخ: {تاريخ_المعاملة}).
رصيد محفظتك مسجل به: *{رصيد_المحفظة}*.

نرجو التكرم بالرد علينا لتوضيح:
1️⃣ ما هو سبب عدم نزولك الشغل طوال هذه الفترة؟
2️⃣ {مطلوب_المحفظة}.

سلامتك تهمنا وبانتظار ردك وتوضيح موقفك في أقرب وقت.`,

  criticalTemplate: `السلام عليكم ورحمة الله وبركاته،
كابتن {اسم_المندوب} (كود: {كود_المندوب})،
معاك {المشرف} - إدارة التشغيل بشركة {الشركة}.

🚨 *إشعار عاجل وهام جداً:*
مسجل بالنظام توقفك عن العمل منذ *{عدد_الايام}* مع وجود مديونية محفظة مستحقة عليك بقيمة: *{رصيد_المحفظة}*.
تاريخ آخر معاملة: {تاريخ_المعاملة}.

مطلوب بشكل عاجل:
1- سرعة توريد المديونية المستحقة عليك فوراً منعاً لإجراءات الإيقاف القانونية والمالية.
2- إفادتنا بسبب عدم نزولك العمل خلال الفترة الماضية.

يرجى التواصل الفوري مع المشرف المسؤول.`,

  supervisorName: 'كريم شعبان',
  companyName: 'العز لخدمات التوصيل',
};

/**
 * Replace template placeholders with real driver data.
 * Adheres strictly to the accounting rule:
 * - Positive balance (> 0): Debt on the driver (مديونية على المندوب مطلوب توريدها)
 * - Negative balance (< 0): Credit for the driver (فلوس ومستحقات للمندوب له طرف الشركة)
 */
export function buildMessage(
  driver: DriverRecord,
  templateType: MessageType = 'high_debt',
  templates: MessageTemplates = DEFAULT_TEMPLATES
): string {
  // If driver has negative balance and high_debt was requested, switch intelligently to creditTemplate
  let effectiveType: MessageType = templateType;
  if (templateType === 'high_debt' && driver.walletBalance < 0) {
    effectiveType = 'credit';
  }

  let template = templates.highDebtTemplate;
  if (effectiveType === 'credit') {
    template = templates.creditTemplate || DEFAULT_TEMPLATES.creditTemplate;
  } else if (effectiveType === 'inactive') {
    template = templates.inactiveTemplate;
  } else if (effectiveType === 'critical') {
    template = templates.criticalTemplate;
  }

  const cleanName = getCleanDriverName(driver.driverName);
  const absAmount = formatCurrency(Math.abs(driver.walletBalance));

  // Determine explicit text labels based on positive vs negative
  let formattedBalance = '';
  let balanceType = '';
  let walletStatus = '';
  let walletAction = '';

  if (driver.walletBalance > 0) {
    // موجب: مديونية على المندوب
    formattedBalance = `+${absAmount} (مديونية عليك)`;
    balanceType = 'مديونية مستحقة عليك';
    walletStatus = 'مديونية مسجلة عليك لصالح الشركة';
    walletAction = 'موعد توريد المديونية المستحقة عليك لتسوية الحساب';
  } else if (driver.walletBalance < 0) {
    // سالب: فلوس للمندوب
    formattedBalance = `-${absAmount} (مستحقات لك طرف الشركة)`;
    balanceType = 'مستحقات مالية لك';
    walletStatus = 'مستحقات ورصيد دائن لك طرف الشركة';
    walletAction = 'التنسيق لاستلام وتسوية مستحقاتك المالية المسجلة لك';
  } else {
    // صفر: حساب مسوى
    formattedBalance = '0.00 ج.م (حساب مسوى وخالص)';
    balanceType = 'حساب خالص';
    walletStatus = 'حساب مسوى ولا توجد مديونية';
    walletAction = 'موعد عودتك للعمل واستئناف النشاط';
  }

  const daysText = driver.daysInactive === 0 ? 'اليوم' :
                   driver.daysInactive === 1 ? 'يوم واحد' : 
                   driver.daysInactive === 2 ? 'يومين' : 
                   `${driver.daysInactive} أيام`;

  let message = template;
  message = message.replace(/\{اسم_المندوب\}/g, cleanName);
  message = message.replace(/\{كود_المندوب\}/g, driver.driverCode || 'غير محدد');
  message = message.replace(/\{رصيد_المحفظة\}/g, formattedBalance);
  message = message.replace(/\{مبلغ_المحفظة\}/g, absAmount);
  message = message.replace(/\{نوع_الرصيد\}/g, balanceType);
  message = message.replace(/\{حالة_المحفظة\}/g, walletStatus);
  message = message.replace(/\{مطلوب_المحفظة\}/g, walletAction);
  message = message.replace(/\{عدد_الايام\}/g, daysText);
  message = message.replace(/\{تاريخ_المعاملة\}/g, driver.lastTransactionDate || 'غير مسجل');
  message = message.replace(/\{المنطقة\}/g, driver.area || driver.zone || '');
  message = message.replace(/\{المشرف\}/g, driver.supervisor || templates.supervisorName || 'المشرف المسؤول');
  message = message.replace(/\{الشركة\}/g, templates.companyName || 'العز');

  return message.trim();
}

/**
 * Generate full WhatsApp web / mobile deep link
 */
export function generateWhatsAppLink(phone: string, text: string): string {
  if (!phone) return '#';
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Open WhatsApp directly in new window/tab
 */
export function openWhatsAppChat(phone: string, text: string): void {
  const url = generateWhatsAppLink(phone, text);
  if (url === '#') {
    alert('رقم الهاتف غير متوفر أو غير صالح لهذا المندوب.');
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}
