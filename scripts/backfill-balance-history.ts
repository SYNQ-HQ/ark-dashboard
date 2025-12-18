import { db } from '../src/lib/db'
import { getActBalance, getActPrice } from '../src/actions/token'

async function backfillBalanceHistory() {
    console.log('🚀 Starting balance history backfill...\n')

    try {
        // Find all users who are eligible or have a holding start date
        const users = await db.user.findMany({
            where: {
                OR: [
                    { isEligible: true },
                    { holdingStartedAt: { not: null } }
                ]
            },
            select: {
                id: true,
                walletAddress: true,
                isEligible: true,
                holdingStartedAt: true,
                username: true
            }
        })

        console.log(`📊 Found ${users.length} users to backfill\n`)

        if (users.length === 0) {
            console.log('✅ No users need backfilling')
            return
        }

        // Get current price once
        const currentPrice = await getActPrice()
        console.log(`💰 Current ACT price: $${currentPrice.toFixed(6)}\n`)

        let successCount = 0
        let errorCount = 0
        let snapshotsCreated = 0

        for (const user of users) {
            try {
                console.log(`📍 Processing: ${user.username} (${user.walletAddress.slice(0, 8)}...)`)

                // Fetch current balance
                const balance = await getActBalance(user.walletAddress)
                console.log(`   Balance: ${balance.toLocaleString()} ACT`)

                // Create initial snapshot
                await db.balanceSnapshot.create({
                    data: {
                        userId: user.id,
                        balance,
                        balanceUsd: balance * currentPrice,
                        source: 'BACKFILL'
                    }
                })
                snapshotsCreated++

                // Update user if needed
                const updates: any = {
                    lastBalanceCheck: new Date()
                }

                // If they have balance but no streak start, set it now
                if (balance > 0 && !user.holdingStartedAt) {
                    updates.holdingStartedAt = new Date()
                    updates.isEligible = true
                    console.log(`   ✨ Set holding start date`)
                }

                // If balance is 0 but they're marked eligible, fix it
                if (balance === 0 && user.isEligible) {
                    updates.isEligible = false
                    updates.holdingStartedAt = null
                    console.log(`   🔄 Reset eligibility (zero balance)`)
                }

                await db.user.update({
                    where: { id: user.id },
                    data: updates
                })

                successCount++
                console.log(`   ✅ Complete\n`)

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100))

            } catch (error) {
                errorCount++
                console.error(`   ❌ Error:`, error)
                console.log('')
            }
        }

        console.log('\n' + '='.repeat(50))
        console.log('📊 BACKFILL SUMMARY')
        console.log('='.repeat(50))
        console.log(`Total users processed: ${users.length}`)
        console.log(`✅ Successful: ${successCount}`)
        console.log(`❌ Errors: ${errorCount}`)
        console.log(`📸 Snapshots created: ${snapshotsCreated}`)
        console.log('='.repeat(50))

    } catch (error) {
        console.error('❌ Backfill failed:', error)
        process.exit(1)
    } finally {
        await db.$disconnect()
    }
}

// Run the backfill
backfillBalanceHistory()
    .then(() => {
        console.log('\n✅ Backfill complete!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n❌ Backfill failed:', error)
        process.exit(1)
    })
