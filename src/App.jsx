import { lazy, Suspense, createContext, useContext, useState as useDarkState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { signOut } from "./lib/auth";
import { getRoleLabel, normalizeRole } from "./lib/rbac";
import { ContentProvider } from "./context/ContentContext";

// ── Eager: critical path (landing + auth) ──────────────────────
import MainWebsite from "./MainWebsite";
import { PUBLIC_PATHS } from "./lib/publicRoutes";
import Login from "./pages/Login";

// ── Lazy: all other routes — each becomes its own JS chunk ──────
const Dashboard            = lazy(() => import("./dashboard/Dashboard"));
const Clients              = lazy(() => import("./pages/Clients"));
const Services             = lazy(() => import("./pages/Services"));
const Requests             = lazy(() => import("./pages/Requests"));
const Accounting           = lazy(() => import("./pages/Accounting"));
const VisaChecker          = lazy(() => import("./pages/visa/VisaChecker"));
const VisaRoutePage        = lazy(() => import("./pages/visa/VisaRoutePage"));
const VisaAdminIntelligence= lazy(() => import("./pages/visa/VisaAdminIntelligence"));
const TrackRequest         = lazy(() => import("./pages/TrackRequest"));
const VerifyInvoice        = lazy(() => import("./pages/VerifyInvoice"));
const ClientPortal         = lazy(() => import("./pages/ClientPortal"));

// ── Phase 2 — New Features ────────────────────────────────────
const TaskDashboard        = lazy(() => import("./pages/tasks/TaskDashboard"));
const DocumentCenter       = lazy(() => import("./pages/documents/DocumentCenter"));
const NotificationCenter   = lazy(() => import("./pages/notifications/NotificationCenter"));

// ── AI Knowledge Engine — lazy chunks ─────────────────────────
const AICommandCenter = lazy(() => import("./pages/ai/AICommandCenter"));
const KnowledgeBase   = lazy(() => import("./pages/ai/KnowledgeBase"));
const RAGSearch       = lazy(() => import("./pages/ai/RAGSearch"));
const AgentHub        = lazy(() => import("./pages/ai/AgentHub"));
const ContentEngine   = lazy(() => import("./pages/ai/ContentEngine"));
const ContentCalendar = lazy(() => import("./pages/ai/ContentCalendar"));
const BrandMemory     = lazy(() => import("./pages/ai/BrandMemory"));

// ── Lazy fallback ──────────────────────────────────────────────
function PageLoader() {
  return <div className="lazy-fallback">الكون ···</div>;
}

// ── 404 — unknown URLs used to render a blank page ─────────────
function NotFound() {
  useEffect(() => { document.title = "الصفحة غير موجودة | الكون العالمية"; }, []);
  return (
    <div style={{
      minHeight: "100vh", background: "#0f0d09", color: "#fff", direction: "rtl",
      fontFamily: "'Cairo','Noto Naskh Arabic',sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24,
    }}>
      <div style={{ maxWidth: 480 }}>
        <div style={{ color: "#c9a84c", fontSize: "4rem", fontWeight: 900, lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "16px 0 10px" }}>الصفحة غير موجودة</h1>
        <p style={{ color: "rgba(255,255,255,.55)", lineHeight: 1.8, marginBottom: 28 }}>
          ربما تغيّر الرابط أو حُذفت الصفحة. يمكنك العودة للرئيسية أو فحص متطلبات تأشيرتك.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/" style={{ background: "#c9a84c", color: "#1a1510", padding: "12px 24px", borderRadius: 10, fontWeight: 800, textDecoration: "none" }}>
            الصفحة الرئيسية
          </Link>
          <Link to="/visa-checker" style={{ border: "1px solid rgba(201,168,76,.4)", color: "#c9a84c", padding: "12px 24px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>
            فحص التأشيرة
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Dark Mode Context ──────────────────────────────────────────
const DarkCtx = createContext({ dark: false, toggle: () => {} });
export const useDark = () => useContext(DarkCtx);

// ── Admin navigation — grouped side menu (right side, RTL) ────
// Roles here must match each route's <ProtectedRoute allowed> below.
const STAFF = ["admin", "manager", "staff"];
const MANAGERS = ["admin", "manager"];

const NAV_GROUPS = [
  { title: null, items: [
    { to: "/dashboard",     icon: "📊", label: "لوحة التحكم",          roles: STAFF },
  ]},
  { title: "العمل اليومي", items: [
    { to: "/requests",      icon: "📋", label: "الطلبات",              roles: STAFF },
    { to: "/clients",       icon: "👥", label: "العملاء",              roles: MANAGERS },
    { to: "/tasks",         icon: "✅", label: "المهام",               roles: STAFF },
    { to: "/documents",     icon: "📁", label: "الوثائق",              roles: STAFF },
  ]},
  { title: "المالية", items: [
    { to: "/accounting",    icon: "💼", label: "الفواتير والمحاسبة",   roles: MANAGERS },
  ]},
  { title: "الإعدادات", items: [
    { to: "/services",      icon: "🛎️", label: "الخدمات",              roles: MANAGERS },
    { to: "/visa-admin",    icon: "🛂", label: "إدارة التأشيرات",      roles: MANAGERS },
    { to: "/notifications", icon: "🔔", label: "الإشعارات",            roles: MANAGERS },
  ]},
  { title: "الذكاء الاصطناعي", items: [
    { to: "/ai",            icon: "🤖", label: "مركز الذكاء الاصطناعي", roles: MANAGERS },
  ]},
];

// Same rule as ProtectedRoute: compare normalised roles ("Admin" === "admin")
function canSee(item, role) {
  return item.roles.map(r => normalizeRole(r)).includes(normalizeRole(role));
}

const SIDEBAR_WIDTH = 236;

function Navigation() {
  const { role } = useAuth();
  const { dark, toggle } = useDark();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useDarkState(false);

  // Close the mobile drawer after navigating
  useEffect(() => { setMenuOpen(false); }, [pathname, setMenuOpen]);

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  const groups = NAV_GROUPS
    .map(g => ({ ...g, items: g.items.filter(item => canSee(item, role)) }))
    .filter(g => g.items.length);

  const smallBtn = {
    background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)",
    color: "rgba(255,255,255,.7)", borderRadius: 8, padding: "6px 10px",
    cursor: "pointer", fontSize: ".95rem", lineHeight: 1, fontFamily: "inherit",
  };

  return (
    <div className="no-print" style={{ direction: "rtl", fontFamily: "'Dubai','Cairo','Noto Naskh Arabic',sans-serif" }}>
      {/* Mobile top bar */}
      <div className="crm-topbar" style={{
        display: "none", position: "sticky", top: 0, zIndex: 40,
        background: "linear-gradient(135deg,#1a1510,#2a2018)",
        borderBottom: "1px solid rgba(201,168,76,.18)",
        padding: "10px 16px", justifyContent: "space-between", alignItems: "center",
      }}>
        <Brand />
        <button onClick={() => setMenuOpen(o => !o)} style={smallBtn} aria-label="القائمة">
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && <div className="crm-backdrop" onClick={() => setMenuOpen(false)} />}

      <aside className={`crm-sidebar${menuOpen ? " open" : ""}`} style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: SIDEBAR_WIDTH, zIndex: 50,
        background: "linear-gradient(180deg,#1a1510,#231b13)",
        borderLeft: "1px solid rgba(201,168,76,.18)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "18px 18px 12px" }}><Brand /></div>

        <nav style={{ flex: 1, overflowY: "auto", padding: "4px 10px 12px" }}>
          {groups.map((g, i) => (
            <div key={g.title || i} style={{ marginTop: g.title ? 14 : 0 }}>
              {g.title && (
                <div style={{ color: "rgba(201,168,76,.55)", fontSize: ".68rem", fontWeight: 700, letterSpacing: ".08em", padding: "0 10px 6px" }}>
                  {g.title}
                </div>
              )}
              {g.items.map(item => (
                <NavLink key={item.to} item={item} active={pathname === item.to || pathname.startsWith(item.to + "/")} />
              ))}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid rgba(201,168,76,.12)", padding: "12px 14px", display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ color: "rgba(255,255,255,.45)", fontSize: ".78rem" }}>
              👤 {role ? getRoleLabel(role) : "—"}
            </span>
            <button onClick={toggle} title={dark ? "الوضع الفاتح" : "الوضع الداكن"} style={smallBtn}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
          <a href="/" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,.55)", fontSize: ".8rem", textDecoration: "none" }}>
            🌐 عرض الموقع ↗
          </a>
          <button onClick={handleSignOut} style={{
            background: "rgba(255,80,80,.08)", color: "#ff6b6b",
            border: "1px solid rgba(255,80,80,.25)", padding: "8px 14px",
            borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: ".8rem", fontWeight: 700,
          }}>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <style>{`
        .crm-content { margin-right: ${SIDEBAR_WIDTH}px; }
        .crm-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 45; }
        @media (max-width: 900px) {
          .crm-content  { margin-right: 0; }
          .crm-topbar   { display: flex !important; }
          .crm-sidebar  { transform: translateX(100%); transition: transform .2s ease; }
          .crm-sidebar.open { transform: none; box-shadow: -8px 0 30px rgba(0,0,0,.4); }
        }
        @media print { .crm-content { margin-right: 0; } }
      `}</style>
    </div>
  );
}

function Brand() {
  return (
    <Link to="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: "#c9a84c", fontWeight: 800, fontSize: "1.1rem", letterSpacing: ".05em" }}>الكون</span>
      <span style={{ color: "rgba(255,255,255,.35)", fontSize: ".68rem", letterSpacing: ".18em" }}>GLOBAL · CRM</span>
    </Link>
  );
}

function NavLink({ item, active }) {
  return (
    <Link to={item.to} style={{
      display: "flex", alignItems: "center", gap: 10,
      textDecoration: "none", padding: "9px 12px", marginBottom: 2, borderRadius: 8,
      fontSize: ".86rem", fontWeight: active ? 700 : 500,
      color: active ? "#c9a84c" : "rgba(255,255,255,.68)",
      background: active ? "rgba(201,168,76,.12)" : "transparent",
      borderRight: `3px solid ${active ? "#c9a84c" : "transparent"}`,
      transition: "background .15s, color .15s",
    }}>
      <span style={{ width: 20, textAlign: "center" }}>{item.icon}</span>
      {item.label}
    </Link>
  );
}

function PageLayout({ children }) {
  const { dark } = useDark();

  // تطبيق لون الـ body حسب الوضع
  useEffect(() => {
    document.body.style.background = dark ? "#0d0b08" : "";
    document.body.style.margin = "0";
  }, [dark]);

  return (
    <div style={{
      background: dark ? "#0d0b08" : "#f5f0e8",
      minHeight: "100vh",
    }}>
      {/* Navigation — لا تتأثر بالـ invert */}
      <Navigation />
      {/* المحتوى — يتأثر بالوضع الليلي */}
      <div className={dark ? "crm-content crm-dark" : "crm-content"} style={dark ? {
        filter: "invert(1) hue-rotate(180deg)",
      } : {}}>
        <div style={{ padding: "20px" }}>
          {children}
        </div>
      </div>
      {dark && (
        // Counter-invert media so photos, logos, and anything tagged
        // data-keep-color render with their true colors instead of flipped.
        <style>{`
          .crm-dark img,
          .crm-dark video,
          .crm-dark canvas,
          .crm-dark [data-keep-color] {
            filter: invert(1) hue-rotate(180deg);
          }
        `}</style>
      )}
    </div>
  );
}

function DashboardPage() {
  return (
    <PageLayout>
      <Dashboard />
    </PageLayout>
  );
}

function ClientsPage() {
  return (
    <PageLayout>
      <Clients />
    </PageLayout>
  );
}

function ServicesPage() {
  return (
    <PageLayout>
      <Services />
    </PageLayout>
  );
}

function RequestsPage() {
  return (
    <PageLayout>
      <Requests />
    </PageLayout>
  );
}

function AccountingPage() {
  return (
    <PageLayout>
      <Accounting />
    </PageLayout>
  );
}

function LoginPage() {
  return <Login />;
}

export default function App() {
  const [dark, setDark] = useDarkState(() => localStorage.getItem("crm-dark") === "1");
  const toggleDark = () => setDark(d => { const n = !d; localStorage.setItem("crm-dark", n ? "1" : "0"); return n; });

  return (
    <DarkCtx.Provider value={{ dark, toggle: toggleDark }}>
    <ContentProvider>
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* MAIN WEBSITE — eager. Each public section has its own URL; all of
            them render the full site (nav + footer), which syncs the section
            with the URL. */}
        {PUBLIC_PATHS.map(path => (
          <Route key={path} path={path} element={<MainWebsite />} />
        ))}

        {/* CRM — محمي — lazy chunks */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowed={["admin", "manager", "staff"]}>
            <DashboardPage />
          </ProtectedRoute>
        } />

        <Route path="/clients" element={
          <ProtectedRoute allowed={["admin", "manager"]}>
            <ClientsPage />
          </ProtectedRoute>
        } />

        <Route path="/services" element={
          <ProtectedRoute allowed={["admin", "manager"]}>
            <ServicesPage />
          </ProtectedRoute>
        } />

        <Route path="/requests" element={
          <ProtectedRoute allowed={["admin", "manager", "staff"]}>
            <RequestsPage />
          </ProtectedRoute>
        } />

        {/* The pipeline board now lives in Requests (board view) */}
        <Route path="/pipeline" element={<Navigate to="/requests" replace />} />

        <Route path="/tasks" element={
          <ProtectedRoute allowed={["admin", "manager", "staff"]}>
            <PageLayout><TaskDashboard /></PageLayout>
          </ProtectedRoute>
        } />

        <Route path="/documents" element={
          <ProtectedRoute allowed={["admin", "manager", "staff"]}>
            <PageLayout><DocumentCenter /></PageLayout>
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute allowed={["admin", "manager"]}>
            <PageLayout><NotificationCenter /></PageLayout>
          </ProtectedRoute>
        } />

        <Route path="/invoices" element={<Navigate to="/accounting" replace />} />

        <Route path="/accounting" element={
          <ProtectedRoute allowed={["admin", "manager"]}>
            <AccountingPage />
          </ProtectedRoute>
        } />

        {/* Visa */}
        <Route path="/visa-checker" element={<VisaChecker />} />

        {/* Standalone public tools — lazy */}
        <Route path="/track-request"      element={<TrackRequest />} />
        <Route path="/track-application"  element={<TrackRequest />} />
        <Route path="/verify-invoice"     element={<VerifyInvoice />} />
        <Route path="/portal"             element={<ClientPortal />} />
        <Route path="/visa/:slug"         element={<VisaRoutePage />} />

        <Route path="/visa-admin" element={
          <ProtectedRoute allowed={["admin", "manager"]}>
            <PageLayout><VisaAdminIntelligence /></PageLayout>
          </ProtectedRoute>
        } />

        <Route path="/login"      element={<LoginPage />} />


        {/* ── AI Knowledge Engine ────────────────────────────── */}
        <Route path="/ai" element={
          <ProtectedRoute allowed={["admin","manager"]}>
            <PageLayout><AICommandCenter /></PageLayout>
          </ProtectedRoute>
        } />
        <Route path="/ai/knowledge" element={
          <ProtectedRoute allowed={["admin","manager"]}>
            <PageLayout><KnowledgeBase /></PageLayout>
          </ProtectedRoute>
        } />
        <Route path="/ai/search" element={
          <ProtectedRoute allowed={["admin","manager"]}>
            <PageLayout><RAGSearch /></PageLayout>
          </ProtectedRoute>
        } />
        <Route path="/ai/agents" element={
          <ProtectedRoute allowed={["admin","manager"]}>
            <PageLayout><AgentHub /></PageLayout>
          </ProtectedRoute>
        } />
        <Route path="/ai/content" element={
          <ProtectedRoute allowed={["admin","manager"]}>
            <PageLayout><ContentEngine /></PageLayout>
          </ProtectedRoute>
        } />
        <Route path="/ai/calendar" element={
          <ProtectedRoute allowed={["admin","manager"]}>
            <PageLayout><ContentCalendar /></PageLayout>
          </ProtectedRoute>
        } />
        <Route path="/ai/memory" element={
          <ProtectedRoute allowed={["admin","manager"]}>
            <PageLayout><BrandMemory /></PageLayout>
          </ProtectedRoute>
        } />

        {/* Catch-all: unknown URLs get a real 404 instead of a blank page */}
        <Route path="*" element={<NotFound />} />

      </Routes>
      </Suspense>
    </BrowserRouter>
    </ContentProvider>
    </DarkCtx.Provider>
  );
}
