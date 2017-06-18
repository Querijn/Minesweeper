var Minesweeper = Minesweeper || {};

Minesweeper.Bot = class MinesweeperBot
{
    constructor(a_State)
    {
        console.log("🤖: Starting up..");
        this.State = a_State;

        this.Reset();
    }

    Reset()
    {
        this.Clears = [];
        this.Flags = [];
        this.ChanceGrid = [];
        for (let i = 0; i < this.State.GameGrid.length; i++)
            this.ChanceGrid.push([]); 
    }

    Destroy()
    {
        Reset();
    }

    CalculateStrategy()
    {
        console.log("🤖: Calculating strategy.. ");

        // restart if game over
        if (this.State.IsGameOver)
            return;

        // Reset chance-grid
        for (let i = 0; i < this.ChanceGrid.length; i++)
            this.ChanceGrid[i] = [];

        // Calculate chance-grid and handle cells
        console.log("🤖: Calculating chances.. ");
        let t_Size = Minesweeper.Settings.Tiles.Current;
        let t_ChancesCalculated = 0;
        for (let y = 0; y < t_Size; y++)
        {
            for (let x = 0; x < t_Size; x++)
            {
                let t_GridCell = this.State.GameGrid[y * t_Size + x];
                if (t_GridCell.IsCleared == false) // Remove this check if you want the bot to cheat.
                    continue;
                
                let t_UnknownCells = [];
                let t_Mines = [];
                for(let dy = -1; dy <= 1; dy++)
                {
                    for(let dx = -1; dx <= 1; dx++)
                    {
                        if(dy == 0 && dx == 0)
                            continue;

                        // Don't clear out of bounds elements
                        if (y + dy < 0 || y + dy >= t_Size || x + dx < 0 || x + dx >= t_Size)
                            continue;

                        let t_CloseCell = this.State.GameGrid[(y + dy) * t_Size + (x + dx)];
                        if (t_CloseCell.IsCleared == false && t_CloseCell.IsFlagged == false)
                            t_UnknownCells.push(t_CloseCell);
                        if(t_CloseCell.IsFlagged)
                            t_Mines.push(t_CloseCell);
                    }
                }

                // Don't calculate for cells that aren't interesting.
                if (t_GridCell.MinesSurrounding == 0 || t_UnknownCells.length == 0)
                    continue;

                // If we're 100% sure about these (We have as many unknown cells as we have mines unidentified)..
                if (t_UnknownCells.length == (t_GridCell.MinesSurrounding - t_Mines.length))
                    for(let i = 0; i < t_UnknownCells.length; i++)
                    {
                        var t_Index = t_UnknownCells[i].y * t_Size + t_UnknownCells[i].x;
                        if (this.State.GameGrid[t_Index].IsFlagged == false)
                            this.Flags.push(t_Index); // add actions immediately
                    }    

                // If we have found all mines, but some fields are open
                if (t_Mines.length == t_GridCell.MinesSurrounding)
                    for(let i = 0; i < t_UnknownCells.length; i++)
                    {
                        this.Clears.push(t_UnknownCells[i].y * t_Size + t_UnknownCells[i].x); // add actions immediately
                    }    
                
                let t_Chance = t_GridCell.MinesSurrounding / t_UnknownCells.length;
                for(let i = 0; i < t_UnknownCells.length; i++)
                {
                    this.ChanceGrid[t_UnknownCells[i].y * t_Size + t_UnknownCells[i].x].push(t_Chance);
                    t_ChancesCalculated++;
                }   
            }
        }
        console.log("🤖: Calculated " + t_ChancesCalculated + " chances.. ");

        // We don't have anything to do.. Grow slightly more desperate
        if (this.Clears.length == 0 && this.Flags.length == 0)
        {
            // Find the lowest chance-grid chance
            let t_LowestChance = 1.1;
            let t_LowestChanceCell = null;
            for (let i = 0; i < this.ChanceGrid.length; i++)
            {
                // Don't take these into accounts
                if (this.ChanceGrid[i].length == 0)
                    continue;

                let t_CurrentChanceTotal = 0;
                for (let j = 0; j < this.ChanceGrid[i].length; j++)
                    t_CurrentChanceTotal += this.ChanceGrid[i][j];
                
                let t_CurrentChance = t_CurrentChanceTotal / this.ChanceGrid[i].length;

                if (t_LowestChance > t_CurrentChance)
                {
                    t_LowestChance = t_CurrentChance;
                    t_LowestChanceCell = this.State.GameGrid[i];
                }
            }

            if (t_LowestChanceCell != null && t_LowestChance < 0.20)
            {
                console.log("🤖: Lowest chance cell is " + Math.round(100 * t_LowestChance) + "% chance. Clearing that one..");
                this.Clears.push(t_LowestChanceCell.y * Minesweeper.Settings.Tiles.Current + t_LowestChanceCell.x); // add action
            }

            // Else just choose a random cell.
            else
            {
                this.Clears.push(Math.floor(Math.random() * Minesweeper.Settings.Tiles.Current * Minesweeper.Settings.Tiles.Current));
            }
        }
    }

    DoClearAction(a_Index)
    {
        if (this.State.GameGrid[a_Index].IsCleared)
            return false;
        console.log("🤖: Clearing " + a_Index);

        if (this.State.GameGrid[a_Index].SetClear() == false)
            console.log("🤖: Whoops!");
        
        return true;
    }

    DoFlagAction(a_Index)
    {
        if (this.State.GameGrid[a_Index].IsFlagged)
            return false;

        console.log("🤖: Flagging " + a_Index);
        this.State.GameGrid[a_Index].ToggleFlag();

        return true;
    }

    UniqueArray(a)
    {
        var seen = {};
        var out = [];
        var len = a.length;
        var j = 0;
        for(var i = 0; i < len; i++) {
            var item = a[i];
            if(seen[item] !== 1) {
                seen[item] = 1;
                out[j++] = item;
            }
        }

        return out;
    }

    RunActions()
    {
        if (this.State.IsGameOver)
            return;
        
        console.log("🤖: Running actions");
        if (this.Clears.length == 0 && this.Flags.length == 0)
            this.CalculateStrategy();

        this.Flags = this.UniqueArray(this.Flags);
        this.Clears = this.UniqueArray(this.Clears);

        // Do action and remove it.
        if(this.Flags.length > 0)
        {
            while (this.Flags.length > 0)
            {
                // Get and remove first element
                var t_Flag = this.Flags[0];
                this.Flags.splice(0, 1);

                // Flag it, break if successful
                if (this.DoFlagAction(t_Flag))
                    break;
            }
        }
        else while (this.Clears.length > 0)
        {
            // Get and remove first element
            var t_ClearCell = this.Clears[0];
            this.Clears.splice(0, 1);

            // Clear it, break if successful
            if (this.DoClearAction(t_ClearCell))
                break;
        }
    }
};