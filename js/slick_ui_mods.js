Phaser.Plugin.SlickUI.prototype.removeAll         =
SlickUI.Element.Button.prototype.removeAll        =
SlickUI.Element.Checkbox.prototype.removeAll      =
SlickUI.Element.DisplayObject.prototype.removeAll =
SlickUI.Element.Panel.prototype.removeAll         =
SlickUI.Element.Slider.prototype.removeAll        =
SlickUI.Element.Text.prototype.removeAll          =
SlickUI.Element.TextField.prototype.removeAll     =
function(destroy, silent, destroyTexture) {
  this.container.displayGroup.removeAll(destroy, silent, destroyTexture);
};