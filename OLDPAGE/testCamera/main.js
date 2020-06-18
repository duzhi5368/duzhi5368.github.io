var landmarkFeatures = {
  jaw : {
    first: 0,
    last: 8,
    fillStyle: 'yellow',
    closed: false,
  },
  nose : {
    first:15,
    last: 18,
    fillStyle: 'green',
    closed: true,
  },
  mouth : {
    first:27,
    last: 30,
    fillStyle: 'yellow',
    closed: true,
  },
  eyeL : {
    first:19,
    last: 22,
    fillStyle: 'yellow',
    closed: false,
  },
  eyeR : {
    first:23,
    last: 26,
    fillStyle: 'yellow',
    closed: false,
  },
  eyeBrowL : {
    first: 9,
    last: 11,
    fillStyle: 'yellow',
    closed: false,
  },
  eyeBrowR : {
    first:12,
    last: 14,
    fillStyle: 'yellow',
    closed: false,
  },
}

var video = null;
var canvas = null;
var context = null;

var lerpedFacesLandmarks = []
// 初始化
window.onload = function(){
  video = document.getElementById('video');
  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');
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
  context.clearRect(0, 0, canvas.width, canvas.height);
  if(event == null || event.data === undefined)
    return;
  if(!event.data.faces)
    return;
  if(event.data.faces.length != 1)
    return;

  var isLegal = true;       // 这个包围盒是否合法
  // 细节绘制
  event.data.faces.forEach(function(boundingBox, faceIndex) {
    var isShowPoint = false;  // 是否显示点
    var isShowLine = true;    // 是否显示线
    var faceLandmarks = event.data.landmarks[faceIndex]
    // 暂时关闭基本显示
    // simpleDisplayFaceInfo(boundingBox);
    // 脸边包围框
    displayFaceLandmarksBoundingBox(boundingBox, faceIndex, true);
    lerpFacesLandmarks(faceLandmarks)
    // 线，点
    displayFaceLandmarksDot(lerpedFacesLandmarks, isShowPoint, isShowLine)
  });

  // 截图
  if(isLegal) {
    Webcam.snap(function (data_uri) {
      //console.log(data_uri);
      document.getElementById('snapshot').innerHTML =
          '<h1>下面是发给服务器的图片</h1>' +
          '<img src="' + data_uri + '"/>' +
          '<br>' +
          '<textarea rows="40" cols="80">' +
          data_uri +
          '</textarea>'
      ;
    });
  }

  // 判断两帧之间矩阵相似度
  function isBoundingBoxLegal(boundingBox){
    return true;
  }

  function simpleDisplayFaceInfo(rect){
    context.strokeStyle = '#00cc00';
    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    context.font = '11px Helvetica';
    context.fillStyle = "#fff";
    context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
    context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
  }

  function displayFaceLandmarksBoundingBox(boundingBox, faceIndex, isLegal){
    if(isLegal) {
      context.strokeStyle = '#00ff00';
    }else{
      context.strokeStyle = '#ff0000';
    }
    context.strokeRect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
    context.font = '11px Helvetica';
    context.fillStyle = "#fff";
    context.fillText('idx: '+faceIndex, boundingBox.x + boundingBox.width + 5, boundingBox.y + 11);
    context.fillText('x: ' + boundingBox.x + 'px', boundingBox.x + boundingBox.width + 5, boundingBox.y + 22);
    context.fillText('y: ' + boundingBox.y + 'px', boundingBox.x + boundingBox.width + 5, boundingBox.y + 33);
  }

  function lerpFacesLandmarks(newFaceLandmarks){
    for(var i = 0; i < newFaceLandmarks.length; i++){
      if( lerpedFacesLandmarks[i] !== undefined ) continue
      lerpedFacesLandmarks[i] = [
        newFaceLandmarks[i][0],
        newFaceLandmarks[i][1],
      ]
    }
    for(var i = 0; i < newFaceLandmarks.length; i++){
      var lerpFactor = 0.7;
      lerpedFacesLandmarks[i][0] = newFaceLandmarks[i][0] * lerpFactor  + lerpedFacesLandmarks[i][0] * (1-lerpFactor)
      lerpedFacesLandmarks[i][1] = newFaceLandmarks[i][1] * lerpFactor  + lerpedFacesLandmarks[i][1] * (1-lerpFactor)
    }
  }

  function displayFaceLandmarksDot(faceLandmarks, isShowPoint, isShowLine){
    Object.keys(landmarkFeatures).forEach(function(featureLabel){
      displayFaceLandmarksFeature(faceLandmarks, featureLabel, isShowPoint, isShowLine)
    })
  }

  function displayFaceLandmarksFeature(faceLandmarks, featureLabel, isShowPoint, isShowLine){
    var feature = landmarkFeatures[featureLabel]
    // 点
    context.fillStyle = feature.fillStyle
    if(isShowPoint) {
      for (var i = feature.first; i <= feature.last; i++) {
        var xy = faceLandmarks[i]
        context.beginPath();
        context.arc(xy[0], xy[1], 1, 0, 2 * Math.PI);
        context.fill();
      }
    }

    // 线
    if(isShowLine) {
      var feature = landmarkFeatures[featureLabel]
      context.strokeStyle = feature.fillStyle
      context.beginPath();
      for (var i = feature.first; i <= feature.last; i++) {
        var x = faceLandmarks[i][0]
        var y = faceLandmarks[i][1]
        if (i === 0) {
          context.moveTo(x, y)
        } else {
          context.lineTo(x, y)
        }
      }
      if (feature.closed === true) {
        var x = faceLandmarks[feature.first][0]
        var y = faceLandmarks[feature.first][1]
        context.lineTo(x, y)
      }
    }
    context.stroke();
  }
}