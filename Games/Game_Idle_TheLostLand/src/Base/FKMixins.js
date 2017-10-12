/**
 * Created by Frankie.W on 2017/3/19.
 */
var FKMixins = {
    AddMenuOption: function(text, callback, xIn, yIn) {
        //rewrote the menuoption factory to make more robust
        var x = xIn;
        var y = yIn;
        var txt = this.game.add.text(x, y, text, style.navitem.base);
        txt.anchor.setTo(0.5, 0.5);

        txt.inputEnabled = true;
        txt.events.onInputUp.add(callback, this, 0, this.game);
        txt.events.onInputOver.add(function (target) {
            target.setStyle(style.navitem.hover);
            target.fill = "rgb(239, 16, 16)";
            target.stroke = "Black";
            txt.useHandCursor = true;
        });
        txt.events.onInputOut.add(function (target) {
            target.setStyle(style.navitem.base);
            target.stroke = "Black";
            txt.useHandCursor = false;
        });

    }
};