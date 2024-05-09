import { Scene } from "phaser";

export class Ready extends Scene {
    constructor() {
        super("Ready");
        this.readyCountDown = 15; // init count as 50 for display purposes, actual value will be received from server
        // this.active = true; // TODO is required? 
    }

    create(data) {
        this.gameId = data.gameId;
        this.socket = data.socket;
        this.playerName = data.playerName; // Player's name from database
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
            this.socket.emit('startCountDown', { gameId: this.gameId });
            readyUpButton.disableInteractive(); // Disable button after clicking for the player that clicked it
            readyUpButton.setAlpha(0.3);
        });

        this.socket.on('disableReadyUp', () => {
            if (readyUpButton.active) { 
             readyUpButton.disableInteractive(); // disable button for all players once first player clicks it
             readyUpButton.setAlpha(0.3);
            }
         });
    }

    setupEventListeners() {
        this.socket.on('updateCountdown', (data) => {
            this.readyCountDown = data.countdown; 
            this.updateCountdownDisplay();
        });

        this.socket.on('gameAlreadyStarted', (data) => {
            this.scene.start('LobbyScene', {playerName: this.playerName, socket: this.socket}); 
            console.log(data.message);
       });

        this.socket.on('startItUp', (data) => {
            this.handlePostTimerRoomState();
            console.log(data.message);
        });
        
    }

    updateCountdownDisplay() {
        if (!this.countDownText) {
            this.countDownText = this.add.text(400, 350, `Game Starts in... ${this.readyCountDown}`, { fill: '#ffffff' });
        } else {
            this.countDownText.setText(`Game Starts in... ${this.readyCountDown}`);
        }
    }

    handlePostTimerRoomState() {
        this.cameras.main.fadeOut(3500, 29, 61.2, 100);
            this.scene.start('Game', {
                gameId: this.gameId,
                socket: this.socket,
                playerName: this.playerName,
                // active: this.active // TODO is required?
            });
        }
}
