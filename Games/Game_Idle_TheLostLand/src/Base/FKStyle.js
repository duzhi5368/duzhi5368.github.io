/**
 * Created by Frankie.W on 2017/3/19.
 */

var style;

// this is a wrapped function
(function () {

    // the variables declared here will not be scoped anywhere and will only be accessible in this wrapped function
    var defaultColor = "black",
        highlightColor = "#f0f459";

    style = {
        navitem: {
            base: {
                font: '36pt TheMinion',
                align: 'left',
                srokeThickness: 4
            },
            default: {
                fill: defaultColor,
                stroke: 'rgba(0,0,0,0)'
            },
            inverse: {
                fill: 'black',
                stroke: 'black'
            },
            hover: {
                fill: highlightColor,
                stroke: 'rgba(244, 235, 30, 0.5)'
            }
        }
    };

    for (var key in style.navitem) {
        if (key !== "base") {
            Object.assign(style.navitem[key], style.navitem.base)
        }
    }

})();