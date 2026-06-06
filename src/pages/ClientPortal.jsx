import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/* ═══════════════════════════════════════════════════════════════
   ALKOWN GLOBAL — Client Portal
   بوابة العملاء الحقيقية
═══════════════════════════════════════════════════════════════ */

const GOLD = "#c9a84c";
const BG = "#0a0a0a";
const CARD = "#111";
const BORDER = "#1e1e1e";
const MUTED = "#666";

const STATUS_AR = {
  "New": "جديد", "In Progress": "قيد التنفيذ",
  "Pending Documents": "بانتظار وثائق", "Approved": "موافق عليه",
  "Rejected": "مرفوض", "Completed": "مكتمل",
};
const STATUS_COLOR = {
  "New": "#c9a84c", "In Progress": "#3d6f9f",
  "Pending Documents": "#c28a25", "Approved": "#2f8f5b",
  "Rejected": "#e05252", "Completed": "#555",
};
const STATUS_STEPS = ["New", "In Progress", "Pending Documents", "Approved", "Completed"];

// ── Styles ────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: BG, fontFamily: "'Tajawal','Tajawal',sans-serif", direction: "rtl", color: "#fff" },
  card: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16 },
  input: { width: "100%", padding: "12px 16px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 10, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "'Tajawal',sans-serif" },
  btn: { background: GOLD, color: "#000", border: "none", borderRadius: 10, padding: "13px 24px", fontWeight: 700, cursor: "pointer", fontSize: 15, width: "100%" },
  ghost: { background: "transparent", color: GOLD, border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  tab: (active) => ({
    background: "transparent", border: "none", borderBottom: `2px solid ${active ? GOLD : "transparent"}`,
    color: active ? GOLD : MUTED, padding: "10px 18px", cursor: "pointer", fontWeight: active ? 700 : 400,
    fontSize: 14, transition: "all .2s",
  }),
};

export default function ClientPortal({ lang = "ar" }) {
  const ar = lang === "ar";
  const [view, setView] = useState("entry"); // entry | login | register | portal | track
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user);
        loadClient(data.session.user.email);
      } else {
        setLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        loadClient(session.user.email);
      } else {
        setUser(null);
        setClient(null);
        setLoading(false);
        setView("entry");
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadClient(email) {
    setLoading(true);
    const { data } = await supabase.from("clients").select("*").eq("email", email).maybeSingle();
    setClient(data || null);
    setLoading(false);
    setView("portal");
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (loading) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: GOLD, fontSize: 22, fontWeight: 900, letterSpacing: 3, marginBottom: 16 }}>ALKOWN GLOBAL</div>
        <div style={{ color: MUTED, fontSize: 14 }}>جارٍ التحقق...</div>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      {view === "entry" && <EntryView setView={setView} ar={ar} />}
      {view === "login" && <LoginView setView={setView} ar={ar} />}
      {view === "register" && <RegisterView setView={setView} ar={ar} />}
      {view === "track" && <TrackView setView={setView} ar={ar} />}
      {view === "portal" && user && (
        <PortalView user={user} client={client} ar={ar} onSignOut={signOut} />
      )}
    </div>
  );
}

// ── Entry ─────────────────────────────────────────────────────
function EntryView({ setView, ar }) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: GOLD, letterSpacing: 3, marginBottom: 6 }}>ALKOWN GLOBAL</div>
        <div style={{ color: MUTED, fontSize: 14 }}>بوابتك نحو العالم</div>
      </div>
      <div style={{ ...S.card, padding: 32 }}>
        <h2 style={{ textAlign: "center", margin: "0 0 8px", fontSize: 22 }}>بوابة العملاء</h2>
        <p style={{ textAlign: "center", color: MUTED, fontSize: 14, marginBottom: 32 }}>تابع طلباتك وفواتيرك ومستنداتك</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button style={S.btn} onClick={() => setView("login")}>تسجيل الدخول</button>
          <button style={{ ...S.btn, background: "#1a1a1a", color: "#fff", border: `1px solid ${BORDER}` }} onClick={() => setView("register")}>إنشاء حساب جديد</button>
          <div style={{ textAlign: "center", color: MUTED, fontSize: 13, margin: "4px 0" }}>أو</div>
          <button style={S.ghost} onClick={() => setView("track")}>تتبع طلب برقمه فقط 🔍</button>
        </div>
      </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────
