import { BalanceSnapshot } from '@prisma/client'

/**
 * Calculate the actual streak start date by analyzing balance history
 * @param history - Array of balance snapshots ordered by checkedAt DESC (newest first)
 * @param currentBalance - Current balance from latest check
 * @returns Date when streak actually started, or null if no balance
 */
export function calculateStreakStart(
    history: BalanceSnapshot[],
    currentBalance: number
): Date | null {
    // No balance = no streak
    if (currentBalance === 0) return null

    // No history = streak starts now
    if (history.length === 0) return new Date()

    // Walk backwards through history to find continuous holding period
    let streakStart = new Date() // Default: now
    let foundZeroGap = false

    for (let i = 0; i < history.length; i++) {
        const snapshot = history[i]

        if (snapshot.balance === 0) {
            // Found a zero balance in history - streak starts AFTER this
            if (i > 0) {
                streakStart = new Date(history[i - 1].checkedAt)
            }
            foundZeroGap = true
            break
        }
    }

    // If no zero found in history, streak started at oldest non-zero snapshot
    if (!foundZeroGap && history.length > 0) {
        const oldestSnapshot = history[history.length - 1]
        if (oldestSnapshot.balance > 0) {
            streakStart = new Date(oldestSnapshot.checkedAt)
        }
    }

    return streakStart
}

/**
 * Calculate days held from streak start date
 * @param holdingStartedAt - When the user started holding
 * @returns Number of days held (0 if null)
 */
export function calculateDaysHeld(holdingStartedAt: Date | null): number {
    if (!holdingStartedAt) return 0

    const diffTime = Math.abs(Date.now() - new Date(holdingStartedAt).getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
}

/**
 * Check if user meets the holding requirement
 * @param daysHeld - Number of days user has held
 * @param requiredDays - Minimum days required (default: 25)
 * @returns Boolean indicating if requirement is met
 */
export function meetsHoldingRequirement(
    daysHeld: number,
    requiredDays: number = 25
): boolean {
    return daysHeld >= requiredDays
}
