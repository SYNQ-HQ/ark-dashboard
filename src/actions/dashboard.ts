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

        // Simple logic: Completed missions count
        const completedMissionsCount = user.missions.length

        return {
            points: user.points,
            streak: user.streak,
            completedMissionsCount,
            totalMissionsToday,
            isEligible: user.isEligible
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
