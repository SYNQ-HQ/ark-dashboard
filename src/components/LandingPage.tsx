"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center relative overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px]" />
            </div>

            <div className="z-10 text-center max-w-2xl px-6 animate-slide-up">
                <div className="mb-8 flex justify-center">
                    {/* <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/50 rounded-2xl flex items-center justify-center shadow-premium-lg rotate-3 hover:rotate-6 transition-transform duration-500"> */}
                    <div className="w-96 h-40 bg-transparent rounded-2xl flex items-center justify-center rotate-3 hover:rotate-6 transition-transform duration-500">
                        {/* <span className="text-4xl font-black text-white">A</span> */}
                        <Image src={"/logo.png"} alt="Ark Logo" loading="eager" width={100} height={100} className="w-full h-full object-contain object-center" />
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent drop-shadow-sm">
                    {/* ARK <br /> DASHBOARD */}
                    DASHBOARD
                </h1>

                <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                    The next-generation loyalty and rewards platform for the ARK Ecosystem.
                    Connect your wallet to track missions, earn points, and claim rewards.
                </p>

                <div className="flex flex-col items-center gap-4">
                    <div className="transform hover:scale-105 transition-transform duration-200">
                        <ConnectButton label="Enter Dashboard" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 opacity-70">
                        Supports BNB Smart Chain
                    </p>
                </div>
            </div>

            {/* Footer / Credits */}
            <div className="absolute bottom-8 text-center w-full z-10 opacity-50 text-sm">
                <p>&copy; {new Date().getFullYear()} <a href="https://poweredbysynq.com">Synq Labs</a>. All rights reserved.</p>
            </div>
        </div>
    );
}
