var Minesweeper = Minesweeper || {};

Minesweeper.GameState = class GameState extends Phaser.State
{
    constructor() 
    {
        super();

        this.Title = { Size: 65, Font: "Arial" }; 
    }

    preload()
    {
        console.log("Preload game");
    }

    create()
    {
        
    }
}
