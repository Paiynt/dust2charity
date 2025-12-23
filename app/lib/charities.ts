export type Charity =
  | {
      id: "rfus";
      name: string;
      description: string;
      mode: "direct";
      address: string;
      verifyUrl: string;
    }
  | {
      id: "stc";
      name: string;
      description: string;
      mode: "givingblock";
      donationUrl: string;
      verifyUrl: string;
    };

export const CHARITIES: Charity[] = [
  {
    id: "rfus",
    name: "Rainforest Foundation US",
    description:
      "Protects rainforests in partnership with Indigenous peoples and forest communities.",
    mode: "direct",
    address: "8r2EpKVHLf1ASuDtj2up8TDwjkTbHbDY94UcT7jcEQ1s",
    verifyUrl: "https://rainforestfoundation.org/give/cryptocurrency/#donate-crypto"
  },
  {
    id: "stc",
    name: "Save the Children",
    description:
      "Helps children stay healthy, learning, and protected — in crises and long-term programs worldwide.",
    mode: "givingblock",
    donationUrl: "https://thegivingblock.com/donate/save-the-children/",
    verifyUrl: "https://thegivingblock.com/donate/save-the-children/"
  }
];
