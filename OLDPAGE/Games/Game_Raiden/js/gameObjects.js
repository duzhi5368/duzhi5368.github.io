////////////////////////////////////////////////////////
// spriter->Phaser.Sprite
(function() {
	'use strict';

	function Spriter(state, image) {

		this.state = state;
		this.game = state.game;

		// 调用父类构造
		Phaser.Sprite.call(this, this.game, 0, 0, image);
		// 添加对象到世界中
		this.game.add.existing(this);

		// 对象的常用属性设置
		this.anchor.setTo(0.5, 0.5);
		this.scale.setTo(CONFIG.PIXEL_RATIO, CONFIG.PIXEL_RATIO);
		this.game.physics.enable(this, Phaser.Physics.ARCADE);
	}

	Spriter.prototype = Object.create(Phaser.Sprite.prototype);
	Spriter.prototype.constructor = Spriter;

	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Spriter = Spriter;
}());
////////////////////////////////////////////////////////
// actor->Spriter->Phaser.Sprite
(function() {
	'use strict';

	function Actor(state, image) {

		this.state = state;
		this.game = state.game;

		// 父类构造调用
		window['FKFramework'].Spriter.call(this, state, image);

		this.isPinnedToGround = false;
	}

	Actor.prototype = Object.create(window['FKFramework'].Spriter.prototype);
	Actor.prototype.constructor = Actor;

	// 获取到目标的角度
	Actor.prototype.getAngleTo = function(target) {

		var angle;
		if (target.x || target.y) {

			angle = Math.atan2(target.x - this.x, target.y - this.y);
		}

		return angle;
	};


	// Export the object
	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Actor = Actor;
}());
////////////////////////////////////////////////////////
// mob->actor->Spriter->Phaser.Sprite
(function() {
	'use strict';

	function Mob(state, image) {

		// 父类构造
		window['FKFramework'].Actor.call(this, state, image);

		// Mob 属性
		this.alive = true;
		this.health = 100;
		this.maxHealth = this.health;
		this.isDamaged = false;
		this.damageBlinkLast = 0;
		this.tint = 0xffffff;
	}

	Mob.prototype = Object.create(window['FKFramework'].Actor.prototype);
	Mob.prototype.constructor = Mob;

	Mob.prototype.update = function() {

		window['FKFramework'].Actor.prototype.update.call(this);

		// 如果出了屏幕，则自杀
		if (this.y > CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO + 200) {
			this.kill();
			return;
		}

		// 更新颜色
		this.updateTint();
	};

	// 更新颜色
	Mob.prototype.updateTint = function() {
		// 更新闪烁
		if (this.isDamaged) {
			this.damageBlinkLast -= 1;

			if (this.damageBlinkLast < 0) {
				this.isDamaged = false;		// 不需要继续闪烁了
			}
		}

		if (this.isDamaged) {
			this.tint = 0xff0000;
		} else {
			this.tint = 0xffffff;
		}
	};

	// 受到伤害
	Mob.prototype.takeDamage = function(damage) {

		this.health -= damage;	// HP减少

		if (this.health <= 0) {
			this.kill();
		} else {
			this.blink();
		}
	};

	// 启动闪烁
	Mob.prototype.blink = function() {
		this.isDamaged = true;
		this.damageBlinkLast = CONFIG.BLINK_DAMAGE_TIME;
	};

	// 复活
	Mob.prototype.revive = function() {
		this.health = this.maxHealth;
	};

	// 死亡
	Mob.prototype.die = function() {
		this.kill();
	};


	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Mob = Mob;
}());
////////////////////////////////////////////////////////
// shoot
(function() {
	'use strict';

	function Shoot(state, shooter, shootConfig) {

		this.state = state;
		this.game = state.game;

		this.shooter = shooter;
		this.shootConfig = shootConfig;
		
		this.bullets = [];

		this.t = [];

		for (var j = 0; j < shootConfig.nShoots; j++) {
			this.t[j] = window.setTimeout((function(that, x) {
				return function() 
				{
					var config = that.shootConfig;
					var shootAngle;	// 射击角度
					if (config.shootAngle === 999) { 
						shootAngle = that.shooter.getAngleTo(that.state.player);
					} else if (config.shootAngle === -999) {
						shootAngle = that.game.rnd.realInRange(0, 2 * Math.PI);
					} else {
						shootAngle = config.shootAngle;
					}
					shootAngle += x * config.shootRotationSpeed;

					// 计算子弹范围
					var bulletAngleStep = 0;
					if (config.nBullets > 1) {
						if (config.bulletSpread === 0) { // 0表示 360度无死角射击
							bulletAngleStep = 2 * Math.PI / config.nBullets;
						} else {
							bulletAngleStep = config.bulletSpread;
						}
					}

					// One salve 

					for (var i = 0; i < config.nBullets; i++) 
					{
						if (that.state.bulletPoolsMob[config.bulletType].countDead() > 0) 
						{
							that.bullets[i] = that.state.bulletPoolsMob[config.bulletType].getFirstExists(false);
							
							var angle;
							if (config.bulletSpread === 0) {
								angle = shootAngle + (i * bulletAngleStep);
							} else {
								angle = shootAngle + ((i - (config.nBullets - 1) / 2) * bulletAngleStep);
							}
							if (angle < 0 || angle >= 2 * Math.PI) {
								angle = angle % (2 * Math.PI);
							}

							that.bullets[i].revive(shooter, angle);
						}
					}
				};
			})(this, j), j * shootConfig.shootDelay);
		}
	}

	// 射击功能 死亡。参数为是否清除其子弹
	Shoot.prototype.die = function(bulletCancel) {
		// 清除该射击对应的全部子弹
		if (bulletCancel) {
			this.bullets.forEach(function(bullet) {
				bullet.kill();
			});
		}

		// 清除全部Timer定时器
		this.t.forEach(function(timer) {
			window.clearTimeout(timer);
		});
	};

	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Shoot = Shoot;
}());
////////////////////////////////////////////////////////
// enemy->mob->actor->Spriter->Phaser.Sprite
(function() {
	'use strict';

	function Enemy(state, image) {

		// 调用父类构造
		window['FKFramework'].Mob.call(this, state, image);

		this.shootDelay = 1000;
		this.speed = 50;
		this.points = 100;
		this.bulletType = 0;
		this.bulletSpeed = 100;
		this.bulletCancel = false;		// 是否死亡时清除其产生的全部子弹

		this.lootProbability = 0.2;		// 物品掉落率
		this.lootType = 1;

		this.shootConfig = {};
		this.shoots = [];
	}

	Enemy.prototype = Object.create(window['FKFramework'].Mob.prototype);
	Enemy.prototype.constructor = Enemy;

	// 敌人更新
	Enemy.prototype.update = function() {

		// 父类update
		window['FKFramework'].Mob.prototype.update.call(this);

		// 攻击行为
		if (this.alive && // 自身生存状态
			this.state.player.alive && // 主角飞机生存状态
			this.y < this.state.player.y - this.game.height / 5 * CONFIG.PIXEL_RATIO && 	// 敌人在主角飞机下面
			this.state.time.now > this.nextShotAt && // 射击非CD
			this.state.bulletPoolsMob[this.bulletType].countDead() > 0) // 子弹池还足够
		{
			this.shoot(this.shootConfig);
		}
		/*
		else
		{
			if(!this.alive)
				console.log("自身死亡，不射击");
			if(!this.state.player.alive)
				console.log("玩家死亡，不射击");
			if(this.state.bulletPoolsMob[this.bulletType].countDead() <= 0)
				console.log("子弹池空了，不射击");
		}
		*/
	};

	// 射击
	Enemy.prototype.shoot = function(shootConfig) {
		this.shoots.push(new window['FKFramework'].Shoot(this.state, this, shootConfig));
		this.nextShotAt = this.state.time.now + this.shootDelay;	// 设置下一次射击时间
	};

	// 死亡
	Enemy.prototype.die = function() {

		// 调用父类死亡行为
		window['FKFramework'].Mob.prototype.die.call(this);

		// 清除预备子弹
		var bulletCancel = this.bulletCancel;
		this.shoots.forEach(function(shoot) {
			shoot.die(bulletCancel);
		});

		// 随机掉落物品
		if (this.state.rnd.realInRange(0, 1) < this.lootProbability) {
			this.loot(this.lootType);
		}

		// 根据飞机生命值类型来确定其毁灭声音
		var s = this.maxHealth;
		var f = 0;
		if (s < 80) {
			f = 1;
		} else if (s < 200) {
			f = 2;
		} else if (s < 500) {
			f = 3;
		} else {
			f = 4;
		}
		this.game.sound['explosion_' + f].play();
	};

	// 复活
	Enemy.prototype.revive = function() {
		if (!this.isPinnedToGround) {
			// 设置飞机重生位置
			this.reset(this.game.rnd.between(16, CONFIG.WORLD_WIDTH * 24 * CONFIG.PIXEL_RATIO - 16), -32);
			this.body.velocity.y = (this.speed + this.state.scrollSpeed) * CONFIG.PIXEL_RATIO;
		} else {
			// 设置地面炮台重生位置，随其进行地面网格对其
			this.reset((this.game.rnd.integerInRange(1, CONFIG.WORLD_WIDTH) - 0.5) * 24 * CONFIG.PIXEL_RATIO, -32);
			this.body.velocity.y = this.state.scrollSpeed * CONFIG.PIXEL_RATIO;
		}

		// 随机设置其初始射击时间
		this.nextShotAt = this.game.rnd.integerInRange(0, this.shootDelay);

		// 调用父类复活函数
		window['FKFramework'].Mob.prototype.revive.call(this);
	};

	// 死亡掉落
	Enemy.prototype.loot = function(type) {
		var bonus = this.state.bonusPool.getFirstExists(false);	// 获取掉落物品对象
		bonus.updateClass();
		bonus.reset(this.x, this.y);	// 设置掉落对象位置
		bonus.body.velocity.y = 40 * CONFIG.PIXEL_RATIO;
		bonus.body.angularVelocity = 30;
	};

	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Enemy = Enemy;
}());

