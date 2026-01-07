# dust2charity-sdk

A small, wallet-friendly SDK for integrating “donate dust” flows into Solana apps and wallet UIs.

The SDK provides:
- A verified charity registry with transparency metadata
- Simple functions for donating SOL or SPL tokens
- Clear separation between direct on-chain donations and link-out donation flows

---

## Charity registry (verified metadata)

Each charity entry includes transparency fields intended to be shown to users:

- `verifyUrl` — official page used for verification  
- `sourceLabel` — short human-readable source description  
- `verifiedAt` — date the source was last verified  
- `notes` — optional context or limitations  

```ts
import { CHARITIES, getCharity } from "dust2charity-sdk";

const charity = getCharity("rfus");

console.log(charity.name);
console.log(charity.mode); // "direct" | "givingblock"
console.log(charity.verifyUrl);
```

---

## Donate SOL (direct transfer charities only)

Sends SOL directly to a charity’s published Solana address.  
This only works for charities with `mode: "direct"`.

```ts
import { donateSol } from "dust2charity-sdk";

const result = await donateSol({
  connection,
  wallet: { publicKey, sendTransaction },
  charityId: "rfus",
  amountSol: 0.01,
  rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC || ""
});

console.log(result.signature);
console.log(result.explorerUrl);
```

## Build donation transaction (wallet-native)

Wallets may prefer to build transactions without sending them immediately.

```ts
import { buildDonationTx } from "dust2charity-sdk";

const { transaction, charity } = await buildDonationTx({
  connection,
  fromPublicKey: wallet.publicKey,
  charityId: "rfus",
  amountSol: 0.01,
  rpcUrl
});

// Wallet fully controls signing and sending
await wallet.sendTransaction(transaction, connection);

This function:

-Never signs
-Never sends
-Never accesses private keys
-Returns a deterministic, auditable transaction


---

## Donate USDC (SPL token transfer)

Sends USDC (SPL token) to the charity’s associated token account (ATA).  
If the recipient ATA does not exist, it is created automatically.

```ts
import { donateUsdc } from "dust2charity-sdk";

const result = await donateUsdc({
  connection,
  wallet: { publicKey, sendTransaction },
  charityId: "rfus",
  amountUsdc: 1.25,
  rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC || ""
});

console.log(result.signature);
console.log(result.explorerUrl);
```
---

## Build donation transaction (generic SOL + SPL)

Wallets can build a donation transaction for SOL or any SPL token mint without sending it.

### Example: SOL
```ts
import { buildDonationTxGeneric } from "dust2charity-sdk";

const { transaction } = await buildDonationTxGeneric({
  connection,
  fromPublicKey: publicKey,
  charityId: "rfus",
  asset: { kind: "SOL" },
  amount: 0.01,
  rpcUrl
});

await sendTransaction(transaction, connection);

Example: Any SPL token (e.g. USDC):

import { buildDonationTxGeneric } from "dust2charity-sdk";

const { transaction } = await buildDonationTxGeneric({
  connection,
  fromPublicKey: publicKey,
  charityId: "rfus",
  asset: {
    kind: "SPL",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    minAmountUi: 0.01
  },
  amount: 1.25,
  rpcUrl
});

await sendTransaction(transaction, connection);

Notes:

-For SPL tokens, the SDK fetches token decimals on-chain and transfers using checked instructions.
-If the recipient associated token account (ATA) does not exist, it is created automatically (payer = sender).
---

## Resolve donation options (wallet UI helper)

Wallet UIs often want “quick pick” donation buttons and eligibility logic.

```ts
import { resolveDonationOptions } from "dust2charity-sdk";

const { charities, quickPicks } = resolveDonationOptions({
  assets: [
    { kind: "SOL", symbol: "SOL", balance: 0.034 },
    { kind: "SPL", symbol: "USDC", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", balance: 2.5 }
  ],
  solFeeBuffer: 0.002
});

// `charities` contains direct + givingblock (link-out) entries with verification metadata.
// `quickPicks` contains suggested button amounts and max values per asset.


---


## Plan donation flow (wallet-ready abstraction)

Wallets can resolve the entire donation flow with a single call.

```ts
import { planDonationFlow } from "dust2charity-sdk";

const plan = await planDonationFlow({
  connection,
  fromPublicKey: publicKey,
  charityId: "rfus",
  asset: { kind: "SPL", mint: USDC_MINT, symbol: "USDC" },
  amount: 1.25,
  rpcUrl
});

if (plan.kind === "onchain") {
  await sendTransaction(plan.transaction, connection);
} else {
  window.open(plan.donationUrl, "_blank");
}

This allows wallets to:

-avoid charity-specific logic
-support both on-chain and link-out donations
-keep full control over signing and UX

---

## Notes for wallet integrators

- This SDK never accesses private keys.
- All signing happens inside the user’s wallet via `sendTransaction`.
- For charities with `mode: "givingblock"`, applications should link out to the official donation flow instead of sending on-chain.
- Wallets and apps are encouraged to surface `verifyUrl`, `sourceLabel`, and `verifiedAt` to allow users to independently verify recipients.

