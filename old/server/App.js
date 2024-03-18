const express = require("express");
const app = express();
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

// Enable CORS middleware
app.use(cors);

// Serve static files from the "client" directory
app.use(express.static(path.join(__dirname, "..", "client/dist")));

// Create an HTTP server instance
const server = http.createServer(app);

// ***BEGIN NEW CONTENT*** ----------------------------------------------------

// ***ADDED*** this code sets up the connection events that will be used to monitor
// player information
// Create a Socket.IO instance and attach it to the HTTP server
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const players = new Map(); // Map to store player information
// let nextPlayerId = 1; // Initial ID for players

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
// ***END NEW CONTENT*** ----------------------------------------------------

// Start listening on the specified port
server.listen(PORT, "localhost", () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});