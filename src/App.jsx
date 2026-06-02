import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import MainWebsite from "./MainWebsite";

import Dashboard from "./dashboard/Dashboard";
import Login from "./pages/Login";
import Services from "./pages/Services";
import Clients from "./pages/Clients";
import Requests from "./pages/Requests";
import Invoices from "./pages/Invoices";
import TrackRequest from "./pages/TrackRequest";

function Navigation() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        flexWrap: "wrap",
        padding: "20px",
      }}
    >
      <LinkButton to="/">🏠 Home</LinkButton>
      <LinkButton to="/dashboard">Dashboard</LinkButton>
      <LinkButton to="/clients">Clients</LinkButton>
      <LinkButton to="/services">Services</LinkButton>
      <LinkButton to="/requests">Requests</LinkButton>
      <LinkButton to="/invoices">Invoices</LinkButton>
      <LinkButton to="/track-request">Track Request</LinkButton>
      <LinkButton to="/login">Login</LinkButton>
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
  return (
    <PageLayout>
      <Login />
    </PageLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* MAIN WEBSITE */}
        <Route path="/" element={<MainWebsite />} />

        {/* CRM */}
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/clients"
          element={<ClientsPage />}
        />

        <Route
          path="/services"
          element={<ServicesPage />}
        />

        <Route
          path="/requests"
          element={<RequestsPage />}
        />

        <Route
          path="/invoices"
          element={<InvoicesPage />}
        />

        <Route
          path="/track-request"
          element={<TrackRequest />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}
