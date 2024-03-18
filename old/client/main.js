import "./style.css";
import Phaser, { NONE } from "phaser";
import Player from "./js/classes/Player.js";
import io from "socket.io-client";

const serverUrl = "http://localhost:3000"

const sizes = {
  width: 1000,
  height: 600,
};

const speedDown = 300;
const sock = io(serverUrl);
let playerId = -1;

//creating game scene
class GameScene extends Phaser.Scene {
  constructor(playerId) {
    super("scene-game");
    this.playerId = playerId;
  }

  preload() {
    
    this.load.tilemapTiledJSON("map", "/game-assets/map/battlefield.json");
    this.load.image("tiles", "/game-assets/map/battlefield.png");
    this.load.spritesheet(
      "player",
      "/game-assets/Archers-Character/Archers/Archer-1.png",
      { frameWidth: 64, frameHeight: 64 }
    );
    this.load.spritesheet(
      "playerLeft",
      "/game-assets/Archers-Character/Archers/Archer-1-left.png",
      { frameWidth: 64, frameHeight: 64}
    );

  }

  create() {
    this.socket = sock;
    this.socket.on('playerUpdates', (playerUpdated) => {
      // console.log(`Received player updates from ${playerUpdated.id}. Coordinates - X: ${playerUpdated.x} Y: ${playerUpdated.y} ${typeof playerUpdated.x}`);
      // console.log(`Local player coordinates: ${this.player.x} ${this.player.y} and their types: ${typeof this.player.x}`)
      this.renderPlayers(playerUpdated, this);
  });

    // Limits the amount of times that the game sends updates to the socket
    this.rate_limit = 5;
    this.rate_limit_count = 0;

     this.backgroundImage = this.add.image(0, 0, "tiles").setOrigin(0);
    //scalling funtion
     this.scaleFactor = Math.max(
      this.scale.width / this.backgroundImage.width,
      this.scale.height / this.backgroundImage.height
    );
    this.backgroundImage.setScale(this.scaleFactor);

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
    this.socket.on('validPositions', (positions) => {
      console.log(positions);
    });
//***END NEW CONTENT*** ----------------------------------------------------

// CREATE PLAYER
    this.player = new Player(this, 100, 100, this.playerId, this.playerId);

    this.tileset = this.map.addTilesetImage("Tileset", "tiles");
    this.map.setCollisionBetween();
    this.collisionLayer = this.map.createLayer("collision", this.tileset, 0, 0);
    console.log(this.collisionLayer)
    this.collisionLayer.setScale(this.scaleFactor);
    this.collisionLayer.setCollisionByExclusion([-1]);
    this.collisionLayer.setCollisionByProperty({ collide: true });
    this.collisionLayer.setAlpha(.6); // makes layer invisible

//***BEGIN NEW CONTENT*** ----------------------------------------------------------------
    // Process and send the map data to the server
    // Extract tile indices from the collision layer
    this.tileIndices = [];
    this.collisionLayer.forEachTile(tile => {
        this.tileIndices.push(tile.index);
    });

    // Extract other necessary information
    const tileWidth = this.collisionLayer.tileWidth;
    const tileHeight = this.collisionLayer.tileHeight;
    const mapWidth = this.collisionLayer.width;
    const mapHeight = this.collisionLayer.height;
    const scale = {
        x: this.collisionLayer.scaleX,
        y: this.collisionLayer.scaleY
    };




    // for testing purpose
    this.player.setOrigin(0.5, 0.5);
    this.player.setScale(this.scaleFactor * 2.5);
    //resizing bouncing box
    this.newBoundingBoxWidth = 16;
    this.newBoundingBoxHeight = 15;
    this.offsetX = (this.player.width - this.newBoundingBoxWidth) / 2;
    this.offsetY = (this.player.height - this.newBoundingBoxHeight) / 1.5;

    // Set the new size of the bounding box
    this.player.body.setSize(this.newBoundingBoxWidth, this.newBoundingBoxHeight, true);

    // Reposition the bounding box relative to the player's center
    this.player.body.setOffset(this.offsetX, this.offsetY);
    this.player.anims.play("idleLeft");

    // Add collision between player and collision layer
    
    // this.physics.add.existing(this.player);

    

// ***BEGIN NEW CONTENT*** ----------------------------------------------------
    this.playerArr = [];
    // Sets up the arrow keys as the input buttons
    this.cursors = this.input.keyboard.createCursorKeys();
    // this.playerArr.push(this.player);
    // Sends the player to the server

    this.socket.emit('playerConnect', this.player);


    // Remove a player with a given ID from the local client instance
    this.socket.on('removePlayer', (playerId) => {
      let rmPlayer = this.playerArr.find(player => player.id === playerId);
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
      right: this.input.keyboard.addKey(activeKeys.right)
  };
}

//***BEGIN NEW CONTENT*** --------------------------------------------------
renderPlayers(playerData) {
  // console.log(`Types of playerData members ${typeof playerData.x}`)
  let updateCursors = this.createCursorsFromActiveKeys(playerData.activeKeys)
  if (playerData.id !== this.playerId) {
      let updatePlayer = this.playerArr.find(player => player.id === playerData.id);
      if (!updatePlayer) {
          updatePlayer = new Player(this, playerData.x, playerData.y, playerData.id, playerData.id);
          updatePlayer.setOrigin(0.5, 0.5);
          updatePlayer.setScale(this.scaleFactor * 2.5);
          updatePlayer.setAlpha(1);
          updatePlayer.body.setSize(this.newBoundingBoxWidth, this.newBoundingBoxHeight, true);
          updatePlayer.body.setOffset(this.offsetX, this.offsetY);
          // updatePlayer.anims.play("idle");
          this.physics.add.collider(updatePlayer, this.collisionLayer);
          this.physics.add.existing(updatePlayer);
          this.playerArr.push(updatePlayer);
          console.log(updatePlayer);

      } else {
          // console.log(`Updating player coords: ${updatePlayer.x} and ${updatePlayer.y}`);
          updatePlayer.setDirection(playerData.direction)
          updatePlayer.setPosition(playerData.x, playerData.y);
          updatePlayer.update(updateCursors);
          // console.log(this.playerArr);
      }
  }
}

update() {
  // console.log("isGrounded:" + this.player.isGrounded)
  this.physics.world.collide(this.player, this.collisionLayer, (player, tile) => {
    // console.log("Collision detected at position:", tile.pixelX, tile.pixelY);
    // console.log("Collision detected at player position:", player.x, player.y);

    this.player.isGrounded = true;
});

  this.player.update(this.cursors);
  const activeKeys = {
    up: this.cursors.up.isDown,
    down: this.cursors.down.isDown,
    left: this.cursors.left.isDown,
    right: this.cursors.right.isDown
};
  this.socket.emit('clientPlayerUpdate', { "id": this.playerId, "playerX": this.player.x, "playerY": this.player.y, "activeKeys": activeKeys, "direction": this.player.direction});

}
}
  async function getPlayerIdFromSocket() {
    return new Promise((resolve, reject) => {
      // Listen for player ID response from the server
      sock.once('playerIdRes', (pid) => {
        resolve(pid); // Resolve the promise with the player ID
      });
  
      // Request player ID from the server
      sock.emit('playerIdReq');
    });
  }


  async function setClientPlayerId(){
    try {
      const hold = await getPlayerIdFromSocket();
      playerId = hold;
      console.log('Received player ID:', playerId);
    }

    catch (error) {
          console.error('Error:', error);
    }
  }

//***END NEW CONTENT*** ----------------------------------------------------
let sleepSetTimeout_ctrl;
function sleep(ms) {
  clearInterval(sleepSetTimeout_ctrl);
  return new Promise(resolve => sleepSetTimeout_ctrl = setTimeout(resolve, ms));
}
(async () => {

  await setClientPlayerId();
  await sleep(5000);

  const config = {
    type: Phaser.WEBGL,
    width: sizes.width,
    height: sizes.height,
    mode: Phaser.Scale.FIT,
    canvas: gameCanvas,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: speedDown },
        debug: true,
      },
    },
    scene: [new GameScene(playerId)],
  };

  const game = new Phaser.Game(config);
})();







