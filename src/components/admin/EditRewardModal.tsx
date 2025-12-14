"use client";

import { updateReward } from "@/actions/rewards";
import { getUploadSignature } from "@/actions/upload";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { useState } from "react";

interface Reward {
    id: string;
    name: string;
    description: string;
    cost: number;
    stock: number | null;
    imageUrl?: string | null;
    _count?: {
        redemptions: number;
    };
}

interface EditRewardModalProps {
    reward: Reward;
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditRewardModal({ reward, onClose, onUpdate }: EditRewardModalProps) {
    const { user } = useUser();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [keepExistingImage, setKeepExistingImage] = useState(true);

    async function handleSubmit(formData: FormData) {
        if (!user) {
            toast.error("User not loaded");
            return;
        }

        let imageUrl = reward.imageUrl || "";

        // If user selected a new file, upload it
        if (file && !keepExistingImage) {
            setUploading(true);
            const signatureRes = await getUploadSignature(user.id);
            if (!signatureRes.success || !signatureRes.signature) {
                setUploading(false);
                toast.error("Failed to get upload signature");
                return;
            }

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
                toast.error("Image upload failed");
                return;
            }
            setUploading(false);
        }

        formData.append("adminId", user.id);
        formData.append("rewardId", reward.id);
        if (imageUrl) formData.append("imageUrl", imageUrl);

        const res = await updateReward(formData);

        if (res.success) {
            toast.success("Reward updated!");
            onUpdate();
            onClose();
        } else {
            toast.error(res.message || "Failed to update reward");
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-bold text-lg mb-6">Edit Reward</h3>
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            name="name"
                            required
                            defaultValue={reward.name}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            name="description"
                            required
                            defaultValue={reward.description}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Cost (PTS)</label>
                            <input
                                type="number"
                                name="cost"
                                required
                                defaultValue={reward.cost}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Stock</label>
                            <input
                                type="number"
                                name="stock"
                                placeholder="Empty = Infinite"
                                defaultValue={reward.stock ?? ''}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Image</label>
                        {reward.imageUrl && (
                            <div className="mb-2">
                                <img src={reward.imageUrl} alt="Current" className="w-full h-32 object-cover rounded-lg" />
                                <label className="flex items-center gap-2 mt-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={keepExistingImage}
                                        onChange={(e) => setKeepExistingImage(e.target.checked)}
                                    />
                                    Keep existing image
                                </label>
                            </div>
                        )}
                        {!keepExistingImage && (
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                        )}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={uploading}
                            type="submit"
                            className="flex-1 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
