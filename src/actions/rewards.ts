'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function fetchRewards() {
    return await db.reward.findMany({
        orderBy: { cost: 'asc' },
        include: { _count: { select: { redemptions: true } } }
    })
}

export async function redeemReward(walletAddress: string, rewardId: string) {
    try {
        const user = await db.user.findUnique({ where: { walletAddress } })
        if (!user) throw new Error("User not found")

        const reward = await db.reward.findUnique({ where: { id: rewardId } })
        if (!reward) throw new Error("Reward not found")

        if (user.points < reward.cost) {
            return { success: false, message: "Insufficient points" }
        }

        // Deduct points and track redemption
        await db.$transaction([
            db.user.update({
                where: { id: user.id },
                data: { points: { decrement: reward.cost } }
            }),
            db.redemption.create({
                data: {
                    userId: user.id,
                    rewardId: reward.id
                }
            })
        ])

        return { success: true, rewardName: reward.name }
    } catch (error) {
        console.error("Redemption error:", error)
        return { success: false, message: "Transaction failed" }
    }
}

export async function createReward(formData: FormData) {
    try {
        const adminId = formData.get('adminId') as string
        if (!adminId) return { success: false, message: "Unauthorized" }

        const admin = await db.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            return { success: false, message: "Unauthorized: Admin access required" }
        }

        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const cost = parseInt(formData.get('cost') as string)
        const stock = formData.get('stock') ? parseInt(formData.get('stock') as string) : null
        const imageUrl = formData.get('imageUrl') as string || null

        await db.reward.create({
            data: {
                name,
                description,
                cost,
                stock,
                imageUrl
            }
        })

        const { logActivity } = await import('./activity')
        await logActivity(admin.id, "ADMIN_REWARD_CREATE", `Created reward: ${name} (${cost} pts)`)

        revalidatePath('/admin/rewards')
        revalidatePath('/rewards') // Update user facing page too
        return { success: true }
    } catch (error) {
        console.error("Create reward error:", error)
        return { success: false, message: "Failed to create reward" }
    }
}

export async function updateReward(formData: FormData) {
    try {
        const adminId = formData.get('adminId') as string
        const rewardId = formData.get('rewardId') as string

        if (!adminId) return { success: false, message: "Unauthorized" }

        const admin = await db.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            return { success: false, message: "Unauthorized: Admin access required" }
        }

        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const cost = parseInt(formData.get('cost') as string)
        const stock = formData.get('stock') ? parseInt(formData.get('stock') as string) : null
        const imageUrl = formData.get('imageUrl') as string || null

        await db.reward.update({
            where: { id: rewardId },
            data: {
                name,
                description,
                cost,
                stock,
                imageUrl
            }
        })

        const { logActivity } = await import('./activity')
        await logActivity(admin.id, "ADMIN_REWARD_UPDATE", `Updated reward: ${name}`)

        revalidatePath('/admin/rewards')
        revalidatePath('/rewards')
        return { success: true }
    } catch (error) {
        console.error("Update reward error:", error)
        return { success: false, message: "Failed to update reward" }
    }
}

export async function deleteRewardAction(formData: FormData) {
    try {
        const adminId = formData.get('adminId') as string
        const rewardId = formData.get('rewardId') as string

        if (!adminId) return { success: false, message: "Unauthorized" }

        const admin = await db.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            return { success: false, message: "Unauthorized: Admin access required" }
        }

        const reward = await db.reward.findUnique({ where: { id: rewardId } })
        if (!reward) return { success: false, message: "Reward not found" }

        await db.reward.delete({ where: { id: rewardId } })

        const { logActivity } = await import('./activity')
        await logActivity(admin.id, "ADMIN_REWARD_DELETE", `Deleted reward: ${reward.name}`)

        revalidatePath('/admin/rewards')
        revalidatePath('/rewards')
        return { success: true }
    } catch (error) {
        console.error("Delete reward error:", error)
        return { success: false, message: "Failed to delete reward" }
    }
}
