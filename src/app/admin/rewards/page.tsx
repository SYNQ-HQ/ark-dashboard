import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import CreateRewardForm from "@/components/admin/CreateRewardForm";

async function getRewards() {
    'use server';
    return await db.reward.findMany({
        orderBy: { cost: 'asc' },
        include: { _count: { select: { redemptions: true } } }
    });
}

// Simple logic for restocking
async function restockReward(formData: FormData) {
    'use server';
    const rewardId = formData.get('rewardId') as string;
    const amount = parseInt(formData.get('amount') as string);

    await db.reward.update({
        where: { id: rewardId },
        data: { stock: { increment: amount } }
    });

    revalidatePath('/admin/rewards');
}

export default async function AdminRewardsPage() {
    const rewards = await getRewards();

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Incentives & Rewards</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rewards List */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min">
                    {rewards.map((reward) => (
                        <div key={reward.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                            <div className="bg-muted h-32 flex items-center justify-center">
                                <span className="material-icons text-4xl text-muted-foreground">card_giftcard</span>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg">{reward.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>

                                <div className="flex items-center justify-between text-sm mb-4">
                                    <span className="font-mono font-bold text-primary">{reward.cost.toLocaleString()} PTS</span>
                                    <span className="px-2 py-1 bg-muted rounded text-xs">
                                        {reward.stock !== null ? `${reward.stock} in stock` : '∞ stock'}
                                    </span>
                                </div>

                                <div className="mt-auto border-t border-border pt-4 flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">{reward._count.redemptions} redeemed</span>

                                    <form action={restockReward} className="flex items-center gap-2">
                                        <input type="hidden" name="rewardId" value={reward.id} />
                                        <input type="hidden" name="amount" value="10" />
                                        <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                                            +10 Stock
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Form */}
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm h-fit sticky top-6">
                    <h3 className="font-bold text-lg mb-6">Add New Reward</h3>
                    <CreateRewardForm />
                </div>
            </div>
        </div>
    );
}
