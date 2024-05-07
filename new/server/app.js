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
      
      // Check if the game room exists in the gameStates, if not create it and add the player to socket room
      const gameId = data.gameId;
      if (!gameStates[gameId]) {
        socket.join(gameId);

        //Intialize game parameters once game is created via the lobby - this allows for entry/restriction into game
        gameStates[gameId] = { 
          countDownStarted: false,
          started: false,
          countdown: 15
        };

        socket.emit('gameRoomSetResponse', {gameId: gameId, success: true, message: `, success!.`});
        return;
      }
    
      // if game has not started and 5 or more seconds remain on the Ready scene countdown, add the player to the Ready Scene / socket connection 
      if (!gameStates[gameId].started && gameStates[gameId].countdown >=5 ) {
        socket.join(gameId);
        socket.emit('gameRoomSetResponse', {gameId: gameId, success: true,  message: `, Countdown started, but we'll get you in there 🎯!.`});
        return;
      }

      // If socket connection does not meet the criteria above, emit a message to the client that their desired gameId cannot be joined
      if (!gameStates[gameId].started && gameStates[gameId].countdown <= 4) {
        socket.emit('gameRoomSetResponse', {gameId: gameId, failure: true, message: `, Game ${gameId} already started, try another one 🙃!`});
        return;
      }
    });

//Ready Scene countdown 
socket.on('startCountDown', (data) => {
  const gameId = data.gameId;

  if (!gameStates[gameId].countDownStarted && !gameStates[gameId].started) {
      gameStates[gameId] = {
      countDownStarted: false, //ready scene countdown 
      started: false, // game started
      gameCountStarted: false, // game countdown started?
      countdown: 15, //TODO Ready Scene countdown
      gameCountDown: 60 //TODO in game countdown 
    };
  }

  // Start waiting room countdown 
  if (!gameStates[gameId].countDownStarted) {
    gameStates[gameId].countDownStarted = true;

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
});

  // Set player data as new maps within gameStates - once player starts the Game Scene 
  socket.on('joinRoom', (data) => {
  
    const gameId = data.gameId; 
    const player = data.player; //player object 
    const playerId = data.playerId; // player.playerId = socket.id throughout this codebase // player.playerName is the player's name from the database

    
    // gameStates[gameId] id redefined here for game play
    if (!gameStates[gameId].gameCountStarted) { 
      gameStates[gameId] = {
        players: new Map(),
        started: true, // game started 
        countdown: 0, // ready room count expired 
        countDownStarted: true,  // ready room count expired 
        gameCountDown: 60, // TODO in game count down
        gameCountStarted: false, // countdown not started yet
        gameOver: false
      };
    }
    
    // console.log('Players map before player object is set', Array.from(gameStates[gameId].players.values())); 
    gameStates[gameId].players.set(playerId, player);  // set all player objects as individual maps within gameId
    console.log(`players map immediately after it's set: ${Array.from(gameStates[gameId].players.values())}`)     

});

 socket.on('requestGameTimer', (data) => {
  const gameId = data.gameId;

  //start countdown if it has not already started
  if (!gameStates[gameId].gameCountStarted) {
    gameStates[gameId].gameCountStarted = true; 

  const countDownInterval = setInterval(() => {
      if (gameStates[gameId] && gameStates[gameId].gameCountDown > 0 ) {
        gameStates[gameId].gameCountDown--;
        io.in(gameId).emit('updateGameTimer', { gameCountDown: gameStates[gameId].gameCountDown});
      } 
      else {
      clearInterval(countDownInterval);
      io.in(gameId).emit('requestFinalPlayerStates'); // request an update of the final player lives to calculate the winner
      let updatedCount = 0
      let totalPlayers = gameStates[gameId].players.size;

      const updateTimeout = setTimeout(() => {
        calculateAndAnnounceWinner();
      }, 2000); // 2 second timeout for winner calculation

      console.log('Players before winner calculation:', Array.from(gameStates[gameId].players.values())); 

      function calculateAndAnnounceWinner() {
        if (gameStates[gameId]) return;  // Exit if the game state does not exist

        clearInterval(updateTimeout);

        const playerObjects = Array.from(gameStates[gameId].players.values()) 
        const maxLives = Math.max(...playerObjects.map(player => player.lives));
        const winners = playerObjects.filter(player => player.lives === maxLives);
       
        let message;
        if (winners.length > 1) {
          const winnerNames = winners.map(player => player.playerName).join(", ");
          message = `${winnerNames} wins!`;
        } else if (winners.length === 1) {
          message = `${winners[0].playerName} wins!`;
        } else {
          message = "No winners this game.";
        }
        
        io.in(gameId).emit('gameOverEvent1', { message: message }); 
        console.log('Final winner message:', message);
      }

      socket.on('finalPlayerUpdate', data => {
        const { playerId, lives } = data;
        if (gameStates[gameId].players.has(playerId)) {
          let player = gameStates[gameId].players.get(playerId);
          player.lives = lives;
          gameStates[gameId].players.set(playerId, player);
          updatedCount++;
          if (updatedCount === totalPlayers) {
            console.log('Players after final update:', Array.from(gameStates[gameId].players.values())); 
            calculateAndAnnounceWinner();
          }
        }
      });
    }
  }, 1000);
  }
  });

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

    // if there is only one actve player left, end the game
    const activePlayers = Array.from(gameStates[gameId].players.values()).filter(player => player.active);
    if (activePlayers.length === 1 && gameStates[gameId].gameCountDown < 100 ) {
      // stop the game timer and set the winner as the last remaining player
      gameStates[gameId].gameOver = true; 
      io.in(gameId).emit('gameOverEvent2', { message: `Player ${activePlayers[0].playerName} wins!` });
      
    }

    console.log(`Player ${playerId} died - in game room: ${gameId}.`);
    socket.to(gameId).emit('setDeadPlayerStatus', { playerId, active: false});
  });  



  socket.on('disconnect', () => {
    // Iterate over all game states to find and remove the player
    Object.keys(gameStates).forEach(gameId => {
        if (gameStates[gameId].players.has(socket.id)) {
          
          // disable the player on the client side
          io.in(gameId).emit('setDeadPlayerStatus', { playerId: socket.id, active: false});
          
          // Remove the player from the players map
          gameStates[gameId].players.delete(socket.id);
          console.log(`Player with ID ${socket.id} has left game room ${gameId}`);

          console.log('Players after disconnect:', Array.from(gameStates[gameId].players.values())); 

          // Check if the game room is empty
            if (gameStates[gameId].players.size === 0) {
                // If empty, perform clean up
                if (gameStates[gameId].countdownInterval) {
                    clearInterval(gameStates[gameId].countdownInterval);
                    delete gameStates[gameId];
                }
                console.log(`Game room ${gameId} has been deleted due to no remaining players.`);
            }
        }
    });
});

})
//END Socket Event Listeners---------------------------------------------------------------------------

  // Start listening on the specified port
  server.listen(PORT, "localhost", () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
  });

  module.exports = app;
