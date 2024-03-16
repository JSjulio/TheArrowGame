const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config(); 
const bcrypt = require('bcrypt'); 

// This code detects whether you are in production or development. It does this by refering to what code what used to start the server and what the NODE_ENV is set to within the .env file 
  // for more information on what CLI codes to use to launch dev/prod. check the README.md
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
  

  // Create a new game instance. Since this code is for seeding, no password hashing is implemented. 
    // feel free to implement password hashing 
  const game = await prisma.game.create({
    data: {
      players: {
        create: [
          { name: 'Archer One', password: 'password1' },
          { name: 'Bowmaster Two', password: 'password2' },
          { name: 'Arrow Slinger Three', password: 'password3' },
          { name: 'Crossbower Four', password: 'password4' },
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


