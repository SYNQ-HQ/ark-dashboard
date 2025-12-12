"use client";

import { toggleUserBan } from "@/actions/user";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { useState } from "react";

interface UserActionsProps {
    targetUser: {
        id: string;
        role: string;
        isBanned: boolean;
    };
}

export default function UserActions({ targetUser }: UserActionsProps) {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    async function handleBan() {
        if (!user) return;
        setLoading(true);
        const res = await toggleUserBan(targetUser.id, user.id);
        setLoading(false);

        if (res.success) {
            toast.success(targetUser.isBanned ? "User active updated" : "User banned");
        } else {
            toast.error(res.message || "Action failed");
        }
    }

    return (
        <button
            onClick={handleBan}
            disabled={targetUser.role === 'ADMIN' || loading}
            className={`text-xs px-3 py-1 rounded border transition-colors ${targetUser.isBanned
                ? 'border-green-200 text-green-600 hover:bg-green-50'
                : 'border-red-200 text-red-600 hover:bg-red-50'
                } ${targetUser.role === 'ADMIN' || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {loading ? '...' : targetUser.isBanned ? 'Unban' : 'Ban'}
        </button>
    );
}
