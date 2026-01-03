import { PublicKey, SystemProgram, Transaction, type Connection } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress
} from "@solana/spl-token";
import { getCharity, type CharityId } from "./charities";
import { MAINNET_USDC_MINT } from "./usdc";

export type BuildDonationTxArgs = {
  connection: Connection;
  fromPublicKey: PublicKey;

  charityId: CharityId;
  asset: "SOL" | "USDC";

  // UI units (SOL or USDC)
  amount: number;

  // Optional: override mint for devnet testing
  usdcMint?: PublicKey;

  // Optional: helps wallets enforce a fee reserve for SOL transfers
  solFeeBuffer?: number;
};

export type BuildDonationTxResult = {
  tx: Transaction;
  charityId: CharityId;
  asset: "SOL" | "USDC";
  amount: number;

  // For UI + logs
  recipient: {
    mode: "direct" | "givingblock";
    name: string;
    address?: string;
    verifyUrl: string;
    sourceLabel: string;
    verifiedAt: string;
    notes?: string;
  };
};

/**
 * Wallet-native builder:
 * - Builds a donation transaction WITHOUT sending it.
 * - Wallet signs/sends using its existing flow.
 * - Only supports `mode: "direct"` charities.
 * - For givingblock charities, wallets should link out to `donationUrl`.
 */
export async function buildDonationTx(args: BuildDonationTxArgs): Promise<BuildDonationTxResult> {
  const {
    connection,
    fromPublicKey,
    charityId,
    asset,
    amount,
    usdcMint,
    solFeeBuffer = 0.002
  } = args;

  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Amount must be greater than 0.");

  const charity = getCharity(charityId);

  if (charity.mode !== "direct") {
    throw new Error("This charity uses an external donation flow (link out).");
  }
  if (!charity.address) throw new Error("Charity recipient address is missing.");

  const recipientOwner = new PublicKey(charity.address);

  const tx = new Transaction();

  if (asset === "SOL") {
    // Wallets often want to keep a small SOL reserve for fees
    // (we don't fetch balance here — wallet can enforce before calling)
    if (amount < 0.000001) throw new Error("Amount too small.");

    tx.add(
      SystemProgram.transfer({
        fromPubkey: fromPublicKey,
        toPubkey: recipientOwner,
        lamports: Math.floor(amount * 1_000_000_000)
      })
    );
  } else {
    // USDC transfer (SPL token)
    if (amount < 0.01) throw new Error("Amount too small (min 0.01 USDC).");

    const mint = usdcMint ?? MAINNET_USDC_MINT;

    const senderAta = await getAssociatedTokenAddress(mint, fromPublicKey);
    const recipientAta = await getAssociatedTokenAddress(mint, recipientOwner);

    // Create recipient ATA if missing
    const recipientAtaInfo = await connection.getAccountInfo(recipientAta);
    if (!recipientAtaInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          fromPublicKey,   // payer
          recipientAta,
          recipientOwner,
          mint
        )
      );
    }

    // USDC has 6 decimals
    const baseUnits = BigInt(Math.round(amount * 10 ** 6));

    tx.add(
      createTransferCheckedInstruction(
        senderAta,
        mint,
        recipientAta,
        fromPublicKey,
        baseUnits,
        6
      )
    );

    // Reminder: token transfers still require SOL fees
    // Wallet should ensure SOL balance > solFeeBuffer before calling.
    void solFeeBuffer;
  }

  const { blockhash } = await connection.getLatestBlockhash();
  tx.feePayer = fromPublicKey;
  tx.recentBlockhash = blockhash;

  return {
    tx,
    charityId,
    asset,
    amount,
    recipient: {
      mode: charity.mode,
      name: charity.name,
      address: charity.address,
      verifyUrl: charity.verifyUrl,
      sourceLabel: charity.sourceLabel,
      verifiedAt: charity.verifiedAt,
      notes: charity.notes
    }
  };
}
