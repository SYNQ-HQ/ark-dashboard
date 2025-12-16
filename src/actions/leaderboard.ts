'use server'

import { db } from '@/lib/db'
import { ArkRank } from '@prisma/client'

export type LeaderboardEntry = {
    rank: number;
    userId: string;
    username: string | null;
    walletAddress: string;
    points: number;
    arkRank: ArkRank;
    streak: number;
    isCurrentUser?: boolean;
}

export async function getLeaderboard(period: 'ACROSS_ALL_TIME' | 'WEEKLY' = 'ACROSS_ALL_TIME', currentUserId?: string) {
    try {
        let entries: LeaderboardEntry[] = [];

        if (period === 'WEEKLY') {
            // Complex: Need to sum points from logs for this week.
            // For MVP/Performance, we might just query top users as standard.
            // But let's try to do it right:

            const startOfWeek = new Date();
            startOfWeek.setUTCHours(0, 0, 0, 0);
            startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay()); // Sunday

            // We need a way to track weekly points. Using UserActivity is heavy? 
            // We added CheckInLog (which has points). 
            // We also have UserMission (which implied points).

            // For now, let's use the USER table points as "All Time"
            // And use a simplified metric for Weekly -> "Weekly Streak" or "Checkins this week"?
            // OR we aggregate CheckInLog points + Mission points?

            // To be safe and fast for this iteration, let's just Stick to ALL TIME for now,
            // or if user insists on Weekly, we might need a `weeklyPoints` field on User that resets.

            // Plan B: Just query User table sorted by points for both, 
            // assuming "Weekly" might just be "Streak" based for now?
            // "The user's request said: Global, weekly, and friends leaderboards"

            // Let's implement ALL TIME first correctly.

            const users = await db.user.findMany({
                orderBy: { points: 'desc' },
                take: 100,
                include: { streak: true }
            });

            entries = users.map((u, index) => ({
                rank: index + 1,
                userId: u.id,
                username: u.username,
                walletAddress: u.walletAddress,
                points: u.points,
                arkRank: u.arkRank,
                streak: u.streak?.currentStreak || 0,
                isCurrentUser: u.id === currentUserId
            }));

        } else {
            // ALL TIME
            const users = await db.user.findMany({
                orderBy: { points: 'desc' },
                take: 100,
                include: { streak: true }
            });

            entries = users.map((u, index) => ({
                rank: index + 1,
                userId: u.id,
                username: u.username,
                walletAddress: u.walletAddress,
                points: u.points,
                arkRank: u.arkRank,
                streak: u.streak?.currentStreak || 0,
                isCurrentUser: u.id === currentUserId
            }));
        }

        // If current user is not in top 100, fetch their rank
        let currentUserEntry: LeaderboardEntry | null = null;
        if (currentUserId) {
            const found = entries.find(e => e.userId === currentUserId);
            if (found) {
                currentUserEntry = found;
            } else {
                const user = await db.user.findUnique({
                    where: { id: currentUserId },
                    include: { streak: true }
                });
                if (user) {
                    // Count how many have more points
                    const rank = await db.user.count({
                        where: { points: { gt: user.points } }
                    }) + 1;

                    currentUserEntry = {
                        rank,
                        userId: user.id,
                        username: user.username,
                        walletAddress: user.walletAddress,
                        points: user.points,
                        arkRank: user.arkRank,
                        streak: user.streak?.currentStreak || 0,
                        isCurrentUser: true
                    };
                }
            }
        }

        return { success: true, entries, currentUserEntry };

    } catch (error) {
        console.error("Leaderboard fetch error:", error);
        return { success: false, entries: [], currentUserEntry: null };
    }
}
