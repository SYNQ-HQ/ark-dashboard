import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import UserActions from "@/components/admin/UserActions";

// Ensure dynamic rendering so we see fresh data
export const dynamic = 'force-dynamic';

async function getUsers() {
    'use server';
    return await db.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: {
                    missions: true,
                    redemptions: true
                }
            }
        },
        take: 50 // Pagination later
    });
}

export default async function AdminUsersPage() {
    const users = await getUsers();

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">User Management</h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-muted-foreground">User</th>
                            <th className="px-6 py-4 font-semibold text-muted-foreground">Role</th>
                            <th className="px-6 py-4 font-semibold text-muted-foreground">Status</th>
                            <th className="px-6 py-4 font-semibold text-muted-foreground">Points</th>
                            <th className="px-6 py-4 font-semibold text-muted-foreground">Stats</th>
                            <th className="px-6 py-4 font-semibold text-muted-foreground">Joined</th>
                            <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {user.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{user.username || 'Anonymous'}</p>
                                            <p className="text-xs text-muted-foreground font-mono truncate w-24">{user.walletAddress}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isBanned ? 'bg-red-500 text-white' : 'bg-green-100 text-green-600'}`}>
                                        {user.isBanned ? 'BANNED' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono">
                                    {user.points.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-xs text-muted-foreground">
                                    <div className="flex gap-3">
                                        <span title="Missions Completed">✓ {user._count.missions}</span>
                                        <span title="Rewards Redeemed">🎁 {user._count.redemptions}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <UserActions targetUser={user} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
