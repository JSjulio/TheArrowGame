require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http"); 
const socketIO = require("socket.io"); 
const path = require("path");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env; 
const cors = require('cors');

const PORT = process.env.PORT || 3000;

// Enable CORS middleware
app.use(cors({
  origin: 'http://localhost:1234'
}));

// Serve static files from the "client" directory
app.use(express.static(path.join(__dirname, "..", "dist"))); // Refactoring may be required for the client directory path

// Create an HTTP server instance
const server = http.createServer(app);

// Logging middleware 
app.use(morgan("dev"));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authorization middleware 
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    const token = authHeader.slice(7, authHeader.length); // Extract the token

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // Set decoded user information on request
    } catch (error) {
      console.error(error);
      // Optionally handle specific error cases here (e.g., token expired)
      // For security reasons, you might not want to send specific error messages to the client
    }
  }
  // Proceed without setting req.user if no valid token was provided
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

// Socket.io connection
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const players = new Map(); // Map to store player information

// Map to store game state information, it's global to maintain state across connections
const gameStates = {};

// Once the game Scene socket is created, server will listen for the following events
io.on('connection', (socket) => {

  // Get the map data and determine valid positions for player spawns
  socket.on('mapData', ({ tileIndices, tileWidth, tileHeight, mapWidth, mapHeight, scale }) => {
    // omitted for brevity
  });

  // omitted other event listeners for brevity

  // Listen for game room creation requests
  socket.on('createGameRoom', (gameId) => {
    // Check if the game room already exists
    if (!gameStates[gameId]) {
      gameStates[gameId] = { players: new Set() };
      console.log(`Game room ${gameId} created`);
    }

    // Check if the game room is at capacity
    if (gameStates[gameId].players.size >= 10) {
      socket.emit('gameAtPlayerCapacity', { message: 'Game room is at capacity', gameId });
    } else {
      // Add the player to the game state and join the game room
      gameStates[gameId].players.add(socket.id);
      socket.join(gameId);
      console.log(`Player with ID ${socket.id} joined game room ${gameId}`);
      socket.emit('gameRoomCreated', { gameId, message: `you've created game room: ${gameId}!` });
      socket.broadcast.emit('gameRoomCreated', { message: `Player with ID ${socket.id} has created game: ${gameId}!` });
    }
  });


    // If needed, send back an acknowledgment or game state
    socket.emit('joinedGameRoom', { gameId, message: `Welcome to the game ${gameId}` });


  // Handle player disconnection
  socket.on('disconnect', () => {
    Object.keys(gameStates).forEach(gameId => {
      // Remove the player from the game room
      if (gameStates[gameId].players.has(socket.id)) {
        gameStates[gameId].players.delete(socket.id);
        console.log(`Player with ID ${socket.id} has left game room ${gameId}`);
        // If the game room is empty, delete it
        if (gameStates[gameId].players.size === 0) {
          delete gameStates[gameId];
        }
      }
    });
    console.log(`Player with ID ${socket.id} disconnected`);
  });

});

  // Start listening on the specified port
  server.listen(PORT, "localhost", () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
  });

  module.exports = app;

///