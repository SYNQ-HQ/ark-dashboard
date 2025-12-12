import { db } from './src/lib/db';
import { createReward } from './src/actions/rewards';
import { toggleUserBan } from './src/actions/user';
import { getAdminActivity } from './src/actions/activity';

async function main() {
    console.log("Starting Admin Audit Log Verification...");

    // 1. Setup Test Admin & User
    const adminWallet = "0xAdmin_" + Date.now();
    const admin = await db.user.create({
        data: {
            walletAddress: adminWallet,
            username: "AdminTester_" + Date.now(),
            role: 'ADMIN'
        }
    });

    const userWallet = "0xUser_" + Date.now();
    const user = await db.user.create({
        data: {
            walletAddress: userWallet,
            username: "TargetUser_" + Date.now(),
            role: 'USER'
        }
    });

    console.log(`Created Admin: ${admin.username} (${admin.id})`);
    console.log(`Created User: ${user.username} (${user.id})`);

    // 2. Test Create Reward (As Admin)
    console.log("Testing Create Reward...");
    const formData = new FormData();
    formData.append('adminId', admin.id); // Valid Admin
    formData.append('name', 'Audit Test Reward');
    formData.append('description', 'Test Description');
    formData.append('cost', '100');

    const rewardRes = await createReward(formData);
    if (!rewardRes.success) {
        console.error("Create Reward Failed:", rewardRes.message);
    } else {
        console.log("Reward Created Successfully.");
    }

    // 3. Test Ban User (As Admin)
    console.log("Testing Ban User...");
    const banRes = await toggleUserBan(user.id, admin.id);
    if (!banRes.success) {
        console.error("Ban User Failed:", banRes.message);
    } else {
        console.log("User Banned Successfully.");
    }

    // 4. Test Unauthoried Access (As User)
    console.log("Testing Unauthorized Access...");
    const fakeForm = new FormData();
    fakeForm.append('adminId', user.id); // Not Admin
    const failRes = await createReward(fakeForm);
    if (failRes.success) console.error("FAILURE: Non-admin created reward!");
    else console.log("SUCCESS: Non-admin blocked.");

    // 5. Verify Logs
    console.log("Fetching Audit Logs...");
    const logs = await getAdminActivity(10);

    let foundRewardLog = false;
    let foundBanLog = false;

    logs.forEach(log => {
        console.log(`[${log.type}] ${log.description} by ${log.user?.username}`);
        if (log.type === 'ADMIN_REWARD_CREATE' && log.description.includes('Audit Test Reward')) foundRewardLog = true;
        if (log.type === 'ADMIN_USER_BAN' && log.description.includes(user.username)) foundBanLog = true;
    });

    if (foundRewardLog && foundBanLog) {
        console.log("SUCCESS: All expected audit logs found.");
    } else {
        console.error("FAILURE: Missing audit logs.");
    }

    // Cleanup
    await db.userActivity.deleteMany({ where: { userId: admin.id } });
    await db.reward.deleteMany({ where: { name: 'Audit Test Reward' } });
    await db.user.delete({ where: { id: admin.id } });
    await db.user.delete({ where: { id: user.id } });
    console.log("Cleanup complete.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await db.$disconnect();
    });
