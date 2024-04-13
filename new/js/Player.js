export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, name, pid, gameId) {
    super(scene, x, y, "player");
    console.log(
      `Creating player at X:${this.x} with type:${typeof x} and Y:${
        this.y
      } with type: ${typeof y}`
    );
    this.name = name;
    this.id = pid;
    this.direction = "left";
    this.isGrounded = true;
    this.gameId = gameId;
    this.lives = 3; // **NEWCONTENT: Sets player lives to 3


    // console.log('gameId within Player.js:', this.gameId);
    // console.log('playerId within Player.js:', this.id); // here this.id is the player's socket.id. which is that same as player.id 
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

    // TODO add attack left and attack right animations - currently only attack animation is available. Or refactor to use attack animation
    const shootAnim = this.direction === "left" ? "attackLeft" : "attackRight";
    this.anims.play(shootAnim, true);
    if (this.direction === "left") {
      this.flipX = true;
      this.anims.play("attack");
    } else {
      this.flipX = false;
      this.anims.play("attack");
    }

    // TODO Destroy arrow after collision with collisionLayer - add this within the Game.js file in the update method so arrow is destroyed from array of arrows and leaked memory is cleaned up
    this.scene.physics.add.collider(arrow, this.scene.collisionLayer, () => {
      arrow.destroy();
    });

  }

  setDirection(direction) {
    this.direction = direction;
  }

  // ***BEGIN NEW LOOSE LIFE CONTENT*** ----------------------------------------------------------------

  loseLife() {
    this.lives -= 1;
    if (this.lives <= 0) {
      this.anims.play("die", true);
      this.setVelocityX(0);
      this.setVelocityY(0);
      this.scene.socket.emit('playerDied', { gameId: this.gameId, playerId: this.id }); 
    }
  }

  // TODO: add a way to track lives globally and update the player's lives when they are hit by an arrow
  
  // ***END NEW CONTENT*** ------------------------------------------------------------------



  update(cursors) {
    // Check if the player is on the ground
    if (this.body.blocked.down) {
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
    if (cursors.space && Phaser.Input.Keyboard.JustDown(cursors.space)) { 
  
      // Trigger shoot animation
      this.shoot();  

      // Emit playerShoot event to the server
      this.scene.socket.emit('playerShoot', { gameId: this.gameId, playerId: this.id, x: this.x, y: this.y, direction: this.direction });
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
