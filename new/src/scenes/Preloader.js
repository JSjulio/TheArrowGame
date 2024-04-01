import { Scene } from "phaser";
import io from "socket.io-client";

export class Preloader extends Scene {
  constructor() {
   super("Preloader");
    this.serverUrl = io("http://localhost:3000"); // Initialize socket.io listening on same port backend socket.io is tuning into
  
    this.serverUrl.on('connect', () => { 
      console.log('socket.io Connected - Login!')
    })
  
  }
  preload() {
    this.load.setPath("assets"); //when loading assests, the baseURL or initial path can be given first

//to load an asset for a scene: create a name for the asset and define the path. 
// In this case the path for this imaage is 'theArrowGame.png'(camelcasingdoesn't matter here). Read comment above. 
    this.load.image('theArrowGame', 'thearrowGame.png'); 
  }

  create() {

    this.scene.start("MainMenu", { serverUrl: this.serverUrl }); // Pass server.Url to the next scene 

  }
}
