"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import { DashboardIcon, MissionsIcon, RewardsIcon, ProfileIcon, CheckCircleIcon, RanksIcon } from "@/components/Icons";
import Image from "next/image";

const adminNavItems = [
    { id: "dashboard", label: "Overview", icon: <DashboardIcon />, path: "/admin" },
    { id: "users", label: "Users", icon: <ProfileIcon />, path: "/admin/users" },
    { id: "ranks", label: "Ranks", icon: <RanksIcon />, path: "/admin/ranks" },
    { id: "missions", label: "Missions", icon: <MissionsIcon />, path: "/admin/missions" },
    { id: "rewards", label: "Rewards", icon: <RewardsIcon />, path: "/admin/rewards" },
    { id: "impact", label: "Impact", icon: <MissionsIcon />, path: "/admin/impact" },
    { id: "badges", label: "Badges", icon: <CheckCircleIcon />, path: "/admin/badges" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AdminGuard>
            <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
                {/* Admin Sidebar */}
                <nav className="w-64 bg-slate-900 text-slate-100 border-r border-slate-800 flex flex-col py-6">
                    <div className="flex items-center justify-center h-16 mb-6">
                        {/* <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-500/20">
                            S
                        </div> */}
                        <Image
                            src="/logo.png"
                            alt={"logo"} width={100} height={50}
                            // fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <span className="ml-3 font-bold text-lg tracking-wider">ADMIN</span>
                    </div>

                    <div className="flex-1 space-y-1 px-3">
                        {adminNavItems.map((item) => {
                            const isActive = item.path === "/admin" ? pathname === "/admin" : pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.id}
                                    href={item.path}
                                    className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${isActive ? "bg-red-600 shadow-md shadow-red-600/20 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                                >
                                    <div className="min-w-[24px] flex justify-center">
                                        {item.icon}
                                    </div>
                                    <span className="ml-4 font-medium text-sm">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="px-6 py-4">
                        <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-2">
                            <span className="material-icons text-sm">arrow_back</span>
                            Back to App
                        </Link>
                    </div>
                </nav>

                <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 dark:bg-black/20">
                    <header className="h-16 flex items-center justify-between px-8 bg-background border-b border-border">
                        <h1 className="text-xl font-bold tracking-tight">Admin Console</h1>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold border border-red-200">
                                A
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 p-8 overflow-y-auto">
                        <div className="max-w-6xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AdminGuard>
    );
}
