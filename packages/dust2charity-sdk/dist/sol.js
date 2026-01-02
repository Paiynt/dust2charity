import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getCharity } from "./charities";
import { explorerTxUrl, inferClusterFromRpc } from "./explorer";
export function getSpendableSol(balanceSol, feeBufferSol) {
    return Math.max(0, balanceSol - feeBufferSol);
}
export function toLamports(amountSol) {
    return Math.floor(amountSol * LAMPORTS_PER_SOL);
}
function requirePositiveAmount(amountSol) {
    if (!Number.isFinite(amountSol) || amountSol <= 0) {
        throw new Error("Amount must be greater than 0.");
    }
}
function parseRecipient(address) {
    try {
        return new PublicKey(address);
    }
    catch {
        throw new Error("Recipient address is invalid.");
    }
}
export function buildDonateSolTx(args) {
    const tx = new Transaction().add(SystemProgram.transfer({
        fromPubkey: args.from,
        toPubkey: args.to,
        lamports: args.lamports
    }));
    tx.feePayer = args.from;
    tx.recentBlockhash = args.recentBlockhash;
    return tx;
}
/**
 * Wallet-native donation function:
 * - resolves charity by id
 * - ensures charity is direct mode
 * - builds + sends + confirms transaction
 * - returns signature + explorer URL + charity metadata
 */
export async function donateSol(args) {
    const { connection, wallet, charityId, amountSol, feeBufferSol = 0.002, rpcUrl = "" } = args;
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
    requirePositiveAmount(amountSol);
    // Optional safety: if amountSol is extremely close to 0, avoid dust tx spam.
    if (amountSol < 0.000001) {
        throw new Error("Amount too small.");
    }
    const to = parseRecipient(charity.address);
    // Build tx
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    const tx = buildDonateSolTx({
        from: wallet.publicKey,
        to,
        lamports: toLamports(amountSol),
        recentBlockhash: blockhash
    });
    // Send + confirm
    const signature = await wallet.sendTransaction(tx, connection);
    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
    const cluster = inferClusterFromRpc(rpcUrl);
    return {
        charity,
        signature,
        cluster,
        explorerUrl: explorerTxUrl(signature, cluster)
    };
}
