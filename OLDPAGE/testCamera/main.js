var video = null;
var canvas = null;
// 初始化
window.onload = function(){
  video = document.getElementById('video');
  canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  // 截屏器
  Webcam.set({
    width: 640,
    height: 480,
    dest_width: 640,
    dest_height: 480,
    cameraId: 'video',
    image_format: 'jpeg',
    jpeg_quality: 90,
    is_gray: true,
  });
  Webcam.attach( '#holder' )
  // 面部跟踪器
  var tracker = new tracking.LandmarksTracker(); //ObjectTracker('face');
  tracker.setInitialScale(4);
  tracker.setStepSize(2);
  tracker.setEdgesDensity(0.1);
  tracking.track('#video', tracker, { camera: true });
  tracker.on('track', window.showTrack);
  // 设置
  var gui = new dat.GUI();
  gui.add(tracker, 'edgesDensity', 0.1, 0.5).step(0.01);
  gui.add(tracker, 'initialScale', 1.0, 10.0).step(0.1);
  gui.add(tracker, 'stepSize', 1, 5).step(0.1);
}

window.showTrack = function (event) {
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  if(!event.data.faces)
    return;
  if(event.data.faces.length != 1) {
    return;
  }
  // 遍历出现的脸部
  event.data.faces.forEach(function(rect) {
    context.strokeStyle = '#00cc00';
    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    context.font = '11px Helvetica';
    context.fillStyle = "#fff";
    context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
    context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
  });
  // 脸部关键点
  event.data.landmarks.forEach(function(landmarks) {
    for(var l in landmarks){
      context.fillText(l, landmarks[l][0], landmarks[l][1]);
    }
  });
  // 截图
  Webcam.snap( function(data_uri) {
    //console.log(data_uri);
    document.getElementById('snapshot').innerHTML =
        '<h1>下面是发给服务器的图片</h1>' +
        '<img src="'+data_uri+'"/>'+
        '<br>'+
        '<p>'+ data_uri + '</p>>'
    ;
  } );
}