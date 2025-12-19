"use client";

import { useUser } from "@/context/UserContext";
import { ArkRank } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";

const ALL_RANKS: ArkRank[] = [
  "RECRUIT",
  "SENTINEL",
  "OPERATIVE",
  "VANGUARD",
  "CAPTAIN",
  "COMMANDER",
  "HIGH_GUARDIAN",
];

const RANK_META: Record<
  ArkRank,
  {
    tag: string;
    headline: string;
    body: string;
    attain: string[];
    color: string;
    icon: string;
  }
> = {
  RECRUIT: {
    tag: "Recruit",
    headline: "Every mission starts with enlistment.",
    body: "You have answered the call.",
    attain: ["Join ARK", "Complete first daily check-in"],
    color: "text-green-500",
    icon: "person_add",
  },
  SENTINEL: {
    tag: "Sentinel",
    headline: "Sentinels stand watch.",
    body: "They don't rush. They don't leave.",
    attain: ["Maintain a 7-day active streak"],
    color: "text-blue-500",
    icon: "shield",
  },
  OPERATIVE: {
    tag: "Operative",
    headline: "Operatives don't talk impact - they execute it.",
    body: "Deeds over words.",
    attain: ["Complete 5 missions", "Demonstrate consistent action"],
    color: "text-yellow-500",
    icon: "bolt",
  },
  VANGUARD: {
    tag: "Vanguard",
    headline: "Vanguards move first and hold the line.",
    body: "They believe before proof arrives.",
    attain: ["Hold $250+ worth of $ACT for 25 consecutive days"],
    color: "text-purple-500",
    icon: "flag",
  },
  CAPTAIN: {
    tag: "Captain",
    headline: "Captains lead by example.",
    body: "They raise others as they rise.",
    attain: [
      "Accumulate 10,000+ points",
      "Demonstrate consistent ecosystem participation",
    ],
    color: "text-cyan-500",
    icon: "star",
  },
  COMMANDER: {
    tag: "Commander",
    headline: "Commanders don't demand loyalty - they earn it.",
    body: "Their presence changes outcomes.",
    attain: [
      "Rank in top 10% of contributors",
      "Maintain 30+ consecutive active days",
    ],
    color: "text-red-500",
    icon: "military_tech",
  },
  HIGH_GUARDIAN: {
    tag: "High Guardian",
    headline: "High Guardians protect the mission itself.",
    body: "They are rare. They are remembered.",
    attain: [
      "Reach top 5% of contributors globally",
      "OR complete 50 consecutive daily check-ins",
    ],
    color: "text-orange-500",
    icon: "verified_user",
  },
};

export default function RanksPage() {
  const { user } = useUser();
  const [openSheet, setOpenSheet] = useState<ArkRank | null>(null);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );

  const currentRank = (user.arkRank || "RECRUIT") as ArkRank;
  const currentIndex = ALL_RANKS.indexOf(currentRank);
  const userPoints = user.points || 0;

  const rankReq = 10_000;
  const progress = Math.min(100, (userPoints / rankReq) * 100);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover-elevate transition-premium mb-6"
        >
          <span className="material-icons text-sm">chevron_left</span>
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold mb-2">ARK Order Ranks</h1>
        <p className="text-muted-foreground">
          An order built on kindness: organised, not random.
        </p>
      </div>

      {/* Current Rank Card */}
      <section className="mb-8 bg-card border border-border rounded-xl p-ark-lg shadow-premium">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current rank</p>
            <p className={`text-3xl font-bold ${RANK_META[currentRank].color}`}>
              {RANK_META[currentRank].tag}
            </p>
            <p className="mt-2 text-card-foreground/80">
              {RANK_META[currentRank].headline}
            </p>
          </div>
          <div className="relative h-20 w-20">
            <svg className="h-full w-full -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={2 * Math.PI * 36}
                strokeDashoffset={2 * Math.PI * 36 * (1 - progress / 100)}
                className="text-primary"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`material-icons text-xl ${RANK_META[currentRank].color}`}
              >
                {RANK_META[currentRank].icon}
              </span>
            </div>
          </div>
        </div>

        {currentRank === "CAPTAIN" && (
          <div className="mt-6">
            <div className="flex items-end justify-between text-sm mb-2">
              <p className="text-muted-foreground">
                {userPoints.toLocaleString()} pts
              </p>
              <p className="text-muted-foreground">
                {rankReq.toLocaleString()} pts
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-premium"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Rank List */}
      <section className="space-y-3">
        {ALL_RANKS.map((rank, idx) => {
          const meta = RANK_META[rank];
          const isCurrent = rank === currentRank;
          const isUnlocked = idx <= currentIndex;

          return (
            <button
              key={rank}
              onClick={() => setOpenSheet(rank)}
              className={`w-full rounded-xl p-ark-lg text-left transition-premium hover-elevate ${
                isCurrent
                  ? "bg-card border border-primary shadow-premium"
                  : "bg-card border border-border"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full ${
                    meta.color
                  } bg-muted ${isUnlocked ? "" : "opacity-40"}`}
                >
                  <span className="material-icons text-2xl">
                    {isUnlocked ? meta.icon : "lock"}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-card-foreground">
                    {meta.tag}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {meta.headline}
                  </p>
                </div>

                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="material-icons text-sm">
                    {isCurrent ? "location_on" : "chevron_right"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* Rank Detail Sheet */}
      {openSheet && (
        <RankSheet rank={openSheet} onClose={() => setOpenSheet(null)} />
      )}
    </div>
  );
}

function RankSheet({ rank, onClose }: { rank: ArkRank; onClose: () => void }) {
  const meta = RANK_META[rank];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-card border border-border rounded-xl shadow-premium-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-muted" />

        <div className="p-ark-lg">
          {/* Emblem + Tag */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${meta.color} bg-muted`}
            >
              <span className="material-icons text-3xl">{meta.icon}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{meta.tag}</p>
              <p className="text-2xl font-bold text-card-foreground">
                {rank.charAt(0) + rank.slice(1).toLowerCase().replace("_", " ")}
              </p>
            </div>
          </div>

          {/* Meaning */}
          <p className="text-card-foreground mb-2">{meta.headline}</p>
          <p className="text-sm text-muted-foreground mb-6">{meta.body}</p>

          {/* Attain List */}
          <p className="text-sm font-semibold text-card-foreground mb-2">
            How to attain
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground mb-6">
            {meta.attain.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover-elevate transition-premium shadow-premium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
