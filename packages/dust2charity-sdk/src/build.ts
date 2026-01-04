import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  type Connection
} from "@solana/web3.js";
import { getCharity } from "./charities";
import { explorerTxUrl, inferClusterFromRpc, type Cluster } from "./explorer";

export type BuildDonationTxArgs = {
  connection: Connection;
  fromPublicKey: PublicKey;
  charityId: string;
  amountSol: number;
  rpcUrl?: string;
};

export type BuildDonationTxResult = {
  transaction: Transaction;
  charity: ReturnType<typeof getCharity>;
  cluster: Cluster;
  explorerTxBaseUrl: string;
};

export async function buildDonationTx(
  args: BuildDonationTxArgs
): Promise<BuildDonationTxResult> {
  const { connection, fromPublicKey, charityId, amountSol, rpcUrl = "" } = args;

  const charity = getCharity(charityId as any);

  if (charity.mode !== "direct") {
    throw new Error("Charity does not support direct on-chain donations.");
  }

  if (!charity.address) {
    throw new Error("Charity recipient address missing.");
  }

  if (!Number.isFinite(amountSol) || amountSol <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  const recipient = new PublicKey(charity.address);
  const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: fromPublicKey,
    recentBlockhash: blockhash
  }).add(
    SystemProgram.transfer({
      fromPubkey: fromPublicKey,
      toPubkey: recipient,
      lamports
    })
  );

  const cluster = inferClusterFromRpc(rpcUrl);

  return {
    transaction,
    charity,
    cluster,
    explorerTxBaseUrl: explorerTxUrl("", cluster),
  };
}
