"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Dust2Charity (Devnet)</h1>
      <p>Connect your wallet to test.</p>
      <WalletMultiButton />
    </main>
  );
}
