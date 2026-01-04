import {
    PublicKey,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
    type Connection
  } from "@solana/web3.js";
  import { getCharity, type CharityId } from "./charities";
  import { inferClusterFromRpc, type Cluster, explorerTxUrl } from "./explorer";
  import { buildSplTransferTx } from "./spl";
  
  export type DonationAsset =
    | { kind: "SOL" }
    | { kind: "SPL"; mint: string; symbol?: string; minAmountUi?: number };
  
  export type BuildDonationTxGenericArgs = {
    connection: Connection;
    fromPublicKey: PublicKey;
  
    charityId: CharityId;
    asset: DonationAsset;
  
    // UI units (SOL or token UI amount)
    amount: number;
  
    // For explorer URL cluster inference
    rpcUrl?: string;
  
    // Optional: wallets can enforce a SOL buffer for fees on token transfers
    solFeeBuffer?: number;
  };
  
  export type BuildDonationTxGenericResult = {
    transaction: Transaction;
    charityId: CharityId;
    asset: DonationAsset;
    amount: number;
  
    cluster: Cluster;
  
    recipient: {
      mode: "direct" | "givingblock";
      name: string;
      address?: string;
      verifyUrl: string;
      sourceLabel: string;
      verifiedAt: string;
      notes?: string;
    };
  
    // Wallet sends tx and obtains signature; this is just for UI consistency
    explorerTxPrefix: string;
  };
  
  export async function buildDonationTxGeneric(
    args: BuildDonationTxGenericArgs
  ): Promise<BuildDonationTxGenericResult> {
    const {
      connection,
      fromPublicKey,
      charityId,
      asset,
      amount,
      rpcUrl = "",
      solFeeBuffer = 0.002
    } = args;
  
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Amount must be greater than 0.");
  
    const charity = getCharity(charityId);
  
    if (charity.mode !== "direct") {
      throw new Error("This charity uses an external donation flow (link out).");
    }
    if (!charity.address) throw new Error("Charity recipient address is missing.");
  
    const toOwner = new PublicKey(charity.address);
  
    let tx: Transaction;
  
    if (asset.kind === "SOL") {
      if (amount < 0.000001) throw new Error("Amount too small.");
  
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPublicKey,
          toPubkey: toOwner,
          lamports
        })
      );
    } else {
      // Generic SPL token transfer
      const mint = new PublicKey(asset.mint);
  
      const min = asset.minAmountUi ?? 0.000001;
      if (amount < min) throw new Error(`Amount too small (min ${min}).`);
  
      // Wallet should ensure user has SOL for fees; we just document it here.
      void solFeeBuffer;
  
      tx = await buildSplTransferTx({
        connection,
        payer: fromPublicKey,
        fromOwner: fromPublicKey,
        toOwner,
        mint,
        amountUi: amount
      });
    }
  
    // Add blockhash + fee payer
    const { blockhash } = await connection.getLatestBlockhash();
    tx.feePayer = fromPublicKey;
    tx.recentBlockhash = blockhash;
  
    const cluster: Cluster = inferClusterFromRpc(rpcUrl);
  
    return {
      transaction: tx,
      charityId,
      asset,
      amount,
      cluster,
      recipient: {
        mode: charity.mode,
        name: charity.name,
        address: charity.address,
        verifyUrl: charity.verifyUrl,
        sourceLabel: charity.sourceLabel,
        verifiedAt: charity.verifiedAt,
        notes: charity.notes
      },
      explorerTxPrefix: explorerTxUrl("", cluster)
    };
  }
  