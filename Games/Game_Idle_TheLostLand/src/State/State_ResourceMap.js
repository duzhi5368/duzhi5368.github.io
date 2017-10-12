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
    GameApp.State_ResourceMap = function(){

    };
    GameApp.State_ResourceMap.prototype = {
        preload: function () {
        },

        create: function () {
            var state = this;
            this.stage.disableVisibilityChange = true;
            this.game.add.sprite(0, 0, 'MainMenu_Bg');
            this.infoText = this.add.text(50, 30, 'Gold: ' + GameModel.func_GetUserMoney(), {
                font: '24px Arial',
                fill: '#005000',
                strokeThickness: 1
            });

            // 定时器(在该界面，逻辑该处理还是要处理)
            this.gameTimer = this.game.time.events.loop(1000, this.func_OnTimerTrigger, this);

            // 资源列表按钮区
            this.AddMenuOption('Ocean', function () {
                this.game.currentIndustry = 'sea';
                this.game.state.start("State_Industries")
            }, 200, 175);
            this.AddMenuOption('Forest', function () {
                this.game.currentIndustry = 'forest';
                this.game.state.start("State_Industries")
            }, 200, 225);
            this.AddMenuOption('Mountains', function () {
                this.game.currentIndustry = 'mountains';
                this.game.state.start("State_Industries")
            }, 200, 275);
            this.AddMenuOption('Prairie', function () {
                this.game.currentIndustry = 'prairie';
                this.game.state.start("State_Industries")
            }, 200, 325);
            this.AddMenuOption('Pasture', function () {
                this.game.currentIndustry = 'pasture';
                this.game.state.start("State_Industries")
            }, 200, 375);

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

            // 刷新本界面显示
            this.infoText.text = 'Gold: ' + GameModel.func_GetUserMoney();
        }
    };

    // 注册新函数
    Phaser.Utils.mixinPrototype(GameApp.State_ResourceMap.prototype, FKMixins);
}(GameApp));