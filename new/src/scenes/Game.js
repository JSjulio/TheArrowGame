import { Scene } from "phaser"; // scenes are where the game logic is written for different parts of the game
import Phaser, { NONE } from "phaser";
import Player from "../../js/Player";
import "../../src/style.css";

export class Game extends Scene {
  constructor() {
    super("Game");
    // this.playerId = null;
    this.arrows = [];
    this.player = null;
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

    this.load.image("arrow", "Archers-Character/Archers/arrow.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create(data) {

    // set game, player, and socket information from the data object
    this.gameId = data.gameId;
    this.playerId = data.playerId;
    this.socket = data.socket;
    this.sock = this.socket;
    this.playerDb = data.player;
    this.playerName = data.playerName;
    this.playerId = data.socket.id; 
    //create floor collision layer
    this.map = this.make.tilemap({
      key: "map",
      tileWidth: 12,
      tileHeight: 12,
    });
  
    // Room is started from the Ready scene via the server emitting the startGame event



    //Verify the gameId and playerId // TODO TEST and remove
    this.socket.emit("joinGameRoom", {
      gameId: this.gameId,
      playerId: this.playerId,
    });

    //Creates the listener that waits for other player updates from the server
    this.socket.on("playerUpdates", (playerUpdated) => {
      //Creates the listener that waits for other player updates from the server
      this.renderPlayers(playerUpdated, this);
    });

    // Limits the amount of times that the game sends updates to the socket
    this.rate_limit = 1;
    this.rate_limit_count = 0;

    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const scaleFactorX = screenWidth / this.map.widthInPixels;
    const scaleFactorY = screenHeight / this.map.heightInPixels;

    const backgroundImage = this.add.image(0, 0, "tiles").setOrigin(0); // creates a tilemap from the battlefield.json file
    backgroundImage.setScale(scaleFactorX, scaleFactorY);


    // CREATE and process player map and send to the server
    this.player = new Player(
      this,
      100,
      100,
      this.playerId,
      this.playerId,
      this.gameId
    ); // here this.player encompasses the information that will be passed to the player, shared to the player.js file, and sent to the Map of Players on the server side

    // Establishes the collision layer within the game. Had to be layered
    // on top of everything to ensure proper collision detection
    this.tileset = this.map.addTilesetImage("Tileset", "tiles");
    this.map.setCollisionBetween();
    this.collisionLayer = this.map.createLayer("collision", this.tileset, 0, 0);
    // console.log(this.collisionLayer)
    this.collisionLayer.setScale(scaleFactorX, scaleFactorY);
    this.collisionLayer.setCollisionByExclusion([-1]);
    this.collisionLayer.setCollisionByProperty({ collide: true });
    this.collisionLayer.setAlpha(0.6);

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

    // for testing purpose
    this.player.setOrigin(0.5, 0.5);

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

    // Reposition the bounding box relative to the player's center
    this.player.body.setOffset(this.offsetX, this.offsetY);

    this.playerArr = [];

    // Adds an collision listner between players and arrows
    this.physics.add.collider(
      this.arrows,
      this.player,
      this.arrowHitPlayer,
      null,
      this
    );

    // Sets up the arrow keys as the input buttons
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors.space = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    //Sends the player to the server for storage/broadcast to other clients
    this.socket.emit("joinRoom", { player: this.player, gameId: this.gameId });


    // Listen for the event when another player joins the same room
    this.socket.on("playerInGameMap", (response) => {
      console.log(`${response.message}`);
    });
    // Remove a player with a given ID from the local client instance
    this.socket.on("removePlayer", (playerId) => {
      let rmPlayer = this.playerArr.find((player) => player.id === playerId);
      rmPlayer.destroy();
      this.players = this.playerArr.filter((player) => player.id !== playerId); // refresh the player array
    });

    // Listen for playerShooting event from the server
    this.socket.on("playerShooting", (shootData) => {
      // console.log(shootData);
      this.createArrow(
        shootData.x,
        shootData.y,
        shootData.direction,
        shootData.playerId
      ); // call the createArrow function to recreate arrow sprite at the position received from the server
    });

    //*NEWCONTENT- Listen for the event when a player dies and update status to inactive
    this.socket.on("setDeadPlayerStatus", (data) => {
      const { playerId, active } = data;
      // console.log('active here has a value of:', active, 'playerId:', playerId)
      //find the player from the player array
      let playerToUpdate = this.playerArr.find((p) => p.id === playerId);
      if (playerToUpdate) {
        playerToUpdate.active = active; // Set the player as inactive
        playerToUpdate.setAlpha(0.5);
        console.log("deadPlayer:", playerToUpdate, "is inactive:");
      }
    });
  } //END Create Method---------------------------------------------------------------------------------------------------------------------------------

  handlePLayerReadyUp() {
    // create logic that will check if all players are ready
    // if all players are ready, emit a startGame event to the server
    // the server will then start the game
    const allPlayersReady = this.playerArr.every(
      (player) => player.active === true
    );
    if (allPlayersReady) {
      this.socket.emit("startGame", { gameId: this.gameId });
    }
  }

  // Create arrow sprite at the received position
  createArrow(x, y, direction, playerId) {
    let xOffset = direction === "left" ? -20 : 20; // Set the offset based on the direction to deconflict shooter and arrow
    let arrow = this.physics.add.sprite(x + xOffset, y, "arrow");
    arrow.setActive(true).setVisible(true);
    arrow.setOrigin(0.5, 0.5);
    arrow.setScale(2);

    // arrowId is set to the playerId of the player who shot the arrow
    arrow.arrowId = playerId;

    // Set the arrow's properties
    this.physics.world.enable(arrow);

    // Set the size of the arrow for collision detection
    arrow.body.setSize(8, 3);

    // Set velocity based on the direction
    if (direction === "left") {
      arrow.setVelocityX(-600); // Set arrow speed
      arrow.setFlipX(true); // Flip the arrow to face left
    } else {
      arrow.setVelocityX(600); // Set arrow speed
    }

    // Add to arrows array
    this.arrows.push(arrow);
    // console.log('arrow shot: ', arrow);
  } //*create method ends here -------------------------------------------------------------------------



  // Arrow collision detection with player
  arrowHitPlayer(arrow, player) {
    // Ignore inactive arrows or players
    if (!arrow.active || !player.active) {
      return;
    }
    arrow.destroy();
    player.loseLife(); //player loose life method is called which takes a life and chekcs if lives = 0. If lives = zero player.js emits a call to initiate the // TODO playerDied event
    console.log("Arrow has hit a player!", arrow, player);
    console.log("lives remaining:", player.lives);
  }

  // Turns the other players' movements into an object that can be used in the update method
  createCursorsFromActiveKeys(activeKeys) {
    // debugger;
    return {
      up: this.input.keyboard.addKey(activeKeys.up),
      down: this.input.keyboard.addKey(activeKeys.down),
      left: this.input.keyboard.addKey(activeKeys.left),
      right: this.input.keyboard.addKey(activeKeys.right),
      spacebar: this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      ),
    };
  }

