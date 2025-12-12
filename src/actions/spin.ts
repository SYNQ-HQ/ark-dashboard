'use server'

import { db } from '@/lib/db'

const PRIZES = [
    { label: "100 PTS", type: "POINTS", value: 100, weight: 40 },
    { label: "Badge", type: "BADGE", value: "lucky_spinner", weight: 5 },
    { label: "250 PTS", type: "POINTS", value: 250, weight: 30 },
    { label: "$ACT", type: "TOKEN", value: 50, weight: 10 }, // 50 ACT
    { label: "500 PTS", type: "POINTS", value: 500, weight: 10 },
    { label: "Secret Mission", type: "MISSION", value: "secret_mission_1", weight: 5 },
];

export async function spinWheel(walletAddress: string) {
    try {
        const user = await db.user.findUnique({
            where: { walletAddress },
            include: { badges: true }
        })

        if (!user) return { success: false, message: "User not found" }

        // Check Cooldown (24 hours) - simplified for demo, maybe 1 minute for testing?
        // Let's stick to 24h for "Daily Spin" realism, or maybe bypass if dev env.
        // For this demo, let's allow it if lastSpin is not today (UTC).
        const now = new Date()

        if (user.lastSpin) {
            const lastSpinDate = new Date(user.lastSpin)
            // Check if same day
            if (
                lastSpinDate.getUTCFullYear() === now.getUTCFullYear() &&
                lastSpinDate.getUTCMonth() === now.getUTCMonth() &&
                lastSpinDate.getUTCDate() === now.getUTCDate()
            ) {
                return { success: false, message: "Already spun today! Come back tomorrow." }
            }
        }

        // Randomize
        const totalWeight = PRIZES.reduce((acc, p) => acc + p.weight, 0)
        let random = Math.random() * totalWeight
        let selectedPrize = PRIZES[0]

        for (const prize of PRIZES) {
            if (random < prize.weight) {
                selectedPrize = prize
                break
            }
            random -= prize.weight
        }

        // Apply Prize
        let pointsToAdd = 0
        let badgeIdToAdd: string | undefined

        if (selectedPrize.type === 'POINTS') {
            pointsToAdd = selectedPrize.value as number
        } else if (selectedPrize.type === 'BADGE') {
            // Find or create badge
            const badgeName = "Lucky Spinner"
            let badge = await db.badge.findFirst({ where: { name: badgeName } })
            if (!badge) {
                badge = await db.badge.create({
                    data: {
                        name: badgeName,
                        description: "Won from the Daily Spin!",
                        icon: "🎰"
                    }
                })
            }

            // Check if user already has it
            const hasBadge = user.badges.some(ub => ub.badgeId === badge.id)
            if (!hasBadge) {
                badgeIdToAdd = badge.id
            } else {
                // Fallback points if duplicate badge
                pointsToAdd = 50
                selectedPrize = { ...selectedPrize, label: "50 PTS (Duplicate Badge)" }
            }
        }

        // Update User
        await db.user.update({
            where: { walletAddress },
            data: {
                points: { increment: pointsToAdd },
                lastSpin: now,
                badges: badgeIdToAdd ? {
                    create: { badgeId: badgeIdToAdd }
                } : undefined
            }
        })

        return {
            success: true,
            prize: selectedPrize,
            prizeIndex: PRIZES.indexOf(selectedPrize) // For UI rotation
        }

    } catch (error) {
        console.error("Spin error:", error)
        return { success: false, message: "Spin failed" }
    }
}

export async function getSpinStatus(walletAddress: string) {
    const user = await db.user.findUnique({
        where: { walletAddress },
        select: { lastSpin: true }
    })

    if (!user) return { canSpin: false }

    const now = new Date()
    if (user.lastSpin) {
        const lastSpinDate = new Date(user.lastSpin)
        if (
            lastSpinDate.getUTCFullYear() === now.getUTCFullYear() &&
            lastSpinDate.getUTCMonth() === now.getUTCMonth() &&
            lastSpinDate.getUTCDate() === now.getUTCDate()
        ) {
            return { canSpin: false, lastSpin: user.lastSpin }
        }
    }
    return { canSpin: true }
}
