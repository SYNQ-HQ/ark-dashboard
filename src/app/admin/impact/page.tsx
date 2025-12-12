import { db } from "@/lib/db";
import CreateImpactForm from "@/components/admin/CreateImpactForm";

// Ensure dynamic rendering
export const dynamic = 'force-dynamic';

async function getImpactStories() {
    'use server';
    return await db.impactStory.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export default async function AdminImpactPage() {
    const stories = await getImpactStories();

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
                                <p className="text-xs text-muted-foreground mt-3">
                                    Posted: {new Date(story.createdAt).toLocaleDateString()}
                                </p>
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
        </div>
    );
}
