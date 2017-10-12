//--------------------------------------------------------
var Phaser;
var GameApp;
var MACRO_DEBUG;
var MACRO_AUTO_RUN_STATE;
//--------------------------------------------------------
(function (GameApp) {
    "use strict";
    GameApp.State_FlashLogo = function () {
        // 本state变量放在这里
    };
    GameApp.State_FlashLogo.prototype = {
        preload: function () {
            // 为下一场景做好准备
            this.game.load.image('preloaderBar', 'asset/default/images/preloadBar.png');
        },
        create: function () {          
            // 更变背景色
            this.game.stage.setBackgroundColor('#cccccc');
            // 创建Flash效果
            this.gameFlashSprite = this.game.add.sprite(this.world.centerX, this.world.centerY, 'gameFlashImage');
            this.gameFlashSprite.scale.setTo(0.5, 0.5);
            this.gameFlashSprite.anchor.setTo(0.6, 0.65);
            this.gameFlashSprite.alpha = 0;
            
            this.studioTextSprite = this.game.add.sprite(this.world.centerX, this.world.centerY * 3, 'studioTextImage');
            this.studioTextSprite.anchor.setTo(0.5, 0.5);
            this.tween = this.game.add.tween(this.studioTextSprite);
            // 延迟1秒后执行移动动作
            this.tween.to({ y: this.world.centerY + 144 }, Phaser.Timer.SECOND, 'Linear', true, 0);
            // 启动过渡
            this.tween.start();
            // 输出DEBUG信息
            if (MACRO_DEBUG) {
                var text = "State:FlashLogo",
                    style = { font: "10px Arial", fill: "#ff0000", align: "center" },
                    t = this.game.add.text(this.world.centerX * 2 - 10, this.world.centerY * 2, text, style);
                t.anchor.setTo(1.0, 1.0);
            }
            
            // 更新动画定时器
            this.game.add.tween(this.gameFlashSprite).to( { alpha: 1 }, Phaser.Timer.SECOND, Phaser.Easing.Linear.None, true);
            this.game.time.events.add(Phaser.Timer.SECOND + 200, this.actionDone, this);
        },
        actionDone: function () {
            this.gameFlashSprite.alpha = 1;
            // 震屏
            this.game.plugins.juicy.shake(20, 30);
            // 等待一会儿，就切屏
            this.game.time.events.add(Phaser.Timer.SECOND, this.enterNextState, this);
        },
        enterNextState: function () {
            if (MACRO_AUTO_RUN_STATE) {
                this.state.start('State_Preload');
            }
        }
    };
}(GameApp));