"use client";

import { createImpactStory } from "@/actions/impact";
import { getUploadSignature } from "@/actions/upload";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { useRef, useState } from "react";

export default function CreateImpactForm() {
    const { user } = useUser();
    const formRef = useRef<HTMLFormElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    async function handleSubmit(formData: FormData) {
        if (!user) return toast.error("User not loaded");

        let imageUrl = "";

        if (file) {
            setUploading(true);
            const signatureRes = await getUploadSignature(user.id);
            if (!signatureRes.success || !signatureRes.signature) {
                setUploading(false);
                return toast.error("Failed to get upload signature");
            }

            // Upload to Cloudinary
            const data = new FormData();
            data.append("file", file);
            data.append("api_key", signatureRes.apiKey as string);
            data.append("timestamp", signatureRes.timestamp?.toString() as string);
            data.append("signature", signatureRes.signature);
            data.append("folder", "ark_dashboard");

            try {
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${signatureRes.cloudName}/image/upload`,
                    {
                        method: "POST",
                        body: data,
                    }
                );

                if (!response.ok) throw new Error("Upload failed");
                const json = await response.json();
                imageUrl = json.secure_url;
            } catch (e) {
                console.error(e);
                setUploading(false);
                return toast.error("Image upload failed");
            }
            setUploading(false);
        }

        formData.append("adminId", user.id);
        if (imageUrl) formData.append("imageUrl", imageUrl);

        const res = await createImpactStory(formData);

        if (res.success) {
            toast.success("Impact story created!");
            formRef.current?.reset();
            setFile(null);
        }
    }

    if (!user) return null;

    return (
        <form ref={formRef} action={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input name="title" required className="w-full px-3 py-2 rounded-lg border border-border bg-background" placeholder="e.g. Well Built in Village X" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" required className="w-full px-3 py-2 rounded-lg border border-border bg-background" placeholder="Details..." rows={3} />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Image (Optional)</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
            </div>

            <button disabled={uploading} type="submit" className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:brightness-110 transition-all mt-4 disabled:opacity-50">
                {uploading ? 'Uploading...' : 'Publish Story'}
            </button>
        </form>
    );
}
