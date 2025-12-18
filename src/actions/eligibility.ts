'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getActBalance, getActPrice } from './token'

export async function verifyEligibility(walletAddress: string) {
    try {
        // Fetch current balance and price
        const [currentBalance, currentPrice] = await Promise.all([
            getActBalance(walletAddress),
            getActPrice()
        ])

        // Get user with balance history
        const user = await db.user.findUnique({
            where: { walletAddress },
            include: {
                balanceHistory: {
                    orderBy: { checkedAt: 'desc' },
                    take: 100 // Last 100 snapshots
                }
            }
        })

        if (!user) return { success: false, message: "User not found" }

        // 1. Save current snapshot
        await db.balanceSnapshot.create({
            data: {
                userId: user.id,
                balance: currentBalance,
                balanceUsd: currentBalance * currentPrice,
                source: 'MANUAL'
            }
        })

        // 2. Determine streak start date and eligibility
        const MIN_USD_VALUE = 250; // $250 minimum requirement
        const currentValueUsd = currentBalance * currentPrice;
        const meetsMinimum = currentValueUsd >= MIN_USD_VALUE;

        let streakStart: Date | null = null;

        if (currentBalance > 0 && meetsMinimum) {
            if (!user.holdingStartedAt) {
                // First time we see them with $250+ - START tracking from NOW
                streakStart = new Date()
            } else {
                // They were already holding - keep original start date
                streakStart = user.holdingStartedAt
            }
        } else {
            // Balance is zero OR below $250 - reset streak
            streakStart = null
        }

        // 3. Update user
        const data: any = {
            isEligible: meetsMinimum && currentBalance > 0,
            holdingStartedAt: streakStart,
            lastBalanceCheck: new Date()
        }

        await db.user.update({
            where: { walletAddress },
            data
        })

        revalidatePath('/eligibility')
        revalidatePath('/')
        revalidatePath('/profile')

        return {
            success: true,
            balance: currentBalance,
            balanceUsd: currentValueUsd,
            meetsMinimum,
            streakStart,
            daysHeld: streakStart ? Math.floor((Date.now() - new Date(streakStart).getTime()) / (1000 * 60 * 60 * 24)) : 0
        }
    } catch (error) {
        console.error("Eligibility verification failed:", error)
        return { success: false, message: "Verification check failed." }
    }
}
