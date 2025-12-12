'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { logActivity } from './activity'

// Helper to check availability without updating
export async function checkUsernameAvailability(username: string) {
    if (!username || username.length < 3 || username.length > 20) {
        return { available: false, message: "3-20 characters required." }
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return { available: false, message: "Letters, numbers, _, - only." }
    }

    const existing = await db.user.findUnique({
        where: { username }
    })

    if (existing) {
        return { available: false, message: "Username taken." }
    }

    return { available: true }
}

export async function updateUsername(walletAddress: string, newUsername: string) {
    try {
        const user = await db.user.findUnique({ where: { walletAddress } })
        if (!user) return { success: false, message: "User not found" }

        // 1. Validation
        const validation = await checkUsernameAvailability(newUsername)
        if (!validation.available) {
            return { success: false, message: validation.message }
        }

        // 2. Cooldown Check (7 days)
        if (user.lastUsernameChange) {
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

            if (user.lastUsernameChange > sevenDaysAgo) {
                const daysLeft = Math.ceil((user.lastUsernameChange.getTime() + (7 * 24 * 60 * 60 * 1000) - Date.now()) / (1000 * 60 * 60 * 24))
                return { success: false, message: `You can change your username again in ${daysLeft} days.` }
            }
        }

        // 3. Update
        await db.user.update({
            where: { walletAddress },
            data: {
                username: newUsername,
                lastUsernameChange: new Date()
            }
        })

        revalidatePath('/profile')
        return { success: true }
    } catch (error) {
        console.error("Error updating username:", error)
        return { success: false, message: "Failed to update username." }
    }
}

export async function toggleUserBan(targetUserId: string, adminId: string) {
    try {
        // Verify Admin
        const admin = await db.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            return { success: false, message: "Unauthorized" }
        }

        const user = await db.user.findUnique({ where: { id: targetUserId } })
        if (!user) return { success: false, message: "User not found" }

        // Prevent banning self or other admins
        if (user.role === 'ADMIN') {
            return { success: false, message: "Cannot ban an admin." }
        }

        await db.user.update({
            where: { id: targetUserId },
            data: { isBanned: !user.isBanned }
        })

        const action = !user.isBanned ? "ADMIN_USER_BAN" : "ADMIN_USER_UNBAN"
        const desc = !user.isBanned ? `Banned user: ${user.username}` : `Unbanned user: ${user.username}`

        await logActivity(adminId, action, desc)

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error("Error toggling ban:", error)
        return { success: false, message: "Failed to update ban status." }
    }
}

export async function claimDailyCheckIn(walletAddress: string) {
    try {
        const user = await db.user.findUnique({
            where: { walletAddress },
            include: { streak: true }
        })
        if (!user) return { success: false, message: "User not found" }

        const now = new Date();
        let newStreakCount = 1;

        if (user.streak) {
            const last = new Date(user.streak.lastCheckIn);
            const isSameDay = last.getUTCFullYear() === now.getUTCFullYear() &&
                last.getUTCMonth() === now.getUTCMonth() &&
                last.getUTCDate() === now.getUTCDate();

            if (isSameDay) {
                return { success: false, message: "Already claimed today (UTC)." }
            }

            // Check if streak is broken (last check-in was before yesterday)
            const yesterday = new Date(now);
            yesterday.setUTCDate(now.getUTCDate() - 1);

            const isYesterday = last.getUTCFullYear() === yesterday.getUTCFullYear() &&
                last.getUTCMonth() === yesterday.getUTCMonth() &&
                last.getUTCDate() === yesterday.getUTCDate();

            if (isYesterday) {
                newStreakCount = user.streak.currentStreak + 1;
            } else {
                newStreakCount = 1; // Streak broken
            }
        }

        await db.streak.upsert({
            where: { userId: user.id },
            update: {
                currentStreak: newStreakCount,
                lastCheckIn: now
            },
            create: {
                userId: user.id,
                currentStreak: 1,
                lastCheckIn: now
            }
        })

        await logActivity(user.id, "CHECK_IN", `Claimed daily blessing (+${newStreakCount} day streak)`)

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error("Check-in error:", error)
        return { success: false, message: "Failed to claim check-in." }
    }
}
