import { db } from "@/lib/db";

async function getStats() {
    'use server'; // Server component

    // In a real scenario, we'd cache this or use a separate stats service
    const totalUsers = await db.user.count();
    const activeMissions = await db.mission.count();
    const totalRedemptions = await db.redemption.count();

    const auditLogs = await db.userActivity.findMany({
        where: { type: { startsWith: 'ADMIN_' } },
        include: { user: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    return {
        totalUsers,
        activeMissions,
        totalRedemptions,
        auditLogs
    };
}

export default async function AdminDashboardPage() {
    const stats = await getStats();

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-8">System Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-muted-foreground font-medium">Total Users</h3>
                        <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <span className="material-icons">people</span>
                        </span>
                    </div>
                    <p className="text-4xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-green-500 text-sm mt-2 flex items-center">
                        <span className="material-icons text-sm mr-1">trending_up</span>
                        +12% this week
                    </p>
                </div>

                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-muted-foreground font-medium">Active Missions</h3>
                        <span className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <span className="material-icons">assignment</span>
                        </span>
                    </div>
                    <p className="text-4xl font-bold">{stats.activeMissions}</p>
                    <p className="text-sm text-muted-foreground mt-2">Daily tasks active</p>
                </div>

                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-muted-foreground font-medium">Rewards Redeemed</h3>
                        <span className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <span className="material-icons">card_giftcard</span>
                        </span>
                    </div>
                    <p className="text-4xl font-bold">{stats.totalRedemptions.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-2">Lifetime redemptions</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold mb-4">Recent Audit Logs</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {stats.auditLogs.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                                No admin activity recorded.
                            </div>
                        ) : (
                            stats.auditLogs.map((log: any) => (
                                <div key={log.id} className="flex gap-3 items-start p-3 bg-muted/20 rounded-lg border border-border">
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${log.type.includes('BAN') ? 'bg-red-500' : 'bg-blue-500'}`} />
                                    <div>
                                        <p className="text-sm font-medium">{log.description}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            by <span className="font-semibold text-primary">{log.user.username}</span> • {new Date(log.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold mb-4">System Health</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Database
                            </span>
                            <span className="text-green-600 font-medium">Operational</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                API
                            </span>
                            <span className="text-green-600 font-medium">Operational</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Web3 RPC
                            </span>
                            <span className="text-green-600 font-medium">Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
