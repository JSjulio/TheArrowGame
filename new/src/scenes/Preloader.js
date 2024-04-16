import { Scene } from "phaser";
import io from "socket.io-client";

export class Preloader extends Scene {
  constructor() {
   super("Preloader");
  
  }
  preload() {
    this.load.setPath("assets"); 

    this.load.image('theArrowGame', 'thearrowGame.png'); 
    this.load.image('gameOver', 'GameOver.png');
  }

  create() {

    this.scene.start("MainMenu"); 

  }
}
