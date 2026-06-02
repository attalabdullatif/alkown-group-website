import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  CRM_COLORS,
  buttonStyle,
  cardStyle,
  formatDate,
  inputStyle,
  pageStyle,
  statusColors,
} from "../components/crmUi";

export default function TrackRequest() {
  const [requestNumber, setRequestNumber] = useState("");
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function trackRequest(event) {
    event.preventDefault();

    if (!requestNumber.trim()) {
      setError("Please enter your request number.");
      return;
    }

    setLoading(true);
    setError("");
    setRequest(null);

    const { data, error: lookupError } = await supabase
      .from("requests")
      .select("request_number, status, notes, created_at")
      .eq("request_number", requestNumber.trim())
      .maybeSingle();

    setLoading(false);

    if (lookupError) {
      setError(lookupError.message);
      return;
    }

    if (!data) {
      setError("No request found with this number.");
      return;
    }

    setRequest(data);
  }

  return (
    <div style={{ ...pageStyle, display: "grid", placeItems: "center" }}>
      <section style={{ ...cardStyle, padding: 32, width: "min(620px, 100%)" }}>
        <div style={{ color: CRM_COLORS.goldDark, letterSpacing: ".22em", textTransform: "uppercase", fontSize: 12 }}>
          Alkown Group
        </div>
        <h1 style={{ margin: "8px 0 10px", fontSize: 34 }}>Track Request</h1>
        <p style={{ color: CRM_COLORS.muted, marginTop: 0 }}>
          Enter your request number to check the latest status.
        </p>

        <form onSubmit={trackRequest} style={{ display: "grid", gap: 12, marginTop: 22 }}>
          <input
            placeholder="REQ-..."
            value={requestNumber}
            onChange={(event) => setRequestNumber(event.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Checking..." : "Track Request"}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 18, color: CRM_COLORS.danger }}>
            {error}
          </div>
        )}

        {request && (
          <div style={{ marginTop: 24, padding: 22, border: `1px solid ${CRM_COLORS.border}`, borderRadius: 8, background: CRM_COLORS.beige }}>
            <Detail label="Request Number" value={request.request_number} />
            <Detail
              label="Status"
              value={request.status}
              color={statusColors[request.status] || CRM_COLORS.text}
            />
            <Detail label="Created Date" value={formatDate(request.created_at)} />
            <Detail label="Last Updated" value={formatDate(request.created_at)} />
          </div>
        )}
      </section>
    </div>
  );
}

function Detail({ label, value, color = CRM_COLORS.text }) {
  return (
    <div style={{ borderBottom: "1px solid rgba(201,168,76,.25)", padding: "10px 0" }}>
      <div style={{ color: CRM_COLORS.muted, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 4, color, fontWeight: label === "Status" ? 900 : 500 }}>{value || "-"}</div>
    </div>
  );
}
