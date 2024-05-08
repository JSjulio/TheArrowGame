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


//Start Socket Event Listeners----------------------------------------------------------------------------------------------------------------------------------

  // Initialize Game State
  const gameStates = {};

  // Event handling for starting a game room socket connection 
  io.on('connection', (socket) => {

    socket.on('gameRoomSetRequest', (data) => {
      const gameId = data.gameId;
      const playerName = data.playerName; 
      const playerId = socket.id;


      // Check if the game room exists in the gameStates, if not create it and add the player to socket room
      if (!gameStates[gameId]) {
        socket.join(gameId); // Add player to a seperate socket room

        //Intialize game parameters once game socket room is created within the lobby Scene- this init allows for entry/restriction into game rooms already started
        gameStates[gameId] = { 
          countDownStarted: false,
          started: false,
          countdown: 15,
          players: new Map()
        };

        // add available player data to the players list temporarily for disconnection 
        gameStates[gameId].players.set(playerId, {playerName: playerName}) 
        console.log('gameId values after players init 1:', Array.from(gameStates[gameId].players.values())); 
        socket.emit('gameRoomSetResponse', {gameId: gameId, success: true, message: `, success!.`});
        return;
      }
    
      // if game has not started and 5 or more seconds remain on the Ready scene countdown, add the player to the Ready Scene / socket connection 
      if (!gameStates[gameId].started && gameStates[gameId].countdown >=5 ) {
        socket.join(gameId);
        gameStates[gameId].players.set(playerId, {playerName: playerName})       
        console.log('gameId values after player init2:', Array.from(gameStates[gameId].players.values())); 
        socket.emit('gameRoomSetResponse', {gameId: gameId, success: true,  message: `, Countdown started, but we'll get you in there 🎯!.`});
        return;
      }

      // If socket connection does not meet the criteria above, emit a message to the client that their desired gameId cannot be joined
      if (!gameStates[gameId].started && gameStates[gameId].countdown <= 4) {
        socket.emit('gameRoomSetResponse', {gameId: gameId, failure: true, message: `, Game ${gameId} already started, try another one !`});
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

  // Set player data as new maps within gameStates - once player starts the Game Scene 
  socket.on('joinRoom', (data) => {
      
    const gameId = data.gameId; 
    const player = data.player; //player object 
    const playerId = data.playerId; // player.playerId = socket.id throughout this codebase // player.playerName is the player's name from the database
    
    // verify that the room still exist, if it does, then create a new player map 
    if (gameStates[gameId] && !gameStates[gameId].started) {
          gameStates[gameId].players = new Map();
          
          // Add the current player to the newly cleared & initialized map
          gameStates[gameId].players.set(playerId, player);
          
          console.log('player values during set:', Array.from(gameStates[gameId].players.values()));
        }
  
});
  
  socket.on('requestGameTimer', (data) => {
    const gameId = data.gameId;
    
  // Setting game parameters as started
  gameStates[gameId].started = true; // set game as started 
  gameStates[gameId].gameCountDown = 60; // set game countdown

    // Start the countdown only if it has not already started
    if (!gameStates[gameId].gameCountStarted) {
      gameStates[gameId].gameCountStarted = true;  
      
      // game counter is stored within gameStates[gameId] to be cleared when the game ends
      gameStates[gameId].countDownInterval = setInterval(() => {
        // Check if the game state still exists and the countdown is above zero
        if (gameStates[gameId] && gameStates[gameId].gameCountDown > 0) {
          gameStates[gameId].gameCountDown--;
          io.in(gameId).emit('updateGameTimer', { gameCountDown: gameStates[gameId].gameCountDown });
          console.log('player values during count:', Array.from(gameStates[gameId].players.values()));
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
  console.log('Final winner message:', message);
  
  // Stop the game countdown and clear the game state
  clearInterval(gameStates[gameId].countDownInterval);
  gameStates[gameId].players.clear();
  delete gameStates[gameId];
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
    }

    // filter gameStates for active players, if one remains, declare that player as the winner / end the game
    const activePlayers = Array.from(gameStates[gameId].players.values()).filter(playerId => playerId.active);
    if (activePlayers.length === 1) {
      
      const remainingPlayer = activePlayers[0];
      io.in(gameId).emit('gameOverEvent2', { message: `Player ${remainingPlayer.playerName} wins as the sole survivor!` });
    
      // Stop the game countdown
      clearInterval(gameStates[gameId].countDownInterval);
      gameStates[gameId].players.delete(playerId); // remove socket from the game states players map = server stops tracking the player
      delete gameStates[gameId]; // delete game state
      console.log('active game rooms:', gameStates);

    } 
    
  
    // TODO fix this logic to account for the last player standing

    console.log(`Player ${playerId} died - in game room: ${gameId}.`);
    socket.to(gameId).emit('setDeadPlayerStatus', { playerId, active: false});
  });  


  socket.on('disconnect', () => {
    // Iterate over all game states , if no players, stop the countdown and delete the game room
    Object.keys(gameStates).forEach(gameId => {

      const inWaitingRoom = !gameStates[gameId].started && gameStates[gameId].players.has(socket.id);
      const inGame = gameStates[gameId].started && gameStates[gameId].players.has(socket.id);

      //disconnection if player in waiting room
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
         // Log player disconnection
         console.log(`Player with ID ${socket.id} has left game room ${gameId}`);

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
          console.log(`Game room ${gameId} has been deleted due to no remaining players.`);
          console.log('Active game rooms:', gameStates);
      }
    }
  }
)}); 
console.log('Active game rooms:', gameStates);
});
 
//END Socket Event Listeners---------------------------------------------------------------------------

  // Start listening on the specified port
  server.listen(PORT, "localhost", () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
  });

  module.exports = app;
