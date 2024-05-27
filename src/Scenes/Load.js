class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Sounds
        //this.load.audio('walk', 'footstep.mp3');
        this.load.audio('coin', 'coin.mp3');

        // Load characters spritesheet
        this.load.spritesheet("guy_walk", "guyWalk.png", {frameWidth: 16, frameHeight: 16});
        //this.load.spritesheet("guy_jump", "guyJump.png", {frameWidth: 16, frameHeight: 16});
        //this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles1", "tilemap_packed.png"); // Packed tilemap
        this.load.image("tilemap_tiles2", "tilemap_transparent_packed.png");    
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj"); // Tilemap in JSON

        this.load.spritesheet("tilemap_sheet", "tilemap_transparent_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        // Oooh, fancy. A multi atlas is a texture atlas which has the textures spread
        // across multiple png files, so as to keep their size small for use with
        // lower resource devices (like mobile phones).
        // kenny-particles.json internally has a list of the png files
        // The multiatlas was created using TexturePacker and the Kenny
        // Particle Pack asset pack.
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
        
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('guy_walk'),
            frameRate: 15,
            repeat: -1
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}