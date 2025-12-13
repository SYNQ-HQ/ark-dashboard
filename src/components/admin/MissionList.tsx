"use client";

import { useState } from "react";
import { deleteMission } from "@/actions/missions";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import EditMissionModal from "@/components/admin/EditMissionModal";

interface Mission {
    id: string;
    title: string;
    description: string;
    type: string;
    points: number;
    frequency: string;
    imageUrl?: string | null;
}

interface MissionListProps {
    missions: Mission[];
}

export default function MissionList({ missions: initialMissions }: MissionListProps) {
    const { user } = useUser();
    const [missions, setMissions] = useState(initialMissions);
    const [editingMission, setEditingMission] = useState<Mission | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    async function handleDelete(missionId: string, title: string) {
        if (!user) return;

        const confirmed = confirm(`Are you sure you want to delete "${title}"?`);
        if (!confirmed) return;

        setDeleting(missionId);
        const res = await deleteMission(missionId, user.id);
        setDeleting(null);

        if (res.success) {
            toast.success("Mission deleted!");
            setMissions(missions.filter(m => m.id !== missionId));
        } else {
            toast.error(res.message || "Failed to delete mission");
        }
    }

    return (
        <>
            <div className="grid gap-4">
                {missions.map((mission) => (
                    <div key={mission.id} className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-start justify-between gap-4">
                        {mission.imageUrl && (
                            <img
                                src={mission.imageUrl}
                                alt={mission.title}
                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${mission.type === 'SOCIAL' ? 'bg-blue-500' : mission.type === 'ONCHAIN' ? 'bg-purple-500' : 'bg-green-500'}`}></span>
                                <h4 className="font-bold">{mission.title}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">{mission.description}</p>
                            <div className="flex gap-2 mt-2">
                                <span className="text-xs bg-muted px-2 py-1 rounded border border-border">{mission.frequency}</span>
                                <span className="text-xs bg-muted px-2 py-1 rounded border border-border">{mission.type}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="text-right flex-shrink-0">
                                <p className="text-2xl font-bold text-primary">{mission.points}</p>
                                <p className="text-xs text-muted-foreground">PTS</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingMission(mission)}
                                    className="px-3 py-1 text-xs bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20 transition-colors"
                                    title="Edit mission"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(mission.id, mission.title)}
                                    disabled={deleting === mission.id}
                                    className="px-3 py-1 text-xs bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                    title="Delete mission"
                                >
                                    {deleting === mission.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {editingMission && (
                <EditMissionModal
                    mission={editingMission}
                    onClose={() => {
                        setEditingMission(null);
                        // Refresh the page to show updated data
                        window.location.reload();
                    }}
                />
            )}
        </>
    );
}
