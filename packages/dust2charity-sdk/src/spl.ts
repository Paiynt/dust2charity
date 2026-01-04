import { PublicKey, Transaction, type Connection } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getMint
} from "@solana/spl-token";

export type BuildSplTransferArgs = {
  connection: Connection;
  payer: PublicKey;          // who pays fees (usually sender)
  fromOwner: PublicKey;      // sender wallet pubkey
  toOwner: PublicKey;        // recipient wallet pubkey (charity address)
  mint: PublicKey;           // SPL token mint
  amountUi: number;          // UI units, e.g. 1.25 USDC
};

export async function buildSplTransferTx(args: BuildSplTransferArgs): Promise<Transaction> {
  const { connection, payer, fromOwner, toOwner, mint, amountUi } = args;

  if (!Number.isFinite(amountUi) || amountUi <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  // Fetch token decimals on-chain (generic!)
  const mintInfo = await getMint(connection, mint);
  const decimals = mintInfo.decimals;

  // Convert UI amount -> base units
  const baseUnits = BigInt(Math.round(amountUi * 10 ** decimals));

  const senderAta = await getAssociatedTokenAddress(mint, fromOwner);
  const recipientAta = await getAssociatedTokenAddress(mint, toOwner);

  const tx = new Transaction();

  // Create recipient ATA if missing (payer pays fee)
  const recipientAtaInfo = await connection.getAccountInfo(recipientAta);
  if (!recipientAtaInfo) {
    tx.add(createAssociatedTokenAccountInstruction(payer, recipientAta, toOwner, mint));
  }

  tx.add(
    createTransferCheckedInstruction(
      senderAta,
      mint,
      recipientAta,
      fromOwner,
      baseUnits,
      decimals
    )
  );

  return tx;
}
