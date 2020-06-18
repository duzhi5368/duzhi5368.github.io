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

  showStats();
}

function draw() {
  image(videoP5, 0, 0);
  fill(255, 0, 0);
  /*
  // 面部各点
  for (var i = 0; i < points.length; i++) {
    text(i, points[i].x, points[i].y);
  }
   */


  /*
  // 眼睛
  if (points.length > 24) {
    ellipse(points[20].x, points[20].y + 10, 50, 50);
    ellipse(points[24].x, points[24].y + 10, 50, 50);
  }
  */
}

function showStats(){
  var stats = new Stats();
  stats.showPanel( 1 );
  document.body.appendChild( stats.dom );

  var canvas = document.createElement( 'canvas' );
  canvas.width = 512;
  canvas.height = 512;
  document.body.appendChild( canvas );

  var context = canvas.getContext( '2d' );
  context.fillStyle = 'rgba(127,0,255,0.05)';

  function animate() {
    var time = performance.now() / 1000;
    context.clearRect( 0, 0, 512, 512 );

    stats.begin();

    for ( var i = 0; i < 2000; i ++ ) {
      var x = Math.cos( time + i * 0.01 ) * 196 + 256;
      var y = Math.sin( time + i * 0.01234 ) * 196 + 256;

      context.beginPath();
      context.arc( x, y, 10, 0, Math.PI * 2, true );
      context.fill();
    }

    stats.end();
    requestAnimationFrame( animate );
  }
  animate();
}