import { useEffect } from "react";

export default function DashboardSection() {
  useEffect(() => {
    window.location.href = "/portal";
  }, []);
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "#666" }}>
      جارٍ التوجيه لبوابة العملاء...
    </div>
  );
}
