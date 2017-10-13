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
        this.titleText = null;
    };
    GameApp.State_MainMenu.prototype = {
        preload: function () {
            // 标题文字
            this.titleText = this.game.make.text(this.game.world.centerX, 150, "The lost land\nMilitiamen of Volos", {
                font: 'bold 32pt Arial',
                fill: '#fc962f',
                align: 'center'
            });
            this.titleText.setShadow(3, 3, '#000000', 5);
            this.titleText.anchor.set(0.5);
        },
        create: function () {
            // 背景音乐
            if( (this.game.musicPlayer == null || this.game.musicPlayer.name !== "AUDIO_MenuMusic") && GameApp.bIsPlayMusic){
                if(this.game.musicPlayer != null ) {
                    this.game.musicPlayer.stop();
                }
                this.game.musicPlayer = this.game.add.audio("AUDIO_MenuMusic");
                this.game.musicPlayer.loop = true;
                this.game.musicPlayer.play();
            }
            // 游戏背景
            this.game.add.sprite(0, 0, 'MainMenu_Bg');
            this.game.add.existing(this.titleText);

            // 添加游戏按钮
            this.AddMenuOption('Start', function () {
                GameModel.func_Init();
                this.game.cutscene = 'open';        // 将使用新游戏的对白
                this.game.state.start("State_CutScreen");
            }, this.game.world.centerX, 260);

            this.AddMenuOption('Options', function ( noUse, thisParam ) {
                thisParam.game.state.start("State_Options");
            }, this.game.world.centerX, 320);

            this.AddMenuOption('Credits', function ( noUse, thisParam ) {
                thisParam.game.state.start("State_Credits");
            }, this.game.world.centerX, 380);

            // 检查是否有存档
            if (GameModel.func_SupportLocalStorage() && GameModel.func_IsHadLocalStorage()) {
                this.AddMenuOption('Load Game', function () {
                    this.cutscene = 'load';         // 将使用继续游戏的对白
                    this.state.start("State_CutScreen");
                }, this.game.world.centerX, 440);
            }

            // 添加动画
            // TODO：
            
            // 输出DEBUG信息
            var text = "FKGame v" + MACRO_FKGAME_VERSION,
                style = { font: "10px Arial", fill: "#ff0000", align: "center" },
                t = this.game.add.text(this.world.centerX * 2 - 10, this.world.centerY * 2, text, style);
            t.anchor.setTo(1.0, 1.0);
        }
    };

    // 注册新函数
    Phaser.Utils.mixinPrototype(GameApp.State_MainMenu.prototype, FKMixins);
}(GameApp));