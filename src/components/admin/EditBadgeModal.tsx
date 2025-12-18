"use client";

import { updateBadge } from "@/actions/badges";
import { getUploadSignature } from "@/actions/upload";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import NextImage from "next/image";

interface Badge {
    id: string;
    name: string;
    description: string | null;
    icon: string;
    displayOrder: number;
}

interface EditBadgeModalProps {
    badge: Badge;
    onClose: () => void;
}

export default function EditBadgeModal({ badge, onClose }: EditBadgeModalProps) {
    const { user } = useUser();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // Determine initial type based on if icon looks like a URL
    const isUrl = (str: string) => str.startsWith('http');
    const [inputType, setInputType] = useState<'EMOJI' | 'IMAGE'>(isUrl(badge.icon) ? 'IMAGE' : 'EMOJI');

    async function handleSubmit(formData: FormData) {
        if (!user) {
            toast.error("User not loaded");
            return;
        }

        let iconValue = formData.get('emoji_icon') as string;

        if (inputType === 'IMAGE') {
            if (file) {
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
                data.append("folder", "ark_dashboard/badges");

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
                    iconValue = json.secure_url;
                } catch (e) {
                    console.error(e);
                    setUploading(false);
                    toast.error("Image upload failed");
                    return;
                }
                setUploading(false);
            } else if (isUrl(badge.icon)) {
                // Keep existing image if no new file selected and it was already an image
                iconValue = badge.icon;
            } else {
                toast.error("Please select an image");
                return;
            }
        }

        formData.append("adminId", user.id);
        formData.append("badgeId", badge.id);
        formData.append("icon", iconValue);

        const res = await updateBadge(formData);

        if (res.success) {
            toast.success("Badge updated!");
            onClose();
        } else {
            toast.error(res.message || "Failed to update badge");
        }
    }

    return (
        <Modal isOpen={true} onClose={onClose} className="max-w-md w-full p-6">
            <h3 className="font-bold text-lg mb-6">Edit Badge</h3>
            <form action={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                        name="name"
                        required
                        defaultValue={badge.name}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        name="description"
                        required
                        defaultValue={badge.description || ''}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        rows={2}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Display Order</label>
                    <input
                        type="number"
                        name="displayOrder"
                        required
                        defaultValue={badge.displayOrder}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Icon Type</label>
                    <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="radio"
                                name="type_selector"
                                checked={inputType === 'EMOJI'}
                                onChange={() => setInputType('EMOJI')}
                            />
                            Emoji
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="radio"
                                name="type_selector"
                                checked={inputType === 'IMAGE'}
                                onChange={() => setInputType('IMAGE')}
                            />
                            Image Upload
                        </label>
                    </div>

                    {inputType === 'EMOJI' ? (
                        <input
                            name="emoji_icon"
                            defaultValue={!isUrl(badge.icon) ? badge.icon : ''}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                            placeholder="Paste an emoji here (e.g. 🦅)"
                        />
                    ) : (
                        <div>
                            {isUrl(badge.icon) && (
                                <div className="mb-2 relative h-16 w-16">
                                    <NextImage
                                        src={badge.icon}
                                        alt="Current"
                                        fill
                                        className="object-cover rounded"
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                        </div>
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
