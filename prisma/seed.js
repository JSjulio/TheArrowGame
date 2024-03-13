const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

if (process.env.NODE_ENV === 'production') {
    console.log('Seeding is not permitted in production!');
    process.exit();
  }

async function main() {
  // Clear existing data 
  //TODO CI (continuous integration) task : ensure to 
  await prisma.player.deleteMany({});
  await prisma.game.deleteMany({});

  // Create a new game instance
  const game = await prisma.game.create({
    data: {
      active: true,
      players: {
        create: [
          { name: 'Archer One', lives: 3, kills: 0, inGame: true },
          { name: 'Bowmaster Two', lives: 2, kills: 1, inGame: true },
          { name: 'Arrow Slinger Three', lives: 1, kills: 2, inGame: true },
          { name: 'Crossbower Four', lives: 3, kills: 3, inGame: true },
        ],
      },
    },
  });

  console.log('Database has been seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
