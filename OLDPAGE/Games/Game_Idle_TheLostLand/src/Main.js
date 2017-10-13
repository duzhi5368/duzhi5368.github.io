//--------------------------------------------------------
var Phaser;
var MACRO_WINDOW_HEIGHT;
var MACRO_WINDOW_WIDTH;

//--------------------------------------------------------
(function (Phaser) {
    "use strict";

    /*
    function func_FKGetIEVersion() {
        var ua = window.navigator.userAgent;

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    }
    alert('IE: ' + func_FKGetIEVersion());
    */
    //--------------------------------------------------------
    var game = new Phaser.Game(MACRO_WINDOW_WIDTH, MACRO_WINDOW_HEIGHT, Phaser.AUTO, 'FKGame');
    game.musicPlayer = null;
    /*
    var newgorundsIO = new Newgrounds.io.core(NEW_GROUND_ID, NEW_GROUND_ID2);
    newgorundsIO.callComponent("Gateway.getDatetime", {}, function(result) {
        if (result.success) {
            console.log('当前NewGrounds服务器时间为： '+result.datetime);
        } else {
            console.log('访问NewGrounds失败!', result.error.message);
        }
    });
    */
    //--------------------------------------------------------
    game.state.add('State_Boot', GameApp.State_Boot);
    game.state.add('State_FlashLogo', GameApp.State_FlashLogo);
    game.state.add('State_Preload', GameApp.State_Preload);
    //--------------------------------------------------------
    game.state.start('State_Boot');
    //--------------------------------------------------------
}(Phaser));