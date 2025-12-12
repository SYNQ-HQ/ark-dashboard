"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useUser } from "@/context/UserContext";
import {
    DashboardIcon,
    MissionsIcon,
    LeaderboardIcon,
    RewardsIcon,
    ImpactIcon,
    EligibilityIcon,
    SpinWheelIcon,
    ProfileIcon,
} from "./Icons";

const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { id: "missions", label: "Missions", icon: <MissionsIcon />, path: "/missions" },
    { id: "leaderboard", label: "Leaderboard", icon: <LeaderboardIcon />, path: "/leaderboard" },
    { id: "rewards", label: "Rewards", icon: <RewardsIcon />, path: "/rewards" },
    { id: "impact", label: "Impact", icon: <ImpactIcon />, path: "/impact" },
    { id: "eligibility", label: "Eligibility", icon: <EligibilityIcon />, path: "/eligibility" },
    { id: "spin", label: "Spin Wheel", icon: <SpinWheelIcon />, path: "/spin" },
    { id: "profile", label: "Profile", icon: <ProfileIcon />, path: "/profile" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useUser();

    // Determine active view based on pathname
    const activeItem = navItems.find((item) => {
        if (item.path === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(item.path);
    }) || navItems[0];

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
            {/* Sidebar */}
            <nav className="w-20 hover:w-64 group transition-all duration-500 ease-in-out bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col py-6 z-50 shadow-xl">
                <div className="flex items-center justify-center h-16 mb-6">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold text-xl">A</div>
                </div>

                <div className="flex-1 space-y-2 px-3">
                    {navItems.map((item) => {
                        const isActive = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.id}
                                href={item.path}
                                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group-hover:justify-start ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "hover:bg-sidebar-accent/50 text-muted-foreground hover:text-foreground"}`}
                            >
                                <div className="min-w-[24px] flex justify-center">
                                    {item.icon}
                                </div>
                                <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-medium text-sm">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-sidebar-border opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                    <span className="material-icons text-muted-foreground">person</span>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-semibold truncate">{user.username}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</p>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-center w-full text-muted-foreground">Connect Wallet</p>
                        )}
                    </div>
                </div>
            </nav>

            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Top Header */}
                <header className="h-20 flex items-center justify-between px-8 bg-background/80 backdrop-blur-md border-b border-border z-40 sticky top-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {activeItem.label}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {user ? `Welcome back, ${user.username}` : "Please connect your wallet"}
                        </p>
                    </div>
                    <div className="flex items-center space-x-6">
                        {user && (
                            <div className="bg-muted/50 rounded-full px-4 py-2 flex items-center gap-2 border border-border">
                                <span className="text-sm font-medium">{user.points.toLocaleString()} PTS</span>
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            </div>
                        )}
                        <div className="flex items-center">
                            <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="icon" />
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-8 overflow-y-auto scrollbar-hidden">
                    <div className="max-w-7xl mx-auto pb-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
