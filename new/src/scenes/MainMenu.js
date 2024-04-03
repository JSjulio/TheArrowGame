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

        //the battlefield.json and battlefield.png files work together to load game map 
        this.load.tilemapTiledJSON("map", "map/battlefield.json");//loads the battlefield.json file
        this.load.image("tiles", "map/battlefield.png");//loads the battlefield.png file that the tile battlefiled.json file references

      
    }


    create (data)
    {
       
// ***ADDED*** this code extracts socket.io url from Preload then passes it to the following scene. 

        this.add.image(512, 310, 'theArrowGame'); // renders theArrowGame image on the landing page. 
        //'START GAME' wording on landing page
        this.add.text(500, 720, 'START GAME', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#39ff14',
            stroke: '#000000', strokeThickness: 33,
            align: 'center'
        }).setOrigin(0);
        // this is an event listener - once user clicks the page once, user is forwarded to the following scene defined below 

// ***ADDED code below*** passes AuthScene the serverUrl--------------------------------------------
        this.input.once('pointerdown', () => {
            this.scene.start('AuthScene');
        });
    }
}
