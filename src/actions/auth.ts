'use server'

import { db } from '@/lib/db'

export async function auth(walletAddress: string) {
    try {
        let user = await db.user.findUnique({
            where: { walletAddress },
            include: { streak: true, missions: true, badges: { include: { badge: true } } }
        })

        if (!user) {
            // New User Registration
            const shortAddr = walletAddress.slice(0, 6);
            try {
                user = await db.user.create({
                    data: {
                        walletAddress,
                        username: `User-${shortAddr}`, // Default name
                        points: 0,
                        streak: {
                            create: { currentStreak: 0 }
                        }
                    },
                    include: { streak: true, missions: true, badges: { include: { badge: true } } }
                })
            } catch (e) {
                // Handle race condition: if create fails, try fetching again
                console.warn("User creation failed (likely race condition), refetching...", e);
                user = await db.user.findUnique({
                    where: { walletAddress },
                    include: { streak: true, missions: true, badges: { include: { badge: true } } }
                });
            }
        }

        return { success: true, user }
    } catch (error) {
        console.error("Auth error:", error)
        return { success: false, error: "Authentication failed" }
    }
}
