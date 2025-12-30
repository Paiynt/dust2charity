import type { Connection, PublicKey, Transaction } from "@solana/web3.js";
import type { Charity } from "./charities";
import type { Cluster } from "./explorer";

export type WalletAdapterLike = {
  publicKey: PublicKey | null;
  sendTransaction: (tx: Transaction, connection: Connection) => Promise<string>;
};

export type DonateSolArgs = {
  connection: Connection;
  wallet: WalletAdapterLike;
  charityId: Charity["id"];
  amountSol: number;
  feeBufferSol?: number;
  rpcUrl?: string; // optional, used to infer cluster for explorer URLs
};

export type DonateSolResult = {
  charity: Charity;
  signature: string;
  explorerUrl: string;
  cluster: Cluster;
};
