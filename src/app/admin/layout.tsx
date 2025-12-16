"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import { DashboardIcon, MissionsIcon, RewardsIcon, ProfileIcon, CheckCircleIcon, RanksIcon } from "@/components/Icons";
import Image from "next/image";
import { useState } from "react";

const adminNavItems = [
    { id: "overview", label: "Overview", icon: <DashboardIcon />, path: "/admin" },
    { id: "users", label: "Users", icon: <ProfileIcon />, path: "/admin/users" },
    { id: "ranks", label: "Ranks", icon: <RanksIcon />, path: "/admin/ranks" },
    { id: "missions", label: "Missions", icon: <MissionsIcon />, path: "/admin/missions" },
    { id: "rewards", label: "Rewards", icon: <RewardsIcon />, path: "/admin/rewards" },
    { id: "impact", label: "Impact", icon: <MissionsIcon />, path: "/admin/impact" },
    { id: "badges", label: "Badges", icon: <CheckCircleIcon />, path: "/admin/badges" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const activeItem = adminNavItems.find((item) => {
        if (item.path === "/admin") {
            return pathname === "/admin";
        }
        return pathname.startsWith(item.path);
    }) || adminNavItems[0];

    return (
        <AdminGuard>
            <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* Admin Sidebar */}
                <nav className={`
                    fixed lg:relative inset-y-0 left-0 z-50
                    w-64 lg:w-20 lg:hover:w-64 
                    group transition-all duration-500 ease-in-out 
                    bg-sidebar text-sidebar-foreground border-r border-sidebar-border 
                    flex flex-col py-6 shadow-xl
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="flex items-center justify-center h-16 mb-6">
                        <Image
                            src="/logo.png"
                            alt="ARK Admin"
                            width={100}
                            height={50}
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>

                    {/* Admin Badge */}
                    <div className="mx-3 mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <p className="text-xs font-bold text-red-400 text-center lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            ADMIN PANEL
                        </p>
                    </div>

                    <div className="flex-1 space-y-2 px-3 overflow-y-auto scrollbar-hidden">
                        {adminNavItems.map((item) => {
                            const isActive = item.path === "/admin" ? pathname === "/admin" : pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.id}
                                    href={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 justify-start ${isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                        : "hover:bg-sidebar-accent/50 text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <div className="min-w-[24px] flex justify-center">
                                        {item.icon}
                                    </div>
                                    <span className="ml-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-medium text-sm">
                                        {item.label}
                                    </span>
                                </Link>

                                // <Link
                                //     key={item.id}
                                //     href={item.path}
                                //     onClick={() => setMobileMenuOpen(false)}
                                //     className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${isActive ? "bg-red-600 shadow-md shadow-red-600/20 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                                // >
                                //     <div className="min-w-[24px] flex justify-center">
                                //         {item.icon}
                                //     </div>
                                //     <span className="ml-4 font-medium text-sm">
                                //         {item.label}
                                //     </span>
                                // </Link>
                            );
                        })}
                    </div>

                    {/* Back to Dashboard */}
                    <div className="mt-auto px-3 pt-4 border-t border-sidebar-border">
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full flex items-center p-3 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-200 justify-start text-muted-foreground hover:text-foreground"
                        >
                            <div className="min-w-[24px] flex justify-center">
                                <span className="material-icons text-sm">arrow_back</span>
                            </div>
                            <span className="ml-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-medium text-sm">
                                Back to Dashboard
                            </span>
                        </Link>
                    </div>
                </nav>

                <div className="flex-1 flex flex-col relative overflow-hidden">
                    {/* Top Header */}
                    <header className="h-20 flex items-center justify-between px-4 lg:px-8 bg-background/80 backdrop-blur-md border-b border-border z-40 sticky top-0">
                        <div className="flex items-center gap-4">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 rounded-lg hover-elevate transition-premium"
                                aria-label="Toggle menu"
                            >
                                <span className="material-icons">menu</span>
                            </button>

                            <div>
                                <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    <span className="material-icons text-red-500">admin_panel_settings</span>
                                    {activeItem.label}
                                </h1>
                                <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">
                                    Admin Control Panel
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* Main Content Area */}
                    <main className="flex-1 p-4 lg:p-8 overflow-y-auto scrollbar-hidden">
                        <div className="max-w-7xl mx-auto pb-10">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AdminGuard>
    );
}

