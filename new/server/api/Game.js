require("dotenv").config();
const router = require("express").Router();
const db = require("../db");
const { PrismaClient } = require("@prisma/client");
const Prisma = new PrismaClient();


// Deny access if player is not logged in
router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).send("You must be logged in to do that.");
  }
  next();
});

// Get all players currently not in a game 
router.get('/lobby', async (req, res) => {
  const players = await Prisma.player.findMany({
    where: {
      inGame: false,
    },
  });
  res.send(players);
});


module.exports = router;
