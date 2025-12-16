"use client";

import { useState, useEffect } from "react";
import { acceptOath } from "@/actions/oath";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

export default function OathModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { user, refetchUser } = useUser();
    const [elapsed, setElapsed] = useState(0);
    const [accepted, setAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Timer
    useEffect(() => {
        if (!isOpen) {
            setElapsed(0);
            return;
        }

        const startTime = Date.now();
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 100);

        return () => clearInterval(interval);
    }, [isOpen]);

    const handleAccept = async () => {
        if (!user || submitting) return;

        setSubmitting(true);
        try {
            await acceptOath(user.id, elapsed);
            toast.success("Welcome to the Order.");
            refetchUser();
            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Failed to accept oath");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const canAccept = elapsed >= 5;

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 overflow-y-auto scrollbar-hidden">
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 rounded-full bg-primary/10 mb-4 animate-pulse-slow">
                            <span className="material-icons text-3xl text-primary">verified_user</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight mb-2">THE ARK OATH</h2>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest">Read carefully before proceeding</p>
                    </div>

                    <div className="prose dark:prose-invert prose-sm mx-auto text-center font-serif leading-relaxed space-y-4 mb-8 text-foreground/90">
                        <p>I enter ARK not for noise, but for meaning.</p>

                        <p>I choose to act with intention,<br />
                            to give without spectacle,<br />
                            and to respect the dignity of every person I encounter.</p>

                        <p>I understand that kindness is not weakness, <br />
                            it is discipline, consistency, and courage.</p>

                        <p>I will support what I believe in,<br />
                            protect what is built in good faith,<br />
                            and uplift others without expectation of return.</p>

                        <p>I accept that my rank is earned through action,<br />
                            my reputation through consistency,<br />
                            and my legacy through impact.</p>

                        <p>I will not exploit this space,<br />
                            dilute its purpose,<br />
                            or take without giving back.</p>

                        <p className="font-bold text-primary italic">
                            As long as I remain in ARK,<br />
                            I commit to showing up,<br />
                            acting honestly,<br />
                            and leaving this place better than I found it.
                        </p>

                        <p className="text-lg font-bold">This is my oath.</p>
                    </div>
                </div>

                <div className="p-6 bg-muted/30 border-t border-border flex flex-col items-center">
                    <div className="w-full h-1 bg-muted rounded-full mb-4 overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-100 ease-linear"
                            style={{ width: `${Math.min(100, (elapsed / 5) * 100)}%` }}
                        />
                    </div>

                    <button
                        onClick={handleAccept}
                        disabled={!canAccept || submitting}
                        className={`w-full py-4 rounded-lg font-bold text-base transition-all duration-300 ${canAccept
                            ? "bg-primary text-primary-foreground hover:shadow-lg hover:scale-[1.02]"
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                            }`}
                    >
                        {submitting ? "Signing..." : canAccept ? "I ACCEPT THE OATH" : `Read for ${5 - elapsed > 0 ? 5 - elapsed : 0}s`}
                    </button>
                </div>
            </div>
        </div>
    );
}
