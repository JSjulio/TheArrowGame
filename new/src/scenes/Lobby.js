import { Scene } from "phaser";
import io from "socket.io-client";


export class LobbyScene extends Scene {
  constructor() {
    super("LobbyScene"); 
    this.gameId = null; 
    this.socket = null; 
  };

  create(data) {
    this.game.canvas.style.cursor = 'pointer';  
    
    // Fade in the scene   
    this.cameras.main.fadeIn(1000);

    // Lobby scene data initialization
    this.playerName = data.playerName;  
    this.socket = io('/'); 

    //creates text for gameId input form  
    const text = this.add.text(300, 250, 'GAME ID:', { fill: '#000000' }).setOrigin(0);
    const gameIdInput = this.add.dom(400, 250, "input").setOrigin(0);
    const actionButton = this.add.text(407, 290, "ENTER!", { fill: "#D1ED9E", backgroundColor: "#111", padding: 8 })
      .setInteractive()
      .on("pointerdown", () => {
        const gameId = gameIdInput.node.value;
        if (gameId) {
          this.handleSetRoom(gameId);
        } else {
          console.log('gameId is required to join a game!');
        }
      });

   return { text, gameIdInput, actionButton };
  } 
  
handleSetRoom(gameId) {
    // Emit 'gameRoomSetRequest' with the gameId as part of the data object
    this.socket.emit('gameRoomSetRequest', { gameId: gameId, playerName: this.playerName}); 

      // Listen for 'gameRoomSetResponse' from the server
    this.socket.on('gameRoomSetResponse', (data) => {
      if (data.success) {
        // If successful, store the gameId and start the 'Ready' scene
        this.gameId = data.gameId;
        this.scene.start('Ready', {
          playerName: this.playerName,
          gameId: this.gameId,
          socket: this.socket
        });
      } else if (data.failure) {
          console.log('lobbyConsoleLog: ', data.message);
      }
    }); 
  }
}