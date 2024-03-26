export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, name, pid) {
    super(scene, x, y, "player");
    console.log(`Creating player at X:${this.x} with type:${typeof x} and Y:${this.y} with type: ${typeof y}`);
    // Added a way to configure the id of the player, as assigned from the server
    this.name = name;
    this.id = pid;

    this.direction = "left"

    this.isGrounded = true;
    // console.log("Player ID: " + this.id);
    // console.log("Player Received ID: " + pid);

    // ***BEGIN NEW CONTENT*** ----------------------------------------------------------------
    // Added a way to configure the name of the player

    // ***END NEW CONTENT*** ------------------------------------------------------------------

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setBounce(0.1);
    this.setCollideWorldBounds(true);
    scene.physics.add.collider(this, scene.collisionLayer);

    // Create the player's animations
    this.anims.create({
      key: "idleRight",
      frames: this.anims.generateFrameNumbers("player", {
        start: 0,
        end: 4,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "idleLeft",
      frames: this.anims.generateFrameNumbers("playerLeft", {
        start: 0,
        end: 4,
      }),
      frameRate: 10,
      repeat: -1,
    });


    this.anims.create({
      key: "runLeft",
      frames: this.anims.generateFrameNumbers("playerLeft", {
        start: 5,
        end: 12,
      }),
      frameRate: 16,
      repeat: -1,
    })

    this.anims.create({
      key: "runRight",
      frames: this.anims.generateFrameNumbers("player", {
        start: 5,
        end: 12,
      }),
      frameRate: 16,
      repeat: -1,
    })

    this.anims.create({
      key: "jumpRight",
      frames: [
        { key: "player", frame: 11 },
        { key: "player", frame: 10 },
        { key: "player", frame: 19 }
      ],
      frameRate: 5,
      repeat: 0
    })

    this.anims.create({
      key: "jumpLeft",
      frames: this.anims.generateFrameNumbers("playerLeft", {
        start: 13,
        end: 15,
      }),
      frameRate: 5,
      repeat: 0
    })

    this.speed = 200;
  }

  setDirection(direction){
    this.direction = direction;
  }
  update(cursors) {
    // Check if the player is on the ground
    if (this.body.blocked.down) {
        this.isGrounded = true;
    } else {
        this.isGrounded = false;
    }

    // Horizontal movement
    if (cursors.left.isDown) {
        this.direction = "left";

        this.setVelocityX(-this.speed);
        if(this.isGrounded) {this.anims.play("runLeft", true);}
        else if(!this.anims.currentAnim.key.includes("left")) {this.anims.play("jumpLeft", true);}

    } else if (cursors.right.isDown) {
        this.direction = "right";

        this.setVelocityX(this.speed);
        if(this.isGrounded) {this.anims.play("runRight", true);}
        else if(!this.anims.currentAnim.key.includes("right")){this.anims.play("jumpRight", true)}

    } else {
        this.setVelocityX(0);
        if (this.isGrounded) {
            if (this.direction === "left") {
                this.anims.play("idleLeft", true);
            } else {
                this.anims.play("idleRight", true);
            }
        }
    }

    // Jumping
    if (cursors.up.isDown && this.isGrounded && !this.anims.currentAnim.key.includes("jump")) {
      this.anims.stop(this.anims.currentAnim.key)
        if (this.direction === "left") {
            this.anims.play("jumpLeft", true);
        } else {
            this.anims.play("jumpRight", true);
        }
        this.setVelocityY(-this.speed * 2); // Adjust jump velocity as needed
        this.isGrounded = false;
    }

    // Apply gravity
    this.setAccelerationY(400); // Adjust gravity as needed
}
}
