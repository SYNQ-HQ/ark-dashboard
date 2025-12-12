'use server'

import { db } from '@/lib/db'

import { revalidatePath } from 'next/cache'

export async function fetchImpactStories() {
    try {
        return await db.impactStory.findMany({
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        console.error("Error fetching impact stories:", error)
        return []
    }
}

export async function createImpactStory(formData: FormData) {
    try {
        const adminId = formData.get('adminId') as string
        if (!adminId) return { success: false, message: "Unauthorized" }

        const admin = await db.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            return { success: false, message: "Unauthorized: Admin access required" }
        }

        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const imageUrl = formData.get('imageUrl') as string || null

        await db.impactStory.create({
            data: {
                title,
                description,
                imageUrl
            }
        })

        const { logActivity } = await import('./activity')
        await logActivity(admin.id, "ADMIN_IMPACT_CREATE", `Created impact story: ${title}`)

        revalidatePath('/impact')
        revalidatePath('/admin/impact')
        return { success: true }
    } catch (error) {
        console.error("Create impact error:", error)
        return { success: false, message: "Failed to create impact story" }
    }
}
