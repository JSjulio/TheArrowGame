require("dotenv").config();
const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const Prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const { token } = require("morgan");
const { JWT_SECRET } = process.env;

//  refactor this file to work with new game/player models
// TODO incorperate hashedPassword once these three endpoints are complete / when conv.

// Register a new player account
router.post("/register", async (req, res, next) => {
  try {
    const { name, password, lives, kills, inGame } = req.body;
    const existingPlayer = await Prisma.player.findUnique({
      where: {
        name: name,
      },
    });
    console.log("request coming through is:", req.body);


    if (existingPlayer) {
      return res.status(409).send({ error: "User already exist" });
    }

    const player = await Prisma.player.create({
      data: {
        name: name,
        password: password,
      },
    });

    if (player) {
      const token = jwt.sign({ id: player.id }, JWT_SECRET);
      console.log('your token is:', token); 
      res.status(200).send({ token });
    } 
  } catch (error) {
    next(error);
  }
});

// Login to an existing player account
router.post("/login", async (req, res, next) => {
  try {
    const { name } = req.body;
    const player = await Prisma.player.findUnique({
      where: {
        name: name,
      },
    });

    if (!player) {
      return res.status(401).send("Invalid credentials");
    }

    if (player) {
      const token = jwt.sign({ id: player.id }, JWT_SECRET);
      res.status(200).send({ token });
    }
    console.log(token);
  } catch (error) {
    next(error);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    const player = await Prisma.player.findUnique({
      where: {
        id: req.user.id,
      },
    });
    res.send(player);
  } catch (error) {
    console.log(error.message);
    next(error);
  }
});

module.exports = router;
