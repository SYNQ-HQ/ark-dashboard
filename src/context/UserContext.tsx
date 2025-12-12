'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { auth } from '@/actions/auth';
import { fetchDashboardData } from '@/actions/dashboard';
// We might need types here, but let's keep it simple for now or import
// import { User } from '@prisma/client' // Won't work in client directly w/o strict types

// Define a strict User interface
interface User {
    id: string;
    walletAddress: string;
    username: string | null;
    role?: 'USER' | 'ADMIN';
    bio: string | null;
    points: number;
    isEligible: boolean;
    lastUsernameChange?: string | Date | null;
    streak?: {
        currentStreak: number;
        lastCheckIn: string | Date;
    } | null;
    createdAt: string | Date;
    completedMissionsCount?: number;
    badges?: { badge: { id: string; name: string; icon: string } }[];
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    refetchUser: async () => { },
});

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        if (!isConnected || !address) {
            setUser(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // 1. Auth (Create if missing)
            const authRes = await auth(address);
            if (authRes.success && authRes.user) {
                // 2. Fetch fresh data
                const dashData = await fetchDashboardData(address);

                setUser({
                    ...authRes.user,
                    ...dashData
                });
            } else {
                console.error("Auth failed:", authRes.error);
                disconnect();
            }
        } catch (error) {
            console.error("Failed to load user:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, isConnected]);

    return (
        <UserContext.Provider value={{ user, loading, refetchUser: loadUser }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
