export type Cluster = "devnet" | "mainnet-beta";

export function inferClusterFromRpc(rpcUrl: string): Cluster {
  const u = (rpcUrl || "").toLowerCase();
  if (u.includes("devnet") || u.includes("testnet") || u.includes("localhost")) return "devnet";
  return "mainnet-beta";
}

export function explorerTxUrl(signature: string, cluster: Cluster) {
  const qp = cluster === "devnet" ? "?cluster=devnet" : "";
  return `https://explorer.solana.com/tx/${signature}${qp}`;
}

export function explorerAddressUrl(address: string, cluster: Cluster) {
  const qp = cluster === "devnet" ? "?cluster=devnet" : "";
  return `https://explorer.solana.com/address/${address}${qp}`;
}
