"use client";

import { useState } from "react";
import { assignRankToUser } from "@/actions/admin/ranks";
import { getRankInfo } from "@/lib/ranks";
import { ArkRank } from "@prisma/client";
import { toast } from "sonner";

const ALL_RANKS: ArkRank[] = [
    'RECRUIT',
    'SOLDIER',
    'ELITE',
    'VANGUARD',
    'CAPTAIN',
    'COMMANDER',
    'LEGEND',
    'HIGH_GUARDIAN',
];

interface AssignRankModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    currentRank: ArkRank;
    username: string | null;
    walletAddress: string;
    adminId: string;
    onSuccess: () => void;
}

export default function AssignRankModal({
    isOpen,
    onClose,
    userId,
    currentRank,
    username,
    walletAddress,
    adminId,
    onSuccess
}: AssignRankModalProps) {
    const [selectedRank, setSelectedRank] = useState<ArkRank>(currentRank);
    const [assigning, setAssigning] = useState(false);

    if (!isOpen) return null;

    const handleAssign = async () => {
        if (selectedRank === currentRank) {
            toast.error("Please select a different rank");
            return;
        }

        setAssigning(true);
        const result = await assignRankToUser(userId, selectedRank, adminId);

        if (result.success) {
            toast.success(result.message || "Rank assigned successfully");
            onSuccess();
            onClose();
        } else {
            toast.error(result.error || "Failed to assign rank");
        }
        setAssigning(false);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="max-w-md w-full bg-card border border-border rounded-xl p-ark-lg shadow-premium-xl">
                <h2 className="text-2xl font-bold mb-4">Assign Rank</h2>

                {/* User Info */}
                <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-muted-foreground mb-1">User</p>
                    <p className="font-semibold">{username || walletAddress.slice(0, 12)}</p>
                    <p className="text-xs text-muted-foreground mt-2">Current Rank</p>
                    <p className={`font-bold ${getRankInfo(currentRank).color}`}>
                        {getRankInfo(currentRank).label}
                    </p>
                </div>

                {/* Rank Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Select New Rank</label>
                    <div className="space-y-2">
                        {ALL_RANKS.map((rank) => {
                            const rankInfo = getRankInfo(rank);
                            const isCurrent = rank === currentRank;
                            const isSelected = rank === selectedRank;

                            return (
                                <button
                                    key={rank}
                                    onClick={() => setSelectedRank(rank)}
                                    className={`w-full text-left p-3 rounded-xl border transition-premium ${isSelected
                                        ? 'border-primary bg-primary/10'
                                        : isCurrent
                                            ? 'border-border bg-muted/50 opacity-60'
                                            : 'border-border hover-elevate'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`font-bold ${rankInfo.color}`}>
                                                {rankInfo.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {rankInfo.description}
                                            </p>
                                        </div>
                                        {isCurrent && (
                                            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={assigning}
                        className="flex-1 py-3 bg-muted text-card-foreground font-medium rounded-xl hover-elevate transition-premium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={assigning || selectedRank === currentRank}
                        className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover-elevate transition-premium shadow-premium disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {assigning ? 'Assigning...' : 'Assign Rank'}
                    </button>
                </div>
            </div>
        </div>
    );
}
