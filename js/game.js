var Minesweeper = Minesweeper || {};

Minesweeper.Game = class Game extends Phaser.Game
{
    constructor(a_Width, a_Height, a_DivID) 
    {
        // Using CANVAS because of a flicker in WebGL
        super(a_Width, a_Height, Phaser.CANVAS, a_DivID);

        // states
        this.state.add("menu_state", Minesweeper.MenuState);
        this.state.add("game_state", Minesweeper.GameState);
        this.state.start(Minesweeper.Settings.StartingState);

        console.log("Game started.");
    }
}
