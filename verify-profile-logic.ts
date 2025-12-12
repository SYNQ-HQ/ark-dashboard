import { db } from './src/lib/db';
import { checkUsernameAvailability, updateUsername } from './src/actions/user';

async function main() {
    console.log("Starting Profile Logic Verification...");

    // 1. Setup Test User
    const testWallet = "0xTestProfileUser_" + Date.now();
    const initialName = "User-" + Date.now();

    const user = await db.user.create({
        data: {
            walletAddress: testWallet,
            username: initialName,
            role: 'USER'
        }
    });

    console.log(`Created test user: ${user.username} (${user.walletAddress})`);

    // 2. Check Availability (Should be false for self/taken)
    console.log("Checking availability for existing name...");
    const check1 = await checkUsernameAvailability(initialName);
    console.log(`Result (Expected false): ${check1.available} - ${check1.message}`);

    // 3. Check Availability (Should be true for unique)
    const newName = "CoolUser_" + Date.now();
    console.log(`Checking availability for new name: ${newName}...`);
    const check2 = await checkUsernameAvailability(newName);
    console.log(`Result (Expected true): ${check2.available}`);

    // 4. Update Username (First Time - Should Success)
    console.log("Updating username first time...");
    const update1 = await updateUsername(testWallet, newName);
    console.log(`Update Result: ${update1.success}`);

    if (!update1.success) {
        console.error("Failed first update:", update1.message);
        return;
    }

    // 5. Update Username Again (Should Fail due to Cooldown)
    console.log("Attempting second update (Should fail due to 7-day cooldown)...");
    const newerName = "AnotherOne_" + Date.now();
    const update2 = await updateUsername(testWallet, newerName);
    console.log(`Update Result: ${update2.success} - ${update2.message}`);

    if (update2.success) {
        console.error("Error: Second update succeeded but should have failed!");
    } else {
        console.log("Success: Cooldown enforced correctly.");
    }

    // Cleanup
    await db.user.delete({ where: { id: user.id } });
    console.log("Cleanup complete.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await db.$disconnect();
    });
