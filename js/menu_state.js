var Minesweeper = Minesweeper || {};

Minesweeper.MenuState = class MenuState extends Phaser.State
{
    constructor() 
    {
        super();

        this.m_Title = { Size: 65, Font: "Arial" }; 
    }

    preload()
    {
        console.log("Preload menu");

        // plugins
        this.UI = this.game.plugins.add(Phaser.Plugin.SlickUI);
        this.UI.load('assets/kenney.json');
    }

    create()
    {
        this.m_Title.Object = this.add.text(200, 0, "Minesweeper", { font: this.m_Title.Size + "px " + this.m_Title.Font, fill: "#FFF", align: "center" });
        
        // Create a UI element with 8 pixels from each side. Since the 3rd and 4th arguemnts 
        this.UI.add(this.Panel = new SlickUI.Element.Panel(8, this.m_Title.Size, this.game.width - 16, this.game.height - this.m_Title.Size - 8));
        
        this.Panel.add(this.Slider = new SlickUI.Element.Slider(16, 100, panel.width - 32));
        this.Panel.add(this.Button = new SlickUI.Element.Button(0,0, 140, 80));
        this.Button.events.onInputUp.add(this.GoIngame.bind(this));
        this.Button.add(new SlickUI.Element.Text(0,0, "Start Game")).center();
    }

    update()
    {
    }

    GoIngame()
    {
        console.log("Going ingame");
    }
}
