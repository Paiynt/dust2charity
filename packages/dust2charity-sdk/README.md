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

## Notes for wallet integrators

- This SDK never accesses private keys.
- All signing happens inside the user’s wallet via `sendTransaction`.
- For charities with `mode: "givingblock"`, applications should link out to the official donation flow instead of sending on-chain.
- Wallets and apps are encouraged to surface `verifyUrl`, `sourceLabel`, and `verifiedAt` to allow users to independently verify recipients.

