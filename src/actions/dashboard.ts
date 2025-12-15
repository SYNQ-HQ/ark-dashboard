'use server'

import { db } from '@/lib/db'

export async function fetchDashboardData(walletAddress: string) {
    try {
        const user = await db.user.findUnique({
            where: { walletAddress },
            include: {
                streak: true,
                missions: {
                    where: {
                        status: 'COMPLETED'
                    }
                }
            }
        })

        if (!user) return null

        // For mission progress in dashboard, we might want to fetch all available missions vs completed
        const totalMissionsToday = await db.mission.count({
            where: { frequency: 'DAILY' }
        })

        // Community Stats
        const totalCheckIns = await db.checkInLog.count();
        const totalPointsAgg = await db.user.aggregate({ _sum: { points: true } });
        const activeUsers = await db.user.count({ where: { points: { gt: 0 } } });

        // Simple logic: Completed missions count
        const completedMissionsCount = user.missions.length

        return {
            points: user.points,
            streak: user.streak,
            completedMissionsCount,
            totalMissionsToday,
            isEligible: user.isEligible,
            arkRank: (user as any).arkRank,
            oathAcceptedAt: (user as any).oathAcceptedAt, // Cast to any to bypass stale type definition
            oathDurationSeconds: (user as any).oathDurationSeconds,
            communityStats: {
                totalCheckIns,
                totalPoints: totalPointsAgg._sum.points || 0,
                activeUsers
            }
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        return null
    }
}

export async function claimDailyStreak(_walletAddress: string) {
    // Logic to update streak would go here
    // For now, return result
    return { success: true, message: "Streak claimed!" }
}
