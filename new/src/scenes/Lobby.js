import { Scene } from "phaser";

export class LobbyScene extends Scene {
    constructor() { 
        super({ key: "LobbyScene" });
    }




    create() {
        this.add.text(100, 150, 'Waiting for other players to join...', {fill: '#0f0'});
        
        this.input.once("pointerdown", () => {
            this.scene.start("Game"); // this line allows you to send the user to the following scene you define in quotations
          });
    
    }
}