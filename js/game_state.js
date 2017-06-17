var Minesweeper = Minesweeper || {};

Minesweeper.GameState = class GameState extends Phaser.State
{
    constructor() 
    {
        super();

        this.Title = { Size: 65, Font: "Arial" }; 
        this.BrickDimensions = { x: 22, y: 22 };
        this.IsGameOver = false;
    }

    preload()
    {
        this.game.load.spritesheet("brick", "assets/bricks.png", 21, 21, 3);
        this.game.load.spritesheet("numbers", "assets/numbers.png", 9, 12, 10);
        this.game.load.image("bomb", "assets/bomb.png");
    }

    create()
    {
        this.game.stage.backgroundColor = "#afceff";
        this.GameGrid = [];

        let t_Size = Minesweeper.Settings.Tiles.Current;
        let t_ScrollViewSizeMultiplier = 1.2;

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
        this.MineCount = Math.floor(Minesweeper.Settings.Mines.Current * t_Size * t_Size);
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
        
        // Input
        this.game.input.mouse.mouseWheelCallback = this.UpdateMouseWheel.bind(this);
    }

    OnLose()
    {
        this.IsGameOver = true;
        
        // Show all mines
        let t_Size = Minesweeper.Settings.Tiles.Current;
        for(let y = 0; y < t_Size; y++)
        {
            for(let x = 0; x < t_Size; x++)
            {
                var t_Cell = this.GetGridElement(x, y);

                if (t_Cell.IsMine == false)
                    continue;

                let t_Bomb = this.game.add.sprite(t_Cell.Sprite.position.x + t_Cell.Sprite.width * 0.5, t_Cell.Sprite.position.y + t_Cell.Sprite.height * 0.5, "bomb");
                t_Bomb.position.x -= t_Bomb.width * 0.5;
                t_Bomb.position.y -= t_Bomb.height * 0.5;
                t_Bomb.z = this.Sprite + 1;
            }
        }
    }

    update()
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
        let t_WorldScale = (this.camera.scale.x + this.world.scale.y) * 0.5;
        this.world.scale.set(Math.max(Minesweeper.Settings.Zoom.Min, Math.min(Minesweeper.Settings.Zoom.Max, t_WorldScale + this.input.mouse.wheelDelta * 0.1)));
        this.SetBounds();

        // move camera to middle if scrollable
        t_WorldScale = (this.camera.scale.x + this.world.scale.y) * 0.5;
        if (this.DoesCameraScroll == false)
        {
            this.game.camera.x = this.Bounds.x * t_WorldScale * 0.5 - this.game._width * 0.5;
            this.game.camera.y = this.Bounds.y * t_WorldScale * 0.5 - this.game._height * 0.5;
        }
        
        this.DoesCameraScroll = (this.ViewBounds.x < this.GameBounds.x * this.world.scale.x || this.ViewBounds.y < this.GameBounds.y * this.world.scale.y);
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
        this.Bounds = this.GameBounds;
        if(this.ViewBounds.x > this.GameBounds.x || this.ViewBounds.y > this.GameBounds.y)
        {
            console.log("Using view bounds");
            this.Bounds = this.ViewBounds;
        }    
        this.game.world.setBounds(0, 0, this.Bounds.x, this.Bounds.y);
    }
}
