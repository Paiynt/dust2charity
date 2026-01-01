import { PublicKey, Transaction, type Connection } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress
} from "@solana/spl-token";
import { getCharity } from "./charities";
import { explorerTxUrl, inferClusterFromRpc, type Cluster } from "./explorer";
import type { DonateUsdcArgs, DonateUsdcResult } from "./types";

// ✅ Mainnet USDC mint (standard Solana USDC mint)
export const MAINNET_USDC_MINT = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);

// USDC decimals (fixed)
const USDC_DECIMALS = 6;

function requirePositiveAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Amount must be greater than 0.");
}

// Converts 1.23 -> 1230000 (base units)
function toBaseUnits(amount: number, decimals: number) {
  return BigInt(Math.round(amount * 10 ** decimals));
}

/**
 * Donate USDC SPL token (wallet-native):
 * - charity must be `direct`
 * - transfers USDC to recipient's associated token account (ATA)
 * - creates recipient ATA if missing (sender pays fee)
 */
export async function donateUsdc(args: DonateUsdcArgs): Promise<DonateUsdcResult> {
  const { connection, wallet, charityId, amountUsdc, rpcUrl = "", usdcMint } = args;

  const charity = getCharity(charityId);

  if (charity.mode !== "direct") {
    throw new Error("This charity uses an external donation flow (e.g., Giving Block).");
  }
  if (!charity.address) {
    throw new Error("Charity recipient address is missing.");
  }
  if (!wallet.publicKey) {
    throw new Error("Wallet not connected.");
  }

  requirePositiveAmount(amountUsdc);

  // Optional dust guard
  if (amountUsdc < 0.01) {
    throw new Error("Amount too small (min 0.01 USDC).");
  }

  const mint = usdcMint ? new PublicKey(usdcMint) : MAINNET_USDC_MINT;
  const recipientOwner = new PublicKey(charity.address);
  const senderOwner = wallet.publicKey;

  // Derive ATAs
  const senderAta = await getAssociatedTokenAddress(mint, senderOwner);
  const recipientAta = await getAssociatedTokenAddress(mint, recipientOwner);

  const tx = new Transaction();

  // If recipient ATA doesn't exist, create it (payer = sender)
  const recipientAtaInfo = await connection.getAccountInfo(recipientAta);
  if (!recipientAtaInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        senderOwner,     // payer
        recipientAta,    // ata
        recipientOwner,  // owner
        mint             // mint
      )
    );
  }

  // Transfer (checked)
  const amountBaseUnits = toBaseUnits(amountUsdc, USDC_DECIMALS);
  tx.add(
    createTransferCheckedInstruction(
      senderAta,
      mint,
      recipientAta,
      senderOwner,
      amountBaseUnits,
      USDC_DECIMALS
    )
  );

  // Send + confirm
  const signature = await wallet.sendTransaction(tx, connection);

  const latest = await connection.getLatestBlockhash();
  await connection.confirmTransaction(
    { signature, blockhash: latest.blockhash, lastValidBlockHeight: latest.lastValidBlockHeight },
    "confirmed"
  );

  const cluster: Cluster = inferClusterFromRpc(rpcUrl);
  return {
    charity,
    signature,
    cluster,
    explorerUrl: explorerTxUrl(signature, cluster)
  };
}
