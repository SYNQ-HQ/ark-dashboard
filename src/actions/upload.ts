"use server"

import { cloudinary } from "@/lib/storage"
import { db } from "@/lib/db"

export async function getUploadSignature(userId: string, requireAdmin = true) {
    try {
        // Authenticate
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) {
            return { success: false, message: "Unauthorized" }
        }

        // Check admin requirement
        if (requireAdmin && user.role !== 'ADMIN') {
            return { success: false, message: "Unauthorized" }
        }

        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            folder: 'ark_dashboard',
        }, process.env.CLOUDINARY_API_SECRET as string);

        return {
            success: true,
            timestamp,
            signature,
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        }
    } catch (error) {
        console.error("Upload setup error:", error)
        return { success: false, message: "Failed to set up upload" }
    }
}
