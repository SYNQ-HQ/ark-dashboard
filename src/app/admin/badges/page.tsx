import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function getBadges() {
    'use server';
    return await db.badge.findMany({
        include: { _count: { select: { userBadges: true } } }
    });
}
async function createBadge(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const icon = formData.get('icon') as string;

    await db.badge.create({
        data: { name, description, icon }
    });

    revalidatePath('/admin/badges');
}

export default async function AdminBadgesPage() {
    const badges = await getBadges();

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Badge Management</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    {badges.map((badge) => (
                        <div key={badge.id} className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">{badge.icon}</span>
                                <div>
                                    <h4 className="font-bold">{badge.name}</h4>
                                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                                </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                                {badge._count.userBadges} Awarded
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-card border border-border p-6 rounded-xl shadow-sm h-fit">
                    <h3 className="font-bold text-lg mb-6">Create New Badge</h3>
                    <form action={createBadge} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input name="name" required className="w-full px-3 py-2 rounded-lg border border-border bg-background" placeholder="e.g. Early Bird" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <input name="description" required className="w-full px-3 py-2 rounded-lg border border-border bg-background" placeholder="Criteria for this badge" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Icon (Emoji)</label>
                            <input name="icon" required className="w-full px-3 py-2 rounded-lg border border-border bg-background" placeholder="🏆" />
                        </div>

                        <button type="submit" className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:brightness-110 transition-all mt-4">
                            Create Badge
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
