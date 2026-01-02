import { PublicKey } from "@solana/web3.js";
import type { DonateUsdcArgs, DonateUsdcResult } from "./types";
export declare const MAINNET_USDC_MINT: PublicKey;
/**
 * Donate USDC SPL token (wallet-native):
 * - charity must be `direct`
 * - transfers USDC to recipient's associated token account (ATA)
 * - creates recipient ATA if missing (sender pays fee)
 */
export declare function donateUsdc(args: DonateUsdcArgs): Promise<DonateUsdcResult>;
