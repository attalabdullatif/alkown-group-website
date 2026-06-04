import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  CRM_COLORS, buttonStyle, cardStyle, formatDate,
  inputStyle, outlineButtonStyle, pageStyle,
} from "../components/crmUi";

const emptyService = { name: "", price: "", price_min: "", price_max: "", description: "", is_active: true };

export default function Services() {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyService);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadServices(); }, []);

  async function loadServices() {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("services").select("*").order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setServices(data || []);
    setLoading(false);
  }

  function editService(service) {
    setSelected(service);
    setForm({
      name: service.name || "",
      price: service.price ?? "",
      price_min: service.price_min ?? "",
      price_max: service.price_max ?? "",
      description: service.description || "",
      is_active: service.is_active ?? true,
    });
  }

  function resetForm() {
    setSelected(null);
    setForm(emptyService);
  }

  async function saveService(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("اسم الخدمة مطلوب.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      price: form.price !== "" ? Number(form.price) : null,
      price_min: form.price_min !== "" ? Number(form.price_min) : null,
      price_max: form.price_max !== "" ? Number(form.price_max) : null,
      description: form.description.trim(),
      is_active: form.is_active,
    };
    const result = selected
      ? await supabase.from("services").update(payload).eq("id", selected.id)
      : await supabase.from("services").insert([payload]);
    setSaving(false);
    if (result.error) { setError(result.error.message); return; }
    resetForm();
    await loadServices();
  }

  async function deleteService(service) {
    const confirmed = window.confirm(`حذف الخدمة "${service.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`);
    if (!confirmed) return;
    const { error: err } = await supabase.from("services").delete().eq("id", service.id);
    if (err) { setError(err.message); return; }
    if (selected?.id === service.id) resetForm();
    await loadServices();
  }

  async function toggleActive(service) {
    await supabase.from("services").update({ is_active: !service.is_active }).eq("id", service.id);
    await loadServices();
  }

  return (
    <div style={pageStyle}>
      <Header />
      {error && <Alert message={error} />}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(300px,.7fr)", gap: 22 }}>
        {/* Table */}
        <section style={{ ...cardStyle, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <span style={{ color: CRM_COLORS.muted, fontSize: 14 }}>
              {services.length} خدمة مسجّلة
            </span>
            <button style={outlineButtonStyle} onClick={loadServices}>تحديث</button>
          </div>

          {loading ? (
            <p style={{ color: CRM_COLORS.muted }}>جارٍ التحميل...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table width="100%" cellPadding="13" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "right", color: CRM_COLORS.muted, borderBottom: `1px solid ${CRM_COLORS.border}`, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" }}>
                    <th>الخدمة</th>
                    <th>السعر</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} style={{ borderBottom: `1px solid ${CRM_COLORS.border}`, transition: "background .15s" }}>
                      <td>
                        <button
                          onClick={() => editService(service)}
                          style={{ border: 0, background: "transparent", color: CRM_COLORS.goldDark, fontWeight: 800, cursor: "pointer", fontSize: 15 }}
                        >
                          {service.name}
                        </button>
                        {service.description && (
                          <div style={{ color: CRM_COLORS.muted, fontSize: 12, marginTop: 2 }}>{service.description}</div>
                        )}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {formatPrice(service)}
                      </td>
                      <td>
                        <span style={{
                          background: service.is_active ? "rgba(47,143,91,.12)" : "rgba(185,74,72,.1)",
                          color: service.is_active ? CRM_COLORS.success : CRM_COLORS.danger,
                          padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700
                        }}>
                          {service.is_active ? "نشطة" : "معطّلة"}
                        </span>
                      </td>
                      <td style={{ color: CRM_COLORS.muted, fontSize: 13 }}>{formatDate(service.created_at).split(",")[0]}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button style={outlineButtonStyle} onClick={() => editService(service)}>تعديل</button>
                          <button style={{ ...outlineButtonStyle, color: CRM_COLORS.muted }} onClick={() => toggleActive(service)}>
                            {service.is_active ? "تعطيل" : "تفعيل"}
                          </button>
                          <button style={{ ...outlineButtonStyle, color: CRM_COLORS.danger }} onClick={() => deleteService(service)}>حذف</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!services.length && (
                    <tr><td colSpan="5" style={{ color: CRM_COLORS.muted, textAlign: "center", padding: 40 }}>لا توجد خدمات.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Form */}
        <aside>
          <section style={{ ...cardStyle, padding: 22 }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>{selected ? "تعديل الخدمة" : "إضافة خدمة"}</h2>
            <form onSubmit={saveService} style={{ display: "grid", gap: 12 }}>
              <input
                placeholder="اسم الخدمة"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="سعر ثابت (USD) — اتركه فارغاً إذا في نطاق"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                style={inputStyle}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input
                  type="number"
                  placeholder="أقل سعر (USD)"
                  value={form.price_min}
                  onChange={e => setForm(f => ({ ...f, price_min: e.target.value }))}
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="أعلى سعر (USD)"
                  value={form.price_max}
                  onChange={e => setForm(f => ({ ...f, price_max: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <textarea
                placeholder="وصف الخدمة (اختياري)"
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ ...inputStyle, resize: "vertical" }}
              />
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: CRM_COLORS.text }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                />
                خدمة نشطة
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={buttonStyle} disabled={saving}>
                  {saving ? "جارٍ الحفظ..." : selected ? "حفظ التعديلات" : "إضافة الخدمة"}
                </button>
                {selected && (
                  <button type="button" style={outlineButtonStyle} onClick={resetForm}>جديد</button>
                )}
              </div>
            </form>
          </section>

          {selected && (
            <section style={{ ...cardStyle, padding: 22, marginTop: 18 }}>
              <h2 style={{ marginTop: 0, fontSize: 18 }}>تفاصيل الخدمة</h2>
              <Detail label="المعرّف" value={selected.id} />
              <Detail label="الاسم" value={selected.name} />
              {selected.price && <Detail label="سعر ثابت" value={`${Number(selected.price).toLocaleString()} USD`} />}
              {selected.price_min && <Detail label="أقل سعر" value={`${Number(selected.price_min).toLocaleString()} USD`} />}
              {selected.price_max && <Detail label="أعلى سعر" value={`${Number(selected.price_max).toLocaleString()} USD`} />}
              <Detail label="الوصف" value={selected.description} />
              <Detail label="الحالة" value={selected.is_active ? "نشطة" : "معطّلة"} />
              <Detail label="تاريخ الإنشاء" value={formatDate(selected.created_at)} />
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function formatPrice(service) {
  const usd = <span style={{ color: CRM_COLORS.muted, fontSize: 12 }}> USD</span>;
  if (service.price_min && service.price_max) {
    return <>{Number(service.price_min).toLocaleString()} – {Number(service.price_max).toLocaleString()}{usd}</>;
  }
  if (service.price_min) {
    return <>{Number(service.price_min).toLocaleString()}+{usd}</>;
  }
  if (service.price) {
    return <>{Number(service.price).toLocaleString()}{usd}</>;
  }
  return <span style={{ color: CRM_COLORS.muted }}>—</span>;
}

function Header() {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ color: CRM_COLORS.goldDark, letterSpacing: ".22em", textTransform: "uppercase", fontSize: 11 }}>Alkown CRM</div>
      <h1 style={{ margin: "6px 0", fontSize: 32 }}>الخدمات</h1>
      <p style={{ color: CRM_COLORS.muted, margin: 0 }}>إدارة خدمات المجموعة وأسعارها.</p>
    </div>
  );
}

function Alert({ message }) {
  return (
    <div style={{ ...cardStyle, borderColor: "rgba(185,74,72,.35)", color: CRM_COLORS.danger, padding: 14, marginBottom: 18 }}>
      {message}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div style={{ borderBottom: `1px solid ${CRM_COLORS.border}`, padding: "10px 0" }}>
      <div style={{ color: CRM_COLORS.muted, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 4 }}>{value || "-"}</div>
    </div>
  );
}
