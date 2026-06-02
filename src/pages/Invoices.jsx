import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [requests, setRequests] = useState([]);

  const [requestId, setRequestId] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Pending");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    await loadRequests();
    await loadInvoices();
  }

  async function loadRequests() {
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setRequests(data || []);
  }

  async function loadInvoices() {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setInvoices(data || []);
  }

  async function addInvoice() {
    if (!requestId || !amount) {
      alert("Please select request and amount");
      return;
    }

    const { error } = await supabase
      .from("invoices")
      .insert([
        {
          request_id: requestId,
          amount: Number(amount),
          status,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    setRequestId("");
    setAmount("");
    setStatus("Pending");

    loadInvoices();
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Invoices Manager</h1>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <select
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
        >
          <option value="">
            Select Request
          </option>

          {requests.map((request) => (
            <option
              key={request.id}
              value={request.id}
            >
              {request.request_number}
            </option>
          ))}
        </select>

        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Pending">
            Pending
          </option>

          <option value="Paid">
            Paid
          </option>
        </select>

        <button onClick={addInvoice}>
          Add Invoice
        </button>
      </div>

      <table
        width="100%"
        border="1"
        cellPadding="10"
      >
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.request_id}</td>
              <td>{invoice.amount}</td>
              <td>{invoice.status}</td>
            </tr>
          ))}

          {invoices.length === 0 && (
            <tr>
              <td
                colSpan="3"
                style={{ textAlign: "center" }}
              >
                No invoices found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}