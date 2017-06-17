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

        let t_ViewBounds = 
        { 
            x: 2 * this.game._width, 
            y: 2 * this.game._height
        };

        let t_GameBounds = 
        { 
            x: 2 * t_Size * this.BrickDimensions.x, 
            y: 2 * t_Size * this.BrickDimensions.y
        };

        let t_Bounds = t_GameBounds;
        if(t_ViewBounds.x > t_GameBounds.x || t_ViewBounds.y > t_GameBounds.y)
        {
            console.log("Using view bounds");
            t_Bounds = t_ViewBounds;
        }    

        this.game.world.setBounds(0, 0, t_Bounds.x, t_Bounds.y);

        for(let y = 0; y < t_Size; y++)
        {
            this.MineGrid[y] = [];
            for(let x = 0; x < t_Size; x++)
            {
                let t_Element = {};

                t_Element.Sprite = this.game.add.sprite(t_Bounds.x * 0.5 + (x - t_Size * 0.5) * this.BrickDimensions.x, t_Bounds.y * 0.5 + (y - t_Size * 0.5) * this.BrickDimensions.y, y == 0 ? "top_brick" : "bottom_brick");

                this.MineGrid[y][x] = t_Element;
            }
        }

        this.game.camera.x = t_Bounds.x * 0.5 - this.game._width * 0.5;
        this.game.camera.y = t_Bounds.y * 0.5 - this.game._height * 0.5;
    }

    update()
    {
        if (this.game.input.activePointer.isDown) 
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
        else 
        { 
            this.game.DragStartPosition = null;
        }
    }
}
