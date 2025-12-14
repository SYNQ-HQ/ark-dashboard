'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { logActivity } from './activity'

export async function fetchBadges() {
    try {
        return await db.badge.findMany({
            include: { _count: { select: { userBadges: true } } }
        })
    } catch (error) {
        console.error("Error fetching badges:", error)
        return []
    }
}

export async function createBadge(formData: FormData) {
    try {
        const adminId = formData.get('adminId') as string
        if (!adminId) return { success: false, message: "Unauthorized" }

        const admin = await db.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            return { success: false, message: "Unauthorized: Admin access required" }
        }

        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const icon = formData.get('icon') as string // Emoji or image URL logic

        await db.badge.create({
            data: {
                name,
                description,
                icon
            }
        })

        await logActivity(admin.id, "ADMIN_BADGE_CREATE", `Created badge: ${name}`)

        revalidatePath('/admin/badges')
        revalidatePath('/profile')
        return { success: true }
    } catch (error) {
        console.error("Create badge error:", error)
        return { success: false, message: "Failed to create badge" }
    }
}

export async function updateBadge(formData: FormData) {
    try {
        const adminId = formData.get('adminId') as string
        const badgeId = formData.get('badgeId') as string
        if (!adminId) return { success: false, message: "Unauthorized" }

        const admin = await db.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            return { success: false, message: "Unauthorized: Admin access required" }
        }

        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const icon = formData.get('icon') as string

        await db.badge.update({
            where: { id: badgeId },
            data: { name, description, icon }
        })

        await logActivity(admin.id, "ADMIN_BADGE_UPDATE", `Updated badge: ${name}`)

        revalidatePath('/admin/badges')
        revalidatePath('/profile')
        return { success: true }
    } catch (error) {
        console.error("Update badge error:", error)
        return { success: false, message: "Failed to update badge" }
    }
}

export async function deleteBadge(badgeId: string, adminId: string) {
    try {
        const admin = await db.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            return { success: false, message: "Unauthorized: Admin access required" }
        }

        const badge = await db.badge.findUnique({ where: { id: badgeId } })
        if (!badge) return { success: false, message: "Badge not found" }

        await db.badge.delete({ where: { id: badgeId } })

        await logActivity(admin.id, "ADMIN_BADGE_DELETE", `Deleted badge: ${badge.name}`)

        revalidatePath('/admin/badges')
        revalidatePath('/profile')
        return { success: true }
    } catch (error) {
        console.error("Delete badge error:", error)
        return { success: false, message: "Failed to delete badge" }
    }
}

export async function deleteBadgeAction(formData: FormData) {
    const badgeId = formData.get('badgeId') as string;
    const adminId = formData.get('adminId') as string;
    return await deleteBadge(badgeId, adminId);
}

export async function awardBadge(formData: FormData) {
    try {
        const adminId = formData.get('adminId') as string
        const badgeId = formData.get('badgeId') as string
        const targetUsername = formData.get('username') as string

        if (!adminId) return { success: false, message: "Unauthorized" }

        const admin = await db.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            return { success: false, message: "Unauthorized: Admin access required" }
        }

        const targetUser = await db.user.findUnique({ where: { username: targetUsername } })
        if (!targetUser) return { success: false, message: "User not found" }

        // Check if already awarded
        const existing = await db.userBadge.findUnique({
            where: {
                userId_badgeId: {
                    userId: targetUser.id,
                    badgeId
                }
            }
        })

        if (existing) return { success: false, message: "User already has this badge" }

        await db.userBadge.create({
            data: {
                userId: targetUser.id,
                badgeId
            }
        })

        await logActivity(admin.id, "ADMIN_BADGE_AWARD", `Awarded badge to @${targetUsername}`)

        revalidatePath('/admin/badges')
        return { success: true }
    } catch (error) {
        console.error("Award badge error:", error)
        return { success: false, message: "Failed to award badge" }
    }
}