function LoginView({ setView, ar }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (err) setError("البريد أو كلمة المرور غير صحيحة");
  }

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "60px 24px" }}>
      <button onClick={() => setView("entry")} style={{ ...S.ghost, marginBottom: 24, width: "auto" }}>← رجوع</button>
      <div style={{ ...S.card, padding: 32 }}>
        <h2 style={{ margin: "0 0 24px", fontSize: 22 }}>تسجيل الدخول</h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ color: MUTED, fontSize: 13, display: "block", marginBottom: 6 }}>البريد الإلكتروني</label>
            <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <label style={{ color: MUTED, fontSize: 13, display: "block", marginBottom: 6 }}>كلمة المرور</label>
            <input style={S.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          {error && <div style={{ background: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: 8, padding: "10px 14px", color: "#e05252", fontSize: 14 }}>{error}</div>}
          <button style={{ ...S.btn, opacity: loading ? .7 : 1 }} type="submit" disabled={loading}>
            {loading ? "جارٍ الدخول..." : "دخول"}
          </button>
        </form>
        <p style={{ textAlign: "center", color: MUTED, fontSize: 13, marginTop: 20 }}>
          ما عندك حساب؟{" "}
          <button onClick={() => setView("register")} style={{ background: "none", border: "none", color: GOLD, cursor: "pointer", fontSize: 13 }}>إنشاء حساب</button>
        </p>
      </div>
    </div>
  );
}

// ── Register ──────────────────────────────────────────────────
function RegisterView({ setView, ar }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("كلمتا المرور غير متطابقتين"); return; }
    if (form.password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    setLoading(true);

    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
    });

    if (authErr) { setError(authErr.message); setLoading(false); return; }

    // إنشاء العميل في جدول clients
    if (data.user) {
      await supabase.from("clients").upsert([{
        full_name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
      }], { onConflict: "email" });
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "60px 24px" }}>
      <button onClick={() => setView("entry")} style={{ ...S.ghost, marginBottom: 24, width: "auto" }}>← رجوع</button>
      <div style={{ ...S.card, padding: 32 }}>
        <h2 style={{ margin: "0 0 24px", fontSize: 22 }}>إنشاء حساب</h2>
        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[["الاسم الكامل", "name", "text"], ["البريد الإلكتروني", "email", "email"], ["رقم الهاتف", "phone", "tel"]].map(([lbl, k, tp]) => (
            <div key={k}>
              <label style={{ color: MUTED, fontSize: 13, display: "block", marginBottom: 6 }}>{lbl}</label>
              <input style={S.input} type={tp} value={form[k]} onChange={upd(k)} required />
            </div>
          ))}
          <div>
            <label style={{ color: MUTED, fontSize: 13, display: "block", marginBottom: 6 }}>كلمة المرور</label>
            <input style={S.input} type="password" value={form.password} onChange={upd("password")} required minLength={6} />
          </div>
          <div>
            <label style={{ color: MUTED, fontSize: 13, display: "block", marginBottom: 6 }}>تأكيد كلمة المرور</label>
            <input style={S.input} type="password" value={form.confirm} onChange={upd("confirm")} required />
          </div>
          {error && <div style={{ background: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: 8, padding: "10px 14px", color: "#e05252", fontSize: 14 }}>{error}</div>}
          <button style={{ ...S.btn, opacity: loading ? .7 : 1 }} type="submit" disabled={loading}>
            {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
          </button>
        </form>
        <p style={{ textAlign: "center", color: MUTED, fontSize: 13, marginTop: 20 }}>
          عندك حساب؟{" "}
          <button onClick={() => setView("login")} style={{ background: "none", border: "none", color: GOLD, cursor: "pointer", fontSize: 13 }}>تسجيل الدخول</button>
        </p>
      </div>
    </div>
  );
}

