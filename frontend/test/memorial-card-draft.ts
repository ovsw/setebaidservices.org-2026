import type { MemorialCardDraft } from "@/lib/memorial-card";

/** A complete, valid memorial card draft for tests. */
export const validDraft: MemorialCardDraft = {
  tribute: "memory",
  honoreeName: "Ruth Ellen Baker",
  occasion: "",
  amount: "$1,250.5",
  giveBy: "online",
  recipientName: "The Baker family",
  recipientStreet: "12 Orchard Lane",
  recipientCity: "Lewisburg",
  recipientState: "PA",
  recipientZip: "17837",
  cardDesign: "Dove With Sympathy",
  messageChoice: "Extending our Sincerest Sympathy to you and your family at this time of sorrow.",
  customMessage: "",
  donorName: "Dana Rivera",
  donorStreet: "4 Mill Street",
  donorCity: "Winfield",
  donorState: "PA",
  donorZip: "17889",
  donorPhone: "(570) 555-0142",
  donorEmail: "dana@example.com",
};
