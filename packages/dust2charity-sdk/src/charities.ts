export type CharityMode = "direct" | "givingblock";

export type CharityId = "rfus" | "stc" | "ctl" | "stand" | "wfpusa";

export type Charity = {
  id: CharityId;
  name: string;
  description: string;
  mode: CharityMode;

  // Trust / transparency metadata shown in UI
  verifyUrl: string;          // charity’s own page describing crypto giving (or official info page)
  sourceLabel: string;        // short label shown to users
  verifiedAt: string;         // YYYY-MM-DD
  notes?: string;             // optional extra context

  // For direct transfers
  address?: string;

  // For link-out donation flow (e.g. Giving Block)
  donationUrl?: string;
};

export const CHARITIES: Charity[] = [
  {
    id: "rfus",
    name: "Rainforest Foundation US",
    description:
      "Protects rainforests and supports Indigenous and local communities through conservation and advocacy. (Direct SOL transfer.)",
    mode: "direct",
    verifyUrl: "https://rainforestfoundation.org/give/cryptocurrency/",
    sourceLabel: "Rainforest Foundation US crypto donation page",
    verifiedAt: "2025-12-30",
    notes: "Direct SOL transfer address is published by the charity on their website.",
    address: "8r2EpKVHLf1ASuDtj2up8TDwjkTbHbDY94UcT7jcEQ1s"
  },

  {
    id: "stc",
    name: "Save the Children",
    description:
      "Supports children worldwide with health, education, protection and emergency aid. (Donate via Giving Block.)",
    mode: "givingblock",
    verifyUrl: "https://www.savethechildren.org/us/ways-to-help/ways-to-give/ways-to-help/cryptocurrency-donation",
    sourceLabel: "Save the Children crypto donation page",
    verifiedAt: "2025-12-30",
    notes: "Donation is handled via The Giving Block; the final on-chain recipient address is not shown in-app.",
    donationUrl: "https://thegivingblock.com/donate/save-the-children/"
  },

  {
    id: "ctl",
    name: "Crisis Text Line",
    description:
      "Free, 24/7 mental health support via text. (Donate via Giving Block.)",
    mode: "givingblock",
    verifyUrl: "https://www.crisistextline.org/donatecrypto/",
    sourceLabel: "Crisis Text Line crypto donation page",
    verifiedAt: "2025-12-30",
    notes: "Donation is handled via The Giving Block; you complete the donation on the official page.",
    donationUrl: "https://thegivingblock.com/donate/crisis-text-line-inc/"
  },

  {
    id: "stand",
    name: "Stand.earth",
    description:
      "Climate and environmental campaigns for systemic change. (Donate via Giving Block.)",
    mode: "givingblock",
    verifyUrl: "https://stand.earth/donate/donate-crypto/",
    sourceLabel: "Stand.earth crypto donation page",
    verifiedAt: "2025-12-30",
    notes: "Donation is handled via The Giving Block; you complete the donation on the official page.",
    donationUrl: "https://thegivingblock.com/donate/standearth/"
  },

  {
    id: "wfpusa",
    name: "World Food Program USA",
    description:
      "Fights global hunger by supporting the UN World Food Programme. (Donate via Giving Block.)",
    mode: "givingblock",
    verifyUrl: "https://wfpusa.org/give/crypto/",
    sourceLabel: "WFP USA crypto donation page",
    verifiedAt: "2025-12-30",
    notes: "Donation is handled via The Giving Block; you complete the donation on the official page.",
    donationUrl: "https://thegivingblock.com/donate/world-food-program-usa/"
  }
];

// Helper: get charity by id (nice for wallet devs)
export function getCharity(id: CharityId) {
  const c = CHARITIES.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown charity id: ${id}`);
  return c;
}
