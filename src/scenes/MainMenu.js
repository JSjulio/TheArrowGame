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

        //loads the battlefield.json file
        this.load.tilemapTiledJSON("map", "/map/battlefield.json"); 
      
        //loads the battlefield.png file that the tile battlefiled.json file references
        this.load.image("tiles", "/map/battlefield.png");
    
        //the archer character preload
        this.load.spritesheet("player", "/Archers/Characters/All_Archers/Archer-1.png",
            { frameWidth: 12, frameHeight: 12 }
        );    
    }


    create ()
    {
        this.add.image(512, 384, 'theArrowGame');

        this.add.text(530, 720, 'START GAME', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#39ff14',
            stroke: '#000000', strokeThickness: 33,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('Game');

        });
    }
}
