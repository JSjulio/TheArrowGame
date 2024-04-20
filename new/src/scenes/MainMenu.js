import { Scene } from 'phaser';
export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu'); 
    }
    
    // preload method that loads the login background-image and the battlefield.json file
    preload ()
    {   
        this.load.setPath('assets');
        this.load.image('loginImage', 'login.png');  
        this.load.tilemapTiledJSON("map", "map/battlefield.json");
        this.load.image("tiles", "map/battlefield.png");
    }

    // create method that creates the login background-image and the battlefield.json file
    create ()
    {
        this.add.image(512, 310, 'theArrowGame'); 
      
        let flickerText = this.add.text(275, 520, 'ClICK ANYWHERE TO START!', {
            frontFamily: 'Arial Black',
            fill: '#31CA01',
            fontSize: 37, 
            backgroundColor: '#000000',
            padding: 8,
        });
        
        this.tweens.add({
            targets: flickerText,
            alpha: { start: 0, to: 1 },  
            ease: 'Linear',  
            duration: 900, 
            repeat: -1,  
            yoyo: true  
        });

        this.input.once('pointerdown', () => {
            this.scene.start('AuthScene');
        });
    }
}
