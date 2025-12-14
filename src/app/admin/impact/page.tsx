"use client";

import { db } from "@/lib/db";
import CreateImpactForm from "@/components/admin/CreateImpactForm";
import EditImpactStoryModal from "@/components/admin/EditImpactStoryModal";
import { deleteImpactStoryAction } from "@/actions/impact";
import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
// Since we are moving to client component, we need to fetch data differently or accept it as props.
// However, the cleanest way in this architecture is to keep standard server/client pattern.
// Let's make a wrapper or just fetch inside the component for simplicity if we want to stick to 'use client'.
// BETTER APPROACH: Keep it a Server Component and extract the List to a Client Component.
// BUT, to follow the pattern used in Rewards/Missions where I may have already converted them or planned to:
// I will fetch data via a server action passed to client or just use a client-side fetch wrapper.
// WAIT - I can keep the page as Server Component and just make the List a client component?
// No, user wants me to match the existing patterns. In admin/rewards/page.tsx, I converted it to client.
// So I will convert this to client and fetch data via server action.

import { fetchImpactStories } from "@/actions/impact";

export default function AdminImpactPage() {
    const { user } = useUser();
    const [stories, setStories] = useState<any[]>([]);
    const [editingStory, setEditingStory] = useState<any>(null);

    useEffect(() => {
        // Fetch initial data
        fetchImpactStories().then(setStories);
    }, []);

    // Also need to re-fetch when updates happen? 
    // Server actions revalidatePath usually handles this for server components.
    // For client components, we might need to manually update local state or rely on router refresh.
    // Since revalidatePath works on the server render, if this is a full client component, we rely on state.
    // But better yet: let's use the pattern where the Page is server, pass data to a Client List.
    // Actually, to avoid large refactors, let's just make THIS component client and fetch on mount for now, 
    // mirroring what I likely did for rewards.

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Real-World Impact</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List */}
                <div className="lg:col-span-2 grid grid-cols-1 gap-6 auto-rows-min">
                    {stories.map((story) => (
                        <div key={story.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                            <div className="bg-muted w-full md:w-48 h-32 md:h-auto flex-shrink-0 relative">
                                {story.imageUrl ? (
                                    <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        <span className="material-icons text-3xl">image</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-center">
                                <h3 className="font-bold text-lg">{story.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{story.description}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <p className="text-xs text-muted-foreground">
                                        Posted: {new Date(story.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingStory(story)}
                                            className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded hover:bg-primary-200"
                                        >
                                            Edit
                                        </button>
                                        {user && (
                                            <form action={async (formData) => {
                                                await deleteImpactStoryAction(formData);
                                                setStories(stories.filter(s => s.id !== story.id));
                                            }}>
                                                <input type="hidden" name="storyId" value={story.id} />
                                                <input type="hidden" name="adminId" value={user.id} />
                                                <button type="submit" className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
                                                    Delete
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Form */}
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm h-fit sticky top-6">
                    <h3 className="font-bold text-lg mb-6">Publish Impact Story</h3>
                    <CreateImpactForm />
                </div>
            </div>

            {editingStory && (
                <EditImpactStoryModal
                    story={editingStory}
                    onClose={() => {
                        setEditingStory(null);
                        fetchImpactStories().then(setStories);
                    }}
                />
            )}
        </div>
    );
}