////////////////////////////////////////////////////////
// 子类敌人对象：小飞机，船只，大型旗舰 enemy->mob->actor->Spriter->Phaser.Sprite
(function() {
	'use strict';
	////////////////////////////////////////////////////////
	// 小飞机
	function Plane(state) {
		window['FKFramework'].Enemy.call(this, state, 'mob_plane');

		this.maxHealth 		= 30;	// 最大HP
		this.speed 			= 60;	// 移动速度
		this.shootDelay 	= 3000;	// 攻击间隔
		this.bulletSpeed 	= 125;	// 子弹移动速度
		this.points 		= 100;	// 奖励分数
		this.lootProbability = 0.1;	// 物品掉落率

		this.shootConfig = {
			bulletType: 0,			// 子弹类型，0 小型子弹 1 中型子弹
			nBullets: 1,
			bulletDelay: 0,
			bulletAngle: 0,
			bulletSpread: 0,

			nShoots: 1,
			shootDelay: 0,
			shootAngle: 999,
			shootRotationSpeed: 0
		};

		this.planeClass = state.rnd.integerInRange(0, 7);	// 小飞机类型，随机8种

		// 设置动画
		var offset = this.planeClass * 3;
		this.animations.add('idle', [offset + 1], 5, true);
		this.animations.add('left', [offset + 0], 5, true);
		this.animations.add('right', [offset + 2], 5, true);
		this.play('idle');
	}

	Plane.prototype = Object.create(window['FKFramework'].Enemy.prototype);
	Plane.prototype.constructor = Plane;

	Plane.prototype.update = function() {
		window['FKFramework'].Enemy.prototype.update.call(this);
	};
	////////////////////////////////////////////////////////
	// 船只
	function Vessel(state) {
		window['FKFramework'].Enemy.call(this, state, 'mob_vessel_1');

		this.maxHealth = 100;
		this.speed = 30;
		this.shootDelay = 2000;
		this.points = 500;
		this.lootProbability = 0.5;

		this.shootConfig = {
			bulletType: 0,
			nBullets: 5,
			bulletDelay: 0,
			bulletAngle: 0,
			bulletSpread: 0.2,

			nShoots: 1,
			shootDelay: 0,
			shootAngle: 999,
			shootRotationSpeed: 0
		};

		this.animations.add('idle', [0], 5, true);
		this.play('idle');
	}

	Vessel.prototype = Object.create(window['FKFramework'].Enemy.prototype);
	Vessel.prototype.constructor = Vessel;

	Vessel.prototype.update = function() {
		window['FKFramework'].Enemy.prototype.update.call(this);
	};
	////////////////////////////////////////////////////////
	// 大型旗舰
	function Flagship(state) {
		window['FKFramework'].Enemy.call(this, state, 'mob_flagship_1');

		this.maxHealth 			= 750;
		this.speed 				= 10;
		this.shootDelay 		= 3000;
		this.points 			= 2000;
		this.lootProbability 	= 0.8;
		this.bulletCancel 		= true;		// 死亡后清除全部子弹
	
		this.shootConfig = {
			bulletType: 1,
			nBullets: 7,
			bulletDelay: 0,
			bulletAngle: 0,
			bulletSpread: 0.2,

			nShoots: 3,
			shootDelay: 500,
			shootAngle: 0,
			shootRotationSpeed: 0.2
		};

		this.animations.add('idle', [0], 5, true);
		this.play('idle');
	}

	Flagship.prototype = Object.create(window['FKFramework'].Enemy.prototype);
	Flagship.prototype.constructor = Flagship;

	Flagship.prototype.update = function() {
		window['FKFramework'].Enemy.prototype.update.call(this);
	};


	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Plane = Plane;
	window['FKFramework'].Vessel = Vessel;
	window['FKFramework'].Flagship = Flagship;
}());
////////////////////////////////////////////////////////
// enemy type: 炮台
(function() {
	'use strict';

	function Turret(state) {
		window['FKFramework'].Enemy.call(this, state, 'mob_turret_1');

		this.maxHealth 			= 150;
		this.speed 				= 0;
		this.isPinnedToGround 	= true;
		this.bulletType 		= 1;
		this.shootDelay 		= 5000;
		this.points 			= 5000;
		this.lootProbability 	= 0.5;

		this.shootConfig = {
			bulletType: 1,
			nBullets: 4,
			bulletDelay: 0,
			bulletAngle: 0,
			bulletSpread: 0,

			nShoots: 3,
			shootDelay: 50,
			shootAngle: 0,
			shootRotationSpeed: 0.1
		};

		// 炮台发射动作
		var preshoot = this.animations.add('pre-shoot', [0, 1, 2, 3, 4, 5, 6, 7, 8], 15, false);
		preshoot.onComplete.add(function(sprite) {
			window['FKFramework'].Enemy.prototype.shoot.call(this, this.shootConfig);
			sprite.play('shoot');
		}, this);
		// 发射完毕动作
		var shoot = this.animations.add('shoot', [8, 7, 6, 5, 4, 3, 2, 1, 0], 15, false);
		shoot.onComplete.add(function(sprite) {
			sprite.play('idle');
		}, this);

		this.animations.add('idle', [0], 5, true);
		
		// 默认先闲置
		this.play('idle');
	}

	Turret.prototype = Object.create(window['FKFramework'].Enemy.prototype);
	Turret.prototype.constructor = Turret;

	Turret.prototype.update = function() {
		window['FKFramework'].Enemy.prototype.update.call(this);
	};

	// 炮台的射击是先调用预先发射动画，然后发射，然后播放发射完毕动作
	Turret.prototype.shoot = function() {
		this.play('pre-shoot');
	};

	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Turret = Turret;
}());
////////////////////////////////////////////////////////
// player->Mob
(function() {
	'use strict';

	function Player(state) {
		this.state = state;
		this.game = state.game;

		this.playerClass = this.game.rnd.between(1, 4);	// 随机玩家的飞机
		this.playerStats = CONFIG.CLASS_STATS[this.playerClass - 1];
		this.classStats = this.playerStats;

		// 父类构造
		window['FKFramework'].Mob.call(this, state, 'player_' + this.playerClass);

		// 设置该飞机物理体
		this.body.setSize(7 * CONFIG.PIXEL_RATIO, 7 * CONFIG.PIXEL_RATIO, 0, 3 * CONFIG.PIXEL_RATIO);

		// 设置玩家飞机起始位置
		this.ResetBeginPos();
		
		// 设置玩家动画
		this.animations.add('left_full', [0], 5, true);
		this.animations.add('left', [1], 5, true);
		this.animations.add('idle', [2], 5, true);
		this.animations.add('right', [3], 5, true);
		this.animations.add('right_full', [4], 5, true);
		this.play('idle');

		// 设置其初始生命值
		this.health = this.playerStats.health;

		// 设置其初始其他属性状态
		this.updateStats();

		// 允许直接射击
		this.nextShotAt = 0;

        // 设置上一帧更新时间
		this.lastUpdate = 0;

		// 添加该对象
		this.game.add.existing(this);

		// 创建对象池
		this.createBulletPool();
		
		// 设置初始移动目标位
		this.targetPosX = 0;
		this.targetPosY = 0;
	}

	Player.prototype = Object.create(window['FKFramework'].Mob.prototype);
	Player.prototype.constructor = Player;

	// 重置玩家飞机初始位置
	Player.prototype.ResetBeginPos = function() {
		this.x = this.game.width / 2;
		this.y = this.game.height / 4 * 3;
	};

	// 创建自身子弹池
	Player.prototype.createBulletPool = function() {
		this.bulletPool = this.game.add.group();
		this.bulletPool.enableBody = true;
		this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
		this.bulletPool.createMultiple(100, 'player_bullet');
		this.bulletPool.setAll('anchor.x', 0.5);
		this.bulletPool.setAll('anchor.y', 0.5);
		this.bulletPool.setAll('scale.x', CONFIG.PIXEL_RATIO);
		this.bulletPool.setAll('scale.y', CONFIG.PIXEL_RATIO);
		this.bulletPool.setAll('outOfBoundsKill', true);
		this.bulletPool.setAll('checkWorldBounds', true);

		this.updateBulletPool();
	};

	// 帧更新
	Player.prototype.update = function() {
		window['FKFramework'].Mob.prototype.update.call(this);

		this.updateInputs();    // 更新用户输入
		this.updateSprite();    // 更新主角精灵动画
		this.updateBullets();   // 更新子弹组
	};

	// 更新自己状态
	Player.prototype.updateStats = function() {
		this.speed = this.playerStats.speed * CONFIG.PIXEL_RATIO;
		this.accel = this.speed * this.playerStats.accel;
		this.strength = this.playerStats.strength;
		this.shootDelay = 2000 / this.playerStats.rate;
	};

	// 更新用户输入
	Player.prototype.updateInputs = function() {
		var cursors = this.state.cursors;
		var keyboard = this.state.input.keyboard;

		if (this.state.gameState === 0) { 			// 游戏开始之前
		    // PC platform
			if (keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
				this.state.statePreplay2Play();
			}
		    // Mobile platform
			if (this.game.input.activePointer.isDown) {
			    this.state.statePreplay2Play();
			}
		} else if (this.state.gameState === 2) { 	// 游戏结束
            // PC platform
		    if (keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
		        this.game.state.start('menu');
		    }
            // Mobile platform
		    if (this.game.input.activePointer.isDown) {
		        this.game.state.start('menu');
		    }
		} else { 									// 正常状态
		    var delta = (this.game.time.now - this.lastUpdate) / 1000; // 间隔时间
		    this.lastUpdate = this.game.time.now;	// 上一帧更新时间

			if(Phaser.Device.desktop && (!CONFIG.DEBUG.mobileSimulate))
		    {// PC platform
		        if ((cursors.left.isDown || cursors.left2.isDown) && this.x > 20 * CONFIG.PIXEL_RATIO) {
		            this.moveLeft(delta);
		        } else if ((cursors.right.isDown || cursors.right2.isDown) && this.x < (CONFIG.WORLD_WIDTH * 24 - 20) * CONFIG.PIXEL_RATIO) {
		            this.moveRight(delta);
		        } else {
		            this.floatH(delta);
		        }

		        if ((cursors.up.isDown || cursors.up2.isDown)&& this.y > 30 * CONFIG.PIXEL_RATIO) {
		            this.moveUp(delta);
		        } else if ((cursors.down.isDown || cursors.down2.isDown) && this.y < (CONFIG.GAME_HEIGHT - 20) * CONFIG.PIXEL_RATIO) {
		            this.moveDown(delta);
		        } else {
		            this.floatV(delta);
		        }
		    }
		    else
		    {// Mobile platform or mobile simulate
		        if (this.game.input.activePointer.isDown)
                {
                    // 点击范围过近
                    if (!Phaser.Rectangle.contains(this.body, this.game.input.activePointer.x + this.state.camera.x, this.game.input.activePointer.y))
                    {
						this.targetPosX = this.game.input.activePointer.x + this.state.camera.x;
						this.targetPosY = this.game.input.activePointer.y;
						// left
						if (this.game.input.activePointer.x + this.state.camera.x < this.x && this.x <= 20 * CONFIG.PIXEL_RATIO){
							this.targetPosX = this.x;
						}
						// right
						else if (this.game.input.activePointer.x + this.state.camera.x > this.x && this.x >= ((CONFIG.WORLD_WIDTH * 24 - 20) * CONFIG.PIXEL_RATIO)){
							this.targetPosX = this.x;
						}
						// up
						if (this.game.input.activePointer.y > this.y  && this.y >= (CONFIG.GAME_HEIGHT - 20) * CONFIG.PIXEL_RATIO){ 
							this.targetPosY = this.y;
						}
						// down
						else if (this.game.input.activePointer.y < this.y  && this.y < 30 * CONFIG.PIXEL_RATIO){
							this.targetPosY = this.y;
						}
						
						{
                   			// 移动目标点已经足够接近
                   			if (!Phaser.Rectangle.contains(this.body, this.targetPosX, this.targetPosY))
                   			{
                   				this.game.physics.arcade.moveToXY(this, this.targetPosX, this.targetPosY, this.speed);
                   			}
                   			else
                   			{
                   				//console.log("Too close to target,stop moving");
                   				this.body.velocity.x = 0;
                   				this.body.velocity.y = 0;
                   			}
                   			/*
                   			console.log("PLANE x=" + this.x + " y=" + this.y
                   			+ " BODY=" + this.body
                   			+ " INPUT x=" + this.game.input.activePointer.x + " y=" + this.game.input.activePointer.y
                   			+ " CAMERA x=" + this.state.camera.x
                   			+ " TARGET x=" + this.targetPosX + " y=" + this.targetPosY);
                   			*/
						}
                    }
                }
                else {
					// left
					if (this.x <= 20 * CONFIG.PIXEL_RATIO){
						this.body.velocity.x = 0;
					}
					// right
					else if (this.x >= ((CONFIG.WORLD_WIDTH * 24 - 20) * CONFIG.PIXEL_RATIO)){
						this.body.velocity.x = 0;
					}
					// up
					if (this.y >= (CONFIG.GAME_HEIGHT - 20) * CONFIG.PIXEL_RATIO){ 
						this.body.velocity.y = 0;
					}
					// down
					else if (this.y < 30 * CONFIG.PIXEL_RATIO){
						this.body.velocity.y = 0;
					}
                	
                   // 位置纠正
                   this.floatH(delta);
                   this.floatV(delta);
                }
            }

			// 自动开火
			// if (keyboard.isDown(Phaser.Keyboard.SPACEBAR)) 
			{
				this.fire();
			}
		}
	};

    // 更新精灵动画
	Player.prototype.updateSprite = function() {
	    var spd = this.body.velocity.x;

		if (spd < -this.speed / 4 * 3) {
			this.play('left_full');
		} else if (spd > this.speed / 4 * 3) {
			this.play('right_full');
		} else if (spd < -this.speed / 5) {
			this.play('left');
		} else if (spd > this.speed / 5) {
			this.play('right');
		} else {
			this.play('idle');
		}
	};

    // PC平台移动
	Player.prototype.moveLeft = function(delta) {
		this.body.velocity.x -= this.accel * delta;
		if (this.body.velocity.x < -this.speed) {
			this.body.velocity.x = -this.speed;
		}
	};

	Player.prototype.moveRight = function(delta) {
		this.body.velocity.x += this.accel * delta;
		if (this.body.velocity.x > this.speed) {
			this.body.velocity.x = this.speed;
		}
	};

	Player.prototype.moveUp = function(delta) {
		this.body.velocity.y -= this.accel * delta;
		if (this.body.velocity.y < -this.speed) {
			this.body.velocity.y = -this.speed;
		}
	};

	Player.prototype.moveDown = function(delta) {
		this.body.velocity.y += this.accel * delta;
		if (this.body.velocity.y > this.speed) {
			this.body.velocity.y = this.speed;
		}
	};

	Player.prototype.floatH = function(delta) {

		if (this.body.velocity.x > 0) {
			this.body.velocity.x -= this.accel * delta;
			if (this.body.velocity.x < 0) {
				this.body.velocity.x = 0;
			}
		} else {
			this.body.velocity.x += this.accel * delta;
			if (this.body.velocity.x > 0) {
				this.body.velocity.x = 0;
			}
		}
	};

	Player.prototype.floatV = function(delta) {

		if (this.body.velocity.y > 0) {
			this.body.velocity.y -= this.accel * delta;
			if (this.body.velocity.y < 0) {
				this.body.velocity.y = 0;
			}
		} else {
			this.body.velocity.y += this.accel * delta;
			if (this.body.velocity.y > 0) {
				this.body.velocity.y = 0;
			}
		}
	};

    // 开火
	Player.prototype.fire = function () {
	    if (!this.alive) {
	        return; // 主角已死
	    }
		if (this.nextShotAt > this.game.time.now) {
			return; // 开火CD中
		}

        // 预算下次开火时间
		this.nextShotAt = this.game.time.now + this.shootDelay;

        // 从子弹池中找到子弹，设置其位置
		var bullet = this.bulletPool.getFirstExists(false);
		bullet.reset(this.x, this.y - 20);
        // 主角的子弹速度
		bullet.body.velocity.y = -500 * CONFIG.PIXEL_RATIO;

        // 播放子弹声音
		this.PlayShootBulletSound();
	};

    // 播放主角子弹发射声音
	Player.prototype.PlayShootBulletSound = function () {
	    var s = this.strength,
			f;

	    if (s < 100) {
	        f = 1;
	    } else if (s < 120) {
	        f = 2;
	    } else if (s < 140) {
	        f = 3;
	    } else if (s < 160) {
	        f = 4;
	    } else {
	        f = 5;
	    }

	    this.game.sound['shoot_player_' + f].play('', 0, 0.25);
	};

    // 播放拾取声音
	Player.prototype.PlayCollectUpgradeSound = function () {
	    this.state.sound['collect_1'].play();
	};

    // 更新主角子弹
	Player.prototype.updateBullets = function() {
		this.bulletPool.forEachAlive(function(bullet) {
			if (bullet.y < -200) {
				bullet.kill();
				return;
			}
		}, this);
	};

    // 根据威力，更新主角的子弹类型
	Player.prototype.updateBulletPool = function() {
		var s = this.strength,
			f;

		if (s < 100) {
			f = 0;
		} else if (s < 120) {
			f = 1;
		} else if (s < 160) {
			f = 2;
		} else {
			f = 3;
		}

		this.bulletPool.forEach(function(bullet) {
			bullet.animations.add('idle', [f], 5, true);
			bullet.play('idle');
		}, null);
	};

    // 拾取道具
	Player.prototype.collectUpgrade = function(upgrade) {
		if (upgrade === 0) {
			this.playerStats.strength += 10;

		} else if (upgrade === 1) {
			this.playerStats.rate += 1;

		} else if (upgrade === 2) {
			this.playerStats.speed += 10;

		} else {
			this.playerStats.accel += 1;
		}

		this.updateStats();             // 更新状态
		this.updateBulletPool();        // 根据威力，更新主角的子弹类型
		this.PlayCollectUpgradeSound(); // 播放声音
	};

	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Player = Player;
}());
////////////////////////////////////////////////////////
// bullet->Spriter->Phaser.Sprite
(function() {
	'use strict';

	function Bullet(state, type) {

		this.state = state;
		this.game = state.game;

		window['FKFramework'].Spriter.call(this, state, 'mob_bullet_' + (type + 1));

		this.type = 0;

		this.energy     = 30;       // 单子弹默认伤害
		this.speed      = 120;
		this.shooter    = undefined;
	}

	Bullet.prototype = Object.create(window['FKFramework'].Spriter.prototype);
	Bullet.prototype.constructor = Bullet;

    // 复活重置子弹方向和射击者
	Bullet.prototype.revive = function(shooter, angle) {
		this.shooter = shooter;

		this.reset(shooter.x, shooter.y);
		this.body.velocity.x = (this.speed * Math.sin(angle)) * CONFIG.PIXEL_RATIO;
		this.body.velocity.y = (this.speed * Math.cos(angle)) * CONFIG.PIXEL_RATIO;
	};

	Bullet.prototype.update = function() {
	    if (!this.alive) {
	        return;
	    }
        // 父类update
		window['FKFramework'].Spriter.prototype.update.call(this);

		// 出了屏幕就自杀，可能各种方向
		var safeRange = 20;
		if (this.x < -safeRange * CONFIG.PIXEL_RATIO ||
			this.x > (CONFIG.WORLD_WIDTH * 24 + safeRange) * CONFIG.PIXEL_RATIO ||
			this.y < -safeRange * CONFIG.PIXEL_RATIO ||
			this.y > (CONFIG.GAME_HEIGHT + safeRange) * CONFIG.PIXEL_RATIO) 
		{
			this.kill();
		}
	};

	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Bullet = Bullet;
}());
////////////////////////////////////////////////////////
// Collectible->Actor->Spriter->Phaser.Sprite
(function() {
	'use strict';

	function Collectible(state, image) {
		window['FKFramework'].Actor.call(this, state, image);

		this.alive = true;
		this.updateClass();
	}

	Collectible.prototype = Object.create(window['FKFramework'].Actor.prototype);
	Collectible.prototype.constructor = Collectible;

	Collectible.prototype.update = function() {
		window['FKFramework'].Actor.prototype.update.call(this);

		// 出屏幕就自杀，只可能单向
		if (this.y > CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO + 200) {
			this.kill();
			return;
		}
	};

	Collectible.prototype.updateClass = function() {
		this.bonusClass = this.state.rnd.integerInRange(0, 3);

		// Ugly hack to skip the last spritesheet row (4 instead of 3)
		var fakeClass = this.bonusClass;
		if (fakeClass === 3) {
			fakeClass = 4;
		}

		var offset = fakeClass * 3;

		this.animations.add('idle', [0 + offset, 1 + offset, 2 + offset, 1 + offset], 15, true);
		this.play('idle');
	};

	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Collectible = Collectible;
}());
////////////////////////////////////////////////////////
// cloud->Mob->Actor->Spriter->Phaser.Sprite
(function() {
	'use strict';

	function Cloud(state) {
		window['FKFramework'].Mob.call(this, state, 'clouds');

		this.speed = 0;
		this.type = 0;

		this.animations.add('idle_0', [0]);
		this.animations.add('idle_1', [1]);
		this.animations.add('idle_2', [2]);
		this.animations.add('idle_3', [3]);
		this.animations.add('idle_4', [4]);
		this.animations.add('idle_5', [5]);
		this.animations.add('idle_6', [6]);
		this.animations.add('idle_7', [7]);
	}

	Cloud.prototype = Object.create(window['FKFramework'].Mob.prototype);
	Cloud.prototype.constructor = Cloud;

	Cloud.prototype.update = function() {
		window['FKFramework'].Mob.prototype.update.call(this);
	};

	Cloud.prototype.revive = function() {
		this.reset(
			this.game.rnd.integerInRange(0, CONFIG.WORLD_WIDTH) * 24 * CONFIG.PIXEL_RATIO, -3 * 28 * CONFIG.PIXEL_RATIO
		);

		this.body.velocity.y = (this.game.rnd.realInRange(-1, 1) * CONFIG.CLOUD_WIND_SPEED + CONFIG.CLOUD_WIND_SPEED + this.state.scrollSpeed) * CONFIG.PIXEL_RATIO;

		this.type = this.game.rnd.integerInRange(0, 7);
		this.play('idle_' + this.type);

		// 父类复活函数
		window['FKFramework'].Mob.prototype.revive.call(this);
	};

	window['FKFramework'] = window['FKFramework'] || {};
	window['FKFramework'].Cloud = Cloud;
}());