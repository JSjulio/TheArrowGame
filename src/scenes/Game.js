import { Scene } from 'phaser'; // scenes are where the game logic is written for different parts of the game

export class Game extends Scene // the Game scene is a subclass of the Scene class
{
    constructor () // the constructor of the Game scene
    {
        super('Game'); // the key of the scene
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x00ff00); // green background color for the game scene 

        this.add.image(512, 384, 'background').setAlpha(0.5); // add a background image to the game scene

        this.add.text(512, 384, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5); // add a text to the game scene

        this.input.once('pointerdown', () => { 

            this.scene.start('GameOver'); // start the GameOver scene when the pointer is clicked

        });
    }
}
