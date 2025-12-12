"use client";

import { useUser } from "@/context/UserContext";
import LandingPage from "@/components/LandingPage";
import AppLayout from "@/components/AppLayout";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground animate-pulse">Initializing ARK...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LandingPage />;
    }

    return (
        <>
            {children}
        </>
    );
}
