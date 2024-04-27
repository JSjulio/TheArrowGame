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
const { count } = require("console");

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


//?Start Socket Event Listeners---------------------------------------------------------------------------

  // Initialize Game State 
  const players = new Map(); 
  const gameStates = {};

  // Event handling for starting a game room socket connection 
  io.on('connection', (socket) => {

    socket.on('gameRoomSetRequest', (data) => {
      
      // Check if the game room exists, if not, allow first to join the socket connection of that gameroom
      const gameId = data.gameId;
      if (!gameStates[gameId]) {
        socket.join(gameId);
        socket.emit('gameRoomSetResponse', {gameId: gameId, success: true, message: `, success!.`});
        return;
      }
    
      // If game room exist and there is more than 5 seconds left in the countdown, allow player to join socket connection
      if (!gameStates[gameId].started && gameStates[gameId].countdown  >= 5) {
        gameStates[gameId].players.add(socket.id);
        socket.join(gameId);
        socket.emit('gameRoomSetResponse', {gameId: gameId, success: true, started: true,  message: `, Countdown started, but we'll get you in there 🎯!.`});
        return;
      }

      // If socket connection does not meet the above conditions, emit a message to the client that the socket connection cannot be joined
      if (gameStates[gameId].started && gameStates[gameId].countdown <= 4) {
        socket.emit('gameRoomSetResponse', {gameId: gameId, failure: true, message: `, Game ${gameId} already started, try another one 🙃!`});
      }
    });

// Event handling for creating a game room with existing socket connection created in lobby scene via the code above
socket.on('createGameRoom', (data) => {
  const gameId = data.gameId;

  // Initialize the game room if it doesn't exist
  if (!gameStates[gameId]) {
    gameStates[gameId] = {
      players: new Set(),
      started: false,
      countdownStarted: false,
      countdown: 30 // Initialize countdown
    };
  }
  
  if (gameStates[gameId] && gameStates[gameId].started) {
      socket.emit('gameAlreadyStarted', {
      message: 'Game already started, please join another room',
      gameId
    });
    return;
  }

  if (gameStates[gameId] && !gameStates[gameId].started) {
    gameStates[gameId].players.add(socket.id);
    socket.join(gameId);
  }

  // Start countdown if it has not already started
  if (!gameStates[gameId].countdownStarted) {
    gameStates[gameId].countdownStarted = true;
    gameStates[gameId].players.add(socket.id);
    socket.join(gameId);

    // Countdown 
    const countdownInterval = setInterval(() => {
      if (gameStates[gameId] && gameStates[gameId].countdown > 0) {
        gameStates[gameId].countdown--;
        io.in(gameId).emit('updateCountdown', { countdown: gameStates[gameId].countdown });
        io.in(gameId).emit('disableReadyUp');
      }
       else { // Countdown has ended or no longer exists
        clearInterval(countdownInterval);
        if (gameStates[gameId]) { 
          io.in(gameId).emit('startItUp', { message: `Game room ${gameId} is starting.` });
        } 
      }
    }, 1000);
  } 

  // Notify player of successful room join
  socket.emit('gameRoomJoined', { message: `You have successfully joined the game room ${gameId}.` });
  socket.to(gameId).emit('newPlayerJoined', { playerId: socket.id, message: `A new player has joined the game room ${gameId}.` });
});


  // Listen for player room and receive player data
  socket.on('joinRoom', (data) => {

    const player = data.player; // ? should be player socket
    console.log('player', player);
    const gameId = data.gameId; 

    // Stores new player information into players Map using player.id as the key. 
    // The line below allows the server to keep track of all players by placing the player object within the Map defined near line 74 
    players.set(player, player);  
      
    // Join the player socke tto the game room, 
    socket.join(gameId);
    // console.log('player', player);

    // Broadcast to all the clients that a new player has joined, along with the information of that player
    socket.to(gameId).emit('newPlayer', player); // modified emit to send to specific gameId, ensuring players are in their proper rooms 
    
    //functional check to see if player is in the game room
    socket.to(gameId).emit('playerInGameMap', { message:  `Player ${player} connected to your '${gameId}' game room!`});
    console.log(`game_ConsoleLog: S Player connected to game room: ${gameId}`);
});

  // Listen for client movements (active keys being pressed which correlate to adjacent player movement)
  socket.on('clientPlayerUpdate', (playerData) => {
    const gameId = playerData.gameId;  
    players.set(playerData.id, playerData);
    // console.log(playerData.activeKeys)
    socket.to(gameId).emit('playerUpdates', {'id': playerData.id, 'x': playerData.playerX, 'y': playerData.playerY, 'activeKeys': playerData.activeKeys, 'direction': playerData.direction});
  });

  // Listen for player data from client 
  socket.on('newPlayerConnect', (playerData) => {
    const gameId = playerData.gameId;
    // console.log('New player connected:', playerData.name);
    socket.to(gameId).emit('newPlayerConnect', playerData); 
    console.log('New player connected:', playerData.name);
  });

  // Listen / Emit client arrow shots 
  socket.on('playerShoot', (data) => {
    const { playerId, x, y, direction, gameId } = data;
    socket.to(gameId).emit('playerShooting', { playerId, x, y, direction });
});

  //Disable Client update methods for a player 
  socket.on('playerDied', (data) => {
    const {gameId, playerId} = data;
      
    if (players.has(playerId)) {
      const player = players.get(playerId); // Get the player object from the players Map
      player.active = false; // Set the player as inactive
      players.set(playerId, player); // Set player status to false within players Object 
    };

    console.log(`Player ${playerId} died - in game room: ${gameId}.`);
    socket.to(gameId).emit('setDeadPlayerStatus', { playerId, active: false});
  });  


  //TODO Game over logic
  // create logic that listen to when one player.active = truthy and all other players.active = falsy
  // emit a game over event to all players in the game room

  //  implement an option for players to join the lobby and enter a new game // Ensure to maintain socket.id in this scenario
  //  Implement a way for players to be invsivile and see when the game is over and the winner is declared.

socket.on('playerIdReq', () => {
  const pid = socket.id;
  if(!players.has(pid)){
    socket.emit('playerIdRes', (pid));
  }
})

  // Handle player disconnection 
    socket.on('disconnect', () => {
      Object.keys(gameStates).forEach(gameId => {
        if (gameStates[gameId] && gameStates[gameId].players.has(socket.id)) {
          gameStates[gameId].players.delete(socket.id);

          // if all players have left the game room, clean up the game state
          if (gameStates[gameId].players.size === 0) {
            clearInterval(gameStates[gameId].countdownInterval); // Clear the countdown interval
            delete gameStates[gameId]; // Remove the game state
          } else {
            // Update all players about the changed player count
            io.in(gameId).emit('playerDisconnected', { playerId: socket.id });
          console.log(`Player with ID ${socket.id} has left game room ${gameId}`);
        }
      }
    });
  console.log(`Player with ID ${socket.id} disconnected`);
  });
})
//*END Socket Event Listeners---------------------------------------------------------------------------

  // Start listening on the specified port
  server.listen(PORT, "localhost", () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
  });

  module.exports = app;
