import type { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getCharity } from "./charities";
import { buildDonationTxGeneric, type DonationAsset } from "./buildGeneric";
import { inferClusterFromRpc, explorerTxUrl, type Cluster } from "./explorer";

export type DonationFlowPlanArgs = {
  connection: Connection;
  fromPublicKey: PublicKey;

  charityId: string;
  asset: DonationAsset;
  amount: number;

  rpcUrl?: string;
};

export type DonationFlowPlan =
  | {
      kind: "onchain";
      transaction: Transaction;
      explorerTxPrefix: string;
      cluster: Cluster;

      recipient: {
        name: string;
        address: string;
        verifyUrl: string;
        sourceLabel: string;
        verifiedAt: string;
        notes?: string;
      };
    }
  | {
      kind: "external";
      donationUrl: string;

      recipient: {
        name: string;
        verifyUrl: string;
        sourceLabel: string;
        verifiedAt: string;
        notes?: string;
      };
    };

export async function planDonationFlow(
  args: DonationFlowPlanArgs
): Promise<DonationFlowPlan> {
  const charity = getCharity(args.charityId as any);

  // External flow (Giving Block etc.)
  if (charity.mode === "givingblock") {
    if (!charity.donationUrl) {
      throw new Error("External donation URL missing for charity.");
    }

    return {
      kind: "external",
      donationUrl: charity.donationUrl,
      recipient: {
        name: charity.name,
        verifyUrl: charity.verifyUrl,
        sourceLabel: charity.sourceLabel,
        verifiedAt: charity.verifiedAt,
        notes: charity.notes
      }
    };
  }

  // On-chain flow
  const { transaction, cluster } = await buildDonationTxGeneric({
    connection: args.connection,
    fromPublicKey: args.fromPublicKey,
    charityId: charity.id,
    asset: args.asset,
    amount: args.amount,
    rpcUrl: args.rpcUrl
  });

  return {
    kind: "onchain",
    transaction,
    explorerTxPrefix: explorerTxUrl("", cluster),
    cluster,
    recipient: {
      name: charity.name,
      address: charity.address!,
      verifyUrl: charity.verifyUrl,
      sourceLabel: charity.sourceLabel,
      verifiedAt: charity.verifiedAt,
      notes: charity.notes
    }
  };
}
