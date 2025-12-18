import { ArkRank } from "@prisma/client";

export const RANK_INFO: Record<ArkRank, { label: string; color: string; description: string; }> = {
    RECRUIT: {
        label: "Recruit",
        color: "text-green-500",
        description: "The journey begins."
    },
    SOLDIER: {
        label: "Soldier",
        color: "text-blue-500",
        description: "Consistency is your weapon."
    },
    ELITE: {
        label: "Elite",
        color: "text-yellow-500",
        description: "Actions speak louder."
    },
    VANGUARD: {
        label: "Vanguard",
        color: "text-purple-500",
        description: "Holding the line."
    },
    CAPTAIN: {
        label: "Captain",
        color: "text-cyan-500",
        description: "Leading by example."
    },
    COMMANDER: {
        label: "Commander",
        color: "text-red-500",
        description: "Strategic excellence."
    },
    LEGEND: {
        label: "Legend",
        color: "text-amber-500",
        description: "Inspiring movements."
    },
    HIGH_GUARDIAN: {
        label: "High Guardian",
        color: "text-orange-500",
        description: "Protecting the mission."
    }
};

export function getRankInfo(rank: ArkRank | undefined | null) {
    if (!rank) return RANK_INFO.RECRUIT;
    return RANK_INFO[rank] || RANK_INFO.RECRUIT;
}

export const RANKS = RANK_INFO;
