class EndScene extends Phaser.Scene {
    constructor() {
        super("endScene");
    }

    create() {
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Congrats! You made it!', {
            fontSize: '64px',
            fill: '#fff'
        }).setOrigin(0.5, 0.5);

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'Press R to restart', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5, 0.5);

        this.input.keyboard.on('keydown-R', () => {
            this.scene.start('platformerScene');
        }, this);
    }
}