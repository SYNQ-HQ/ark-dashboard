"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { getAllUsersWithRanks, getRankHistory } from "@/actions/admin/ranks";
import { getRankInfo } from "@/lib/ranks";
import { ArkRank } from "@prisma/client";
import AssignRankModal from "@/components/admin/AssignRankModal";
import { formatDistanceToNow } from "date-fns";

type UserWithRank = {
    id: string;
    walletAddress: string;
    username: string | null;
    points: number;
    arkRank: ArkRank;
    createdAt: Date;
    streak: {
        currentStreak: number;
        longestStreak: number | null;
    } | null;
};

type RankHistoryEntry = {
    id: string;
    rank: ArkRank;
    promotedAt: Date;
};

export default function AdminRanksPage() {
    const { user } = useUser();
    const [users, setUsers] = useState<UserWithRank[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserWithRank | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<RankHistoryEntry[]>([]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        const result = await getAllUsersWithRanks();
        if (result.success) {
            setUsers(result.users as UserWithRank[]);
        }
        setLoading(false);
    };

    const handleViewHistory = async (userId: string) => {
        const result = await getRankHistory(userId);
        if (result.success) {
            setHistory(result.history as RankHistoryEntry[]);
            setShowHistory(true);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Access Denied</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Rank Management</h1>
                <p className="text-muted-foreground">Manage user ranks and view promotion history</p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by username or wallet address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {/* Users Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-premium">
                {loading ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <span className="material-icons animate-spin text-4xl mb-2">refresh</span>
                        <p>Loading users...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="text-left p-4 font-semibold">User</th>
                                    <th className="text-left p-4 font-semibold">Rank</th>
                                    <th className="text-left p-4 font-semibold">Points</th>
                                    <th className="text-left p-4 font-semibold">Streak</th>
                                    <th className="text-left p-4 font-semibold">Joined</th>
                                    <th className="text-right p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredUsers.map((u) => {
                                    const rankInfo = getRankInfo(u.arkRank);
                                    return (
                                        <tr key={u.id} className="hover-elevate transition-premium">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-semibold">
                                                        {u.username || 'Anonymous'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        {u.walletAddress.slice(0, 12)}...
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`font-bold ${rankInfo.color}`}>
                                                    {rankInfo.label}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-mono">
                                                    {u.points.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-icons text-xs text-orange-500">local_fire_department</span>
                                                    {u.streak?.currentStreak || 0} days
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewHistory(u.id)}
                                                        className="px-3 py-1 text-sm bg-muted text-card-foreground rounded-lg hover-elevate transition-premium"
                                                    >
                                                        History
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedUser(u)}
                                                        className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-lg hover-elevate transition-premium"
                                                    >
                                                        Assign Rank
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Assign Rank Modal */}
            {selectedUser && (
                <AssignRankModal
                    isOpen={!!selectedUser}
                    onClose={() => setSelectedUser(null)}
                    userId={selectedUser.id}
                    currentRank={selectedUser.arkRank}
                    username={selectedUser.username}
                    walletAddress={selectedUser.walletAddress}
                    adminId={user.id}
                    onSuccess={loadUsers}
                />
            )}

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="max-w-md w-full bg-card border border-border rounded-xl p-ark-lg shadow-premium-xl">
                        <h2 className="text-2xl font-bold mb-4">Rank History</h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {history.map((entry) => {
                                const rankInfo = getRankInfo(entry.rank);
                                return (
                                    <div key={entry.id} className="bg-muted/50 rounded-xl p-3">
                                        <p className={`font-bold ${rankInfo.color}`}>
                                            {rankInfo.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(entry.promotedAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setShowHistory(false)}
                            className="w-full mt-4 py-3 bg-muted text-card-foreground font-medium rounded-xl hover-elevate transition-premium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
