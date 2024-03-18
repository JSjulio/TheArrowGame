export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, cursors) {
    super(scene, x, y, "player");

    scene.physics.add.existing(this);
    this.setBounce(0.2);
    this.setCollideWorldBounds(true);

    this.speed = 160;

    //Create the player's animations
    //using the knight.png as a reference for the animations
    this.anims.create({
      key: "move-left",
      frames: this.anims.generateFrameNumbers("player", {
        start: 144,
        end: 150,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "move-right",
      frames: this.anims.generateFrameNumbers("player", {
        start: 176,
        end: 184,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn-left",
      frames: this.anims.generateFrameNumbers("player", {
        start: 144,
        end: 144,
      }),
      frameRate: 10,
      repeat: 1,
    });

    this.anims.create({
      key: "turn-right",
      frames: this.anims.generateFrameNumbers("player", {
        start: 176,
        end: 176,
      }),
      frameRate: 10,
      repeat: 1,
    });

    this.anims.create({
      key: "shoot-left",
      frames: this.anims.generateFrameNumbers("player", {
        start: 256,
        end: 268,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "shoot-right",
      frames: this.anims.generateFrameNumbers("player", {
        start: 304,
        end: 316,
      }),
      frameRate: 30,
      repeat: 1,
    });

    this.anims.create({
      key: "die",
      frames: this.anims.generateFrameNumbers("player", {
        start: 336,
        end: 341,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "enter",
      frames: this.anims.generateFrameNumbers("player", {
        start: 32,
        end: 38,
      }),
      frameRate: 10,
      repeat: 1,
    });


    this.cursors = cursors;
    this.anims.play("enter", true);

    //Moved to bottom to allow configuration to take place before showing player
    scene.add.existing(this);
  }

  //default animation

  update() {
    this.setDrag(550);

    // Move the player left or right based on the arrow keys
    /*
    player still needs to keep phasing the direction is moving
    player still needs to shoot the direction is moving or phasing
    */

    if (this.scene.input.keyboard.addKey("A").isDown) {
      this.setVelocityX(-160);
      this.anims.play("move-left", true);
    } else if (this.scene.input.keyboard.addKey("D").isDown) {
      this.setVelocityX(160);
      this.anims.play("move-right", true);
    } else {
      this.setVelocityX(0);

      if (this.anims.currentAnim !== null) {
        if (this.anims.currentAnim.key === "move-left") {
          this.anims.play("turn-left", true);
        } else if (this.anims.currentAnim.key === "move-right") {
          this.anims.play("turn-right", true);
        }
      }
    }

    if (this.body.onFloor && this.scene.input.keyboard.addKey("W").isDown) {
      this.setVelocityY(-330);
    } else if (
      this.body.onFloor &&
      this.scene.input.keyboard.addKey("S").isDown
    ) {
      this.setVelocityY(330);
    } else if (this.scene.input.keyboard.addKey("SPACE").isDown) {
      this.anims.play("shoot-right", true);
    }
  }
}
