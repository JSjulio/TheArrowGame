import { Scene } from "phaser";
import io from "socket.io-client";
import jwt from "jsonwebtoken";

export class LobbyScene extends Scene {
  constructor() {
    super({ key: "LobbyScene" });
  }

  create(data) {
    // this.playerInLobby = data.playersInLobby;
    this.socket = io("http://localhost:3000/lobby") // Initialize socket.io listening on same port backend socket.io is tuning into
    // console.log(this.socket);

    this.player = data.player; 
    // console.log(this.player);

    this.playerId = data.player.id;
    // console.log(this.playerId);

    this.token = data.token; // TODO -  Not sure if token is required here? for functionality, if it is not required, remove it.
    console.log(this.token);
    
    

// ***BEGIN NEW CONTENT*** -----------------------------------------------------------------------
// logic for player joining the lobby socket.io connection 
    
   //sends a request for player to join the lobby nameSpace socket.io server once player enters the lobby scene
   this.socket.emit("joinLobby", this.player);

       // Listen for the server to respond confirming player joined the lobby
       this.socket.on('joinedLobby', (response) => {
       console.log(`${response.message}`);
       });  

    // Listen for new players joining the lobby
    this.socket.on("newplayerInLobby"), (response) => {
      console.log(`${response.message}`);
    }

// Form for creating a game room
  this.createGameIdForm();

  }

// Form HTML Elements 
  createGameIdForm() {
    //creates text for gameId input form
    this.add.text(100, 250, "GAME ID: ").setOrigin(0);

    //input fields for gameId
    const gameIdInput = this.add.dom(200, 250, "input").setOrigin(0);

    //action button to set gameId
    const actionButton = this.add
      .text(100, 300, "START GAME!", {
        fill: "#D1ED9E",
        backgroundColor: "#111",
        padding: 10,
      })
      .setInteractive()
      .on("pointerdown", () => {
        const gameId = gameIdInput.node.value;
        this.handleJoinRoom(gameId);
      });

    return { gameIdInput, actionButton };
  }

// Handle game room creation/joining
handleJoinRoom() {
    // Emit event to create or join a game room
    this.socket.emit('createGameRoom', this.gameId, this.playerId, this.socket);
        console.log(this.gameId, this.playerId, this.socket);
    // Listen for confirmation of room creation/joining
    this.socket.on('gameRoomCreated', (response) => {
      console.log(`${response.message}`);
      // Transition to the game scene or perform other logic as needed
    });

    // Listen for the event when another player joins the same room
    this.socket.on('playerJoinedRoom', (response) => {
        console.log(`Another player joined the room: ${response.socketId}`);
        // Update the lobby UI or game state as needed
    });

        // Listen for the game start event
    this.socket.on('gameStarted', (data) => {
        console.log(`Game in room ${data.room} is starting.`);
        // Transition to the game scene or perform other setup as needed
    });

    // Listen for the event when the game room is at capacity
    this.socket.on('gameAtPlayerCapacity', (response) => {
        console.log(`${response.message}`);
    });

  }
}


// ***END NEW CONTENT*** -----------------------------------------------------------------------