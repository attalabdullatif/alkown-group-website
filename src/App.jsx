import { lazy, Suspense, createContext, useContext, useState as useDarkState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { signOut } from "./lib/auth";
import { ContentProvider } from "./context/ContentContext";

// ── Eager: critical path (landing + auth) ──────────────────────
import MainWebsite from "./MainWebsite";
import Login from "./pages/Login";

// ── Lazy: all other routes — each becomes its own JS chunk ──────
const Dashboard            = lazy(() => import("./dashboard/Dashboard"));
const Clients              = lazy(() => import("./pages/Clients"));
const Services             = lazy(() => import("./pages/Services"));
const Requests             = lazy(() => import("./pages/Requests"));
const Accounting           = lazy(() => import("./pages/Accounting"));
const VisaCenterPage       = lazy(() => import("./pages/visa/VisaCenterPage"));
const VisaChecker          = lazy(() => import("./pages/visa/VisaChecker"));
const VisaRoutePage        = lazy(() => import("./pages/visa/VisaRoutePage"));
const VisaAdminIntelligence= lazy(() => import("./pages/visa/VisaAdminIntelligence"));
const CompanyFormation     = lazy(() => import("./pages/CompanyFormation"));
const Residency            = lazy(() => import("./pages/Residency"));
const Travel               = lazy(() => import("./pages/Travel"));
const KnowledgeCenter      = lazy(() => import("./pages/KnowledgeCenter"));
const TrackRequest         = lazy(() => import("./pages/TrackRequest"));
const VerifyInvoice        = lazy(() => import("./pages/VerifyInvoice"));
const ClientPortal         = lazy(() => import("./pages/ClientPortal"));

// ── Phase 2 — New Features ────────────────────────────────────
const VisaPipeline         = lazy(() => import("./pages/pipeline/VisaPipeline"));
const TaskDashboard        = lazy(() => import("./pages/tasks/TaskDashboard"));
const DocumentCenter       = lazy(() => import("./pages/documents/DocumentCenter"));
const NotificationCenter   = lazy(() => import("./pages/notifications/NotificationCenter"));
const ManagementDashboard  = lazy(() => import("./pages/dashboards/ManagementDashboard"));
const SalesDashboard       = lazy(() => import("./pages/dashboards/SalesDashboard"));
const FinanceDashboard     = lazy(() => import("./pages/dashboards/FinanceDashboard"));
const VisaDatabase         = lazy(() => import("./pages/visa/VisaDatabase"));

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

// ── Dark Mode Context ──────────────────────────────────────────
const DarkCtx = createContext({ dark: false, toggle: () => {} });
export const useDark = () => useContext(DarkCtx);

const NAV_LINKS = [
  { to: "/dashboard",    label: "📊 لوحة التحكم",      roles: ["admin","manager","staff"] },
  { to: "/clients",      label: "👥 العملاء",           roles: ["admin","manager"] },
  { to: "/services",     label: "🛎️ الخدمات",           roles: ["admin","manager"] },
  { to: "/requests",     label: "📋 الطلبات",           roles: ["admin","manager","staff"] },
  { to: "/pipeline",     label: "🗂️ خط الطلبات",         roles: ["admin","manager","staff"] },
  { to: "/tasks",        label: "✅ المهام",              roles: ["admin","manager","staff"] },
  { to: "/documents",    label: "📁 الوثائق",             roles: ["admin","manager","staff"] },
  { to: "/notifications",label: "🔔 الإشعارات",           roles: ["admin","manager"] },
  { to: "/accounting",   label: "💼 الفواتير والمحاسبة",  roles: ["admin","manager"] },
  { to: "/dash/management", label: "📊 الإدارة",          roles: ["admin"] },
  { to: "/dash/sales",      label: "📈 المبيعات",         roles: ["admin","manager"] },
  { to: "/dash/finance",    label: "💹 المالية",          roles: ["admin","manager"] },
  { to: "/visa-admin",       label: "🛂 إدارة التأشيرات",   roles: ["admin","manager"] },
  { to: "/ai",             label: "🤖 الذكاء الاصطناعي",  roles: ["admin","manager"] },
  { to: "/track-request",label: "🔍 تتبع الطلب",        roles: null },
  { to: "/portal",       label: "🚪 بوابة العملاء",     roles: null },
];

function Navigation() {
  const { user, role } = useAuth();
  const { dark, toggle } = useDark();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useDarkState(false);

  async function handleSignOut() {
    await signOut();
    navigate("/login");
    setMenuOpen(false);
  }

  const visible = NAV_LINKS.filter(n => !n.roles || !user || n.roles.includes(role));

  return (
    <div className="no-print" style={{
      background: "linear-gradient(135deg,#1a1510,#2a2018)",
      borderBottom: "1px solid rgba(201,168,76,.18)",
      padding: "0 24px",
      direction: "rtl",
      fontFamily: "'Dubai','Cairo','Noto Naskh Arabic',sans-serif",
    }}>
      {/* Top bar */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", maxWidth:1400, margin:"0 auto", padding:"10px 0" }}>
        <Link to="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ color:"#c9a84c", fontWeight:800, fontSize:"1.1rem", letterSpacing:".05em" }}>الكون</span>
          <span style={{ color:"rgba(255,255,255,.35)", fontSize:".72rem", letterSpacing:".18em" }}>GLOBAL · CRM</span>
        </Link>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button
            onClick={toggle}
            title={dark ? "الوضع الفاتح" : "الوضع الداكن"}
            style={{
              background: dark ? "rgba(201,168,76,.15)" : "rgba(255,255,255,.08)",
              border: `1px solid ${dark ? "rgba(201,168,76,.4)" : "rgba(255,255,255,.15)"}`,
              color: dark ? "#c9a84c" : "rgba(255,255,255,.6)",
              borderRadius: 8, padding: "5px 10px", cursor: "pointer",
              fontSize: "1rem", lineHeight: 1, transition: "all .2s",
            }}
          >
            {dark ? "☀️" : "🌙"}
          </button>
          {user && (
            <>
              <span style={{ color:"rgba(255,255,255,.35)", fontSize:".78rem" }} className="hide-mobile">
                {role === "admin" ? "👑" : role === "manager" ? "🏢" : "👤"} {role}
              </span>
              <button onClick={handleSignOut} className="hide-mobile" style={{
                background:"rgba(255,80,80,.08)", color:"#ff6b6b",
                border:"1px solid rgba(255,80,80,.25)", padding:"6px 14px",
                borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:".78rem", fontWeight:700,
              }}>
                تسجيل الخروج
              </button>
            </>
          )}
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="show-mobile"
            style={{
              background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)",
              color:"rgba(255,255,255,.7)", borderRadius:8, padding:"6px 10px",
              cursor:"pointer", fontSize:"1.1rem", lineHeight:1,
              display:"none",
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Nav links — desktop: wrap, mobile: dropdown */}
      <div style={{ maxWidth:1400, margin:"0 auto" }}>
        {/* Desktop */}
        <div className="nav-desktop" style={{ display:"flex", flexWrap:"wrap", gap:0, paddingBottom:6 }}>
          {visible.map(n => (
            <NavLink key={n.to} to={n.to}>{n.label}</NavLink>
          ))}
        </div>
        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="nav-mobile" style={{
            display:"flex", flexDirection:"column", paddingBottom:12,
            borderTop:"1px solid rgba(201,168,76,.12)",
          }}>
            {visible.map(n => (
              <NavLink key={n.to} to={n.to} onClick={() => setMenuOpen(false)}>{n.label}</NavLink>
            ))}
            {user && (
              <button onClick={handleSignOut} style={{
                background:"rgba(255,80,80,.08)", color:"#ff6b6b",
                border:"1px solid rgba(255,80,80,.25)", padding:"10px 16px",
                borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:".85rem", fontWeight:700,
                margin:"8px 0 0", textAlign:"right",
              }}>
                تسجيل الخروج
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .show-mobile  { display: flex !important; }
          .hide-mobile  { display: none !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile   { display: none !important; }
          .show-mobile  { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function NavLink({ to, children, onClick }) {
  const active = window.location.pathname === to || window.location.pathname.startsWith(to + "/");
  return (
    <Link to={to} onClick={onClick} style={{
      textDecoration:"none", whiteSpace:"nowrap",
      padding:"10px 16px", fontSize:".85rem", fontWeight: active ? 700 : 500,
      color: active ? "#c9a84c" : "rgba(255,255,255,.6)",
      borderBottom: active ? "2px solid #c9a84c" : "2px solid transparent",
      fontFamily:"'Cairo','Noto Naskh Arabic',sans-serif",
      transition:"all .2s",
    }}>
      {children}
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
      <div className={dark ? "crm-dark" : ""} style={dark ? {
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

        {/* MAIN WEBSITE — eager */}
        <Route path="/" element={<MainWebsite />} />

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

        <Route path="/pipeline" element={
          <ProtectedRoute allowed={["admin", "manager", "staff"]}>
            <PageLayout><VisaPipeline /></PageLayout>
          </ProtectedRoute>
        } />

        <Route path="/visa-database" element={
          <ProtectedRoute allowed={["admin", "manager"]}>
            <PageLayout><VisaDatabase /></PageLayout>
          </ProtectedRoute>
        } />

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

        <Route path="/dash/management" element={
          <ProtectedRoute allowed={["admin"]}>
            <PageLayout><ManagementDashboard /></PageLayout>
          </ProtectedRoute>
        } />

        <Route path="/dash/sales" element={
          <ProtectedRoute allowed={["admin", "manager"]}>
            <PageLayout><SalesDashboard /></PageLayout>
          </ProtectedRoute>
        } />

        <Route path="/dash/finance" element={
          <ProtectedRoute allowed={["admin", "manager"]}>
            <PageLayout><FinanceDashboard /></PageLayout>
          </ProtectedRoute>
        } />

        <Route path="/invoices" element={
          <ProtectedRoute allowed={["admin", "manager"]}>
            <AccountingPage />
          </ProtectedRoute>
        } />

        <Route path="/accounting" element={
          <ProtectedRoute allowed={["admin", "manager"]}>
            <AccountingPage />
          </ProtectedRoute>
        } />

        {/* Visa */}
        <Route path="/visa-checker" element={<VisaChecker />} />

        {/* Public pages — lazy */}
        <Route path="/visa-center"        element={<VisaCenterPage />} />
        <Route path="/company-formation"  element={<CompanyFormation />} />
        <Route path="/residency"          element={<Residency />} />
        <Route path="/travel"             element={<Travel />} />
        <Route path="/knowledge-center"   element={<KnowledgeCenter />} />
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

      </Routes>
      </Suspense>
    </BrowserRouter>
    </ContentProvider>
    </DarkCtx.Provider>
  );
}
