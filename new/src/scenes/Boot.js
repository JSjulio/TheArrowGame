import { Scene } from 'phaser';

  // "Boot" is a subclass of the Scene class which is in main.js. the scene class captures all active scenes. 
export class Boot extends Scene // the user does not actually asee this scene. It is meant for preloading items for other scenes 
{
    constructor ()
    {
        super('Boot');
    }



    create ()
    {
        this.scene.start('Preloader'); 

    }
}
