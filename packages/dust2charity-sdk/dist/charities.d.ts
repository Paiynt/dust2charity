export type CharityMode = "direct" | "givingblock";
export type CharityId = "rfus" | "stc" | "ctl" | "stand" | "wfpusa";
export type Charity = {
    id: CharityId;
    name: string;
    description: string;
    mode: CharityMode;
    verifyUrl: string;
    sourceLabel: string;
    verifiedAt: string;
    notes?: string;
    address?: string;
    donationUrl?: string;
};
export declare const CHARITIES: Charity[];
export declare function getCharity(id: CharityId): Charity;
