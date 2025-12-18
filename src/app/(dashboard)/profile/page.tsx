"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { updateUsername, checkUsernameAvailability, updateProfileImage } from "@/actions/user";
import { getUploadSignature } from "@/actions/upload";
import { toast } from "sonner";
import Skeleton from "@/components/ui/Skeleton";
import { CopyIcon } from "@/components/Icons";
import NextImage from "next/image";
import Link from "next/link";
import { getActPortfolio } from "@/actions/token";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
    const { user, refetchUser } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [saving, setSaving] = useState(false);

    // Availability state
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [availabilityMsg, setAvailabilityMsg] = useState("");

    // Profile image state
    const [uploadingImage, setUploadingImage] = useState(false);

    // ACT Token State
    const [actData, setActData] = useState<{ balance: number, value: number, price: number } | null>(null);

    useEffect(() => {
        if (user?.walletAddress) {
            getActPortfolio(user.walletAddress).then(setActData);
        }
    }, [user?.walletAddress]);



    // Simple debounce for availability check
    useEffect(() => {
        if (!isEditing || newUsername === user?.username) {
            setIsAvailable(null);
            setAvailabilityMsg("");
            return;
        }

        const timer = setTimeout(async () => {
            if (newUsername.length < 3) return;
            setIsChecking(true);
            const res = await checkUsernameAvailability(newUsername);
            setIsChecking(false);
            setIsAvailable(res.available);
            setAvailabilityMsg(res.message || (res.available ? "Username available" : "Unavailable"));
        }, 500);

        return () => clearTimeout(timer);
    }, [newUsername, isEditing, user?.username]);

    async function handleSave() {
        if (!user) return;
        if (newUsername === user.username) {
            setIsEditing(false);
            return;
        }

        if (isAvailable === false) return;

        setSaving(true);
        const res = await updateUsername(user.walletAddress, newUsername);
        setSaving(false);

        if (res.success) {
            toast.success("Profile updated!");
            await refetchUser();
            setIsEditing(false);
        } else {
            toast.error(res.message || "Failed to update profile");
        }
    }

    function copyAddress() {
        if (user?.walletAddress) {
            navigator.clipboard.writeText(user.walletAddress);
            toast.success("Address copied to clipboard");
        }
    }

    async function handleImageUpload(file: File) {
        if (!user) return;

        setUploadingImage(true);
        try {
            // Get upload signature (requireAdmin = false for profile images)
            const signatureRes = await getUploadSignature(user.id, false);
            if (!signatureRes.success || !signatureRes.signature) {
                toast.error("Failed to get upload signature");
                setUploadingImage(false);
                return;
            }

            // Upload to Cloudinary
            const data = new FormData();
            data.append("file", file);
            data.append("api_key", signatureRes.apiKey as string);
            data.append("timestamp", signatureRes.timestamp?.toString() as string);
            data.append("signature", signatureRes.signature);
            data.append("folder", "ark_dashboard");

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${signatureRes.cloudName}/image/upload`,
                {
                    method: "POST",
                    body: data,
                }
            );

            if (!response.ok) throw new Error("Upload failed");
            const json = await response.json();
            const imageUrl = json.secure_url;

            // Update profile image
            const res = await updateProfileImage(user.walletAddress, imageUrl);
            if (res.success) {
                toast.success("Profile image updated!");
                await refetchUser();
            } else {
                toast.error(res.message || "Failed to update profile image");
            }
        } catch (error) {
            console.error(error);
            toast.error("Image upload failed");
        } finally {
            setUploadingImage(false);
        }
    }

    if (!user) {
        return (
            <div className="bg-card text-card-foreground border border-card-border rounded-lg p-ark-lg shadow-premium-lg">
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="w-24 h-24 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-card text-card-foreground border border-card-border rounded-lg p-ark-lg shadow-premium-lg relative overflow-hidden">
                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="relative group">
                        {user.profileImageUrl ? (
                            <div className="relative w-24 h-24">
                                <NextImage
                                    src={user.profileImageUrl}
                                    alt={user.username || 'Profile'}
                                    fill
                                    className="rounded-full object-cover shadow-lg border-2 border-primary/20"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center text-4xl shadow-inner border border-primary/10">
                                {user.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <label
                            htmlFor="profile-image-upload"
                            className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform"
                            title="Change photo"
                        >
                            {uploadingImage ? (
                                <span className="material-icons text-sm animate-spin">sync</span>
                            ) : (
                                <span className="material-icons text-sm">camera_alt</span>
                            )}
                        </label>
                        <input
                            id="profile-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingImage}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    handleImageUpload(file);
                                }
                            }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 mb-4">Click camera icon to change photo</p>

                    {isEditing ? (
                        <div className="flex flex-col gap-2 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
                            <label className="text-left text-sm font-medium text-muted-foreground">Nickname</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className={`w-full bg-background border rounded-lg px-4 py-3 pl-4 pr-10 text-foreground focus:outline-none focus:ring-2 transition-all ${isAvailable === true ? "border-green-500/50 focus:ring-green-500/20" :
                                        isAvailable === false ? "border-red-500/50 focus:ring-red-500/20" :
                                            "border-border focus:ring-primary/50"
                                        }`}
                                    placeholder="Enter nickname"
                                    disabled={saving}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {isChecking ? (
                                        <span className="material-icons text-muted-foreground animate-spin text-sm">sync</span>
                                    ) : isAvailable === true ? (
                                        <span className="material-icons text-green-500 text-sm">check_circle</span>
                                    ) : isAvailable === false ? (
                                        <span className="material-icons text-red-500 text-sm">error</span>
                                    ) : null}
                                </div>
                            </div>

                            {/* Feedback Text */}
                            <div className="min-h-[20px] text-xs text-left">
                                {availabilityMsg && (
                                    <span className={isAvailable === true ? "text-green-500" : isAvailable === false ? "text-red-500" : "text-muted-foreground"}>
                                        {availabilityMsg}
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-3 mt-2 justify-center">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setNewUsername(user?.username ?? '');
                                        setAvailabilityMsg("");
                                        setIsAvailable(null);
                                    }}
                                    className="px-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50 rounded-lg"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className={`bg-primary text-primary-foreground px-8 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 ${isAvailable === false ? "opacity-50 cursor-not-allowed" : ""}`}
                                    disabled={saving || isAvailable === false}
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Note: You can only change your username once every 7 days.
                            </p>
                        </div>
                    ) : (
                        <div className="group relative flex flex-col items-center gap-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-bold text-foreground tracking-tight">
                                    {user.username}
                                </h2>
                                <button
                                    onClick={() => {
                                        setNewUsername(user?.username || "");
                                        setIsEditing(true);
                                    }}
                                    className="w-8 h-8 rounded-full bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all flex items-center justify-center "
                                    title="Edit Username"
                                >
                                    <span className="material-icons text-sm">edit</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                                    {user.role}
                                </span>
                                {user.isEligible && (
                                    <span className="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                                        Verified Holder
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Admin Access based on Role */}
                    {user.role === 'ADMIN' && (
                        <Link
                            href="/admin"
                            className="w-full bg-card hover-elevate border border-border p-4 rounded-xl flex items-center justify-between transition-premium group mb-4 shadow-sm hover:border-primary/20 mt-5"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <span className="material-icons text-primary">admin_panel_settings</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-foreground">Admin Dashboard</p>
                                    <p className="text-xs text-muted-foreground">Manage content & users</p>
                                </div>
                            </div>
                            <span className="material-icons text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300">arrow_forward</span>
                        </Link>
                    )}

                    <button
                        onClick={copyAddress}
                        className="flex items-center gap-2 text-sm text-muted-foreground mt-6 hover:text-primary transition-colors bg-muted/30 hover:bg-muted/50 px-4 py-2 rounded-full border border-transparent hover:border-border"
                    >
                        <span className="font-mono">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</span>
                        <CopyIcon className="w-3 h-3" />
                    </button>

                    {user.lastUsernameChange && !isEditing && (
                        <p className="text-[10px] text-muted-foreground mt-2 opacity-50">
                            Last name change: {new Date(user.lastUsernameChange).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-card-border p-6 rounded-lg shadow-sm text-center hover:border-primary/20 transition-colors">
                    <div className="text-3xl font-black text-primary mb-1">{user.points.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total Points</div>
                </div>
                <div className="bg-card border border-card-border p-6 rounded-lg shadow-sm text-center hover:border-green-500/20 transition-colors">
                    <div className="text-3xl font-black text-green-500 mb-1">{user.streak?.currentStreak || 0}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Day Streak</div>
                </div>
                <div className="bg-card border border-card-border p-6 rounded-lg shadow-sm text-center hover:border-purple-500/20 transition-colors">
                    <div className="text-3xl font-black text-purple-500 mb-1">{user.completedMissionsCount || 0}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Missions Done</div>
                </div>

                {/* ACT Holdings Card */}
                <div className="md:col-span-3 bg-gradient-to-r from-card to-card/50 border border-card-border p-6 rounded-lg shadow-sm hover:border-primary/20 transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-icons text-6xl text-primary">account_balance_wallet</span>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-around gap-6 relative z-10">
                        <div className="text-center">
                            <div className="text-sm text-muted-foreground font-medium mb-1">ACT Balance</div>
                            <div className="text-2xl font-black text-foreground">
                                {actData ? actData.balance.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "..."} <span className="text-sm font-normal text-muted-foreground">$ACT</span>
                            </div>
                        </div>
                        <div className="w-px h-12 bg-border hidden md:block"></div>
                        <div className="text-center">
                            <div className="text-sm text-muted-foreground font-medium mb-1">Est. Value</div>
                            <div className="text-2xl font-black text-green-500">
                                {actData ? `$${actData.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "..."}
                            </div>
                        </div>
                        <div className="w-px h-12 bg-border hidden md:block"></div>
                        <div className="text-center">
                            <div className="text-sm text-muted-foreground font-medium mb-1">Holding Streak</div>
                            <div className="text-2xl font-black text-primary">
                                {user.holdingStartedAt ? formatDistanceToNow(new Date(user.holdingStartedAt)) : "Not Started"}
                            </div>
                            {user.holdingStartedAt && <div className="text-[10px] text-muted-foreground">Since {new Date(user.holdingStartedAt).toLocaleDateString()}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
