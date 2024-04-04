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
app.use(express.static(path.join(__dirname, "..", "dist")));   // refactoring required. 

// Create an HTTP server instance
const server = http.createServer(app);

// Logging middleware 
app.use(morgan("dev"));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Authorization middleware 
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    const token = authHeader.slice(7, authHeader.length); // Extract token

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

// Once the game Scene socket is created, server will listen for the following events
io.on('connection', (socket) => {

    // Get the map data and determine valid positions for player spawns
      socket.on('mapData', ({ tileIndices, tileWidth, tileHeight, mapWidth, mapHeight, scale }) => {
          // Reconstruct collision layer based on tile indices
          // Perform calculations to determine valid spawn locations

          const validSpawnLocations = [];

          for (let y = 0; y < mapHeight; y++) {
              for (let x = 0; x < mapWidth; x++) {
                  const tileIndex = tileIndices[y * mapWidth + x];
                  console.log(`Tile: ${tileIndex}`);
                  // Assuming tile index -1 represents no collision
                  if (tileIndex === -1) {
                      // Calculate position of tile in world coordinates
                      const posX = x * tileWidth * scale.x;
                      const posY = y * tileHeight * scale.y;

                      // console.log(`Position ${posX} ${posY}`)

                      let valid = true;
                      for (const [id, playerObject] of players.entries()) {
                          // console.log(playerObject)
                          if (posX === playerObject.x || posY === playerObject.y) {
                              valid = false;
                              break; // Exit the loop early if collision is found

                          // Add position to valid spawn locations
                          }
                        }
                      if(valid){
                        validSpawnLocations.push({ x: posX, y: posY });
                      }
                  }
                }
              }
          // Emit valid spawn locations back to the client
          socket.emit('validPositions', validSpawnLocations);
      });

    socket.on('playerIdReq', () => {
      const pid = socket.id; // Player ID
      if(!players.has(pid)){
        socket.emit('playerIdRes', (pid));
      }
    })

    // Listen for player connection from client
    socket.on('playerConnect', (player) => {

        // players.set(player.id, player.id);

        // Broadcast to all the clients that a new player has joined, along with the information of that player
        socket.broadcast.emit('newPlayer', player);
        console.log('Player connected:', player.name, 'with ID:', socket.id);
        // console.log(players)
    });

  // Listen for player data from client
  socket.on('newPlayerConnect', (playerData) => {
    
    socket.broadcast.emit('newPlayerConnect', playerData);
    // console.log('New player connected:', playerData.name);
  
  });
  socket.on('clientPlayerUpdate', (playerData) => {

    players.set(playerData.id, playerData); 
    // console.log(playerData.activeKeys)
    socket.broadcast.emit('playerUpdates', {'id': playerData.id, 'x': playerData.playerX, 'y': playerData.playerY, 'activeKeys': playerData.activeKeys, 'direction': playerData.direction});
  });

  // Handle disconnection
  socket.on('disconnect', () => {
      console.log(`A user disconnected from TheArrowGame - SocketId deteled from players map: ${socket.id}`);
      socket.broadcast.emit("removePlayer", (socket.id))
      // Remove player data from players map
      players.delete(socket.id);
  });
});


// ***BEGIN NEW CONTENT*** -----------------------------------------------------------------------
// lobby scoket connection that creates serveral game sockets allowsing for various rooms 
    //TODO Find out why bug is occuring when player creates a game room.
      // // gameId not being passed to the server? 
      // gameStates[gameId] is not being created.
      // recursve loop created when player creates a game room.
          // TODO : create a button that allows player to join an existing game room if it isn't full.  

// TODO: Method 2
//Method 2: Initialize a random room and have players be able to join until the room is full with 10 players 
//Add a timer which denies access to the room after a certain amount of time has lapsed. 
        // if within the set period of time and the room is not full , player that clicks this selection will be added to the room.
        // : if the room is full, player will be added to a queue to wait for the next available room. Once room no longer has people in it, it will be destroyed.
      
          // socket.on('initRandomRoom', () => { 
      //   let randomRoom = 'room-' + Math.floor(Math.random() * 10000);
      //   socket.join(randomRoom); 
      //   socket.emit('randomRoomInitialized', { message: 'random room created', room: randomRoom });
      // }); 


/// ***BEGIN NEW CONTENT*** -----------------------------------------------------------------------

const lobbySocket = io.of("/lobby"); // Initialize lobby socket.io connection
const gameStates = {}; // Map to store game state information


// Listen for connection to the lobby socket.io connection
  lobbySocket.on("connection", (socket) => {
    socket.on("joinLobby", (player) => {
        socket.join('gameLobby'); // Joins player into the Lobby socket.io connection
        console.log(`Player "${player.name}" connected to the lobby 🎯 !`);
        socket.emit('joinedLobby', { message: `${player.name}, welcome to the TheArrowGame lobby!`});   // Emit a message to the client that they have joined the lobby socket.io connection
    });

// Method 1: Create a room with a specific gameID through lobby form. 
    socket.on('createGameRoom', ({gameId, player}) => {
          // console.log('gameId:', gameId, 'player:', player);
      if (!gameStates[gameId]) { 
        gameStates[gameId] = {
          players: new Map() 
        };
        console.log(`Game room ${gameId} created`); 
      }

      // If the game is at capacity (10 players), deny player entry and inform client 
      if (gameStates[gameId].players.size >= 10) {
        socket.emit('gameAtPlayerCapacity', { message: 'Game room is at capacity', gameId });
      } else {
        // Add the player to the game state
        gameStates[gameId].players.set(socket.id, player);
        // Add the player to the game room
        console.log(gameStates[gameId]); 
        socket.emit('gameRoomCreated', { gameId, message: `you've created game room: ${gameId}!` });
        lobbySocket.to('/lobby').emit('gameRoomCreated', {message: ` ${player.id} you've created game: ${gameId}!` });    

        // Notify all players in the room that a new player has joined
        lobbySocket.to(gameId).emit('playerJoinedRoom', {message: player.name, gameId});
    }
}); 

     

    // Handle player disconnecting
    socket.on('disconnect', () => {
      Object.keys(gameStates).forEach(gameId => {
        if (gameStates[gameId].players.has(socket.id)) {
          gameStates[gameId].players.delete(socket.id);
          lobbySocket.to(gameId).emit('playerLeft', { player: socket.id, gameId });
          if (gameStates[gameId].players.size === 0) {
            delete gameStates[gameId];
          }
      }}
    );  
  });        

});

// ***END NEW CONTENT*** -------------------------------------------------------------------------


// Start listening on the specified port
server.listen(PORT, "localhost", () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});



module.exports = app;



// Before this note is the old version of the server file.