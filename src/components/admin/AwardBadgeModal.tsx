"use client";

import { awardBadge } from "@/actions/badges";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { useState } from "react";

interface Badge {
    id: string;
    name: string;
}

interface AwardBadgeModalProps {
    badge: Badge;
    onClose: () => void;
}

export default function AwardBadgeModal({ badge, onClose }: AwardBadgeModalProps) {
    const { user } = useUser();
    
    async function handleSubmit(formData: FormData) {
        if (!user) return;

        formData.append("adminId", user.id);
        formData.append("badgeId", badge.id);

        const res = await awardBadge(formData);

        if (res.success) {
            toast.success(`Badge awarded to user!`);
            onClose();
        } else {
            toast.error(res.message || "Failed to award badge");
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-bold text-lg mb-4">Award "{badge.name}"</h3>
                <p className="text-sm text-muted-foreground mb-4">Enter the username of the user receiving this badge.</p>
                
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-muted-foreground">@</span>
                            <input
                                name="username"
                                required
                                className="w-full pl-7 pr-3 py-2 rounded-lg border border-border bg-background"
                                placeholder="username"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:brightness-110 transition-all"
                        >
                            Award Badge
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
