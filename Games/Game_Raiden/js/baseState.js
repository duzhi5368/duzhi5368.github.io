////////////////////////////////////////////////////////
// boot

(function () {
	'use strict';

	function Boot() {}

	Boot.prototype = {

		// 缩放画布
		AutoSuitableSize: function(){
			// set scaleMode and align
			var deviceW=document.documentElement.clientWidth - 2;
			var deviceH=document.documentElement.clientHeight - 2;
			console.log( "浏览器可用大小：", deviceW, deviceH );
			var origW=this.game.CONFIG.GAME_WIDTH;
			var origH=this.game.CONFIG.GAME_HEIGHT;
			console.log( "期望大小：", origW, origH );
			this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
			this.game.scale.compatibility.forceMinimumDocumentHeight = true; // seems to do nothing
			this.game.scale.pageAlignHorizontally = true; // seems like I would not even need this
			this.game.scale.pageAlignVeritcally = true; // seems to do nothing

			// 计算缩放比
			var scaleFactorW = deviceW / origW;
			var scaleFactorH = deviceH / origH;
			var scaleValue;
			if( scaleFactorH >= scaleFactorW ) {
				scaleValue = scaleFactorW;
			}else {
				scaleValue = scaleFactorH;
			}
			// 这里像素特殊
			scaleValue /= this.game.CONFIG.PIXEL_RATIO;
			console.log("最终缩放比：", scaleValue );
			this.game.scale.setUserScale(scaleValue, scaleValue);
			this.game.scale.refresh();
			return;
		},

		
		preload: function () {
			this.load.image('preloader', 'assets/preloader.gif');
			this.AutoSuitableSize();
		},

		create: function () {
			this.game.input.maxPointers = 1;
			this.game.state.start('preloader');
		}
	};

	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Boot = Boot;

}());
////////////////////////////////////////////////////////
// preloader

(function() {
  'use strict';

  function Preloader() {
    this.asset = null;
    this.ready = false;
  }

  Preloader.prototype = {

    preload: function () {
      // 显示Loading条
      this.asset = this.add.sprite(320, 240, 'preloader');
      this.asset.anchor.setTo(0.5, 0.5);
	  // 设置Load回调和显示条
      this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
      this.load.setPreloadSprite(this.asset);

	  // 图片资源
      this.load.image('tileset_1', 'assets/tileset_1.png');
      this.load.image('tileset_1_debug', 'assets/tileset_1_debug.png');

      this.load.spritesheet('clouds', 'assets/clouds.png', 96, 168);

      this.load.spritesheet('player_1', 'assets/player_ship_1.png', 24, 28);
      this.load.spritesheet('player_2', 'assets/player_ship_2.png', 24, 28);
      this.load.spritesheet('player_3', 'assets/player_ship_3.png', 24, 28);
      this.load.spritesheet('player_4', 'assets/player_ship_4.png', 24, 28);

      this.load.spritesheet('player_bullet', 'assets/player_bullets.png', 16, 16);
      this.load.image('mob_bullet_1', 'assets/mob_bullet_1.png');
      this.load.image('mob_bullet_2', 'assets/mob_bullet_2.png');
      this.load.spritesheet('explosion_1', 'assets/explosion_1.png', 32, 32);

      this.load.spritesheet('mob_plane', 'assets/mob_planes.png', 32, 32);
      this.load.spritesheet('mob_vessel_1', 'assets/mob_vessel_1.png', 37, 28);
      this.load.spritesheet('mob_flagship_1', 'assets/mob_flagship_1.png', 93, 80);
      this.load.spritesheet('mob_turret_1', 'assets/mob_turret_1.png', 24, 28);

      this.load.spritesheet('bonus_cube', 'assets/cubes.png', 24, 24);
      this.load.spritesheet('bonus_coin', 'assets/coins.png', 12, 12);

	  // 音频资源
      this.load.audio('shoot_player_1', 'assets/audio/shoot_player_1.wav');
      this.load.audio('shoot_player_2', 'assets/audio/shoot_player_2.wav');
      this.load.audio('shoot_player_3', 'assets/audio/shoot_player_3.wav');
      this.load.audio('shoot_player_4', 'assets/audio/shoot_player_4.wav');
      this.load.audio('shoot_player_5', 'assets/audio/shoot_player_5.wav');

      this.load.audio('explosion_1', 'assets/audio/explosion_1.wav');
      this.load.audio('explosion_2', 'assets/audio/explosion_2.wav');
      this.load.audio('explosion_3', 'assets/audio/explosion_3.wav');
      this.load.audio('explosion_4', 'assets/audio/explosion_4.wav');

      this.load.audio('hurt_1', 'assets/audio/hurt_1.wav');
      this.load.audio('collect_1', 'assets/audio/collect_1.wav');
    },

    create: function () {
      this.asset.cropEnabled = false;
    },

    update: function () {
      if (!!this.ready) {
        this.game.state.start('menu');
      }
    },

    onLoadComplete: function () {
      this.ready = true;
    }
  };

  window['FKFramework'] = window['FKFramework'] || {};
  window['FKFramework'].Preloader = Preloader;

}());
////////////////////////////////////////////////////////
// menu

(function() {
	'use strict';

	function Menu() {

		this.titleTxt = null;
		this.startTxt = null;
	}

	Menu.prototype = {

		create: function () {
			var x = this.game.width / 2;
			var y = this.game.height / 2;
			// 标题
			var titleStyle = { font: "72px Arial", align: "center" };
			this.titleTxt = this.game.add.text( x, y - this.game.height / 5,"FK 雷电",titleStyle);
			this.titleTxt.anchor.setTo(0.5, 0.5);
			this.titleTxt.fontWeight = 'bold';
			// 添加渐变色
			var grd = this.titleTxt.context.createLinearGradient(0, 0, 0, this.titleTxt.height);
			grd.addColorStop(0, '#8ED6FF');
			grd.addColorStop(1, '#004CB3');
			this.titleTxt.fill = grd;

			// 操作
			var infoStyle = { font: "24px Arial", fill: "#ffffff", align: "center" };
			y = y + this.titleTxt.height;
			this.controlTxt = this.game.add.text(x, y, '_______________\nPC端 使用WSAD键控制方向\n手机端 使用虚拟遥杆控制方向\n_______________', infoStyle);
			this.controlTxt.anchor.setTo(0.5, 0.5);

			var startStyle = { font: "36px Arial", fill: "#ffffff", align: "center" };
			y = this.game.height * 4 / 5;
			this.startTxt = this.game.add.text(x, y, '点击屏幕开始游戏', startStyle);
			this.startTxt.anchor.setTo(0.5, 0.5);
			this.startTxt.alpha = 0.05;

			this.input.onDown.add(this.onDown, this);
		},

		update: function () {
			if( this.startTxt.alpha <= 0.1 )
			{
				this.game.add.tween(this.startTxt).to( { alpha: 0.95 }, 1000, "Linear", true);
			}
			else if( this.startTxt.alpha >= 0.9 )
			{
				this.game.add.tween(this.startTxt).to( { alpha: 0.05 }, 1000, "Linear", true);
			}
		},

		onDown: function () {
			this.game.state.start('game');
		}
	};

	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Menu = Menu;

}());