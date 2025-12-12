"use client";

import { useEffect, useState } from "react";
import { fetchLeaderboard } from "@/actions/leaderboard";
import Skeleton from "@/components/ui/Skeleton";

interface User {
    id: string;
    username: string | null;
    points: number;
    badges: { badge: { name: string } }[];
}

export default function LeaderboardPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchLeaderboard();
                setUsers(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="bg-card text-card-foreground border border-card-border rounded-lg p-ark-lg shadow-premium-lg animate-fade-in">
                <div className="mb-6">
                    <Skeleton className="h-8 w-64 mb-2" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-muted/30">
                            <tr className="border-b border-border">
                                <th className="p-4"><Skeleton className="h-4 w-12" /></th>
                                <th className="p-4"><Skeleton className="h-4 w-32" /></th>
                                <th className="p-4"><Skeleton className="h-4 w-24" /></th>
                                <th className="p-4"><Skeleton className="h-4 w-16" /></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="hover:bg-muted/10 transition-colors">
                                    <td className="p-5"><Skeleton className="h-6 w-8" /></td>
                                    <td className="p-5"><Skeleton className="h-6 w-48" /></td>
                                    <td className="p-5"><Skeleton className="h-6 w-24" /></td>
                                    <td className="p-5 flex gap-2">
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card text-card-foreground border border-card-border rounded-lg p-ark-lg shadow-premium-lg animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-foreground tracking-tight">Weekly Top Impact Earners</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/30">
                        <tr className="border-b border-border">
                            <th className="p-4 text-sm font-medium text-muted-foreground uppercase tracking-wider rounded-tl-lg">Rank</th>
                            <th className="p-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">User</th>
                            <th className="p-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Points</th>
                            <th className="p-4 text-sm font-medium text-muted-foreground uppercase tracking-wider rounded-tr-lg">Badges</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {users.map((user, i) => (
                            <tr key={user.id} className="hover:bg-muted/20 transition-colors group">
                                <td className="p-5 font-medium text-muted-foreground">#{i + 1}</td>
                                <td className="p-5 font-semibold text-foreground group-hover:text-primary transition-colors">{user.username || "Anonymous"}</td>
                                <td className="p-5 font-mono text-foreground">{user.points.toLocaleString()}</td>
                                <td className="p-5">
                                    {user.badges.length > 0 ? user.badges.map((ub, j) => (
                                        <span key={j} className="bg-accent/50 text-accent-foreground border border-accent text-xs font-semibold mr-2 px-3 py-1 rounded-full whitespace-nowrap">
                                            {ub.badge.name}
                                        </span>
                                    )) : <span className="text-muted-foreground text-xs italic">No badges</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
