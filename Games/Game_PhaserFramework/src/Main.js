//--------------------------------------------------------
var Phaser;
var MACRO_WINDOW_HEIGHT;
var MACRO_WINDOW_WIDTH;

//--------------------------------------------------------
(function (Phaser) {
    "use strict";
    //--------------------------------------------------------
    var game = new Phaser.Game(MACRO_WINDOW_WIDTH, MACRO_WINDOW_HEIGHT, Phaser.AUTO, 'FKGame');
    //--------------------------------------------------------
    game.state.add('State_Boot', GameApp.State_Boot);
    game.state.add('State_FlashLogo', GameApp.State_FlashLogo);
    game.state.add('State_Preload', GameApp.State_Preload);
    game.state.add('State_MainMenu', GameApp.State_MainMenu);
    game.state.add('State_DemoGame', GameApp.State_DemoGame);
    //--------------------------------------------------------
    game.state.start('State_Boot');
    //--------------------------------------------------------
}(Phaser));