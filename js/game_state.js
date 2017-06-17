var Minesweeper = Minesweeper || {};

Minesweeper.GameState = class GameState extends Phaser.State
{
    constructor() 
    {
        super();
    }

    preload()
    {
        game.load.image('top_brick', 'assets/top_brick.png', 21, 21);
        game.load.image('bottom_brick', 'assets/bottom_brick.png', 21, 21);
        game.load.spritesheet('number', 'assets/numbers.png', 9, 12, 10);

        console.log("Started loading game state preloads.");
    }

    update()
    {
    }
}
