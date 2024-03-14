const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config(); 

if (process.env.NODE_ENV === 'production') {
    console.log('Seeding is not permitted in production!');
    process.exit();
  }

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
// Protective check if seeding occurs in prodcution environment 
    if (process.env.NODE_ENV !== 'development') {
        readline.question('Are you sure you want to seed the database in non-development environment? (y/N) ', answer => {
        if (answer.toLowerCase() === 'y') {
            // Run seeding logic
        } else {
            console.log('Seeding aborted!');
        }
        readline.close();
        });
    }

async function main() {
  // Clear existing data 
  await prisma.player.deleteMany({});
  await prisma.game.deleteMany({});
  

  // Create a new game instance
  const game = await prisma.game.create({
    data: {
      players: {
        create: [
          { name: 'Archer One', lives: 3, kills: 0, inGame: true },
          { name: 'Bowmaster Two', lives: 2, kills: 1, inGame: true },
          { name: 'Arrow Slinger Three', lives: 1, kills: 2, inGame: true },
          { name: 'Crossbower Four', lives: 3, kills: 3, inGame: true },
        ],
      },
      active: true,
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
