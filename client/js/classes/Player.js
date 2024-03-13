export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, name, id) {
    super(scene, x, y, "player");

    // ***BEGIN NEW CONTENT*** ----------------------------------------------------------------
    // Added a way to configure the name of the player
    this.name = name;

    // Added a way to configure the id of the player, as assigned from the server
    this.id = id;

    // ***END NEW CONTENT*** ------------------------------------------------------------------

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setBounce(0.2);
    this.setCollideWorldBounds(true);

    // Create the player's animations
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player", {
        start: 0,
        end: 4,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({

    })

    this.speed = 200;
  }

  //     this.anims.create({
  //       key: "turn",
  //       frames: [{ key: "player", frame: 4 }],
  //       frameRate: 20,
  //     });

  //     this.anims.create({
  //       key: "right",
  //       frames: this.anims.generateFrameNumbers("player", { start: 5, end: 8 }),
  //       frameRate: 10,
  //       repeat: -1,
  //     });

  //     // Play the 'turn' animation by default
  //     this.anims.play("turn");
  //   }

  //   update() {
  //     // Move the player left or right based on the arrow keys
  //     if (this.scene.input.keyboard.isDown(Phaser.Input.Keyboard.KeyCodes.LEFT)) {
  //       this.setVelocityX(-160);
  //       this.anims.play("left", true);
  //     } else if (
  //       this.scene.input.keyboard.isDown(Phaser.Input.Keyboard.KeyCodes.RIGHT)
  //     ) {
  //       this.setVelocityX(160);
  //       this.anims.play("right", true);
  //     } else {
  //       this.setVelocityX(0);
  //       this.anims.play("turn");
  //     }

  //     // Allow the player to jump if they are on the ground
  //     if (
  //       this.body.onFloor() &&
  //       this.scene.input.keyboard.isDown(Phaser.Input.Keyboard.KeyCodes.SPACE)
  //     ) {
  //       this.setVelocityY(-330);
  //     }

  update() {
    const cursors = this.scene.input.keyboard.createCursorKeys();

    if (cursors.left.isDown) {
      this.setVelocityX(-this.speed);
    } else if (cursors.right.isDown) {
      this.setVelocityX(this.speed);
    } else {
      this.setVelocityX(0);
    }

    if (cursors.up.isDown) {
      this.setVelocityY(-this.speed);
    } else if (cursors.down.isDown) {
      this.setVelocityY(this.speed);
    } else {
      this.setVelocityY(0);
    }
  }
}
