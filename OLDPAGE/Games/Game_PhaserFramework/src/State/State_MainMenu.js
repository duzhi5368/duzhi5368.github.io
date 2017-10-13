//--------------------------------------------------------
var GameApp;
var MACRO_DEBUG;
var MACRO_FKGAME_VERSION;
//--------------------------------------------------------
(function (GameApp) {
    "use strict";
    GameApp.State_MainMenu = function () {
        // 本state变量放在这里
        this.bgMusic = null;
    };
    GameApp.State_MainMenu.prototype = {
        preload: function () {
        },
        create: function () {
            // 游戏背景
            this.add.sprite(0, 0, 'bg');
            
            // 进入游戏按钮
            var playBtn = this.game.add.sprite(this.world.centerX, this.world.centerY * 3 / 2, 'playBtn');
            playBtn.anchor.setTo(0.5, 0.5);
		    playBtn.inputEnabled = true;
		    playBtn.events.onInputDown.add(this.onClickPlayBtn, this);
            
            // 输出DEBUG信息
            var text = "FKGame v" + MACRO_FKGAME_VERSION,
                style = { font: "10px Arial", fill: "#ff0000", align: "center" },
                t = this.game.add.text(this.world.centerX * 2 - 10, this.world.centerY * 2, text, style);
            t.anchor.setTo(1.0, 1.0);
        },
        onClickPlayBtn: function () {
            this.state.start('State_DemoGame');
        }
    };
}(GameApp));