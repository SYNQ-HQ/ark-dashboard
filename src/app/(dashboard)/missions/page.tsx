"use client";

import NextImage from "next/image";

import { useEffect, useState, useCallback } from "react";
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
    status: string; // Global status
    userStatus?: string; // User status
    points: number;
    imageUrl?: string | null;
}

export default function MissionsPage() {
    const { user, refetchUser } = useUser();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);

    const loadMissions = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const data = await fetchMissions(user.walletAddress);
        setMissions(data as unknown as Mission[]);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (user?.walletAddress) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadMissions();
        }
    }, [user, loadMissions]);

    async function handleComplete(missionId: string) {
        if (!user) return;

        toast.promise(
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
                    <div key={mission.id} className="flex flex-col md:flex-row items-start gap-4 py-6 group border-b border-border/50 last:border-0 hover:bg-muted/5 transition-colors pl-2 rounded-lg">
                        {mission.imageUrl && (
                            <div className="relative w-full md:w-24 h-24 flex-shrink-0">
                                <NextImage
                                    src={mission.imageUrl}
                                    alt={mission.title}
                                    fill
                                    className="object-cover rounded-lg shadow-sm"
                                />
                            </div>
                        )}
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{mission.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{mission.description}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded capitalize ${mission.status === 'active' ? 'bg-green-100 text-green-700' :
                                    mission.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {mission.status || 'Active'}
                                </span>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground flex items-center gap-1">
                                    {mission.type} • +{mission.points} ✨
                                </span>

                                {mission.status !== 'completed' && (
                                    <>
                                        {mission.userStatus === 'COMPLETED' ? (
                                            <div className="flex items-center text-green-500 gap-2">
                                                <span className="font-medium">Completed</span>
                                                <CheckCircleIcon />
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleComplete(mission.id)}
                                                className="bg-primary text-primary-foreground rounded-lg px-6 py-2 text-sm font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all"
                                            >
                                                Complete
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {missions.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">
                        No active missions available. Check back later!
                    </div>
                )}
            </div>
        </div>
    );
}
