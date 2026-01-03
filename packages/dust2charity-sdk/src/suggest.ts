export type SuggestDonationArgs = {
    // balances in UI units
    solBalance?: number | null;
    usdcBalance?: number | null;
  
    // safety fee buffer for tx fees (SOL)
    solFeeBuffer?: number;
  
    // minimums to avoid spam / dust
    minSol?: number;
    minUsdc?: number;
  };
  
  export type SuggestDonationResult = {
    maxSol: number;     // max safe SOL donation (after buffer)
    maxUsdc: number;    // max USDC donation (requires SOL fees in wallet)
    suggestedSol: number[];   // quick-pick buttons
    suggestedUsdc: number[];  // quick-pick buttons
  };
  
  function clamp(n: number) {
    return Number.isFinite(n) && n > 0 ? n : 0;
  }
  
  export function suggestDonationAmounts(args: SuggestDonationArgs): SuggestDonationResult {
    const sol = clamp(args.solBalance ?? 0);
    const usdc = clamp(args.usdcBalance ?? 0);
  
    const fee = args.solFeeBuffer ?? 0.002;
    const minSol = args.minSol ?? 0.0001;
    const minUsdc = args.minUsdc ?? 0.01;
  
    const maxSol = Math.max(0, sol - fee);
    const maxUsdc = usdc;
  
    const solCandidates = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05];
    const usdcCandidates = [0.25, 0.5, 1, 2, 5, 10];
  
    const suggestedSol = solCandidates
      .filter((x) => x >= minSol && x <= maxSol)
      .slice(-4);
  
    const suggestedUsdc = usdcCandidates
      .filter((x) => x >= minUsdc && x <= maxUsdc)
      .slice(-4);
  
    return {
      maxSol,
      maxUsdc,
      suggestedSol,
      suggestedUsdc
    };
  }