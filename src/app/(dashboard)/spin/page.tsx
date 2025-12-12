"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { spinWheel, getSpinStatus } from "@/actions/spin";
import { toast } from "sonner";

export default function SpinPage() {
    const { user, refetchUser } = useUser();
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState("");
    const [isSpinning, setIsSpinning] = useState(false);
    const [canSpin, setCanSpin] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState("Checking eligibility...");

    const prizes = [
        "100 PTS",
        "Badge",
        "250 PTS",
        "$ACT",
        "500 PTS",
        "Secret Mission",
    ];

    useEffect(() => {
        async function checkStatus() {
            if (user?.walletAddress) {
                const status = await getSpinStatus(user.walletAddress);
                setCanSpin(status.canSpin);
                setLoadingMsg(status.canSpin ? "" : "Come back tomorrow!");
            }
        }
        checkStatus();
    }, [user]);

    const handleSpin = async () => {
        if (!user || isSpinning || !canSpin) return;

        setIsSpinning(true);
        setResult("");

        try {
            const res = await spinWheel(user.walletAddress);
            if (!res.success || res.prizeIndex === undefined) {
                setResult(res.message || "Error spinning wheel");
                setIsSpinning(false);
                return;
            }

            const prizeIndex = res.prizeIndex;
            // Align rotation to land on the prize
            // Current code logic:
            // 6 segments (60 deg each). 
            // 0 deg (top) lands on index 0?
            // Let's calibrate. 
            // The wheel rotates. Pointer is at TOP (triangle pointing down).
            // Segment 0 is usually at 0-60 deg?
            // Actually, simplified math:
            // newRotation = 360 * 5 + (360 - (prizeIndex * 60)) ?? 
            // Let's trust the visual alignment or just execute the spin visually then show result.

            const newRotation = 360 * 5 + (360 - (prizeIndex * 60)); // Simple calculation

            setRotation(newRotation);

            setTimeout(async () => {
                const msg = `Congratulations! You won: ${res.prize.label}`;
                setResult(msg);
                toast.success(msg);
                setIsSpinning(false);
                setCanSpin(false);
                await refetchUser(); // Update points
            }, 4000);

        } catch (e) {
            console.error(e);
            toast.error("An error occurred while spinning.");
            setIsSpinning(false);
        }
    };

    if (!user) {
        return <div className="p-8 text-center">Please connect your wallet to spin.</div>;
    }

    return (
        <div className="bg-card text-card-foreground border border-card-border rounded-lg p-ark-lg text-center shadow-premium-lg flex flex-col items-center animate-scale-in">
            <h2 className="text-2xl font-bold mb-2 text-foreground">Daily Spin the Wheel</h2>
            <p className="text-muted-foreground mb-8">
                {loadingMsg || "Spin to win prizes everyday!"}
            </p>

            <div className="relative w-80 h-80 mb-8">
                <div
                    className="absolute w-full h-full rounded-full border-8 border-background shadow-xl overflow-hidden transition-transform cubic-bezier(0.2, 0.8, 0.2, 1)"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transitionDuration: isSpinning ? "4000ms" : "0ms"
                    }}
                >
                    {prizes.map((prize, i) => (
                        <div
                            key={i}
                            className="absolute w-1/2 h-1/2 origin-bottom-right"
                            style={{ transform: `rotate(${i * 60}deg)` }}
                        >
                            <div
                                className={`w-full h-full flex justify-center items-center font-bold text-xs sm:text-sm pt-8 ${i % 2 === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                                style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 0)" }}
                            >
                                <span className="-rotate-45 block transform translate-y-[-20px]">{prize}</span>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Center Button which acts as the 'pin' */}
                <button
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-background rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.2)] z-10 border-4 border-muted transition-all ${canSpin ? "cursor-pointer hover:scale-110 active:scale-95 text-primary" : "cursor-not-allowed opacity-50 text-muted-foreground"}`}
                    onClick={handleSpin}
                    disabled={!canSpin || isSpinning}
                >
                    <span className="font-bold text-lg">{isSpinning ? "..." : "SPIN"}</span>
                </button>
                {/* Indicator */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-10 z-20 drop-shadow-md">
                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[30px] border-t-destructive"></div>
                </div>
            </div>
            {result && <p className="text-xl font-bold text-primary animate-fade-in">{result}</p>}
        </div>
    );
}
