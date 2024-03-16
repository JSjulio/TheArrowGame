require("dotenv").config();
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const app = express();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env; 
const cors = require('cors');

// CORS middleware (Cross origin resource sharing) connects the Phaser Application via the frontend PORT 
app.use(cors({ 
  origin: 'http://localhost:1234'
}));

// Logging middleware 
app.use(morgan("dev"));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Authorization middleware 
// Verifies the user token and the private JWT_SECRET passcode to authorize users
// req.user parameter- is required to access server/api private endpoints
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  try {
    req.user.id = jwt.verify(token, JWT_SECRET);
  } catch {
    req.user = null;
  }

  next();
});

// Backend routes 
app.use("/auth", require("./auth"));
app.use("/api", require("./api"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || "Internal server error.");
});

// Default to 404 if no other route matched
app.use((req, res) => {
  res.status(404).send("Not found.");
});

module.exports = app;
