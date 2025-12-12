'use server'

import { db } from '@/lib/db'
import { Mission, UserMission } from '@prisma/client'
import { logActivity } from './activity'

export async function fetchMissions(walletAddress: string) {
    try {
        const user = await db.user.findUnique({
            where: { walletAddress },
            include: { missions: true }
        })

        if (!user) return []

        const missions = await db.mission.findMany()

        // Map missions to include status
        return missions.map((mission: Mission) => {
            const userMission = user.missions.find((um: UserMission) => um.missionId === mission.id)
            return {
                ...mission,
                status: userMission?.status || 'PENDING'
            }
        })
    } catch (error) {
        console.error('Error fetching missions:', error)
        return []
    }
}

export async function completeMission(walletAddress: string, missionId: string) {
    try {
        const user = await db.user.findUnique({ where: { walletAddress } })
        if (!user) throw new Error("User not found")

        const mission = await db.mission.findUnique({ where: { id: missionId } })
        if (!mission) throw new Error("Mission not found")

        // Check if already completed
        const existing = await db.userMission.findUnique({
            where: {
                userId_missionId: {
                    userId: user.id,
                    missionId: mission.id
                }
            }
        })

        if (existing && existing.status === 'COMPLETED') {
            return { success: false, message: "Already completed" }
        }

        // Create completion record
        await db.userMission.upsert({
            where: {
                userId_missionId: {
                    userId: user.id,
                    missionId: mission.id
                }
            },
            update: {
                status: 'COMPLETED',
                completedAt: new Date()
            },
            create: {
                userId: user.id,
                missionId: mission.id,
                status: 'COMPLETED',
                completedAt: new Date()
            }
        })

        // Award points
        await db.user.update({
            where: { id: user.id },
            data: { points: { increment: mission.points } }
        })

        await logActivity(user.id, "MISSION", `Completed mission: ${mission.title}`)

        return { success: true, points: mission.points }
    } catch (error) {
        console.error("Error completing mission:", error)
        return { success: false }
    }
}
