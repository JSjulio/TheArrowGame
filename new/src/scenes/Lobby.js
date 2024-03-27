import { Scene } from "phaser";

export class LobbyScene extends Scene {
    constructor() { 
        super({ key: "LobbyScene" });
    }




    create(data) {
        // this.playerId = data.player.id; // Recieved from AuthScene 
        // this.playerInLobby = data.playersInLobby; 
        this.serverUrl = data.serverUrl 

        // Lobby Scene logic which 
            //listen for a game players join -> by
            // Assigns various players to a same GameId
            // switches isGame to truthy 
            // Then locks the game
            

        this.add.text(100, 150, 'Waiting for other players to join...', {fill: '#0f0'});
        
        this.input.once("pointerdown", () => {
            this.scene.start("Game", { serverUrl: this.serverUrl, playerId: this.playerId}); // this line allows you to send the user to the following scene you define in quotations
          });
    
    }
}