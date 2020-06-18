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
  tracker.setStepSize(2);
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
  for (var i = 0; i < points.length; i++) {
    text(i, points[i].x, points[i].y);
  }


  if (points.length > 24) {
    // left eye
    ellipse(points[20].x, points[20].y + 10, 50, 50);

    // right eye
    ellipse(points[24].x, points[24].y + 10, 50, 50);
  }
}
