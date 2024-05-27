class EndScene extends Phaser.Scene {
    constructor() {
        super("endScene");
    }

    create() {
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Congrats! You made it!', {
            fontSize: '64px',
            fill: '#fff'
        }).setOrigin(0.5, 0.5);
    }
}