import { Scene } from "phaser"; // scenes are where the game logic is written for different parts of the game
import Phaser, { NONE } from "phaser";
import Player from "../../js/Player"
import io from "socket.io-client";

export class Game extends Scene {

  constructor() {

    super("Game"); 

  } 
  
  preload() { 
    this.load.setPath('assets');

    this.load.tilemapTiledJSON("map", "map/battlefield.json");//loads the battlefield.json file
    this.load.image("tiles", "map/battlefield.png");//loads the battlefield.png file that the tile battlefiled.json file references
  
    //Archer character preload
  this.load.spritesheet(
    "player", 
  "/Archers-Character/Archers/Archer-1.png",
      { frameWidth: 64, frameHeight: 64 }
  );    
  this.load.spritesheet(
    "playerLeft", 
  "/Archers-Character/Archers/Archer-1-left.png",
      { frameWidth: 64, frameHeight: 64 }
  );    
  }

  
  create(data) {
    this.socket = data.serverUrl; 
    this.player = data.player
    this.playerId = data.player.id;
    this.sock = io(this.serverUrl);


    
    this.sock.on('playerUpdates', (playerUpdated) => {
      // console.log(`Received player updates from ${playerUpdated.id}. Coordinates - X: ${playerUpdated.x} Y: ${playerUpdated.y} ${typeof playerUpdated.x}`);
      // console.log(`Local player coordinates: ${this.player.x} ${this.player.y} and their types: ${typeof this.player.x}`)
      this.renderPlayers(playerUpdated, this);
  });

    // Limits the amount of times that the game sends updates to the socket
    this.rate_limit = 5;
    this.rate_limit_count = 0;


   const backgroundImage = this.add.image(0,0, "tiles").setOrigin(0);  // creates a tilemap from the battlefield.json file
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
    console.log('positions are:...', positions);
  });
    //***END NEW CONTENT*** ----------------------------------------------------

 // CREATE PLAYER
 this.player = new Player(this, 100, 100, this.playerId, this.playerId);

 this.tileset = this.map.addTilesetImage("Tileset", "tiles");

 this.map.setCollisionBetween();
//Floor collision layer ------------------------------------------------------
 this.collisionLayer = this.map.createLayer("collision", this.tileset, 0, 0);
 this.collisionLayer.setScale(this.scaleFactor);
 this.collisionLayer.setCollisionByExclusion([-1]);
 this.collisionLayer.setCollisionByProperty({ collide: true });
 this.collisionLayer.setAlpha(0.6); // makes layer invisible
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
this.ladderCollision.setScale(this.scaleFactor);
this.ladderCollision.setCollisionByExclusion([-1]);
this.ladderCollision.setCollisionByProperty({ collide: true });
this.physics.add.overlap(this.player, this.ladderCollision);
this.ladderCollision.setAlpha(0.6);

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


    //resize arrow bounding box
  
    // ***BEGIN NEW CONTENT*** ----------------------------------------------------
    this.playerArr = [];
    // Sets up the arrow keys as the input buttons
    this.cursors = this.input.keyboard.createCursorKeys();
    // this.playerArr.push(this.player);
    // Sends the player to the server

    this.socket.emit("playerConnect", this.player); //player object is now being tracked by socket server

    // Remove a player with a given ID from the local client instance
    this.socket.on("removePlayer", (playerId) => {
      let rmPlayer = this.playerArr.find((player) => player.id === playerId);
      rmPlayer.destroy();
      this.players = this.playerArr.filter((player) => player.id !== playerId);
    });

    //END CREATE PLAYER

    //***END NEW CONTENT*** ----------------------------------------------------
  }

createCursorsFromActiveKeys(activeKeys) {
  return {
    up: this.input.keyboard.addKey(activeKeys.up),
    down: this.input.keyboard.addKey(activeKeys.down),
    left: this.input.keyboard.addKey(activeKeys.left),
    right: this.input.keyboard.addKey(activeKeys.right),
  };
}

//***BEGIN NEW CONTENT*** --------------------------------------------------
  renderPlayers(playerData) {
    // console.log(`Types of playerData members ${typeof playerData.x}`)
    let updateCursors = this.createCursorsFromActiveKeys(playerData.activeKeys);
    if (playerData.id !== this.playerId) {
      let updatePlayer = this.playerArr.find(
        (player) => player.id === playerData.id
      );
      if (!updatePlayer) {
        updatePlayer = new Player(
          this,
          playerData.x,
          playerData.y,
          playerData.id,
          playerData.id
        );
        updatePlayer.setOrigin(0.5, 0.5);
        updatePlayer.setScale(this.scaleFactor * 2.5);
        updatePlayer.setAlpha(1);
        updatePlayer.body.setSize(
          this.newBoundingBoxWidth,
          this.newBoundingBoxHeight,
          true
        );
        updatePlayer.body.setOffset(this.offsetX, this.offsetY);
        // updatePlayer.anims.play("idle");
        this.physics.add.collider(updatePlayer, this.collisionLayer);
        this.physics.add.existing(updatePlayer);
        this.playerArr.push(updatePlayer);
        console.log(updatePlayer);
      } else {
        // console.log(`Updating player coords: ${updatePlayer.x} and ${updatePlayer.y}`);
        updatePlayer.setDirection(playerData.direction);
        updatePlayer.setPosition(playerData.x, playerData.y);
        updatePlayer.update(updateCursors);
        console.log(this.playerArr);
      }
    }
  }

  update() {
    // console.log("isGrounded:" + this.player.isGrounded)

    this.physics.world.collide(
      this.player,
      this.collisionLayer,

      (player, tile) => {
        // console.log("Collision detected at position:", tile.pixelX, tile.pixelY);
        // console.log("Collision detected at player position:", player.x, player.y);

        this.player.isGrounded = true;
      }
    );

    this.player.update(this.cursors);
    const activeKeys = {
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown,
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
    };
    this.socket.emit("clientPlayerUpdate", {
      id: this.playerId,
      playerX: this.player.x,
      playerY: this.player.y,
      activeKeys: activeKeys,
      direction: this.player.direction,
    });
  }
}
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

let sleepSetTimeout_ctrl;
function sleep(ms) {
  clearInterval(sleepSetTimeout_ctrl);
  return new Promise(
    (resolve) => (sleepSetTimeout_ctrl = setTimeout(resolve, ms))
  );
}
(async () => {
  await setClientPlayerId();
  await sleep(5000);
})
