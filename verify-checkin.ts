import { db } from './src/lib/db';
import { claimDailyCheckIn } from './src/actions/user';

async function main() {
    console.log("Starting Check-in Logic Verification...");

    // 1. Setup Test User
    const testWallet = "0xCheckInTester_" + Date.now();
    const user = await db.user.create({
        data: {
            walletAddress: testWallet,
            username: "CheckInTest_" + Date.now(),
            role: 'USER'
        }
    });
    console.log(`Created test user: ${user.walletAddress}`);

    // 2. First Claim (Should Success)
    console.log("Attempting 1st Claim...");
    const claim1 = await claimDailyCheckIn(testWallet);
    console.log(`Claim 1 Result: ${claim1.success}`);

    if (!claim1.success) {
        console.error("Critical: First claim failed!", claim1.message);
        return;
    }

    // 3. Second Claim (Should Fail)
    console.log("Attempting 2nd Claim (Immediate)...");
    const claim2 = await claimDailyCheckIn(testWallet);
    console.log(`Claim 2 Result: ${claim2.success} - ${claim2.message}`);

    if (claim2.success) {
        console.error("FAILURE: User was able to claim twice in same day!");
    } else {
        console.log("SUCCESS: Second claim blocked correctly.");
    }

    // 4. Verify Streak Value
    const streak = await db.streak.findUnique({ where: { userId: user.id } });
    console.log(`Current Streak: ${streak?.currentStreak} (Expected 1)`);

    // Cleanup
    await db.userActivity.deleteMany({ where: { userId: user.id } });
    await db.streak.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });
    console.log("Cleanup complete.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await db.$disconnect();
    });
