"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchImpactStories } from "@/actions/impact";
import Skeleton from "@/components/ui/Skeleton";

interface ImpactStory {
    id: string;
    title: string;
    description: string;
    imageUrl?: string | null;
    location?: string | null;
    date?: Date | null;
    raised?: number | null;
    goal?: number | null;
    supporters?: number | null;
    status?: string | null;
}

export default function ImpactPage() {
    const [stories, setStories] = useState<ImpactStory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStories() {
            setLoading(true);
            try {
                const data = await fetchImpactStories();
                setStories(data as unknown as ImpactStory[]);
            } catch (e) {
                console.error("Failed to load impact stories", e);
            } finally {
                setLoading(false);
            }
        }
        loadStories();
    }, []);

    if (loading) {
        return (
            <div className="py-24 md:py-32 bg-background min-h-screen">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    <Skeleton className="h-16 w-1/3 mb-16" />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[500px] border border-border rounded-xl p-0 overflow-hidden bg-card">
                                <Skeleton className="h-52 w-full" />
                                <div className="p-6 space-y-4">
                                    <Skeleton className="h-8 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <section
            className="py-24 md:py-32 bg-background relative overflow-hidden min-h-screen"
            data-testid="missions-section"
        >
            <div className="absolute inset-0">
                <div className="absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
            </div>

            <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-fade-in">
                    <div>
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                            Live Impact
                        </span>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
                            Active Missions
                        </h2>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                            Real impact, real communities. See where your $ACT tokens are
                            making a difference.
                        </p>
                    </div>

                    <Link href="/impact">
                        <button
                            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-8 py-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                        >
                            View All Missions
                            <span className="ml-2">→</span>
                        </button>
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {stories.map((story) => (
                        <div
                            key={story.id}
                            className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="relative h-52 overflow-hidden flex-shrink-0 bg-muted">
                                <img
                                    src={story.imageUrl || "https://via.placeholder.com/400x200"}
                                    alt={story.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                <span className="absolute top-4 right-4 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground shadow capitalize">
                                    {story.status || 'Active'}
                                </span>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                                    {story.title}
                                </h3>

                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-5">
                                    {story.location && (
                                        <span className="flex items-center gap-1.5">
                                            📍 {story.location}
                                        </span>
                                    )}
                                    {story.date && (
                                        <span className="flex items-center gap-1.5">
                                            📅 {new Date(story.date).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-3 mb-5 mt-auto">
                                    {story.goal && (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Raised</span>
                                                <span className="font-bold text-foreground">
                                                    ${(story.raised || 0).toLocaleString()}
                                                    <span className="font-normal text-muted-foreground">
                                                        {" "}
                                                        / ${story.goal.toLocaleString()}
                                                    </span>
                                                </span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary flex-1 transition-all"
                                                    style={{ width: `${Math.min(100, ((story.raised || 0) / story.goal) * 100)}%` }}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        👥 {(story.supporters || 0).toLocaleString()} supporters
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {stories.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                            <p className="text-lg">No impact stories available yet.</p>
                            <p className="text-sm">Check back soon to see our active campaigns.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
