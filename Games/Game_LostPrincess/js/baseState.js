////////////////////////////////////////////////////////
// boot
(function(){
	function Boot() {}
		
	Boot.prototype = {
		// 缩放画布
		AutoSuitableSize: function(){
			// set scaleMode and align
			var deviceW=document.documentElement.clientHeight - 2;
			var deviceH=document.documentElement.clientWidth - 2;
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
			// 强制转屏
			Phaser.ScaleManager.forceLandscape = true;
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
	
			// 资源加载
			this.game.load.audio('music', 'assets/snd/music.mp3');
		
			this.game.load.image('background', 'assets/img/background.png');
			this.game.load.image('menu', 'assets/img/menu.png');
			this.game.load.image('rules', 'assets/img/rules.png');
			
			this.game.load.spritesheet('btnplay', 'assets/img/btn_play.png', 128, 128);
			this.game.load.spritesheet('btnmusic', 'assets/img/btn_music.png', 128, 128);
			this.game.load.spritesheet('btnhelp', 'assets/img/btn_help.png', 128, 128);
			this.game.load.spritesheet('btnback', 'assets/img/btn_back.png', 128, 128);
			this.game.load.spritesheet('btnreset', 'assets/img/btn_reset.png', 128, 128);
			
			this.game.load.image('map', 'assets/img/map.png');
			this.game.load.image('p', 'assets/img/p.png');
			this.game.load.image('a', 'assets/img/soidier.png');
			this.game.load.image('b', 'assets/img/soidier.png');
			this.game.load.image('c', 'assets/img/soidier.png');
			this.game.load.image('d', 'assets/img/soidier.png');
			this.game.load.image('e', 'assets/img/soidier.png');
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
	function Menu() {
		// Menu
	    this.menu;
	    this.rules;
	    this.btnPlay;
	    this.btnMusic;
	    this.btnHelp;
	    this.btnBack;
	    
	    this.music;
	}
	Menu.prototype = {

		create: function() {
			// 添加音乐
			this.music = this.game.add.audio('music', 1, true);
			if (getCookie('music') !== 'false') {
				this.music.stop();
				this.music.play('', 0, 1, true);
			}

			// 设置背景
			this.game.stage.backgroundColor = '#ffffff';
			// 生成UI
			this.generateGUI();
		},
	    
	    // 生成UI
	    generateGUI: function() {
		    this.menu = this.game.add.sprite(0, 0, 'menu');
		    this.rules = this.game.add.sprite(0, 0, 'rules');
		    this.rules.visible = false;
		    this.btnPlay = this.game.add.button(this.game.world.centerX / 2, this.game.world.height * 3 / 4, 'btnplay', 
		    				this.onPlayClicked, this, 0, 0, 1, 0);
		    this.btnPlay.anchor.x = 0.5;
		    this.btnPlay.anchor.y = 0.5;
		    this.btnMusic = this.game.add.button(this.game.world.centerX, this.game.world.height * 3 / 4, 'btnmusic', 
		    				this.onMusicClicked, this, 0, 0, 1, 0);
		    this.btnMusic.anchor.x = 0.5;
		    this.btnMusic.anchor.y = 0.5;
		    this.btnHelp = this.game.add.button(this.game.world.width * 3 / 4, this.game.world.height * 3 / 4, 'btnhelp', 
		    				this.onHelpClicked, this, 0, 0, 1, 0);
		    this.btnHelp.anchor.x = 0.5;
		    this.btnHelp.anchor.y = 0.5;
		    this.btnBack = this.game.add.button(6, 6, 'btnback', 
		    				this.onBackHelpClicked, this, 0, 0, 1, 0);
		    this.btnBack.visible = false;
	    },
	    
	    onPlayClicked: function() {
	    	if (this.music.isPlaying) {
		        this.music.stop();
		    }
		    this.game.state.start('game');
	    },

	    onHelpClicked: function() {
		    this.menu.visible = false;
		    this.btnPlay.visible = false;
		    this.btnMusic.visible = false;
		    this.btnHelp.visible = false;
		    this.rules.visible = true;
		    this.btnBack.visible = true;
	    },

        onBackHelpClicked: function() {
		    this.menu.visible = true;
		    this.btnPlay.visible = true;
		    this.btnMusic.visible = true;
		    this.btnHelp.visible = true;
		    this.rules.visible = false;
		    this.btnBack.visible = false;
	    },

        onMusicClicked: function() {
		    if (this.music.isPlaying) {
		        this.music.stop();
		        setCookie('music', 'false', CONFIG.COOKIE_TIME_DAYS);
		    } else {
		        this.music.play('', 0, 1, true);
		        setCookie('music', 'true', CONFIG.COOKIE_TIME_DAYS);
		    }
	    }
	};
	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Menu = Menu;
}());