import { describe, expect, it } from "vitest";
import type {
  AskAboutCampEntry,
  FormEntry,
  MemorialCardEntry,
  ParentsGuideEntry,
} from "@/lib/form-entry";
import { entryFromFormspark, formsparkPayload } from "@/lib/formspark-entry";

const askAboutCamp: AskAboutCampEntry = {
  kind: "ask_about_camp",
  name: "Dana Rivera",
  phone: "(610) 555-0123",
  email: "dana@example.com",
  childAge: "9",
  bestTime: "",
  interests: [],
  submissionId: "0b5a3c1e-7f2d-4c8a-9e61-2d4f8a6b0001",
  receivedAt: "2026-11-05T15:30:00.000Z",
  source: "chop-nurses",
  page: "/go/events",
};

const memorialCard: MemorialCardEntry = {
  kind: "memorial_card",
  tribute: "memory",
  honoreeName: "Ruth Ellen Baker",
  occasion: "",
  amount: "50.00",
  giveBy: "check",
  recipientName: "The Baker family",
  recipientStreet: "12 Elm Street",
  recipientCity: "Allentown",
  recipientState: "PA",
  recipientZip: "18101",
  cardDesign: "Lake at dawn",
  cardMessage: "A gift has been made in memory of Ruth.",
  cardMessageIsOwnWords: false,
  donorName: "Sam Ortiz",
  donorStreet: "3 Oak Lane",
  donorCity: "Reading",
  donorState: "PA",
  donorZip: "19601",
  donorPhone: "610-555-0199",
  donorEmail: "sam@example.com",
  submissionId: "0b5a3c1e-7f2d-4c8a-9e61-2d4f8a6b0002",
  receivedAt: "2026-11-05T15:30:00.000Z",
  source: "direct",
  page: "/donate/memorial",
};

const parentsGuide: ParentsGuideEntry = {
  kind: "parents_guide",
  firstName: "Maria",
  email: "maria@example.com",
  phone: "",
  okToContact: false,
  submissionId: "0b5a3c1e-7f2d-4c8a-9e61-2d4f8a6b0003",
  receivedAt: "2026-11-05T15:30:00.000Z",
  source: "direct",
  page: "/parents/guide",
};

const at = <Entry extends FormEntry>(entry: Entry, receivedAt: string): Entry => ({
  ...entry,
  receivedAt,
});

describe("the sent time in Formspark", () => {
  it.each([askAboutCamp, memorialCard, parentsGuide])("shows the office Pennsylvania time ($kind)", (entry) => {
    // November: Eastern Standard Time, five hours behind UTC.
    expect(formsparkPayload(entry).sent_at).toBe("Nov 5, 2026, 10:30 AM ET");
    // October: Eastern Daylight Time, four hours behind UTC.
    expect(formsparkPayload(at(entry, "2026-10-31T14:30:00.000Z")).sent_at).toBe(
      "Oct 31, 2026, 10:30 AM ET",
    );
  });

  it("follows the clock across the night the clocks change", () => {
    // Clocks go back at 2:00 AM EDT on Nov 1, 2026, and forward at 2:00 AM EST on Mar 8, 2026.
    const sentAt = (receivedAt: string) => formsparkPayload(at(askAboutCamp, receivedAt)).sent_at;
    expect(sentAt("2026-11-01T05:30:00.000Z")).toBe("Nov 1, 2026, 1:30 AM ET");
    expect(sentAt("2026-11-01T06:30:00.000Z")).toBe("Nov 1, 2026, 1:30 AM ET");
    expect(sentAt("2026-03-08T06:30:00.000Z")).toBe("Mar 8, 2026, 1:30 AM ET");
    expect(sentAt("2026-03-08T07:30:00.000Z")).toBe("Mar 8, 2026, 3:30 AM ET");
  });

  it.each([askAboutCamp, memorialCard, parentsGuide])("reads back the same entry ($kind)", (entry) => {
    expect(entryFromFormspark(formsparkPayload(entry))).toEqual(entry);
  });
});

describe("a parent's guide request in Formspark", () => {
  it("sends the phone and the OK to contact as Yes or No", () => {
    expect(formsparkPayload(parentsGuide)).toMatchObject({ phone: "—", ok_to_contact: "No" });
    const willing = { ...parentsGuide, phone: "(610) 555-0123", okToContact: true };
    expect(formsparkPayload(willing)).toMatchObject({ phone: "(610) 555-0123", ok_to_contact: "Yes" });
    expect(entryFromFormspark(formsparkPayload(willing))).toEqual(willing);
  });
});
