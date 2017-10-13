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
            
            // 全局默认资源
            this.game.load.image('defaultBtns', 'asset/default/images/defaultButton.png');

            // 加载全局JS
            this.loadScripts();
            // 加载全局图片
            this.loadImages();
            // 加载全局字体
            this.loadFonts();
            // 加载全局音效
            this.loadBgm();
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
            this.timer.loop(1000, this.loadDone, this);
            this.timer.start();

            // 添加游戏状态
            this.registeGameState();
        },
        registeGameState : function () {
            this.game.state.add('State_MainMenu', GameApp.State_MainMenu);
            this.game.state.add('State_Options', GameApp.State_Options);
            this.game.state.add('State_Credits', GameApp.State_Credits);
            this.game.state.add('State_CutScreen', GameApp.State_CutScreen);
            this.game.state.add("State_Game", GameApp.State_Game);
            this.game.state.add("State_Statistics", GameApp.State_Statistics);
            this.game.state.add("State_ResourceMap", GameApp.State_ResourceMap);
            this.game.state.add("State_Industries", GameApp.State_Industries);
            // TODO:
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
                this.game.state.start('State_MainMenu');
            }
        },
        loadScripts : function () {
            this.game.load.script('FKStyle', 'src/Base/FKStyle.js');
            this.game.load.script('FKMixins', 'src/Base/FKMixins.js');

            this.game.load.script('bignumber', 'third/bignumber.min.js');
            this.game.load.script('WebFont',    'third/rsgui/webfontloader.js');

            this.game.load.script('MainMenu',    'src/State/State_MainMenu.js');
            this.game.load.script('Options',      'src/State/State_Options.js');
            this.game.load.script('Credits',      'src/State/State_Credits.js');
            this.game.load.script('Game',         'src/State/State_Game.js');
            this.game.load.script('Statistics',   'src/State/State_Statistics.js');
            this.game.load.script('ResourceMap',   'src/State/State_ResourceMap.js');
            this.game.load.script('Industries',     'src/State/State_Industries.js');
            // TODO:
            /*
            this.game.load.script('TownShop',        'src/State/State_TownShop.js');
            this.game.load.script('Statistics',      'src/State/State_Statistics.js');
            this.game.load.script('Instructions',    'src/State/State_Instructions.js');
            this.game.load.script('ResourceMap',     'src/State/State_ResourceMap.js');
            this.game.load.script('UltimateItems',   'src/State/State_UltimateItems.js');
            this.game.load.script('Achievements',    'src/State/State_Achievements.js');
            this.game.load.script('HelpScreen',      'src/State/State_HelpScreen.js');
            this.game.load.script('Industries',      'src/State/State_Industries.js');
            */
            this.game.load.script('CutScreen',       'src/State/State_CutScreen.js');

            this.game.load.script('GameModel',       'src/Core/GameModel.js');

            // 添加自定义插件
            this.game.plugin = this.game.plugins.add(Phaser.Plugin.FKBarchartPlugin);
        },
        loadImages : function () {
            this.game.load.image("MainMenu_Bg",             "asset/game/images/town.png");
            this.game.load.image("Parchment_Bg",            "asset/game/images/parchment.png");

            this.game.load.image('TextBoxBg',                "asset/game/images/npcInfo.png");

            this.game.load.image('MizakHead',                "asset/game/images/head/MizakHead.png");
            this.game.load.image('mizakLaugh',              'asset/game/images/head/mizakLaugh.png');
            this.game.load.image('lemelFrown',              'asset/game/images/head/lemelFrown.png');
            this.game.load.image('lemelOut',                'asset/game/images/head/lemelOut.png');
            this.game.load.image('lissetteAngry',           'asset/game/images/head/lissetteAngry.png');
            this.game.load.image('lissetteFrown',           'asset/game/images/head/lissetteFrown.png');
            this.game.load.image('clavoTalk',               'asset/game/images/head/clavoTalk.png');
            this.game.load.image('clavoFrown',              'asset/game/images/head/clavoFrown.png');

            this.game.load.image('WinBg',                     "asset/game/images/win.png");

            this.game.load.image("ButtonBlack",              "asset/game/images/UI/ButtonBlack.png");
            this.game.load.image('SpeakerIcon',              'asset/game/images/UI/speakerIcon.png');

            this.game.load.image('swordIconA',               'asset/game/images/UI/greenSword.png');
            this.game.load.image('swordIconB',               'asset/game/images/UI/yellowSword.png');
            this.game.load.image('swordIconC',               'asset/game/images/UI/redSword.png');

            this.game.load.image('bldgCamp',                    'asset/game/images/Buildings/Camp.png');
            this.game.load.image('bldgSawmill',                 'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgKiln',                    'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgOreMine',                 'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgAlumMine',               'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgSmelter',                 'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgSeperator',               'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgRoller',                  'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgChemist',                 'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgSheep',                   'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgCattle',                  'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgShearer',                 'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgSlaughterhouse',          'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgLoom',                    'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgSmokehouse',               'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgWheatFarm',               'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgHopsFarm',               'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgVineyard',               'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgMill',                    'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgBeerBrewery',             'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgWinepress',               'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgBakery',                  'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgBeerBottler',             'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgWinery',                  'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgDock',                    'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgSaltbeds',                'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgFishery',                 'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgSaltpans',                'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgBrinery',                 'asset/game/images/UI/redSword.png');
            this.game.load.image('bldgIodiner',                 'asset/game/images/UI/redSword.png');

            // 创建一个默认Button
            var buttonImage = this.game.add.bitmapData(500, 48);
            buttonImage.ctx.fillStyle = 'white';
            buttonImage.ctx.strokeStyle = '#35371c';
            buttonImage.ctx.lineWidth = 2;
            buttonImage.ctx.fillRect(0, 0, 225, 48);
            buttonImage.ctx.strokeRect(0, 0, 225, 48);
            this.game.cache.addBitmapData('button', buttonImage);
        },
        loadFonts : function () {

        },
        loadBgm : function () {
            this.game.load.audio('AUDIO_MenuMusic',          'asset/game/bgm/menuMusic.mp3');
            this.game.load.audio('AUDIO_ReasonEnding',       'asset/game/bgm/menuMusic.mp3');
            this.game.load.audio('AUDIO_NightCredits',       'asset/game/bgm/menuMusic.mp3');
            this.game.load.audio('AUDIO_DaylightsOpening',   'asset/game/bgm/menuMusic.mp3');
            this.game.load.audio('AUDIO_GameMusic',           'asset/game/bgm/menuMusic.mp3');
        },
    };
}(GameApp));