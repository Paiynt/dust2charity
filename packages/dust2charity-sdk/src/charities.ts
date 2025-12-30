export type CharityMode = "direct" | "givingblock";

export type Charity = {
  id: "rfus" | "stc";
  name: string;
  description: string;
  mode: CharityMode;

  // For trust/transparency
  verifyUrl: string;

  // ✅ verification metadata (per charity)
  sourceLabel: string;
  verifiedAt: string; // YYYY-MM-DD
  notes?: string;

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
    verifyUrl: "https://rainforestfoundation.org/give/cryptocurrency/#donate-crypto",
    sourceLabel: "Rainforest Foundation US crypto donation page",
    verifiedAt: "2025-12-28",
    notes: "Direct SOL transfer address published by the charity.",
    address: "8r2EpKVHLf1ASuDtj2up8TDwjkTbHbDY94UcT7jcEQ1s"
  },
  {
    id: "stc",
    name: "Save the Children",
    description:
      "Supports children worldwide with health, education, protection and emergency aid. (Donate via Giving Block.)",
    mode: "givingblock",
    verifyUrl: "https://www.savethechildren.net/donate/donate-cryptocurrency",
    sourceLabel: "Save the Children donation page (The Giving Block)",
    verifiedAt: "2025-12-28",
    notes: "Donation handled via Giving Block; no direct on-chain recipient address shown in-app.",
    donationUrl: "https://thegivingblock.com/donate/save-the-children/"
  }
];

// Helper: get charity by id (nice for wallet devs)
export function getCharity(id: Charity["id"]) {
  const c = CHARITIES.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown charity id: ${id}`);
  return c;
}
