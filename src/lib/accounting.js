import { supabase } from "./supabase";

// ─── Invoice Number Generator ───────────────────────────────────────────────
export function generateInvoiceNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  return `ACC-${ymd}-${Date.now().toString().slice(-4)}`;
}

// ─── Invoices ────────────────────────────────────────────────────────────────
export async function fetchInvoices() {
  const { data, error } = await supabase
    .from("acc_invoices")
    .select("*, clients(id, full_name, email, phone), requests(id, request_number)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createInvoice(payload) {
  const { data, error } = await supabase
    .from("acc_invoices")
    .insert([{ ...payload, invoice_number: generateInvoiceNumber() }])
    .select("*, clients(id, full_name, email, phone), requests(id, request_number)")
    .single();
  if (error) throw error;
  return data;
}

export async function updateInvoice(id, payload) {
  const { data, error } = await supabase
    .from("acc_invoices")
    .update(payload)
    .eq("id", id)
    .select("*, clients(id, full_name, email, phone), requests(id, request_number)")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteInvoice(id) {
  const { error } = await supabase.from("acc_invoices").delete().eq("id", id);
  if (error) throw error;
}

// ─── Payments ────────────────────────────────────────────────────────────────
export async function fetchPayments() {
  const { data, error } = await supabase
    .from("acc_payments")
    .select("*, acc_invoices(invoice_number, service_name), clients(full_name)")
    .order("payment_date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function recordPayment(payload) {
  const { data, error } = await supabase
    .from("acc_payments")
    .insert([payload])
    .select()
    .single();
  if (error) throw error;

  // Update invoice paid_amount and status
  const invoice = await getInvoiceById(payload.invoice_id);
  if (invoice) {
    const newPaid = Number(invoice.paid_amount || 0) + Number(payload.amount);
    const total = Number(invoice.amount);
    let status = invoice.status;
    if (newPaid >= total) status = "Paid";
    else if (newPaid > 0) status = "Partially Paid";
    await updateInvoice(payload.invoice_id, { paid_amount: newPaid, status });
  }
  return data;
}

export async function deletePayment(id) {
  const { error } = await supabase.from("acc_payments").delete().eq("id", id);
  if (error) throw error;
}

async function getInvoiceById(id) {
  const { data } = await supabase.from("acc_invoices").select("*").eq("id", id).single();
  return data;
}

// ─── Expenses ─────────────────────────────────────────────────────────────────
export async function fetchExpenses() {
  const { data, error } = await supabase
    .from("acc_expenses")
    .select("*")
    .order("expense_date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createExpense(payload) {
  const { data, error } = await supabase
    .from("acc_expenses")
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExpense(id) {
  const { error } = await supabase.from("acc_expenses").delete().eq("id", id);
  if (error) throw error;
}

// ─── Dashboard Aggregates ─────────────────────────────────────────────────────
export function computeDashboard(invoices, expenses) {
  const totalRevenue = invoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  const outstanding = invoices
    .filter(i => ["Sent","Partially Paid","Overdue"].includes(i.status))
    .reduce((s, i) => s + (Number(i.amount) - Number(i.paid_amount || 0)), 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthRevenue = invoices
    .filter(i => i.updated_at >= startOfMonth && i.paid_amount > 0)
    .reduce((s, i) => s + Number(i.paid_amount || 0), 0);
  const monthExpenses = expenses
    .filter(e => e.expense_date >= startOfMonth.slice(0,10))
    .reduce((s, e) => s + Number(e.amount || 0), 0);

  return { totalRevenue, totalExpenses, outstanding, monthProfit: monthRevenue - monthExpenses };
}

// ─── Client Financial Summary ──────────────────────────────────────────────────
export function clientFinancials(invoices, clientId) {
  const clientInvoices = invoices.filter(i => i.client_id === clientId);
  const totalInvoiced = clientInvoices.reduce((s, i) => s + Number(i.amount), 0);
  const totalPaid = clientInvoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0);
  return {
    invoiceCount: clientInvoices.length,
    totalInvoiced,
    totalPaid,
    balance: totalInvoiced - totalPaid,
  };
}
