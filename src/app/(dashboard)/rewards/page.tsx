"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { fetchRewards, redeemReward } from "@/actions/rewards";
import { toast } from "sonner";
import Skeleton from "@/components/ui/Skeleton";
import Image from "next/image";

interface Reward {
    id: string;
    name: string;
    cost: number;
    description: string;
    image?: string | null;
}

export default function RewardsPage() {
    const { user, refetchUser } = useUser();
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadRewards() {
            setLoading(true);
            try {
                const data = await fetchRewards();
                setRewards(data);
            } catch (e) {
                console.error("Failed to load rewards", e);
                toast.error("Failed to load rewards");
            } finally {
                setLoading(false);
            }
        }
        loadRewards();
    }, []);

    async function handleRedeem(rewardId: string) {
        if (!user) {
            toast.error("Please connect your wallet first.");
            return;
        }

        toast.promise(
            redeemReward(user.walletAddress, rewardId),
            {
                loading: 'Redeeming reward...',
                success: (res) => {
                    if (res.success) {
                        refetchUser(); // Update points globally
                        return `Redeemed ${res.rewardName}! Check your email.`;
                    } else {
                        throw new Error(res.message);
                    }
                },
                error: (err) => `Redemption failed: ${err.message}`
            }
        );
    }

    if (loading) {
        return (
            <div className="bg-card text-card-foreground border border-card-border rounded-lg p-ark-lg shadow-premium-lg animate-fade-in">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-6 w-32 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-ark-lg">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-background border border-border rounded-xl p-4 flex flex-col gap-4">
                            <Skeleton className="w-full aspect-square rounded-lg" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-12 w-full mt-auto" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const userPoints = user?.points || 0;

    return (
        <div className="bg-card text-card-foreground border border-card-border rounded-lg p-ark-lg shadow-premium-lg animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 text-foreground tracking-tight">Reward Redemption Store</h2>
            <p className="text-muted-foreground mb-8">Your Points: <span className="text-primary font-bold">{userPoints.toLocaleString()}</span></p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-ark-lg">
                {rewards.map((reward) => (
                    <div
                        key={reward.id}
                        className="group bg-background border border-border rounded-xl p-4 text-center hover:border-primary/50 transition-all duration-300 hover:shadow-premium-sm flex flex-col hover:-translate-y-1"
                    >
                        <div className="relative overflow-hidden rounded-lg mb-4 aspect-square bg-muted/20">
                            {/* Use placeholder for now or reward.image if it existed */}
                            <Image
                                src={`https://via.placeholder.com/300?text=${encodeURIComponent(reward.name)}`}
                                alt={reward.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                        <p className="font-semibold mb-2 text-foreground line-clamp-1 text-lg">
                            {reward.name}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5em]">{reward.description}</p>
                        <p className="text-primary font-bold mb-6 text-xl">
                            {reward.cost.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">PTS</span>
                        </p>
                        <div className="mt-auto">
                            <button
                                onClick={() => handleRedeem(reward.id)}
                                className={`w-full rounded-lg px-4 py-3 font-medium transition-all ${userPoints < reward.cost ? "bg-muted text-muted-foreground cursor-not-allowed opacity-70" : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg active:scale-[0.98]"}`}
                                disabled={userPoints < reward.cost}
                            >
                                {userPoints < reward.cost ? "Not Enough Points" : "Redeem Reward"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
