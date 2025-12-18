"use client";

import { updateMission } from "@/actions/missions";
import { getUploadSignature } from "@/actions/upload";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import NextImage from "next/image";

interface Mission {
    id: string;
    title: string;
    description: string;
    type: string;
    points: number;
    frequency: string;
    imageUrl?: string | null;
    location?: string | null;
    date?: Date | null;
    raised?: number | null;
    goal?: number | null;
    supporters?: number | null;
    status?: string | null;
}

interface EditMissionModalProps {
    mission: Mission;
    onClose: () => void;
}

export default function EditMissionModal({ mission, onClose }: EditMissionModalProps) {
    const { user } = useUser();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [keepExistingImage, setKeepExistingImage] = useState(true);

    async function handleSubmit(formData: FormData) {
        if (!user) {
            toast.error("User not loaded");
            return;
        }

        let imageUrl = mission.imageUrl || "";

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
        formData.append("missionId", mission.id);
        if (imageUrl) formData.append("imageUrl", imageUrl);

        const res = await updateMission(formData);

        if (res.success) {
            toast.success("Mission updated!");
            onClose();
        } else {
            toast.error(res.message || "Failed to update mission");
        }
    }

    return (
        <Modal isOpen={true} onClose={onClose} className="max-w-md w-full p-6">
            <h3 className="font-bold text-lg mb-6">Edit Mission</h3>
            <form action={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                        name="title"
                        required
                        defaultValue={mission.title}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        name="description"
                        required
                        defaultValue={mission.description}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Points</label>
                        <input
                            name="points"
                            type="number"
                            required
                            defaultValue={mission.points}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Frequency</label>
                        <select name="frequency" defaultValue={mission.frequency} className="w-full px-3 py-2 rounded-lg border border-border bg-background">
                            <option value="DAILY">Daily</option>
                            <option value="ONETIME">One-Time</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select name="type" defaultValue={mission.type} className="w-full px-3 py-2 rounded-lg border border-border bg-background">
                        <option value="SOCIAL">Social</option>
                        <option value="ONCHAIN">On-Chain</option>
                        <option value="REFERRAL">Referral</option>
                    </select>
                </div>

                {/* Campaign Details Section removed */}

                <div>
                    <label className="block text-sm font-medium mb-1">Image</label>
                    {mission.imageUrl && (
                        <div className="mb-2 relative w-20 h-20">
                            <NextImage
                                src={mission.imageUrl}
                                alt="Current"
                                fill
                                className="object-cover rounded-lg"
                            />
                        </div>
                    )}
                    {mission.imageUrl && (
                        <label className="flex items-center gap-2 mt-2 text-sm">
                            <input
                                type="checkbox"
                                checked={keepExistingImage}
                                onChange={(e) => setKeepExistingImage(e.target.checked)}
                            />
                            Keep existing image
                        </label>
                    )}
                    {!keepExistingImage && (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full mt-2 text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
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
        </Modal>
    );
}
