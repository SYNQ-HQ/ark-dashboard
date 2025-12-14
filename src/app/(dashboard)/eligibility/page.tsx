"use client";

import { useState } from "react";
import { AccountBalanceWalletIcon, CalendarTodayIcon } from "@/components/Icons";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

export default function EligibilityPage() {
    const { user, loading } = useUser();
    const [checking, setChecking] = useState(false);

    const handleCheckEligibility = async () => {
        if (!user) return;
        setChecking(true);

        try {
            const { verifyEligibility } = await import("@/actions/eligibility");
            const res = await verifyEligibility(user.walletAddress);

            if (res.success) {
                toast.success("Verification Successful! You are now eligible.");
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
                    <div className="bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 rounded-xl p-6 text-center animate-pulse-glow">
                        <h3 className="font-bold text-lg mb-1">You are qualified! 🎉</h3>
                        <p>You will receive your rewards on the next distribution date.</p>
                    </div>
                ) : (
                    <div className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20 rounded-xl p-6 text-center">
                        <h3 className="font-bold text-lg mb-4">Verification Needed</h3>
                        <button
                            onClick={handleCheckEligibility}
                            disabled={checking}
                            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50"
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
                                {user.actBalance
                                    ? `${parseFloat(user.actBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${user.actSymbol || 'ACT'}`
                                    : "0 ACT"
                                }
                            </p>
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
