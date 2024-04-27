export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, name, pid, gameId) {
    super(scene, x, y, "player");
    console.log(
      `Creating player at X:${this.x} with type:${typeof x} and Y:${
        this.y
      } with type: ${typeof y}`
    );

    this.name = name;
    this.id = pid; // here this.id is the player's socket.id. which is that same as player.id 
    this.direction = "left";
    this.isGrounded = true;
    this.gameId = gameId;
    this.lives = 10; 
    this.active = true; // All players start as active since they ready up the ReadyLobby Scene. When a player dies they become inactive again.


    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setBounce(0.1);

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

    // Stretch - add attack left and attack right animations to player and transmit to game room following
    

    const shootAnim = this.direction === "left" ? "attackLeft" : "attackRight";
    this.anims.play(shootAnim, true);
    if (this.direction === "left") {
      this.flipX = true;
      this.anims.play("attack");
    } else {
      this.flipX = false;
      this.anims.play("attack");
    }
  
    //  Destroy arrow after collision with collisionLayer
    this.scene.physics.add.collider(arrow, this.scene.collisionLayer, () => {
      arrow.destroy();
    });

  }

  setDirection(direction) {
    this.direction = direction;
  }
 

loseLife() {
    if (this.lives > 0) {
      this.lives -= 1;
      this.scene.cameras.main.shake(300, 0.01); // Shake the camera for 300ms with an intensity of 0.01 when the player gets hit
    }
    if (this.lives <= 0) {
      this.lives = 0; // Set lives to 0 to prevent further loss of lives
      this.setAlpha(0.5); // set player as half transparent when they lose all their lives on the client side
      this.playerDead(); 
    }
  }

  playerDead () {
  this.active = false; // disable player movements on server side
  this.anims.play("die", true);
  this.setVelocityX(0);
  this.setVelocityY(0);
  this.disableBody(true, true); // set the player active to false
  this.scene.socket.emit('playerDied', { gameId: this.gameId, playerId: this.id }); // send a message to the server that the player has died
  this.lives = 0; // sets lives to 0 after player dies
  
  //player die effects 
  this.scene.cameras.main.shake(300, 4.7); // shake the camera when player dies 
  this.scene.cameras.main.fade(300, 255, 0, 0); // fade the camera to red
  this.scene.cameras.main.once("camerafadeoutcomplete", () => {
    this.scene.cameras.main.fadeIn(3000), 125, 217, 217;    
    this.scene.scene.launch('GameOver', { playerId: this.id}); // ! Test - Launch GameOver scene and give client the option to leave game or stay and watch the game
    this.scene.scene.resume('Game'); // ! test resume the scene and await for client to make a decision on staying or leaving the game
  });

  }   

  // ***END NEW CONTENT*** ------------------------------------------------------------------



  update(cursors) {
  
    if (this.active === false) {
      return; // If the player is not active, don't update their position/shooting ability 
    } 

    // Check if the player is on the ground
    if (this.body.blocked.down) {
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
    if (cursors.space && Phaser.Input.Keyboard.JustDown(cursors.space)) { 
  
      // Trigger shoot animation
      this.shoot();  

      if (!this.dead) { 
        // Emit playerShoot event to the server
      this.scene.socket.emit('playerShoot', { gameId: this.gameId, playerId: this.id, x: this.x, y: this.y, direction: this.direction });
    }
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