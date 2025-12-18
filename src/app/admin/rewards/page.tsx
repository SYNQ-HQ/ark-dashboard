"use client";

import CreateRewardForm from "@/components/admin/CreateRewardForm";
import EditRewardModal from "@/components/admin/EditRewardModal";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
import { fetchRewards, deleteRewardAction } from "@/actions/rewards";
import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import NextImage from "next/image";

interface Reward {
    id: string;
    name: string;
    description: string;
    cost: number;
    stock: number | null;
    imageUrl?: string | null;
    _count?: {
        redemptions: number;
    };
}

export default function AdminRewardsPage() {
    const { user } = useUser();
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [editingReward, setEditingReward] = useState<Reward | null>(null);

    // Deletion state
    const [deletingReward, setDeletingReward] = useState<Reward | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadRewards = async () => {
        const data = await fetchRewards();
        setRewards(data as unknown as Reward[]);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadRewards();
    }, []);

    const confirmDelete = async () => {
        if (!user || !deletingReward) return;

        setIsDeleting(true);
        const formData = new FormData();
        formData.append("rewardId", deletingReward.id);
        formData.append("adminId", user.id);

        const res = await deleteRewardAction(formData);
        setIsDeleting(false);

        if (res.success) {
            toast.success("Reward deleted");
            setDeletingReward(null);
            loadRewards();
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Incentives & Rewards</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rewards List */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min">
                    {rewards.map((reward) => (
                        <div key={reward.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col group relative">
                            {/* Edit/Delete Actions */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => setEditingReward(reward)}
                                    className="p-1.5 bg-background/80 hover:bg-background border border-border rounded-md shadow-sm backdrop-blur-sm transition-colors"
                                >
                                    <span className="material-icons text-sm">edit</span>
                                </button>
                                <button
                                    onClick={() => setDeletingReward(reward)}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md shadow-sm transition-colors text-red-600"
                                >
                                    <span className="material-icons text-sm">delete</span>
                                </button>
                            </div>

                            {reward.imageUrl ? (
                                <div className="h-32 w-full overflow-hidden bg-muted relative">
                                    <NextImage
                                        src={reward.imageUrl}
                                        alt={reward.name}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                </div>
                            ) : (
                                <div className="bg-muted h-32 flex items-center justify-center">
                                    <span className="material-icons text-4xl text-muted-foreground">card_giftcard</span>
                                </div>
                            )}

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg">{reward.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{reward.description}</p>

                                <div className="flex items-center justify-between text-sm mb-4">
                                    <span className="font-mono font-bold text-primary">{reward.cost.toLocaleString()} PTS</span>
                                    <span className={`px-2 py-1 rounded text-xs ${reward.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-muted'}`}>
                                        {reward.stock !== null ? `${reward.stock} in stock` : '∞ stock'}
                                    </span>
                                </div>

                                <div className="mt-auto border-t border-border pt-4 flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        {reward._count?.redemptions || 0} redeemed
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Form */}
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm h-fit sticky top-6">
                    <h3 className="font-bold text-lg mb-6">Add New Reward</h3>
                    <CreateRewardForm />
                </div>
            </div>

            {editingReward && (
                <EditRewardModal
                    reward={editingReward}
                    onClose={() => setEditingReward(null)}
                    onUpdate={loadRewards}
                />
            )}

            <ConfirmationModal
                isOpen={!!deletingReward}
                onClose={() => setDeletingReward(null)}
                onConfirm={confirmDelete}
                title="Delete Reward"
                message={deletingReward ? (
                    (deletingReward._count?.redemptions || 0) > 0
                        ? `This reward has been redeemed ${deletingReward._count?.redemptions} times. Deleting it will remove these records from history. Are you sure?`
                        : "Are you sure you want to delete this reward?"
                ) : ""}
                confirmText="Delete Reward"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
