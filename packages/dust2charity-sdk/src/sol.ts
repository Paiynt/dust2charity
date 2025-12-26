import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import type { SendSolDonationArgs } from "./types";

export function getSpendableSol(balanceSol: number, feeBufferSol: number) {
  return Math.max(0, balanceSol - feeBufferSol);
}

export function toLamports(amountSol: number) {
  return Math.floor(amountSol * LAMPORTS_PER_SOL);
}

export function buildDonateSolTx(args: {
  from: PublicKey;
  to: PublicKey;
  lamports: number;
  recentBlockhash: string;
}) {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: args.from,
      toPubkey: args.to,
      lamports: args.lamports
    })
  );

  tx.feePayer = args.from;
  tx.recentBlockhash = args.recentBlockhash;
  return tx;
}

export async function sendSolDonation({
  connection,
  publicKey,
  sendTransaction,
  toAddress,
  amountSol,
  feeBufferSol = 0.002
}: SendSolDonationArgs) {
  if (!publicKey) throw new Error("Wallet not connected");

  if (!Number.isFinite(amountSol) || amountSol <= 0) {
    throw new Error("Amount must be > 0");
  }

  let to: PublicKey;
  try {
    to = new PublicKey(toAddress);
  } catch {
    throw new Error("Recipient address is invalid");
  }

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const tx = buildDonateSolTx({
    from: publicKey,
    to,
    lamports: toLamports(amountSol),
    recentBlockhash: blockhash
  });

  const signature = await sendTransaction(tx, connection);

  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

  return { signature };
}
