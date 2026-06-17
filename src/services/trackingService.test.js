// Smoke tests for the tracking helpers (pure parsing only — no network).
import { parseVisaId } from "./trackingService";

describe("parseVisaId", () => {
  it("extracts the number from a VISA-prefixed reference", () => {
    expect(parseVisaId("VISA-123")).toBe(123);
    expect(parseVisaId("visa-42")).toBe(42);
  });

  it("accepts a bare numeric string", () => {
    expect(parseVisaId("57")).toBe(57);
  });

  it("returns null for input with no digits or empty/nullish input", () => {
    expect(parseVisaId("abc")).toBeNull();
    expect(parseVisaId("")).toBeNull();
    expect(parseVisaId(null)).toBeNull();
    expect(parseVisaId(undefined)).toBeNull();
  });

  it("takes the first digit run from mixed input", () => {
    expect(parseVisaId("REF-2024-7")).toBe(2024);
  });
});
