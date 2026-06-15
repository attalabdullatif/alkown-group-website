// Smoke tests for the RBAC permission layer (security-critical).
import {
  can,
  normalizeRole,
  meetsLevel,
  requirePermission,
  filterNavByRole,
} from "./rbac";

describe("normalizeRole", () => {
  it("maps legacy role names to canonical ones", () => {
    expect(normalizeRole("admin")).toBe("company_admin");
    expect(normalizeRole("Admin")).toBe("company_admin");
    expect(normalizeRole("Manager")).toBe("manager");
  });

  it("lowercases unknown roles and handles empty input", () => {
    expect(normalizeRole("STAFF")).toBe("staff");
    expect(normalizeRole(null)).toBeNull();
    expect(normalizeRole("")).toBeNull();
  });
});

describe("can", () => {
  it("grants super_admin everything via wildcard", () => {
    expect(can("super_admin", "invoices", "delete")).toBe(true);
    expect(can("super_admin", "anything", "whatever")).toBe(true);
  });

  it("grants company_admin destructive actions", () => {
    expect(can("company_admin", "clients", "delete")).toBe(true);
    expect(can("admin", "invoices", "delete")).toBe(true); // legacy alias
  });

  it("denies clients/staff destructive actions they don't own", () => {
    expect(can("client", "invoices", "delete")).toBe(false);
    expect(can("staff", "invoices", "delete")).toBe(false);
    expect(can("accountant", "clients", "delete")).toBe(false);
  });

  it("returns false for missing role, resource, or action", () => {
    expect(can(null, "clients", "read")).toBe(false);
    expect(can("manager", "nonexistent_resource", "read")).toBe(false);
    expect(can("manager", "clients", "nonexistent_action")).toBe(false);
  });
});

describe("meetsLevel", () => {
  it("compares role hierarchy levels", () => {
    expect(meetsLevel("company_admin", "manager")).toBe(true);
    expect(meetsLevel("staff", "manager")).toBe(false);
    expect(meetsLevel("manager", "manager")).toBe(true);
  });
});

describe("requirePermission", () => {
  it("throws when the role lacks permission", () => {
    expect(() => requirePermission("client", "invoices", "delete")).toThrow(
      /Permission denied/
    );
  });

  it("does not throw when permitted", () => {
    expect(() => requirePermission("company_admin", "invoices", "delete")).not.toThrow();
  });
});

describe("filterNavByRole", () => {
  const nav = [
    { to: "/public", roles: null },
    { to: "/admin-only", roles: ["company_admin"] },
    { to: "/managers", roles: ["manager"] },
  ];

  it("always keeps public items", () => {
    const out = filterNavByRole(nav, "client");
    expect(out.map((n) => n.to)).toContain("/public");
  });

  it("hides admin items from lower roles and shows them to admins", () => {
    expect(filterNavByRole(nav, "staff").map((n) => n.to)).not.toContain("/admin-only");
    expect(filterNavByRole(nav, "company_admin").map((n) => n.to)).toContain("/admin-only");
  });
});
