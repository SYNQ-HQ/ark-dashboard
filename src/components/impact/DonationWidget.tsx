"use client";

import { donateToImpact } from "@/actions/impact";
import { useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";

export default function DonationWidget({ storyId }: { storyId: string }) {
    const { user } = useUser();
    const [amount, setAmount] = useState<number | "">("");
    const [loading, setLoading] = useState(false);

    const PRESETS = [10, 50, 100, 500];

    async function handleDonate() {
        if (!user) {
            toast.error("Please connect your wallet to donate.");
            return;
        }

        const val = Number(amount);
        if (!val || val <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }

        setLoading(true);
        // Simulation of payment flow (e.g. approve + transfer calls via wagmi)
        // Here we just call the backend simulation action.

        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Fake tx delay
            const res = await donateToImpact(storyId, val);

            if (res.success) {
                toast.success(`Thank you! Donated $${val} successfully.`);
                setAmount("");
            } else {
                toast.error(res.message);
            }
        } catch (e) {
            toast.error("Donation failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Make an Impact</h3>
            <div className="flex flex-wrap gap-2 mb-4">
                {PRESETS.map((val) => (
                    <button
                        key={val}
                        onClick={() => setAmount(val)}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${amount === val
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border hover:bg-muted"
                            }`}
                    >
                        ${val}
                    </button>
                ))}
            </div>

            <div className="relative mb-6">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="Enter custom amount"
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    disabled={loading}
                />
            </div>

            <button
                onClick={handleDonate}
                disabled={loading || !amount}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:brightness-110 transition-all disabled:opacity-50 active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
                {loading ? "Processing..." : "Donate Now"}
            </button>
            <p className="text-xs text-center text-muted-foreground mt-3">
                100% of your donation goes directly to the cause.
            </p>
        </div>
    );
}
