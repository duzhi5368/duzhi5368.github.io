(function() {
	'use strict';
	
	function Game() {
		this.score = 0;         // 玩家积分
		this.player = null;     // 玩家对象
		this.lastUpdate = 0;    
		this.delta = 0;

		this.STATE = {
			preplay:  0,        // 启动状态：无敌人
			play: 	1,          // 游戏状态：正常
			postplay: 2 	    // 结束状态：无玩家
		};

		this.gameState = null;
	}

	Game.prototype = {
	    create: function () {
            // 默认状态为无敌人状态
	        this.gameState = this.STATE.preplay;
            // 分数初始化
	        this.score = 0;
	        // 启动物理库
	        this.game.physics.startSystem(Phaser.Physics.ARCADE);
	        // 重置世界大小
	        this.game.world.setBounds(0, 0, 24 * CONFIG.WORLD_WIDTH * CONFIG.PIXEL_RATIO, CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO);

            // 创建地图
	        this.createGround();
            // 设置地图卷轴滚动速度
			this.scrollSpeed = CONFIG.SCROLL_SPEED;

			// 创建地面敌人
			this.createUnderCloudEnemies();
			// 创建云对象池
			this.createClouds();
			
			// 奖励池
			this.createBounds();
			// 创建飞机上方敌人以及子弹
			this.createEnemies();

			// 创建玩家
			this.player = new window['FKFramework'].Player(this);
			// 设置摄像机跟随
			this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
			
			// 创建PC平台的用户输入控制
			this.cursors = this.createPCInput();
			// GUI部分
			this.createGUI();
			// 音频部分
			this.createAudio();

			if (CONFIG.DEBUG.tileset) {
			    console.log('摄像机大小     	: ' + this.game.camera.width + '/' + this.game.camera.height);
			    console.log('世界大小      		: ' + this.world.width + '/' + this.world.height);
			    console.log('地面真实大小       : ' + this.ground.width + '/' + this.ground.height);
			    console.log('地面逻辑大小       : ' + this.groundWidth + '/' + this.groundHeight);
			}
	    },

	    // 创建云对象
	    createClouds: function () {
	        var i, o;
	        // 云对象池
	        this.cloudPool = this.add.group();
	        for (i = 0; i < CONFIG.CLOUDPOOL_SIZE; i++) {
	            o = new window['FKFramework'].Cloud(this);
	            this.cloudPool.add(o);
	            o.exists = false;
	            o.alive = false;
	        }

	        this.nextCloudAt = 0;
	    },

	    // 创建奖励池对象
	    createBounds: function () {
	        var i, o;
	        this.bonusPool = this.add.group();
	        for (i = 0; i < CONFIG.BONUSPOOL_SIZE; i++) {
	            o = new window['FKFramework'].Collectible(this, 'bonus_cube');
	            this.bonusPool.add(o);
	            o.exists = false;
	            o.alive = false;
	        }
	    },
		
        // 注册按键
	    createPCInput: function () {
		    return this.input.keyboard.addKeys({ 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S, 'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D,
		    'up2': Phaser.KeyCode.UP, 'down2': Phaser.KeyCode.DOWN, 'left2': Phaser.KeyCode.LEFT, 'right2': Phaser.KeyCode.RIGHT });
		},

        // 创建GUI
		createGUI: function () {
			var guiTextStyle = { font: "24px Arial", fill: "#ffffff", align: "center" };
			this.guiText0 = this.game.add.text( this.game.width / 2, this.game.height / 2, 'Get ready', guiTextStyle);
			this.guiText0.scale.setTo(CONFIG.PIXEL_RATIO, CONFIG.PIXEL_RATIO); 
			this.guiText0.anchor.setTo(0.5);
			this.guiText0.fixedToCamera = true;

			this.guiText1 = this.game.add.text(0, 1 * CONFIG.PIXEL_RATIO, '', guiTextStyle);
			this.guiText1.scale.setTo(CONFIG.PIXEL_RATIO / 2, CONFIG.PIXEL_RATIO / 2); 
			this.guiText1.fixedToCamera = true;

			this.guiText2 = this.game.add.text(0, 32, '', guiTextStyle);
			this.guiText2.scale.setTo(CONFIG.PIXEL_RATIO / 4, CONFIG.PIXEL_RATIO / 4); 
			this.guiText2.fixedToCamera = true;

			this.updateGUI();
		},

        // 创建地图
		createGround: function () {
			this.map = this.game.add.tilemap();
            // DEBUG模式使用不同的地图块
			if (CONFIG.DEBUG.tileset) {
				this.map.addTilesetImage('tileset_1', 'tileset_1_debug', 24, 28, null, null, 0);
			} else {
				this.map.addTilesetImage('tileset_1', 'tileset_1', 24, 28, null, null, 0);
			}
			
			// 创建一个空的地图底层
			this.groundWidth = CONFIG.WORLD_WIDTH;
			this.groundHeight = Math.round(CONFIG.GAME_HEIGHT / 28) + 1 + CONFIG.WORLD_SWAP_HEIGHT;

			this.ground = this.map.create('layer0', this.groundWidth, this.groundHeight, 24, 28);
			this.ground.fixedToCamera = false;
			this.ground.scale.setTo(CONFIG.PIXEL_RATIO, CONFIG.PIXEL_RATIO);
			this.ground.scrollFactorX = 0.0000125;
			
			this.scrollMax = CONFIG.WORLD_SWAP_HEIGHT * CONFIG.PIXEL_RATIO * 28 - 1;
			this.ground.y = - this.scrollMax;

            // 生成地图数据
			this.terrainData = this.generateTerrain();
			this.scrollCounter = 0;

            // 绘制地图
			this.drawGround();
		},

        // 生成随机地图
		generateTerrain: function () {

			var sizeX = CONFIG.WORLD_WIDTH + 1;
			var sizeY = CONFIG.WORLD_HEIGHT + 1;

			var map = [];
			var i,j,k;

			var TILE = {
				FORREST: 		6,
				EARTH: 			6 + 15 * 1,
				WATER: 			6 + 15 * 2,
				DEEPWATER: 	    6 + 15 * 3
			};

			var TILESTACK = [TILE.FORREST, TILE.EARTH, TILE.WATER, TILE.DEEPWATER];

			// Populate
			for (i = 0; i < sizeX; i++) {
				map[i] = [];
				for (j = 0; j < sizeY; j++) {
					map[i][j] = this.game.rnd.between(0, 99999);
					// map[i][j] = this.game.rnd.between(0, 90000);
					// map[i][j] = 40000;	// Only sea
				}
			}

			// Average
			for (k = 0; k < 2; k++) {

				for (i = 0; i < sizeX -1 ; i++) {
					for (j = 0; j < sizeY - 1; j++) {

						map[i][j] = (
							map[i  ][j  ] + 
							map[i+1][j  ] + 
							map[i  ][j+1] + 
							map[i+1][j+1]
							) / 4;

						map[i][j] = (
							map[(sizeX-1) - i    ][(sizeY-1) - j    ] + 
							map[(sizeX-1) - i - 1][(sizeY-1) - j    ] + 
							map[(sizeX-1) - i    ][(sizeY-1) - j - 1] + 
							map[(sizeX-1) - i - 1][(sizeY-1) - j - 1]
							) / 4;
					}
				}
			}

			// Converting to tile numbers
			for (i = 0; i < sizeX ; i++) {
				for (j = 0; j < sizeY; j++) {

					var data = map[i][j],
							val;

					if (data > 58000) {
						val = TILE.FORREST;

					} else if (data > 50000) {
						val = TILE.EARTH;

					} else if (data > 38000) {
						val = TILE.WATER;

					} else {
						val = TILE.DEEPWATER;
						// val = TILE.EARTH;
						// val = TILE.WATER;
					}
					map[i][j] = val;
				}
			}

			// Smoothing

			for (var n = 0; n < TILESTACK.length - 1; n++) {

				var tileCurrent = TILESTACK[n],
				tileAbove = -1,
				tileBelow = -1;

				if (n > 0) {
					tileAbove = TILESTACK[n - 1];
				}

				tileBelow = TILESTACK[n + 1];	// There is always a lower layer as we don't proceed last TILESTACK item

				for (i = 0; i < sizeX ; i++) {
					for (j = 0; j < sizeY; j++) {

						// Check each tile against the current layer of terrain
						if (map[i][j] === tileCurrent) {

							// Left up
							if (i > 0         && j > 0         && map[i - 1][j - 1] !== tileCurrent && map[i - 1][j - 1] !== tileAbove && map[i - 1][j - 1] !== tileBelow) { map[i - 1][j - 1] = tileBelow; }
							// Mid up
							if (                 j > 0         && map[i    ][j - 1] !== tileCurrent && map[i    ][j - 1] !== tileAbove && map[i    ][j - 1] !== tileBelow) { map[i    ][j - 1] = tileBelow; }
							// Right up
							if (i < sizeX - 1 && j > 0         && map[i + 1][j - 1] !== tileCurrent && map[i + 1][j - 1] !== tileAbove && map[i + 1][j - 1] !== tileBelow) { map[i + 1][j - 1] = tileBelow; }
							// Right mid
							if (i < sizeX - 1                  && map[i + 1][j    ] !== tileCurrent && map[i + 1][j    ] !== tileAbove && map[i + 1][j    ] !== tileBelow) { map[i + 1][j    ] = tileBelow; }
							// Right down
							if (i < sizeX - 1 && j < sizeY - 1 && map[i + 1][j + 1] !== tileCurrent && map[i + 1][j + 1] !== tileAbove && map[i + 1][j + 1] !== tileBelow) { map[i + 1][j + 1] = tileBelow; }
							// Mid down
							if (                 j < sizeY - 1 && map[i    ][j + 1] !== tileCurrent && map[i    ][j + 1] !== tileAbove && map[i    ][j + 1] !== tileBelow) { map[i    ][j + 1] = tileBelow; }
							// Left down
							if (i > 0         && j < sizeY - 1 && map[i - 1][j + 1] !== tileCurrent && map[i - 1][j + 1] !== tileAbove && map[i - 1][j + 1] !== tileBelow) { map[i - 1][j + 1] = tileBelow; }
							// Left mid
							if (i > 0                          && map[i - 1][j    ] !== tileCurrent && map[i - 1][j    ] !== tileAbove && map[i - 1][j    ] !== tileBelow) { map[i - 1][j    ] = tileBelow; }
						}
					}
				}
			}

			// Transition tiles

			var mapFinal = [];

			for (i = 0; i < sizeX - 1; i++) {
				var row = [];
				for (j = 0; j < sizeY - 1; j++) {
					row[j] = 50; // Void tile
				}
				mapFinal[i] = row;
			}


			for (n = 1; n < TILESTACK.length; n++) {
			// for (n = 2; n < 3; n++) {

				var ab = TILESTACK[n],	// Current layer tile
						cu = TILESTACK[n - 1];	// Upper layer tile

				for (i = 0; i < sizeX - 1; i++) {
					for (j = 0; j < sizeY - 1; j++) {

						var q = [[map[i][j], map[i + 1][j]],
										[map[i][j + 1], map[i + 1][j + 1]]];

						// 4 corners
						if (q.join() === [[cu,cu],[cu,cu]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 6;

						// 3 corners
						} else if (q.join() === [[cu,cu],[cu,ab]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 9;

						} else if (q.join() === [[cu,cu],[ab,cu]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 8;

						} else if (q.join() === [[ab,cu],[cu,cu]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 3;

						} else if (q.join() === [[cu,ab],[cu,cu]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 4;

						// 2 corners
						} else if (q.join() === [[cu,cu],[ab,ab]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 11;

						} else if (q.join() === [[ab,cu],[ab,cu]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 5;

						} else if (q.join() === [[ab,ab],[cu,cu]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 1;

						} else if (q.join() === [[cu,ab],[cu,ab]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 7;

						} else if (q.join() === [[ab,cu],[cu,ab]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 14;

						} else if (q.join() === [[cu,ab],[ab,cu]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 13;

						// 1 corner
						} else if (q.join() === [[cu,ab],[ab,ab]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 12;

						} else if (q.join() === [[ab,cu],[ab,ab]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 10;

						} else if (q.join() === [[ab,ab],[ab,cu]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 0;

						} else if (q.join() === [[ab,ab],[cu,ab]].join()) {
							mapFinal[i][j] = (n - 1) * 15 + 2;

						// no corner
						} else if (q.join() === [[ab,ab],[ab,ab]].join()) {
							mapFinal[i][j] = n * 15 + 6;
						}

					}
				}
			}

			return mapFinal;
		},
		
		createUnderCloudEnemies: function () {
			var mob, i;
			
			this.mobPoolsGround = [];
			// 创建地面炮台
			this.mobPoolsGround[0] = this.add.group();
			for (i = 0; i < CONFIG.MOBPOOL_SIZE; i++) {
				mob = new window['FKFramework'].Turret(this);
				this.mobPoolsGround[0].add(mob);
				mob.exists = false; 
				mob.alive = false;
			}	
			
			// 地面对象
			this.enemyDelayGround = [];
			this.nextEnemyGroundAt = [];

            // 地面对象刷新间隔
			this.enemyDelayGround[0] = 5000;
		},

		createEnemies: function () {
			var mob, o, i;
			
			this.bulletPoolsMob = [];

			// 创建小型子弹
			this.bulletPoolsMob[0] = this.add.group();
			for (i = 0; i < CONFIG.BULLETPOOL_SIZE_ENNEMY; i++) {
				o = new window['FKFramework'].Bullet(this, 0);
				this.bulletPoolsMob[0].add(o);
				o.exists = false; 
				o.alive = false;
			}

		    // 创建中型子弹
			this.bulletPoolsMob[1] = this.add.group();
			for (i = 0; i < CONFIG.BULLETPOOL_SIZE_ENNEMY; i++) {
				o = new window['FKFramework'].Bullet(this, 1);
				this.bulletPoolsMob[1].add(o);
				o.exists = false; 
				o.alive = false;
			}

			this.mobPools = [];
            // 创建小飞机
			this.mobPools[0] = this.add.group();

			for (i = 0; i < CONFIG.MOBPOOL_SIZE; i++) {
				mob = new window['FKFramework'].Plane(this);
				this.mobPools[0].add(mob);
				mob.exists = false; 
				mob.alive = false;
			}

			// 创建船舶
			this.mobPools[1] = this.add.group();
			for (i = 0; i < CONFIG.MOBPOOL_SIZE; i++) {
				mob = new window['FKFramework'].Vessel(this);
				this.mobPools[1].add(mob);
				mob.exists = false; 
				mob.alive = false;
			}

			// 创建旗舰
			this.mobPools[2] = this.add.group();
			for (i = 0; i < CONFIG.MOBPOOL_SIZE; i++) {
				mob = new window['FKFramework'].Flagship(this);
				this.mobPools[2].add(mob);
				mob.exists = false; 
				mob.alive = false;
			}
			
            // 空中对象
			this.enemyDelay = [];
			this.nextEnemyAt = [];

            // 设置各自的刷新间隔
			this.enemyDelay[0] = 1000;
			this.enemyDelay[1] = 5000;
			this.enemyDelay[2] = 30000;
		},

        // 创建音乐音效
		createAudio: function () {
			this.sound['shoot_player_1'] = this.add.audio('shoot_player_1');
			this.sound['shoot_player_2'] = this.add.audio('shoot_player_2');
			this.sound['shoot_player_3'] = this.add.audio('shoot_player_3');
			this.sound['shoot_player_4'] = this.add.audio('shoot_player_4');
			this.sound['shoot_player_5'] = this.add.audio('shoot_player_5');

			this.sound['explosion_1'] = this.add.audio('explosion_1');
			this.sound['explosion_2'] = this.add.audio('explosion_2');
			this.sound['explosion_3'] = this.add.audio('explosion_3');
			this.sound['explosion_4'] = this.add.audio('explosion_4');

			this.sound['hurt_1'] = this.add.audio('hurt_1');
			this.sound['collect_1'] = this.add.audio('collect_1');
		},

		// 状态切换
		statePreplay2Play: function () {
			this.gameState = this.STATE.play;

			// 空中和地面的子弹准备
			this.nextEnemyAt[0] = this.time.now + this.enemyDelay[0];
			this.nextEnemyAt[1] = this.time.now + this.enemyDelay[1];
			this.nextEnemyAt[2] = this.time.now + this.enemyDelay[2];
			this.nextEnemyGroundAt[0] = this.time.now + this.enemyDelayGround[0];

			// 隐藏中间字
			this.guiText0.setText('');
		},

		// 状态切换
		statePlay2Postplay: function () {
			this.gameState = this.STATE.postplay;
			this.guiText0.setText('游戏结束');		// 提示GameOver
		},

		// 主逻辑更新函数
		update: function () {
			// 记录帧用时
			this.delta = (this.game.time.now - this.lastUpdate) / 1000;
			this.lastUpdate = this.game.time.now;
			
			if(CONFIG.DEBUG.debugLogInfo)
			{
				if( (1/this.delta) <= 24 )
				{
					console.log("卡顿 - FPS=" + (1/this.delta));
				}
			}

			// 预游戏状态，不创建敌人
			if (this.gameState !== this.STATE.preplay) {
				// 创建敌人
				this.updateEnemySpawn();
				// 更新碰撞
				this.updateCollisions();
			}

			// 云朵生成
			this.updateCloudSpawn();
			// 更新地面以及更新地面敌人
			this.updateBackground(this.delta);
		},

		// 刷新创建敌人
		updateEnemySpawn: function () {
			var enemy, i;
			for (i = 0; i < this.mobPools.length; i++) {
				if (this.nextEnemyAt[i] < this.time.now && this.mobPools[i].countDead() > 0) {
					this.nextEnemyAt[i] = this.time.now + this.enemyDelay[i];
					enemy = this.mobPools[i].getFirstExists(false);
					enemy.revive();
				}
			}
		},

		// 刷新创建地面敌人
		updateEnemySpawnGround: function () {
			var enemy, i, j, k, delta;
			delta = CONFIG.WORLD_SWAP_HEIGHT * 28 / this.scrollSpeed;
			var swapMap = [];
			for (i = 0; i < CONFIG.WORLD_WIDTH; i++) {
				swapMap[i] = [];
				for(j = 0; j < CONFIG.WORLD_SWAP_HEIGHT; j++) {
					var rowOffset = CONFIG.WORLD_HEIGHT - (this.groundHeight + this.scrollCounter) + j;
					if (rowOffset < 0) {
						rowOffset += CONFIG.WORLD_HEIGHT;
					}
					swapMap[i][j] = this.terrainData[i][rowOffset];
				}
			}


			for (k = 0; k < this.mobPoolsGround.length; k++) {
				var nEnemies = Math.round(delta * 1000 / this.enemyDelayGround[k]) + 1;
				var tiles = [];
				for (i = 0; i < CONFIG.WORLD_WIDTH; i++) {
					for(j = 0; j < CONFIG.WORLD_SWAP_HEIGHT; j++) {
						if (swapMap[i][j] === 21) {	// 仅在地表
							tiles.push([i, j]);
						}
					}
				}

				if (tiles.length > 0 && nEnemies > 0) {
					for (var n = 0; n < tiles.length && n < nEnemies; n++) {
						var r = this.rnd.integerInRange(0, tiles.length - 1 - n);
						if (this.mobPoolsGround[k].countDead() > 0) {
							enemy = this.mobPoolsGround[k].getFirstExists(false);
							enemy.revive(tiles[r][0], tiles[r][1]);
							tiles.remove(r);
						}
					}
				}
			}
		},

		// 刷新创建云
		updateCloudSpawn: function () {
			var cloud;

			if (this.nextCloudAt < this.time.now && this.cloudPool.countDead() > 0) {
				this.nextCloudAt = this.time.now + CONFIG.CLOUD_CREATE_DELAY;
				cloud = this.cloudPool.getFirstExists(false);
				cloud.revive();
			}
		},

		// 更新碰撞
		updateCollisions: function () {
			var i;
			// 飞行敌人
			for (i = 0; i < this.mobPools.length; i++) {
				// 玩家子弹和敌人
				this.physics.arcade.overlap(this.player.bulletPool, this.mobPools[i], this.bulletVSmob, null, this);
				// 玩家和敌人
				this.physics.arcade.overlap(this.player, this.mobPools[i], this.playerVSmob, null, this);
			}

			// 地面敌人
			for (i = 0; i < this.mobPoolsGround.length; i++) {
				// 玩家子弹和敌人
				this.physics.arcade.overlap(this.player.bulletPool, this.mobPoolsGround[i], this.bulletVSmob, null, this);
			}

			// 玩家和敌人子弹
			for (i = 0; i < this.bulletPoolsMob.length; i++) {
				this.physics.arcade.overlap(this.bulletPoolsMob[i], this.player, this.playerVSbullet, null, this);
			}

			// 玩家和奖励品
			this.physics.arcade.overlap(this.bonusPool, this.player, this.playerVSbonus, null, this);
		},

		// 玩家子弹和敌人碰撞
		bulletVSmob: function (bullet, mob) {
			bullet.kill();
			mob.takeDamage(this.player.strength / 5);

			if (mob.health <= 0) {
				mob.die();
				this.explode(mob);
				this.score += mob.points;
				this.updateGUI();
			}
		},

		// 玩家和敌人碰撞
		playerVSmob: function (player, mob) {
			mob.kill();
			this.explode(mob);
			this.playerVSenemy(player);
		},

		// 玩家和敌人子弹碰撞
		playerVSbullet: function (player, bullet) {
			bullet.kill();
			this.playerVSenemy(player);
		},

		// 玩家和敌人碰撞
		playerVSenemy: function (player) {
			player.takeDamage(10); 

			if (player.health <= 0) {
				// 玩家死亡
				player.kill();
				player.alive = false;
				this.explode(player);

				this.sound['explosion_3'].play();

				this.statePlay2Postplay();
			} else {
				this.sound['hurt_1'].play();
			}
			
			this.updateGUI();
		},

        // 主角碰到奖励品
		playerVSbonus: function (player, bonus) {
            // 奖励品自杀
		    bonus.kill();
            // 主角属性更变
			player.collectUpgrade(bonus.bonusClass);
            // 更新GUI
			this.updateGUI();
		},

		// 爆炸行为
		explode: function (thing) {
			var explosion = this.add.sprite(thing.x, thing.y, 'explosion_1');
			explosion.anchor.setTo(0.5, 0.5);
			explosion.scale.setTo(CONFIG.PIXEL_RATIO, CONFIG.PIXEL_RATIO);
			explosion.animations.add('boom', [ 0, 1, 2, 3, 4 ], 30, false);
			explosion.play('boom', 15, false, true);			
		},

	
		// 更新GUI
		updateGUI: function () {

			var gui = '';

			var life = '';
			for (var i = 0; i < Math.round(this.player.health / 20); i++) {
				life += '●';
			}

			gui += '生命值  ' + life + '\n';

			gui += '伤害 ' + this.player.playerStats.strength + '\n';
			gui += '射速' + this.player.playerStats.rate + '\n';
			gui += '速度 ' + this.player.playerStats.speed + '\n';
			gui += '加速 ' + this.player.playerStats.accel + '\n';

			this.guiText1.setText(this.score + '');
			this.guiText2.setText(gui);
		},

		// 地图滚动
		updateBackground: function (delta) {
			if (this.player.isAlive) {
				this.scrollSpeed += CONFIG.SCROLL_ACCEL * delta / 60;
			}

			if (this.ground.y < 0 ) {
				this.ground.y += this.scrollSpeed * CONFIG.PIXEL_RATIO * delta;
			} else {
				this.scrollCounter += CONFIG.WORLD_SWAP_HEIGHT;	

				if (this.scrollCounter > CONFIG.WORLD_HEIGHT) {
					this.scrollCounter = 0;
				}

				this.drawGround();

				// 更新地面敌人
				if (this.gameState !== this.STATE.preplay) {
					this.updateEnemySpawnGround();
				}

				this.ground.y = -this.scrollMax;
			}
		},

		// 绘制地表
		drawGround: function () {
			for (var i = 0; i < CONFIG.WORLD_WIDTH; i++) {
				for(var j = 0; j < this.groundHeight; j++) {

					var rowOffset = CONFIG.WORLD_HEIGHT - (this.groundHeight + this.scrollCounter) + j;

					if (rowOffset < 0) {
						rowOffset += CONFIG.WORLD_HEIGHT;
					}

					this.map.putTile(this.terrainData[i][rowOffset],i,j,this.ground);
				}
			}
		},

		// 鼠标点击后直接开始
		onInputDown: function () {
			this.statePreplay2Play();
		},

		// 渲染
		render: function () {
		    if (CONFIG.DEBUG.bottomInfos) {
                // 输出Body的边框
		        this.game.debug.body(this.player);
		        // 输出坐标
		        this.game.debug.pointer(this.game.input.mousePointer);
                // 输出底部信息
				this.game.debug.text(
					'地面Y值：' + Math.round(this.ground.y) 
					+ ' 敌人对象池：'
					+ this.mobPools[0].countLiving() + ' + ' + this.mobPools[1].countLiving() + ' + ' 
					+ this.mobPools[2].countLiving() + ' + ' + this.mobPoolsGround[0].countLiving() 
					+ ' 敌人子弹池： '
					+ this.bulletPoolsMob[0].countLiving() + ' + ' + this.bulletPoolsMob[1].countLiving() 
					+ ' 玩家子弹池： ' +
					(100 - this.player.bulletPool.countDead()), 
					0, CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO - 10 - 16);

				this.game.debug.text(
					'摄像机位置 : ' + this.camera.x + '/' + this.camera.y + ' | ' +
					'Y轴重叠 : ' + Math.round(this.ground.y % (28 * CONFIG.PIXEL_RATIO)),
					0, CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO - 10);
			}
		}
	};

	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Game = Game;

}());
