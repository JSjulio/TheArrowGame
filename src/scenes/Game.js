import { Scene } from "phaser"; // scenes are where the game logic is written for different parts of the game

export class Game extends Scene {
  // the Game scene is a subclass of the Scene class
  constructor() { // the constructor of the Game scene
    super("Game"); // the key of the scene
  }

  create() {
    const map = this.make.tilemap({ key: 'battlefield' }); // create a tilemap from the battlefield.json file

    const tileset = map.addTilesetImage('battlefield', 'tilesKey'); // add the tileset image to the tilemap

    this.cameras.main.setBackgroundColor(0x00ff00); // green background color for the game scene

    this.add.image(512, 384, "background").setAlpha(0.5); // add a background image to the game scene
    
    this.input.once("pointerdown", () => {
      this.scene.start("GameOver"); // start the GameOver scene when the pointer is clicked
    });
  }
}
