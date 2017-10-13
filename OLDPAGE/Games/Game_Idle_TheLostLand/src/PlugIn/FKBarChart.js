/**
 * Created by Frankie.W on 2017/3/19.
 */
Phaser.Plugin.FKBarchartPlugin = function (game, parent) {
    Phaser.Plugin.call(this, game, parent);
};

Phaser.Plugin.FKBarchartPlugin.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.FKBarchartPlugin.prototype.constructor = Phaser.Plugin.SamplePlugin;

Phaser.Plugin.FKBarchartPlugin.prototype.createChart = function (game, valueArray, x, y, width, height, label) {
    //valueArray is an array of integers to be graphed
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.labelText = label;
    this.game = game;
    this.graphGroup = this.game.add.group();
    this.graphLabel = this.game.add.text(this.x, this.y - 30, this.labelText, {
        fill: "#000000"
        , font: "Times New Roman"
        , fontSize: 24
    });
    this.lowYAxis = this.game.add.text(this.x, this.y + 180, '', {
        fill: "#000000"
        , font: "Times New Roman"
        , fontSize: 24
    });
    this.highYAxis = this.game.add.text(this.x, this.y, '', {
        fill: "#000000"
        , font: "Times New Roman"
        , fontSize: 24
    });

    this.updateChart(valueArray);
};

Phaser.Plugin.FKBarchartPlugin.prototype.updateChart = function (valueArray) {
    this.vArray = valueArray;
    this.graphGroup.removeAll();
    this.graphBg = new Phaser.Rectangle(this.x, this.y, this.width, this.height);
    this.game.debug.geom(this.graphBg, 'rgb(0,0,0)');
    this.arrayLength = Math.max(valueArray.length, 1);
    this.barWidth = this.width / this.arrayLength;
    this.minValue = this.vArray.reduce(function(a, b) { return a < b? a: b; },0);
    this.maxValue = this.vArray.reduce(function(a, b) { return a > b? a: b; }, 1);
    this.lowYAxis.x = this.x - (12 * this.minValue.toLocaleString().length);
    this.highYAxis.x = this.x - (12 * this.maxValue.toLocaleString().length);
    this.lowYAxis.text = this.minValue.toLocaleString();
    this.highYAxis.text = this.maxValue.toLocaleString();
    //if the nums are all pos/neg, zero will appear somewhere on the y-axis
    this.posGap = Math.max(this.maxValue, 0);
    this.negGap = Math.max(-this.minValue, 0);
    //from y to zeroY are positive values; from zeroY to (y + height) are negative numbers
    this.zeroY = this.y + ((this.height / (this.posGap + this.negGap)) * this.posGap);
    //place bars for each value
    for (var i = 0; i < this.arrayLength; i++) {
        var barLength = 0;
        if (this.vArray[i] < 0) {
            barLength = ((this.y + this.height - this.zeroY) / this.negGap) * -this.vArray[i];
            var bar = new Phaser.Rectangle(this.x + (this.barWidth * i), this.zeroY, this.barWidth - 1, barLength);
            this.game.debug.geom(bar, 'rgb(232, 71, 23)');
        } else if (this.vArray[i] > 0) {
            barLength = ((this.zeroY - this.y) / this.posGap) * this.vArray[i];
            var bar = new Phaser.Rectangle(this.x + (this.barWidth * i), this.zeroY - barLength, this.barWidth - 1, barLength);
            this.game.debug.geom(bar, 'rgb(68, 217, 32)');
        }
    } //end bar for loop
}
