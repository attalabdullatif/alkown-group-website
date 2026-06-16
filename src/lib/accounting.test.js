// Smoke tests for the accounting aggregates (financial-critical, pure functions).
import {
  generateInvoiceNumber,
  computeDashboard,
  computeMonthlyData,
  clientFinancials,
} from "./accounting";

describe("generateInvoiceNumber", () => {
  it("matches the ACC-YYYYMMDD-#### format", () => {
    expect(generateInvoiceNumber()).toMatch(/^ACC-\d{8}-\d{4}$/);
  });

  it("embeds today's date", () => {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    expect(generateInvoiceNumber()).toContain(`ACC-${ymd}-`);
  });
});

describe("computeDashboard", () => {
  const nowIso = new Date().toISOString();
  const today = nowIso.slice(0, 10);

  const invoices = [
    { amount: 1000, paid_amount: 1000, status: "Paid",           updated_at: nowIso },
    { amount: 500,  paid_amount: 200,  status: "Partially Paid", updated_at: nowIso },
    { amount: 300,  paid_amount: 0,    status: "Sent",           updated_at: nowIso },
    { amount: 400,  paid_amount: 0,    status: "Draft",          updated_at: nowIso },
  ];
  const expenses = [{ amount: 150, expense_date: today }, { amount: 50, expense_date: today }];

  it("sums total revenue from paid amounts", () => {
    expect(computeDashboard(invoices, expenses).totalRevenue).toBe(1200);
  });

  it("sums total expenses", () => {
    expect(computeDashboard(invoices, expenses).totalExpenses).toBe(200);
  });

  it("counts outstanding only for Sent/Partially Paid/Overdue invoices", () => {
    // (500-200) Partially Paid + (300-0) Sent = 600; Paid and Draft excluded
    expect(computeDashboard(invoices, expenses).outstanding).toBe(600);
  });

  it("computes this month's profit (revenue - expenses)", () => {
    // monthRevenue = 1000 + 200 = 1200; monthExpenses = 200 → 1000
    expect(computeDashboard(invoices, expenses).monthProfit).toBe(1000);
  });

  it("handles empty inputs without crashing", () => {
    expect(computeDashboard([], [])).toEqual({
      totalRevenue: 0, totalExpenses: 0, outstanding: 0, monthProfit: 0,
    });
  });
});

describe("clientFinancials", () => {
  const invoices = [
    { client_id: "c1", amount: 1000, paid_amount: 400 },
    { client_id: "c1", amount: 600,  paid_amount: 600 },
    { client_id: "c2", amount: 999,  paid_amount: 0 },
  ];

  it("aggregates only the given client's invoices", () => {
    expect(clientFinancials(invoices, "c1")).toEqual({
      invoiceCount: 2,
      totalInvoiced: 1600,
      totalPaid: 1000,
      balance: 600,
    });
  });

  it("returns zeroed summary for a client with no invoices", () => {
    expect(clientFinancials(invoices, "unknown")).toEqual({
      invoiceCount: 0, totalInvoiced: 0, totalPaid: 0, balance: 0,
    });
  });
});

describe("computeMonthlyData", () => {
  it("always returns 12 months", () => {
    expect(computeMonthlyData([], [])).toHaveLength(12);
  });

  it("buckets a payment into the current month", () => {
    const key = new Date().toISOString().slice(0, 7); // YYYY-MM
    const months = computeMonthlyData([{ payment_date: `${key}-15`, amount: 750 }], []);
    const current = months[months.length - 1];
    expect(current.key).toBe(key);
    expect(current.revenue).toBe(750);
    expect(current.profit).toBe(750);
  });
});
