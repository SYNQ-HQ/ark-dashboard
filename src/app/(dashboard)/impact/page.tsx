"use client";

import { useEffect, useState } from "react";
import { fetchImpactStories } from "@/actions/impact";
import Image from "next/image";

interface ImpactStory {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
}

export default function ImpactPage() {
    const [stories, setStories] = useState<ImpactStory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchImpactStories();
                setStories(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <div className="p-8 text-center animate-pulse">Loading impact stories...</div>;

    return (
        <div className="bg-card text-card-foreground border border-card-border rounded-lg p-ark-lg shadow-premium-lg animate-fade-in">
            <h2 className="text-2xl font-bold mb-8 text-foreground tracking-tight">ARK Impact Stories</h2>
            <div className="space-y-8">
                {stories.map((story) => (
                    <div key={story.id} className="flex flex-col md:flex-row gap-8 items-start group">
                        <div className="md:w-1/3 overflow-hidden rounded-xl bg-muted/20 relative aspect-video">
                            <Image
                                src={story.imageUrl || `https://via.placeholder.com/600x400?text=Impact+Story`}
                                alt={story.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <div className="md:w-2/3">
                            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                                {story.title}
                            </h3>
                            <p className="text-muted-foreground mb-5 leading-relaxed">
                                {story.description}
                            </p>
                            <a href="#" className="inline-flex items-center text-primary font-semibold hover:underline">
                                Read Full Story <span className="material-icons text-sm ml-1">arrow_forward</span>
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
