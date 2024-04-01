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

//* Authorization middleware 
// Verifies the user token and the private JWT_SECRET passcode to authorize users
// req.user parameter- is required to access server/api private endpoints
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



// This code sets up the connection events that will be used to monitor
// player information
// Create a Socket.IO instance and attach it to the HTTP server
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


const players = new Map(); // Map to store player information

// On a connection through the socket, it will listen for the following events
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
      const pid = socket.id;
      if(!players.has(pid)){
        socket.emit('playerIdRes', (pid));
      }
    })

    // Listen for player connection from client
    socket.on('playerConnect', (player) => {

        players.set(player.id, player);

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
      console.log('A user disconnected: ' + socket.id);
      socket.broadcast.emit("removePlayer", (socket.id))
      // Remove player data from players map
      players.delete(socket.id);

  });
});


// ***ADDED*** -----------------------------------------------------------------------

//TODO Create gameState object to store the state of all rooms created 
const gameStates = {}; // Map to store game state information



// ***BEGIN NEW CONTENT*** -----------------------------------------------------------------------
//* created a dedicated socket.io for the lobby scene and game rooms created by players or automatically. 
//* Previous socket io connection is now active up until players sign in. Once they do sign in , they enter the lobby socket.io connection. 

// the code below listens for when a client enters the lobby scene / emits a message to all clients in the lobby

// Initialize lobby socket.io connection
const lobbySocket = io.of("/lobby");

  // Listen for connections on the lobby socket 
  lobbySocket.on("connection", (socket, playerId) => {
  
    // Listen for joinLobby event
    socket.on("joinLobby", () => {

        // Joins player into the Lobby socket.io connection
        socket.join('gameLobby'); 
        console.log(`User ${playerId} connected to the lobby`);
        
        // Emit a message to the client that they have joined the lobby socket.io connection
        socket.emit('joinedLobby', { message: 'you have joined the lobby', playerId: playerId }); 

        // Broadcast to all clients in the gameLobby room that a new player has joined
        lobbySocket.to('/lobby').emit('newPlayerInLobby', { playerId: playerId, socketId: socket.id});
    })
    
// ***BEGIN NEW CONTENT*** -----------------------------------------------------------------------
// logic for player joining a game room socket.io connection through form input

    // Method 1: Create a room with a specific game ID
    //TODO: Add a timer which denies access to the room after a certain amount of time. Once room no longer has people in it, it will be destroyed. 
    //TODO: Set a limit to the number of players that can join the room.

    socket.on('createGameRoom', (gameId, playerId) => {
    socket.join(gameId);
      if (!gameStates[gameId]) { 
        gameStates[gameId] = { 
          players: [],
         };
      }

      // Add the player to room's game state
      gameStates[gameId].players.push(socket.id); 

      //Confirm to the player they have joined the room
    socket.emit('gameRoomCreated', {gameId: `${gameId}` + 'has been created!' });    

    // Notify all players in the room that a new player has joined
    lobbySocket.to(gameId).emit('playerJoinedRoom', {socketId: socket.id, gameId: gameId, playerId: playerId + 'has joined the room!' +`${gameId}`});
    }); 

     

     //Method 2: Initialize a random room and have players be able to join until the room is full with 10 players 
     // TODO: Add a timer which denies access to the room after a certain amount of time has lapsed. 
     // TODO: if within the set period of time and the room is not full , player that clicks this selection will be added to the room.
    // TODO: if the room is full, player will be added to a queue to wait for the next available room. Once room no longer has people in it, it will be destroyed.
    // socket.on('initRandomRoom', () => { 
    //   let randomRoom = 'room-' + Math.floor(Math.random() * 10000);
    //   socket.join(randomRoom); 
    //   socket.emit('randomRoomInitialized', { message: 'random room created', room: randomRoom });
    // }); 

    // Handle player disconnecting
  socket.on('disconnect', () => {
    // Remove the player from any game rooms and update game state
    const rooms = Object.keys(socket.rooms);
    rooms.forEach((gameId) => {
      if (gameId !== socket.id) { // Skip the socket's own ID
        // Remove the player from the game state
        gameStates[gameId].players = gameStates[gameId].players.filter(id => id !== socket.id);

        // Notify others in the room
        lobbySocket.to(gameId).emit('playerLeft', { userId: socket.id, room: gameId });

        // If the room is empty, delete the game state
        if (gameStates[roomName].players.length === 0) {
        delete gameStates[roomName];
      }
      }}
    );  
  });        

   

    //Handle disconnection 
    socket.on('disconnect', () => {
      console.log('A user disconnected from lobby: ' + socket.id);
      socket.broadcast.emit("removePlayer", (socket.id))
      // Remove player data from players map
      players.delete(socket.id);
    }
  );
});
// ***END NEW CONTENT*** -------------------------------------------------------------------------





// Start listening on the specified port
server.listen(PORT, "localhost", () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});



module.exports = app;
