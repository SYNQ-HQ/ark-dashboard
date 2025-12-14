'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
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
    profileImageUrl?: string | null;
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
    bnbBalance?: string;
    actBalance?: string;
    actSymbol?: string;
    holdingStartedAt?: string | Date | null;
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

    // Fetch Balances
    const { data: bnbBalance } = useBalance({
        address: address,
    });

    const { data: actBalance } = useBalance({
        address: address,
        token: '0x345F6423cEf697926C23dC010Eb1B96f8268bcec',
    });

    // Comprehensive cleanup function
    const clearAllState = useCallback(() => {
        console.log('Clearing all wallet state...');

        // Clear user state
        setUser(null);

        // Clear wagmi localStorage entries
        if (typeof window !== 'undefined') {
            try {
                // Clear all wagmi-related keys
                const keysToRemove = [
                    'wagmi.store',
                    'wagmi.recentConnectorId',
                    'wagmi.wallet',
                    'wagmi.connected',
                    'wagmi.cache',
                    'wagmi.injected.shimDisconnect'
                ];

                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                });

                // Clear any connector-specific disconnected flags
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('wagmi.') && key.includes('.disconnected')) {
                        localStorage.removeItem(key);
                    }
                });

                console.log('LocalStorage cleared');
            } catch (e) {
                console.error('Failed to clear localStorage:', e);
            }
        }

        // Disconnect wallet
        try {
            disconnect();
        } catch (e) {
            console.error('Disconnect error:', e);
        }
    }, [disconnect]);

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
                // Auth failed - clear everything and notify user
                console.error("Auth failed:", authRes.error);
                const { toast } = await import('sonner');
                toast.error("Authentication failed. Please reconnect your wallet.");
                clearAllState();
            }
        } catch (error) {
            // Network or unexpected error - clear everything and notify user
            console.error("Failed to load user:", error);
            const { toast } = await import('sonner');
            toast.error("Connection error. Please try reconnecting.");
            clearAllState();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, isConnected]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Don't clear state on unmount, only on errors
        };
    }, []);

    // Merge balances into user object
    const userWithBalances = user ? {
        ...user,
        bnbBalance: bnbBalance?.formatted,
        actBalance: actBalance?.formatted,
        actSymbol: actBalance?.symbol
    } : null;

    return (
        <UserContext.Provider value={{ user: userWithBalances, loading, refetchUser: loadUser }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
