import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    // //  This image was loaded in Boot.js 'Scene', so it can be display it here without Preload
    // this.add.image(512, 384, 'background');
    // //  A simple progress bar - this is the outline of the bar.
    // this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
    // //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    // const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);
    // //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    // this.load.on('progress', (progress) => {
    //     //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
    //     bar.width = 4 + (460 * progress);
    // });
  }

  preload() {
    this.load.setPath("assets"); //when loading assests, the baseURL or initial path is given first

    this.load.image('theArrowGame', 'thearrowGame.png'); //followed by filename (logo), and the path to that file (logo.png)
  }

  create() {
    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    // this.add.image(512, 384, 'background');
    this.scene.start("MainMenu"); // forwards to the MainMenu scene
  }
}
