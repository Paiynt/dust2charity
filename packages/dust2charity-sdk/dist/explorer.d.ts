export type Cluster = "devnet" | "mainnet-beta";
export declare function inferClusterFromRpc(rpcUrl: string): Cluster;
export declare function explorerTxUrl(signature: string, cluster: Cluster): string;
export declare function explorerAddressUrl(address: string, cluster: Cluster): string;
