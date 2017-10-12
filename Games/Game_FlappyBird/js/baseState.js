////////////////////////////////////////////////////////
// boot
(function(){
	function Boot() {}
		
	Boot.prototype = {
		// 缩放画布
		AutoSuitableSize: function(){
			// set scaleMode and align
			var deviceW=document.documentElement.clientWidth - 2;
			var deviceH=document.documentElement.clientHeight - 2;
			console.log( "浏览器可用大小：", deviceW, deviceH );
			var origW=CONFIG.GAME_WIDTH;
			var origH=CONFIG.GAME_HEIGHT;
			console.log( "期望大小：", origW, origH );
			this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
			this.game.scale.compatibility.forceMinimumDocumentHeight = true; // seems to do nothing
			this.game.scale.pageAlignHorizontally = true; // seems like I would not even need this
			this.game.scale.pageAlignVeritcally = true; // seems to do nothing
		
			// 计算缩放率
			var scaleFactorW = deviceW / origW;
			var scaleFactorH = deviceH / origH;
			var scaleValue;
			if( scaleFactorH >= scaleFactorW ) {
				scaleValue = scaleFactorW;
			}else{
				scaleValue = scaleFactorH;
			}
			console.log("最终缩放比：", scaleValue );
			this.game.scale.setUserScale(scaleValue, scaleValue);
			this.game.scale.refresh();
			return;
		},
		preload: function() {
			this.game.load.image('loading', 'assets/preloader.gif');
			// 自适应
			this.AutoSuitableSize();
		},
		create: function() {
			this.input.maxPointers = 1;
			// 进入下一状态
			this.game.state.start('preloader');
		}
	};
	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Boot = Boot;
}());
////////////////////////////////////////////////////////
// preload
(function(){
	function Preloader() {}
	Preloader.prototype = {
		preload: function() {
			// 显示PreLoading进度条动画gif
			var preloadSprite = this.game.add.sprite(this.game.width/2, this.game.height/2, 'loading');
			preloadSprite.anchor.setTo(0.5, 0.5);
			this.game.load.setPreloadSprite(preloadSprite);
	
			// load image
			this.game.load.image('background', 'assets/background.png');
			this.game.load.image('ground', 'assets/ground.png');
			this.game.load.image('title', 'assets/title.png');
			this.game.load.spritesheet('bird', 'assets/bird.png', 34, 24, 3, 0, 0);
			this.game.load.spritesheet('pipe', 'assets/pipes.png', 54, 320, 2, 0, 0);
			this.game.load.image('btn', 'assets/start-button.png');
			this.game.load.image('ready', 'assets/get-ready.png');
			this.game.load.image('gameover', 'assets/gameover.png');
			this.game.load.image('tip', 'assets/instructions.png');
			this.game.load.image('scoreboard', 'assets/scoreboard.png');
			this.game.load.image('backToIndex', 'assets/backToIndex-button.png');
	
			// laod audio
			this.game.load.audio('flap', 'assets/flap.wav');
			this.game.load.audio('hitground', 'assets/ground-hit.wav');
			this.game.load.audio('hitpipe', 'assets/pipe-hit.wav');
			this.game.load.audio('getscore', 'assets/score.wav');
			this.game.load.audio('gameover', 'assets/ouch.wav');
	
			this.game.load.bitmapFont('scorefont', 'assets/font.png', 'assets/font.fnt');
		},	
		create: function() {
			// 进入主菜单界面
			this.game.state.start('menu');
		}
	};
	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Preloader = Preloader;
}());
////////////////////////////////////////////////////////
// menu
(function(){
	function Menu() {}
	Menu.prototype = {
		create: function() {
			this.bg = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
			this.ground = this.game.add.tileSprite(0, this.game.height * 0.78, this.game.width, this.game.height * 0.22, 'ground');
	
			this.bg.autoScroll(- (this.game.height / 50), 0);			// 背景向后滚动
			this.ground.autoScroll(- (this.game.height / 5), 0);	// 地面向后滚动
	
			var titleGroup = this.game.add.group();
	
			// 添加标题字
			titleGroup.create(0, 0, 'title');
			titleGroup.x = (this.game.width - titleGroup.cursor.texture.width) / 2 - 24;
			titleGroup.y = this.game.height * 0.15;
			this.game.add.tween(titleGroup).to({y: titleGroup.y + this.game.height * 0.04}, 1000, null, true, 0, Number.MAX_VALUE, true);
	
			// 添加一个循环飞行的小鸟
			this.bird = titleGroup.create( titleGroup.cursor.texture.width + 12, 10 , 'bird');
			this.bird.animations.add('fly', null, 9, true);
			this.bird.animations.play('fly');
	
			// Play按钮
			var btn = this.game.add.button(this.game.width/2, this.game.height/2, 'btn', function(){
				this.game.state.start('game');
			});
			btn.anchor.setTo(0.5, 0.5);
	
			// 更多游戏按钮
			var backToIndex = this.game.add.button(this.game.width/2, this.game.height / 2 + btn.texture.height * 5 / 4, 'backToIndex', function(){
				window.location.href="../../index.html";
			});
			backToIndex.anchor.setTo(0.5, 0.5);
		}
	};
	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Menu = Menu;
}());