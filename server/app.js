require("dotenv").config();
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const app = express();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

// Logging middleware
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // Static file-serving middleware
// app.use(express.static(path.join(__dirname, "..", "dist")));

//TODO Check requests for a token and attach the decoded id to the request
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

// refactor?
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client/dist/index.html"));
});

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
