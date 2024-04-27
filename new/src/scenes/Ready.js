import { Scene } from "phaser";

export class Ready extends Scene {
    constructor() {
        super("Ready");
        this.readyCountdown = 30; // init count as 50 for display purposes, actual value will be received from server
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
            readyUpButton.setAlpha(0.1);
        });

        this.socket.on('disableReadyUp', () => {
            if (readyUpButton.active) { 
             readyUpButton.disableInteractive();
             readyUpButton.setAlpha(0.1);
            }
         });
    }

    setupEventListeners() {
        this.socket.on('updateCountdown', (data) => {
            this.readyCountdown = data.countdown; // Update countdown from server
            this.updateCountdownDisplay();
        });

        this.socket.on('gameAlreadyStarted', (data) => {
          this.scene.start('LobbyScene', {playerName: this.playerName, player: this.player, socket: this.socket}); 
          console.log(data.message);
       });

        this.socket.on('startItUp', (data) => {
            this.handlePostTimerRoomState();
            console.log(data.message);
        });
    }

    updateCountdownDisplay() {
        if (!this.countdownText) {
            this.countdownText = this.add.text(400, 350, `Game Starts in... ${this.readyCountdown}`, { fill: '#ffffff' });
        } else {
            this.countdownText.setText(`Game Starts in... ${this.readyCountdown}`);
        }
    }

    handlePostTimerRoomState() {
        this.cameras.main.fadeOut(3500, 29, 61.2, 100);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Game', {
                gameId: this.gameId,
                socket: this.socket,
                playerName: this.playerName,
                active: this.active
            });
        });
    }
}
