"use client";

import { useEffect, useState } from "react";
import { completeMission } from "@/actions/missions";
import { getRecentActivity } from "@/actions/activity";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import DailyCheckIn from "@/components/dashboard/DailyCheckIn";
import ImpactStatsCard from "@/components/dashboard/ImpactStatsCard";
import { getActPortfolio } from "@/actions/token";

interface Mission {
  id: string;
  title: string;
  type: string;
  // status: string; // Removed from model
  userStatus?: string;
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
  const [actData, setActData] = useState<{ balance: number; value: number; price: number } | null>(null);
  const [isBlurred, setIsBlurred] = useState(false);

  // Fetch ACT portfolio data
  useEffect(() => {
    if (user?.walletAddress) {
      getActPortfolio(user.walletAddress).then(setActData);
    }
  }, [user?.walletAddress]);

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
      setMissions(prev => prev.map(m => m.id === missionId ? { ...m, userStatus: 'COMPLETED' } : m));
      refetchUser();

      // Refresh activity log
      const activityData = await getRecentActivity(user.id);
      setActivities(activityData);

      toast.success(`Mission completed! +${res.points} PTS`);
    } else {
      toast.error(res.message || "Failed to complete mission");
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
        <DailyCheckIn />

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

      <ImpactStatsCard />

      {/* ACT Holdings Card */}
      <div className="bg-gradient-to-br from-card via-card to-primary/5 text-card-foreground border border-card-border rounded-lg p-ark-lg shadow-premium hover-elevate transition-premium overflow-hidden relative">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header with blur toggle */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
              <span className="material-icons text-primary text-xl">account_balance_wallet</span>
              $ACT Holdings
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {user.holdingStartedAt
                ? `Holding for ${Math.floor((Date.now() - new Date(user.holdingStartedAt).getTime()) / (1000 * 60 * 60 * 24))} days`
                : "Not holding yet"
              }
            </p>
          </div>
          {/* Blur Toggle */}
          <button
            onClick={() => setIsBlurred(!isBlurred)}
            className="p-2 hover:bg-muted/50 rounded-lg transition-colors group"
            title={isBlurred ? "Show values" : "Hide values"}
          >
            <span className="material-icons text-muted-foreground group-hover:text-primary text-lg">
              {isBlurred ? "visibility" : "visibility_off"}
            </span>
          </button>
        </div>

        {/* Balance Display */}
        <div className="space-y-3 relative z-10">
          {/* ACT Balance */}
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Balance:</span>
            <span className={`text-2xl font-bold text-foreground ${isBlurred ? 'blur-sm select-none' : ''} transition-all`}>
              {actData ? actData.balance.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "..."}
              <span className="text-sm font-normal text-muted-foreground ml-1">$ACT</span>
            </span>
          </div>

          {/* USD Value */}
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">USD Value:</span>
            <span className={`text-xl font-bold text-green-500 ${isBlurred ? 'blur-sm select-none' : ''} transition-all`}>
              ${actData ? actData.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0.00"}
            </span>
          </div>

          {/* Eligibility Status */}
          <div className="mt-4 pt-4 border-t border-border">
            {actData && actData.value >= 250 ? (
              <div className="flex items-center gap-2 text-green-500">
                <span className="material-icons text-sm">check_circle</span>
                <span className="text-sm font-medium">Eligible ($250+ requirement met)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-500">
                <span className="material-icons text-sm">info</span>
                <span className="text-sm font-medium">
                  ${actData ? (250 - actData.value).toFixed(2) : "250"} more to qualify
                </span>
              </div>
            )}
          </div>
        </div>

        {/* View Details Link */}
        <Link
          href="/eligibility"
          className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm text-primary hover:text-primary/80 transition-colors relative z-10 group"
        >
          <span>View Eligibility Details</span>
          <span className="material-icons text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </Link>
      </div>

      {/* ARK Points Card */}
      <div className="bg-gradient-to-br from-card to-secondary/30 text-card-foreground border border-card-border rounded-lg p-ark-lg text-center shadow-premium hover-elevate transition-premium flex flex-col justify-center items-center relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <h2 className="text-xl font-semibold mb-2 relative z-10">ARK Points</h2>
        <p className="text-6xl font-black text-primary mb-2 tracking-tighter animate-scale-in relative z-10">{user.points.toLocaleString()}</p>
        <div className="relative z-10 flex flex-col gap-1 items-center">
          <p className="text-muted-foreground text-sm">Redeem for rewards!</p>
          {user.bnbBalance && (
            <div className="mt-2 text-xs font-mono text-muted-foreground/80 bg-background/50 px-2 py-1 rounded backdrop-blur-sm border border-border/50">
              {parseFloat(user.bnbBalance).toFixed(4)} BNB
            </div>
          )}
        </div>
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
                disabled={mission.userStatus === 'COMPLETED'}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${mission.userStatus === 'COMPLETED' ? "bg-green-500/20 text-green-600 cursor-default" : "bg-background border border-border text-foreground hover:bg-muted hover-elevate-2"}`}
              >
                {mission.userStatus === 'COMPLETED' ? "Completed" : "Complete"}
              </button>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
