"use client";

export default function RippleBridgeCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-ark-lg shadow-premium hover-elevate transition-premium relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              <span className="material-icons text-purple-400">waves</span>
              Ripple Bridge
            </h3>
            <p className="text-sm text-muted-foreground">
              Stream your impact in real-time
            </p>
          </div>
          <span className="material-icons text-purple-400 text-3xl animate-pulse">
            schedule
          </span>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-4">
          <p className="text-sm text-purple-400 font-medium mb-2">
            🚀 Coming Soon
          </p>
          <p className="text-xs text-muted-foreground">
            Ripple Bridge will allow you to stream your ARK activities to
            platforms like Twitch, YouTube, and Discord in real-time.
          </p>
        </div>

        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-bold text-card-foreground">
              What to expect:
            </span>{" "}
            Live check-in notifications, mission completions, rank promotions,
            and more-all streamed to your audience.
          </p>
        </div>
      </div>
    </div>
  );
}
