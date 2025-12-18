'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { logActivity } from './activity'
import { ArkRank } from '@prisma/client'

// Rank Order for comparison
const RANK_ORDER: Record<string, number> = {
    RECRUIT: 0,
    SENTINEL: 1,
    OPERATIVE: 2,
    VANGUARD: 3,
    CAPTAIN: 4,
    COMMANDER: 5,
    HIGH_GUARDIAN: 6
};

// Check if user qualifies for a rank promotion
export async function checkRankPromotion(userId: string) {
    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            include: { streak: true, activities: true }
        });

        if (!user) return { success: false };

        const currentRankValue = RANK_ORDER[user.arkRank as string] || 0;
        let newRank: ArkRank | null = null;
        let promotionMsg = "";

        // 1. RECRUIT -> SENTINEL
        // Criteria: 7-day streak
        if (currentRankValue < 1) {
            if ((user.streak?.currentStreak || 0) >= 7) {
                newRank = 'SENTINEL';
                promotionMsg = "Promoted to Sentinel: 7-day streak achieved.";
            }
        }

        // 2. SENTINEL -> OPERATIVE
        // Criteria: 5+ missions completed
        if (currentRankValue < 2) {
            const missionCount = await db.userMission.count({
                where: { userId, status: 'COMPLETED' }
            });

            if (missionCount >= 5) {
                newRank = 'OPERATIVE';
                promotionMsg = "Promoted to Operative: 5+ missions completed.";
            }
        }

        // 3. OPERATIVE -> VANGUARD
        // Criteria: Hold $250+ for 25 days.
        if (currentRankValue < 3) {
            if (user.holdingStartedAt) {
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - user.holdingStartedAt.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays >= 25 && user.isEligible) {
                    newRank = 'VANGUARD';
                    promotionMsg = "Promoted to Vanguard: Held position for 25+ days.";
                }
            }
        }

        // 4. VANGUARD -> CAPTAIN
        // Criteria: 10,000 total points
        if (currentRankValue < 4) {
            if (user.points >= 10000) {
                newRank = 'CAPTAIN';
                promotionMsg = "Promoted to Captain: 10,000+ points earned.";
            }
        }

        // 5. CAPTAIN -> COMMANDER
        // Criteria: Top 10% globally AND 30+ day streak
        if (currentRankValue < 5) {
            if ((user.streak?.currentStreak || 0) >= 30) {
                const totalUsers = await db.user.count();
                const usersWithMorePoints = await db.user.count({
                    where: { points: { gt: user.points } }
                });

                const percentile = (usersWithMorePoints / totalUsers) * 100;

                if (percentile <= 10) {
                    newRank = 'COMMANDER';
                    promotionMsg = "Promoted to Commander: Top 10% global rank and 30-day streak.";
                }
            }
        }

        // 6. COMMANDER -> HIGH_GUARDIAN
        // Criteria: Top 5% globally OR 50-day streak
        if (currentRankValue < 6) {
            let qualified = false;

            // A. 50-day streak
            if ((user.streak?.currentStreak || 0) >= 50) qualified = true;

            // B. Top 5%
            if (!qualified) {
                const totalUsers = await db.user.count();
                const usersWithMorePoints = await db.user.count({
                    where: { points: { gt: user.points } }
                });
                const percentile = (usersWithMorePoints / totalUsers) * 100;
                if (percentile <= 5) qualified = true;
            }

            if (qualified) {
                newRank = 'HIGH_GUARDIAN';
                promotionMsg = "Promoted to High Guardian: A legacy established.";
            }
        }

        // Apply Promotion if found
        if (newRank) {
            if (RANK_ORDER[newRank] > currentRankValue) {
                const now = new Date();

                await db.user.update({
                    where: { id: userId },
                    data: { arkRank: newRank }
                });

                await db.rankHistory.create({
                    data: {
                        userId,
                        rank: newRank,
                        promotedAt: now
                    }
                });

                await logActivity(userId, "RANK_PROMOTION", promotionMsg);

                revalidatePath('/');
                return { success: true, promoted: true, newRank, message: promotionMsg };
            }
        }

        return { success: true, promoted: false };

    } catch (error) {
        console.error("Rank check error:", error);
        return { success: false, error: "Failed to check rank" };
    }
}
