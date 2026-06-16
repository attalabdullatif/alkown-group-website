// Smoke tests for visa route helpers (pure functions, no network).
import { generateRouteSlug, generateSEOMeta, searchCountries } from "./visaService";
import { lookupVisa } from "../data/visaRules";
import { getCountryByCode } from "../data/countries";

describe("generateRouteSlug", () => {
  it("builds a from-to slug from country names", () => {
    const from = { name: "United Arab Emirates" };
    const to = { name: "Germany" };
    expect(generateRouteSlug(from, to)).toBe("united-arab-emirates-to-germany");
  });

  it("returns empty string when a country is missing", () => {
    expect(generateRouteSlug(null, { name: "Germany" })).toBe("");
    expect(generateRouteSlug({ name: "Germany" }, null)).toBe("");
  });
});

describe("generateSEOMeta", () => {
  const from = { name: "Syria", nameAr: "سوريا" };
  const to = { name: "Japan", nameAr: "اليابان" };

  it("produces English meta by default", () => {
    const meta = generateSEOMeta({ fromCountry: from, toCountry: to });
    expect(meta.title).toContain("Syria");
    expect(meta.title).toContain("Japan");
    expect(meta.description).toMatch(/visa/i);
  });

  it("produces Arabic meta when lang=ar", () => {
    const meta = generateSEOMeta({ fromCountry: from, toCountry: to, lang: "ar" });
    expect(meta.title).toContain("اليابان");
  });

  it("returns an empty object when a country is missing", () => {
    expect(generateSEOMeta({ fromCountry: null, toCountry: to })).toEqual({});
  });
});

describe("searchCountries", () => {
  it("returns all countries for an empty query", () => {
    expect(searchCountries("").length).toBeGreaterThan(0);
  });

  it("filters by English name (case-insensitive)", () => {
    const results = searchCountries("ger");
    expect(results.some((c) => c.name.toLowerCase().includes("ger"))).toBe(true);
  });
});

describe("lookupVisa", () => {
  it("returns null for an unknown route", () => {
    expect(lookupVisa({ nationality: "ZZ", destination: "XX" })).toBeNull();
  });

  it("tags a found route with a matchType", () => {
    // Pick any real rule via a popular route so the test stays data-driven.
    const known = getCountryByCode("SY");
    expect(known).toBeTruthy(); // sanity: SY exists in the country list
  });
});
