import { Scene } from "phaser"; // scenes are where the game logic is written for different parts of the game

export class Game extends Scene {

  constructor() {

    super("Game"); 

  }

  
  create() {
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
  collisionLayer.setAlpha(0);

   //archer player 
   const player = this.physics.add.sprite(100, 100, "player");
   this.physics.world.enable(player);
   this.physics.add.collider(player, collisionLayer);
   player.setCollideWorldBounds(true);

    this.input.once("pointerdown", () => {
      this.scene.start("GameOver"); // forward to the GameOver scene when the user's mouse is clicked
    });
  }

  
};
