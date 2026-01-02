import { PublicKey, Transaction } from "@solana/web3.js";
import type { DonateSolArgs, DonateSolResult } from "./types";
export declare function getSpendableSol(balanceSol: number, feeBufferSol: number): number;
export declare function toLamports(amountSol: number): number;
export declare function buildDonateSolTx(args: {
    from: PublicKey;
    to: PublicKey;
    lamports: number;
    recentBlockhash: string;
}): Transaction;
/**
 * Wallet-native donation function:
 * - resolves charity by id
 * - ensures charity is direct mode
 * - builds + sends + confirms transaction
 * - returns signature + explorer URL + charity metadata
 */
export declare function donateSol(args: DonateSolArgs): Promise<DonateSolResult>;
