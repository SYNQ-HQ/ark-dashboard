"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { getRankInfo } from "@/lib/ranks";
import { ArkRank } from "@prisma/client";

interface PromotionModalProps {
    isOpen: boolean;
    rank: ArkRank | string;
    message: string;
    onClose: () => void;
}

export default function PromotionModal({ isOpen, rank, message, onClose }: PromotionModalProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#22d3ee', '#f472b6', '#fbbf24']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#22d3ee', '#f472b6', '#fbbf24']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();
        } else {
            const timer = setTimeout(() => setVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!visible && !isOpen) return null;

    const rankInfo = getRankInfo(rank as ArkRank);

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-premium ${isOpen ? 'opacity-100 bg-black/80 backdrop-blur-md' : 'opacity-0 pointer-events-none'}`}>
            <div className={`max-w-md w-full relative bg-card border border-border shadow-premium-xl rounded-xl p-ark-xl text-center overflow-hidden transform transition-slow ${isOpen ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}>

                {/* Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/20 blur-3xl rounded-full -mt-24 pointer-events-none"></div>

                <div className="relative z-10">
                    <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-2">Promotion Ceremony</h2>
                    <h3 className="text-4xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                        {rankInfo?.label}
                    </h3>
                    <p className="text-lg text-card-foreground/80 font-serif italic mb-6">&quot;Rank {rankInfo?.label} Achieved&quot;</p>

                    <div className="py-6 border-t border-b border-border/50 mb-6">
                        <p className="text-sm text-card-foreground mb-2">{message || rankInfo?.description}</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover-elevate transition-premium shadow-premium"
                    >
                        I ACCEPT THE HONOR
                    </button>
                </div>
            </div>
        </div>
    );
}
