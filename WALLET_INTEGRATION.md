# Wallet integration guide (dust2charity)

## What this adds to a wallet
A “Donate dust” action that lets users donate small leftover balances (e.g., SOL or USDC) to vetted charities.

### Typical placements
- After a swap: “Donate leftover balance”
- After a send: “Donate remaining dust”
- In wallet settings: “Donation recipients”

## Safety model (important)
- The wallet always shows the charity `verifyUrl` (official source) and `verifiedAt`.
- The wallet never handles private keys; signing is done via the wallet’s normal transaction flow.
- For `mode: "givingblock"` charities, the wallet links out to the official donation page instead of sending funds on-chain.

## SDK usage (minimal)
- `getCharity(id)` and `CHARITIES` provide vetted recipients + transparency metadata.
- `donateSol(...)` and `donateUsdc(...)` build + send transactions using the wallet's own `sendTransaction`.

### Example: donate SOL
```ts
import { donateSol } from "dust2charity-sdk";

const result = await donateSol({
  connection,
  wallet: { publicKey, sendTransaction },
  charityId: "rfus",
  amountSol: 0.01,
  rpcUrl
});


UX recommendations

-Default to direct recipients (on-chain) for one-tap donation.
-If a recipient is givingblock, show a “Donate on official page” button.

Always show:
-Charity name
-Mode: direct / external
-verifyUrl link
-verifiedAt date


Review checklist for wallet teams

-Confirm recipient source page matches verifyUrl.
-Confirm verifiedAt is reasonably recent.
-Confirm on-chain address (direct mode) matches official source.
-Confirm UI warns users that mainnet donations are irreversible.
-Confirm donation flow never requests private keys.