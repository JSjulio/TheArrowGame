import { Scene } from 'phaser';
import { on } from 'process';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver'); 
    }

    create (data) {
        this.socket = data.socket; 
        this.playerId = data.playerId;
        this.typeOfGameOver = data.typeOfGameOver;
        this.winnerMessage = data.winnerMessage;
        this.playerName = data.playerName;
        this.setUpEventListeners(); 

        this.cameras.main.fadeIn(1000)
    
        const bImage = this.add.image(512, 310, 'gameOver'); 
        bImage.setAlpha(0.45); 
        
        this.add.text(512, 200, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
    };

    setUpEventListeners() {
      
        if (this.typeOfGameOver === 'playerDeath') {
            this.createDeadPlayerButtons(); 
        } else if (this.typeOfGameOver === 'timeFinished' || 'lastPlayerStanding') {
            this.createGameOverButtons();
        }
    };

    // if 2 or more players are still alive, the dead player will have the option to spectate the game or quit
    createDeadPlayerButtons () { 
        
        let flashingText = this.add.text(385, 500, '👻 Ghost Mode Active 👻', { fontSize: '18px', color: '#000000' });
        this.tweens.add({
        targets: flashingText,
        alpha: { start: 0.7, to: 1 },
        ease: 'Linear',
        duration: 700,
        repeat: -1,
        yoyo: true
        });
        flashingText.setAlpha(2); 

        const returnToGameButton = this.add.text(375, 375, 'Return to Game?', {
            font: "16px Arial",
            fill: "#0f0",
            backgroundColor: "#000",
            padding: { x: 10, y: 5 }
            }).setInteractive();
            returnToGameButton.on('pointerover', () => {
                this.game.canvas.style.cursor = 'alias';
            })
            .on('pointerdown', () => {
                this.scene.resume('Game'); 
                this.scene.stop('GameOver'); 
                returnToGameButton.setAlpha(0.5);
            })
            .on('pointerout', () => {
                this.game.canvas.style.cursor = 'pointer';
            });

        const quitGame = this.add.text(545, 375, 'Quit Game', {
            font: "16px Arial",
            fill: "#0f0",
            backgroundColor: "#000",
            padding: { x: 10, y: 5 }
            }).setInteractive();
            quitGame.on('pointerdown', () => {
                this.scene.start('MainMenu');
                this.scene.stop('Game');
            });
            quitGame.setAlpha(2);
        };
    
    // if game is over, the player will have the option to start a new game or quit the game
    createGameOverButtons () {
                
        this.add.text(512, 275, `${this.winnerMessage}`, {
            fontFamily: 'Arial Black', fontSize: 32, color: '#042E16', 
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setAlpha(2);

        const newGame = this.add.text(395, 375, 'New Game', {
            font: "16px Arial",
            fill: "#0f0",
            backgroundColor: "#000",
            padding: { x: 10, y: 5 }
            }).setInteractive();
            newGame.on('pointerover', () => {
                this.tweens.add({
                  targets: newGame,
                  alpha: { start: 0.7, to: 1 },
                  ease: 'Linear',
                  duration: 1100,
                  repeat: -1,
                  yoyo: true
                })})
                .on('pointerdown', () => { 
                this.scene.start('LobbyScene', {socket: this.socket, playerName: this.playerName });
            })
            newGame.setAlpha(2);

        const quitGame = this.add.text(545, 375, 'Quit Game', {
            font: "16px Arial",
            fill: "#0f0",
            backgroundColor: "#000",
            padding: { x: 10, y: 5 }
            }).setInteractive();
            quitGame.on('pointerover', () => {
                this.tweens.add({
                  targets: quitGame,
                  alpha: { start: 0.7, to: 1 },
                  ease: 'Linear',
                  duration: 1100,
                  repeat: -1,
                  yoyo: true
                })}).on('pointerdown', () => {
                this.scene.start('MainMenu'); 
            });
            quitGame.setAlpha(2);
        };
};
