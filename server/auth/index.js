const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const Prisma = new PrismaClient();


// TODO refactor this file to work with new game/player models, instead of instructor/student from previous project 
  // only player username required 


// Register a new instructor account
router.post("/register", async (req, res, next) => {
  try {
    const { username } = req.body;
    const existingPlayer = await Prisma.player.findUnique({
      where: {
        username: username,
      },
    });

    if (existingInstructor) {
      return res.status(409).send({ error: "Username already exist" });
    }
    
    const instructor = await Prisma.instructor.create({
      data: {
        username: username,
        password: password,
      },
    });

    if (instructor) {
      const token = jwt.sign({ id: instructor.id }, JWT_SECRET);
      res.status(200).send({ token });
    }
  } catch (error) {
    next(error);
  }
});

// Login to an existing instructor account
router.post("/login", async (req, res, next) => {
  try {
    const { username } = req.body;
    const instructor = await Prisma.instructor.findUnique({
      where: {
        username: username,
      },
    });

    if (!instructor) {
     return res.status(401).send("Invalid credentials");
    }

    if (instructor) {
      const token = jwt.sign({ id: instructor.id }, process.env.JWT);
      res.status(200).send({token})
    }
  } catch (error) {
    next(error);
  }
});


router.get("/me", async (req, res, next) => {
  try {
    const instructor = await Prisma.instructor.findUnique({
      where: {
        id: req.user.id
      },
    });
      res.send(instructor);
  } catch (error) {
    console.log(error.message)
    next(error);
  }
});

module.exports = router;









// Get the currently logged in instructor
// router.get("/me", async (req, res, next) => {
//   try {
//     const {
//       rows: [instructor],
//     } = await db.query("SELECT * FROM instructor WHERE id = $1", [
//       req.user?.id,
//     ]);

//     res.send(instructor);
//   } catch (error) {
//     next(error);
//   }
// });