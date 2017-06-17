var Minesweeper = Minesweeper || {};

Minesweeper.GameState = class GameState extends Phaser.State
{
    constructor() 
    {
        super();

        this.Title = { Size: 65, Font: "Arial" }; 
        this.BrickDimensions = { x: 22, y: 22 };
    }

    preload()
    {
        this.game.load.image("top_brick", "assets/top_brick.png");
        this.game.load.image("bottom_brick", "assets/bottom_brick.png");
        this.game.load.image("brick_mask", "assets/bottom_brick.png");
        this.game.load.spritesheet("numbers", "assets/numbers.png", 9, 12, 10);
    }

    create()
    {
        this.game.stage.backgroundColor = "#afceff";
        this.MineGrid = [];

        let t_Size = this.game.Settings.Tiles.Current;
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
        this.Bounds = this.GameBounds;
        if(this.ViewBounds.x > this.GameBounds.x || this.ViewBounds.y > this.GameBounds.y)
        {
            console.log("Using view bounds");
            this.Bounds = this.ViewBounds;
        }    

        // If the game bounds exceed in any way, make the camera scrollable
        this.DoesCameraScroll = (this.ViewBounds.x < this.GameBounds.x || this.ViewBounds.y < this.GameBounds.y);
        this.game.world.setBounds(0, 0, this.Bounds.x, this.Bounds.y);

        for(let y = 0; y < t_Size; y++)
        {
            this.MineGrid[y] = [];
            for(let x = 0; x < t_Size; x++)
            {
                let t_Element = {};

                t_Element.Sprite = this.game.add.sprite(this.Bounds.x * 0.5 + (x - t_Size * 0.5) * this.BrickDimensions.x, this.Bounds.y * 0.5 + (y - t_Size * 0.5) * this.BrickDimensions.y, y == 0 ? "top_brick" : "bottom_brick");
                t_Element.Sprite.smoothed = false;

                this.MineGrid[y][x] = t_Element;
            }
        }

        this.game.camera.x = this.Bounds.x * 0.5 - this.game._width * 0.5;
        this.game.camera.y = this.Bounds.y * 0.5 - this.game._height * 0.5;
        
        this.game.input.mouse.mouseWheelCallback = this.UpdateMouseWheel.bind(this);
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
        this.world.scale.set(Math.max(this.game.Settings.Zoom.Min, Math.min(this.game.Settings.Zoom.Max, t_WorldScale + this.input.mouse.wheelDelta * 0.1)));

        // move camera to middle if scrollable
        t_WorldScale = (this.camera.scale.x + this.world.scale.y) * 0.5;
        if (this.DoesCameraScroll == false)
        {
            this.game.camera.x = this.Bounds.x * t_WorldScale * 0.5 - this.game._width * 0.5;
            this.game.camera.y = this.Bounds.y * t_WorldScale * 0.5 - this.game._height * 0.5;
        }
        
        this.DoesCameraScroll = (this.ViewBounds.x < this.GameBounds.x * this.world.scale.x || this.ViewBounds.y < this.GameBounds.y * this.world.scale.y);
    }
}
