
// 初始化
window.onload = function(){
  var video = document.getElementById('video');
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  var tracker = new tracking.ObjectTracker('face');
  tracker.setInitialScale(2);
  tracker.setStepSize(1);
  tracker.setEdgesDensity(0.15);
  tracking.track('#video', tracker, { camera: true });
  tracker.on('track', window.showTrack);
  // 設置
  var gui = new dat.GUI();
  gui.add(tracker, 'edgesDensity', 0.1, 0.5).step(0.01);
  gui.add(tracker, 'initialScale', 1.0, 10.0).step(0.1);
  gui.add(tracker, 'stepSize', 1, 5).step(0.1);
}

window.showTrack = function (event) {
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  event.data.forEach(function(rect) {
    console.log(rect);
    //show(rect);
    context.strokeStyle = '#a64ceb';
    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    context.font = '11px Helvetica';
    context.fillStyle = "#fff";
    context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
    context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
  });

  //clear();
  //var faces = event.data;
  //for (f in faces) {
    //fill(0xFF, 0x00, 0x84, 0x3F);   // a nice shade of fuchsia
    //noStroke();                     // no border
    //ellipse(faces[f].x, faces[f].y, faces[f].width, faces[f].height);
  //}
}
/*
var points = [];
var canvasP5;
var videoP5;

var vidW = 640;
var vidH = 480;
var vidX = 0;
var vidY = 100;

function setup() {
  videoP5 = createCapture(VIDEO);
  videoP5.id("video");
  videoP5.size(vidW, vidH);
  videoP5.position(vidX, vidY);

  canvasP5 = createCanvas(vidW, vidH);
  canvasP5.position(vidX, vidY);

  var tracker = new tracking.LandmarksTracker();
  tracker.setInitialScale(4);
  tracker.setStepSize(1);
  tracker.setEdgesDensity(0.1);

  tracking.track('#video', tracker, { camera: true });
  tracker.on('track', function(event) {
    if(!event.data) return;
    event.data.landmarks.forEach(function(landmarks) {
      points = [];
      for(var l in landmarks){
        points.push({x: landmarks[l][0], y: landmarks[l][1]});
      }
    });
  });
}

function draw() {
  image(videoP5, 0, 0);
  fill(255, 0, 0);
  // 面部各点
  for (var i = 0; i < points.length; i++) {
    text(i, points[i].x, points[i].y);
  }

  // 眼睛
  if (points.length > 24) {
    ellipse(points[20].x, points[20].y + 10, 50, 50);
    ellipse(points[24].x, points[24].y + 10, 50, 50);
  }
}
*/