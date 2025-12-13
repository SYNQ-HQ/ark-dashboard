"use client";

import { useEffect, useState } from "react";
import { completeMission } from "@/actions/missions";
import { claimDailyCheckIn } from "@/actions/user";
import { getRecentActivity } from "@/actions/activity";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Mission {
  id: string;
  title: string;
  type: string;
  status: string;
  points: number;
  imageUrl?: string | null;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: Date;
}

export default function DashboardPage() {
  const { user, loading: userLoading, refetchUser } = useUser();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user?.walletAddress) return;
      try {
        const { fetchMissions } = await import("@/actions/missions");
        const missionData = await fetchMissions(user.walletAddress);
        setMissions(missionData);

        // Load Activity
        const activityData = await getRecentActivity(user.id);
        setActivities(activityData);
      } catch (e) {
        console.error(e);
      }
    }
    if (user) loadData();
  }, [user]);

  const handleCompleteMission = async (missionId: string) => {
    if (!user) return;
    const res = await completeMission(user.walletAddress, missionId);
    if (res.success) {
      setMissions(prev => prev.map(m => m.id === missionId ? { ...m, status: 'COMPLETED' } : m));
      refetchUser();

      // Refresh activity log
      const activityData = await getRecentActivity(user.id);
      setActivities(activityData);

      toast.success(`Mission completed! +${res.points} PTS`);
    } else {
      toast.error(res.message || "Failed to complete mission");
    }
  }

  // Check if user can claim today based on lastCheckIn (UTC)
  const canClaimToday = () => {
    if (!user?.streak?.lastCheckIn) return true;

    const now = new Date();
    const last = new Date(user.streak.lastCheckIn);

    // Compare UTC dates
    const isSameDay = last.getUTCFullYear() === now.getUTCFullYear() &&
      last.getUTCMonth() === now.getUTCMonth() &&
      last.getUTCDate() === now.getUTCDate();

    return !isSameDay;
  };

  const alreadyClaimedToday = !canClaimToday();

  const handleClaimCheckIn = async () => {
    if (!user) return;
    setClaiming(true);
    const res = await claimDailyCheckIn(user.walletAddress);
    setClaiming(false);

    if (res.success) {
      toast.success("Blessings claimed!");
      refetchUser();
      const activityData = await getRecentActivity(user.id);
      setActivities(activityData);
    } else {
      toast.error(res.message || "Failed to claim");
    }
  }

  if (userLoading) {
    return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Welcome to ARK Dashboard</h2>
        <p className="text-muted-foreground">Please connect your wallet to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-ark-lg animate-fade-in">
      {/* Daily Check-in Card & Activity Log */}
      <div className="bg-card text-card-foreground border border-card-border rounded-lg lg:col-span-1 lg:row-span-2 shadow-premium hover-elevate transition-premium overflow-hidden flex flex-col">
        <div className="p-ark-lg pb-4">
          <h2 className="text-xl font-semibold mb-4 text-foreground tracking-tight">Daily Check-in</h2>
          <p className="text-muted-foreground mb-6">You&apos;re on a {user.streak?.currentStreak || 0}-day streak! 🔥</p>
          <div className="flex space-x-3 mb-8 justify-center">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${i < (user.streak?.currentStreak || 0) ? "bg-primary text-primary-foreground scale-110 shadow-sm" : "bg-muted text-muted-foreground/50"}`}
              >
                {i < (user.streak?.currentStreak || 0) && <span className="material-icons text-sm">check</span>}
              </div>
            ))}
          </div>
          <button
            onClick={handleClaimCheckIn}
            disabled={claiming || alreadyClaimedToday}
            className={`rounded-lg px-6 py-3 w-full font-medium shadow-md transition-all duration-200 ${alreadyClaimedToday
              ? "bg-green-500 text-white cursor-default"
              : "bg-primary text-primary-foreground hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              } disabled:opacity-50 disabled:pointer-events-none`}
          >
            {claiming ? "Claiming..." : alreadyClaimedToday ? "Claimed Today ✓" : "Claim Daily Blessings"}
          </button>
        </div>

        {/* Activity Log Section */}
        <div className="flex-1 bg-muted/20 border-t border-border p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</h3>
            <Link href="/activity" className="text-xs text-primary hover:underline">View All</Link>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {activities.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No recent activity.</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 items-start animate-fade-in">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${activity.type === 'CHECK_IN' ? 'bg-green-500' :
                    activity.type === 'MISSION' ? 'bg-blue-500' : 'bg-primary'
                    }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-tight truncate">{activity.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Eligibility Card */}
      <div className="bg-card text-card-foreground border border-card-border rounded-lg p-ark-lg shadow-premium hover-elevate transition-premium flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2 text-foreground tracking-tight">Holder Reward Eligibility</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Hold $250 of $ACT for 25 days to qualify.
          </p>
        </div>
        <div>
          <div className="w-full bg-muted rounded-full h-3 mb-3 overflow-hidden">
            <div
              className={`h-3 rounded-full animate-pulse ${user.isEligible ? "bg-green-500" : "bg-primary"}`}
              style={{ width: user.isEligible ? "100%" : "60%" }}
            ></div>
          </div>
          <p className="text-sm text-primary font-medium text-right">{user.isEligible ? "Eligible!" : "15 / 25 Days Held"}</p>
        </div>
      </div>

      {/* ARK Points Card */}
      <div className="bg-gradient-to-br from-card to-secondary/30 text-card-foreground border border-card-border rounded-lg p-ark-lg text-center shadow-premium hover-elevate transition-premium flex flex-col justify-center items-center relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <h2 className="text-xl font-semibold mb-2 relative z-10">ARK Points</h2>
        <p className="text-6xl font-black text-primary mb-2 tracking-tighter animate-scale-in relative z-10">{user.points.toLocaleString()}</p>
        <p className="text-muted-foreground text-sm relative z-10">Redeem for rewards in the store!</p>
      </div>

      {/* Daily Missions Card (Spans 2 columns) */}
      <div className="bg-card text-card-foreground border border-card-border rounded-lg p-ark-lg md:col-span-2 shadow-premium hover-elevate transition-premium">
        <h2 className="text-xl font-semibold mb-6 text-foreground tracking-tight">Daily Missions</h2>
        <div className="space-y-4">
          {missions.map((mission, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-transparent hover:border-border transition-colors">
              <div>
                <p className="font-medium text-foreground">{mission.title}</p>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{mission.type}</span>
              </div>
              <button
                onClick={() => handleCompleteMission(mission.id)}
                disabled={mission.status === 'COMPLETED'}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${mission.status === 'COMPLETED' ? "bg-green-500/20 text-green-600 cursor-default" : "bg-background border border-border text-foreground hover:bg-muted hover-elevate-2"}`}
              >
                {mission.status === 'COMPLETED' ? "Completed" : "Complete"}
              </button>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
