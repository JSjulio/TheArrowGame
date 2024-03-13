import "./style.css";
import Phaser from "phaser";
import Player from "./js/classes/Player.js";
import io from "socket.io-client";

const serverUrl = "http://localhost:3000"

const sizes = {
  width: 1000,
  height: 600,
};

const speedDown = 300;

//creating game scene
class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
  }

  preload() {
    this.load.tilemapTiledJSON("map", "/game-assets/map/battlefield.json");
    this.load.image("tiles", "/game-assets/map/battlefield.png");
    this.load.spritesheet(
      "player",
      "/game-assets/Archers-Character/Archers/Archer-1.png",
      { frameWidth: 64, frameHeight: 64 }
    );
  }

  create() {
    this.socket = io(serverUrl);

    const backgroundImage = this.add.image(0, 0, "tiles").setOrigin(0);
    //scalling funtion
    const scaleFactor = Math.max(
      this.scale.width / backgroundImage.width,
      this.scale.height / backgroundImage.height
    );
    backgroundImage.setScale(scaleFactor);

    //adding collision to floors
    const map = this.make.tilemap({
      key: "map",
      tileWidth: 12,
      tileHeight: 12,
    });

    const tileset = map.addTilesetImage("Tileset", "tiles");
    console.log(tileset)
    const collisionLayer = map.createLayer("collision", tileset, 0, 0);
    collisionLayer.setScale(scaleFactor);
    collisionLayer.setCollisionByExclusion([-1]);
    collisionLayer.setCollisionByProperty({ collide: true });
    collisionLayer.setAlpha(0); // makes layer invisible

//***BEGIN NEW CONTENT*** ----------------------------------------------------------------
    // Process and send the map data to the server
    // Extract tile indices from the collision layer
    const tileIndices = [];
    collisionLayer.forEachTile(tile => {
        tileIndices.push(tile.index);
    });

    // Extract other necessary information
    const tileWidth = collisionLayer.tileWidth;
    const tileHeight = collisionLayer.tileHeight;
    const mapWidth = collisionLayer.width;
    const mapHeight = collisionLayer.height;
    const scale = {
        x: collisionLayer.scaleX,
        y: collisionLayer.scaleY
    };

  // Send the tile indices and other necessary information to the server
  // this.socket.emit('mapData', { tileIndices, tileWidth, tileHeight, mapWidth, mapHeight, scale });

    // Receive the valid spawn positions from the server, deconflicted for each player
    // WIP
    this.socket.on('validPositions', (positions) => {
      console.log(positions);
    });
//***END NEW CONTENT*** ----------------------------------------------------

// CREATE PLAYER
    this.player = new Player(this, 100, 100, "wow");
    // for testing purpose
    this.player.setOrigin(0.5, 0.5);
    this.player.setScale(1.75);
    //resizing bouncing box
    const newBoundingBoxWidth = 16;
    const newBoundingBoxHeight = 13;
    const offsetX = (this.player.width - newBoundingBoxWidth) / 2;
    const offsetY = (this.player.height - newBoundingBoxHeight) / 1.5;


    // Set the new size of the bounding box
    this.player.body.setSize(newBoundingBoxWidth, newBoundingBoxHeight, true);

    // Reposition the bounding box relative to the player's center
    this.player.body.setOffset(offsetX, offsetY);
    this.player.anims.play("idle");

    // Add collision between player and collision layer
    this.physics.add.collider(this.player, collisionLayer);

// ***BEGIN NEW CONTENT*** ----------------------------------------------------
    this.players = [];
    // Sets up the arrow keys as the input buttons
    this.cursors = this.input.keyboard.createCursorKeys();

    // Sends the player to the server
    this.socket.on('connect', () => {
      this.socket.emit('playerConnect', this.player);
    });

    // Received the player ID from the server

    // Remove a player with a given ID from the local client instance
    this.socket.on('removePlayer', (playerId) => {
      this.players = this.players.filter((player) => player.id !== playerId);
      console.log(this.players)
    });

//END CREATE PLAYER

//***END NEW CONTENT*** ----------------------------------------------------
}

//***BEGIN NEW CONTENT*** --------------------------------------------------
  renderPlayers(playersJson) {
    // Create player sprites based on received player data
    console.log(playersJson)
    playersMap.forEach((data) => {
        if (data.id !== this.playerId) { // Skip rendering the local player
            const player = this.add.sprite(data.x, data.y, 'player');
            player.id = data.id; // Store player ID as a property

            this.players.push(player); // Store the player sprite
        }
    });
}
  update() {

        // Player movement logic
        // this.player.update()
        if (this.cursors.left.isDown) {
          // this.player.update(this.cursors.left)
          this.player.setVelocityX(-speedDown); // Move left
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(speedDown); // Move right
        } else {
          this.player.setVelocityX(0); // Stop movement if no key is pressed
        }

        if (this.cursors.up.isDown && this.player.body.onFloor()) {
          this.player.setVelocityY(-speedDown*3); // Make the player jump if up arrow key is pressed and player is on the floor
        }
        else {
          this.player.setVelocityY(0);
        }

        this.socket.emit('clientPlayerUpdate', this.player);
        this.socket.on('playerUpdates', (playerUpdated) => {
          // console.log(playerMap);
          this.renderPlayers(playerUpdated);
        })
      }
  }


//***END NEW CONTENT*** ----------------------------------------------------

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
  scene: [GameScene],
};

const game = new Phaser.Game(config);
