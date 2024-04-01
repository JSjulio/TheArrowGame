export class ArrowGroup extends Phaser.Physics.Arcade.Group
{
	constructor(scene) {
		// Call the super constructor, passing in a world and a scene
		super(scene.physics.world, scene, { allowGravity: false});

		// Initialize the group
		this.createMultiple({
			classType: Arrow, // This is the class we create just below
			frameQuantity: 30, // Create 30 instances in the pool
			active: false,
			visible: false,
			key: 'arrow',
		});
        this.children.iterate(child => {
            child.body.setEnable(true);
            // Add any additional physics settings here if needed
        });

        scene.physics.add.collider(this, scene.collisionLayer, this.arrowCollisionHandler, null, this);
    }

    fireArrow(x, y, player) {
        // Get the first available sprite in the group
        const arrow = this.getFirstDead(false);
        if (arrow) {
            // arrow.setScale(3);
            arrow.fire(x, y, player);
        }
    }

    arrowCollisionHandler(arrow, collisionLayer) {
        // Handle collision between arrows and the collision layer here
        // This function will be called when an arrow collides with the collision layer
        // You can define custom behavior such as destroying the arrow or triggering effects
        arrow.setActive(false);
        arrow.setVisible(false);
        // Additional handling code here
    }
}

export class Arrow extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y) {
		super(scene, x, y, 'arrow');
        // this.setScale(2)
        this.damage = 1;
        this.firedPlayerId;
	}

    fire(x, y, player) {
        this.firedPlayerId = player.id;
		this.body.reset(x, y);
 
		this.setActive(true);
		this.setVisible(true);
 
        const velocityX = player.direction === 'left' ? -player.speed : player.speed; // Adjust velocity as needed
        if(player.body.velocity.x == 0){
            this.setVelocity(velocityX, 0)
        }
        else{
            this.setVelocity(player.body.velocity.x, player.body.velocity.y);
        }
	}

    preUpdate(time, delta) {
		super.preUpdate(time, delta);
 
		if (this.y <= 0) {
			this.setActive(false);
			this.setVisible(false);
		}
	}
}