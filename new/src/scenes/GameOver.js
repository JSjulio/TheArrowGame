import { Scene } from 'phaser';

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
        this.setUpEventListeners(); 

        // Fade in the scene
        this.cameras.main.fadeIn(1000)
    
        const bImage = this.add.image(512, 310, 'gameOver'); // renders gameOver image on the gameOver on this scene 
        bImage.setAlpha(0.4); // sets the transparency of the image to 60%
        

        this.add.text(512, 200, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
    }

    setUpEventListeners() {
      
        if (this.typeOfGameOver === 'playerDeath') {
            this.createDeadPlayerButtons(); 
        } else if (this.typeOfGameOver === 'timeFinished' || 'lastPlayerStanding') {
            this.createGameOverButtons();
        }
    } 

    createDeadPlayerButtons () { 
        
        let movingText = this.add.text(512,520, 'Welcome to the Gulag 👼!', { fontSize: '18px', color: '#ffffff' });
        this.tweens.add({
        targets: movingText,
        x: 200,
        ease: 'Power1',
        duration: 3000,
        yoyo: true,
        loop: -1
        });

        const returnToGameButton = this.add.text(512, 400, 'Return to Game?', {
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
                this.scene.stop('Game') // stops the game scene for individual player and returns player to lobby scene //!TEST
                this.scene.stop('GameOver')
                this.scene.start('LobbyScene'); 
                // this.scene.socket.emit('removePlayer', { gameId: this.gameId, playerId: this.data.playerId }); // removes the player from the game room //TODO confirm in the terminal that the player is removed from the game room
                // TODO here you need to remove the socket from the game room but keep the socket active for the lobby scene
            })

        const quitGame = this.add.text(512, 500, 'Quit Game', {
            font: "16px Arial",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 }
            }).setInteractive();
            quitGame.on('pointerdown', () => {
                this.scene.stop('Game');
                this.scene.start('MainMenu');
                // TODO here you need to destroy the game room and the socket
            });
        }
    

    createGameOverButtons () {
        

        this.add.text(512, 300, `${this.winnerMessage}`, {
            fontFamily: 'Arial Black', fontSize: 32, color: '#36B736', 
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);


        const newGame = this.add.text(512, 450, 'New Game', {
            font: "16px Arial",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 }
            }).setInteractive();
            newGame.on('pointerdown', () => { 
                this.scene.stop('Game') // stops the game scene for individual player and returns player to lobby scene //!TEST
                // this.scene.socket.emit('removePlayer', { gameId: this.gameId, playerId: this.data.playerId }); // removes the player from the game room //TODO confirm in the terminal that the player is removed from the game room
                this.scene.start('LobbyScene'); // !Test what the console.log of their socket is once they are in lobbyScene 
                //might have to add more data here including playerDb data
            })

        const quitGame = this.add.text(512, 500, 'Quit Game', {
            font: "16px Arial",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 }
            }).setInteractive();
            quitGame.on('pointerdown', () => {
                this.scene.stop('Game');
                this.scene.restart('MainMenu'); //!Test to make sure the game room is destroyed
            });
        }

}
