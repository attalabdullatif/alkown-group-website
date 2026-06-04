import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function VerifyInvoice() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const invNumber = params.get("inv");
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(null);

  useEffect(() => {
    if (!invNumber) { setLoading(false); return; }
    supabase.from("invoices")
      .select("*, requests(request_number, clients(full_name, phone), services(name))")
      .eq("invoice_number", invNumber)
      .maybeSingle()
      .then(({ data }) => {
        setInvoice(data);
        setValid(!!data);
        setLoading(false);
      });
  }, [invNumber]);

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif", padding: 24
    }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#c9a84c", letterSpacing: 4 }}>ALKOWN GLOBAL</div>
          <div style={{ color: "#555", fontSize: 13, marginTop: 4 }}>www.alkownglobal.com</div>
        </div>

        <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: 32 }}>
          <h2 style={{ color: "#fff", textAlign: "center", margin: "0 0 24px", fontSize: 20 }}>التحقق من الفاتورة</h2>

          {loading && <p style={{ color: "#666", textAlign: "center" }}>جارٍ التحقق...</p>}

          {!loading && valid === false && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
              <div style={{ color: "#e05252", fontSize: 16, fontWeight: 700 }}>فاتورة غير صحيحة</div>
              <div style={{ color: "#666", fontSize: 14, marginTop: 8 }}>لم يُعثر على هذه الفاتورة في سجلاتنا.</div>
            </div>
          )}

          {!loading && valid && invoice && (
            <>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
                <div style={{ color: "#2f8f5b", fontSize: 16, fontWeight: 700 }}>فاتورة موثّقة</div>
                <div style={{ color: "#c9a84c", fontWeight: 800, fontSize: 18, marginTop: 8 }}>{invoice.invoice_number}</div>
              </div>

              {[
                ["العميل", invoice.requests?.clients?.full_name],
                ["الهاتف", invoice.requests?.clients?.phone],
                ["الخدمة", invoice.requests?.services?.name],
                ["المبلغ", `$${Number(invoice.amount).toLocaleString()} USD`],
                ["الحالة", invoice.status === "Paid" ? "✅ مدفوعة" : "⏳ معلّقة"],
                ["التاريخ", new Date(invoice.created_at).toLocaleDateString("ar")],
              ].map(([k, v]) => v && (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e1e1e" }}>
                  <span style={{ color: "#666", fontSize: 14 }}>{k}</span>
                  <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{v}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <p style={{ textAlign: "center", color: "#333", fontSize: 12, marginTop: 20 }}>
          info@alkowngroup.com | +90 534 764 1249
        </p>
      </div>
    </div>
  );
}
