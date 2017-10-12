/**
 * Created by Frankie.W on 2017/3/22.
 */
//--------------------------------------------------------
var Phaser;
var GameApp;
var MACRO_DEBUG;
var MACRO_AUTO_RUN_STATE;
//--------------------------------------------------------
(function (GameApp) {
    "use strict";
    GameApp.State_Options = function () {
    };
    GameApp.State_Options.prototype = {
        init: function () {
            // 标题文字
            this.titleText = this.game.make.text(this.game.world.centerX, 150, "The lost land\nMilitiamen of Volos", {
                font: 'bold 36pt Arial',
                fill: '#fc962f',
                align: 'center'
            });
            this.titleText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
            this.titleText.anchor.set(0.5);
            this.optionCount = 1;
        },
        create: function () {
            this.game.add.sprite(0, 0, 'Parchment_Bg');
            this.game.add.existing(this.titleText);

             this.AddMenuOption(GameApp.bIsPlayMusic ? 'Mute Music' : 'Play Music', function (target, thisParam) {
                 GameApp.bIsPlayMusic = !GameApp.bIsPlayMusic;
                 target.text = GameApp.bIsPlayMusic ? 'Mute Music' : 'Play Music';
                 thisParam.game.musicPlayer.volume = GameApp.bIsPlayMusic ? 1 : 0;
             }, this.game.world.centerX, this.game.world.centerY * 4 / 5);
             this.AddMenuOption('←Back', function (noUse, thisParam) {
                 thisParam.game.state.start("State_MainMenu");
             }, this.game.world.centerX * 3 / 2, this.game.world.centerY * 9 / 5);
        }
    };

    // 注册新函数
    Phaser.Utils.mixinPrototype(GameApp.State_Options.prototype, FKMixins);
}(GameApp));