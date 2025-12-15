'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { logActivity } from './activity'

export async function acceptOath(userId: string, durationSeconds: number) {
    try {
        await db.user.update({
            where: { id: userId },
            data: {
                oathAcceptedAt: new Date(),
                oathDurationSeconds: durationSeconds
            }
        })

        await logActivity(userId, "OATH_ACCEPTED", "Accepted The Ark Oath")

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error("Error accepting oath:", error)
        return { success: false, message: "Failed to accept oath" }
    }
}
