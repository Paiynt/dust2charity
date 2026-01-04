import type { Charity, CharityId } from "./charities";
import { CHARITIES } from "./charities";

export type AssetKind = "SOL" | "SPL";

export type DonationAssetInput =
  | { kind: "SOL"; symbol?: "SOL"; balance?: number | null }
  | { kind: "SPL"; symbol: string; mint: string; balance?: number | null };

export type ResolveDonationOptionsArgs = {
  assets: DonationAssetInput[];

  // Fee buffer for SOL network fees. Wallet can tune this.
  solFeeBuffer?: number;

  // Minimums to avoid spam/dust
  minSol?: number;
  minToken?: number;

  // If true, include link-out charities (givingblock) in results
  includeExternalCharities?: boolean;
};

export type CharityOption = {
  charityId: CharityId;
  charity: Charity;

  mode: "direct" | "givingblock";

  // Wallet UI: show these fields clearly
  verifyUrl: string;
  sourceLabel: string;
  verifiedAt: string;
  notes?: string;

  // If givingblock, wallet should link out instead of building tx
  donationUrl?: string;

  // Eligible assets for this charity (direct mode supports both SOL + SPL)
  eligibleAssets: "SOL" | "SPL" | "SOL+SPL";

};

export type DonationQuickPick = {
  asset: DonationAssetInput;
  amounts: number[];     // UI units
  max: number;           // max safe amount (UI units)
  warning?: string;      // wallet can display under buttons
};

export type ResolveDonationOptionsResult = {
  charities: CharityOption[];
  quickPicks: DonationQuickPick[];
};

function clamp(n: number) {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function resolveDonationOptions(
  args: ResolveDonationOptionsArgs
): ResolveDonationOptionsResult {
  const solFeeBuffer = args.solFeeBuffer ?? 0.002;
  const minSol = args.minSol ?? 0.0001;
  const minToken = args.minToken ?? 0.01;
  const includeExternal = args.includeExternalCharities ?? true;

  // Charities: include direct always; include givingblock optionally
  const charities: CharityOption[] = CHARITIES.filter((c) =>
    includeExternal ? true : c.mode === "direct"
  ).map((c) => ({
    charityId: c.id,
    charity: c,
    mode: c.mode,
    verifyUrl: c.verifyUrl,
    sourceLabel: c.sourceLabel,
    verifiedAt: c.verifiedAt,
    notes: c.notes,
    donationUrl: c.donationUrl,
    eligibleAssets: c.mode === "direct" ? "SOL+SPL" : "SOL"

  }));

  // Quick picks per asset
  const quickPicks: DonationQuickPick[] = args.assets.map((asset) => {
    const bal = clamp(asset.balance ?? 0);

    if (asset.kind === "SOL") {
      const max = Math.max(0, bal - solFeeBuffer);
      const candidates = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1];
      const amounts = candidates.filter((x) => x >= minSol && x <= max).slice(-4);

      let warning: string | undefined;
      if (bal <= solFeeBuffer) warning = "Not enough SOL to cover network fees.";
      else if (max < minSol) warning = "Balance too low for suggested donation buttons.";

      return { asset, amounts, max, warning };
    } else {
      // SPL token: transfers still need SOL fees, but we don't know SOL balance here.
      // Wallet can provide SOL as another asset in the list so it gets its own warning.
      const max = bal;
      const candidates = [0.25, 0.5, 1, 2, 5, 10, 20];
      const amounts = candidates.filter((x) => x >= minToken && x <= max).slice(-4);

      let warning: string | undefined;
      if (max < minToken) warning = `Balance too low for suggested ${asset.symbol} donation buttons.`;

      return { asset, amounts, max, warning };
    }
  });

  return { charities, quickPicks };
}
