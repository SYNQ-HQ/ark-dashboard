import { fetchImpactStoryBySlug } from "@/actions/impact";
import DonationWidget from "@/components/impact/DonationWidget";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ImpactStoryPage({ params }: { params: { slug: string } }) {
    // In Next.js 15, params is a Promise. Treating nicely.
    const { slug } = await params;
    const story = await fetchImpactStoryBySlug(slug);

    if (!story) {
        return notFound();
    }

    return (
        <div className="max-w-4xl mx-auto p-4 animate-fade-in pb-20">
            <Link
                href="/impact"
                className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
                <span className="material-icons mr-1">arrow_back</span>
                Back to Impact Stories
            </Link>

            <article className="bg-card border border-border rounded-xl overflow-hidden shadow-premium-lg">
                <div className="relative w-full h-80 md:h-[400px] bg-muted/20">
                    <Image
                        src={story.imageUrl || `https://via.placeholder.com/1200x600?text=${encodeURIComponent(story.title)}`}
                        alt={story.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                        {story.status}
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid md:grid-cols-[1fr_300px] gap-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-4 tracking-tight">{story.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8">
                                {story.location && (
                                    <span className="flex items-center text-sm">
                                        <span className="material-icons text-base mr-1">location_on</span>
                                        {story.location}
                                    </span>
                                )}
                                {story.date && (
                                    <span className="flex items-center text-sm">
                                        <span className="material-icons text-base mr-1">event</span>
                                        {new Date(story.date).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                                <p className="whitespace-pre-line">{story.description}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Stats Card */}
                            {story.goal && (
                                <div className="bg-muted/30 p-5 rounded-xl border border-border/50">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-semibold text-primary">Raised</span>
                                        <span className="text-muted-foreground">of ${story.goal.toLocaleString()}</span>
                                    </div>
                                    <div className="text-3xl font-bold mb-3">
                                        ${(story.raised || 0).toLocaleString()}
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden mb-3">
                                        <div
                                            className="bg-primary h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(100, ((story.raised || 0) / story.goal) * 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-center text-muted-foreground font-medium">
                                        {story.supporters || 0} supporters have contributed
                                    </p>
                                </div>
                            )}

                            {/* Donation Widget */}
                            <DonationWidget storyId={story.id} />
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}
