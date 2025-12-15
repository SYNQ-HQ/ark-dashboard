"use client";

import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";

const MILESTONES = [
    { days: 3, name: "Bronze", color: "text-amber-600", bg: "bg-amber-600" },
    { days: 7, name: "Silver", color: "text-slate-400", bg: "bg-slate-400" },
    { days: 14, name: "Gold", color: "text-yellow-400", bg: "bg-yellow-400" },
    { days: 30, name: "Citizen", color: "text-purple-400", bg: "bg-purple-400" },
];

export default function StreakCounter() {
    const { user } = useUser();
    const [warning, setWarning] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            if (!user?.streak?.lastCheckIn) return;
            // Check if checked in today
            const now = new Date();
            const last = new Date(user.streak.lastCheckIn);
            const isSameDay = last.getUTCFullYear() === now.getUTCFullYear() &&
                last.getUTCMonth() === now.getUTCMonth() &&
                last.getUTCDate() === now.getUTCDate();

            if (!isSameDay) {
                // Not checked in today yet
                const hour = now.getHours();
                if (hour >= 20) { // 8 PM local time
                    setWarning(true);
                }
            } else {
                setWarning(false);
            }
        };
        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [user]);

    if (!user) return null;

    const streak = user.streak?.currentStreak || 0;

    // Find next milestone
    const nextMilestone = MILESTONES.find(m => m.days > streak) || MILESTONES[MILESTONES.length - 1];
    const prevMilestoneDays = MILESTONES.slice().reverse().find(m => m.days <= streak)?.days || 0;

    // progress = (streak - prev) / (next - prev)
    // If streak > max milestone, stick to 100%
    let progress = 0;
    if (streak >= nextMilestone.days && nextMilestone.days === MILESTONES[MILESTONES.length - 1].days) {
        progress = 100;
    } else {
        const totalGap = nextMilestone.days - prevMilestoneDays;
        const currentGap = streak - prevMilestoneDays;
        progress = Math.min(100, Math.max(0, (currentGap / totalGap) * 100));
    }

    return (
        <div className={`px-3 py-4 border-b border-sidebar-border transition-colors duration-300 ${warning ? 'bg-red-500/10' : ''}`}>
            <div className="flex items-center justify-center group-hover:justify-between px-1 transition-all duration-200">
                {/* Collapsed/Icon View */}
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center relative ${warning ? 'animate-pulse' : ''}`}>
                        <span className={`material-icons ${streak > 0 ? "text-orange-500" : "text-muted-foreground"}`}>local_fire_department</span>
                        {warning && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-sidebar text-[8px] flex items-center justify-center text-white">!</span>
                        )}
                    </div>
                    {/* Collapsed Streak Count (only visible when collapsed? No, let's hide in collapsed if we desire, but simpler to show number always maybe?) 
                       Actually, when w-20 (collapsed), we only see the icon if we center it.
                       The sidebar impl uses `group-hover` to reveal text.
                    */}
                </div>

                {/* Expanded Content */}
                <div className="hidden group-hover:block flex-1 ml-3 animate-fade-in">
                    <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-bold ${streak > 0 ? "text-orange-500" : "text-muted-foreground"}`}>
                            {streak} Day Streak
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">{nextMilestone.name}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${nextMilestone.bg}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {warning && (
                        <p className="text-[10px] text-red-400 mt-1 font-medium animate-pulse">
                            Check in soon to keep streak!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
