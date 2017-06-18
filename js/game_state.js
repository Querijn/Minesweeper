var Minesweeper = Minesweeper || {};

Minesweeper.GameState = class GameState extends Phaser.State
{
    constructor() 
    {
        super();

        this.Title = { Size: 65, Font: "Arial" }; 
        this.BrickDimensions = { x: 22, y: 22 };

        this.GameGrid = [];
        this.BombSprites = [];
        this.GameOverText = null;
        this.MenuButton = null;
        this.PlayAgain = null;
    }

    Preload()
    {
        this.game.load.spritesheet("brick", "assets/bricks.png", 21, 21, 3);
        this.game.load.spritesheet("numbers", "assets/numbers.png", 9, 12, 10);
        this.game.load.image("bomb", "assets/bomb.png");

        // UI
        this.UI = this.game.plugins.add(Phaser.Plugin.SlickUI);
        this.UI.load("assets/kenney.json");
    }

    Create()
    {   
        this.stage.backgroundColor = Minesweeper.Settings.BackgroundColor;

        let t_ScrollViewSizeMultiplier = 1.2;
        let t_Size = Minesweeper.Settings.Tiles.Current;

        // Reset all variables to starting values
        this.Reset();

        // The size of the field in which you can scroll.
        this.GameBounds = 
        { 
            x: t_ScrollViewSizeMultiplier * t_Size * this.BrickDimensions.x, 
            y: t_ScrollViewSizeMultiplier * t_Size * this.BrickDimensions.y
        };
        
        // Screen size, multiplied for correct comparisons to game bounds
        this.ViewBounds = 
        { 
            x: t_ScrollViewSizeMultiplier * this.game._width, 
            y: t_ScrollViewSizeMultiplier * this.game._height
        };

        // Determine what bounds we should use for the view.
        this.SetBounds();

        // If the game bounds exceed in any way, make the camera scrollable
        this.DoesCameraScroll = (this.ViewBounds.x < this.GameBounds.x || this.ViewBounds.y < this.GameBounds.y);

        // Make mine grid
        for(let y = 0; y < t_Size; y++)
        {
            for(let x = 0; x < t_Size; x++)
            {
                let t_Index = y * t_Size + x;
                let t_Position = 
                { 
                    x: this.Bounds.x * 0.5 + (x - t_Size * 0.5) * this.BrickDimensions.x, 
                    y: this.Bounds.y * 0.5 + (y - t_Size * 0.5) * this.BrickDimensions.y 
                };
                var t_Sprite = this.game.add.sprite(t_Position.x, t_Position.y, "brick");
                t_Sprite.frame = y == 0 ? 1 : 0; // Show top_brick for 0
                t_Sprite.smoothed = false;
                t_Sprite.inputEnabled = true;

                this.GameGrid[t_Index] = new Minesweeper.GridCell(t_Sprite, x, y, this.GameGrid, this.game, this);
            }
        }
        
        // Select random mines.
        this.FlagsAvailable = this.MineCount = Math.floor(Minesweeper.Settings.Mines.Current * t_Size * t_Size);
        for(let i = 0; i < this.MineCount; i++)
        {
            while(true)
            {
                var t_MineIndex = Math.floor(Math.random() * t_Size * t_Size);
                if (this.GameGrid[t_MineIndex].IsMine) // Already a mine, try again
                    continue;
                
                var t_PositionY = Math.floor(t_MineIndex / t_Size);
                var t_PositionX = t_MineIndex % t_Size;

                this.GameGrid[t_MineIndex].IsMine = true;
                break;
            }
        }

        // Center camera
        this.game.camera.x = this.Bounds.x * 0.5 - this.game._width * 0.5;
        this.game.camera.y = this.Bounds.y * 0.5 - this.game._height * 0.5;

        // UI
        this.UI.add(this.FlagsText = new SlickUI.Element.Text(8, 0, "Flags available: "));
        this.FlagsText.Label = "Flags available: ";
        this.UpdateUI();
        
        // Input
        this.game.input.mouse.mouseWheelCallback = this.UpdateMouseWheel.bind(this);
    }

    Reset()
    {
        this.IsGameOver = false;
        this.Won = false;

        // Remove grid
        if(this.GameGrid)
        {
            for(let i = 0; i < this.GameGrid.length; i++)
            {
                if (this.GameGrid[i].Sprite != null)
                    this.GameGrid[i].Sprite.destroy();
                
                if (this.GameGrid[i].NumberSprite != null)
                    this.GameGrid[i].NumberSprite.destroy();
            }
            this.GameGrid = [];
        }

        // Remove all bombs
        if(this.BombSprites)
        {
            for(let i = 0; i < this.BombSprites.length; i++)
                this.BombSprites[i].destroy();

            this.BombSprites = [];
        }
        

        // Reset all UI elements
        if(this.GameOverText) this.GameOverText.removeAll();
        if(this.MenuButton) this.MenuButton.removeAll();
        if(this.PlayAgain) this.PlayAgain.removeAll();
        this.GameOverText = null;
        this.MenuButton = null;
        this.PlayAgain = null;
    }

    CheckForWin()
    {
        // Can only have won if we used all flags
        if (this.FlagsAvailable != 0)
            return;

        // Check if a non-minefield has to be flagged.
        let t_Size = Minesweeper.Settings.Tiles.Current;
        for(let i = 0; i < t_Size * t_Size; i++)
        {
            // All mines have to be flagged
            if (this.GameGrid[i].IsMine && this.GameGrid[i].IsFlagged == false)
                return false;

            // All non-mines have to be cleared
            if (this.GameGrid[i].IsMine == false && this.GameGrid[i].IsCleared == false)
                return false;
        }

        // We passed all checks, all mines are flagged.
        this.OnWin();
        return true;
    }

    OnLose()
    {
        this.IsGameOver = true;
        this.Won = false;

        this.ShowMines();
        this.UI.add(this.GameOverText = new SlickUI.Element.Text(8, 16, "You lost!"));

        // Play again button
        this.UI.add(this.PlayAgain = new SlickUI.Element.Button(8, 38, 140, 32));
        this.PlayAgain.events.onInputUp.add(this.create.bind(this));
        this.PlayAgain.add(new SlickUI.Element.Text(0,0, "Try again")).center();

        // Play again button
        this.UI.add(this.PlayAgain = new SlickUI.Element.Button(8, 38, 140, 32));
        this.PlayAgain.events.onInputUp.add(this.create.bind(this));
        this.PlayAgain.add(new SlickUI.Element.Text(0,0, "Try again")).center();

        // Menu button
        this.UI.add(this.MenuButton = new SlickUI.Element.Button(8, 78, 140, 32));
        this.MenuButton.events.onInputUp.add(function() { this.game.state.start("menu_state") }.bind(this));
        this.MenuButton.add(new SlickUI.Element.Text(0, 0, "Go to menu")).center();
    }

    OnWin()
    {
        this.IsGameOver = true;
        this.Won = true;

        this.ShowMines();
        this.UI.add(this.GameOverText = new SlickUI.Element.Text(8, 16, "You won!"));

        // Play again button
        this.UI.add(this.PlayAgain = new SlickUI.Element.Button(8, 38, 140, 32));
        this.PlayAgain.events.onInputUp.add(this.create.bind(this));
        this.PlayAgain.add(new SlickUI.Element.Text(0, 0, "Play again")).center();

        // Menu button
        this.UI.add(this.MenuButton = new SlickUI.Element.Button(8, 78, 140, 32));
        this.MenuButton.events.onInputUp.add(function() { this.game.state.start("menu_state") }.bind(this));
        this.MenuButton.add(new SlickUI.Element.Text(0, 0, "Go to menu")).center();
    }

    UpdateUI()
    {
        this.FlagsText.value = this.FlagsText.Label + this.FlagsAvailable;
        this.FlagsText.text.scale.set(1.0 / this.world.scale.x);
    }

    Update()
    {
        this.UpdateMouseDrag();
    }

    UpdateMouseDrag()
    {
        if (this.game.input.activePointer.isDown && this.DoesCameraScroll) 
        {	
            if (this.game.DragStartPosition) 
            {		
                // move the camera by the amount the mouse has moved since last update		
                this.game.camera.x += this.game.DragStartPosition.x - this.game.input.activePointer.position.x;
                this.game.camera.y += this.game.DragStartPosition.y - this.game.input.activePointer.position.y;	
            }	

            // set new drag origin to current position	
            this.game.DragStartPosition = this.game.input.activePointer.position.clone();
        }
        else this.game.DragStartPosition = null;
    }

    UpdateMouseWheel(event) 
    {   
        // Set scale
        this.world.scale.set(Math.max(Minesweeper.Settings.Zoom.Min, Math.min(Minesweeper.Settings.Zoom.Max, this.world.scale.x + this.input.mouse.wheelDelta * 0.1)));
        this.SetBounds();

        // move camera to middle if scrollable
        this.game.camera.x = this.Bounds.x * this.world.scale.x * 0.5 - this.game._width * 0.5;
        this.game.camera.y = this.Bounds.y * this.world.scale.x * 0.5 - this.game._height * 0.5;
        
        this.DoesCameraScroll = (this.ViewBounds.x < this.GameBounds.x * this.world.scale.x || this.ViewBounds.y < this.GameBounds.y * this.world.scale.y);
        this.UpdateUI();
    }

    ShowMines()
    {
        // Show all mines
        let t_Size = Minesweeper.Settings.Tiles.Current;
        for(let i = 0; i < t_Size * t_Size; i++)
        {
            let t_Cell = this.GameGrid[i];
            if (t_Cell.IsMine == false) // Don't show on non-mine fields
                continue;

            this.BombSprites.push(this.game.add.sprite(t_Cell.Sprite.position.x + t_Cell.Sprite.width * 0.5, t_Cell.Sprite.position.y + t_Cell.Sprite.height * 0.5, "bomb"));
            let t_Bomb = this.BombSprites[this.BombSprites.length - 1];
            t_Bomb.position.x -= t_Bomb.width * 0.5;
            t_Bomb.position.y -= t_Bomb.height * 0.5;
            t_Bomb.z = this.Sprite + 1;
        }
    }

    GetGridElement(a_X, a_Y)
    {
        // Out of bounds
        if (a_X < 0 || a_X > Minesweeper.Settings.Tiles.Current || a_Y < 0 || a_Y > Minesweeper.Settings.Tiles.Current)
            return null;

        return this.GameGrid[a_Y * Minesweeper.Settings.Tiles.Current + a_X];
    }

    SetBounds()
    {
        if(this.ViewBounds.x > this.GameBounds.x || this.ViewBounds.y > this.GameBounds.y)
            this.Bounds = this.ViewBounds;
        else this.Bounds = this.GameBounds;
        this.game.world.setBounds(0, 0, this.Bounds.x, this.Bounds.y);
    }

    // To adhere to personal coding style but overload regularly.
    update() { this.Update(); }
    preload() { this.Preload(); }
    create() { this.Create(); }
}
