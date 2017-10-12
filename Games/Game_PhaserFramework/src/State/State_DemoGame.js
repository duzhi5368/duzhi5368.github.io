//--------------------------------------------------------
var GameApp;
var MACRO_DEBUG;
//--------------------------------------------------------
(function (GameApp) {
    "use strict";
    GameApp.State_DemoGame = function () {
        // 本state变量放在这里

    };
    GameApp.State_DemoGame.prototype = {
        preload: function () {

        },
        create: function () {
            // 创建测试Btns
            this.createDefaultBtns();
            // 输出DEBUG信息
            if (MACRO_DEBUG) {
                var text = "State:DemoGame",
                    style = { font: "10px Arial", fill: "#ff0000", align: "center" },
                    t = this.game.add.text(this.world.centerX * 2 - 10, this.world.centerY * 2, text, style);
                t.anchor.setTo(1.0, 1.0);
            }
        },
        createDefaultBtns: function () {
            var defaultBtnWidth = 80,
                defaultBtnHeight = 20,
                col = 1,
                row = 1,
                style = { font: "10px Arial", fill: "#ff44dd", align: "center" },
                TestJuiceBtn = this.game.add.button(16 + (defaultBtnWidth + 8) * col / 2, 16 + defaultBtnHeight * row, 'defaultBtns', function () {
                    this.state.start('State_TestJuice');
                }, this).anchor.setTo(0.5, 0.5),
                TestJuiceText = this.game.add.text(16 + (defaultBtnWidth + 8) * col / 2, 16 + defaultBtnHeight * row, '测试效果', style).anchor.setTo(0.5, 0.4);
            col += 2;
        }
    };
}(GameApp));