// ── Track (بدون حساب) ─────────────────────────────────────────
function TrackView({ setView, ar }) {
  const [reqNum, setReqNum] = useState("");
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(e) {
    e.preventDefault();
    setError(""); setRequest(null); setLoading(true);
    const { data, error: err } = await supabase
      .from("requests")
      .select("*, services(name), clients(full_name)")
      .eq("request_number", reqNum.trim().toUpperCase())
      .maybeSingle();
    setLoading(false);
    if (err || !data) { setError("لم يُعثر على طلب بهذا الرقم."); return; }
    setRequest(data);
  }

  const stepIdx = request ? STATUS_STEPS.indexOf(request.status) : -1;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px" }}>
      <button onClick={() => setView("entry")} style={{ ...S.ghost, marginBottom: 24, width: "auto" }}>← رجوع</button>
      <div style={{ ...S.card, padding: 32 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>تتبع طلبك</h2>
        <p style={{ color: MUTED, fontSize: 14, marginBottom: 24 }}>أدخل رقم الطلب للاطلاع على آخر تحديث</p>
        <form onSubmit={search} style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <input style={{ ...S.input }} placeholder="REQ-..." value={reqNum} onChange={e => setReqNum(e.target.value)} required />
          <button style={{ ...S.btn, width: "auto", padding: "12px 20px", whiteSpace: "nowrap" }} type="submit" disabled={loading}>
            {loading ? "..." : "بحث"}
          </button>
        </form>
        {error && <div style={{ color: "#e05252", fontSize: 14, textAlign: "center", padding: 16 }}>{error}</div>}
        {request && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ color: GOLD, fontWeight: 900, fontSize: 16 }}>{request.request_number}</span>
              <span style={{ background: `${STATUS_COLOR[request.status]}22`, color: STATUS_COLOR[request.status], padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                {STATUS_AR[request.status] || request.status}
              </span>
            </div>
            {request.status !== "Rejected" && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= stepIdx;
                  return (
                    <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                      {i < STATUS_STEPS.length - 1 && (
                        <div style={{ position: "absolute", top: 13, left: "50%", width: "100%", height: 2, background: done && i < stepIdx ? GOLD : BORDER, zIndex: 0 }} />
                      )}
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? GOLD : "#1a1a1a", border: `2px solid ${done ? GOLD : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, fontSize: 12, fontWeight: 700, color: done ? "#000" : MUTED }}>
                        {done && i < stepIdx ? "✓" : i + 1}
                      </div>
                      <div style={{ fontSize: 10, color: done ? GOLD : MUTED, marginTop: 5, textAlign: "center", maxWidth: 60 }}>{STATUS_AR[step]}</div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
              {[["الخدمة", request.services?.name], ["العميل", request.clients?.full_name], ["التاريخ", new Date(request.created_at).toLocaleDateString("ar")]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ color: MUTED, fontSize: 13 }}>{k}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Portal (بعد تسجيل الدخول) ─────────────────────────────────
function PortalView({ user, client, ar, onSignOut }) {
  const [tab, setTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (client) loadData();
    else setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  async function loadData() {
    setLoading(true);
    const [reqRes, invRes] = await Promise.all([
      supabase.from("requests").select("*, services(name, price, price_min, price_max)").eq("client_id", client.id).order("created_at", { ascending: false }),
      supabase.from("invoices").select("*, requests(request_number, services(name))").order("created_at", { ascending: false }),
    ]);
    const allReqs = reqRes.data || [];
    const allInvs = invRes.data || [];
    const reqIds = allReqs.map(r => r.id);
    setRequests(allReqs);
    setInvoices(allInvs.filter(i => reqIds.includes(i.request_id)));
    setLoading(false);
  }

  async function loadFiles(requestId) {
    const { data } = await supabase.from("request_files").select("*").eq("request_id", requestId).order("created_at", { ascending: false });
    setFiles(data || []);
  }

  async function openFile(file) {
    const { data } = await supabase.storage.from("request-documents").createSignedUrl(file.storage_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  async function uploadFile(e, requestId) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const safeName = file.name.replace(/[^\w.-]+/g, "-");
    const path = `${requestId}/${Date.now()}-${safeName}`;
    const { error: upErr } = await supabase.storage.from("request-documents").upload(path, file);
    if (!upErr) {
      await supabase.from("request_files").insert([{ request_id: requestId, file_type: "وثيقة", file_name: file.name, storage_path: path }]);
      await loadFiles(requestId);
    }
    setUploading(false);
  }

  function priceLabel(s) {
    if (!s) return null;
    if (s.price_min && s.price_max) return `$${Number(s.price_min).toLocaleString()} – $${Number(s.price_max).toLocaleString()} USD`;
    if (s.price_min) return `$${Number(s.price_min).toLocaleString()}+ USD`;
    if (s.price) return `$${Number(s.price).toLocaleString()} USD`;
    return null;
  }

  const initial = (client?.full_name || user.email || "A")[0].toUpperCase();
  const activeReqs = requests.filter(r => !["Completed", "Rejected"].includes(r.status)).length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#000" }}>{initial}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{client?.full_name || "مرحباً"}</div>
            <div style={{ color: MUTED, fontSize: 13 }}>{user.email}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ color: GOLD, fontWeight: 900, letterSpacing: 2, fontSize: 15 }}>ALKOWN GLOBAL</div>
          <button onClick={onSignOut} style={{ ...S.ghost, padding: "7px 14px", fontSize: 12 }}>خروج</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        <StatBox label="إجمالي الطلبات" value={requests.length} color={GOLD} />
        <StatBox label="طلبات نشطة" value={activeReqs} color="#3d6f9f" />
        <StatBox label="الفواتير" value={invoices.length} color="#2f8f5b" />
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, marginBottom: 24, display: "flex", gap: 0 }}>
        {[["requests", `طلباتي (${requests.length})`], ["invoices", `الفواتير (${invoices.length})`], ["docs", "المستندات"]].map(([k, lbl]) => (
          <button key={k} style={S.tab(tab === k)} onClick={() => setTab(k)}>{lbl}</button>
        ))}
      </div>

      {loading && <p style={{ color: MUTED, textAlign: "center", padding: 40 }}>جارٍ التحميل...</p>}

      {/* Requests Tab */}
      {!loading && tab === "requests" && (
        <div>
          {requests.length === 0 ? (
            <EmptyState icon="📋" text="لا توجد طلبات بعد" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {requests.map(req => {
                const stepIdx = STATUS_STEPS.indexOf(req.status);
                const open = selectedReq === req.id;
                return (
                  <div key={req.id} style={{ ...S.card, overflow: "hidden" }}>
                    <div
                      style={{ padding: "18px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}
                      onClick={() => { setSelectedReq(open ? null : req.id); if (!open) loadFiles(req.id); }}
                    >
                      <div>
                        <div style={{ color: GOLD, fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{req.request_number}</div>
                        <div style={{ fontSize: 14 }}>{req.services?.name || "—"}</div>
                        {priceLabel(req.services) && <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>{priceLabel(req.services)}</div>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ background: `${STATUS_COLOR[req.status]}22`, color: STATUS_COLOR[req.status], padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                          {STATUS_AR[req.status] || req.status}
                        </span>
                        <span style={{ color: MUTED, fontSize: 18 }}>{open ? "▲" : "▼"}</span>
                      </div>
                    </div>

                    {open && (
                      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "20px" }}>
                        {/* Progress */}
                        {req.status !== "Rejected" && (
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                            {STATUS_STEPS.map((step, i) => {
                              const done = i <= stepIdx;
                              return (
                                <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                                  {i < STATUS_STEPS.length - 1 && (
                                    <div style={{ position: "absolute", top: 13, left: "50%", width: "100%", height: 2, background: done && i < stepIdx ? GOLD : BORDER, zIndex: 0 }} />
                                  )}
                                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? GOLD : "#1a1a1a", border: `2px solid ${done ? GOLD : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, fontSize: 12, fontWeight: 700, color: done ? "#000" : MUTED }}>
                                    {done && i < stepIdx ? "✓" : i + 1}
                                  </div>
                                  <div style={{ fontSize: 10, color: done ? GOLD : MUTED, marginTop: 5, textAlign: "center" }}>{STATUS_AR[step]}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div style={{ display: "grid", gap: 0, marginBottom: 20 }}>
                          {[["التاريخ", new Date(req.created_at).toLocaleDateString("ar")], ["ملاحظات", req.notes]].filter(([, v]) => v).map(([k, v]) => (
                            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
                              <span style={{ color: MUTED, fontSize: 13 }}>{k}</span>
                              <span style={{ fontSize: 13, maxWidth: "60%", textAlign: "end" }}>{v}</span>
                            </div>
                          ))}
                        </div>

                        {/* Files */}
                        <div style={{ background: "#0d0d0d", borderRadius: 10, padding: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <span style={{ color: GOLD, fontSize: 13, fontWeight: 700 }}>المستندات ({files.length})</span>
                            <label style={{ ...S.ghost, padding: "6px 14px", cursor: "pointer", fontSize: 12 }}>
                              {uploading ? "جارٍ الرفع..." : "+ رفع ملف"}
                              <input type="file" style={{ display: "none" }} onChange={e => uploadFile(e, req.id)} disabled={uploading} accept="image/*,.pdf" />
                            </label>
                          </div>
                          {files.length === 0 ? (
                            <p style={{ color: MUTED, fontSize: 13, textAlign: "center", padding: "8px 0" }}>لا توجد ملفات.</p>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {files.map(f => (
                                <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: CARD, borderRadius: 8, padding: "10px 14px" }}>
                                  <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>📎 {f.file_name}</div>
                                    <div style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>{f.file_type}</div>
                                  </div>
                                  <button onClick={() => openFile(f)} style={{ ...S.ghost, padding: "5px 12px", fontSize: 12 }}>فتح</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {!loading && tab === "invoices" && (
        <div>
          {invoices.length === 0 ? (
            <EmptyState icon="💰" text="لا توجد فواتير بعد" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {invoices.map(inv => (
                <div key={inv.id} style={{ ...S.card, padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ color: GOLD, fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{inv.invoice_number || "—"}</div>
                      <div style={{ fontSize: 13, color: MUTED }}>{inv.requests?.services?.name || "—"}</div>
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{new Date(inv.created_at).toLocaleDateString("ar")}</div>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>${Number(inv.amount).toLocaleString()}</div>
                      <span style={{
                        background: inv.status === "Paid" ? "rgba(47,143,91,.2)" : "rgba(194,138,37,.2)",
                        color: inv.status === "Paid" ? "#2f8f5b" : "#c28a25",
                        padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700
                      }}>
                        {inv.status === "Paid" ? "✅ مدفوعة" : "⏳ معلّقة"}
                      </span>
                    </div>
                  </div>
                  {inv.status === "Pending" && (
                    <div style={{ marginTop: 14, background: "#0d0d0d", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: MUTED, borderRight: `3px solid ${GOLD}` }}>
                      <div style={{ color: GOLD, fontWeight: 700, marginBottom: 6 }}>بيانات التحويل</div>
                      <div>مصرف رويا | IBAN: AE27 1325 4490 9522 0000 001</div>
                      <div style={{ marginTop: 4 }}>المرجع: <strong style={{ color: GOLD }}>{inv.invoice_number}</strong></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {!loading && tab === "docs" && (
        <div style={{ ...S.card, padding: 24 }}>
          <p style={{ color: MUTED, textAlign: "center", fontSize: 14 }}>
            لرفع المستندات، اذهب إلى تبويب <span style={{ color: GOLD, cursor: "pointer" }} onClick={() => setTab("requests")}>"طلباتي"</span> واختر الطلب المطلوب.
          </p>
        </div>
      )}

      {/* Contact */}
      <div style={{ ...S.card, padding: 20, marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>تحتاج مساعدة؟</div>
          <div style={{ color: MUTED, fontSize: 13 }}>فريقنا جاهز على مدار الساعة</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="https://wa.me/971544909522" target="_blank" rel="noreferrer" style={{ ...S.ghost, textDecoration: "none", fontSize: 13 }}>💬 واتساب</a>
          <a href="mailto:info@alkownglobal.com" style={{ ...S.ghost, textDecoration: "none", fontSize: 13 }}>✉️ إيميل</a>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 900, color, marginBottom: 4 }}>{value}</div>
      <div style={{ color: MUTED, fontSize: 12 }}>{label}</div>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ color: MUTED, fontSize: 15 }}>{text}</div>
    </div>
  );
}
