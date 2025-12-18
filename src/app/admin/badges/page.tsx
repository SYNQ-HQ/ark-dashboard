"use client";

import { fetchBadges, deleteBadgeAction } from "@/actions/badges";
import CreateBadgeForm from "@/components/admin/CreateBadgeForm";
import EditBadgeModal from "@/components/admin/EditBadgeModal";
import AwardBadgeModal from "@/components/admin/AwardBadgeModal";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import NextImage from "next/image";

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    displayOrder: number;
    _count?: { userBadges: number };
}

export default function AdminBadgesPage() {
    const { user } = useUser();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
    const [awardingBadge, setAwardingBadge] = useState<Badge | null>(null);

    // Deletion state
    const [deletingBadge, setDeletingBadge] = useState<Badge | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    async function loadBadges() {
        const data = await fetchBadges();
        setBadges(data as unknown as Badge[]);
    }

    // Initial fetch
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadBadges();
    }, []);

    // Helper to check if icon is URL
    const isUrl = (str: string) => str.startsWith('http');

    const confirmDelete = async () => {
        if (!user || !deletingBadge) return;

        setIsDeleting(true);
        const formData = new FormData();
        formData.append("badgeId", deletingBadge.id);
        formData.append("adminId", user.id);

        const res = await deleteBadgeAction(formData);
        setIsDeleting(false);

        if (res.success) {
            toast.success("Badge deleted");
            setDeletingBadge(null);
            loadBadges(); // Refresh list
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Badges & Achievements</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min">
                    {badges.map((badge) => (
                        <div key={badge.id} className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-full text-2xl overflow-hidden relative">
                                        {isUrl(badge.icon) ? (
                                            <NextImage src={badge.icon} alt={badge.name} fill className="object-cover" />
                                        ) : (
                                            <span>{badge.icon}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{badge.name}</h3>
                                        <p className="text-xs text-muted-foreground">{badge._count?.userBadges || 0} awarded</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground">{badge.description}</p>

                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                                <button
                                    onClick={() => setAwardingBadge(badge)}
                                    className="text-xs flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1.5 rounded hover:bg-green-200 font-medium transition-colors"
                                >
                                    <span className="material-icons text-xs">emoji_events</span>
                                    Award User
                                </button>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingBadge(badge)}
                                        className="text-xs bg-primary-100 text-primary-700 px-2 py-1.5 rounded hover:bg-primary-200 font-medium transition-colors"
                                    >
                                        Edit
                                    </button>
                                    {user && (
                                        <button
                                            onClick={() => setDeletingBadge(badge)}
                                            className="text-xs bg-red-100 text-red-700 px-2 py-1.5 rounded hover:bg-red-200 font-medium transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Form */}
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm h-fit sticky top-6">
                    <h3 className="font-bold text-lg mb-6">Create New Badge</h3>
                    <CreateBadgeForm />
                </div>
            </div>

            {editingBadge && (
                <EditBadgeModal
                    badge={editingBadge}
                    onClose={() => {
                        setEditingBadge(null);
                        loadBadges();
                    }}
                />
            )}

            {awardingBadge && (
                <AwardBadgeModal
                    badge={awardingBadge}
                    onClose={() => {
                        setAwardingBadge(null);
                        loadBadges(); // To update count
                    }}
                />
            )}

            <ConfirmationModal
                isOpen={!!deletingBadge}
                onClose={() => setDeletingBadge(null)}
                onConfirm={confirmDelete}
                title="Delete Badge"
                message={deletingBadge ? (
                    (deletingBadge._count?.userBadges || 0) > 0
                        ? `This badge has been awarded to ${deletingBadge._count?.userBadges} users. Deleting it will remove it from their profiles. Are you sure?`
                        : "Are you sure you want to delete this badge?"
                ) : ""}
                confirmText="Delete Badge"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
