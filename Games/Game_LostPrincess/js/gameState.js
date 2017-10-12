////////////////////////////////////////////////////////
// game
(function(){
	function Game() {
		this.movingActor = null;			// 当前移动的对象
	    this.isMoving = false;				// 是否有角色正在移动状态
	    this.isTouched = false;				// 是否有角色被点选状态
	    this.touchPos = { x: -1, y: -1 };
	    this.music;
	    
	    // 阴影部分
	    this.light;
	    this.bitmap;
	    this.lightBitmap;
	    this.isOpenShadow = true;
	    this.slowFPSCount = 0;

		// 游戏UI显示
		this.background;
	    this.btnReset;
	    this.lblLevel;

    	// 游戏逻辑部分
	    this.level = 0;
	    this.map;
	    this.actors;
	    this.player;
	    this.robotA;
	    this.robotB;
	    this.robotC;
	    this.robotD;
	    this.robotE;
	    this.lvls = [
            [ [4, 4], [4, 0], [2, 1], [1, 2], [3, 3] ],
            [ [1, 4], [2, 0], [4, 1], [1, 2], [3, 3] ],
            [ [4, 4], [3, 0], [1, 1], [3, 3], [1, 4] ],
            [ [1, 4], [0, 0], [4, 0], [3, 1], [2, 3] ],
            [ [1, 4], [3, 0], [1, 1], [3, 4] ],

            [ [2, 0], [0, 0], [4, 3], [1, 4] ],
            [ [1, 4], [2, 0], [0, 1], [3, 2], [3, 4] ],
            [ [3, 3], [0, 0], [3, 0], [1, 1], [0, 4] ],
            [ [2, 0], [4, 0], [2, 2], [1, 3], [3, 4] ],
            [ [4, 4], [1, 1], [4, 2], [0, 4], [2, 4] ],


            [ [2, 1], [2, 0], [0, 1], [4, 1], [2, 2], [2, 3] ],
            [ [4, 4], [1, 0], [4, 1], [1, 4] ],
            [ [3, 3], [1, 0], [3, 1], [0, 3], [2, 4] ],
            [ [1, 4], [2, 0], [4, 1], [0, 2], [3, 3], [0, 4] ],
            [ [4, 4], [4, 0], [1, 1], [4, 2], [2, 3] ],

            [ [2, 0], [0, 0], [1, 2], [4, 2], [1, 4] ],
            [ [1, 4], [2, 0], [4, 0], [1, 2], [3, 3] ],
            [ [2, 0], [0, 4], [2, 4], [4, 4] ],
            [ [4, 4], [1, 0], [2, 1], [3, 2], [0, 3], [2, 4] ],
            [ [3, 3], [1, 0], [4, 1], [0, 2], [1, 4] ],


            [ [2, 0], [2, 1], [2, 2], [4, 2], [0, 3], [3, 4] ],
            [ [4, 4], [0, 1], [4, 1], [3, 3], [0, 4] ],
            [ [1, 4], [1, 0], [0, 1], [3, 1], [4, 3] ],
            [ [0, 4], [3, 1], [1, 2], [3, 4], [4, 4] ],
            [ [1, 4], [0, 1], [2, 1], [3, 1], [4, 4] ],

            [ [2, 0], [0, 0], [4, 1], [0, 2], [3, 3] ],
            [ [4, 4], [1, 0], [4, 0], [0, 2], [3, 2], [0, 4] ],
            [ [4, 4], [1, 0], [4, 0], [4, 2], [0, 3] ],
            [ [2, 0], [0, 0], [4, 0], [0, 4], [4, 4] ],
            [ [2, 0], [0, 1], [4, 1], [0, 2], [1, 4], [3, 4] ],


            [ [3, 3], [0, 0], [2, 0], [4, 1], [0, 2], [1, 4] ],
            [ [1, 4], [1, 0], [4, 1], [0, 4], [2, 4] ],
            [ [4, 4], [0, 0], [1, 0], [4, 1], [0, 3], [3, 4] ],
            [ [4, 4], [2, 0], [4, 0], [0, 2], [3, 3], [0, 4] ],
            [ [2, 0], [0, 0], [4, 0], [2, 1], [0, 4], [4, 4] ],

            [ [2, 0], [0, 1], [4, 1], [0, 3], [4, 3], [2, 4] ],
            [ [3, 3], [0, 0], [3, 0], [4, 0], [0, 3] ],
            [ [1, 4], [2, 0], [4, 0], [0, 2], [1, 2], [4, 4] ],
            [ [4, 4], [0, 0], [2, 0], [4, 0], [0, 2], [0, 4] ],
            [ [1, 4], [0, 0], [2, 0], [4, 0], [4, 3] ]
	    ];	
	}
	
	Game.prototype = {
		create: function() {
	        this.background = this.game.add.sprite(0, 0, 'background');
	        this.map = this.game.add.sprite(160, 40, 'map');
	        this.btnBack = this.game.add.button(this.game.world.width / 8, this.game.world.height / 4, 'btnback', 
	        				this.onBackGameClicked, this, 0, 0, 1, 0);
	        this.btnBack.anchor.y = 0.5;
	        this.btnBack.anchor.x = 0.5;
	        this.btnReset = this.game.add.button(this.game.world.width / 8, this.game.world.height / 2, 'btnreset', 
	        				this.onResetStage, this, 0, 0, 1, 0);
	        this.btnReset.anchor.y = 0.5;
	        this.btnReset.anchor.x = 0.5;
	        
	        // 读取关卡
	        if (getCookie('level') === '') {
				setCookie('level', '0', CONFIG.COOKIE_TIME_DAYS);
			}
			this.level = parseInt(getCookie('level'));
	        
	        this.lblLevel = this.game.add.text(this.game.world.width / 8, this.game.world.height * 3 / 4, "Level: " + (this.level + 1));
	        this.lblLevel.anchor.y = 0.5;
	        this.lblLevel.anchor.x = 0.5;
	        this.lblLevel.font = 'Verdana';
	        this.lblLevel.fontSize = 20;
	        this.lblLevel.align = 'center';
	        this.lblLevel.fill = '#eeeeee';
	        this.lblLevel.stroke = '#222222';
	        this.lblLevel.strokeThickness = 5;
	        
			// 开启物理
			this.game.physics.startSystem(Phaser.Physics.ARCADE);

			// 开始关卡
	        this.createStage();
	        
	        // 开启FPS监视
	        this.game.time.advancedTiming = true;
	        
	        // 添加音乐
			this.music = this.game.add.audio('music', 1, true);
			if (getCookie('music') !== 'false') {
				this.music.stop();
				this.music.play('', 0, 1, true);
			}

	    },
		
	    update: function() {
	    		// 如果已经有Actor出界，那么游戏重置
	            this.actors.forEach(function(actor) {
				    if (!actor.inWorld) {
				        actor.game.state.states['game'].resetStage();
				    }
			    });

				// 检查是否可以过关
	            this.checkGoalReached();

				// 进行角色碰撞检查
	            this.game.physics.arcade.collide(this.actors);

				// 检查是否有角色正在移动状态
	            this.isMoving = false;
	            this.actors.forEach(function(actor) {
	                actor.game.state.states['game'].isMoving = actor.game.state.states['game'].isMoving 
	                										|| (actor.body.velocity.x !== 0) 
	                										|| (actor.body.velocity.y !== 0);
			    });

				// 若无人移动也无人被点选，则锁死全部角色
	            if (!this.isMoving && !this.isTouched) {
			        this.movingActor = null;
			        this.actors.forEach(function(actor) {
				        actor.body.immovable = true;
				    });
			    }

				// 若鼠标没有按下状态，那说明没有角色被点选
			    if (this.game.input.activePointer.isUp) {
			        this.isTouched = false;
			    }


				this.actors.forEach(function(actor) {
					if (actor.game.input.activePointer.isDown && 
						actor.body.hitTest(actor.game.input.activePointer.x, actor.game.input.activePointer.y)) {
	            		actor.game.state.states['game'].movingActor = actor;
	            		actor.game.state.states['game'].isTouched = true;
	            		//console.log(actor.game.state.states['game']);
						actor.game.state.states['game'].touchPos.x = actor.game.input.activePointer.x;
						actor.game.state.states['game'].touchPos.y = actor.game.input.activePointer.y;
					}
				});

				// 若有角色被点选，且没有角色在移动状态
			    if (this.isTouched && !this.isMoving) {
			        if (this.game.input.activePointer.x > this.touchPos.x + 20) {
				        this.isMoving = true;
				        this.movingActor.body.immovable = false;
				        this.movingActor.body.velocity.x = CONFIG.ACTOR_MOVE_SPEED;
			        } else if (this.game.input.activePointer.x < this.touchPos.x - 20) {
				        this.isMoving = true;
				        this.movingActor.body.immovable = false;
				        this.movingActor.body.velocity.x = -CONFIG.ACTOR_MOVE_SPEED;
			        } else if (this.game.input.activePointer.y > this.touchPos.y + 20) {
				        this.isMoving = true;
				        this.movingActor.body.immovable = false;
				        this.movingActor.body.velocity.y = CONFIG.ACTOR_MOVE_SPEED;
			        } else if (this.game.input.activePointer.y < this.touchPos.y - 20) {
				        this.isMoving = true;
				        this.movingActor.body.immovable = false;
				        this.movingActor.body.velocity.y = -CONFIG.ACTOR_MOVE_SPEED;
				    }
			    }

				// 更新阴影
			    this.updateShadows();
	    },

		// 检查是否可以过关
	    checkGoalReached: function() {
	        if (this.player.x === 320 && this.player.y === 200 &&
                this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
                // 进入下一关卡
			    this.nextLevel();
		    }
	    },

		// 进入下一关卡
	    nextLevel: function() {
		    if (this.level === this.lvls.length) {
		        this.level = 0;
		        setCookie('level', this.level.toString(), CONFIG.COOKIE_TIME_DAYS);
		        this.lblLevel.setText("Level: " + (this.level + 1));
		        // 达到最大关卡数，返回主菜单
		        this.onBackGameClicked();
		    } else {
		    	// 销毁当前关卡
			    this.destroyStage();
			    this.level++;
			    setCookie('level', this.level.toString(), CONFIG.COOKIE_TIME_DAYS);
			    this.lblLevel.setText("Level: " + (this.level + 1));
			    // 进入下一关卡
			    this.createStage();
		    }
	    },

		// 生成关卡
        createStage: function() {
        	// 获取当前关卡的对象数量
	        var numRobots = this.lvls[this.level].length;
	        // 添加关卡对象组
		    this.actors = this.game.add.group();

		    if (numRobots >= 1) {
		        this.player = this.actors.create(this.lvls[this.level][0][0] * 80 + 160, 
		        	this.lvls[this.level][0][1] * 80 + 40, 'p');
		        this.game.physics.arcade.enable(this.player);
		        this.player.inputEnabled = true;
		        this.player.body.immovable = true;
		        this.player.body.collideWorldBounds = false;
		    }

		    if (numRobots >= 2) {
		        this.robotA = this.actors.create(this.lvls[this.level][1][0] * 80 + 160, 
		        	this.lvls[this.level][1][1] * 80 + 40, 'a');
		        this.game.physics.arcade.enable(this.robotA);
			    this.robotA.inputEnabled = true;
			    this.robotA.body.immovable = true;
			    this.robotA.body.collideWorldBounds = false;
		    }

		    if (numRobots >= 3) {
		        this.robotB = this.actors.create(this.lvls[this.level][2][0] * 80 + 160, 
		        	this.lvls[this.level][2][1] * 80 + 40, 'b');
		        this.game.physics.arcade.enable(this.robotB);
			    this.robotB.inputEnabled = true;
			    this.robotB.body.immovable = true;
			    this.robotB.body.collideWorldBounds = false;
		    }

		    if (numRobots >= 4) {
		        this.robotC = this.actors.create(this.lvls[this.level][3][0] * 80 + 160, 
		        	this.lvls[this.level][3][1] * 80 + 40, 'c');
			    this.game.physics.arcade.enable(this.robotC);
			    this.robotC.inputEnabled = true;
			    this.robotC.body.immovable = true;
			    this.robotC.body.collideWorldBounds = false;
		    }

		    if (numRobots >= 5) {
		        this.robotD = this.actors.create(this.lvls[this.level][4][0] * 80 + 160, 
		        	this.lvls[this.level][4][1] * 80 + 40, 'd');
		        this.game.physics.arcade.enable(this.robotD);
			    this.robotD.inputEnabled = true;
			    this.robotD.body.immovable = true;
			    this.robotD.body.collideWorldBounds = false;
		    }

		    if (numRobots >= 6) {
		        this.robotE = this.actors.create(this.lvls[this.level][5][0] * 80 + 160, 
		        	this.lvls[this.level][5][1] * 80 + 40, 'e');
		        this.game.physics.arcade.enable(this.robotE);
			    this.robotE.inputEnabled = true;
			    this.robotE.body.immovable = true;
			    this.robotE.body.collideWorldBounds = false;
		    }

			// 创建关卡阴影
		    this.createShadows();
	    },

		// 销毁关卡
        destroyStage: function() {
	        this.destroyShadows();
	        this.actors.setAll('visible', false);
	    },
	    
	    // 重置关卡
	    resetStage: function() {
	        this.destroyStage();
	        this.createStage();	    	
	    },

		// 重置关卡按钮按下
        onResetStage: function() {
			this.resetStage();
	    },
	    
	    // 返回主菜单按钮按下
	    onBackGameClicked: function() {
	    	this.destroyStage();
	    	if (this.music.isPlaying) {
		        this.music.stop();
		    }
		    this.game.state.start('menu');
	    },

	    // ===================================
	    // ||          		阴影          		||
	    // ===================================
	    // 创建阴影
        createShadows: function() {
        	if(!Phaser.Device.desktop)
        		return;
		    this.light = new Phaser.Point(360, 240);

		    this.bitmap = this.game.add.bitmapData(this.game.width, this.game.height);
		    this.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
		    this.bitmap.context.strokeStyle = 'rgb(255, 255, 255)';

		    this.lightBitmap = this.game.add.image(0, 0, this.bitmap);
		    this.lightBitmap.blendMode = Phaser.blendModes.MULTIPLY;
	    },

		// 销毁阴影
        destroyShadows: function() {
        	if(!Phaser.Device.desktop)
        		return;
		    this.lightBitmap.visible = false;
	    },

		// 更新阴影
        updateShadows: function() {
        	if(!Phaser.Device.desktop)
        		return;
		    this.bitmap.context.fillStyle = 'rgb(225, 225, 225)';
		    this.bitmap.context.fillRect(0, 0, this.game.width, this.game.height);

		    var points = [];
		    var ray = null;
		    var intersect;
		    var i;
		    var stageCorners = [
			    new Phaser.Point(0, 0),
			    new Phaser.Point(this.game.width, 0),
			    new Phaser.Point(this.game.width, this.game.height),
			    new Phaser.Point(0, this.game.height)
		    ];


		    this.actors.forEach(function(actor) {
			    var corners = [
				    new Phaser.Point(actor.x + 0.1, actor.y + 0.1),
				    new Phaser.Point(actor.x - 0.1, actor.y - 0.1),
				    new Phaser.Point(actor.x - 0.1 + actor.width, actor.y + 0.1),
				    new Phaser.Point(actor.x + 0.1 + actor.width, actor.y - 0.1),
				    new Phaser.Point(actor.x - 0.1 + actor.width, actor.y - 0.1 + actor.height),
				    new Phaser.Point(actor.x + 0.1 + actor.width, actor.y + 0.1 + actor.height),
				    new Phaser.Point(actor.x + 0.1, actor.y - 0.1 + actor.height),
				    new Phaser.Point(actor.x - 0.1, actor.y + 0.1 + actor.height)
			    ];

			    for(i = 0; i < corners.length; i++) {
				    var c = corners[i];
				    var slope = (c.y - this.light.y) / (c.x - this.light.x);
				    var b = this.light.y - slope * this.light.x;
				    var end = null;

				    if (c.x === this.light.x) {
					    if (c.y <= this.light.y) {
						    end = new Phaser.Point(this.light.x, 0);
					    } else {
						    end = new Phaser.Point(this.light.x, this.game.height);
					    }
				    } else if (c.y === this.light.y) {
					    if (c.x <= this.light.x) {
						    end = new Phaser.Point(0, this.light.y);
					    } else {
						    end = new Phaser.Point(this.game.width, this.light.y);
					    }
				    } else {
					    var left = new Phaser.Point(0, b);
					    var right = new Phaser.Point(this.game.width, slope * this.game.width + b);
					    var top = new Phaser.Point(-b / slope, 0);
					    var bottom = new Phaser.Point((this.game.height - b) / slope, this.game.height);

					    if (c.y <= this.light.y && c.x >= this.light.x) {
						    if (top.x >= 0 && top.x <= this.game.width) {
							    end = top;
						    } else {
							    end = right;
						    }
					    } else if (c.y <= this.light.y && c.x <= this.light.x) {
						    if (top.x >= 0 && top.x <= this.game.width) {
							    end = top;
						    } else {
							    end = left;
						    }
					    } else if (c.y >= this.light.y && c.x >= this.light.x) {
						    if (bottom.x >= 0 && bottom.x <= this.game.width) {
							    end = bottom;
						    } else {
							    end = right;
						    }
					    } else if (c.y >= this.light.y && c.x <= this.light.x) {
						    if (bottom.x >= 0 && bottom.x <= this.game.width) {
							    end = bottom;
						    } else {
							    end = left;
						    }
					    }
				    }

				    ray = new Phaser.Line(this.light.x, this.light.y, end.x, end.y);
				    intersect = this.getWallIntersection(ray);

				    if (intersect) {
					    points.push(intersect);
				    } else {
					    points.push(ray.end);
				    }
			    }
		    }, this);

		    for(i = 0; i < stageCorners.length; i++) {
			    ray = new Phaser.Line(this.light.x, this.light.y, stageCorners[i].x, stageCorners[i].y);
			    intersect = this.getWallIntersection(ray);

			    if (!intersect) {
				    points.push(stageCorners[i]);
			    }
		    }

		    var center = { x: this.light.x, y: this.light.y };

		    points = points.sort(function(a, b) {
			    if (a.x - center.x >= 0 && b.x - center.x < 0)
				    return 1;

			    if (a.x - center.x < 0 && b.x - center.x >= 0)
				    return -1;

			    if (a.x - center.x === 0 && b.x - center.x === 0) {
				    if (a.y - center.y >= 0 || b.y - center.y >= 0)
					    return 1;

				    return -1;
			    }

			    var det = (a.x - center.x) * (b.y - center.y) - (b.x - center.x) * (a.y - center.y);

			    if (det < 0)
				    return 1;

			    if (det > 0)
				    return -1;

			    var d1 = (a.x - center.x) * (a.x - center.x) + (a.y - center.y) * (a.y - center.y);
			    var d2 = (b.x - center.x) * (b.x - center.x) + (b.y - center.y) * (b.y - center.y);

			    return 1;
		    });

		    this.bitmap.context.beginPath();
		    this.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
		    this.bitmap.context.moveTo(points[0].x, points[0].y);

		    for(var j = 0; j < points.length; j++) {
			    this.bitmap.context.lineTo(points[j].x, points[j].y);
		    }

		    this.bitmap.context.closePath();
		    this.bitmap.context.fill();
		    this.bitmap.dirty = true;
	    },

		// 获取墙壁切线
        getWallIntersection: function(ray) {
		    var distanceToWall = Number.POSITIVE_INFINITY;
		    var closestIntersection = null;

		    this.actors.forEach(function(actor) {
			    var lines = [
				    new Phaser.Line(actor.x, actor.y, actor.x + actor.width, actor.y),
				    new Phaser.Line(actor.x, actor.y, actor.x, actor.y + actor.height),
				    new Phaser.Line(actor.x + actor.width, actor.y, actor.x + actor.width, actor.y + actor.height),
				    new Phaser.Line(actor.x, actor.y + actor.height, actor.x + actor.width, actor.y + actor.height)
			    ];

			    for(var i = 0; i < lines.length; i++) {
				    var intersect = Phaser.Line.intersects(ray, lines[i]);

				    if (intersect) {
					    distance = this.game.math.distance(ray.start.x, ray.start.y, intersect.x, intersect.y);

					    if (distance < distanceToWall) {
						    distanceToWall = distance;
						    closestIntersection = intersect;
					    }
				    }
			    }
		    }, this);

		    return closestIntersection;
	    }
	};
	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Game = Game;
}());