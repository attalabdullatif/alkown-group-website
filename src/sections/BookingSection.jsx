import { useState, useEffect } from "react";
import { C } from "../utils/theme";
import { supabase } from "../lib/supabase";
import { createRequestForClient, findOrCreateClient } from "../lib/crm";
import PageHero from "./PageHero";

export default function BookingPage({ t, lang, ff }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(null); // { requestNumber, serviceName, servicePrice }
  const [dbServices, setDbServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]); // [{ file, type, preview }]
  const [uploading, setUploading] = useState(false); // eslint-disable-line no-unused-vars
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", whatsapp: "", date: "", time: "", msg: "" });
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const ar = lang === "ar";

  useEffect(() => {
    supabase.from("services").select("*").eq("is_active", true).order("name")
      .then(({ data }) => setDbServices(data || []));
  }, []);

  function validateStep1() {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      alert(ar ? "يرجى تعبئة الاسم والبريد والهاتف" : "Please fill name, email and phone");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      alert(ar ? "بريد إلكتروني غير صحيح" : "Invalid email address");
      return false;
    }
    return true;
  }

  function validateStep2() {
    if (!selectedService) {
      alert(ar ? "يرجى اختيار الخدمة" : "Please select a service");
      return false;
    }
    return true;
  }

  function addFile(e, fileType) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadedFiles(prev => [...prev, { file, type: fileType, id: Date.now() }]);
  }

  function removeFile(id) {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  }

  function priceLabel(s) {
    if (!s) return "—";
    if (s.price_min && s.price_max) return `$${Number(s.price_min).toLocaleString()} – $${Number(s.price_max).toLocaleString()} USD`;
    if (s.price_min) return `$${Number(s.price_min).toLocaleString()}+ USD`;
    if (s.price) return `$${Number(s.price).toLocaleString()} USD`;
    return ar ? "سيتم التحديد" : "TBD";
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const clientData = await findOrCreateClient({ full_name: form.name, phone: form.phone, email: form.email });

      const notes = [
        ar ? "المصدر: نموذج الحجز على الموقع" : "Source: Website Booking Form",
        `${ar ? "الخدمة" : "Service"}: ${selectedService?.name || ""}`,
        form.date ? `${ar ? "التاريخ" : "Date"}: ${form.date}` : "",
        form.time ? `${ar ? "الوقت" : "Time"}: ${form.time}` : "",
        form.whatsapp ? `WhatsApp: ${form.whatsapp}` : "",
        form.msg ? `\n${form.msg}` : ""
      ].filter(Boolean).join("\n");

      const requestData = await createRequestForClient({
        clientId: clientData.id,
        serviceId: selectedService?.id || null,
        status: "New",
        notes
      });

      // رفع الملفات
      if (uploadedFiles.length) {
        setUploading(true);
        for (const { file, type } of uploadedFiles) {
          const safeName = file.name.replace(/[^\w.-]+/g, "-");
          const path = `${requestData.id}/${Date.now()}-${safeName}`;
          const { error: upErr } = await supabase.storage.from("request-documents").upload(path, file);
          if (!upErr) {
            await supabase.from("request_files").insert([{
              request_id: requestData.id,
              file_type: type,
              file_name: file.name,
              storage_path: path
            }]);
          }
        }
        setUploading(false);
      }

      // إرسال الإيميلات
      await fetch("/api/send-contact-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_request",
          requestNumber: requestData.request_number,
          client: clientData,
          form: { ...form, service: selectedService?.name },
          service: { name: selectedService?.name, price: selectedService?.price || selectedService?.price_min }
        })
      });

      setSubmitted({
        requestNumber: requestData.request_number,
        serviceName: selectedService?.name,
        servicePrice: priceLabel(selectedService),
        clientName: form.name,
        clientEmail: form.email,
        whatsapp: form.whatsapp || form.phone
      });
    } catch (err) {
      alert(ar ? `حدث خطأ: ${err.message}` : `Error: ${err.message}`);
    }
    setSubmitting(false);
  }

  const inp = { width: "100%", padding: "13px 16px", border: `1px solid rgba(201,168,76,.25)`, background: C.beige, color: C.g800, fontSize: ".9rem", borderRadius: 2, fontFamily: ff };
  const lbl = { display: "block", color: C.g400, fontSize: ".72rem", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8 };

  // ── صفحة النجاح ──────────────────────────────────────────────
  if (submitted) {
    const waMsg = encodeURIComponent(`مرحباً، لقد أرسلت طلباً عبر الموقع.\nرقم الطلب: ${submitted.requestNumber}\nالخدمة: ${submitted.serviceName}\nالاسم: ${submitted.clientName}`);
    const waLink = `https://wa.me/971544909522?text=${waMsg}`;

    return (
      <>
        <PageHero title={t.booking.hero} subtitle={t.booking.heroSub} />
        <div style={{ background: "#fff", padding: "72px clamp(20px,6vw,80px)" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 20px" }}>✓</div>
              <h2 style={{ color: C.g800, fontSize: "1.8rem", fontWeight: 800, marginBottom: 8 }}>{t.booking.success}</h2>
              <p style={{ color: C.g400 }}>{t.booking.successSub}</p>
            </div>

            {/* بطاقة الطلب */}
            <div style={{ background: C.beige, border: `1px solid rgba(201,168,76,.2)`, borderRadius: 4, padding: "28px 32px", marginBottom: 20 }}>
              <div style={{ color: C.gold, fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 16 }}>{ar ? "تفاصيل الطلب" : "Request Details"}</div>
              {[
                [ar ? "رقم الطلب" : "Request Number", submitted.requestNumber],
                [ar ? "الخدمة" : "Service", submitted.serviceName],
                [ar ? "السعر" : "Price", submitted.servicePrice],
                [ar ? "الاسم" : "Name", submitted.clientName],
                [ar ? "البريد" : "Email", submitted.clientEmail],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid rgba(201,168,76,.12)` }}>
                  <span style={{ color: C.g400, fontSize: ".8rem" }}>{k}</span>
                  <strong style={{ color: C.g800, fontSize: ".88rem" }}>{v}</strong>
                </div>
              ))}
            </div>

            {/* بيانات البنك */}
            <div style={{ background: "#0a0a0a", borderRadius: 4, padding: "24px 28px", marginBottom: 20 }}>
              <div style={{ color: C.gold, fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 16 }}>{t.booking.bankTitle}</div>
              {[
                [ar ? "اسم البنك" : "Bank", "مصرف رويا"],
                [ar ? "اسم الحساب" : "Account Name", "Alkown Group LLC"],
                ["IBAN", "AE27 1325 4490 9522 0000 001"],
                [ar ? "المرجع" : "Reference", submitted.requestNumber],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1a1a", color: "#ccc", fontSize: ".85rem" }}>
                  <span style={{ color: "#666" }}>{k}</span>
                  <strong style={{ color: k === (ar ? "المرجع" : "Reference") ? C.gold : "#fff" }}>{v}</strong>
                </div>
              ))}
              <p style={{ color: "#555", fontSize: ".75rem", marginTop: 12 }}>⚠️ {t.booking.bankNote}</p>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="gbtn" style={{ fontFamily: ff, textDecoration: "none", display: "inline-block" }}>
                📲 {ar ? "إرسال الإيصال عبر واتساب" : "Send Receipt via WhatsApp"}
              </a>
              <button className="obtn" style={{ fontFamily: ff }} onClick={() => { setSubmitted(null); setStep(1); setForm({ name: "", email: "", phone: "", whatsapp: "", date: "", time: "", msg: "" }); setSelectedService(null); setUploadedFiles([]); }}>
                {ar ? "طلب جديد" : "New Request"}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const steps = [t.booking.step1, t.booking.step2, t.booking.step3, t.booking.step4];

  return (
    <>
      <PageHero title={t.booking.hero} subtitle={t.booking.heroSub} />
      <section style={{ padding: "72px clamp(20px,6vw,80px)", background: "#fff" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>

          {/* Step indicator */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", marginBottom: 52, gap: 0 }}>
            {steps.map((label, idx) => {
              const s = idx + 1;
              return (
                <div key={s} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: s <= step ? `linear-gradient(135deg,${C.gold},${C.goldLight})` : C.g100,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: s <= step ? C.g800 : C.g400, fontSize: ".82rem", fontWeight: 800, transition: "all .3s"
                    }}>{s < step ? "✓" : s}</div>
                    <span style={{ fontSize: ".6rem", color: s === step ? C.gold : C.g400, letterSpacing: ".08em", whiteSpace: "nowrap", textAlign: "center", maxWidth: 70 }}>{label}</span>
                  </div>
                  {s < 4 && <div style={{ width: "clamp(24px,5vw,56px)", height: 2, background: s < step ? C.gold : C.g200, margin: "0 6px 22px", transition: "all .3s" }} />}
                </div>
              );
            })}
          </div>

          {/* Step 1 — معلومات شخصية */}
          {step === 1 && (
            <div style={{ animation: "fadeUp .4s ease" }}>
              {[[t.booking.name,"name","text"],[t.booking.email,"email","email"],[t.booking.phone,"phone","tel"],[t.booking.whatsapp,"whatsapp","tel"]].map(([label, key, type]) => (
                <div key={key} style={{ marginBottom: 18 }}>
                  <label style={lbl}>{label}</label>
                  <input type={type} value={form[key]} onChange={upd(key)} style={inp} />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button className="gbtn" style={{ fontFamily: ff }} onClick={() => { if (validateStep1()) setStep(2); }}>
                  {ar ? "التالي ←" : "Next →"}
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — اختيار الخدمة */}
          {step === 2 && (
            <div style={{ animation: "fadeUp .4s ease" }}>
              <div style={{ display: "grid", gap: 12, marginBottom: 24, maxHeight: 420, overflowY: "auto", paddingLeft: 4 }}>
                {dbServices.map(svc => {
                  const isSelected = selectedService?.id === svc.id;
                  return (
                    <div
                      key={svc.id}
                      onClick={() => setSelectedService(svc)}
                      style={{
                        padding: "16px 20px", border: `2px solid ${isSelected ? C.gold : "rgba(201,168,76,.2)"}`,
                        borderRadius: 4, cursor: "pointer", background: isSelected ? `rgba(201,168,76,.06)` : C.beige,
                        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                        transition: "all .2s"
                      }}
                    >
                      <span style={{ color: C.g800, fontWeight: isSelected ? 700 : 500, fontSize: ".9rem" }}>{svc.name}</span>
                      <span style={{ color: C.gold, fontWeight: 700, fontSize: ".85rem", whiteSpace: "nowrap", flexShrink: 0 }}>{priceLabel(svc)}</span>
                    </div>
                  );
                })}
              </div>

              {selectedService && (
                <div style={{ background: "#0a0a0a", border: `1px solid rgba(201,168,76,.3)`, borderRadius: 4, padding: "18px 22px", marginBottom: 20 }}>
                  <div style={{ color: C.gold, fontSize: ".7rem", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8 }}>{ar ? "الخدمة المختارة" : "Selected Service"}</div>
                  <div style={{ color: "#fff", fontWeight: 700 }}>{selectedService.name}</div>
                  <div style={{ color: C.gold, marginTop: 4, fontWeight: 800 }}>{priceLabel(selectedService)}</div>
                  {selectedService.description && <div style={{ color: "#888", fontSize: ".82rem", marginTop: 6 }}>{selectedService.description}</div>}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
                <div>
                  <label style={lbl}>{t.booking.date}</label>
                  <input type="date" value={form.date} onChange={upd("date")} style={inp} min={new Date().toISOString().split("T")[0]} />
                </div>
                <div>
                  <label style={lbl}>{t.booking.time}</label>
                  <select value={form.time} onChange={upd("time")} style={inp}>
                    <option value="">—</option>
                    {t.booking.times.map((ti, i) => <option key={i} value={ti}>{ti}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={lbl}>{t.booking.msg}</label>
                <textarea rows={3} value={form.msg} onChange={upd("msg")} style={{ ...inp, resize: "vertical" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="obtn" style={{ fontFamily: ff }} onClick={() => setStep(1)}>{ar ? "→ السابق" : "← Back"}</button>
                <button className="gbtn" style={{ fontFamily: ff }} onClick={() => { if (validateStep2()) setStep(3); }}>{ar ? "التالي ←" : "Next →"}</button>
              </div>
            </div>
          )}

          {/* Step 3 — رفع الملفات */}
          {step === 3 && (
            <div style={{ animation: "fadeUp .4s ease" }}>
              <p style={{ color: C.g400, marginBottom: 20, fontSize: ".88rem" }}>{t.booking.uploadSub}</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
                {t.booking.fileTypes.map((type, i) => (
                  <label key={i} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    padding: "20px 12px", border: `1px dashed rgba(201,168,76,.35)`,
                    borderRadius: 4, cursor: "pointer", background: C.beige,
                    color: C.g600, fontSize: ".8rem", textAlign: "center"
                  }}>
                    <span style={{ fontSize: "1.6rem" }}>📎</span>
                    {type}
                    <input type="file" style={{ display: "none" }} onChange={e => addFile(e, type)} accept="image/*,.pdf" />
                  </label>
                ))}
              </div>

              {uploadedFiles.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ color: C.g400, fontSize: ".72rem", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 10 }}>
                    {ar ? "الملفات المرفوعة" : "Uploaded Files"} ({uploadedFiles.length})
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {uploadedFiles.map(({ file, type, id }) => (
                      <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.beige, border: `1px solid rgba(201,168,76,.2)`, borderRadius: 4 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: ".85rem", color: C.g800 }}>{file.name}</div>
                          <div style={{ color: C.g400, fontSize: ".75rem" }}>{type}</div>
                        </div>
                        <button onClick={() => removeFile(id)} style={{ background: "transparent", border: "none", color: "#c0392b", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p style={{ color: C.g400, fontSize: ".78rem", marginBottom: 24 }}>
                {ar ? "* رفع الملفات اختياري، يمكنك إرسالها لاحقاً عبر الواتساب." : "* File upload is optional. You can send them later via WhatsApp."}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="obtn" style={{ fontFamily: ff }} onClick={() => setStep(2)}>{ar ? "→ السابق" : "← Back"}</button>
                <button className="gbtn" style={{ fontFamily: ff }} onClick={() => setStep(4)}>{ar ? "التالي ←" : "Next →"}</button>
              </div>
            </div>
          )}

          {/* Step 4 — مراجعة وإرسال */}
          {step === 4 && (
            <div style={{ animation: "fadeUp .4s ease" }}>
              <div style={{ background: C.beige, border: `1px solid rgba(201,168,76,.2)`, borderRadius: 4, padding: "24px 28px", marginBottom: 20 }}>
                <div style={{ color: C.gold, fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 16 }}>{t.booking.reviewTitle}</div>
                {[
                  [t.booking.name, form.name],
                  [t.booking.email, form.email],
                  [t.booking.phone, form.phone],
                  [t.booking.whatsapp, form.whatsapp],
                  [ar ? "الخدمة" : "Service", selectedService?.name],
                  [ar ? "السعر" : "Price", priceLabel(selectedService)],
                  [t.booking.date, form.date],
                  [t.booking.time, form.time],
                  [t.booking.msg, form.msg],
                  [ar ? "عدد الملفات" : "Files", uploadedFiles.length ? `${uploadedFiles.length} ${ar ? "ملفات" : "files"}` : ar ? "لا توجد ملفات" : "None"],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid rgba(201,168,76,.12)`, gap: 12 }}>
                    <span style={{ color: C.g400, fontSize: ".78rem" }}>{k}</span>
                    <span style={{ color: C.g800, fontWeight: 600, fontSize: ".85rem", textAlign: "end" }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* بيانات التحويل */}
              <div style={{ background: "#0a0a0a", borderRadius: 4, padding: "20px 24px", marginBottom: 24 }}>
                <div style={{ color: C.gold, fontSize: ".7rem", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12 }}>{t.booking.bankTitle}</div>
                {[
                  [ar ? "اسم البنك" : "Bank", "مصرف رويا"],
                  [ar ? "اسم الحساب" : "Account Name", "Alkown Group LLC"],
                  ["IBAN", "AE27 1325 4490 9522 0000 001"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1a1a1a", color: "#aaa", fontSize: ".82rem" }}>
                    <span style={{ color: "#555" }}>{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
                <p style={{ color: "#555", fontSize: ".74rem", marginTop: 10 }}>⚠️ {t.booking.bankNote}</p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="obtn" style={{ fontFamily: ff }} onClick={() => setStep(3)}>{ar ? "→ السابق" : "← Back"}</button>
                <button className="gbtn" style={{ fontFamily: ff, opacity: submitting ? .7 : 1 }} onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (ar ? "جارٍ الإرسال..." : "Submitting...") : t.booking.submit}
                </button>
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
