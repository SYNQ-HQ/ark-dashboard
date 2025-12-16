"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { getLeaderboard, LeaderboardEntry } from "@/actions/leaderboard";
import { getRankInfo } from "@/lib/ranks";
import { ArkRank } from "@prisma/client";

export default function LeaderboardPage() {
    const { user } = useUser();
    const [period, setPeriod] = useState<'ACROSS_ALL_TIME' | 'WEEKLY'>('ACROSS_ALL_TIME');
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadLeaderboard() {
            setLoading(true);
            const result = await getLeaderboard(period, user?.id);
            if (result.success) {
                setEntries(result.entries);
                setCurrentUserEntry(result.currentUserEntry);
            }
            setLoading(false);
        }
        loadLeaderboard();
    }, [period, user?.id]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">The Order Leaderboard</h1>
                <p className="text-muted-foreground">See where you stand among the Guardians.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-border">
                <button
                    onClick={() => setPeriod('ACROSS_ALL_TIME')}
                    className={`px-6 py-3 font-medium transition-premium ${period === 'ACROSS_ALL_TIME'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover-elevate'
                        }`}
                >
                    All Time
                </button>
                <button
                    onClick={() => setPeriod('WEEKLY')}
                    className={`px-6 py-3 font-medium transition-premium ${period === 'WEEKLY'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover-elevate'
                        }`}
                >
                    This Week
                </button>
            </div>

            {/* Leaderboard List */}
            <div className="bg-card border border-border rounded-xl overflow-hidden mb-24 shadow-premium">
                {loading ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <span className="material-icons animate-spin text-4xl mb-2">refresh</span>
                        <p>Loading rankings...</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <span className="material-icons text-4xl mb-2">emoji_events</span>
                        <p>No rankings yet. Be the first!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {entries.map((entry) => {
                            const rankInfo = getRankInfo(entry.arkRank as ArkRank);
                            const isTop3 = entry.rank <= 3;

                            return (
                                <div
                                    key={entry.userId}
                                    className={`p-4 flex items-center gap-4 transition-premium ${entry.isCurrentUser ? 'bg-primary/10' : 'hover-elevate'
                                        }`}
                                >
                                    {/* Rank */}
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold ${isTop3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 'bg-muted text-card-foreground'
                                        }`}>
                                        {entry.rank <= 3 ? (
                                            <span className="material-icons">
                                                {entry.rank === 1 ? 'looks_one' : entry.rank === 2 ? 'looks_two' : 'looks_3'}
                                            </span>
                                        ) : (
                                            entry.rank
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold truncate">
                                                {entry.username || `User ${entry.walletAddress.slice(0, 6)}`}
                                            </p>
                                            {entry.isCurrentUser && (
                                                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span className={`font-bold ${rankInfo.color}`}>
                                                {rankInfo.label}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-icons text-xs">local_fire_department</span>
                                                {entry.streak} days
                                            </span>
                                        </div>
                                    </div>

                                    {/* Points */}
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">{entry.points.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground uppercase">Points</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Sticky User Footer */}
            {currentUserEntry && !loading && (
                <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-premium-lg z-50">
                    <div className="container mx-auto px-4 py-4 max-w-4xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                #{currentUserEntry.rank}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold">Your Position</p>
                                <p className="text-sm text-muted-foreground">
                                    {getRankInfo(currentUserEntry.arkRank as ArkRank).label} • {currentUserEntry.streak} day streak
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">{currentUserEntry.points.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground uppercase">Points</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