  // Renders the players based on the data from the server
  renderPlayers(playerData) {
    // console.log('playerData', playerData);
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
        // console.log(updatePlayer);
        // Otherwise, update the player with the given data
      } else {
        updatePlayer.setDirection(playerData.direction);
        updatePlayer.setPosition(playerData.x, playerData.y);
        updatePlayer.update(updateCursors);
        // console.log(this.playerArr);
      }
    }
  }

  update() {
    //** NEWCONTENT if a player is not active then skip and do not send information to the server,
    // since server does not have any information to update the player will remain in their last know position
    
    // Collision detection between the server emitted player and the collision layer
    this.physics.world.collide(
      this.player,
      this.collisionLayer,
      (player, tile) => {
        this.player.isGrounded = true;
      }
    );
    
    // place inactive here to prevent the player from falling from map when they are inactive 
    if (!this.player.active) {
      return;
    }
    
    // Collision detection between the server emitted arrow and the collision layer
    this.arrows.forEach((arrow, index) => {
      if (
        arrow.active &&
        this.physics.world.collide(arrow, this.collisionLayer)
      ) {
        // console.log('arrow collided with the collision layer: ', arrow);
        arrow.destroy(); // Destroy the individual arrow
        this.arrows.splice(index, 1); // Remove the arrow from the array
      }
    });

    this.player.update(this.cursors);

    // Packages the key presses into a json object for the server
    if (this.player.active) {
      const activeKeys = {
        up: this.cursors.up.isDown,
        down: this.cursors.down.isDown,
        left: this.cursors.left.isDown,
        right: this.cursors.right.isDown,
        space: this.cursors.space.isDown,
      };

      // Sends pertinent information to the server
      this.socket.emit("clientPlayerUpdate", {
        gameId: this.gameId,
        id: this.playerId,
        playerX: this.player.x,
        playerY: this.player.y,
        activeKeys: activeKeys,
        direction: this.player.direction,
      });
    }
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