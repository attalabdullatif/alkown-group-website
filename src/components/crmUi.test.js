import {
  CLIENT_STEPS,
  VISA_STATUSES,
  clientStepIndex,
  normalizeStatus,
  statusColor,
  statusColors,
  statusLabelAr,
} from "./crmUi";

describe("request status helpers", () => {
  test("legacy statuses map onto the 9-stage workflow", () => {
    expect(normalizeStatus("New")).toBe("Lead");
    expect(normalizeStatus("In Progress")).toBe("Consultation");
    expect(normalizeStatus("Pending Documents")).toBe("Documents Pending");
    expect(normalizeStatus("Approved")).toBe("Approved");
  });

  test("every legacy value lands on a real stage", () => {
    ["New", "In Progress", "Pending Documents", "Approved", "Rejected", "Completed"]
      .forEach(s => expect(VISA_STATUSES).toContain(normalizeStatus(s)));
  });

  test("Arabic labels cover both vocabularies", () => {
    expect(statusLabelAr("New")).toBe("عميل محتمل");
    expect(statusLabelAr("Submitted")).toBe("تم التقديم");
    expect(statusLabelAr(null)).toBe("—");
    expect(statusLabelAr("Something Else")).toBe("Something Else");
  });

  test("colours follow the normalised stage", () => {
    expect(statusColor("New")).toBe(statusColors.Lead);
    expect(statusColor("Unknown")).toBeTruthy();
  });

  test("each stage belongs to exactly one client step", () => {
    VISA_STATUSES.forEach(s => {
      const owners = CLIENT_STEPS.filter(step => step.stages.includes(s));
      expect(owners).toHaveLength(1);
    });
    expect(clientStepIndex("New")).toBe(0);
    expect(clientStepIndex("Processing")).toBe(2);
    expect(clientStepIndex("Completed")).toBe(CLIENT_STEPS.length - 1);
    expect(clientStepIndex("Unknown")).toBe(-1);
  });
});
