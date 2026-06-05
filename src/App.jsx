import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import VisaRoutePage from "./pages/visa/VisaRoutePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { signOut } from "./lib/auth";

import MainWebsite from "./MainWebsite";

import Dashboard from "./dashboard/Dashboard";
import Login from "./pages/Login";
import Services from "./pages/Services";
import Clients from "./pages/Clients";
import Requests from "./pages/Requests";
import Invoices from "./pages/Invoices";
import TrackRequest from "./pages/TrackRequest";
import VerifyInvoice from "./pages/VerifyInvoice";
import ClientPortal from "./pages/ClientPortal";

function Navigation() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="no-print" style={{
      display: "flex", justifyContent: "center", gap: "10px",
      flexWrap: "wrap", padding: "20px", alignItems: "center"
    }}>
      <LinkButton to="/dashboard">Dashboard</LinkButton>
      <LinkButton to="/clients">Clients</LinkButton>
      <LinkButton to="/services">Services</LinkButton>
      <LinkButton to="/requests">Requests</LinkButton>
      <LinkButton to="/invoices">Invoices</LinkButton>
      <LinkButton to="/track-request">Track Request</LinkButton>
      <LinkButton to="/portal">بوابة العملاء</LinkButton>
      {user && (
        <button
          onClick={handleSignOut}
          style={{
            background: "#2a1a1a", color: "#ff6b6b", border: "1px solid #4a1a1a",
            padding: "12px 18px", borderRadius: "10px", fontWeight: "600",
            cursor: "pointer", fontSize: "14px"
          }}
        >
          تسجيل الخروج ({role})
        </button>
      )}
    </div>
  );
}

function LinkButton({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        background: "#111",
        color: "#fff",
        padding: "12px 18px",
        borderRadius: "10px",
        fontWeight: "600",
      }}
    >
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

function InvoicesPage() {
  return (
    <PageLayout>
      <Invoices />
    </PageLayout>
  );
}

function LoginPage() {
  return <Login />;
}

export default function App() {
  return (
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
            <InvoicesPage />
          </ProtectedRoute>
        } />

        <Route path="/track-request" element={<TrackRequest />} />
        <Route path="/verify-invoice" element={<VerifyInvoice />} />
        <Route path="/portal" element={<ClientPortal />} />
        <Route path="/visa/:slug" element={<VisaRoutePage />} />

        <Route
          path="/login"
          element={<LoginPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}
