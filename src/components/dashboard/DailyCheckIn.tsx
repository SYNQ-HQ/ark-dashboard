"use client";

import { useState, useEffect } from "react";
import { claimDailyCheckIn } from "@/actions/user";
import { toast } from "sonner";
import { formatDistanceToNow, addDays } from "date-fns";
import { useUser } from "@/context/UserContext";
import PromotionModal from "./PromotionModal";

export default function DailyCheckIn() {
    const { user, refetchUser } = useUser();
    const [claiming, setClaiming] = useState(false);
    const [impactStat, setImpactStat] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>("");
    // Added state for promotion modal
    const [promotionData, setPromotionData] = useState<{ show: boolean, rank: string, message: string }>({ show: false, rank: '', message: '' });

    // Calculate if can claim
    const canClaimToday = () => {
        if (!user?.streak?.lastCheckIn) return true;

        const now = new Date();
        const last = new Date(user.streak.lastCheckIn);

        // Compare UTC dates
        const isSameDay = last.getUTCFullYear() === now.getUTCFullYear() &&
            last.getUTCMonth() === now.getUTCMonth() &&
            last.getUTCDate() === now.getUTCDate();

        return !isSameDay;
    };

    const alreadyClaimed = !canClaimToday();

    // Countdown timer logic
    useEffect(() => {
        if (!alreadyClaimed) return;

        const updateTimer = () => {
            const now = new Date();
            // Next reset is tomorrow at 00:00:00 UTC? 
            // Actually the logic just checks date equality, so next availability is 00:00 UTC of next day.

            const nextReset = new Date();
            nextReset.setUTCDate(nextReset.getUTCDate() + 1);
            nextReset.setUTCHours(0, 0, 0, 0);

            const diff = nextReset.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft("Ready!");
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds} s`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [alreadyClaimed]);

    const handleClaim = async () => {
        if (!user || claiming) return;

        setClaiming(true);
        try {
            const res = await claimDailyCheckIn(user.walletAddress);

            if (res.success) {
                if (res.impactStat) setImpactStat(res.impactStat); // Kept original variable name
                if (res.promoted && res.newRank) { // Changed `result` to `res`
                    setPromotionData({
                        show: true,
                        rank: res.newRank,
                        message: res.message || "You have risen in the Order."
                    });
                } else {
                    toast.success("Daily check-in complete! +10 Points", {
                        description: `Streak: ${user.streak?.currentStreak ? user.streak.currentStreak + 1 : 1} Days`
                    });
                }
                refetchUser();
            } else {
                toast.error(res.message || "Failed to check in");
            }
        } catch (e) {
            console.error(e);
            toast.error("Something went wrong");
        } finally {
            setClaiming(false);
        }
    };

    if (!user) return null;

    return (
        <>
            <div className="p-ark-lg pb-4 relative overflow-hidden flex flex-col">
                {/* Background Flame Effect */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                            Daily Check-in
                            <span className="text-orange-500 animate-pulse text-2xl">🔥</span>
                        </h2>
                        <p className="text-muted-foreground text-sm">Consistent action builds legacy.</p>
                    </div>
                    <div className="bg-secondary/50 px-3 py-1 rounded-full border border-border/50">
                        <span className="font-mono font-bold text-primary">{user.streak?.currentStreak || 0}</span>
                        <span className="text-xs text-muted-foreground ml-1">Day Streak</span>
                    </div>
                </div>

                {/* Streak Circles */}
                <div className="flex space-x-2 my-4 justify-center relative z-10">
                    {[...Array(7)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${i < (user.streak?.currentStreak || 0) % 7
                                ? "bg-primary text-primary-foreground scale-110 shadow-sm"
                                : "bg-muted text-muted-foreground/30"
                                }`}
                            title={`Day ${i + 1}`}
                        >
                            {i < (user.streak?.currentStreak || 0) % 7 && <span className="material-icons text-sm">check</span>}
                        </div>
                    ))}
                </div>

                {impactStat ? (
                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mb-4 animate-fade-in relative z-10">
                        <p className="text-sm text-primary font-medium text-center">
                            &quot;{impactStat}&quot;
                        </p>
                    </div>
                ) : null}

                <button
                    onClick={handleClaim}
                    disabled={claiming || alreadyClaimed}
                    className={`relative z-10 rounded-lg px-6 py-4 w-full font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${alreadyClaimed
                        ? "bg-muted text-muted-foreground cursor-default border border-border"
                        : "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        } disabled:opacity-80 disabled:pointer-events-none`}
                >
                    {claiming ? (
                        <span className="animate-pulse">Verifying...</span>
                    ) : alreadyClaimed ? (
                        <div className="flex flex-col items-center">
                            <span className="text-sm">Next Check-in Available In</span>
                            <span className="font-mono text-lg">{timeLeft}</span>
                        </div>
                    ) : (
                        <>
                            <span className="material-icons">touch_app</span>
                            Check In (+10 PTS)
                        </>
                    )}
                </button>

            </div>
            {/* Embedded Promotion Modal */}
            <PromotionModal
                isOpen={promotionData.show}
                rank={promotionData.rank}
                message={promotionData.message}
                onClose={() => setPromotionData(prev => ({ ...prev, show: false }))}
            />
        </>
    );
}
