/**
 * Created by Frankie.W on 2017/3/24.
 */
//--------------------------------------------------------
var Phaser;
var GameApp;
var MACRO_DEBUG;
var MACRO_AUTO_RUN_STATE;
//--------------------------------------------------------
(function (GameApp) {
    "use strict";
    GameApp.State_Credits= function () {
    };
    GameApp.State_Credits.prototype = {
        init: function () {
            this.optionCount = 1;
            this.creditCount = 0;
        },
        addCredit: function(task, author) {
            var authorStyle = { font: '30pt Arial', fill: 'white', align: 'center', stroke: 'rgba(0,0,0,0)', strokeThickness: 4};
            var taskStyle = { font: '20pt Arial', fill: 'white', align: 'center', stroke: 'rgba(0,0,0,0)', strokeThickness: 4};
            var authorText = this.game.add.text(this.game.world.centerX, 900, author, authorStyle);
            var taskText = this.game.add.text(this.game.world.centerX, 950, task, taskStyle);
            authorText.anchor.setTo(0.5);
            authorText.stroke = "rgb(0, 0, 0)";
            authorText.strokeThickness = 4;
            taskText.anchor.setTo(0.5);
            taskText.stroke = "rgb(0, 0, 0";
            taskText.strokeThickness = 4;
            this.game.add.tween(authorText).to( { y: -250 }, 20000, Phaser.Easing.Cubic.Out, true, this.creditCount * 10000);
            this.game.add.tween(taskText).to( { y: -200 }, 20000, Phaser.Easing.Cubic.Out, true, this.creditCount * 10000);
            this.creditCount ++;
        },

        create: function () {
            // 失去焦点，游戏不暂停
            this.stage.disableVisibilityChange = true;

            // 背景音乐
            if( (this.game.musicPlayer == null || this.game.musicPlayer.name !== "AUDIO_NightCredits") && GameApp.bIsPlayMusic){
                if(this.game.musicPlayer != null ) {
                    this.game.musicPlayer.stop();
                }
                this.game.musicPlayer = this.game.add.audio("AUDIO_NightCredits");
                this.game.musicPlayer.loop = true;
                this.game.musicPlayer.play();
            }

            // 背景图片
            var bg = this.game.add.sprite(0, 0, 'Parchment_Bg');

            // 成员列表
            this.addCredit('FreeKnight','Music');
            this.addCredit('FreeKnight\nAlisa', 'Character Design');
            this.addCredit('FreeKnight', 'Backgrounds');
            this.addCredit('FreeKnight\nAlisa', 'Building Art');
            this.addCredit('FreeKnight', 'Developer');
            this.addCredit('Phaser.io', 'Powered By');
            this.addCredit('for playing', 'Thank you');

            // 返回按钮
            this.AddMenuOption('←Back', function (noUse, thisParam) {
                thisParam.game.state.start("State_MainMenu");
            }, this.game.world.centerX * 3 / 2, this.game.world.centerY * 9 / 5);

            // 播放动画
            this.game.add.tween(bg).to({alpha: 0}, 20000, Phaser.Easing.Cubic.Out, true, 40000);
        }
    };

    // 注册新函数
    Phaser.Utils.mixinPrototype(GameApp.State_Credits.prototype, FKMixins);
}(GameApp));