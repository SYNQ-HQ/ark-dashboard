"use client";

import { useState, useEffect } from "react";
import { AccountBalanceWalletIcon, CalendarTodayIcon } from "@/components/Icons";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { getActPortfolio } from "@/actions/token";
import confetti from "canvas-confetti";

export default function EligibilityPage() {
    const { user, loading } = useUser();
    const [checking, setChecking] = useState(false);
    const [actData, setActData] = useState<{ balance: number; value: number; price: number } | null>(null);

    // Fetch ACT portfolio data
    useEffect(() => {
        if (user?.walletAddress) {
            getActPortfolio(user.walletAddress).then(setActData);
        }
    }, [user?.walletAddress]);

    const playSuccessSound = () => {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyCz/LZiTYIGGS57OihUhELTKXh8bllHAU2jdXzzHgsBS14xvDaj0AJE1yz6+qnVBUJRJvd8L1qIAYtgs/y2Yk2CQ==');
        audio.volume = 0.5;
        audio.play().catch(() => { });
    };

    const playMotivationSound = () => {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAgYCBgoKDhIOEhIODgoCAgICAgYGCgoOEhISEg4KBgYCAgICAgYGCgoODhISEg4OCgYGAgICAgIGBgoKDg4SEhIODgoGBgICAgICBgYKCg4OEhISEg4KBgYCAgICAgYGCgoODhISEg4OCgYGAgICAgIGBgoKDg4SEhIODgoGBgICAgICBgYKCg4OEhISEg4KBgYCAgICAgYGCgoODhISEg4OCgYGAgICAgIGBgoKDg4SEhIODIAU=');
        audio.volume = 0.4;
        audio.play().catch(() => { });
    };

    const triggerConfetti = () => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio: number, opts: any) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    };

    const handleCheckEligibility = async () => {
        if (!user) return;
        setChecking(true);

        try {
            const { verifyEligibility } = await import("@/actions/eligibility");
            const res = await verifyEligibility(user.walletAddress);

            if (res.success) {
                // Refetch ACT data
                if (user.walletAddress) {
                    getActPortfolio(user.walletAddress).then(setActData);
                }

                if (res.meetsMinimum) {
                    // SUCCESS - Eligible!
                    playSuccessSound();
                    triggerConfetti();
                    toast.success("🎉 Congratulations! You're eligible for rewards!");
                } else {
                    // NOT ELIGIBLE - Motivation
                    playMotivationSound();
                    toast.info("Keep holding! You're on your way to eligibility.");
                }

                // Refetch user to get the new isEligible status
                window.location.reload(); // Simple reload to get fresh server state or we could use refetchUser if available
            } else {
                toast.error(res.message || "Verification failed");
            }
        } catch (e) {
            toast.error("An unexpected error occurred");
        } finally {
            setChecking(false);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Loading eligibility...</div>;
    if (!user) return <div className="p-8 text-center">Please connect mock wallet.</div>;

    return (
        <div className="bg-card text-card-foreground border border-card-border rounded-lg p-ark-lg shadow-premium-lg animate-slide-up">
            <h2 className="text-2xl font-bold mb-6 text-foreground tracking-tight">
                $ACT Holder Reward Eligibility
            </h2>
            <div className="space-y-8">
                {user.isEligible ? (
                    <div className="bg-card text-card-foreground border border-card-border rounded-lg p-ark-lg shadow-premium hover-elevate transition-premium">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <span className="material-icons text-green-500 text-3xl">verified</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-foreground mb-1">You're Qualified! 🎉</h3>
                                <p className="text-muted-foreground text-sm">Congratulations! You meet all requirements and are eligible for rewards.</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-foreground">
                                <span className="material-icons text-green-500 text-sm">check_circle</span>
                                <span>Monthly reward distribution</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                                <span className="material-icons text-green-500 text-sm">check_circle</span>
                                <span>Priority access to new features</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                                <span className="material-icons text-green-500 text-sm">check_circle</span>
                                <span>Exclusive holder benefits</span>
                            </div>
                        </div>

                        {/* <div className="pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground">
                                Next distribution: <span className="font-medium text-foreground">27th of this month at midnight</span>
                            </p>
                        </div> */}
                    </div>
                ) : (
                    <div className="bg-card text-card-foreground border border-card-border rounded-lg p-ark-lg shadow-premium hover-elevate transition-premium">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <span className="material-icons text-primary text-3xl">trending_up</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-foreground mb-1">Verification Needed</h3>
                                <p className="text-muted-foreground text-sm">Check your holdings to track progress toward eligibility.</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                                <span className={`material-icons text-sm mt-0.5 ${actData && actData.value >= 250 ? 'text-green-500' : 'text-muted-foreground'}`}>
                                    {actData && actData.value >= 250 ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">Hold $250+ worth of $ACT</p>
                                    {actData && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Current: ${actData.value.toFixed(2)} USD
                                            {actData.value < 250 && <span className="text-primary"> • Need $${(250 - actData.value).toFixed(2)} more</span>}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                                <span className={`material-icons text-sm mt-0.5 ${user.holdingStartedAt && Math.floor((Date.now() - new Date(user.holdingStartedAt).getTime()) / (1000 * 60 * 60 * 24)) >= 25 ? 'text-green-500' : 'text-muted-foreground'}`}>
                                    {user.holdingStartedAt && Math.floor((Date.now() - new Date(user.holdingStartedAt).getTime()) / (1000 * 60 * 60 * 24)) >= 25 ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">Hold for 25 consecutive days</p>
                                    {user.holdingStartedAt ? (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Current: {Math.floor((Date.now() - new Date(user.holdingStartedAt).getTime()) / (1000 * 60 * 60 * 24))} days
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground mt-1">Verify to start tracking</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckEligibility}
                            disabled={checking}
                            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover-elevate"
                        >
                            {checking ? "Verifying Holdings..." : "Check Eligibility"}
                        </button>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-6 p-6 border border-border rounded-xl bg-muted/10">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <AccountBalanceWalletIcon />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Your Balance</p>
                            <p className="text-2xl font-bold text-foreground">
                                {actData ? actData.balance.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0"} <span className="text-sm font-normal text-muted-foreground">$ACT</span>
                            </p>
                            {actData && actData.value > 0 && (
                                <p className="text-sm text-green-500 font-medium mt-1">
                                    ${actData.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-6 p-6 border border-border rounded-xl bg-muted/10">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <CalendarTodayIcon />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Days Held</p>
                            <p className="text-2xl font-bold text-foreground">
                                {user.holdingStartedAt
                                    ? `${Math.floor((Date.now() - new Date(user.holdingStartedAt).getTime()) / (1000 * 60 * 60 * 24))} / 25 Days`
                                    : "0 / 25 Days"
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-muted/10 p-6 rounded-xl border border-border">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <span className="material-icons text-primary">info</span> Requirements
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            Hold at least $250 worth of $ACT
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            Hold for a minimum of 25 days
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            Monthly distribution on the 27th at midnight
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
