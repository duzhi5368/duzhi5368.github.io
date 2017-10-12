////////////////////////////////////////////////////////
// game
(function(){
	function Game() {}
	Game.prototype = {
		create: function() {
			// 创建背景层
			this.bg = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
	
			this.ready = this.game.add.image(this.game.width/2, this.game.height * 0.1, 'ready');
			this.ready.anchor.setTo(0.5, 0);
			this.tip = this.game.add.image(this.game.width/2, this.game.height*0.5, 'tip');
			this.tip.anchor.setTo(0.5, 0);
	
			// 开启水管的碰撞
			this.pipeGroup = this.game.add.group();
			this.pipeGroup.enableBody = true;
		
			// 创建小鸟对象
			this.bird = this.game.add.sprite(this.game.width * 0.15, this.game.height * 0.3, 'bird');
			this.bird.animations.add('fly', null, 9, true);
			this.bird.animations.play('fly');
			this.bird.anchor.setTo(0.5, 0.5);
	
			this.ground = this.game.add.tileSprite(0, this.game.height * 0.78, this.game.width, this.game.height * 0.22, 'ground');
	
			this.soundFly = this.game.add.sound('flap');
			this.soundHitGround = this.game.add.sound('hitground');
			this.soundHitPipe = this.game.add.sound('hitpipe');
			this.soundScore = this.game.add.sound('getscore');
			this.soundGameOver = this.game.add.sound('gameover');
	
			this.game.physics.enable(this.bird, Phaser.Physics.ARCADE);
			this.bird.body.gravity.y = 0;
			this.game.physics.enable(this.ground, Phaser.Physics.ARCADE);
			this.ground.body.immovable = true;
	
			this.hasStared = false;
			this.game.time.events.loop(900, this.generatePipe, this);	// 每900ms创建一次水管
			this.game.time.events.stop(false);
			
			this.game.input.onDown.addOnce(this.startGame, this);		// 注册点击开始游戏事件
		},
	
		update: function() {
			if (!this.hasStared) 
				return;
			if (this.bird.angle < 90) 
				this.bird.angle += 3;
			this.game.physics.arcade.collide(this.bird, this.ground, this.hitGround, null, this);
			this.game.physics.arcade.overlap(this.bird, this.pipeGroup, this.hitPipe, null, this);
			this.pipeGroup.forEachExists(this.checkScore, this);
		},
	
		startGame: function() {
			this.gameSpeed = 200;
			this.score = 0;
	
			this.hasStared = true;
			this.gameIsOver = false;
			this.ready.destroy();
			this.tip.destroy();
	
			this.bg.autoScroll(-(this.gameSpeed/10),0);
			this.ground.autoScroll(-this.gameSpeed,0);
			this.bird.body.gravity.y = 1150;
	
			this.scoreText = this.game.add.bitmapText(this.game.width/2 - 10, this.game.height*0.15, 'scorefont', '0', 36);
			
			this.game.time.events.start();
			this.game.input.onDown.add(this.fly, this);
		},
	
		fly: function() {
			this.bird.body.velocity.y = -350;
			this.soundFly.play();
			this.game.add.tween(this.bird).to({angle: -30}, 100, null, true, 0, 0, false);	
		},
	
		hitGround: function() {
			if (this.gameIsOver) 
				return;
			this.soundHitGround.play();
			this.gameOver();
		},
	
		hitPipe: function() {
			if (this.gameIsOver) 
				return;
			this.soundHitPipe.play();
			this.gameOver();
		},
	
		generatePipe: function(y) {
			y = y || 30;
			var gap = 150;
			this.upReset = false;
			this.downReset = false;
	
			var upperPipeY = 30 + Math.floor((this.game.height - 112 - gap - 10 - 30)*Math.random());
			if (upperPipeY == y)
			{
				this.generatePipe(y);
			} 
			//debug: 确认有重复利用dead pipe，没有造成内存浪费
			//console.log('live pipe:'+this.pipeGroup.countLiving()+'\ndead pipe:'+this.pipeGroup.countDead());
			if (this.pipeGroup.countDead() > 0)
			{
				this.pipeGroup.forEachDead(function(pipe){
					if (pipe.anchor.y == 1)
					{
						pipe.reset(this.game.width, upperPipeY);
						this.upReset = true;
						pipe.counted = false;//将管道恢复成未计分状态
					}
					else
					{
						pipe.reset(this.game.width, upperPipeY + gap);
						this.downReset = true;
					}
					pipe.body.velocity.x = -this.gameSpeed;
					if (this.upReset && this.downReset) 
					{
						this.upReset = false;
						this.downReset = false;
						return;
					}
				}, this);
				return;
			}
			
			var topPipe = this.game.add.sprite(this.game.width, upperPipeY, 'pipe', 0, this.pipeGroup);
			var bottomPipe = this.game.add.sprite(this.game.width, upperPipeY + gap, 'pipe', 1, this.pipeGroup);
			topPipe.anchor.setTo(0, 1);
			bottomPipe.anchor.setTo(0, 0);
			this.pipeGroup.setAll('checkWorldBounds', true);
			this.pipeGroup.setAll('outOfBoundsKill', true);
			this.pipeGroup.setAll('body.velocity.x', -this.gameSpeed);
		},
	
		stopGame: function() {
			this.game.time.events.stop();
			this.ground.stopScroll();
			this.bg.stopScroll();
			this.pipeGroup.setAll('body.velocity.x', 0);
			this.bird.animations.stop();
			this.game.input.onDown.remove(this.fly, this);
			this.scoreText.destroy();
	
			this.soundGameOver.play();
	
			var scoreGroup = this.game.add.group();
			var gameOverText = scoreGroup.create(this.game.width/2, 0, 'gameover');
			gameOverText.anchor.x = 0.5;
	
			var scoreBoard = scoreGroup.create(this.game.width/2, 70, 'scoreboard');
			scoreBoard.anchor.x = 0.5;
	
			var newScore = this.game.add.bitmapText(this.game.width/2 + 60, 107, 'scorefont', this.score+'', 20, scoreGroup);//this.score后加引号是为了转化为字符串，否则不能显示
			this.bestScore = this.bestScore || 0;
			if (this.bestScore < this.score) this.bestScore = this.score;
			var bestScore = this.game.add.bitmapText(this.game.width/2 + 60, 155, 'scorefont', this.bestScore+'', 20, scoreGroup);
	
			var btnReplay = this.game.add.button(this.game.width/2, 210, 'btn', function(){this.game.state.start('game')}, this, 0, 0, 0, 0, scoreGroup );
			btnReplay.anchor.x = 0.5;
			
			// 更多游戏按钮
			var backToIndex = this.game.add.button(this.game.width/2, 350, 'backToIndex', function(){
				window.location.href="../../index.html";
			});
			backToIndex.anchor.x = 0.5;
	
			scoreGroup.y = 70;
		},
	
		gameOver: function() {
			this.gameIsOver = true;
			this.stopGame();
		},
	
		checkScore: function(pipe) {
			if (pipe.anchor.y == 1 && !pipe.counted)//pipe.counted属性用于避免一根管道重复计分
			{
				if ((pipe.x + 56) <= this.bird.x)
				{
					pipe.counted = true;
					this.score += 1;
					this.soundScore.play();
					this.scoreText.text = this.score;
				}
			}
		}
	};
	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Game = Game;
}());