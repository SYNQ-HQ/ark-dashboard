"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon } from "@/components/Icons";
import { useUser } from "@/context/UserContext";
import Skeleton from "@/components/ui/Skeleton";
import { fetchMissions, completeMission } from "@/actions/missions";
import { toast } from "sonner";

interface Mission {
    id: string;
    title: string;
    description: string;
    type: string;
    status: string;
    points: number;
}

export default function MissionsPage() {
    const { user, refetchUser } = useUser();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadMissions() {
        if (!user) return;
        setLoading(true);
        const data = await fetchMissions(user.walletAddress);
        setMissions(data as unknown as Mission[]);
        setLoading(false);
    }

    useEffect(() => {
        if (user?.walletAddress) {
            loadMissions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    async function handleComplete(missionId: string) {
        if (!user) return;

        toast.promise(
            // Promise function
            completeMission(user.walletAddress, missionId),
            {
                loading: 'Verifying mission...',
                success: (res) => {
                    if (res.success) {
                        refetchUser(); // Update points
                        loadMissions(); // Update status
                        return `Mission completed! +${res.points} Points`;
                    } else {
                        throw new Error(res.message);
                    }
                },
                error: (err) => `Failed: ${err.message}`
            }
        );
    }

    if (loading) {
        return (
            <div className="bg-card text-card-foreground border border-card-border rounded-lg p-ark-lg shadow-premium-lg animate-slide-up">
                <div className="mb-6">
                    <Skeleton className="h-8 w-48 mb-2" />
                </div>
                <div className="divide-y divide-border/50">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between py-6">
                            <div className="w-full">
                                <Skeleton className="h-6 w-1/3 mb-2" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-4 w-20 mt-2" />
                            </div>
                            <Skeleton className="h-10 w-24 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card text-card-foreground border border-card-border rounded-lg p-ark-lg shadow-premium-lg animate-slide-up">
            <h2 className="text-2xl font-bold mb-6 text-foreground tracking-tight">Daily Missions</h2>
            <div className="divide-y divide-border/50">
                {missions.map((mission) => (
                    <div key={mission.id} className="flex items-center justify-between py-6 group">
                        <div>
                            <p className="font-semibold text-lg group-hover:text-primary transition-colors">{mission.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{mission.description}</p>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground mt-2 inline-block">{mission.type} • +{mission.points} ✨</span>
                        </div>
                        {mission.status === 'COMPLETED' ? (
                            <div className="flex items-center text-green-500 gap-2">
                                <span className="font-medium">Completed</span>
                                <CheckCircleIcon />
                            </div>
                        ) : (
                            <button
                                onClick={() => handleComplete(mission.id)}
                                className="bg-primary text-primary-foreground rounded-lg px-6 py-2 font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all"
                            >
                                Complete
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
