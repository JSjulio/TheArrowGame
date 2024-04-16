import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver'); //Gameover scene 
    }

    create ()
    {

        const bImage = this.add.image(512, 310, 'gameOver'); // renders gameOver image on the gameOver on this scene 
        bImage.setAlpha(.41); // sets the transparency of the image to 60%

        this.add.text(512, 200, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 300, 'Click to play again!', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#36B736', 
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu'); // redirects user to the main menu. 
        });
    }

    openScene() { 
        this.scene.cameras.main.fadeIn(1000);
        this.scene.launch('GameOver');
        this.scene.pause
    }
}
