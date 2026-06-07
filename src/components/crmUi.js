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

export const statusColors = {
  New: CRM_COLORS.goldDark,
  "In Progress": CRM_COLORS.info,
  "Pending Documents": "#c28a25",
  Approved: CRM_COLORS.success,
  Rejected: CRM_COLORS.danger,
  Completed: "#333",
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

export function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export function makeRequestNumber() {
  return `REQ-${Date.now()}`;
}
