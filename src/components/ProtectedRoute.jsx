import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { normalizeRole, meetsLevel } from "../lib/rbac";

export default function ProtectedRoute({ children, allowed, minLevel }) {
  const { user, role, loading } = useAuth();
  const normalized = normalizeRole(role);

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#0a0a0a", color: "#c9a84c",
        fontSize: "18px", fontFamily: "sans-serif"
      }}>
        جارٍ التحقق...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // minLevel check: role must meet or exceed the required level
  if (minLevel && !meetsLevel(normalized, minLevel)) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100vh", background: "#0a0a0a",
        color: "#fff", fontFamily: "sans-serif", gap: "16px"
      }}>
        <div style={{ fontSize: "48px" }}>🚫</div>
        <h2 style={{ color: "#c9a84c", margin: 0 }}>غير مصرح</h2>
        <p style={{ color: "#888", margin: 0 }}>ليس لديك صلاحية للوصول لهذه الصفحة.</p>
      </div>
    );
  }

  // allowed array check: normalize both sides before comparing
  if (allowed && !allowed.map(r => normalizeRole(r)).includes(normalized)) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100vh", background: "#0a0a0a",
        color: "#fff", fontFamily: "sans-serif", gap: "16px"
      }}>
        <div style={{ fontSize: "48px" }}>🚫</div>
        <h2 style={{ color: "#c9a84c", margin: 0 }}>غير مصرح</h2>
        <p style={{ color: "#888", margin: 0 }}>ليس لديك صلاحية للوصول لهذه الصفحة.</p>
      </div>
    );
  }

  return children;
}
