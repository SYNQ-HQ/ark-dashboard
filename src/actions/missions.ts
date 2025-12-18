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

        // Map missions to include user status
        return missions.map((mission: Mission) => {
            const userMission = user.missions.find((um: UserMission) => um.missionId === mission.id)
            return {
                ...mission,
                userStatus: userMission?.status || 'PENDING' // User specific status
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

export async function createMission(formData: FormData) {
    try {
        const adminId = formData.get('adminId') as string
        if (!adminId) return { success: false, message: "Unauthorized" }

        const admin = await db.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            return { success: false, message: "Unauthorized: Admin access required" }
        }

        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const points = parseInt(formData.get('points') as string)
        const type = formData.get('type') as string
        const frequency = formData.get('frequency') as string
        const imageUrl = formData.get('imageUrl') as string | null

        // New fields
        const location = formData.get('location') as string | null
        const dateStr = formData.get('date') as string | null
        const date = dateStr ? new Date(dateStr) : null
        const raised = formData.get('raised') ? parseFloat(formData.get('raised') as string) : 0
        const goal = formData.get('goal') ? parseFloat(formData.get('goal') as string) : null
        const supporters = formData.get('supporters') ? parseInt(formData.get('supporters') as string) : 0
        const status = formData.get('status') as string || 'active'

        await db.mission.create({
            data: {
                title,
                description,
                points,
                type,
                frequency,
                imageUrl: imageUrl || null
            }
        })

        await logActivity(admin.id, "ADMIN_MISSION_CREATE", `Created mission: ${title} (${points} pts)`)

        const { revalidatePath } = await import('next/cache')
        revalidatePath('/admin/missions')
        revalidatePath('/missions')
        return { success: true }
    } catch (error) {
        console.error("Create mission error:", error)
        return { success: false, message: "Failed to create mission" }
    }
}

export async function updateMission(formData: FormData) {
    try {
        const adminId = formData.get('adminId') as string
        const missionId = formData.get('missionId') as string

        if (!adminId) return { success: false, message: "Unauthorized" }

        const admin = await db.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            return { success: false, message: "Unauthorized: Admin access required" }
        }

        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const points = parseInt(formData.get('points') as string)
        const type = formData.get('type') as string
        const frequency = formData.get('frequency') as string
        const imageUrl = formData.get('imageUrl') as string | null

        // New fields
        const location = formData.get('location') as string | null
        const dateStr = formData.get('date') as string | null
        const date = dateStr ? new Date(dateStr) : null
        const raised = formData.get('raised') ? parseFloat(formData.get('raised') as string) : undefined
        const goal = formData.get('goal') ? parseFloat(formData.get('goal') as string) : undefined
        const supporters = formData.get('supporters') ? parseInt(formData.get('supporters') as string) : undefined
        const status = formData.get('status') as string || undefined

        await db.mission.update({
            where: { id: missionId },
            data: {
                title,
                description,
                points,
                type,
                frequency,
                imageUrl: imageUrl || null
            }
        })

        await logActivity(admin.id, "ADMIN_MISSION_UPDATE", `Updated mission: ${title}`)

        const { revalidatePath } = await import('next/cache')
        revalidatePath('/admin/missions')
        revalidatePath('/missions')
        return { success: true }
    } catch (error) {
        console.error("Update mission error:", error)
        return { success: false, message: "Failed to update mission" }
    }
}


export async function deleteMission(missionId: string, adminId: string) {
    try {
        if (!adminId) return { success: false, message: "Unauthorized" }

        const admin = await db.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            return { success: false, message: "Unauthorized: Admin access required" }
        }

        const mission = await db.mission.findUnique({ where: { id: missionId } })
        if (!mission) return { success: false, message: "Mission not found" }

        // Cleanup user missions first
        await db.$transaction([
            db.userMission.deleteMany({ where: { missionId } }),
            db.mission.delete({ where: { id: missionId } })
        ])

        await logActivity(admin.id, "ADMIN_MISSION_DELETE", `Deleted mission: ${mission.title}`)

        const { revalidatePath } = await import('next/cache')
        revalidatePath('/admin/missions')
        revalidatePath('/missions')
        return { success: true }
    } catch (error) {
        console.error("Delete mission error:", error)
        return { success: false, message: "Failed to delete mission" }
    }
}
