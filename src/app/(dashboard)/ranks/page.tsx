"use client";

import { useUser } from "@/context/UserContext";
import { getRankInfo } from "@/lib/ranks";
import { ArkRank } from "@prisma/client";
import Link from "next/link";

const ALL_RANKS: ArkRank[] = [
    'RECRUIT',
    'SENTINEL',
    'OPERATIVE',
    'VANGUARD',
    'CAPTAIN',
    'COMMANDER',
    'HIGH_GUARDIAN'
];

const RANK_REQUIREMENTS = {
    RECRUIT: { points: 0, description: "Welcome to The Order" },
    SENTINEL: { points: 0, description: "7-day check-in streak" },
    OPERATIVE: { points: 0, description: "Complete 5 missions" },
    VANGUARD: { points: 0, description: "Hold $250+ for 25 days" },
    CAPTAIN: { points: 10000, description: "Earn 10,000 total points" },
    COMMANDER: { points: 0, description: "Top 10% globally + 30-day streak" },
    HIGH_GUARDIAN: { points: 0, description: "Top 5% OR 50-day streak" }
};

export default function RanksPage() {
    const { user } = useUser();

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    const currentRank = user.arkRank || 'RECRUIT';
    const currentRankIndex = ALL_RANKS.indexOf(currentRank as ArkRank);
    const userPoints = user.points || 0;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">ARK Rank System</h1>
                <p className="text-muted-foreground">Your journey through The Order</p>
            </div>

            {/* Current Rank Summary */}
            <div className="bg-card border border-border rounded-xl p-ark-lg shadow-premium mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Current Rank</p>
                        <h2 className={`text-3xl font-bold ${getRankInfo(currentRank as ArkRank).color}`}>
                            {getRankInfo(currentRank as ArkRank).label}
                        </h2>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Total Points</p>
                        <p className="text-3xl font-bold">{userPoints.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Rank Progression */}
            <div className="space-y-4">
                {ALL_RANKS.map((rank, index) => {
                    const rankInfo = getRankInfo(rank);
                    const requirement = RANK_REQUIREMENTS[rank];
                    const isCompleted = index < currentRankIndex;
                    const isCurrent = index === currentRankIndex;
                    const isFuture = index > currentRankIndex;

                    return (
                        <div
                            key={rank}
                            className={`bg-card border rounded-xl p-ark-lg shadow-premium transition-premium relative overflow-hidden ${isCompleted ? 'border-border opacity-60' :
                                    isCurrent ? 'border-primary shadow-premium-lg' :
                                        'border-border'
                                }`}
                        >
                            {/* Current Rank Indicator */}
                            {isCurrent && (
                                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
                                    YOU ARE HERE
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                {/* Rank Number Badge */}
                                <div className={`w-16 h-16 flex items-center justify-center rounded-full font-bold text-xl ${isCompleted ? 'bg-muted text-muted-foreground' :
                                        isCurrent ? `bg-gradient-to-br ${rankInfo.color} text-white` :
                                            'bg-muted/50 text-muted-foreground'
                                    }`}>
                                    {isCompleted ? (
                                        <span className="material-icons text-2xl">check_circle</span>
                                    ) : (
                                        index + 1
                                    )}
                                </div>

                                {/* Rank Info */}
                                <div className="flex-1">
                                    <h3 className={`text-xl font-bold mb-1 ${isCompleted ? 'text-muted-foreground' :
                                            isCurrent ? rankInfo.color :
                                                'text-card-foreground'
                                        }`}>
                                        {rankInfo.label}
                                    </h3>
                                    <p className={`text-sm mb-2 ${isCompleted || isFuture ? 'text-muted-foreground' : 'text-card-foreground/80'
                                        }`}>
                                        {rankInfo.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className={`px-2 py-1 rounded-full ${isCompleted ? 'bg-green-500/20 text-green-400' :
                                                isCurrent ? 'bg-primary/20 text-primary' :
                                                    'bg-muted text-muted-foreground'
                                            }`}>
                                            {isCompleted ? '✓ Achieved' : isCurrent ? 'In Progress' : 'Locked'}
                                        </span>
                                        <span className="text-muted-foreground">•</span>
                                        <span className="text-muted-foreground">{requirement.description}</span>
                                    </div>
                                </div>

                                {/* Points Display */}
                                {requirement.points > 0 && (
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground mb-1">Required</p>
                                        <p className={`text-lg font-bold ${userPoints >= requirement.points ? 'text-green-500' : 'text-muted-foreground'
                                            }`}>
                                            {requirement.points.toLocaleString()} pts
                                        </p>
                                        {isCurrent && userPoints < requirement.points && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {(requirement.points - userPoints).toLocaleString()} to go
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Progress Bar for Current Rank */}
                            {isCurrent && requirement.points > 0 && (
                                <div className="mt-4">
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-purple-400 transition-premium"
                                            style={{ width: `${Math.min(100, (userPoints / requirement.points) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Back to Dashboard */}
            <div className="mt-8 text-center">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-primary hover-elevate transition-premium"
                >
                    <span className="material-icons text-sm">arrow_back</span>
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
