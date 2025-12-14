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

// Helper to generate slug
function generateSlug(title: string) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

export async function fetchImpactStoryBySlug(slug: string) {
    try {
        return await db.impactStory.findUnique({
            where: { slug }
        })
    } catch (error) {
        console.error("Error fetching impact story:", error)
        return null
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

        // Generate unique slug
        let baseSlug = generateSlug(title);
        let slug = baseSlug;
        let counter = 1;

        while (await db.impactStory.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // New extended fields
        const location = formData.get('location') as string | null
        const dateStr = formData.get('date') as string | null
        const date = dateStr ? new Date(dateStr) : null
        const raised = formData.get('raised') ? parseFloat(formData.get('raised') as string) : 0
        const goal = formData.get('goal') ? parseFloat(formData.get('goal') as string) : null
        const supporters = formData.get('supporters') ? parseInt(formData.get('supporters') as string) : 0
        const status = formData.get('status') as string || 'active'

        await db.impactStory.create({
            data: {
                slug,
                title,
                description,
                imageUrl,
                location,
                date,
                raised,
                goal,
                supporters,
                status
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

export async function updateImpactStory(formData: FormData) {
    try {
        const adminId = formData.get('adminId') as string
        const storyId = formData.get('storyId') as string
        if (!adminId) return { success: false, message: "Unauthorized" }

        const admin = await db.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            return { success: false, message: "Unauthorized: Admin access required" }
        }

        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const imageUrl = formData.get('imageUrl') as string || null

        // We don't update slug to preserve SEO

        // New extended fields
        const location = formData.get('location') as string | null
        const dateStr = formData.get('date') as string | null
        const date = dateStr ? new Date(dateStr) : null
        const raised = formData.get('raised') ? parseFloat(formData.get('raised') as string) : undefined
        const goal = formData.get('goal') ? parseFloat(formData.get('goal') as string) : undefined
        const supporters = formData.get('supporters') ? parseInt(formData.get('supporters') as string) : undefined
        const status = formData.get('status') as string || undefined

        await db.impactStory.update({
            where: { id: storyId },
            data: {
                title,
                description,
                imageUrl,
                location,
                date,
                raised,
                goal,
                supporters,
                status
            }
        })

        const { logActivity } = await import('./activity')
        await logActivity(admin.id, "ADMIN_IMPACT_UPDATE", `Updated impact story: ${title}`)

        revalidatePath('/impact')
        revalidatePath('/admin/impact')
        // Also revalidate the specific story page if we could, but we don't know the slug here easily without fetching.
        // Broad revalidation is fine.
        return { success: true }
    } catch (error) {
        console.error("Update impact error:", error)
        return { success: false, message: "Failed to update impact story" }
    }
}

export async function deleteImpactStory(storyId: string, adminId: string) {
    try {
        const admin = await db.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            return { success: false, message: "Unauthorized: Admin access required" }
        }

        const story = await db.impactStory.findUnique({ where: { id: storyId } })
        if (!story) return { success: false, message: "Story not found" }

        await db.impactStory.delete({ where: { id: storyId } })

        const { logActivity } = await import('./activity')
        await logActivity(admin.id, "ADMIN_IMPACT_DELETE", `Deleted impact story: ${story.title}`)

        revalidatePath('/impact')
        revalidatePath('/admin/impact')
        return { success: true }
    } catch (error) {
        console.error("Delete impact error:", error)
        return { success: false, message: "Failed to delete impact story" }
    }
}

export async function deleteImpactStoryAction(formData: FormData) {
    const storyId = formData.get('storyId') as string;
    const adminId = formData.get('adminId') as string;
    return await deleteImpactStory(storyId, adminId);
}

export async function donateToImpact(storyId: string, amount: number) {
    try {
        await db.impactStory.update({
            where: { id: storyId },
            data: {
                raised: { increment: amount },
                supporters: { increment: 1 }
            }
        });

        revalidatePath('/impact');
        return { success: true };
    } catch (error) {
        console.error("Donation processing error:", error);
        return { success: false, message: "Failed to process donation" };
    }
}
