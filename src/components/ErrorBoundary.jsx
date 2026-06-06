import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("App Error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fffdf8", fontFamily: "Cairo,sans-serif", direction: "rtl", padding: 24 }}>
          <div style={{ textAlign: "center", maxWidth: 520 }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>⚠️</div>
            <h2 style={{ color: "#1e1810", fontWeight: 400, marginBottom: 12 }}>حدث خطأ في التطبيق</h2>
            <div style={{ background: "#f5f0e8", borderRadius: 8, padding: "14px 18px", marginBottom: 20, textAlign: "left", direction: "ltr" }}>
              <code style={{ color: "#c0392b", fontSize: ".82rem", wordBreak: "break-all" }}>
                {this.state.error?.message || "Unknown error"}
              </code>
            </div>
            <button onClick={() => window.location.href = "/"} style={{ padding: "10px 24px", background: "#c9a84c", color: "#1e1810", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700 }}>
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
