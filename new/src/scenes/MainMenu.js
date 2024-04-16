import { Scene } from 'phaser';
export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu'); 
    }

    preload ()
    {   
        this.load.setPath('assets');
        this.load.image('loginImage', 'login.png'); // loads the login background-image 
        this.load.tilemapTiledJSON("map", "map/battlefield.json");//loads the battlefield.json file
        this.load.image("tiles", "map/battlefield.png");//loads the battlefield.png file that the tile battlefiled.json file references
    }

    create ()
    {
        this.add.image(512, 310, 'theArrowGame'); // renders theArrowGame image on the landing page. 
        //'START GAME' wording on landing page
      
        let flickerText = this.add.text(350, 520, 'ClICK ANYWHERE!', {
            frontFamily: 'Arial Black',
            fill: '#31CA01',
            fontSize: 37, 
            backgroundColor: '#000000',
        });
        
        // Tween that animates the 'alpha' property of the text
        this.tweens.add({
            targets: flickerText,
            alpha: { start: 0, to: 1 },  // Fades between invisible and visible
            ease: 'Linear',  // Linear tween to make the flicker sharp rather than smooth
            duration: 900,  // Duration of one flicker in milliseconds
            repeat: -1,  // -1 makes the tween repeat indefinitely
            yoyo: true  
        });

        this.input.once('pointerdown', () => {
            this.scene.start('AuthScene');
        });
    }
}
