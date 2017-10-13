////////////////////////////////////////////////////////
// game config
var CONFIG = {
	GAME_WIDTH:   				320,
	GAME_HEIGHT:  				400,
	PIXEL_RATIO:  				2,

	WORLD_WIDTH: 				16,
	WORLD_HEIGHT: 				150,

	WORLD_SWAP_HEIGHT: 			8,          // 地图边缘宽度缓冲格数

	MOBPOOL_SIZE: 				25,
	BULLETPOOL_SIZE: 			100,
	BULLETPOOL_SIZE_ENNEMY: 	100,
	BONUSPOOL_SIZE: 			20,         // 奖励池大小

	CLOUDPOOL_SIZE: 			10,
	CLOUD_WIND_SPEED: 			20,
	CLOUD_CREATE_DELAY:			3000,		// 云创建的间隔CD

	SCROLL_SPEED: 				40,         // 屏幕卷动速度
	SCROLL_ACCEL: 				15,

	BLINK_DAMAGE_TIME: 			4,			// 受到伤害的闪烁时间

	AUDIO_LEVEL: 				0.5,

	CLASS_STATS: 				[{	
		className: 				'Viper',
		health: 				100,        // 生命值
		speed: 					180,        // 最大速度
		accel: 					8,          // 加速度
		strength: 				100,        // 子弹伤害
		rate: 					8           // 1000 / 该值 = 发射速度
	},{
		className: 				'Cobra',
		health: 				80,
		speed: 					200,
		accel: 					9,
		strength: 				80,
		rate: 					7
	},{
		className: 				'Anaconda',
		health: 				100,
		speed: 					180,
		accel: 					7,
		strength: 				100,
		rate: 					6
	},{
		className: 				'Boa',
		health: 				140,
		speed: 					160,
		accel: 					5,
		strength: 				150,
		rate: 					4
	}],

	DEBUG: {
		bottomInfos: 			false,      // 是否显示底部DEBUG信息
		tileset: 				false,      // 是否显示地图方格
		mobileSimulate:			false,		// 是否进行手机输入模拟
		debugLogInfo:			false,		// 是否开启DEBUG日志输出
	},
};
