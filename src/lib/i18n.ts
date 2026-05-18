export type Language = "ar" | "en";

export type Dictionary = Record<string, { ar: string; en: string }>;

export const dict = {
  // Brand & shell
  "app.brand": { ar: "نظام المبيعات", en: "ARTsalepro" },
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
  "auth.outOfScope": {
    ar: "هذا الموظف خارج نطاق صلاحياتك.",
    en: "This employee is outside your scope.",
  },
  "auth.noManagedDept": {
    ar: "لا يوجد قسم تديره حالياً.",
    en: "You don't manage a department yet.",
  },

  // Nav
  "nav.dashboard": { ar: "لوحة الأداء", en: "Dashboard" },
  "nav.transactions": { ar: "العمليات", en: "Transactions" },
  "nav.team": { ar: "الفريق", en: "Team" },
  "nav.entry": { ar: "إدخال عملية", en: "Record Entry" },
  "nav.settings": { ar: "الإعدادات", en: "Settings" },
  "nav.departments": { ar: "الأقسام", en: "Departments" },
  "nav.audit": { ar: "سجل التدقيق", en: "Audit Log" },
  "nav.insights": { ar: "الأداء الأسبوعي", en: "Weekly Insights" },

  // Roles
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
  "dept.head": { ar: "رئيس القسم", en: "Head" },
  "dept.headNone": { ar: "بدون رئيس", en: "No head" },
  "dept.noHead": { ar: "⚠ لم يتم تعيين رئيس للقسم", en: "⚠ No head assigned" },
  "dept.code": { ar: "الرمز", en: "Code" },
  "dept.codePlaceholder": { ar: "مثلاً SLS", en: "e.g. SLS" },
  "dept.active": { ar: "نشط", en: "Active" },
  "dept.archived": { ar: "مؤرشف", en: "Archived" },
  "dept.archive": { ar: "أرشفة", en: "Archive" },
  "dept.restore": { ar: "استعادة", en: "Restore" },
  "dept.changeHead": { ar: "تغيير الرئيس", en: "Change head" },

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
  "kpi.cancelledFiles": { ar: "ملفات ملغاة", en: "Cancelled Files" },
  "kpi.cancelledValue": { ar: "قيمة الملفات الملغاة", en: "Cancelled Value" },
  "kpi.closeRate": { ar: "نسبة الإغلاق", en: "Close Rate" },
  "kpi.pacing": { ar: "وتيرة الأداء", en: "Pacing" },
  "kpi.pacing.ahead": { ar: "متقدم على الجدول", en: "Ahead of pace" },
  "kpi.pacing.behind": { ar: "متأخر عن الجدول", en: "Behind pace" },
  "kpi.pacing.onTrack": { ar: "على الجدول", en: "On track" },

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
  "tx.cancelAction": { ar: "إلغاء العملية", en: "Cancel transaction" },
  "tx.cancelConfirm": {
    ar: "هل أنت متأكد من إلغاء هذه العملية؟ ستُحفظ في السجل للمراجعة لكنها لن تظهر في الإجماليات.",
    en: "Cancel this transaction? It will be retained in the audit log but excluded from totals.",
  },
  "tx.cancelled": { ar: "تم إلغاء العملية", en: "Transaction cancelled" },
  "tx.cancelFailed": { ar: "فشل إلغاء العملية", en: "Failed to cancel transaction" },
  "tx.history": { ar: "السجل", en: "History" },
  "tx.historyTitle": { ar: "سجل العملية", en: "Transaction history" },

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
  "manager.scope": { ar: "النطاق", en: "Scope" },
  "manager.scopeOrg": { ar: "كل الأقسام", en: "Whole organization" },
  "manager.sortBy": { ar: "ترتيب حسب", en: "Sort by" },
  "manager.sort.attainment": { ar: "نسبة الإنجاز", en: "Attainment %" },
  "manager.sort.achievement": { ar: "المحقق", en: "Achievement" },
  "manager.sort.name": { ar: "الاسم", en: "Name" },
  "manager.pending": { ar: "معلقة", en: "Pending" },

  // CEO
  "ceo.title": { ar: "النظرة التنفيذية", en: "Executive Overview" },
  "ceo.subtitle": { ar: "أداء كافة الأقسام", en: "Performance across every department" },
  "ceo.deptBreakdown": { ar: "أداء الأقسام", en: "Department Performance" },

  // Dept head
  "depthead.title": { ar: "أداء القسم", en: "Department Performance" },
  "depthead.subtitle": { ar: "أداء فريق قسمك", en: "Your department's team performance" },
  "depthead.noDeptTitle": { ar: "لم يتم تعيين قسم تديره بعد", en: "You do not manage any department yet" },
  "depthead.noDeptHint": {
    ar: "تواصل مع الرئيس التنفيذي لتعيينك رئيساً لأحد الأقسام من صفحة إدارة الأقسام.",
    en: "Ask the CEO to assign you as head of a department from the Departments page.",
  },

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
  "emp.detail.metadata": { ar: "المعلومات الشخصية", en: "Personal info" },
  "emp.detail.phone": { ar: "الهاتف", en: "Phone" },
  "emp.detail.hired": { ar: "تاريخ التعيين", en: "Hire date" },
  "emp.detail.tenure": { ar: "مدة الخدمة", en: "Tenure" },
  "emp.detail.active": { ar: "نشط", en: "Active" },
  "emp.detail.inactive": { ar: "غير نشط", en: "Inactive" },
  "emp.detail.activate": { ar: "تفعيل", en: "Activate" },
  "emp.detail.deactivate": { ar: "إيقاف", en: "Deactivate" },
  "emp.detail.notSet": { ar: "غير مسجل", en: "Not set" },
  "emp.detail.period": { ar: "الفترة", en: "Period" },
  "emp.detail.editTarget": { ar: "تعديل الهدف", en: "Edit target" },
  "emp.detail.targetSaved": { ar: "تم حفظ الهدف", en: "Target saved" },
  "emp.detail.noTarget": { ar: "لم يتم تحديد هدف", en: "No target set" },
  "emp.detail.trend": { ar: "تطور الأداء", en: "Performance trend" },
  "emp.detail.trendSubtitle": { ar: "آخر 6 أشهر", en: "Last 6 months" },
  "emp.detail.tenureYears": { ar: "س", en: "y" },
  "emp.detail.tenureMonths": { ar: "ش", en: "m" },

  // Audit log
  "audit.title": { ar: "سجل التدقيق", en: "Audit Log" },
  "audit.subtitle": {
    ar: "سجل كامل للعمليات: من غيّر ماذا ومتى",
    en: "Full record of who changed what and when on transactions",
  },
  "audit.action.insert": { ar: "إنشاء", en: "Created" },
  "audit.action.update": { ar: "تعديل", en: "Updated" },
  "audit.action.delete": { ar: "حذف", en: "Deleted" },
  "audit.action.cancel": { ar: "إلغاء", en: "Cancelled" },
  "audit.actor": { ar: "بواسطة", en: "By" },
  "audit.actor.unknown": { ar: "نظام", en: "System" },
  "audit.changedAt": { ar: "بتاريخ", en: "At" },
  "audit.changedFields": { ar: "الحقول المعدلة", en: "Changed fields" },
  "audit.noChanges": { ar: "لا تغييرات مسجلة", en: "No tracked changes" },
  "audit.empty": { ar: "لا توجد سجلات تدقيق بعد", en: "No audit entries yet" },
  "audit.transaction": { ar: "العملية", en: "Transaction" },
  "audit.filter.all": { ar: "كل الأحداث", en: "All actions" },
  "audit.field.amount": { ar: "القيمة", en: "Amount" },
  "audit.field.status": { ar: "الحالة", en: "Status" },
  "audit.field.notes": { ar: "ملاحظات", en: "Notes" },
  "audit.field.deleted_at": { ar: "تاريخ الإلغاء", en: "Cancelled at" },
  "audit.field.transaction_date": { ar: "تاريخ العملية", en: "Transaction date" },
  "audit.field.sales_rep_id": { ar: "المندوب", en: "Sales rep" },
  "audit.field.file_number": { ar: "رقم الملف", en: "File number" },
  "audit.value.empty": { ar: "—", en: "—" },
  "audit.close": { ar: "إغلاق", en: "Close" },

  // Insights
  "insights.title": { ar: "الأداء الأسبوعي", en: "Weekly Insights" },
  "insights.subtitle": { ar: "ملخص الأداء حسب الأسبوع", en: "Weekly performance summary" },
  "insights.empty": { ar: "لا توجد بيانات بعد", en: "No data yet" },
  "insights.week": { ar: "الأسبوع", en: "Week" },
  "insights.period": { ar: "الفترة", en: "Period" },
  "insights.amount": { ar: "المجموع", en: "Total" },
  "insights.count": { ar: "عدد العمليات", en: "Transactions" },
  "insights.weekLabel": { ar: "أسبوع {{w}} - {{y}}", en: "Week {{w}}, {{y}}" },

  // Common
  "common.loading": { ar: "جارٍ التحميل...", en: "Loading..." },
  "common.error": { ar: "حدث خطأ", en: "An error occurred" },
  "common.success": { ar: "تم بنجاح", en: "Success" },
  "common.actions": { ar: "إجراءات", en: "Actions" },
  "common.delete": { ar: "حذف", en: "Delete" },
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
