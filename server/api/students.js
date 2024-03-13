const router = require("express").Router();
const db = require("../db");
const { PrismaClient } = require("@prisma/client");
const Prisma = new PrismaClient();

// Deny access if user is not logged in
router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).send("You must be logged in to do that.");
  }
  next();
});

// Get all students
router.get("/", async (req, res, next) => {
  try {
    const student = await Prisma.student.findMany({
      where: {
        instructorid: req.user.id,
      },
    });
    res.send(student);
  } catch (error) {
    next(error);
  }
});

// Create a new student
router.post("/", async (req, res, next) => {
  try {
    const { name, cohort } = req.body;

    const student = await Prisma.student.create({
      data: {
        name: name,
        cohort: cohort,
        instructor: { connect: { id: req.user.id } },
      },
    });

    if (student) {
      res.status(201).send(student);
    }
} catch (error) {
  next(error);
  }
});

// create a student
router.post("/", async (req, res, next) => {
  try {
    const { name, cohort } = req.body;

    const student = await Prisma.student.create({
      data: {
        name: name,
        cohort: cohort,
        instructor: { connect: { id: req.user.id } },
      },
    });

    if (student) {
      res.status(201).send(student);
    }
} catch (error) {
  next(error);
  }
});


// Update a student
router.put("/:id", async (req, res, next) => {
  const studentId = parseInt(req.params.id); // Get the student ID from the URL parameter
  const { name, cohort } = req.body; // Extract the updated name and cohort from the request body

  try {
      const student = await Prisma.student.update({
          where: {
              id: studentId, // Use the unique student ID for the lookup
          },
          data: {
              name: name,
              cohort: cohort,
          },
      });
      res.json(student); // Send back the updated student record
  } catch (error) {
      next(error);
  }
});


// Delete a student by id
router.delete("/:id", async (req, res, next) => {

  const studentId = parseInt(req.params.id); // Get the student ID from the URL parameter
  try {
    const student = await Prisma.student.delete({ 
      where: { 
        id: studentId, 
      }, 
    }); 
    res.status(200).send(student)
} catch (error) {
    next(error);
  }
});

module.exports = router;
