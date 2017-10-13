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
    GameApp.State_CutScreen = function () {
    };
    GameApp.State_CutScreen.prototype = {
        init: function () {

        },
        create: function () {
            // 失去焦点，游戏不暂停
            this.stage.disableVisibilityChange = true;

            // 背景
            var bg = this.game.add.sprite(0, 0, 'MainMenu_Bg');
            // 中断音乐
            if(this.game.musicPlayer == null && GameApp.bIsPlayMusic) {
                if (this.game.musicPlayer != null) {
                    this.game.musicPlayer.stop();
                }
            }

            // 添加文字
            this.textBox = this.game.add.image(18, 50, 'TextBoxBg');
            this.interestBox = this.game.add.text(100, 200, '', {
                font: '24px Arial',
                fill: '#000000'
            });

            this.dialogueArray = GameModel[this.game.cutscene + 'Dialogue'];
            this.dialogueLength = this.dialogueArray.length;
            this.index = 0;
            this.func_UpdateTextBox();

            // 若是读取进度，则需要更新一些离线数值信息
            if (this.game.cutscene == 'load') {
                this.interestBox.text = "Calculating...";
                // 读取数据进度
                if (GameModel.func_LoadGame()) {
                    this.func_AutomateLoadInfo();
                } else {
                    this.interestBox.text = "Nothing!";
                }
            }

            // 胜利图片
            this.winGraphic = this.game.add.image(10, 75, 'WinBg');
            this.winGraphic.alpha = 0.0;

            // 如果胜利则播放胜利动画
            if (this.game.cutscene == 'win') {
                this.func_RunAutomatedScene();
                return;
            }

            // 非win,其他情况下播放音乐
            if( (this.game.musicPlayer == null || this.game.musicPlayer.name !== "AUDIO_DaylightsOpening") && GameApp.bIsPlayMusic){
                this.game.musicPlayer.stop();
                this.game.musicPlayer = this.game.add.audio('AUDIO_DaylightsOpening');
                this.game.musicPlayer.loop = true;
                this.game.musicPlayer.play();
            }

            // 非win, 创建前后一步按钮
            this.previousButton = this.add.button(60, 372, 'ButtonBlack', this.func_OnPreviousTextBtn, this);
            this.previousButton.anchor.setTo(0.5, 0.5);
            this.previousButton.text = this.previousButton.addChild(this.game.add.text(-32, -8, "Previous", {font: '16px Arial', fill: 'White'}));

            this.nextButton = this.add.button(418, 372, 'ButtonBlack', this.func_OnNextTextBtn, this);
            this.nextButton.anchor.setTo(0.5, 0.5);
            this.nextButton.text = this.nextButton.addChild(this.game.add.text(-18, -8, "Next", {font: '16px Arial', fill: 'White'}));

            // 若是加载模式，则不显示前后一步按钮
            if (this.game.cutscene == 'load') {
                this.previousButton.inputEnabled = false;
                this.nextButton.inputEnabled = false;
                this.previousButton.alpha = 0;
                this.nextButton.alpha = 0;
            } else {
                this.func_CheckButtons();
            }
        },

        func_OnPreviousTextBtn : function() {
            this.index == 0? 0: this.index--;
            this.func_UpdateTextBox();
            this.func_CheckButtons();
        },

        func_OnNextTextBtn : function() {
            this.index++;
            if (this.index >= this.dialogueLength) {
                if (this.game.cutscene == 'lose') {
                    this.game.state.start("State_MainMenu");    // 输了，返回主界面
                } else {
                    this.game.state.start("State_Game");        // 对话全部结束，进入游戏界面
                }
            } else {
                this.func_UpdateTextBox();
            }
            this.func_CheckButtons();
        },
        
        func_UpdateTextBox : function () {
            this.textBox.removeChildren();
            // 头像
            var headGraphic = this.game.add.image(370, 217, this.dialogueArray[this.index].graphic);
            headGraphic.anchor.setTo(0.5, 0.5);
            this.textBox.addChild(headGraphic);
            // 文字
            this.textBox.addChild(this.game.add.text(50, 50, this.dialogueArray[this.index].text, {
                font: '18px Arial',
                fill: '#000000',
                wordWrap: true,
                wordWrapWidth: 350
            }));
            // 说话者
            var speakerNameText = this.game.add.text(130, 252, this.dialogueArray[this.index].speaker, {
                font: '36px Arial',
                fill: '#000000'
            });
            speakerNameText.anchor.setTo(0.5, 0.5);
            this.textBox.addChild(speakerNameText);
        },

        func_CheckButtons : function () {
            if (this.index == 0) {
                this.previousButton.inputEnabled = false;
                this.previousButton.alpha = 0.1;
            } else {
                this.previousButton.inputEnabled = true;
                this.previousButton.alpha = 1;
            }
        },

        func_AutomateLoadInfo : function () {
            this.game.time.events.add(250, this.func_StartLoadLoop, this);
        },

        func_StartLoadLoop : function() {
            GameModel.func_SimulateIdleTime();   // 模拟计算
            this.game.time.events.loop(100, this.func_UpdateLoadText, this);  // 100毫秒更新一次
        },

        func_UpdateLoadText : function(){
            if (GameModel.func_IsIdleTimeCalculated()) {
                this.interestBox.text = GameModel.func_FormatBigNumToText(GameModel.m_nIdleMoneyMade);
                this.nextButton.inputEnabled = true;
                this.nextButton.alpha = 1;
            }
        },

        func_RunAutomatedScene : function () {
            if( (this.game.musicPlayer == null || this.game.musicPlayer.name !== "AUDIO_ReasonEnding") && GameApp.bIsPlayMusic){
                this.game.musicPlayer.stop();
                this.game.musicPlayer = this.game.add.audio('AUDIO_ReasonEnding');
                this.game.musicPlayer.play();
            }

            this.game.time.events.loop(7000, this.func_UpdateAuto, this);   // 每7秒更新一次对话框
            this.game.time.events.add(25000, this.func_RevealPicture, this); // 播放结束旋转动画
            this.game.time.events.add(51000, this.func_EndGame, this);       // 游戏结束，返回主菜单
        },

        func_UpdateAuto: function() {
            if (this.index < this.dialogueLength - 1) {
                this.index++;
                this.func_UpdateTextBox();
            }
        },

        func_RevealPicture: function() {
            this.game.add.tween(this.winGraphic).to( { alpha: 1 }, 12500, Phaser.Easing.Linear.None, true);
            this.game.add.tween(this.winGraphic).from( { angle: -180 }, 12500, Phaser.Easing.Linear.None, true);
            this.game.add.tween(this.winGraphic.scale).from( { x: 0.1, y: 0.1 }, 12500, Phaser.Easing.Linear.None, true);
        },

        func_EndGame: function() {
            this.game.state.start("State_MainMenu");
        }
    };

    // 注册新函数
    Phaser.Utils.mixinPrototype(GameApp.State_CutScreen.prototype, FKMixins);
}(GameApp));