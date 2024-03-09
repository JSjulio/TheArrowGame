import { Scene } from "phaser"; // scenes are where the game logic is written for different parts of the game

export class Game extends Scene {
  // the "Game" is a subclass of the #Scene class
  constructor() {
    // the constructor of the Game scene
    super("Game"); // the key of the scene
  }

  
  create() {
   const backgroundImage = this.add.image(0,0, "tiles").setOrigin(0);  // create a tilemap from the battlefield.json file
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

   //player
   const player = this.physics.add.sprite(100, 100, "player");
   this.physics.world.enable(player);
   this.physics.add.collider(player, collisionLayer);
   player.setCollideWorldBounds(true);

    this.input.once("pointerdown", () => {
      this.scene.start("GameOver"); // start the GameOver scene when the pointer is clicked
    });
  }

  
};
