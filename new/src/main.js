import { Boot } from "./scenes/Boot";
import { Game } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import { AuthScene } from "./scenes/Auth"; 
import { LobbyScene } from "./scenes/Lobby";
import io from "socket.io-client"; 

const serverUrl = "http://localhost:3000"; 

const sizes = {
  width: 1000,
  height: 600,
};

const speedDown = 300;
const sock = io(serverUrl);
let playerId = -1;

let sleepSetTimeout_ctrl;
function sleep(ms) {
  clearInterval(sleepSetTimeout_ctrl);
  return new Promise(
    (resolve) => (sleepSetTimeout_ctrl = setTimeout(resolve, ms))
  );
}
(async () => {
  await setClientPlayerId();
  await sleep(5000);
})

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
        debug: true, 
      }, 
  }, 
  scale: {
    mode: Phaser.Scale.FIT, 
    autoCenter: Phaser.Scale.CENTER_BOTH, 
  },
  scene: [Boot, Preloader, MainMenu, AuthScene, LobbyScene, Game, GameOver], // The scenes to add different pages to the Phaser application. Scenes resemble components
  
};



export default new Phaser.Game(config); 
