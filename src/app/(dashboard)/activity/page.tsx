"use client";

import { useEffect, useState } from "react";
import { getRecentActivity } from "@/actions/activity";
import { useUser } from "@/context/UserContext";
import { formatDistanceToNow, format } from "date-fns";

interface Activity {
    id: string;
    type: string;
    description: string;
    createdAt: Date;
}

export default function ActivityPage() {
    const { user, loading } = useUser();
    const [activities, setActivities] = useState<Activity[]>([]);

    useEffect(() => {
        async function load() {
            if (!user) return;
            const data = await getRecentActivity(user.id, 50); // Fetch last 50
            setActivities(data);
        }
        load();
    }, [user]);

    if (loading) return <div className="p-8 text-center animate-pulse">Loading history...</div>;
    if (!user) return <div className="p-8 text-center">Please connect wallet.</div>;

    return (
        <div className="max-w-2xl mx-auto animate-slide-up">
            <h1 className="text-3xl font-bold mb-8">Activity Log</h1>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="divide-y divide-border">
                    {activities.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No records found.</div>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="p-4 flex gap-4 hover:bg-muted/30 transition-colors">
                                <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${activity.type === 'CHECK_IN' ? 'bg-green-500' :
                                        activity.type === 'MISSION' ? 'bg-blue-500' : 'bg-primary'
                                    }`} />
                                <div>
                                    <p className="font-medium text-foreground">{activity.description}</p>
                                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                        <span>{format(new Date(activity.createdAt), "MMM d, yyyy h:mm a")}</span>
                                        <span>•</span>
                                        <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
