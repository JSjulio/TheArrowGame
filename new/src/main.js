import { Boot } from "./scenes/Boot";
import { Game } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import { AuthScene } from "./scenes/Auth"; 
import { LobbyScene } from "./scenes/Lobby";
import { Ready } from "./scenes/Ready";

const sizes = {
  width: 1000,
  height: 600,
};

const speedDown = 300;

const config = {
  type: Phaser.WEBGL, // The rendering context. Either AUTO, CANVAS, WEBGL, or HEADLESS 
  width: sizes.width, // The width of the game in pixels
  height: sizes.height, // The height of the game in pixels
  // canvas: gameCanvbas
  parent: "game-container", // The DOM element that will contain the game canvas
  backgroundColor: "#85BC5E", // The background color of the game
 dom: { 
    createContainer: true,
 },
  physics: { 
    default: "arcade",
      arcade: { 
        gravity: {y: speedDown }, 
        debug: false, 
      }, 
  }, 
  scale: {
    mode: Phaser.Scale.FIT, 
    autoCenter: Phaser.Scale.CENTER_BOTH, 
  },
  scene: [Boot, Preloader, MainMenu, AuthScene, LobbyScene, Ready, Game, GameOver], // The scenes to add different pages to the Phaser application. Scenes resemble components
  
};


export default new Phaser.Game(config); 
