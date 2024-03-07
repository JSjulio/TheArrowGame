import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
    
        this.load.image('background', 'assets/bg.png'); //
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}

//*The `Boot.js` file is defining a Phaser scene named 'Boot'. This scene is typically the first scene that runs in the game and is often used to load some minimal assets that are needed right away followed by the preloader scene 

    // A breakdown of what this file is doing:
    // - `import { Scene } from 'phaser';`: This line is importing the `Scene` class from Phaser, which is used to create new scenes.
    // - `export class Boot extends Scene`: This line is defining a new class named `Boot` that extends the `Scene` class. This means that `Boot` is a type of `Scene` and inherits all of its properties and methods.
    // - `super('Boot');`: This line is calling the constructor of the parent `Scene` class, and passing in the key 'Boot'. This key is used to identify the scene.
    // - `preload()`: This method is where you'd load your game assets. In this case, it's loading an image with the key 'background' from the file 'assets/bg.png'.
    // - `create()`: This method is called once all assets have been loaded. In this case, it's starting another scene named 'Preloader'.
