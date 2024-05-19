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
  origin: '*' 
}));

// Serve static files from the "client" directory
app.use(express.static(path.join(__dirname, "..", "dist"))); 

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
    const token = authHeader.slice(7, authHeader.length); 

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; 
    } catch (error) {
      console.error(error);
    }
  }
  next();
});

// Backend routes 
app.use("/auth", require("./auth"));
// app.use("/api", require("./api")); not required but set up for future use

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

//Start Socket Event Listeners----------------------------------------------------------------------------------------------------------------------------------

  // Initialize Game State
  const gameStates = {};

  // Event handling for starting a game room socket connection 
  io.on('connection', (socket) => {

    socket.on('gameRoomSetRequest', (data) => {
      const gameId = data.gameId;
      const playerName = data.playerName; 
      const playerId = socket.id;


      // Check if the game room exists in the gameStates, if not create it
      if (!gameStates[gameId]) {
        socket.join(gameId); // Add player to socket room

        //Intialize game parameters once game socket room is created within the lobby Scene- this init allows for entry/restriction into game rooms already started
        gameStates[gameId] = { 
          countDownStarted: false,
          started: false,
          countdown: 16,
          players: new Map()
        };

        // add intial player data to the players list temporarily to handle disconnection while in lobby and ready scenes  
        gameStates[gameId].players.set(playerId, {playerName: playerName}) 
        socket.emit('gameRoomSetResponse', {gameId: gameId, success: true, message: `, success!.`});
        return;
      }
    
      // if game has not started and 5 or more seconds remain on the Ready scene countdown, add the player to the Ready Scene / socket connection 
      if (!gameStates[gameId].started && gameStates[gameId].countdown >=5 ) {
        socket.join(gameId);
        gameStates[gameId].players.set(playerId, {playerName: playerName})       
        socket.emit('gameRoomSetResponse', {gameId: gameId, success: true,  message: `, Countdown started, but we'll get you in there 🎯!.`});
        return;
      }

      // If socket connection does not meet the criteria above, emit a message to the client that their desired gameId cannot be joined
      if (!gameStates[gameId].started && gameStates[gameId].countdown <= 4) {
        socket.emit('gameRoomSetResponse', {gameId: gameId, failure: true, message: `Game ${gameId} is in session, try another!`});
        return;
      }
    });

//Ready Scene countdown 
socket.on('startCountDown', (data) => {
  const gameId = data.gameId;

  // Start countdown 
  if (!gameStates[gameId].countDownStarted && !gameStates[gameId].started) {
    gameStates[gameId].countDownStarted = true;

    gameStates[gameId].waitingRoomCountDownInterval = setInterval(() => {
      if (gameStates[gameId] && gameStates[gameId].countdown > 0) {
        gameStates[gameId].countdown--;
        io.in(gameId).emit('updateCountdown', { countdown: gameStates[gameId].countdown });
        io.in(gameId).emit('disableReadyUp');
      }
       else { // Countdown has ended or no longer exists
        clearInterval(gameStates[gameId].waitingRoomCountDownInterval);
        if (gameStates[gameId]) { 
          io.in(gameId).emit('startItUp', { message: `Game room ${gameId} is starting now!.` });
          gameStates[gameId].players.clear(); // Clear the players map
        } 
      }
    }, 1000);
  } 
});

  // Once player enters game scene, recreate the players map and set the player data
  socket.on('joinRoom', (data) => {
      
    const gameId = data.gameId; 
    const player = data.player; //player object 
    const playerId = data.playerId; // player.playerId = socket.id throughout this codebase 
    
    // verify that the room still exist, if it does and count hasn't started create a new players map 
    if (gameStates[gameId] && !gameStates[gameId].started) {
          gameStates[gameId].players = new Map(); // 
          
          // set individual player data (game data) within the players map 
          gameStates[gameId].players.set(playerId, player);
       }
  
});
  
  socket.on('requestGameTimer', (data) => {
    const gameId = data.gameId;
    
  // Setting gameId as started
  gameStates[gameId].started = true; // set game as started 
  gameStates[gameId].gameCountDown = 101; // set game time

    // Start the countdown only if it has not already started
    if (!gameStates[gameId].gameCountStarted) {
      gameStates[gameId].gameCountStarted = true;  
      
      // game counter is stored within gameStates[gameId] to be cleared when the game ends
      gameStates[gameId].countDownInterval = setInterval(() => {
        // Check if the game state still exists and the countdown is above zero
        if (gameStates[gameId] && gameStates[gameId].gameCountDown > 0) {
          gameStates[gameId].gameCountDown--;
          io.in(gameId).emit('updateGameTimer', { gameCountDown: gameStates[gameId].gameCountDown });
        } else {
          clearInterval(gameStates[gameId].countDownInterval);
          if (gameStates[gameId]) {  // Ensure the game state still exists before proceeding
            
          const updateTimeout = setTimeout(() => {
            calculateAndAnnounceWinner(gameId);
          }, 2000);  // 2 second timeout for winner calculation
        } 
      }
    }, 1000);
  }
});

// Helper function to calculate and announce the winner
function calculateAndAnnounceWinner(gameId) {
  if (!gameStates[gameId]) { // Check if the game state exists before accessing it
    return;
  }

  const playerObjects = Array.from(gameStates[gameId].players.values());
  const maxLives = Math.max(...playerObjects.map(player => player.lives));
  const winners = playerObjects.filter(player => player.lives === maxLives);

  let message;
  if (winners.length > 1) {
    const winnerNames = winners.map(player => player.playerName).join(", ");
    message = `${winnerNames} win!`;
  } else if (winners.length === 1) {
    message = `${winners[0].playerName} wins!`;
  } else {
    message = "No winners this game.";
  }

  io.in(gameId).emit('gameOverEvent1', { message: message });
  
  // clean game state following gamer over event
  clearInterval(gameStates[gameId].countDownInterval);
  clearInterval(gameStates[gameId].waitingRoomCountDownInterval);
  gameStates[gameId].players.clear();
  delete gameStates[gameId];

  //remove players from socket room
  const removeAllUsersFromRoom = (gameId) => {
    const room = io.sockets.adapter.rooms.get(gameId);
    if (room) {
      room.forEach(playerId => {
        const socket = io.sockets.sockets.get(playerId);
        socket.leave(gameId);
      });
    }
  }
  removeAllUsersFromRoom(gameId);
}

  // Listen for client movements (active keys being pressed which correlate to adjacent player movement)
  socket.on('clientPlayerUpdate', (playerData) => {
    const gameId = playerData.gameId;  
    if(gameStates[gameId]) { 
      gameStates[gameId].players.set(playerData.id, playerData);
    }
    socket.to(gameId).emit('playerUpdates', {'id': playerData.id, 'x': playerData.playerX, 'y': playerData.playerY, 'activeKeys': playerData.activeKeys, 'direction': playerData.direction, 'lives': playerData.lives});


  });

  // Listen / Emit client arrow shots 
  socket.on('playerShoot', (data) => {
    const { playerId, x, y, direction, gameId } = data;
    socket.to(gameId).emit('playerShooting', { playerId, x, y, direction });
});

  //Disable Client update methods for a player 
  socket.on('playerDied', (data) => {
    const {gameId, playerId} = data;
      
    if (gameStates[gameId].players.has(playerId)) {
      const player = gameStates[gameId].players.get(playerId); // Get the player object from the players Map
      player.active = false; // Set the player as inactive
      gameStates[gameId].players.set(playerId, player); // Set player status to false within players Object 
      
      socket.to(gameId).emit('setDeadPlayerStatus', { playerId, active: false});
    }

    const activePlayers = Array.from(gameStates[gameId].players.values()).filter(playerId => playerId.active);

    if (activePlayers.length === 1) {
      // if one player is left after a player dies, announce the winner / end game
      const remainingPlayer = activePlayers[0];
      io.in(gameId).emit('gameOverEvent2', { message: `${remainingPlayer.playerName} wins!`});
    
      // clean game state
      clearInterval(gameStates[gameId].countDownInterval);
      clearInterval(gameStates[gameId].waitingRoomCountDownInterval);
      gameStates[gameId].players.delete(playerId); 
      delete gameStates[gameId]; // delete game state    
      
      // Remove all players from the socket room
      const removeAllUsersFromRoom = (gameId) => {
        const room = io.sockets.adapter.rooms.get(gameId);
        if (room) {
          room.forEach(playerId => {
            const socket = io.sockets.sockets.get(playerId);
            socket.leave(gameId);
          });
        }
      }
      removeAllUsersFromRoom(gameId) 
    }
  });  

  // Listen for player disconnection
  socket.on('disconnect', () => {
    // Iterate over all game states , if no players, stop the countdown and delete the game room
    Object.keys(gameStates).forEach(gameId => {

      const inWaitingRoom = !gameStates[gameId].started && gameStates[gameId].players.has(socket.id);
      const inGame = gameStates[gameId].started && gameStates[gameId].players.has(socket.id);

      //disconnection if player in waiting room: 
      // if a disconnection occurs while in waiting room, terminate that specific game room
      if (inWaitingRoom) {

        //remove player from game players map and socket room 
        gameStates[gameId].players.delete(socket.id);
        socket.leave(gameId); // Remove  player from the game state if present
          
        // if waitingRoom count is active, disable it, before deleting the game instance 
        if (gameStates[gameId].waitingRoomCountDownInterval) {
            clearInterval(gameStates[gameId].waitingRoomCountDownInterval);
          }
        delete gameStates[gameId];
      }

      //disconnection if player in game room
      if (inGame) {
         // delete disconnected player from gameStates
         gameStates[gameId].players.delete(socket.id);
         socket.broadcast.emit("removePlayer", socket.id);

        // Check if no players are left in game or waiting room
        if (gameStates[gameId].players.size === 0) {

          if (gameStates[gameId].countDownInterval) {
            clearInterval(gameStates[gameId].countDownInterval);
          }

          if (gameStates[gameId].waitingRoomCountDownInterval) {
            clearInterval(gameStates[gameId].waitingRoomCountDownInterval);
          }
          
          // Delete the game room state
          delete gameStates[gameId];
          socket.leave(gameId); // Remove player from the socket room 
      }
    }
  }
)}); 
});
 
//END Socket Event Listeners---------------------------------------------------------------------------

  // Start listening on the specified port
  server.listen(PORT, "localhost", () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
  });

  module.exports = app;
