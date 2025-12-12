import { getUploadSignature } from './src/actions/upload';
import { db } from './src/lib/db';

async function main() {
    console.log("Starting Cloudinary Upload Verification...");

    // 1. Setup Admin
    const adminWallet = "0xAdminUpload_" + Date.now();
    const admin = await db.user.create({
        data: {
            walletAddress: adminWallet,
            username: "UploadAdmin_" + Date.now(),
            role: 'ADMIN'
        }
    });

    // 2. Test getUploadSignature
    console.log("Testing getUploadSignature...");
    try {
        const res = await getUploadSignature(admin.id);
        if (res.success) {
            console.log("Upload Signature generated successfully.");
            console.log("Cloud Name:", res.cloudName || "Missing (Expected if no Env)");
            console.log("API Key present:", !!res.apiKey);
        } else {
            console.log("Signature generation failed:", res.message);
        }
    } catch (e) {
        console.error("Error calling getUploadSignature:", e);
    }

    // 3. Cleanup
    await db.user.delete({ where: { id: admin.id } });
    console.log("Cleanup complete.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await db.$disconnect();
    });
