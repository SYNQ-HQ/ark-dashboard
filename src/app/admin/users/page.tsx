"use client";

import { fetchUsers, updateUserRole, toggleUserBanAction } from "@/actions/user";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AdminUsersPage() {
    const { user: currentUser } = useUser();
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        const data = await fetchUsers();
        setUsers(data);
    }

    async function handleRoleChange(userId: string, newRole: 'USER' | 'ADMIN') {
        if (!currentUser) return;

        // Optimistic update
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setUpdating(userId);

        const res = await updateUserRole(userId, newRole, currentUser.id);

        setUpdating(null);
        if (res.success) {
            toast.success("User role updated");
        } else {
            // Revert
            toast.error(res.message);
            loadUsers(); // Reload to get true state
        }
    }

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.walletAddress.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">User Management</h2>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border">
                    <input
                        placeholder="Search by username or wallet..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full max-w-sm px-3 py-2 rounded-lg border border-border bg-background"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Points</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                                {u.profileImageUrl ? (
                                                    <Image src={u.profileImageUrl} alt={u.username} width={200} height={200} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-primary">{u.username[0].toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">{u.username}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{u.walletAddress.slice(0, 6)}...{u.walletAddress.slice(-4)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value as 'USER' | 'ADMIN')}
                                                disabled={u.id === currentUser?.id || updating === u.id}
                                                className={`appearance-none bg-transparent border border-border rounded px-3 py-1 pr-8 text-xs cursor-pointer hover:border-primary transition-colors focus:ring-2 focus:ring-primary/20 outline-none ${updating === u.id ? 'opacity-50' : ''}`}
                                            >
                                                <option value="USER">User</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono">{u.points.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        {u.isBanned ? (
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">Banned</span>
                                        ) : (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">Active</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Ban/Unban Button */}
                                            {currentUser && u.id !== currentUser.id ? (
                                                <form action={async (formData) => {
                                                    const res = await toggleUserBanAction(formData);
                                                    if (res.success) {
                                                        toast.success(u.isBanned ? "User unbanned" : "User banned");
                                                        loadUsers();
                                                    } else {
                                                        toast.error(res.message);
                                                    }
                                                }}>
                                                    <input type="hidden" name="userId" value={u.id} />
                                                    <input type="hidden" name="adminId" value={currentUser.id} />
                                                    <button
                                                        type="submit"
                                                        className={`text-xs px-3 py-1.5 rounded font-medium transition-colors border ${u.isBanned
                                                            ? 'bg-background border-border text-foreground hover:bg-muted'
                                                            : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                                            }`}
                                                    >
                                                        {u.isBanned ? 'Unban' : 'Ban'}
                                                    </button>
                                                </form>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic px-3 py-1.5">You</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
