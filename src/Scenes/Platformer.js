class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 120;
        this.DRAG = 220;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1000;
        this.JUMP_VELOCITY = -425;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;

        // Initialize global object
        this.my = {
            sprite: {},
            vfx: {}
        };
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 16, 16, 80, 20);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset1 = this.map.addTilesetImage("kenny-tilemap-packed", "tilemap_tiles1");
        this.tileset2 = this.map.addTilesetImage("kenny-tilemap-packed-transparent", "tilemap_tiles2");

        // Add the sounds
        //this.walkSound = this.sound.add('walk');
        //this.walkSound.rate = 1.7;
        this.coinSound = this.sound.add('coin');
        this.coinSound.rate = 1;

        // Create layers
        this.obstaclesLayer = this.map.createLayer("Obstacles", this.tileset2, 0, 0);
        this.deathLayer = this.map.createLayer("Ouchies", this.tileset2, 0, 0);
        this.groundLayer = this.map.createLayer("Blocks-n-Background", this.tileset1, 0, 0);
        this.decorLayer = this.map.createLayer("Vines-n-Pipes", this.tileset2, 0, 0);

        // Make layers collidable
        this.groundLayer.setCollisionByProperty({ collides: true });
        this.obstaclesLayer.setCollisionByProperty({ collides: true });
        this.deathLayer.setCollisionByProperty({ collides: true });

        // Set up player avatar
        this.my.sprite.player = this.physics.add.sprite(40, 120, "guy_walk");
        this.my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(this.my.sprite.player, this.groundLayer);
        this.physics.add.collider(this.my.sprite.player, this.obstaclesLayer);
        
        // Death collision handler
        this.physics.add.collider(this.my.sprite.player, this.deathLayer, () => { this.death(); });

        // Create collectable objects and groups
        this.coins = this.map.createFromObjects("Collectables", {
            name: "coins",
            key: "tilemap_sheet",
            frame: 21
        });

        this.finish = this.map.createFromObjects("Finish", {
            name: "finish",
            key: "tilemap_sheet",
            frame: 102
        });

        // Enable physics for coins
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);

        // Coin collision handler
        this.physics.add.overlap(this.my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.coinSound.play();
        });

        // Enable physics for finish object
        this.physics.world.enable(this.finish, Phaser.Physics.Arcade.STATIC_BODY);
        this.finishGroup = this.add.group(this.finish);

        // Finish collision handler
        this.physics.add.overlap(this.my.sprite.player, this.finishGroup, (obj1, obj2) => {
            this.scene.start('endScene'); // Transition to the end scene
        });

        // Set up cursor key input
        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');

        // Debug key listener
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic.clear();
        }, this);

        // Particle emitter for walking effect
        this.my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['flame_01.png', 'flame_03.png'],
            scale: { start: 0.03, end: 0.1 },
            lifespan: 350,
            alpha: { start: 1, end: 0.1 },
        });

        // Initially stop the particle emitter
        this.my.vfx.walking.stop();

        // Camera setup
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
    }

    update() {
        let isWalking = false;

        if (cursors.left.isDown) {
            // Accelerate left
            this.my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
            this.my.sprite.player.setFlip(true, false);
            this.my.sprite.player.anims.play('walk', true);
            isWalking = true;

            this.my.vfx.walking.startFollow(this.my.sprite.player, this.my.sprite.player.displayWidth / 2 - 10, this.my.sprite.player.displayHeight / 2 - 5, false);
            this.my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (this.my.sprite.player.body.blocked.down) {
                this.my.vfx.walking.start();
            }

        } else if (cursors.right.isDown) {
            // Accelerate right
            this.my.sprite.player.body.setAccelerationX(this.ACCELERATION);
            this.my.sprite.player.resetFlip();
            this.my.sprite.player.anims.play('walk', true);
            isWalking = true;

            this.my.vfx.walking.startFollow(this.my.sprite.player, this.my.sprite.player.displayWidth / 2 - 10, this.my.sprite.player.displayHeight / 2 - 5, false);
            this.my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (this.my.sprite.player.body.blocked.down) {
                this.my.vfx.walking.start();
            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            this.my.sprite.player.body.setAccelerationX(0);
            this.my.sprite.player.body.setDragX(this.DRAG);
            this.my.sprite.player.anims.pause();

            this.my.vfx.walking.stop();
        }

        // Player jump
        if (this.my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            this.my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }

        // Restart scene on 'R' key press
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        /*
        // Play walking sound if player is walking
        if (isWalking) {
            if (!this.walkSound.isPlaying) {
                this.walkSound.play({ loop: true });
            }
        } else {
            if (this.walkSound.isPlaying) {
                this.walkSound.stop();
            }
        }*/
    }

    death() {
        // Handle player death
        this.scene.restart();
        //this.walkSound.stop();
    }
}