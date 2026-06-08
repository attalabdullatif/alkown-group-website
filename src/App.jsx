import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import VisaRoutePage from "./pages/visa/VisaRoutePage";
// VisaAdminPage replaced by VisaAdminIntelligence (unified system)
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { signOut } from "./lib/auth";
import { ContentProvider } from "./context/ContentContext";
import SiteAdminPage from "./pages/SiteAdminPage";

import MainWebsite from "./MainWebsite";
import VisaCenterPage from "./pages/visa/VisaCenterPage";
import CompanyFormation from "./pages/CompanyFormation";
import KnowledgeCenter from "./pages/KnowledgeCenter";

import Dashboard from "./dashboard/Dashboard";
import Login from "./pages/Login";
import Services from "./pages/Services";
import Clients from "./pages/Clients";
import Requests from "./pages/Requests";
import Accounting from "./pages/Accounting";
import VisaChecker from "./pages/visa/VisaChecker";
import VisaAdminIntelligence from "./pages/visa/VisaAdminIntelligence";
import TrackRequest from "./pages/TrackRequest";
import VerifyInvoice from "./pages/VerifyInvoice";
import ClientPortal from "./pages/ClientPortal";

const NAV_LINKS = [
  { to: "/dashboard",    label: "📊 لوحة التحكم",      roles: ["admin","manager","staff"] },
  { to: "/clients",      label: "👥 العملاء",           roles: ["admin","manager"] },
  { to: "/services",     label: "🛎️ الخدمات",           roles: ["admin","manager"] },
  { to: "/requests",     label: "📋 الطلبات",           roles: ["admin","manager","staff"] },
  { to: "/accounting",   label: "💼 الفواتير والمحاسبة",  roles: ["admin","manager"] },
  { to: "/visa-admin",       label: "🛂 إدارة التأشيرات",   roles: ["admin","manager"] },
  { to: "/site-admin",   label: "✏️ تعديل الموقع",      roles: ["admin"] },
  { to: "/track-request",label: "🔍 تتبع الطلب",        roles: null },
  { to: "/portal",       label: "🚪 بوابة العملاء",     roles: null },
];

function Navigation() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
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
        {user && (
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ color:"rgba(255,255,255,.35)", fontSize:".78rem" }}>
              {role === "admin" ? "👑" : role === "manager" ? "🏢" : "👤"} {role}
            </span>
            <button onClick={handleSignOut} style={{
              background:"rgba(255,80,80,.08)", color:"#ff6b6b",
              border:"1px solid rgba(255,80,80,.25)", padding:"6px 14px",
              borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:".78rem", fontWeight:700,
            }}>
              تسجيل الخروج
            </button>
          </div>
        )}
      </div>

      {/* Nav links */}
      <div style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:1, maxWidth:1400, margin:"0 auto" }}>
        {visible.map(n => (
          <NavLink key={n.to} to={n.to}>{n.label}</NavLink>
        ))}
      </div>
    </div>
  );
}

function NavLink({ to, children }) {
  const active = window.location.pathname === to;
  return (
    <Link to={to} style={{
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
  return (
    <div>
      <Navigation />

      <div style={{ padding: "20px" }}>
        {children}
      </div>
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
  return (
    <ContentProvider>
    <BrowserRouter>
      <Routes>

        {/* MAIN WEBSITE */}
        <Route path="/" element={<MainWebsite />} />

        {/* CRM — محمي */}
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

        {/* Visa Intelligence */}
        <Route path="/visa-checker" element={<VisaChecker />} />
        <Route path="/visa-intelligence" element={
          <ProtectedRoute allowed={["admin","manager"]}>
            <PageLayout><VisaAdminIntelligence /></PageLayout>
          </ProtectedRoute>
        } />

        <Route path="/visa-center" element={<VisaCenterPage />} />
        <Route path="/company-formation" element={<CompanyFormation />} />
        <Route path="/knowledge-center" element={<KnowledgeCenter />} />
        <Route path="/track-request" element={<TrackRequest />} />
        <Route path="/track-application" element={<TrackRequest />} />
        <Route path="/verify-invoice" element={<VerifyInvoice />} />
        <Route path="/portal" element={<ClientPortal />} />
        <Route path="/visa/:slug" element={<VisaRoutePage />} />
        <Route path="/visa-admin" element={
          <ProtectedRoute allowed={["admin", "manager"]}>
            <PageLayout><VisaAdminIntelligence /></PageLayout>
          </ProtectedRoute>
        } />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route path="/site-admin" element={
          <ProtectedRoute allowed={["admin"]}>
            <SiteAdminPage />
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
    </ContentProvider>
  );
}
