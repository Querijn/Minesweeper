var Minesweeper = Minesweeper || {};

Minesweeper.MenuState = class MenuState extends Phaser.State
{
    constructor() 
    {
        super();

        this.Title = { Size: 65, Font: "Arial" }; 
    }

    Preload()
    {
        console.log("Preload menu");
        
        // plugins
        this.UI = this.game.plugins.add(Phaser.Plugin.SlickUI);
        this.UI.load("assets/kenney.json");
    }

    Create()
    {
        // reset zoom
        this.world.scale.set(1);
        
        this.stage.backgroundColor = Minesweeper.Settings.BackgroundColor;

        this.Title.Object = this.add.text(8, 0, "Minesweeper", { font: this.Title.Size + "px " + this.Title.Font, fill: "#FFF", align: "center" });
        
        // Create a UI element with 8 pixels from each side. Space top from title by title font size.
        this.UI.add(this.Panel = new SlickUI.Element.Panel(8, this.Title.Size, this.game.width - 16, this.game.height - this.Title.Size - 8));
        
        // Slider settings
        let t_SliderOffset = 120;
        let TextUpdateFunction = function (a_Field, a_Value) 
        { 
            // Convert percentile to current based on min/max from settings
            let t_LerpValue = Minesweeper.Settings[a_Field.Setting].Min * (1 - a_Value) + Minesweeper.Settings[a_Field.Setting].Max * a_Value;
            
            // Update the label
            a_Field.value = a_Field.Label;
            if(a_Field.ShowAsPercentage) 
                a_Field.value += Math.round(t_LerpValue * 100) + "%";
            else
                a_Field.value += Math.round(t_LerpValue);

            // Update the settings
            Minesweeper.Settings[a_Field.Setting].Current = t_LerpValue;
        };

        // Tile Slider
        let t_SliderValueOffset = (Minesweeper.Settings.Tiles.Current - Minesweeper.Settings.Tiles.Min) / (Minesweeper.Settings.Tiles.Max - Minesweeper.Settings.Tiles.Min);
        this.Panel.add(this.TilesSlider = new SlickUI.Element.Slider(t_SliderOffset, 20, this.Panel.width - t_SliderOffset - 32, t_SliderValueOffset));
        this.Panel.add(this.TilesLabel = new SlickUI.Element.Text(8, 10, "Tiles: "));
        
        this.TilesLabel.Label = this.TilesLabel.value;
        this.TilesLabel.Setting = "Tiles";
        this.TilesLabel.ShowAsPercentage = false;

        this.TilesSlider.onDrag.add(TextUpdateFunction.bind(this, this.TilesLabel));
        this.TilesSlider.onDragStart.add(TextUpdateFunction.bind(this, this.TilesLabel));
        this.TilesSlider.onDragStop.add(TextUpdateFunction.bind(this, this.TilesLabel));
        TextUpdateFunction.call(this, this.TilesLabel, this.TilesSlider._value);
        
        // Mine Slider
        t_SliderValueOffset = (Minesweeper.Settings.Mines.Current - Minesweeper.Settings.Mines.Min) / (Minesweeper.Settings.Mines.Max - Minesweeper.Settings.Mines.Min);
        this.Panel.add(this.MineSlider = new SlickUI.Element.Slider(t_SliderOffset, 68, this.Panel.width - t_SliderOffset - 32, t_SliderValueOffset));
        this.Panel.add(this.MinesLabel = new SlickUI.Element.Text(8, 60, "Mines: "));

        this.MinesLabel.Label = this.MinesLabel.value;
        this.MinesLabel.Setting = "Mines";
        this.MinesLabel.ShowAsPercentage = true;

        this.MineSlider.onDrag.add(TextUpdateFunction.bind(this, this.MinesLabel));
        this.MineSlider.onDragStart.add(TextUpdateFunction.bind(this, this.MinesLabel));
        this.MineSlider.onDragStop.add(TextUpdateFunction.bind(this, this.MinesLabel));
        TextUpdateFunction.call(this, this.MinesLabel, this.MineSlider._value);

        // Is Bot checkbox
        this.Panel.add(this.IsBotCheckbox = new SlickUI.Element.Checkbox(8, 100));
        this.Panel.add(new SlickUI.Element.Text(58, 104, "Let it be played by a bot?"));
        this.IsBotCheckbox.checked = Minesweeper.Settings.IsBot;
        this.IsBotCheckbox.events.onInputDown.add(function ()
        {
            Minesweeper.Settings.IsBot = this.IsBotCheckbox.checked;
        }, this);

        // Instructions
        let t_Instructions = "Left click to clear a tile, exposing the mine or the surrounding mine count.\nRight click to flag a potential mine.";
        if(this.game.device.desktop == false) t_Instructions = "Tap on a tile to show options to clear a mine or to flag.\nClearing exposes a mine (losing you the game) or shows surrounding mine count.";
        this.Panel.add(new SlickUI.Element.Text(8, 150, t_Instructions+ "\nWin by clearing all non-mine fields and flagging all mines!"));

        // Start game button
        this.Panel.add(this.StartGameButton = new SlickUI.Element.Button(8, 250, 140, 80));
        this.StartGameButton.events.onInputUp.add(this.GoIngame.bind(this));
        this.StartGameButton.add(new SlickUI.Element.Text(8, 0, "Start Game")).center();
    }

    GoIngame()
    {
        this.world.scale.set(1);
        this.game.state.start("game_state");

        Minesweeper.Settings.Tiles.Current = Math.round(Minesweeper.Settings.Tiles.Current); // Make sure this is an integer.
    }

    // To adhere to personal coding style but overload regularly.
    preload() { this.Preload(); }
    create() { this.Create(); }
}
