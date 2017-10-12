//--------------------------------------------------------
var Phaser;
var GameApp;
var MACRO_DEBUG;
var MACRO_AUTO_RUN_STATE;
//--------------------------------------------------------
(function (GameApp) {
    "use strict";
    GameApp.State_Preload = function () {
        // 本state变量放在这里
        this.allAssetLoadDone = false;
        this.timer = null;
    };
    GameApp.State_Preload.prototype = {
        preload: function () {
            // 创建sprite
            var preloadBarSprite = this.game.add.sprite(this.world.centerX, this.world.centerY * 3 / 2, 'preloaderBar');
            preloadBarSprite.anchor.setTo(0.5, 0.5);
            // 设置它为加载sprite，则可以自动从0到满宽度显示
			this.load.setPreloadSprite(preloadBarSprite);
            
            // 为下一个场景做好资源加载
            this.game.load.image('bg', 'asset/game/images/bg.jpg');
            this.game.load.image('playBtn', 'asset/game/images/play.png');
            
            // 全局默认资源
            this.game.load.image('defaultBtns', 'asset/default/images/defaultButton.png');
    
        },
        create: function () {
            // 输出DEBUG信息
            if (MACRO_DEBUG) {
                var text = "State:Preload",
                    style = { font: "10px Arial", fill: "#ff0000", align: "center" },
                    t = this.game.add.text(this.world.centerX * 2 - 10, this.world.centerY * 2, text, style);
                t.anchor.setTo(1.0, 1.0);
            }
    
            // 创建自定义定时器
            this.timer = this.game.time.create(false);
            // 1秒后触发
            this.timer.loop(1000, this.loadDone, this);
            // 启动定时器
            this.timer.start();
        },
        loadDone: function () {
            this.allAssetLoadDone = true;
            this.timer.stop();  // 注意关闭定时器
        },
        update: function () {
            if (this.allAssetLoadDone === true) {
                this.enterNextState();
            }
        },
        enterNextState: function () {
            if (MACRO_AUTO_RUN_STATE) {
                this.state.start('State_MainMenu');
            }
        }
    };
}(GameApp));