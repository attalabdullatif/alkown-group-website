import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif", direction: "rtl"
    }}>
      <div style={{
        background: "#111", border: "1px solid #222",
        borderRadius: "16px", padding: "48px 40px", width: "100%",
        maxWidth: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#c9a84c", letterSpacing: "2px" }}>
            ALKOWN
          </div>
          <div style={{ color: "#555", fontSize: "13px", marginTop: "4px" }}>
            لوحة الإدارة
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "#888", fontSize: "13px", marginBottom: "8px" }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: "100%", padding: "12px 16px", background: "#1a1a1a",
                border: "1px solid #2a2a2a", borderRadius: "10px",
                color: "#fff", fontSize: "15px", outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", color: "#888", fontSize: "13px", marginBottom: "8px" }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: "100%", padding: "12px 16px", background: "#1a1a1a",
                border: "1px solid #2a2a2a", borderRadius: "10px",
                color: "#fff", fontSize: "15px", outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "#1a0a0a", border: "1px solid #4a1a1a",
              borderRadius: "8px", padding: "12px 16px", color: "#ff6b6b",
              fontSize: "14px", marginBottom: "20px", textAlign: "center"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "14px", background: "#c9a84c",
              color: "#000", border: "none", borderRadius: "10px",
              fontSize: "16px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, transition: "opacity 0.2s"
            }}
          >
            {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
