"use client";

import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { ArkRank } from "@prisma/client";
import { getRankInfo } from "@/lib/ranks";

export default function ImpactStatsCard() {
    const { user } = useUser();
    const [index, setIndex] = useState(0);

    const stats = [
        {
            label: "Global Impact",
            value: user?.communityStats?.totalCheckIns ? `${user.communityStats.totalCheckIns.toLocaleString()} Acts` : "Loading...",
            icon: "public"
        },
        {
            label: "Community Points",
            value: user?.communityStats?.totalPoints ? `${(user.communityStats.totalPoints / 1000).toFixed(1)}k PTS` : "Loading...",
            icon: "favorite"
        },
        {
            label: "Active Guardians",
            value: user?.communityStats?.activeUsers ? user.communityStats.activeUsers.toLocaleString() : "Loading...",
            icon: "groups"
        },
        {
            label: "Your Rank",
            value: user?.arkRank ? getRankInfo(user.arkRank as ArkRank).label : "Recruit",
            icon: "verified"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % stats.length);
        }, 5000); // Rotate every 5 seconds
        return () => clearInterval(interval);
    }, [stats.length]);

    const currentStat = stats[index];

    return (
        <div className="bg-card text-card-foreground border border-card-border rounded-lg p-ark-lg shadow-premium hover-elevate transition-premium flex flex-col justify-center items-center relative overflow-hidden h-full min-h-[160px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none"></div>

            <div key={index} className="flex flex-col items-center animate-fade-in text-center z-10">
                <div className="mb-2 p-3 bg-secondary/50 rounded-full">
                    <span className="material-icons text-primary text-2xl">{currentStat.icon}</span>
                </div>
                <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-1 font-medium">{currentStat.label}</h3>
                <p className="text-2xl font-bold tracking-tight">{currentStat.value}</p>
            </div>

            <div className="absolute bottom-4 flex gap-1.5">
                {stats.map((_, i) => (
                    <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === index ? "bg-primary" : "bg-muted"}`}
                    />
                ))}
            </div>
        </div>
    );
}
