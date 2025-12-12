'use server'

import { db } from '@/lib/db'

export async function logActivity(userId: string, type: string, description: string) {
    try {
        await db.userActivity.create({
            data: {
                userId,
                type,
                description
            }
        })
    } catch (e) {
        console.error("Failed to log activity:", e)
    }
}

export async function getRecentActivity(userId: string, limit = 5) {
    try {
        const activities = await db.userActivity.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit
        })
        return activities
    } catch (e) {
        console.error("Failed to fetch activity:", e)
        return []
    }
}

export async function getAdminActivity(limit = 10) {
    try {
        return await db.userActivity.findMany({
            where: {
                type: { startsWith: 'ADMIN_' }
            },
            include: { user: { select: { username: true } } },
            orderBy: { createdAt: 'desc' },
            take: limit
        })
    } catch (e) {
        console.error("Failed to fetch admin activity:", e)
        return []
    }
}
