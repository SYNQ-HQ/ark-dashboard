// import { PrismaClient } from '@prisma/client'

// // const prisma = new PrismaClient()
// const prisma = new PrismaClient()

// async function main() {
//     console.log("Seeding...")

//     // 1. Create Missions
//     await prisma.mission.upsert({
//         where: { id: 'mission-1' },
//         update: {},
//         create: {
//             id: 'mission-1',
//             title: "Say something nice to someone today.",
//             description: "Spread kindness by complimenting a stranger or friend.",
//             type: "SOCIAL",
//             points: 50,
//             frequency: "DAILY"
//         }
//     })

//     await prisma.mission.create({
//         data: {
//             title: "Daily Login",
//             description: "Log in to the platform",
//             points: 10,
//             type: "SOCIAL", // or LOGIN
//             frequency: "DAILY"
//         }
//     })

//     // 2. Create Rewards
//     await prisma.reward.createMany({
//         data: [
//             { name: "ARK T-Shirt", description: "Exclusive ARK community t-shirt.", cost: 5000, stock: 100 },
//             { name: "Limited Edition NFT", description: "A unique digital collectible.", cost: 25000, stock: 10 },
//             { name: "Monthly Airdrop Ticket", description: "Entry into the monthly prize pool.", cost: 2500 }
//         ]
//     })

//     // 3. Create Badges
//     const badge1 = await prisma.badge.create({
//         data: { name: "ARK OG", description: "Early supporter.", icon: "🏆" }
//     })

//     const badge2 = await prisma.badge.create({
//         data: { name: "Hope Giver", description: "Spread hope.", icon: "❤️" }
//     })

//     // 4. Create Impact Stories
//     await prisma.impactStory.create({
//         data: {
//             title: "Building a School",
//             slug: "building-a-school",
//             description: "Funded construction of a new school.",
//             imageUrl: "https://via.placeholder.com/600x400"
//         }
//     })

//     // 5. Create User
//     await prisma.user.upsert({
//         where: { walletAddress: "0x123...456" },
//         update: {},
//         create: {
//             walletAddress: "0x123...456",
//             username: "KindnessWarrior",
//             points: 1250,
//             isEligible: true,
//             lastSpin: new Date(),
//             streak: {
//                 create: { currentStreak: 5 }
//             },
//             badges: {
//                 create: [
//                     { badgeId: badge1.id },
//                     { badgeId: badge2.id }
//                 ]
//             }
//         }
//     })

//     // 6. Create Admin User
//     await prisma.user.upsert({
//         where: { walletAddress: "0xADMIN1234567890" },
//         update: { role: 'ADMIN' },
//         create: {
//             walletAddress: "0xADMIN1234567890",
//             username: "SuperAdmin",
//             role: 'ADMIN',
//             points: 999999,
//             isEligible: true,
//             streak: {
//                 create: { currentStreak: 100 }
//             }
//         }
//     })

//     console.log('Database seeded successfully!')
// }

// main()
//     .then(async () => {
//         await prisma.$disconnect()
//     })
//     .catch(async (e) => {
//         console.error(e)
//         await prisma.$disconnect()
//         process.exit(1)
//     })
