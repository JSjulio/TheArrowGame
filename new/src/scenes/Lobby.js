import { Scene } from "phaser";
export class LobbyScene extends Scene {
  constructor() {
    super({ key: "LobbyScene" });
  }

  create(data) {
//*BEGIN NEW CONTENT - 
    // Fade in the scene  
    this.cameras.main.fadeIn(1000)
    
    // Set the socket, player, playerId, from Auth scene 
    // from gameOver scene if player is returning
    this.socket = data.socket;  
    this.player = data.player; 
    this.playerId = data.playerId;
    

    // Form for creating a game room.
    this.createGameIdForm();

  }

// Form HTML Elements 
  createGameIdForm() {
    //creates text for gameId input form
    let text = this.add.text(300, 250, 'GAME ID:', {
      fill: '#000000', 
    }).setOrigin(0);
    
    //input fields for gameId
    const gameIdInput = this.add.dom(400, 250, "input").setOrigin(0);

    //action button to set gameId
    const actionButton = this.add
      .text(407, 290, "START GAME!", {
        fill: "#D1ED9E",
        backgroundColor: "#111",
        padding: 8, 
      })
      .setInteractive()
      .on("pointerdown", () => {
       let gameId = gameIdInput.node.value;
      //  console.log(gameId);
       if(gameId) { 
        this.handleJoinRoom(gameId);
        // console.log('gameId:', gameId);
       } else { 
        console.log('gameId is required to Start Game!')  
       }
      });

    return { gameIdInput, actionButton };
  }

// Handle game room creation/joining
handleJoinRoom(gameId) {
  // console.log(gameId, this); 
  
  // Emit event to create or join a game room
    this.socket.emit('createGameRoom', gameId);  //! TESTING - see if this.player is requied to be passed here 
    // console.log('gameId:', gameId, 'player:', this.player); // Need to pass in data as required for players who want to respawn 

    // Listen for confirmation of room creation/joining
    this.socket.on('gameRoomCreated', (response) => {
      // console.log('gameid in socket it', response.gameId); // successfully accesses gameId
      
      
      // *navigate to the Ready up scene and pass the gameId and playerId and socketId to the Ready scene
      this.cameras.main.fade(2000);
      this.scene.start("Ready", { socket: this.socket, playerId: this.playerId, gameId: response.gameId, active: true })
    }); 
    
    
    // Listen for the event when another player joins the same room
    this.socket.on('playerJoinedRoom', (response) => {
        console.log(`${response.message}`);
    });

        // Listen for the game start event
    this.socket.on('gameStarted', (data) => {
        console.log(`Game in room ${data.room} is starting.`);
        // Transition to the game scene or perform other setup as needed
    });

    this.socket.on('gameAlreadyStarted', (response) => {
        console.log(`${response.message}`);
        return; // TODO QC THIS 
    })

    // Listen for the event when the game room is at capacity
    this.socket.on('gameAtPlayerCapacity', (response) => {
        console.log(`${response.message}`);
    });

  }
}


