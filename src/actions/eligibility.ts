'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function verifyEligibility(walletAddress: string) {
    try {
        await new Promise(resolve => setTimeout(resolve, 1500)) // Simulation delay

        // In a real app, check on-chain or off-chain criteria here.
        // For now, always approve.

        await db.user.update({
            where: { walletAddress },
            data: { isEligible: true }
        })

        revalidatePath('/eligibility')
        revalidatePath('/') // Dashboard also shows eligibility status

        return { success: true }
    } catch (error) {
        console.error("Eligibility verification failed:", error)
        return { success: false, message: "Verification check failed." }
    }
}
