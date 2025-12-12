'use server'

import { db } from '@/lib/db'

export async function fetchLeaderboard() {
    return await db.user.findMany({
        orderBy: { points: 'desc' },
        take: 10,
        select: {
            id: true,
            username: true,
            points: true,
            walletAddress: true,
            badges: {
                include: { badge: true }
            }
        }
    })
}
