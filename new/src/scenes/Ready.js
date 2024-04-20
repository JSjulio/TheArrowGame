import { Scene } from "phaser";

export class Ready extends Scene {
    constructor() {
        super("Ready");
        this.readyCountdown = 50; // Initially set for display purposes, actual value will be received from server
        this.active = true;
        this.playerId = null;
    }

    create(data) {
        this.player = data.player; //required to navigate back to the lobby scene if the game is already started
        this.gameId = data.gameId;
        this.socket = data.socket;
        this.playerName = data.playerName; // Player's name from database
        this.playerId = data.playerId; // Player's ID from socket connection
        this.createReadyUpButton();
        this.setupEventListeners();


    }

    createReadyUpButton() {
        const readyUpButton = this.add.text(400, 250, "Ready Up", {
            font: "16px Arial",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 }
        }).setInteractive();

        readyUpButton.on('pointerdown', () => {
            this.socket.emit('createGameRoom', { gameId: this.gameId });
            readyUpButton.disableInteractive();
            readyUpButton.setAlpha(0.5);
        });
    }

    setupEventListeners() {
        this.socket.on('updateCountdown', (data) => {
            this.readyCountdown = data.countdown; // Update countdown from server
            this.updateCountdownDisplay();
        });

        this.socket.on('countdownStarted', () => {
            this.add.text(400, 300, 'Once two or more are ready...Press again to start Game!', { fill: '#ffffff' });
            this.updateCountdownDisplay();
        });

        //TODO fix this later // currently no limit on games as a result
        // this.socket.on('gameAtPlayerCapacity', (data) => {
        //    this.scene.start('LobbyScene', {playerName: this.playerName, player: this.player, socket: this.socket}); 
        //    console.log(data.message);
        // });

        this.socket.on('gameAlreadyStarted', (data) => {
          this.scene.start('LobbyScene', {playerName: this.playerName, player: this.player, socket: this.socket}); 
          console.log(data.message);
       });

        this.socket.on('startItUp', (data) => {
            this.handlePostTimerRoomState();
            console.log(data.message);
        });

        this.socket.on('startItUp?', (data) => {
          this.handlePostTimerRoomState();
          console.log(data.message);
      });
    }

    updateCountdownDisplay() {
        if (!this.countdownText) {
            this.countdownText = this.add.text(400, 350, `Countdown: ${this.readyCountdown}`, { fill: '#ffffff' });
        } else {
            this.countdownText.setText(`Countdown: ${this.readyCountdown}`);
        }
    }

    handlePostTimerRoomState() {
        this.cameras.main.fadeOut(5000, 0, 0, 255);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Game', {
                gameId: this.gameId,
                socket: this.socket,
                playerName: this.playerName,
                active: this.active
            });
            this.scene.stop('Ready');
        });
    }
}
