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


//Start Socket Event Listeners---------------------------------------------------------------------------

  // Initialize Game State 
  const players = new Map(); 
  const gameStates = {};

  // Event handling for starting a game room socket connection 
  io.on('connection', (socket) => {

    socket.on('gameRoomSetRequest', (data) => {
      
      // Check if the game room [defined by gameId] exists in the gameStates object, if not create it and add the player to socket connection
      const gameId = data.gameId;
      if (!gameStates[gameId]) {
        socket.join(gameId);
        socket.emit('gameRoomSetResponse', {gameId: gameId, success: true, message: `, success!.`});
        return;
      }
    
      // if game has not started and 5 or more seconds remain on the Ready scene countdown, add the player to the Ready Scene / socket connection 
      if (!gameStates[gameId].started && gameStates[gameId].countdown  >= 5) {
        gameStates[gameId].players.add(socket.id);
        socket.join(gameId);
        socket.emit('gameRoomSetResponse', {gameId: gameId, success: true, started: true,  message: `, Countdown started, but we'll get you in there 🎯!.`});
        return;
      }

      // If socket connection does not meet the criteria above, emit a message to the client that their desired gameId cannot be joined
      if (gameStates[gameId].started && gameStates[gameId].countdown <= 4) {
        socket.emit('gameRoomSetResponse', {gameId: gameId, failure: true, message: `, Game ${gameId} already started, try another one 🙃!`});
      }
    });

// Event handling for creating the players map and game room
socket.on('createGameRoom', (data) => {
  const gameId = data.gameId;

  // Initialize the game room if it doesn't exist
  if (!gameStates[gameId]) {
    gameStates[gameId] = {
      players: new Set(),
      started: false,
      countDownStarted: false, 
      gameCountStarted: false, 
      countdown: 15, //TODO change to 30 once changes are made to the client side
      gameCountDown: 15 //TODO change to 60 once changes are made to the client side
    };
  }
  // deny player from setting gameId if gameId already exists in the Ready scene or Game scene
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
  if (!gameStates[gameId].countDownStarted) {
    gameStates[gameId].countDownStarted = true;
    gameStates[gameId].players.add(socket.id);
    socket.join(gameId);

    // Countdown 
    const countDownInterval = setInterval(() => {
      if (gameStates[gameId] && gameStates[gameId].countdown > 0) {
        gameStates[gameId].countdown--;
        io.in(gameId).emit('updateCountdown', { countdown: gameStates[gameId].countdown });
        io.in(gameId).emit('disableReadyUp');
      }
       else { // Countdown has ended or no longer exists
        clearInterval(countDownInterval);
        if (gameStates[gameId]) { 
          io.in(gameId).emit('startItUp', { message: `Game room ${gameId} is starting now!.` });
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
  
    const player = data.player; 
    const gameId = data.gameId; 

    let playerId = data.playerId;
    playerId = socket.id; // to ensure that playerId is the socket.id is it set to socket.id once more within the server
    
    players.set(playerId, player);  //all event listener's use playerId rather than player.id, for consistency, playerId is set as the identifier to each player within the player Map
    console.log(`player ${playerId} connected to gameId: ${gameId}`)     
});

 socket.on('requestGameTimer', (data) => {
  const gameId = data.gameId;
  console.log(gameId)
  if (!gameStates[gameId].gameCountStarted) {
    gameStates[gameId].gameCountStarted = true; // Set the game Counter boolean as true 
    gameStates[gameId].started = true; // Set the game as started boolean as true      

  //start countdown if it has not already started
  const countDownInterval = setInterval(() => {
      if (gameStates[gameId] && gameStates[gameId].gameCountDown > 0 ) {
        gameStates[gameId].gameCountDown--;
        io.in(gameId).emit('updateGameTimer', { gameCountDown: gameStates[gameId].gameCountDown});
      } 
      else {
        clearInterval(countDownInterval);
        if (gameStates[gameId]) {
    
          // Retrieve the player objects from the players Map using their IDs from the gameStates players Set
          const playerObjects = Array.from(gameStates[gameId].players)
            .map(playerId => players.get(playerId))
            .filter(player => player); // Filter out any undefined entries
    
          // Determine the maximum number of lives
          const maxLives = Math.max(...playerObjects.map(player => player.lives));
    
          // Find all players who have the maximum number of lives
          const winners = playerObjects.filter(player => player.lives === maxLives);
    
          let message;
          if (winners.length > 1) {
            const winnerIds = winners.map(player => player.id).join(', ');
            console.log(`Game room ${gameId} ends in a draw. Players ${winnerIds} have the most lives!`);
            message = `Game room ${gameId} ends in a draw. Players ${winnerIds} have the most lives!`;
          } else if (winners.length === 1) {
            message = `Game room ${gameId} is over. Player ${winners[0].id} wins!`;
          }
    
          // Emit the winner message
          io.in(gameId).emit('gameOverEvent', { message: message });
          console.log(message);
        }
      }
    }, 1000);
  }
  });



  // Listen for client movements (active keys being pressed which correlate to adjacent player movement)
  socket.on('clientPlayerUpdate', (playerData) => {
    const gameId = playerData.gameId;  
    players.set(playerData.id, playerData);
    // console.log(playerData.activeKeys)
    console.log(`serverConsoleLog: Player ${playerData.id} has ${playerData.lives} lives left.`);
    socket.to(gameId).emit('playerUpdates', {'id': playerData.id, 'x': playerData.playerX, 'y': playerData.playerY, 'activeKeys': playerData.activeKeys, 'direction': playerData.direction, 'lives': playerData.lives});
  });

  // Listen / Emit client arrow shots 
  socket.on('playerShoot', (data) => {
    const { playerId, x, y, direction, gameId } = data;
    socket.to(gameId).emit('playerShooting', { playerId, x, y, direction });
});

// //Recieve player lives from client and update player lives in the players Map
//   socket.on('updatePlayerLives', (data) => {
//     const {gameId, playerId, lives} = data;
//     if (gameStates[gameId] && players.has(playerId)) {
//       const player = players.get(playerId);
//       player.lives = lives;
      
//       players.set(playerId, player);
//       console.log(`serverConsoleLog: Player ${playerId} has ${lives} lives left.`);
//       // io.in(gameId).emit('destroyArrow', { arrowId: arrowId }); // Tell all clients to destroy this arrow
//       io.in(gameId).emit('completePlayerLivesUpdate', {player: player, playerId: playerId, lives: player.lives, message: `serverConsoleLog: Player ${playerId} has ${player.lives}  left.` });
//     }
// });

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
//END Socket Event Listeners---------------------------------------------------------------------------

  // Start listening on the specified port
  server.listen(PORT, "localhost", () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
  });

  module.exports = app;
