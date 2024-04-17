import { Scene } from "phaser";

export class Ready extends Scene {
  constructor() {
    super("Ready");
    this.readyCountdown = 30; // Countdown time in seconds
  }

  create(data) {
    this.cameras.main.fadeIn(1000);
    this.gameId = data.gameId;
    this.playerId = data.playerId;
    this.socket = data.socket;
    this.player = data.player;
    this.active = data.active; // Set the player to active. Some players rejoin the lobby from GameOver, they have to be active to start a game. 
    this.createReadyUpButton();
    this.startCountdown(); // Start the countdown as soon as the scene is created
  }

  createReadyUpButton() {
    const readyUpButton = this.add.text(400, 250, "Ready Up", {
      font: "16px Arial",
      fill: "#ffffff",
      padding: { x: 10, y: 5 },
      backgroundColor: "#000",
      alpha: 1, 
    }).setInteractive().setOrigin(0.5, 0.5); 

    readyUpButton.on("pointerdown", () => {
      this.socket.emit("playerReady", {
        gameId: this.gameId,
        playerId: this.playerId,
        active: true,
      });
      readyUpButton.setAlpha(0.5); // Dim the button to indicate it has been pressed
      readyUpButton.disableInteractive(); // Disable the button after pressing
    });

    this.readyUpButton = readyUpButton; // Store the button in the scene for later access
  }

  startCountdown() {
    this.readyTimerText = this.add.text(this.cameras.main.centerX, 300, `Time Left: ${this.readyCountdown}`, {
      font: "32px Arial",
      fill: "#ffffff",
      align: "center",
    }).setOrigin(0.5, 0.5); // Center the countdown timer text

    let timer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.readyCountdown--;
        this.readyTimerText.setText(`🎯 READY UP! Game Starting in ${this.readyCountdown} 🎯`);
        if (this.readyCountdown <= 0) {
          this.transitionToGame();
        }
      },
      callbackScope: this,
      loop: true,
    });

    this.socket.on("gameStarted", () => {
      this.transitionToGame();
      // handle locking the game room
    });
  }

  transitionToGame() {
    this.readyTimerText.setText("Game Started!");
    this.readyTimerText.destroy();
    this.readyUpButton.destroy();

    // Start a fade out effect using the camera
    this.cameras.main.fadeOut(1000, 0, 0, 0); // Fade to black
     
    // Once the fade out is complete, start the 'Game' scene
    this.scene.start('Game', { gameId: this.gameId, playerId: this.playerId, socket: this.socket, active: this.active });
    
  }
}
