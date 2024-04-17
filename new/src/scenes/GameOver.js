import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver'); 
    }

    create (data) {

        // recieves playerId from the GameOver scene.
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

        let movingText = this.add.text(512,520, 'Click Anywhere!', { fontSize: '18px', color: '#AAA739' });
        this.tweens.add({
        targets: movingText,
        x: 400,
        ease: 'Power1',
        duration: 3000,
        yoyo: true,
        loop: -1
        });

        this.input.once('pointerdown', () => {
            this.scene.start('LobbyScene', { playerId: this.playerId, socketId : this.playerId} ); // redirects user to the lobby scene. 
        });
    }

    openScene() { 
        this.scene.cameras.main.fadeIn(5000, 75, 114, 135);
        // this.scene.pause
    }
}
