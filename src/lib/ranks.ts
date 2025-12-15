import { ArkRank } from "@prisma/client";

export const RANKS: Record<ArkRank, { label: string; color: string; description: string }> = {
    RECRUIT: {
        label: "Recruit",
        color: "text-green-500",
        description: "The journey begins."
    },
    SENTINEL: {
        label: "Sentinel",
        color: "text-blue-500",
        description: "Consistency is your weapon."
    },
    OPERATIVE: {
        label: "Operative",
        color: "text-yellow-500",
        description: "Action defines you."
    },
    VANGUARD: {
        label: "Vanguard",
        color: "text-purple-500",
        description: "Commitment is proven."
    },
    CAPTAIN: {
        label: "Captain",
        color: "text-indigo-500",
        description: "Leading by example."
    },
    COMMANDER: {
        label: "Commander",
        color: "text-red-500",
        description: "Influence through service."
    },
    HIGH_GUARDIAN: {
        label: "High Guardian",
        color: "text-orange-500",
        description: "A legacy established."
    }
};

export function getRankInfo(rank: ArkRank | undefined | null) {
    if (!rank) return RANKS.RECRUIT;
    return RANKS[rank] || RANKS.RECRUIT;
}
