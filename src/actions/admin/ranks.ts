'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { logActivity } from '@/actions/activity'
import { ArkRank } from '@prisma/client'

export async function getAllUsersWithRanks() {
    try {
        const users = await db.user.findMany({
            select: {
                id: true,
                walletAddress: true,
                username: true,
                points: true,
                arkRank: true,
                createdAt: true,
                streak: {
                    select: {
                        currentStreak: true,
                        longestStreak: true
                    }
                }
            },
            orderBy: { points: 'desc' }
        });

        return { success: true, users };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, users: [], error: "Failed to fetch users" };
    }
}

export async function assignRankToUser(userId: string, newRank: ArkRank, adminId: string) {
    try {
        // Verify admin permissions
        const admin = await db.user.findUnique({
            where: { id: adminId },
            select: { role: true }
        });

        if (admin?.role !== 'ADMIN') {
            return { success: false, error: "Unauthorized" };
        }

        // Get current user data
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { arkRank: true, username: true, walletAddress: true }
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Update user rank
        await db.user.update({
            where: { id: userId },
            data: { arkRank: newRank }
        });

        // Log in rank history
        await db.rankHistory.create({
            data: {
                userId,
                rank: newRank,
                promotedAt: new Date()
            }
        });

        // Log activity
        await logActivity(
            userId,
            "RANK_ASSIGNMENT",
            `Rank manually assigned to ${newRank} by admin`
        );

        revalidatePath('/admin/ranks');
        revalidatePath('/ranks');
        revalidatePath('/');

        return {
            success: true,
            message: `Successfully assigned ${newRank} to ${user.username || user.walletAddress.slice(0, 8)}`
        };
    } catch (error) {
        console.error("Error assigning rank:", error);
        return { success: false, error: "Failed to assign rank" };
    }
}

export async function getRankHistory(userId: string) {
    try {
        const history = await db.rankHistory.findMany({
            where: { userId },
            orderBy: { promotedAt: 'desc' },
            take: 20
        });

        return { success: true, history };
    } catch (error) {
        console.error("Error fetching rank history:", error);
        return { success: false, history: [], error: "Failed to fetch history" };
    }
}
