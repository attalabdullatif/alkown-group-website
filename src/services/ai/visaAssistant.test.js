// Smoke tests for the visa intent parser (pure function, no network).
import { parseVisaIntent } from "./VisaAssistantService";

describe("parseVisaIntent", () => {
  it("extracts nationality and destination from English text", () => {
    const intent = parseVisaIntent("I'm Syrian living in UAE, traveling to Germany");
    expect(intent.nationality).toBe("SY");
    expect(intent.residence).toBe("AE");
    expect(intent.destination).toBe("DE");
  });

  it("extracts intent from Arabic text", () => {
    const intent = parseVisaIntent("أنا سوري وأريد السفر إلى اليابان");
    expect(intent.nationality).toBe("SY");
    expect(intent.destination).toBe("JP");
  });

  // Known limitation: the keyword parser takes the FIRST country keyword it
  // finds as the destination, so it can't disambiguate when the residence and
  // destination countries both appear. The AI backend (queryVisaAssistant
  // step 3) is what handles such free-form cases. This test pins the behavior.
  it("picks the first matching country when several are mentioned", () => {
    const intent = parseVisaIntent("مقيم في تركيا وأريد السفر إلى اليابان");
    expect(intent.destination).toBe("TR");
  });

  it("returns nulls when nothing matches", () => {
    const intent = parseVisaIntent("hello there");
    expect(intent).toEqual({ nationality: null, residence: null, destination: null });
  });
});
