//main.js is where the code for the game app is exported from.
// no need to import phaser since it is already imported in the scenes
import { Boot } from "./scenes/Boot";
import { Game } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import { Login } from "./scenes/Login"; 

const speedDown = 300;

const config = {
  type: Phaser.WEBGL, // The rendering context. Either AUTO, CANVAS, WEBGL, or HEADLESS 
  width: 1024, // The width of the game in pixels
  height: 768, // The height of the game in pixels
  // canvas: gameCanvbas
  parent: "game-container", // The DOM element that will contain the game canvas
  backgroundColor: "#028af8", // The background color of the game
  physics: { 
    default: "arcade",
      arcade: { 
        gravity: {y: speedDown }, 
        debug: true, 
      }, 
  }, 
  scale: {
    mode: Phaser.Scale.FIT, // The scale mode to be used by the Scale Manager
    autoCenter: Phaser.Scale.CENTER_BOTH, //
  },
  scene: [Boot, Preloader, MainMenu, Game, GameOver], // The scenes to add to the game
};

export default new Phaser.Game(config); //
