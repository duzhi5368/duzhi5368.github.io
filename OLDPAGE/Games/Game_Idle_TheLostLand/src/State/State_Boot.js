//--------------------------------------------------------
var Phaser;
var PIXI;
var RSGUI;
var GameApp;
var MACRO_MAX_WINDOW_WIDTH;
var MACRO_MAX_WINDOW_HEIGHT;
var MACRO_MIN_WINDOW_WIDTH;
var MACRO_MIN_WINDOW_HEIGHT;
var MACRO_WINDOW_WIDTH;
var MACRO_WINDOW_HEIGHT;
var MACRO_AUTO_RUN_STATE;
//--------------------------------------------------------
(function (GameApp) {
    "use strict";
    GameApp.State_Boot = function (game) {
        // 本state变量放在这里
    };
    
    GameApp.State_Boot.prototype = {
        //--------------------------------------------------------
        // 该状态第一个被执行的函数，用以加载游戏资源，注意该函数在执行时，不执行render和update，而是执行loadUpdate和loadRender
        preload: function () {
            // 设置物理库
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            // 设置触摸方式
            this.input.maxPointers = 1;
            // 设置UI库
            this.game.gui = new RSGUI(this.game);
            // 加载其他资源
            this.loadThirdPlugin();
            // 自适应屏幕分辨率
            this.autoScaleScreen();
            this.stage.disableVisibilityChange = true;
            
            // 为下一个场景进行资源加载
            this.game.load.image('gameFlashImage', 'asset/default/images/FreeKnight_Src.png');
            this.game.load.image('studioTextImage', 'asset/default/images/StudioText.png');
        },
        //--------------------------------------------------------
        // 加载第三方插件脚本
        loadThirdPlugin: function () {
            // 加载第三方插件脚本
            if (MACRO_DEBUG) {
                // 加载debug
                this.game.plugins.debug = this.game.add.plugin(Phaser.Plugin.Debug);
                // 加载inspector
                this.game.plugins.inspector = this.game.add.plugin(Phaser.Plugin.Inspector);
            }
            // 加载Juicy
            this.game.plugins.juicy = this.game.plugins.add(new Phaser.Plugin.Juicy(this));
            // 加载ColorHarmony
            this.game.plugins.colorHarmony = this.game.plugins.add(Phaser.Plugin.ColorHarmony);
        },
        //--------------------------------------------------------
        autoScaleScreen: function () {
            if (this.game.device.desktop) {
                this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.scale.minWidth = MACRO_MIN_WINDOW_WIDTH;
                this.scale.minHeight = MACRO_MIN_WINDOW_HEIGHT;
                this.scale.maxWidth = MACRO_MAX_WINDOW_WIDTH;
                this.scale.maxHeight = MACRO_MAX_WINDOW_HEIGHT;
                this.scale.pageAlignHorizontally = true;
                this.scale.pageAlignVertically = true;
                if (MACRO_DEBUG) {
                    this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
                }
            } else {
                this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.scale.minWidth = MACRO_WINDOW_WIDTH / 2;
                this.scale.minHeight = MACRO_WINDOW_HEIGHT / 2;
                this.scale.maxWidth = MACRO_WINDOW_WIDTH * 2;
                this.scale.maxHeight = MACRO_WINDOW_HEIGHT * 2;
                this.scale.pageAlignHorizontally = true;
                this.scale.pageAlignVertically = true;
                
                this.scale.forceOrientation(false, true);
                this.scale.hasResized.add(this.gameResized, this);
                this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
                this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
            }
        },
        //--------------------------------------------------------
        // 只有加载时有效，一般用以更新游戏进度条
        //loadUpdate : function () {},
        //--------------------------------------------------------
        // 强烈建议不要使用该函数
        // loadRender : function(){}
        //--------------------------------------------------------
        // preload之后自动调用该函数，若没有preload，则该函数为第一个调用。该函数进行大部分创建工作
        create: function () {
            // 设置屏幕背景色
            if (MACRO_DEBUG) {
                this.game.stage.setBackgroundColor('#0000ff');
            } else {
                this.game.stage.setBackgroundColor('#cccccc');
            }

            // 版本信息
            var text = "Phaser v" + Phaser.VERSION  + "  PIXI " + PIXI.VERSION,
                style = { font: "10px Arial", fill: "#ff0000", align: "center" },
                t = this.game.add.text(this.world.centerX * 2 - 10, this.world.centerY * 2, text, style);
            t.anchor.setTo(1.0, 1.0);
            if (MACRO_DEBUG) {
                // 创建自定义定时器
                var timer = this.game.time.create(false);
                timer.loop(2000, this.enterNextState, this);
                timer.start();
            } else {
                this.enterNextState();
            }
        },
        //--------------------------------------------------------
        enterNextState: function () {
             // 更换到下一个场景
            if (MACRO_AUTO_RUN_STATE) {
                this.game.state.start('State_FlashLogo');
            }
        },
        // 当游戏窗口大小被调整后调用的函数
        gameResized: function (width, height) {
            
        },
        //--------------------------------------------------------
        enterIncorrectOrientation: function () {
            GameApp.orientated = false;
            document.getElementById('FKOrientation').style.display = 'block';
        },
        //--------------------------------------------------------
        leaveIncorrectOrientation: function () {
            GameApp.orientated = true;
            document.getElementById('FKOrientation').style.display = 'none';
        },
        //--------------------------------------------------------
        // 每秒60帧，逻辑帧更新函数。通常用以处理input监听，碰撞检测等
        //update : function(){}
        //--------------------------------------------------------
        // 该函数在WebGL/Canvas渲染之后调用，可以抓取DEBUG信息
        render : function () {
            if (MACRO_DEBUG) {
                this.showSystemInfo();
            }
        },
        //--------------------------------------------------------
        // 显示系统信息
        showSystemInfo: function () {
            this.game.debug.text('[ FK system info ]', 8, 32, "#00ff00");
            this.game.debug.text('浏览器信息: ' + navigator.userAgent, 8, 96, "#00ff00");
            this.game.debug.text('是否是iOS系统: ' + this.game.device.iOS, 8, 128, "#00ff00");
            this.game.debug.text('是否是Mobile Safari浏览器: ' + this.game.device.mobileSafari, 8, 160, "#00ff00");
            this.game.debug.text('是否是WebApp: ' + this.game.device.webApp, 8, 192, "#00ff00");
            this.game.debug.text('外部浏览器: ' + navigator.standlone, 8, 224, "#00ff00");
            this.game.debug.text('设备iOS版本: ' + this.game.device.iOSVersion, 8, 256, "#00ff00");
            this.game.debug.text("是否开启抗锯齿: " + this.game.antialias, 8, 288, "#00ff00");
        }
        //--------------------------------------------------------
        // 当游戏窗口大小被调整后调用的函数
        //resize : function(){}
        //--------------------------------------------------------
        // 当本state被关闭之前会调用
        //shutdown : function(){}
        //--------------------------------------------------------
    };
}(GameApp));