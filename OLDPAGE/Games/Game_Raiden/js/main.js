// main
window.onload = function () {
  'use strict';

  var fkFramework = window['FKFramework'];
  var game = new Phaser.Game(
  	CONFIG.GAME_WIDTH * CONFIG.PIXEL_RATIO, 
  	CONFIG.GAME_HEIGHT * CONFIG.PIXEL_RATIO, 
  	Phaser.AUTO,
  	'gamediv',
  	null, 
  	false, 
  	false
  	);

  game.CONFIG = CONFIG;

  game.state.add('boot', 			fkFramework.Boot);
  game.state.add('preloader', fkFramework.Preloader);
  game.state.add('menu', 			fkFramework.Menu);
  game.state.add('game', 			fkFramework.Game);

  game.state.start('boot');
};