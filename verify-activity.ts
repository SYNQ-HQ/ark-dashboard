import { db } from './src/lib/db';
import { logActivity, getRecentActivity } from './src/actions/activity';
import { claimDailyCheckIn } from './src/actions/user';

async function main() {
    console.log("Starting Activity Log Verification...");

    // 1. Setup Test User
    const testWallet = "0xTestActivity_" + Date.now();
    const user = await db.user.create({
        data: {
            walletAddress: testWallet,
            username: "ActivityTester_" + Date.now(),
            role: 'USER'
        }
    });

    console.log(`Created test user: ${user.id}`);

    // 2. Log manual activity
    console.log("Logging manual activity...");
    await logActivity(user.id, "TEST_EVENT", "This is a test event");

    // 3. Test Claim Check-in (Should auto-log)
    console.log("Testing Claim Daily Check-in...");
    const claimRes = await claimDailyCheckIn(testWallet);
    console.log(`Claim Result: ${claimRes.success}`);

    if (claimRes.success) {
        console.log("Claim successful, checking logs...");
    } else {
        console.error("Claim failed:", claimRes.message);
    }

    // 4. Fetch Activity
    console.log("Fetching recent activity...");
    const logs = await getRecentActivity(user.id);

    console.log(`Found ${logs.length} logs:`);
    logs.forEach(log => {
        console.log(`- [${log.type}] ${log.description} (${log.createdAt})`);
    });

    if (logs.length >= 2) {
        console.log("SUCCESS: Expected logs found.");
    } else {
        console.error("FAILURE: Missing logs.");
    }

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
