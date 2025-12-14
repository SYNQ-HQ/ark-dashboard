"use client";

import { createBadge } from "@/actions/badges";
import { getUploadSignature } from "@/actions/upload";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { useRef, useState } from "react";

export default function CreateBadgeForm() {
    const { user } = useUser();
    const formRef = useRef<HTMLFormElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [inputType, setInputType] = useState<'EMOJI' | 'IMAGE'>('EMOJI');

    async function handleSubmit(formData: FormData) {
        if (!user) {
            toast.error("User not loaded");
            return;
        }

        let iconValue = formData.get('emoji_icon') as string;

        if (inputType === 'IMAGE') {
            if (!file) {
                toast.error("Please select an image");
                return;
            }

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
        }

        formData.append("adminId", user.id);
        formData.append("icon", iconValue);

        const res = await createBadge(formData);

        if (res.success) {
            toast.success("Badge created!");
            formRef.current?.reset();
            setFile(null);
            setInputType('EMOJI');
        } else {
            toast.error(res.message || "Failed to create badge");
        }
    }

    if (!user) return null;

    return (
        <form ref={formRef} action={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Badge Name</label>
                <input
                    name="name"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    placeholder="e.g. Early Bird"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                    name="description"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                    placeholder="Awarded for..."
                    rows={2}
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
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        placeholder="Paste an emoji here (e.g. 🦅)"
                    />
                ) : (
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                        {file && (
                            <p className="text-xs text-muted-foreground mt-1">Selected: {file.name}</p>
                        )}
                    </div>
                )}
            </div>

            <button
                disabled={uploading}
                type="submit"
                className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:brightness-110 transition-all mt-4 disabled:opacity-50"
            >
                {uploading ? 'Uploading...' : 'Create Badge'}
            </button>
        </form>
    );
}
