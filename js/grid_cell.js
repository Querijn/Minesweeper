var Minesweeper = Minesweeper || {};

Minesweeper.GridCell = class GridCell
{
    constructor(a_Sprite, a_X, a_Y, a_Grid, a_Game) 
    {
        this.Sprite = a_Sprite;
        this.IsMine = false;
        this.IsCleared = false;
        this.IsFlagged = false;
        this.Grid = a_Grid;
        this.Game = a_Game;
        this.NumberSprite = null;

        this.x = a_X;
        this.y = a_Y;

        this.Sprite.events.onInputDown.add(this.OnGridInput, this);
    }

    OnGridInput()
    {
        if(this.Game.device.desktop)
        {
            let t_LeftMouse = this.Game.input.activePointer.leftButton.isDown;
            let t_RightMouse = this.Game.input.activePointer.rightButton.isDown;

            if (t_LeftMouse && t_RightMouse)
                return; // To be sure the user doesn't mess up accidentally
            else if (t_LeftMouse) 
                this.SetClear();
            else if (t_RightMouse) 
                this.ToggleFlag();
        }
        else if (this.Game.device.touch)
        {
            // Spawn radial menu
        }
    }

    ToggleFlag()
    {
        // Flagging is unnecessary when it's already cleared.
        if (this.IsCleared)
            return;

        let t_X = this.Sprite.position.x;
        let t_Y = this.Sprite.position.y;

        if (this.IsFlagged)
            this.Sprite.frame = this.y == 0 ? 1 : 0; // Show top_brick for 0
        else this.Sprite.frame = 2; // Show flagged
        this.IsFlagged = !this.IsFlagged;
        
        this.Sprite.events.onInputDown.add(this.OnGridInput, this);
    }

    SetClear()
    {
        // Don't react when it's already cleared or already flagged.
        if (this.IsCleared || this.IsFlagged)
            return true;

        // We lose when it's a mine
        if (this.IsMine)
            return false;

        this.IsCleared = true;

        // Add a number
        this.NumberSprite = this.Game.add.sprite(this.Sprite.position.x + this.Sprite.width * 0.5, this.Sprite.position.y + this.Sprite.height * 0.5, "numbers");
        this.NumberSprite.position.x -= this.NumberSprite.width * 0.5;
        this.NumberSprite.position.y -= this.NumberSprite.height * 0.5;
        this.NumberSprite.z = this.Sprite + 1;

        // Count mines in surrounding area
        for(let y = -1; y <= 1; y++)
            for(let x = -1; x <= 1; x++)
            {
                if(y == 0 && x == 0)
                    continue;

                // Don't count out of bounds
                if (this.y + y < 0 || this.y + y >= Minesweeper.Settings.Tiles.Current || this.x + x < 0 || this.x + x >= Minesweeper.Settings.Tiles.Current)
                    continue;
                
                if (this.Grid[(this.y + y) * Minesweeper.Settings.Tiles.Current + (this.x + x)].IsMine)
                    this.NumberSprite.frame++;
            }
        
        this.IsCleared = true;
        
        // Open up surrounding areas if it's zero.
        if (this.NumberSprite.frame == 0)
        {
            for(let y = -1; y <= 1; y++)
                for(let x = -1; x <= 1; x++)
                {
                    if(y == 0 && x == 0)
                        continue;

                    // Don't clear out of bounds elements
                    if (this.y + y < 0 || this.y + y >= Minesweeper.Settings.Tiles.Current || this.x + x < 0 || this.x + x >= Minesweeper.Settings.Tiles.Current)
                        continue;

                    this.Grid[(this.y + y) * Minesweeper.Settings.Tiles.Current + (this.x + x)].SetClear();
                }
        }  

        // We didn't lose
        return true;
    }
}
