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
    GameApp.State_Industries = function () {
    };
    GameApp.State_Industries.prototype = {
        preload: function(){
            this.locationName = this.game.currentIndustry;
        },

        create: function () {
            var state = this;
            this.stage.disableVisibilityChange = true;
            this.game.add.sprite(0, 0, 'MainMenu_Bg');
            this.playerGoldText = this.add.text(50, 30, 'Gold: ' + GameModel.func_GetUserMoney(), {
                font: '24px Arial',
                fill: '#005000',
                strokeThickness: 1
            });

            // 定时器(在该界面，逻辑该处理还是要处理)
            this.gameTimer = this.game.time.events.loop(1000, this.func_OnTimerTrigger, this);

            this.buildingsGroup = this.game.add.group();
            this.func_UpdateBuildings();

            // 文字
            this.buildingsGroupText = this.add.text(150, 400, '', {
                font: '24px Arial',
                fill: 'Black',
                strokeThickness: 0,
                wordWrap: true,
                wordWrapWidth: 300
            });

            this.AddMenuOption('Return', function () {
                this.game.state.start("State_ResourceMap")
            }, 350, 620);
        },

        // 刷新定时器
        func_OnTimerTrigger : function () {
            // 冒险者出行
            GameModel.func_GoAdventuring();
            // 冒险者回城
            GameModel.func_VisitTown();

            // 刷新建筑和金钱显示
            this.func_UpdateBuildings();
            this.playerGoldText.text = 'Gold: ' + GameModel.func_GetUserMoney();
        },

        // 刷新建筑
        func_UpdateBuildings: function () {
            this.buildingsGroup.removeAll();

            var buildingData = GameModel.func_GetLocationBuildings(this.locationName);
            var buildingTypes = GameModel.func_GetIndustries(this.locationName);

            for(var i = 0; i < buildingTypes.length; i++){
                for(var key in buildingData){
                    if(buildingData[key].industry === buildingTypes[i]){
                        var b = this.func_AddBuildings(key, buildingData[key], i);
                        this.buildingsGroup.addChild(b);
                    }
                }
            }
        },

        // 增加建筑
        func_AddBuildings: function (key, value, index) {
            var button = this.game.add.button(25 + index * 130, 50 + value.level * 100, value.graphic);
            button.cost = value.cost;
            button.name = key;
            button.isPurchased = value.purchased;
            button.required = value.needsArray.length < 1 ? 'nothing' : value.needsArray.join(', ');
            button.isAvailable = GameModel.func_IsBuildingPurchased(button.name);
            button.desc = value.desc;
            button.events.onInputOver.add(this.func_DescribeBuilding, this);

            // 已购买的建筑
            if(button.isPurchased){
                button.text = button.addChild(this.game.add.text(50, 50, "SOLD", { font: '16px Arial', fill: '#d90e0e' }));
            }

            // 判断金钱状况
            if(button.isAvailable && !button.isPurchased){
                if(!GameModel.func_IsHasAmount(button.cost)){
                    button.text = button.addChild(this.game.add.text(25, 50, "NEED MORE $", { font: '16px Arial', fill: '#d90e0e' }));
                }
                else {
                    button.events.onInputDown.add(function(){
                        this.func_BuyBuildings(button.name);
                    },this);
                }
            }

            if(!button.isAvailable){
                button.tint = "0x000000";
            }
            else{
                button.tint = "0xFFFFFF";
            }
            return button;
        },

        // 购买建筑
        func_BuyBuildings: function (buildingName) {
            GameModel.func_BuyBuildings(buildingName);
            this.func_UpdateBuildings(this.locationName);
            this.playerGoldText.text = 'Gold: ' + GameModel.func_GetUserMoney();
        },
        
        // 建筑描述
        func_DescribeBuilding: function (button) {
            this.buildingsGroupText.text = button.name + "\n Requires: " + button.requires + "\n"
                                        + button.desc + "\n Cost: " + new BigNumber(button.cost).toFormat();
        }
    };

    // 注册新函数
    Phaser.Utils.mixinPrototype(GameApp.State_Industries.prototype, FKMixins);
}(GameApp));