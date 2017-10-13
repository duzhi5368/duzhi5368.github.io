/**
 * Created by Frankie.W on 2017/3/25.
 */
//--------------------------------------------------------
var Phaser;
var GameApp;
var MACRO_DEBUG;
var MACRO_AUTO_RUN_STATE;
//--------------------------------------------------------
(function (GameApp) {
    "use strict";
    GameApp.State_Game = function () {
        this.advButtonsData = [
                {icon: 'swordIconA', name: "Add 1 Adventurer", multiplier: 1 }
            ,   {icon: 'swordIconB', name: "Add 10 Adventurers", multiplier: 10 }
            ,   {icon: 'swordIconC', name: "Add 100 Adventurers", multiplier: 100 }
        ];
    };
    GameApp.State_Game.prototype = {
        init: function () {
            // 失去焦点，游戏不暂停
            this.stage.disableVisibilityChange = true;
        },
        create: function () {
            var thisState = this;
            // 背景音乐
            if( (this.game.musicPlayer == null || this.game.musicPlayer.name !== "AUDIO_GameMusic") && GameApp.bIsPlayMusic){
                if(this.game.musicPlayer != null ) {
                    this.game.musicPlayer.stop();
                }
                this.game.musicPlayer = this.game.add.audio("AUDIO_GameMusic");
                this.game.musicPlayer.loop = true;
                this.game.musicPlayer.play();
            }

            // 背景
            this.game.add.sprite(0, 0, 'MainMenu_Bg');

            // 静音按钮
            this.muteButton = this.add.button(30, 65, 'SpeakerIcon');
            this.muteButton.onInputDown.add(this.func_ToggleMusic, this);

            // 用户金钱信息显示
            this.playerGoldText = this.add.text(25, 25, 'Gold: ' + GameModel.func_GetUserMoney(), {
                font: '24px Arial Black',
                fill: '#fff',
                strokeThickness: 4
            });
            // 用户冒险者信息显示
            this.playerAdvText = this.add.text(200, 25, 'Adventurers: ' + GameModel.m_AdventurerList.length + " / " + GameModel.m_nMaxAdventurers, {
                font: '24px Arial Black',
                fill: '#fff',
                strokeThickness: 4
            });

            // 购买冒险者按钮
            this.advButtons = this.game.add.group();
            var button;
            this.advButtonsData.forEach(function(buttonData, index) {
                var button = thisState.game.add.button(200, 70 + 50 * index, thisState.game.cache.getBitmapData('button'));
                button.icon = button.addChild(thisState.game.add.image(6, 6, buttonData.icon));
                button.text = button.addChild(thisState.game.add.text(42, 6, buttonData.name, { font: '16px Arial'}));
                button.multiplier = buttonData.multiplier;
                button.cost = GameModel.func_AdventurerCost(buttonData.multiplier);
                button.costText = button.addChild(thisState.game.add.text(42, 24, 'Cost: ' + GameModel.func_FormatNumToText(button.cost), {font: '16px Arial'}));
                button.events.onInputDown.add(thisState.func_AddAdventurers, thisState);
                if (!GameModel.func_IsHasAmount(button.cost) || GameModel.m_AdventurerList.length + button.multiplier >= GameModel.m_nMaxAdventurers) {
                    button.inputEnabled = false;
                    button.alpha = 0.1;
                } else {
                    button.inputEnabled = true;
                    button.alpha = 1;
                }
                thisState.advButtons.addChild(button);
            });

            // 开启游戏每日定时器
            this.gameTimer = this.game.time.events.loop(1000, this.func_OnTimerTrigger, this);

            // 创建升级选项按钮
            var navButtonsData = [
                { 'name': "Tavern", color: "Yellow", 'nav': "TownShop", 'shop': "tavern" }
                , { 'name': "Inn", color: "Yellow", 'nav': "TownShop", 'shop': "inn" }
                , { 'name': "Temple", color: "Yellow", 'nav': "TownShop", 'shop': "temple" }
                , { 'name': "Blacksmith", color: "Yellow", 'nav': "TownShop", 'shop': "blacksmith" }
                , { 'name': "Item Shop", color: "Yellow", 'nav': "TownShop", 'shop': "itemshop" }
                , { 'name': "Statistics", color: "Yellow", 'nav': "Statistics" }
                , { 'name': "Buy Industries", color: "Yellow", 'nav': "ResourceMap" }
                , { 'name': "Ultimate Items", color: "Yellow", 'nav': "UltimateItems" }
                , { 'name': "Achievements", color: "Yellow", 'nav': "Achievements" }
                , { 'name': "Help!", color: "Yellow", 'nav': "HelpScreen" }
            ];
            navButtonsData.forEach(function(buttonData, index) {
                var x = 25;
                var y = 130 + 50 * index;
                var buttonImage = 'Button' + "Black";//buttonData.color;
                button = thisState.game.add.button(x, y, buttonImage);
                button.height = 48;
                button.width = 160;
                button.text = button.addChild(
                    thisState.game.add.text(12, 6, buttonData.name,
                        {   font: '14px Arial White',
                            fill: buttonData.color,
                            strokeThickness: 1
                        })
                );
                // 选择商店 按钮按下事件
                button.events.onInputDown.add(function() {
                    if (buttonData.shop)    // 检查是否有商店行为
                        thisState.game.currentShop = buttonData.shop;
                    thisState.game.state.start('State_' + buttonData.nav);  // 切换State
                });
            });

            //  进度保存 按钮
            if(GameModel.func_SupportLocalStorage()){
                var saveBtn = this.add.button(340, 555, 'ButtonBlack');
                saveBtn.text = saveBtn.addChild(thisState.game.add.text(12, 6, 'Save', {font: '18px Arial', fill: 'White', strokeThickness: 1}));
                saveBtn.onInputDown.add(function(){
                    GameModel.func_SaveGameDataToLocalStorage();
                });
            }

            // 退出游戏 按钮
            {
                var quitBtn = this.add.button(340, 605, 'ButtonBlack');
                quitBtn.text = quitBtn.addChild(thisState.game.add.text(12, 6, 'Quit', {font: '18px Arial', fill: 'White', strokeThickness: 1}));
                quitBtn.onInputDown.add(function(){
                    thisState.game.state.start("State_MainMenu");
                });
            }
        },

        // 点击 音乐播放 按键
        func_ToggleMusic: function() {
            GameApp.bIsPlayMusic = !GameApp.bIsPlayMusic;
            this.game.musicPlayer.volume = GameApp.bIsPlayMusic ? 1 : 0;
        },

        // 点击 增加冒险者 按键
        func_AddAdventurers: function(button, statePointer) {
            GameModel.func_AddAdventurers(button.multiplier, button.cost);
            this.playerGoldText.text = 'Gold: ' + GameModel.m_nUserMoney;
            this.playerAdvText.text = 'Adventurers: ' + GameModel.m_AdventurerList.length+ " / " + GameModel.m_nMaxAdventurers;

            this.func_UpdateButtons(statePointer);
        },

        // 购买冒险者 消耗增加
        func_UpdateButtons: function(statePointer) {
            this.advButtons.forEach(function(button) {
                function func_getAdjustedCost() {
                    return button.cost;
                }
                button.cost = GameModel.func_AdventurerCost(button.multiplier);
                button.costText.text = 'Cost: ' + GameModel.func_FormatNumToText(func_getAdjustedCost());
                if (!GameModel.func_IsHasAmount(button.cost) || GameModel.m_AdventurerList.length + button.multiplier > GameModel.m_nMaxAdventurers) {
                    button.inputEnabled = false;
                    button.alpha = 0.1;
                } else {
                    button.inputEnabled = true;
                    button.alpha = 1;
                }
            });
        },

        // 游戏每日刷新定时器
        func_OnTimerTrigger : function () {
            // 冒险者出行
            GameModel.func_GoAdventuring();
            // 冒险者回城
            GameModel.func_VisitTown();

            // 更新金钱和冒险者人数
            this.playerGoldText.text = 'Gold: ' + GameModel.m_nUserMoney;
            this.playerAdvText.text = 'Adventurers: ' + GameModel.m_AdventurerList.length+ " / " + GameModel.m_nMaxAdventurers;

            this.func_UpdateButtons();

            // 检查玩家是否已破产
            if(GameModel.func_IsBankrupt()){
                console.log("玩家已破产.");
                this.game.cutscene = 'lose';
                this.game.state.start("State_CutSceen");
            }
        }
    };

    // 注册新函数
    Phaser.Utils.mixinPrototype(GameApp.State_Game.prototype, FKMixins);
}(GameApp));