require("dotenv").config();
const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const Prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const { token } = require("morgan");
const { JWT_SECRET } = process.env;
const bcrypt = require("bcrypt"); 


// Register a new player account
router.post("/register", async (req, res, next) => {
  try {
    const { name, password, lives, kills, inGame } = req.body;
    const existingPlayer = await Prisma.player.findUnique({
      where: {
        name: name,
      },
    });
    console.log("req.body is:", req.body);


    if (existingPlayer) {
      return res.status(409).send({ error: "User already exist" });
    }

    //bcrypt password hashing 
    // might need to implement a try catch here? 
    const hashedPassword = await bcrypt.hash(password, 10)

    const player = await Prisma.player.create({
      data: {
        name: name,
        password: hashedPassword,
      },
    });

    if (player) {
      const token = jwt.sign({ id: player.id }, JWT_SECRET);
      console.log('your token is:', token); 
      res.status(200).send({ player, token });
    } 
  } catch (error) {
    next(error);
  }
});

// Login to an existing player account
router.post("/login", async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const player = await Prisma.player.findUnique({
      where: {
        name: name,
      },
    });

    if (!player) {
      return res.status(401).send("Invalid credentials");
    }

    // verify that entered password is the same as hashed password stored in the db 
        // bcrypt compares method handles the salting in the process
    const passwordMatch = await bcrypt.compare(password, player.password);
    if (!passwordMatch) {
      return res.status(401).send("Invalid credentials");
    }

    const token = jwt.sign({ id: player.id }, JWT_SECRET);
    res.status(200).send({ player, token });
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
