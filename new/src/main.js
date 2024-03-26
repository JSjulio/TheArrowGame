import { Boot } from "./scenes/Boot";
import { Game } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import { AuthScene } from "./scenes/Auth"; 
import { LobbyScene } from "./scenes/Lobby";

//Main.js file functions like a REACT App.js file 


const speedDown = 500;


const config = {
  type: Phaser.WEBGL, // The rendering context. Either AUTO, CANVAS, WEBGL, or HEADLESS 
  width: 1024, // The width of the game in pixels
  height: 768, // The height of the game in pixels
  // canvas: gameCanvbas
  parent: "game-container", // The DOM element that will contain the game canvas
  backgroundColor: "#89CFF0", // The background color of the game
 dom: { 
    createContainer: true,
 },
  physics: { 
    default: "arcade",
      arcade: { 
        gravity: {y: speedDown }, 
        debug: true, 
      }, 
  }, 
  scale: {
    mode: Phaser.Scale.FIT, // The scale mode automatically fits the screen size to the client's screen size 
    autoCenter: Phaser.Scale.CENTER_BOTH, //
  },
  scene: [Boot, Preloader, MainMenu, AuthScene, LobbyScene, Game, GameOver], // The scenes to add different pages to the Phaser application. Scenes resemble components
  
};


export default new Phaser.Game(config); 
