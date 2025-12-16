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
      const extraSpins = 5;
      const newRotation = rotation + 360 * extraSpins + (360 - prizeIndex * 60);
      setRotation(newRotation);

      setTimeout(async () => {
        const msg = `Congratulations! You won: ${res.prize.label}`;
        setResult(msg);
        toast.success(msg);
        setIsSpinning(false);
        setCanSpin(false);
        await refetchUser();
      }, 4000);
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while spinning.");
      setIsSpinning(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">Please connect your wallet to spin.</div>
    );
  }

  return (
    <>
      <style jsx>{`
        .slice-path {
          stroke: none;
          vector-effect: non-scaling-stroke;
        }
      `}</style>
      <div className="bg-card text-card-foreground border border-card-border rounded-lg p-8 text-center shadow-premium-lg flex flex-col items-center animate-scale-in">
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          Daily Spin the Wheel
        </h2>
        <p className="text-muted-foreground mb-8">
          {loadingMsg || "Spin to win prizes everyday!"}
        </p>

        {/* ----------  WHEEL  ---------- */}
        <div className="relative w-80 h-80 mb-8">
          {/* rotating face + labels */}
          <div
            className="absolute inset-0 rounded-full border-8 border-background shadow-xl overflow-hidden transition-transform duration-[4000ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* circular-sector slices */}
            {prizes.map((_, i) => {
              const start = i * 60 - 90;
              const end = start + 60;
              const rInner = 0;
              const rOuter = 160;
              const α1 = (start * Math.PI) / 180;
              const α2 = (end * Math.PI) / 180;

              const x1 = rInner * Math.cos(α1);
              const y1 = rInner * Math.sin(α1);
              const x2 = rOuter * Math.cos(α1);
              const y2 = rOuter * Math.sin(α1);
              const x3 = rOuter * Math.cos(α2);
              const y3 = rOuter * Math.sin(α2);
              const x4 = rInner * Math.cos(α2);
              const y4 = rInner * Math.sin(α2);

              const largeArc = end - start > 180 ? 1 : 0;
              const d = [
                `M ${x1} ${y1}`,
                `L ${x2} ${y2}`,
                `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x3} ${y3}`,
                `L ${x4} ${y4}`,
                "Z",
              ].join(" ");

              return (
                <svg
                  key={`slice-${i}`}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="-160 -160 320 320"
                >
                  <path
                    className={`slice-path ${i % 2 ? "fill-muted" : "fill-primary"}`}
                    d={d}
                  />
                </svg>
              );
            })}

            {/* labels spin with the wheel */}
            {prizes.map((prize, i) => {
              const mid = i * 60 + 30;
              const rad = ((mid - 90) * Math.PI) / 180;
              const x = 50 + 28 * Math.cos(rad);
              const y = 50 + 28 * Math.sin(rad);
              return (
                <span
                  key={`label-${i}`}
                  className="absolute text-background text-xs sm:text-sm font-bold select-none"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: `translate(-50%,-50%) rotate(${mid}deg)`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {prize}
                </span>
              );
            })}
          </div>

          {/* centre button – fixed */}
          <button
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-20 h-20 bg-background rounded-full flex items-center justify-center
                        shadow-lg z-10 border-4 border-muted transition
                        ${
                          canSpin && !isSpinning
                            ? "cursor-pointer hover:scale-110 active:scale-95 text-primary"
                            : "cursor-not-allowed opacity-50 text-muted-foreground"
                        }`}
            onClick={handleSpin}
            disabled={!canSpin || isSpinning}
          >
            <span className="font-bold text-lg">
              {isSpinning ? "..." : "SPIN"}
            </span>
          </button>

          {/* pointer – fixed */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[30px] border-l-transparent border-r-transparent border-t-destructive" />
          </div>
        </div>

        {result && (
          <p className="text-xl font-bold text-primary animate-fade-in">
            {result}
          </p>
        )}
      </div>
    </>
  );
}
