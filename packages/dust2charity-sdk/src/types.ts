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
import type { CharityId, Charity } from "./charities";
import type { Cluster } from "./explorer";
import type { Connection, PublicKey, Transaction } from "@solana/web3.js";



export type DonateUsdcArgs = {
  connection: Connection;
  wallet: {
    publicKey: PublicKey | null;
    sendTransaction: (tx: any, connection: Connection) => Promise<string>;
  };
  charityId: CharityId;
  amountUsdc: number;
  rpcUrl?: string;

  // Optional override (useful for devnet testing later)
  usdcMint?: string;
};

export type DonateUsdcResult = {
  charity: Charity;
  signature: string;
  cluster: Cluster;
  explorerUrl: string;
};

export type { BuildDonationTxArgs, BuildDonationTxResult } from "./build";
