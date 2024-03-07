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

        // this.load.tilemapTiledJSON('battlefield', '/gameAssets/battlefield.json'); //loads the battlefield.json file

        // this.load.image('tilesKey', '/gameAssets/battlefield.png'); //loads the battlefield.png file that the tile battlefiled.json file regerences
    }


    create ()
    {
        this.add.image(512, 384, 'theArrowGame');

        // this.add.image(512, 384, 'background');

        // this.add.image(512, 300, 'logo');

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
