import { Scene } from "phaser";
import io from "socket.io-client";
import jwt from "jsonwebtoken";

export class LobbyScene extends Scene {
  constructor() {
    super({ key: "LobbyScene" });
  }

  create(data) {

// gets socket client/server connection from AuthScene
    this.socket = data.socket;  
      
        this.socket.on('connect', () => {
            console.log("consoleLog: You've connected to rootSocket within the lobbyScene. Create/join a game!");
        }); 

    this.player = data.player; 
    // console.log(this.player);

    this.playerId = data.player.id;
    // console.log(this.playerId);

    this.token = data.token; 
    // console.log(this.token);
    

  
// ***BEGIN NEW CONTENT*** -----------------------------------------------------------------------
// logic for player joining the lobby socket.io connection 
    
   

    // TODO Fix this line of code 
    //Listen for new players joining the lobby
    // this.socket.on("newplayerInLobby", (response) => {
    //   console.log(`${response.message}`);
    // });

// Form for creating a game room.
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
    this.socket.emit('createGameRoom', gameId, this.player); 
    // console.log('gameId:', gameId, 'player:', this.player);

    // Listen for confirmation of room creation/joining
    this.socket.on('gameRoomCreated', (response) => {
      // console.log('gameid in socket it', response.gameId); // successfully accesses gameId
      this.scene.start("Game", { socket: this.socket, playerId: this.playerId, gameId: response.gameId }); // Start game and pass player,socket, and gameId information to game scene. 
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

    // Listen for the event when the game room is at capacity
    this.socket.on('gameAtPlayerCapacity', (response) => {
        console.log(`${response.message}`);
    });

  }
}


// ***END NEW CONTENT*** -----------------------------------------------------------------------