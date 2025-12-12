import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function getMissions() {
    'use server';
    return await db.mission.findMany({
        orderBy: { points: 'desc' }
    });
}

async function createMission(formData: FormData) {
    'use server';

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const points = parseInt(formData.get('points') as string);
    const type = formData.get('type') as string;
    const frequency = formData.get('frequency') as string;

    await db.mission.create({
        data: {
            title,
            description,
            points,
            type,
            frequency
        }
    });

    revalidatePath('/admin/missions');
}

export default async function AdminMissionsPage() {
    const missions = await getMissions();

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-8">Mission Control</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Mission List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Active Missions</h3>
                    <div className="grid gap-4">
                        {missions.map((mission) => (
                            <div key={mission.id} className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`w-2 h-2 rounded-full ${mission.type === 'SOCIAL' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                                        <h4 className="font-bold">{mission.title}</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{mission.description}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs bg-muted px-2 py-1 rounded border border-border">{mission.frequency}</span>
                                        <span className="text-xs bg-muted px-2 py-1 rounded border border-border">{mission.type}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary">{mission.points}</p>
                                    <p className="text-xs text-muted-foreground">PTS</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Create Form */}
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm h-fit">
                    <h3 className="font-bold text-lg mb-6">Create New Mission</h3>
                    <form action={createMission} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input name="title" required className="w-full px-3 py-2 rounded-lg border border-border bg-background" placeholder="e.g. Follow on X" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea name="description" required className="w-full px-3 py-2 rounded-lg border border-border bg-background" placeholder="Describe the task..." rows={3} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Points</label>
                                <input name="points" type="number" required defaultValue={50} className="w-full px-3 py-2 rounded-lg border border-border bg-background" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Frequency</label>
                                <select name="frequency" className="w-full px-3 py-2 rounded-lg border border-border bg-background">
                                    <option value="DAILY">Daily</option>
                                    <option value="ONETIME">One-Time</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select name="type" className="w-full px-3 py-2 rounded-lg border border-border bg-background">
                                <option value="SOCIAL">Social</option>
                                <option value="ONCHAIN">On-Chain</option>
                                <option value="REFERRAL">Referral</option>
                            </select>
                        </div>

                        <button type="submit" className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:brightness-110 transition-all mt-4">
                            Publish Mission
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
