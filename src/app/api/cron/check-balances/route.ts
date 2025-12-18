import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getActBalance, getActPrice } from '@/actions/token'

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret for security
        const authHeader = request.headers.get('authorization')
        const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

        if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get all users who are currently eligible (holding ACT)
        const users = await db.user.findMany({
            where: { isEligible: true },
            select: { id: true, walletAddress: true, holdingStartedAt: true }
        })

        console.log(`[CRON] Checking balances for ${users.length} users`)

        let checkedCount = 0
        let streaksReset = 0

        // Get current price once (reuse for all users)
        const currentPrice = await getActPrice()

        for (const user of users) {
            try {
                // Fetch balance for this user
                const balance = await getActBalance(user.walletAddress)

                // Save snapshot
                await db.balanceSnapshot.create({
                    data: {
                        userId: user.id,
                        balance,
                        balanceUsd: balance * currentPrice,
                        source: 'CRON'
                    }
                })

                // If balance dropped to zero, reset streak
                if (balance === 0 && user.holdingStartedAt) {
                    await db.user.update({
                        where: { id: user.id },
                        data: {
                            holdingStartedAt: null,
                            isEligible: false,
                            lastBalanceCheck: new Date()
                        }
                    })
                    streaksReset++
                    console.log(`[CRON] Reset streak for user ${user.id} (balance = 0)`)
                } else {
                    // Just update last check time
                    await db.user.update({
                        where: { id: user.id },
                        data: { lastBalanceCheck: new Date() }
                    })
                }

                checkedCount++
            } catch (error) {
                console.error(`[CRON] Error checking user ${user.id}:`, error)
                // Continue with next user
            }
        }

        // Cleanup old snapshots (keep last 90 days)
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        const deleted = await db.balanceSnapshot.deleteMany({
            where: {
                checkedAt: {
                    lt: ninetyDaysAgo
                }
            }
        })

        console.log(`[CRON] Deleted ${deleted.count} old snapshots`)

        return NextResponse.json({
            success: true,
            checked: checkedCount,
            streaksReset,
            snapshotsDeleted: deleted.count,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('[CRON] Balance check failed:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
