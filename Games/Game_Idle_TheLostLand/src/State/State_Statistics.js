/**
 * Created by Frankie.W on 2017/5/10.
 */
//--------------------------------------------------------
var Phaser;
var GameApp;
var MACRO_DEBUG;
var MACRO_AUTO_RUN_STATE;
//--------------------------------------------------------
(function (GameApp) {
    "use strict";
    GameApp.State_Statistics = function () {
    };
    GameApp.State_Statistics.prototype = {
        preload : function () {
            // 获取当前游戏数据概况
            this.info = GameModel.func_GetOverview();
        },

        create : function () {
            var state = this;
            this.stage.disableVisibilityChange = true;
            this.game.add.sprite(0, 0, 'MainMenu_Bg');
            this.infoText = this.add.text(50, 30, this.info, {
                font: '24px Arial',
                fill: '#005000',
                strokeThickness: 1
            });

            // 收入流量表
            this.game.plugin.createChart(this.game, GameModel.m_MoneyRecordArray, 50, 370, 350, 200, "Daily income");

            // 定时器(在该界面，逻辑该处理还是要处理)
            this.gameTimer = this.game.time.events.loop(1000, this.func_OnTimerTrigger, this);

            // 返回按钮
            this.AddMenuOption("Return", function(){
                this.game.state.start("State_Game");
            }, 350, 620);
        },

        // 刷新定时器
        func_OnTimerTrigger : function () {
            // 冒险者出行
            GameModel.func_GoAdventuring();
            // 冒险者回城
            GameModel.func_VisitTown();

            // 更新本界面显示
            this.infoText.text = GameModel.func_GetOverview();
            this.game.plugin.updateChart(GameModel.m_MoneyRecordArray);
        }
    };

    // 注册新函数
    Phaser.Utils.mixinPrototype(GameApp.State_Statistics.prototype, FKMixins);
}(GameApp));