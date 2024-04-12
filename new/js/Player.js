export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, name, pid) {
    super(scene, x, y, "player");
    console.log(
      `Creating player at X:${this.x} with type:${typeof x} and Y:${
        this.y
      } with type: ${typeof y}`
    );
    // Added a way to configure the id of the player, as assigned from the server
    this.name = name;
    this.id = pid;
    this.direction = "left";
    this.isGrounded = true;
    // console.log("Player ID: " + this.id);
    // console.log("Player Received ID: " + pid);

    // ***BEGIN NEW CONTENT*** ----------------------------------------------------------------

    // ***END NEW CONTENT*** ------------------------------------------------------------------

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setBounce(0.1);
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
      key: "run",
      frames: this.anims.generateFrameNumbers("player", {
        start: 5,
        end: 12,
      }),
      frameRate: 16,
      repeat: -1,
    });

    this.anims.create({
      key: "jump",
      frames: [
        { key: "player", frame: 11 },
        { key: "player", frame: 10 },
        { key: "player", frame: 19 },
      ],
      frameRate: 5,
      repeat: 0,
    });

    this.anims.create({
      key: "die",
      frames: this.anims.generateFrameNumbers("player", {
        start: 24,
        end: 26,
      }),
      frameRate: 16,
      repeat: 1,
    });

    this.anims.create({
      key: "attack",
      frames: this.anims.generateFrameNumbers("player", {
        start: 19,
        end: 22,
      }),
      frameRate: 30,
      repeat: 0,
    });

    this.anims.create({
      key: "die",
      frames: this.anims.generateFrameNumbers("player", {
        start: 24,
        end: 26,
      }),
      frameRate: 16,
      repeat: 0,
    });

    this.speed = 200;
  }

  //shooting funtion
  shoot() {
    // Create arrow sprite at the player's position
    const arrow = this.scene.physics.add.sprite(this.x, this.y, "arrow");
    arrow.setOrigin(0.5, 0.5);
    arrow.setScale(2);
    const arrowBody = arrow.body;
    arrowBody.setSize(8, 3);

    if (this.direction === "left") {
      arrow.flipX = true;
      arrow.setPosition(this.x - 20, this.y);
    } else {
      arrow.setPosition(this.x + 20, this.y);
    }

    // Set arrow speed
    const velocityX = this.direction === "left" ? -600 : 600;
    arrow.setVelocityX(velocityX);

    // Play shooting animation
    //const shootAnim = this.direction === "left" ? "attackLeft" : "attackRight";
    //this.anims.play(shootAnim, true);
    if (this.direction === "left") {
      this.flipX = true;
      this.anims.play("attack");
    } else {
      this.flipX = false;
      this.anims.play("attack");
    }

    // // Destroy arrow after when collision
    // this.scene.physics.add.collider(arrow, this.scene.platformCollision, () => {
    //   arrow.destroy();
    // });

    // Destroy arrow after collision
    this.scene.physics.add.collider(arrow, this.scene.collisionLayer, () => {
      arrow.destroy();
    });

    // TODO Destroy arrow after collision with player
    this.scene.physics.add.overlap(arrow, this.scene.player, (arrow, player) => {
      
      // Handle collision between arrow and player here
        arrow.destroy();
      }
    );
  }

  setDirection(direction) {
    this.direction = direction;
  }

  update(cursors) {
    // Check if the player is on the ground
    if (this.body.blocked.down) {
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
  
    // Shooting - Check if 'space' key exists in cursors before using it
    if (cursors.space && Phaser.Input.Keyboard.JustDown(cursors.space)) { // <-- Change made here
      // Trigger shoot animation
      if (this.direction === "left") {
        this.flipX = false;
        this.anims.play("attack", true);
      } else {
        this.anims.play("attack", true);
      }
  
      // Perform shooting action
      this.shoot();
    }
    // Check for horizontal movement
    else if (cursors.left.isDown) {
      this.flipX = true;
      this.direction = "left";
      this.setVelocityX(-this.speed);
      if (this.isGrounded) {
        this.anims.play("run", true);
      } else if (!this.anims.currentAnim.key.includes("right")) {
        this.anims.play("jump", true);
      }
    } else if (cursors.right.isDown) {
      this.flipX = false;
      this.direction = "right";
      this.setVelocityX(this.speed);
      if (this.isGrounded) {
        this.anims.play("run", true);
      } else if (!this.anims.currentAnim.key.includes("right")) {
        this.anims.play("jump", true);
      }
    } else {
      this.setVelocityX(0);
      if (this.isGrounded) {
        if (this.direction === "left") {
          this.flipX = true;
          this.anims.play("idle", true);
        } else {
          this.flipX = false;
          this.anims.play("idle", true);
        }
      }
    }

    // Jumping
    if (
      cursors.up.isDown &&
      this.isGrounded &&
      !this.anims.currentAnim.key.includes("jump")
    ) {
      this.anims.stop(this.anims.currentAnim.key);
      if (this.direction === "left") {
        this.flipX = true;
        this.anims.play("jump", true);
      } else {
        this.flipX = false;
        this.anims.play("jump", true);
      }
      this.setVelocityY(-this.speed * 2); // Adjust jump velocity as needed
      this.isGrounded = false;
    }

    // Apply gravity
    this.setAccelerationY(400); // Adjust gravity as needed
  }
}
