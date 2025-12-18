import { db } from "@/lib/db";
import CreateMissionForm from "@/components/admin/CreateMissionForm";
import MissionList from "@/components/admin/MissionList";

async function getMissions() {
    'use server';
    return await db.mission.findMany({
        orderBy: { points: 'desc' },
        include: { _count: { select: { userMissions: true } } }
    });
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
                    <MissionList missions={missions} />
                </div>

                {/* Create Form */}
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm h-fit">
                    <h3 className="font-bold text-lg mb-6">Create New Mission</h3>
                    <CreateMissionForm />
                </div>
            </div>
        </div>
    );
}
