export type Language = "ar" | "en";

export type Dictionary = Record<string, { ar: string; en: string }>;

export const dict = {
  // Brand & shell
  "app.brand": { ar: "أزيموث", en: "AZIMUTH" },
  "app.tagline": { ar: "قيادة الأداء", en: "Performance Command" },
  "app.company": { ar: "شركة الرابح", en: "Al-Rabeh Company" },

  // Auth
  "auth.signin.title": { ar: "تسجيل الدخول", en: "Sign in" },
  "auth.signin.subtitle": { ar: "أدخل بياناتك للوصول إلى لوحة الأداء", en: "Enter your credentials to access the dashboard" },
  "auth.signup.title": { ar: "إنشاء حساب", en: "Create account" },
  "auth.signup.subtitle": { ar: "ابدأ بتتبع أدائك", en: "Start tracking your performance" },
  "auth.email": { ar: "البريد الإلكتروني", en: "Email" },
  "auth.password": { ar: "كلمة المرور", en: "Password" },
  "auth.fullName": { ar: "الاسم الكامل", en: "Full name" },
  "auth.signin.cta": { ar: "دخول", en: "Sign in" },
  "auth.signup.cta": { ar: "إنشاء", en: "Create account" },
  "auth.toSignup": { ar: "ليس لديك حساب؟ أنشئ واحداً", en: "Don't have an account? Sign up" },
  "auth.toSignin": { ar: "لديك حساب؟ سجل الدخول", en: "Already have an account? Sign in" },
  "auth.signout": { ar: "خروج", en: "Sign out" },

  // Nav
  "nav.dashboard": { ar: "لوحة الأداء", en: "Dashboard" },
  "nav.transactions": { ar: "العمليات", en: "Transactions" },
  "nav.team": { ar: "الفريق", en: "Team" },
  "nav.entry": { ar: "إدخال عملية", en: "Record Entry" },
  "nav.settings": { ar: "الإعدادات", en: "Settings" },
  "nav.departments": { ar: "الأقسام", en: "Departments" },

  // Roles
  "role.manager": { ar: "مدير", en: "Manager" },
  "role.accountant": { ar: "محاسب", en: "Accountant" },
  "role.sales_rep": { ar: "مندوب مبيعات", en: "Sales Rep" },
  "role.ceo": { ar: "الرئيس التنفيذي", en: "CEO" },
  "role.dept_head": { ar: "رئيس قسم", en: "Department Head" },

  // Departments
  "dept.title": { ar: "إدارة الأقسام", en: "Departments" },
  "dept.subtitle": { ar: "أنشئ وأدر أقسام الشركة", en: "Create and manage company departments" },
  "dept.label": { ar: "القسم", en: "Department" },
  "dept.name": { ar: "اسم القسم", en: "Department name" },
  "dept.nameAr": { ar: "الاسم بالعربية", en: "Arabic name" },
  "dept.add": { ar: "إضافة قسم", en: "Add Department" },
  "dept.none": { ar: "بدون قسم", en: "No department" },
  "dept.all": { ar: "كل الأقسام", en: "All Departments" },
  "dept.global": { ar: "نظرة شاملة", en: "Global view" },
  "dept.filter": { ar: "تصفية حسب القسم", en: "Filter by department" },
  "dept.assign": { ar: "تعيين القسم", en: "Assign Department" },
  "dept.empty": { ar: "لا توجد أقسام بعد", en: "No departments yet" },
  "dept.sales": { ar: "قسم المبيعات", en: "Sales Department" },
  "dept.telecom": { ar: "قسم اتصالات المبيعات", en: "Telecommunications Sales Dept" },

  // KPIs
  "kpi.totalAchievement": { ar: "إجمالي المحقق", en: "Total Achievement" },
  "kpi.targetVariance": { ar: "تباين الهدف", en: "Target Variance" },
  "kpi.efficiencyRatio": { ar: "نسبة الكفاءة", en: "Efficiency Ratio" },
  "kpi.avgFileValue": { ar: "متوسط قيمة الملف", en: "Avg. File Value" },
  "kpi.progressToTarget": { ar: "التقدم نحو الهدف", en: "Progress to Target" },
  "kpi.monthlyTarget": { ar: "الهدف الشهري", en: "Monthly Target" },
  "kpi.completedFiles": { ar: "ملفات مكتملة", en: "Completed Files" },
  "kpi.pendingFiles": { ar: "ملفات معلقة", en: "Pending Files" },
  "kpi.teamAchievement": { ar: "إنجاز الفريق", en: "Team Achievement" },
  "kpi.activeReps": { ar: "المناديب النشطون", en: "Active Reps" },

  // Transactions
  "tx.fileNumber": { ar: "رقم الملف", en: "File Number" },
  "tx.amount": { ar: "القيمة", en: "Amount" },
  "tx.status": { ar: "الحالة", en: "Status" },
  "tx.salesRep": { ar: "المندوب", en: "Sales Rep" },
  "tx.date": { ar: "التاريخ", en: "Date" },
  "tx.notes": { ar: "ملاحظات", en: "Notes" },
  "tx.recent": { ar: "آخر العمليات", en: "Recent Transactions" },
  "tx.all": { ar: "كل العمليات", en: "All Transactions" },
  "tx.empty": { ar: "لا توجد عمليات بعد", en: "No transactions yet" },
  "tx.add": { ar: "إضافة عملية", en: "Add Transaction" },
  "tx.save": { ar: "حفظ", en: "Save" },
  "tx.cancel": { ar: "إلغاء", en: "Cancel" },
  "tx.entryTitle": { ar: "تسجيل عملية جديدة", en: "Record New Transaction" },
  "tx.entrySubtitle": { ar: "أدخل تفاصيل الملف بدقة", en: "Enter file details precisely" },

  // Status
  "status.completed": { ar: "مكتمل", en: "Completed" },
  "status.pending": { ar: "قيد المعالجة", en: "Pending" },
  "status.cancelled": { ar: "ملغى", en: "Cancelled" },

  // Manager / leadership
  "manager.title": { ar: "نظرة استراتيجية", en: "Strategic Overview" },
  "manager.subtitle": { ar: "أداء الفريق والمناديب", en: "Team and representative performance" },
  "manager.repBreakdown": { ar: "أداء المناديب", en: "Representative Performance" },
  "manager.setTarget": { ar: "تحديد الهدف", en: "Set Target" },
  "manager.targetSaved": { ar: "تم حفظ الهدف", en: "Target saved" },

  // CEO
  "ceo.title": { ar: "النظرة التنفيذية", en: "Executive Overview" },
  "ceo.subtitle": { ar: "أداء كافة الأقسام", en: "Performance across every department" },
  "ceo.deptBreakdown": { ar: "أداء الأقسام", en: "Department Performance" },

  // Dept head
  "depthead.title": { ar: "أداء القسم", en: "Department Performance" },
  "depthead.subtitle": { ar: "أداء فريق قسمك", en: "Your department's team performance" },

  // Sales rep
  "rep.welcome": { ar: "أهلاً", en: "Welcome" },
  "rep.subtitle": { ar: "تابع تقدمك نحو هدفك الشهري", en: "Track your progress toward your monthly goal" },

  // Accountant
  "acc.title": { ar: "إدارة العمليات", en: "Operations Management" },
  "acc.subtitle": { ar: "تسجيل ودقة العمليات المالية", en: "Record and audit financial operations" },

  // Employee detail
  "emp.detail.title": { ar: "ملف الموظف", en: "Employee Profile" },
  "emp.detail.back": { ar: "عودة إلى الفريق", en: "Back to Team" },
  "emp.detail.recent": { ar: "آخر عمليات الموظف", en: "Recent transactions" },
  "emp.detail.notFound": { ar: "لم يتم العثور على الموظف", en: "Employee not found" },

  // Common
  "common.loading": { ar: "جارٍ التحميل...", en: "Loading..." },
  "common.error": { ar: "حدث خطأ", en: "An error occurred" },
  "common.success": { ar: "تم بنجاح", en: "Success" },
  "common.actions": { ar: "إجراءات", en: "Actions" },
  "common.search": { ar: "بحث...", en: "Search..." },
  "common.theme.dark": { ar: "داكن", en: "Dark" },
  "common.theme.light": { ar: "فاتح", en: "Light" },
  "common.language": { ar: "اللغة", en: "Language" },
  "common.currency": { ar: "ر.س", en: "SAR" },
} as const satisfies Dictionary;

export type DictKey = keyof typeof dict;

export function translate(key: DictKey, lang: Language): string {
  return dict[key][lang];
}

export function formatNumber(value: number, lang: Language, opts?: Intl.NumberFormatOptions): string {
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0, ...opts }).format(value);
}

export function formatCurrency(value: number, lang: Language): string {
  return formatNumber(value, lang, { maximumFractionDigits: 0 });
}

export function formatDate(value: string | Date, lang: Language): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(d);
}
