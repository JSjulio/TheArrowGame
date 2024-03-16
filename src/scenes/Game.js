import { Scene } from "phaser"; // scenes are where the game logic is written for different parts of the game
import Player from "../sprites/Player";

export class Game extends Scene {

  constructor() {

    super("Game"); 

  }

  // ? Assets from this scene are preloaded within the Main.js file's preload()
  
  create() {

    // TODO: since Phaser.Scale.Fit handles this within the main.js config, I'm speculating "scaleFactor" may not be needed now ?  
        // Mario set the scale factor within main.js  //  I used Parcel's scale pre-configuration in main.js  
   const backgroundImage = this.add.image(0,0, "tiles").setOrigin(0);  // creates a tilemap from the battlefield.json file
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
  const collisionLayer = map.createLayer("collision", tileset, 0, 0);
  collisionLayer.setScale(scaleFactor);
  collisionLayer.setCollisionByExclusion([-1]);
  collisionLayer.setAlpha(0); // makes layer invisible

    // Initialize cursors
    this.cursors = this.input.keyboard.createCursorKeys();


    // TODO - applies to all of the commented out lines below 
    //*code was commented out so you can see the current game map while debugging
    //*although the line below properly references teh sprite, 
    //* when this code is integrated, the game breaks ? 

    // this.player = new Player(this, 100, 100, this.cursors);
    // this.player.setGravity(speedDown);
    // this.player.setOrigin(1, 1);
    // this.player.setScale(0.75);

    //resizing bouncing box
    // const newBoundingBoxWidth = 16;
    // const newBoundingBoxHeight = 48;
    // const offsetX = (this.player.width - newBoundingBoxWidth) / 2;
    // const offsetY = (this.player.height - newBoundingBoxHeight) / 1.5;
    // // Set the new size of the bounding box
    // this.player.body.setSize(newBoundingBoxWidth, newBoundingBoxHeight, true);
    // this.player.body.setOffset(offsetX, offsetY);

    // // Add collision between player and collision layer
    // this.physics.add.collider(this.player, collisionLayer);

   //archer player currently loaded on screen 
   const player = this.physics.add.sprite(100, 100, "player");
   this.physics.world.enable(player);
   this.physics.add.collider(player, collisionLayer);
   player.setCollideWorldBounds(true);

    this.input.once("pointerdown", () => {
      this.scene.start("GameOver"); // forward to the GameOver scene when the user's mouse is clicked
    });
  }

  update() {
    // console.log("Scene update loop running");
    // this.player.update();
  }
  
};
