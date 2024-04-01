import { Scene } from "phaser"; // scenes are where the game logic is written for different parts of the game
import Phaser, { NONE } from "phaser";
import Player from "../../js/Player";
import io from "socket.io-client";
import "../../src/style.css";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");

    // Loads all the sprite sheets
    this.load.tilemapTiledJSON("map", "map/battlefield.json"); //loads the battlefield.json file
    this.load.image("tiles", "map/battlefield.png"); //loads the battlefield.png file that the tile battlefiled.json file references
    this.load.spritesheet("player", "Archers-Character/Archers/Archer-1.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet(
      "playerLeft",
      "Archers-Character/Archers/Archer-1-left.png",
      { frameWidth: 64, frameHeight: 64 }
    );
    this.load.image("arrow", "Archers-Character/Archers/arrow.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image("arrowLeft", " Archers-Character/Archers/arrowLeft.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create(data) {
    //* Makes the socket accessible in the main game
    this.socket = data.serverUrl; // code refactored. socket is passed in through all scenes as 'data' and initialized in preload scene.

    // this.player = data.player // code refactored
    this.playerId = data.player.id; // code refactored
    this.sock = io(this.serverUrl);

    // Create the projectile group for pooling assets
    // this.arrowGroup = new ArrowGroup(this); // !paused refactoring with this error herror here

    //Creates the listener that waits for other player updates from
    // the server
    this.socket.on("playerUpdates", (playerUpdated) => {
      //Creates the listener that waits for other player updates from
      // the server
      this.renderPlayers(playerUpdated, this);
    });

    // Limits the amount of times that the game sends updates to the socket
    this.rate_limit = 5;
    this.rate_limit_count = 0;

    const backgroundImage = this.add.image(0, 0, "tiles").setOrigin(0); // creates a tilemap from the battlefield.json file
    const scaleFactor = Math.max(
      this.scale.width / backgroundImage.width,
      this.scale.height / backgroundImage.height
    );
    backgroundImage.setScale(scaleFactor);

    //adding collision to floors
    this.map = this.make.tilemap({
      key: "map",
      tileWidth: 12,
      tileHeight: 12,
    });

    // Send the tile indices and other necessary information to the server
    // this.socket.emit('mapData', { tileIndices, tileWidth, tileHeight, mapWidth, mapHeight, scale });

    // Receive the valid spawn positions from the server, deconflicted for each player
    // WIP
    this.socket.on("validPositions", (positions) => {
      console.log("positions are:...", positions);
    });
    //***END NEW CONTENT*** ----------------------------------------------------

    // CREATE PLAYER
    this.player = new Player(this, 100, 100, this.playerId, this.playerId);

    // Establishes the collision layer within the game. Had to be layered
    // on top of everything to ensure proper collision detection
    this.tileset = this.map.addTilesetImage("Tileset", "tiles");
    this.map.setCollisionBetween();
    this.collisionLayer = this.map.createLayer("collision", this.tileset, 0, 0);
    // console.log(this.collisionLayer)
    this.collisionLayer.setScale(this.scaleFactor);
    this.collisionLayer.setCollisionByExclusion([-1]);
    this.collisionLayer.setCollisionByProperty({ collide: true });
    this.collisionLayer.setAlpha(0.6); // makes layer invisible

    //***BEGIN NEW CONTENT*** ----------------------------------------------------------------
    // Process and send the map data to the server
    // Extract tile indices from the collision layer

    this.tileIndices = [];
    this.collisionLayer.forEachTile((tile) => {
      this.tileIndices.push(tile.index);
    });

    // Extract other necessary information
    const tileWidth = this.collisionLayer.tileWidth;
    const tileHeight = this.collisionLayer.tileHeight;
    const mapWidth = this.collisionLayer.width;
    const mapHeight = this.collisionLayer.height;
    const scale = {
      x: this.collisionLayer.scaleX,
      y: this.collisionLayer.scaleY,
    };

    //TODO: Send the tile indices and other necessary information to the server
    // this.socket.emit('mapData', { tileIndices, tileWidth, tileHeight, mapWidth, mapHeight, scale });
    // Receive the valid spawn positions from the server, deconflicted for each player
    // // WIP
    // this.socket.on('validPositions', (positions) => {
    //   console.log(positions);
    // });

    // TODO - Debug
    // for testing purpose
    this.player.setOrigin(0.5, 0.5);
    // this.player.setScale(this.scaleFactor * 2.5); //!  can't find player after adding this code below
    // resizing bouncing box
    this.newBoundingBoxWidth = 16;
    this.newBoundingBoxHeight = 15;
    this.offsetX = (this.player.width - this.newBoundingBoxWidth) / 2;
    this.offsetY = (this.player.height - this.newBoundingBoxHeight) / 1.5;

    // Set the new size of the bounding box
    this.player.body.setSize(
      this.newBoundingBoxWidth,
      this.newBoundingBoxHeight,
      true
    );

    // Reposition the bounding box relative to the player's center
    this.player.body.setOffset(this.offsetX, this.offsetY);
    // this.player.anims.play("idleLeft"); // *new entry test this

    // Add the life counter to the scene
    // TODO: Implement function that decrements this when hit
    // requires arrow collision working WIP
    // this.lifeText = this.add.text(16, 16, 'Lives: ' + this.lifeCounter, { fontSize: '32px', fill: '#fff' }); // * new entry test this

    //resize arrow bounding box
    // TODO - Non functional code
    // ***BEGIN NEW CONTENT*** ----------------------------------------------------
    this.playerArr = [];
    // Sets up the arrow keys as the input buttons
    this.cursors = this.input.keyboard.createCursorKeys();

    // Sends the player to the server for storage/broadcast
    // to other clients
    this.socket.emit("playerConnect", this.player);

    // Remove a player with a given ID from the local client instance
    this.socket.on("removePlayer", (playerId) => {
      let rmPlayer = this.playerArr.find((player) => player.id === playerId);
      try {
        rmPlayer.destroy();
        this.players = this.playerArr.filter(
          (player) => player.id !== playerId
        );
      } catch {}
    });

    //END CREATE PLAYER

    // ? code in question : ----------------------------------------------
    this.platformCollision = this.map.createLayer(
      "platform_collision",
      this.tileset,
      0,
      0
    );
    this.platformCollision.setScale(this.scaleFactor);
    this.platformCollision.setCollisionByExclusion([-1]);
    this.platformCollision.setCollisionByProperty({ collide: true });
    this.physics.add.collider(this.player, this.platformCollision);
    this.platformCollision.setAlpha(0.6);
    //ladder collision layer -----------------------------------------------------
    this.ladderCollision = this.map.createLayer(
      "ladder_collision",
      this.tileset,
      0,
      0
    );

    // TODO sync the ladder
    // this.ladderCollision.setScale(this.scaleFactor);
    // this.ladderCollision.setCollisionByExclusion([-1]);
    // this.ladderCollision.setCollisionByProperty({ collide: true });
    // this.physics.add.overlap(this.player, this.ladderCollision);
    // this.ladderCollision.setAlpha(0.6);

    // Reposition the bounding box relative to the player's center
    this.player.body.setOffset(this.offsetX, this.offsetY);

    //resize arrow bounding box
    // TODO - Non functional code
    // ***BEGIN NEW CONTENT*** ----------------------------------------------------
    this.playerArr = [];
    // Sets up the arrow keys as the input buttons
    this.cursors = this.input.keyboard.createCursorKeys();

    // Sends the player to the server for storage/broadcast
    // to other clients
    this.socket.emit("playerConnect", this.player);

    // Remove a player with a given ID from the local client instance
    this.socket.on("removePlayer", (playerId) => {
      let rmPlayer = this.playerArr.find((player) => player.id === playerId);
      rmPlayer.destroy();
      this.players = this.playerArr.filter((player) => player.id !== playerId);
    });

    //END CREATE PLAYER

    //***END NEW CONTENT*** ----------------------------------------------------
  }
  // Turns the other players' data into an object that can be used
  // in the update method
  createCursorsFromActiveKeys(activeKeys) {
    return {
      up: this.input.keyboard.addKey(activeKeys.up),
      down: this.input.keyboard.addKey(activeKeys.down),
      left: this.input.keyboard.addKey(activeKeys.left),
      right: this.input.keyboard.addKey(activeKeys.right),
    };
  }

  //***BEGIN NEW CONTENT*** --------------------------------------------------
  // ! Here is the error ?
  // Renders the players based on the data from the server
  renderPlayers(playerData) {
    // console.log(`Types of playerData members ${typeof playerData.x}`)
    if (playerData.id !== this.playerId) {
      let updateCursors = this.createCursorsFromActiveKeys(
        playerData.activeKeys
      );

      let updatePlayer = this.playerArr.find(
        (player) => player.id === playerData.id
      );
      // If the player doesnt exist in the client-side map, create it
      if (!updatePlayer) {
        updatePlayer = new Player(
          this,
          playerData.x,
          playerData.y,
          playerData.id,
          playerData.id
        );
        updatePlayer.setOrigin(0.5, 0.5);
        // updatePlayer.setScale(this.scaleFactor * 2.5); // ! not sure why this code is not working but it was the death of me.
        updatePlayer.setAlpha(1);
        updatePlayer.body.setSize(
          this.newBoundingBoxWidth,
          this.newBoundingBoxHeight,
          true
        );
        updatePlayer.body.setOffset(this.offsetX, this.offsetY);
        this.physics.add.collider(updatePlayer, this.collisionLayer);
        this.physics.add.existing(updatePlayer);
        this.playerArr.push(updatePlayer);
        console.log(updatePlayer);
        // Otherwise, update the player with the given data
      } else {
        updatePlayer.setDirection(playerData.direction);
        updatePlayer.setPosition(playerData.x, playerData.y);
        updatePlayer.update(updateCursors);
        console.log(this.playerArr);
      }
    }
  }

  update() {
    this.physics.world.collide(
      this.player,
      this.collisionLayer,
      (player, tile) => {
        // console.log("Collision detected at position:", tile.pixelX, tile.pixelY);
        // console.log("Collision detected at player position:", player.x, player.y);

        this.player.isGrounded = true;
      }
    );

    // Update the player with the current arrow key combinations/presses
    this.player.update(this.cursors);
    // Packages the keypresse into a json object for the server
    const activeKeys = {
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown,
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
    };
    // Sends pertinent information to the server
    this.socket.emit("clientPlayerUpdate", {
      id: this.playerId,
      playerX: this.player.x,
      playerY: this.player.y,
      activeKeys: activeKeys,
      direction: this.player.direction,
    });
  }
}

// Function to get the player ID from the server before starting the game
async function getPlayerIdFromSocket() {
  return new Promise((resolve, reject) => {
    // Listen for player ID response from the server
    this.sock.once("playerIdRes", (pid) => {
      resolve(pid); // Resolve the promise with the player ID
    });

    // Request player ID from the server
    this.sock.emit("playerIdReq");
  });
}

// Function that sets the received playerID
async function setClientPlayerId() {
  try {
    const hold = await getPlayerIdFromSocket();
    this.playerId = hold;
    console.log("Received player ID:", this.playerId);
  } catch (error) {
    console.error("Error:", error);
  }
}

//***END NEW CONTENT*** ----------------------------------------------------
