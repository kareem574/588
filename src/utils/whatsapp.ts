import { DriverRecord, MessageTemplates } from '../types';
import { getCleanDriverName, formatCurrency } from './parser';

export const DEFAULT_TEMPLATES: MessageTemplates = {
  highDebtTemplate: `السلام عليكم ورحمة الله وبركاته،
أهلاً بك كابتن {اسم_المندوب} (كود: {كود_المندوب})،
معاك {المشرف} - إدارة التشغيل بشركة {الشركة}.

⚠️ تنبيه هام بخصوص المحفظة:
يوجد لديك رصيد محفظة مستحق للتوريد بقيمة: *{رصيد_المحفظة}*.
نرجو التكرم بسرعة توريد المبلغ اليوم أو التوجه للمشرف لإنهاء التوريد لتفادي إيقاف الحساب على السيستم.

شكراً لتعاونك ونتمنى لك دوام التوفيق.`,

  inactiveTemplate: `السلام عليكم ورحمة الله وبركاته،
أهلاً بك كابتن {اسم_المندوب} (كود: {كود_المندوب})،
معاك {المشرف} - إدارة التشغيل بشركة {الشركة}.

🔴 استفسار وتوريد محفظة:
لاحظنا عدم نزولك للشغل وتوقفك عن العمل منذ *{عدد_الايام} أيام* (آخر حركة مسجلة بتاريخ: {تاريخ_المعاملة}).
رصيد محفظتك الحالي: *{رصيد_المحفظة}*.

نرجو التكرم بالرد علينا لتوضيح:
1️⃣ ما هو سبب عدم نزولك الشغل طوال هذه الفترة؟
2️⃣ موعد توريد رصيد المحفظة المستحق لتسوية حسابك.

سلامتك تهمنا وبانتظار ردك وتوضيح موقفك في أقرب وقت.`,

  criticalTemplate: `السلام عليكم ورحمة الله وبركاته،
كابتن {اسم_المندوب} (كود: {كود_المندوب})،
معاك {المشرف} - إدارة التشغيل بشركة {الشركة}.

🚨 *إشعار عاجل وهام جداً:*
مسجل بالنظام توقفك عن العمل منذ *{عدد_الايام} أيام* مع وجود مديونية محفظة مرتفعة بقيمة: *{رصيد_المحفظة}*.
تاريخ آخر معاملة: {تاريخ_المعاملة}.

مطلوب بشكل عاجل:
1- سرعة توريد رصيد المحفظة فوراً منعاً لإجراءات الإيقاف القانونية والمالية.
2- إفادتنا بسبب عدم نزولك العمل خلال الفترة الماضية.

يرجى التواصل الفوري مع المشرف المسؤول.`,

  supervisorName: 'كريم شعبان',
  companyName: 'العز لخدمات التوصيل',
};

/**
 * Replace template placeholders with real driver data
 */
export function buildMessage(
  driver: DriverRecord,
  templateType: 'high_debt' | 'inactive' | 'critical',
  templates: MessageTemplates = DEFAULT_TEMPLATES
): string {
  let template = templates.highDebtTemplate;
  if (templateType === 'inactive') {
    template = templates.inactiveTemplate;
  } else if (templateType === 'critical') {
    template = templates.criticalTemplate;
  }

  const cleanName = getCleanDriverName(driver.driverName);
  const formattedBalance = formatCurrency(Math.abs(driver.walletBalance));
  const daysText = driver.daysInactive === 1 ? 'يوم واحد' : 
                   driver.daysInactive === 2 ? 'يومين' : 
                   `${driver.daysInactive} أيام`;

  let message = template;
  message = message.replace(/\{اسم_المندوب\}/g, cleanName);
  message = message.replace(/\{كود_المندوب\}/g, driver.driverCode || 'غير محدد');
  message = message.replace(/\{رصيد_المحفظة\}/g, formattedBalance);
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
