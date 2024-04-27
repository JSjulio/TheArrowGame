import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver'); 
    }

    create (data) {

        this.socket = data.socket; 


        // this.socket.on('incomingDeadPlayer', (data) => {
            // this.playerId = data.playerId; // stores the socket.id of the player that died.
            // console.log('incomingDeadPlayers id(socketId) in Game over is:', this.playerId);
            this.createDeadPlayerButtons(); 

        // }); 

        this.playerId = data.playerId; 
       
        // Fade in the scene
        this.cameras.main.fadeIn(1000)

        const bImage = this.add.image(512, 310, 'gameOver'); // renders gameOver image on the gameOver on this scene 
        bImage.setAlpha(0.4); // sets the transparency of the image to 60%

        this.add.text(512, 200, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 300, 'Play Again?', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#36B736', 
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        
        let movingText = this.add.text(512,520, 'Click Anywhere To Continue!', { fontSize: '18px', color: '#AAA739' });
        this.tweens.add({
        targets: movingText,
        x: 400,
        ease: 'Power1',
        duration: 3000,
        yoyo: true,
        loop: -1
        });

    }


    createDeadPlayerButtons () { 
            
        const returnToGameButton = this.add.text(512, 400, 'Return to Game', {
            font: "16px Arial",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 }
            }).setInteractive();

            returnToGameButton.on('pointerdown', () => {
                this.scene.stop('GameOver'); 
            });

            const newGame = this.add.text(512, 450, 'New Game', {
                font: "16px Arial",
                fill: "#ffffff",
                backgroundColor: "#000000",
                padding: { x: 10, y: 5 }
                }).setInteractive();
                
                newGame.on('pointerdown', () => { 
                    // this.scene.stop('Game')
                    this.scene.restart('LobbyScene'); // !Test what the console.log of their socket is once they are in lobbyScene 
                })
        }
    
    
    // Not being used, delete after complete 
    openScene() { 
        this.scene.cameras.main.fadeIn(5000, 75, 114, 135);
        // this.scene.pause
    }


}