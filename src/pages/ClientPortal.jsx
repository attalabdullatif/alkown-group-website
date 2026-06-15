import { useEffect, useRef, useState, useCallback } from "react"; // eslint-disable-line no-unused-vars
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
  page: { minHeight: "100vh", background: BG, fontFamily: "'Dubai','Cairo','Segoe UI',sans-serif", direction: "rtl", color: "#fff" },
  card: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16 },
  input: { width: "100%", padding: "12px 16px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 10, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "'Cairo',sans-serif" },
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
// Required document categories for outstanding-requirements checklist
const REQUIRED_DOC_TYPES = [
  { key: "passport",   label: "جواز السفر" },
  { key: "photo",      label: "صورة شخصية" },
  { key: "bank",       label: "كشف حساب بنكي" },
  { key: "employment", label: "وثيقة عمل/دخل" },
];

function PortalView({ user, client, ar, onSignOut }) {
  const [tab,           setTab]         = useState("requests");
  const [requests,      setRequests]    = useState([]);
  const [invoices,      setInvoices]    = useState([]);
  const [files,         setFiles]       = useState([]);
  const [reqHistory,    setReqHistory]  = useState({});   // { [requestId]: historyRows[] }
  const [messages,      setMessages]    = useState([]);
  const [notifications, setNotifs]      = useState([]);
  const [appointments,  setAppointments] = useState([]);
  const [selectedReq,   setSelectedReq] = useState(null);
  const [loading,       setLoading]     = useState(true);
  const [uploading,     setUploading]   = useState(false);
  const [clientData,    setClientData]  = useState(client);

  const unreadMsgs  = messages.filter(m => !m.is_read && m.sender === "staff").length;
  const unreadNotifs = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (client) {
      loadData();
      // Real-time subscription for new messages
      const sub = supabase
        .channel(`msgs-${client.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "client_messages", filter: `client_id=eq.${client.id}` },
          payload => setMessages(prev => [payload.new, ...prev])
        )
        .subscribe();
      return () => supabase.removeChannel(sub);
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  async function loadData() {
    setLoading(true);
    const [reqRes, invRes, msgRes, notifRes, apptRes] = await Promise.all([
      supabase.from("requests").select("*, services(name, price, price_min, price_max)").eq("client_id", client.id).order("created_at", { ascending: false }),
      supabase.from("invoices").select("*, requests(request_number, services(name))").order("created_at", { ascending: false }),
      supabase.from("client_messages").select("*").eq("client_id", client.id).order("created_at", { ascending: false }).limit(100),
      supabase.from("client_notifications").select("*").eq("client_id", client.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("appointments").select("*").eq("client_id", client.id).order("appointment_date", { ascending: false }).limit(20).catch(() => ({ data: [] })),
    ]);
    const allReqs = reqRes.data || [];
    const allInvs = invRes.data || [];
    const reqIds  = allReqs.map(r => r.id);
    setRequests(allReqs);
    setInvoices(allInvs.filter(i => reqIds.includes(i.request_id)));
    setMessages(msgRes.data || []);
    setNotifs(notifRes.data || []);
    setAppointments(apptRes.data || []);
    setLoading(false);
  }

  async function loadHistory(requestId) {
    if (reqHistory[requestId]) return; // already loaded
    const { data } = await supabase
      .from("request_history")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true });
    setReqHistory(prev => ({ ...prev, [requestId]: data || [] }));
  }

  async function markNotifsRead() {
    if (!client) return;
    await supabase.from("client_notifications").update({ is_read: true }).eq("client_id", client.id).eq("is_read", false);
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  async function markMessagesRead() {
    if (!client) return;
    await supabase.from("client_messages").update({ is_read: true }).eq("client_id", client.id).eq("sender", "staff").eq("is_read", false);
    setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
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
      <div style={{ borderBottom: `1px solid ${BORDER}`, marginBottom: 24, display: "flex", gap: 0, overflowX: "auto" }}>
        {[
          ["requests",     `طلباتي (${requests.length})`],
          ["invoices",     `الفواتير (${invoices.length})`],
          ["docs",         "المستندات"],
          ["appointments", null],
          ["messages",     null],
          ["notifs",       null],
          ["profile",      "الملف الشخصي"],
        ].map(([k, lbl]) => {
          const badge = k === "messages" ? unreadMsgs : k === "notifs" ? unreadNotifs : 0;
          const label = lbl || (k === "messages" ? "رسائل" : k === "notifs" ? "إشعارات" : k === "appointments" ? "المواعيد" : k);
          return (
            <button key={k} style={{ ...S.tab(tab === k), position: "relative", whiteSpace: "nowrap" }}
              onClick={() => {
                setTab(k);
                if (k === "messages") markMessagesRead();
                if (k === "notifs") markNotifsRead();
              }}>
              {label}
              {badge > 0 && (
                <span style={{ position: "absolute", top: 4, right: 4, minWidth: 16, height: 16, background: "#e05252", borderRadius: 10, fontSize: 10, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
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
                      onClick={() => { setSelectedReq(open ? null : req.id); if (!open) { loadFiles(req.id); loadHistory(req.id); } }}
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
                        {/* ── Enhanced Progress Timeline ── */}
                        {req.status !== "Rejected" && (
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 14 }}>📍 مسار الطلب</div>
                            {/* Horizontal step indicators */}
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, position: "relative" }}>
                              <div style={{ position: "absolute", top: 14, right: 0, left: 0, height: 2, background: BORDER, zIndex: 0 }} />
                              {STATUS_STEPS.map((step, i) => {
                                const done = i <= stepIdx;
                                const current = i === stepIdx;
                                const histRow = (reqHistory[req.id] || []).find(h => h.to_stage === step || h.new_status === step);
                                return (
                                  <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                                    {i < STATUS_STEPS.length - 1 && done && i < stepIdx && (
                                      <div style={{ position: "absolute", top: 14, left: "-50%", right: "50%", height: 2, background: GOLD, zIndex: 0 }} />
                                    )}
                                    <div style={{
                                      width: 30, height: 30, borderRadius: "50%",
                                      background: done ? GOLD : "#1a1a1a",
                                      border: `2px solid ${done ? GOLD : BORDER}`,
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      fontSize: 12, fontWeight: 900,
                                      color: done ? "#000" : MUTED,
                                      boxShadow: current ? `0 0 0 4px ${GOLD}33` : "none",
                                      transition: "all .3s",
                                    }}>
                                      {i < stepIdx ? "✓" : i + 1}
                                    </div>
                                    <div style={{ fontSize: 10, color: done ? GOLD : MUTED, marginTop: 6, textAlign: "center", lineHeight: 1.4 }}>{STATUS_AR[step]}</div>
                                    {histRow && (
                                      <div style={{ fontSize: 9, color: MUTED, marginTop: 3, textAlign: "center" }}>
                                        {new Date(histRow.created_at).toLocaleDateString("ar", { month: "short", day: "numeric" })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Vertical history log */}
                            {(reqHistory[req.id] || []).length > 0 && (
                              <div style={{ marginTop: 16, borderRight: `2px solid ${BORDER}`, paddingRight: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                                {(reqHistory[req.id] || []).slice().reverse().map((h, i) => (
                                  <div key={h.id || i} style={{ position: "relative" }}>
                                    <div style={{ position: "absolute", top: 6, right: -19, width: 8, height: 8, borderRadius: "50%", background: GOLD, border: `2px solid #0a0a0a` }} />
                                    <div style={{ fontSize: 12, color: "#ddd" }}>
                                      {h.to_stage || h.new_status ? `انتقل إلى: ${STATUS_AR[h.to_stage || h.new_status] || h.to_stage || h.new_status}` : h.note || h.notes || "تحديث"}
                                    </div>
                                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                                      {new Date(h.created_at).toLocaleString("ar", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                      {h.changed_by || h.created_by ? ` — ${h.changed_by || h.created_by}` : ""}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── Outstanding Requirements Checklist ── */}
                        {req.status === "Pending Documents" && (
                          <div style={{ marginBottom: 20, background: "#0d0d0d", borderRadius: 10, padding: 16, border: `1px solid ${GOLD}33` }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#c28a25", marginBottom: 12 }}>⚠️ المستندات المطلوبة</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {REQUIRED_DOC_TYPES.map(dt => {
                                const uploaded = files.some(f =>
                                  (f.file_type || "").toLowerCase().includes(dt.key) ||
                                  (f.file_name || "").toLowerCase().includes(dt.key)
                                );
                                return (
                                  <div key={dt.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 16 }}>{uploaded ? "✅" : "❌"}</span>
                                    <span style={{ fontSize: 13, color: uploaded ? "#2f8f5b" : "#e05252", fontWeight: uploaded ? 600 : 700 }}>{dt.label}</span>
                                    {!uploaded && <span style={{ fontSize: 11, color: MUTED }}>— مطلوب رفعه</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div style={{ display: "grid", gap: 0, marginBottom: 20 }}>
                          {[["تاريخ الطلب", new Date(req.created_at).toLocaleDateString("ar")], ["ملاحظات", req.notes]].filter(([, v]) => v).map(([k, v]) => (
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

      {/* Appointments Tab */}
      {!loading && tab === "appointments" && (
        <AppointmentsTab appointments={appointments} />
      )}

      {/* Messages Tab */}
      {!loading && tab === "messages" && (
        <MessagesTab client={client} messages={messages} setMessages={setMessages} requests={requests} />
      )}

      {/* Notifications Tab */}
      {!loading && tab === "notifs" && (
        <NotificationsTab notifications={notifications} />
      )}

      {/* Profile Tab */}
      {!loading && tab === "profile" && (
        <ProfileTab
          user={user}
          client={clientData}
          onUpdate={(updated) => setClientData(updated)}
        />
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

// ── Messages Tab ──────────────────────────────────────────────
function MessagesTab({ client, messages, setMessages, requests }) {
  const [text, setText] = useState("");
  const [reqId, setReqId] = useState("");
  const [sending, setSending] = useState(false);

  async function sendMessage(e) {
    e.preventDefault();
    if (!text.trim() || !client) return;
    setSending(true);
    const payload = {
      client_id:   client.id,
      request_id:  reqId || null,
      sender:      "client",
      sender_name: client.full_name || "العميل",
      message:     text.trim(),
      is_read:     false,
    };
    const { data, error } = await supabase.from("client_messages").insert([payload]).select().single();
    if (!error && data) {
      setMessages(prev => [data, ...prev]);
      setText("");
      // إشعار الموظفين برسالة جديدة
      fetch("/api/send-contact-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:          "new_message",
          client:        { full_name: client?.full_name, email: client?.email, phone: client?.phone },
          message:       text.trim(),
          requestNumber: reqId ? requests.find(r => r.id === reqId)?.request_number : "",
        }),
      }).catch(e => console.warn("Message notification failed:", e));
    }
    setSending(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Send form */}
      <div style={{ ...S.card, padding: 20 }}>
        <div style={{ color: GOLD, fontWeight: 700, marginBottom: 14, fontSize: 14 }}>💬 رسالة جديدة لفريق الدعم</div>
        <form onSubmit={sendMessage} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {requests.length > 0 && (
            <select value={reqId} onChange={e => setReqId(e.target.value)} style={{ ...S.input, cursor: "pointer" }}>
              <option value="">اختر الطلب المرتبط (اختياري)</option>
              {requests.map(r => <option key={r.id} value={r.id}>{r.request_number} — {r.services?.name || "—"}</option>)}
            </select>
          )}
          <textarea
            required value={text} onChange={e => setText(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            style={{ ...S.input, minHeight: 90, resize: "vertical" }}
          />
          <button type="submit" disabled={sending || !text.trim()} style={{ ...S.btn, opacity: sending ? .7 : 1 }}>
            {sending ? "جارٍ الإرسال..." : "إرسال الرسالة ✉️"}
          </button>
        </form>
      </div>

      {/* Messages list */}
      {messages.length === 0 ? (
        <EmptyState icon="💬" text="لا توجد رسائل بعد — أرسل رسالتك الأولى" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map(m => (
            <div key={m.id} style={{
              display: "flex", flexDirection: "column",
              alignItems: m.sender === "client" ? "flex-end" : "flex-start",
            }}>
              <div style={{
                maxWidth: "75%", padding: "12px 16px", borderRadius: 14,
                background: m.sender === "client" ? `${GOLD}22` : "#1a1a1a",
                border: `1px solid ${m.sender === "client" ? GOLD + "44" : BORDER}`,
              }}>
                <div style={{ fontSize: 13, lineHeight: 1.7 }}>{m.message}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 6, display: "flex", gap: 8, justifyContent: "space-between" }}>
                  <span style={{ color: m.sender === "client" ? GOLD : "#3d6f9f", fontWeight: 700 }}>
                    {m.sender === "client" ? "أنت" : m.sender_name}
                  </span>
                  <span>{new Date(m.created_at).toLocaleString("ar", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Notifications Tab ─────────────────────────────────────────
const NOTIF_ICON = {
  status_update: "🔄", new_message: "💬", invoice_ready: "💰",
  document_request: "📄", approval: "✅", rejection: "❌", general: "🔔",
};

// ── Appointments Tab ──────────────────────────────────────────
const APPT_STATUS_AR = { scheduled: "مجدول", completed: "مكتمل", cancelled: "ملغي", pending: "بانتظار التأكيد" };
const APPT_STATUS_COLOR = { scheduled: "#3d6f9f", completed: "#2f8f5b", cancelled: "#e05252", pending: "#c28a25" };

function AppointmentsTab({ appointments }) {
  if (!appointments || appointments.length === 0) {
    return (
      <div>
        <EmptyState icon="📅" text="لا توجد مواعيد مسجّلة" />
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a href="https://wa.me/971544909522?text=أود حجز موعد" target="_blank" rel="noreferrer"
            style={{ display: "inline-block", background: "#25d366", color: "#fff", padding: "12px 28px", borderRadius: 10, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
            💬 حجز موعد عبر واتساب
          </a>
        </div>
      </div>
    );
  }

  const upcoming = appointments.filter(a => a.status === "scheduled" && new Date(a.appointment_date) >= new Date());
  const past = appointments.filter(a => a.status !== "scheduled" || new Date(a.appointment_date) < new Date());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {upcoming.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 10 }}>📅 المواعيد القادمة</div>
          {upcoming.map(appt => (
            <AppointmentCard key={appt.id} appt={appt} />
          ))}
        </div>
      )}
      {past.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, marginBottom: 10 }}>📜 سجل المواعيد</div>
          {past.map(appt => (
            <AppointmentCard key={appt.id} appt={appt} />
          ))}
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ appt }) {
  const status = appt.status || "pending";
  const color = APPT_STATUS_COLOR[status] || MUTED;
  const apptDate = appt.appointment_date ? new Date(appt.appointment_date) : null;
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px 20px", marginBottom: 10, borderRight: `3px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
            {appt.title || appt.service_type || "موعد استشاري"}
          </div>
          {apptDate && (
            <div style={{ color: MUTED, fontSize: 13 }}>
              📅 {apptDate.toLocaleDateString("ar", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              {appt.appointment_time ? ` — ⏰ ${appt.appointment_time}` : ""}
            </div>
          )}
          {appt.location && <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>📍 {appt.location}</div>}
          {appt.notes && <div style={{ color: "#aaa", fontSize: 12, marginTop: 6, fontStyle: "italic" }}>{appt.notes}</div>}
        </div>
        <span style={{ background: `${color}22`, color, padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
          {APPT_STATUS_AR[status] || status}
        </span>
      </div>
    </div>
  );
}

// ── Notifications Tab ─────────────────────────────────────────
function NotificationsTab({ notifications }) {
  if (notifications.length === 0) return <EmptyState icon="🔔" text="لا توجد إشعارات بعد" />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {notifications.map(n => (
        <div key={n.id} style={{
          ...S.card, padding: "14px 18px",
          borderRight: `3px solid ${n.is_read ? BORDER : GOLD}`,
          opacity: n.is_read ? .75 : 1,
        }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ fontSize: 22 }}>{NOTIF_ICON[n.type] || "🔔"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{n.title_ar}</div>
              {n.body_ar && <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.6 }}>{n.body_ar}</div>}
              <div style={{ color: MUTED, fontSize: 11, marginTop: 6 }}>
                {new Date(n.created_at).toLocaleString("ar", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: GOLD, flexShrink: 0, marginTop: 4 }} />}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────
function ProfileTab({ user, client, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState("");
  const [pwMode,  setPwMode]  = useState(false);
  const [form, setForm] = useState({
    full_name: client?.full_name || "",
    phone:     client?.phone     || "",
    email:     client?.email     || user?.email || "",
    address:   client?.address   || "",
    nationality: client?.nationality || "",
    passport_number: client?.passport_number || "",
  });
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setPw = (k, v) => setPwForm(f => ({ ...f, [k]: v }));

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function saveProfile() {
    if (!form.full_name.trim()) { showToast("⚠️ الاسم مطلوب"); return; }
    setSaving(true);
    try {
      if (client?.id) {
        const { data, error } = await supabase
          .from("clients")
          .update({ full_name: form.full_name, phone: form.phone, address: form.address, nationality: form.nationality, passport_number: form.passport_number })
          .eq("id", client.id)
          .select()
          .single();
        if (error) throw error;
        onUpdate(data);
      }
      setEditing(false);
      showToast("✅ تم حفظ البيانات");
    } catch (e) {
      showToast("❌ " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (pwForm.next !== pwForm.confirm) { showToast("⚠️ كلمتا المرور غير متطابقتين"); return; }
    if (pwForm.next.length < 6) { showToast("⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.next });
      if (error) throw error;
      setPwForm({ current: "", next: "", confirm: "" });
      setPwMode(false);
      showToast("✅ تم تغيير كلمة المرور");
    } catch (e) {
      showToast("❌ " + e.message);
    } finally {
      setSaving(false);
    }
  }

  const initial = (client?.full_name || user?.email || "A")[0].toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", color: "#fff", padding: "10px 24px", borderRadius: 30, fontSize: 13, zIndex: 9999, border: `1px solid ${GOLD}44`, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {/* Avatar + name */}
      <div style={{ ...S.card, padding: "28px 24px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${GOLD}, #f0d080)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#000", flexShrink: 0 }}>
          {initial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{client?.full_name || "—"}</div>
          <div style={{ color: MUTED, fontSize: 13, marginBottom: 4 }}>{user?.email}</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${GOLD}18`, border: `1px solid ${GOLD}33`, borderRadius: 20, padding: "3px 12px", fontSize: 12, color: GOLD, fontWeight: 700 }}>
            👑 عميل متميز
          </div>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} style={{ ...S.ghost, fontSize: 13, padding: "9px 18px", whiteSpace: "nowrap" }}>
            ✏️ تعديل البيانات
          </button>
        )}
      </div>

      {/* Info / Edit form */}
      <div style={{ ...S.card, padding: 24 }}>
        <div style={{ color: GOLD, fontWeight: 700, fontSize: 14, marginBottom: 18 }}>📋 البيانات الشخصية</div>

        {!editing ? (
          /* View mode */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 0 }}>
            {[
              ["👤 الاسم الكامل", form.full_name || "—"],
              ["📧 البريد الإلكتروني", user?.email || "—"],
              ["📞 رقم الهاتف", form.phone || "—"],
              ["🏠 العنوان", form.address || "—"],
              ["🌍 الجنسية", form.nationality || "—"],
              ["🛂 رقم جواز السفر", form.passport_number ? form.passport_number.replace(/.(?=.{4})/g, "*") : "—"],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: "12px 0", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ color: MUTED, fontSize: 11, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: label.includes("جواز") ? ".15em" : "normal" }}>{value}</div>
              </div>
            ))}
          </div>
        ) : (
          /* Edit mode */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["full_name",      "👤 الاسم الكامل",       "text",  "محمد عبدالله"],
              ["phone",          "📞 رقم الهاتف",          "tel",   "+971 50 000 0000"],
              ["address",        "🏠 العنوان",             "text",  "دبي، الإمارات"],
              ["nationality",    "🌍 الجنسية",             "text",  "سوري / إماراتي..."],
              ["passport_number","🛂 رقم جواز السفر",      "text",  "A12345678"],
            ].map(([key, label, type, ph]) => (
              <div key={key}>
                <label style={{ display: "block", color: MUTED, fontSize: 12, marginBottom: 5 }}>{label}</label>
                <input
                  type={type} value={form[key]} placeholder={ph}
                  onChange={e => set(key, e.target.value)}
                  style={S.input}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={saveProfile} disabled={saving} style={{ ...S.btn, flex: 1, opacity: saving ? .7 : 1 }}>
                {saving ? "جارٍ الحفظ..." : "💾 حفظ البيانات"}
              </button>
              <button onClick={() => setEditing(false)} style={{ ...S.ghost, flex: 1 }}>إلغاء</button>
            </div>
          </div>
        )}
      </div>

      {/* Security */}
      <div style={{ ...S.card, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: pwMode ? 18 : 0 }}>
          <div style={{ color: GOLD, fontWeight: 700, fontSize: 14 }}>🔐 الأمان وكلمة المرور</div>
          {!pwMode && (
            <button onClick={() => setPwMode(true)} style={{ ...S.ghost, fontSize: 12, padding: "7px 14px" }}>تغيير كلمة المرور</button>
          )}
        </div>
        {pwMode && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["next",    "كلمة المرور الجديدة"],
              ["confirm", "تأكيد كلمة المرور"],
            ].map(([k, label]) => (
              <div key={k}>
                <label style={{ display: "block", color: MUTED, fontSize: 12, marginBottom: 5 }}>{label}</label>
                <input type="password" value={pwForm[k]} onChange={e => setPw(k, e.target.value)} style={S.input} placeholder="••••••••" />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={changePassword} disabled={saving} style={{ ...S.btn, flex: 1, opacity: saving ? .7 : 1 }}>
                {saving ? "جارٍ التحديث..." : "🔐 تحديث كلمة المرور"}
              </button>
              <button onClick={() => setPwMode(false)} style={{ ...S.ghost, flex: 1 }}>إلغاء</button>
            </div>
          </div>
        )}
      </div>

      {/* Account info */}
      <div style={{ ...S.card, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ color: MUTED, fontSize: 12 }}>
          🗓 عضو منذ: {user?.created_at ? new Date(user.created_at).toLocaleDateString("ar", { year: "numeric", month: "long" }) : "—"}
        </div>
        <div style={{ display: "flex", gap: 6, fontSize: 12, color: MUTED }}>
          <span>معرّف الحساب:</span>
          <span style={{ fontFamily: "monospace", letterSpacing: ".05em" }}>{user?.id?.slice(0, 8)}...</span>
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
