"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useUser } from "@/context/UserContext";
import {
    DashboardIcon,
    MissionsIcon,
    LeaderboardIcon,
    RanksIcon,
    RewardsIcon,
    ImpactIcon,
    EligibilityIcon,
    SpinWheelIcon,
    ProfileIcon,
} from "./Icons";
import Image from "next/image";
import StreakCounter from "./dashboard/StreakCounter";
import OathModal from "./onboarding/OathModal";
import { getRankInfo } from "@/lib/ranks";
import { ArkRank } from "@prisma/client";
import { useState } from "react";

const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { id: "missions", label: "Missions", icon: <MissionsIcon />, path: "/missions" },
    { id: "leaderboard", label: "Leaderboard", icon: <LeaderboardIcon />, path: "/leaderboard" },
    { id: "ranks", label: "Ranks", icon: <RanksIcon />, path: "/ranks" },
    { id: "rewards", label: "Rewards", icon: <RewardsIcon />, path: "/rewards" },
    { id: "impact", label: "Impact", icon: <ImpactIcon />, path: "/impact" },
    { id: "eligibility", label: "Eligibility", icon: <EligibilityIcon />, path: "/eligibility" },
    { id: "spin", label: "Spin Wheel", icon: <SpinWheelIcon />, path: "/spin" },
    { id: "profile", label: "Profile", icon: <ProfileIcon />, path: "/profile" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useUser();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const activeItem = navItems.find((item) => {
        if (item.path === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(item.path);
    }) || navItems[0];

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
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
                        alt={"logo"}
                        width={100} height={50}
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                </div>

                <StreakCounter />

                <div className="flex-1 space-y-2 px-3 overflow-y-auto scrollbar-hidden">
                    {navItems.map((item) => {
                        const isActive = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.id}
                                href={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 justify-start ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "hover:bg-sidebar-accent/50 text-muted-foreground hover:text-foreground"}`}
                            >
                                <div className="min-w-[24px] flex justify-center">
                                    {item.icon}
                                </div>
                                <span className="ml-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-medium text-sm">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {user && (
                    <div className="mt-auto px-3 pt-4 border-t border-sidebar-border">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/30">
                            <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
                                <span className="text-sidebar-primary-foreground font-bold text-sm">
                                    {user.username?.charAt(0).toUpperCase() || "A"}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-sm font-medium truncate text-sidebar-foreground">
                                    {user.username || "Anonymous"}
                                </p>
                                <p className={`text-[10px] font-bold uppercase tracking-wider ${getRankInfo(user.arkRank as ArkRank).color}`}>
                                    {getRankInfo(user.arkRank as ArkRank).label}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
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
                            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground">
                                {activeItem.label}
                            </h1>
                            <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">
                                {user ? `Welcome back, ${user.username}` : "Please connect your wallet"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 lg:space-x-6">
                        {user && (
                            <div className="bg-muted/50 rounded-full px-3 lg:px-4 py-2 flex items-center gap-2 border border-border">
                                <span className="text-xs lg:text-sm font-medium">{user.points.toLocaleString()} PTS</span>
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            </div>
                        )}
                        <div className="flex items-center">
                            <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="icon" />
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
            <OathModal isOpen={!!user && !user.oathAcceptedAt} onClose={() => { }} />
        </div>
    );
}
