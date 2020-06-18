var stats = new Stats();
stats.setMode(2);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '10px';
stats.domElement.style.top = '10px';
stats.domElement.style.zIndex = 100;
document.addEventListener('DOMContentLoaded', function(event) {
    document.body.appendChild(stats.domElement);
});

var objectEmit_ = tracking.ObjectTracker.prototype.emit;
var colorEmit_ = tracking.ColorTracker.prototype.emit;

stats.begin();

tracking.ObjectTracker.prototype.emit = function() {
    stats.end();
    objectEmit_.apply(this, arguments);
};

tracking.ColorTracker.prototype.emit = function() {
    stats.end();
    colorEmit_.apply(this, arguments);
};