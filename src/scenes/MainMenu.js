import { Scene } from 'phaser';


export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu'); // this is the first scene that the user observes on the front end. 
    }

    preload ()
    {   
        this.load.setPath('assets');

        // ? THIS IS WHERE THE GAME SCENE IS PRELOADED
        //the battlefield.json and battlefield.png files work together to load game map 
        this.load.tilemapTiledJSON("map", "/map/battlefield.json");//loads the battlefield.json file
        this.load.image("tiles", "/map/battlefield.png");//loads the battlefield.png file that the tile battlefiled.json file references

        //Archer character preload
        this.load.spritesheet("player", 
        "/Archers-Character/Archers/knight.png",
            { frameWidth: 64, frameHeight: 64 }
        );    
    }


    create ()
    {
        this.add.image(512, 384, 'theArrowGame'); // renders theArrowGame image on the landing page. 

        //'START GAME' wording on landing page
        this.add.text(530, 720, 'START GAME', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#39ff14',
            stroke: '#000000', strokeThickness: 33,
            align: 'center'
        }).setOrigin(0.5);
        // this is an event listener - once user clicks the page once, user is forwarded to the following scene defined below 
        this.input.once('pointerdown', () => {

            this.scene.start('AuthScene');

        });
    }
}
