export const CRM_COLORS = {
  gold: "#c9a84c",
  goldDark: "#a8842f",
  beige: "#f7f1e6",
  warm: "#fffdf8",
  border: "rgba(201,168,76,.25)",
  text: "#1f1f1f",
  muted: "#6f6a61",
  danger: "#b94a48",
  success: "#2f8f5b",
  info: "#3d6f9f",
};

export const REQUEST_STATUSES = [
  "New",
  "In Progress",
  "Pending Documents",
  "Approved",
  "Rejected",
  "Completed",
];

// 9-stage visa workflow
export const VISA_STATUSES = [
  "Lead",
  "Consultation",
  "Documents Pending",
  "Ready For Submission",
  "Submitted",
  "Processing",
  "Approved",
  "Rejected",
  "Completed",
];

export const VISA_STATUS_AR = {
  "Lead":                 "عميل محتمل",
  "Consultation":         "استشارة",
  "Documents Pending":    "بانتظار وثائق",
  "Ready For Submission": "جاهز للتقديم",
  "Submitted":            "تم التقديم",
  "Processing":           "قيد المعالجة",
  "Approved":             "موافق عليه",
  "Rejected":             "مرفوض",
  "Completed":            "مكتمل",
};

// All statuses merged for filter dropdowns (legacy + visa)
export const ALL_STATUSES = [
  ...new Set([...REQUEST_STATUSES, ...VISA_STATUSES]),
];

export const statusColors = {
  New: CRM_COLORS.goldDark,
  "In Progress": CRM_COLORS.info,
  "Pending Documents": "#c28a25",
  Approved: CRM_COLORS.success,
  Rejected: CRM_COLORS.danger,
  Completed: "#333",
  // Visa workflow
  Lead: "#8b5cf6",
  Consultation: "#3d6f9f",
  "Documents Pending": "#c28a25",
  "Ready For Submission": "#0d9488",
  Submitted: "#2563eb",
  Processing: "#7c3aed",
};

export const pageStyle = {
  minHeight: "100vh",
  background: CRM_COLORS.warm,
  padding: "32px",
  color: CRM_COLORS.text,
  fontFamily: "'Dubai', 'Cairo', 'Noto Naskh Arabic', sans-serif",
};

export const cardStyle = {
  background: "#fff",
  border: `1px solid ${CRM_COLORS.border}`,
  borderRadius: "8px",
  boxShadow: "0 10px 30px rgba(31,31,31,.06)",
};

export const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: `1px solid ${CRM_COLORS.border}`,
  borderRadius: "6px",
  background: CRM_COLORS.beige,
  color: CRM_COLORS.text,
  outline: "none",
};

export const buttonStyle = {
  border: "none",
  borderRadius: "6px",
  background: `linear-gradient(135deg, ${CRM_COLORS.gold}, #e4c465)`,
  color: "#111",
  padding: "11px 16px",
  fontWeight: 800,
  letterSpacing: ".08em",
  cursor: "pointer",
};

export const outlineButtonStyle = {
  ...buttonStyle,
  background: "#fff",
  border: `1px solid ${CRM_COLORS.border}`,
  color: CRM_COLORS.text,
};

// ── Lead Pipeline ──────────────────────────────────────────────────────────

export const LEAD_STAGES = [
  "New Lead",
  "Contacted",
  "Qualified",
  "Documents Pending",
  "Processing",
  "Won",
  "Lost",
];

export const LEAD_STAGE_AR = {
  "New Lead":          "عميل جديد",
  "Contacted":         "تم التواصل",
  "Qualified":         "مؤهل",
  "Documents Pending": "بانتظار وثائق",
  "Processing":        "قيد المعالجة",
  "Won":               "تم الفوز",
  "Lost":              "خسارة",
};

export const LEAD_STAGE_COLORS = {
  "New Lead":          "#8b5cf6",
  "Contacted":         "#3d6f9f",
  "Qualified":         "#0d9488",
  "Documents Pending": "#c28a25",
  "Processing":        "#7c3aed",
  "Won":               "#2f8f5b",
  "Lost":              "#b94a48",
};

// ── Activity Types ──────────────────────────────────────────────────────────

export const ACTIVITY_TYPES = [
  { value: "call",    label: "مكالمة",   icon: "📞" },
  { value: "message", label: "رسالة",    icon: "💬" },
  { value: "meeting", label: "اجتماع",   icon: "🤝" },
  { value: "note",    label: "ملاحظة",   icon: "📝" },
  { value: "email",   label: "بريد إلكتروني", icon: "📧" },
];

// ── Task Statuses ───────────────────────────────────────────────────────────

export const TASK_STATUSES = [
  { value: "pending",     label: "معلّق",         color: "#c28a25" },
  { value: "in_progress", label: "قيد التنفيذ",   color: "#3d6f9f" },
  { value: "completed",   label: "مكتمل",         color: "#2f8f5b" },
  { value: "cancelled",   label: "ملغى",          color: "#b94a48" },
];

export const TASK_PRIORITIES = [
  { value: "low",    label: "منخفض",  color: "#6f6a61" },
  { value: "medium", label: "متوسط",  color: "#c28a25" },
  { value: "high",   label: "عالٍ",  color: "#b94a48" },
];

export function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export function makeRequestNumber() {
  return `REQ-${Date.now()}`;
}
