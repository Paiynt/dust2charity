export function inferClusterFromRpc(rpcUrl) {
    const u = (rpcUrl || "").toLowerCase();
    if (u.includes("devnet") || u.includes("testnet") || u.includes("localhost"))
        return "devnet";
    return "mainnet-beta";
}
export function explorerTxUrl(signature, cluster) {
    const qp = cluster === "devnet" ? "?cluster=devnet" : "";
    return `https://explorer.solana.com/tx/${signature}${qp}`;
}
export function explorerAddressUrl(address, cluster) {
    const qp = cluster === "devnet" ? "?cluster=devnet" : "";
    return `https://explorer.solana.com/address/${address}${qp}`;
}
