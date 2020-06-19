const webcamElement = document.getElementById('webcam');
const webcam = new Webcam(webcamElement, 'user');
const modelPath = 'models';
let displaySize;
let canvas;
let faceDetection;
let bIsUpdateLogic = false;
let bIsAutoImgProcessing = false;
let minConfidence = 0.9;

// 开启摄像头
$("#webcam-switch").change(function () {
  if(this.checked){
      webcam.start()
          .then(result =>{
             cameraStarted();
             webcamElement.style.transform = "";
             console.log("摄像头开启...");
          })
          .catch(err => {
              displayError('摄像头开启失败', true);
          });
  }
  else {        
      cameraStopped();
      webcam.stop();
      console.log("摄像头关闭...");
  }        
});

function cameraStarted(){
  toggleContrl("detection-switch", true);
  $("#errorMsg").addClass("d-none");
  // 开启列表
  if( webcam.webcamList.length > 1){
    $("#cameraFlip").removeClass('d-none');
  }
}

function cameraStopped(){
  toggleContrl("detection-switch", false);
  $("#errorMsg").addClass("d-none");
  $("#cameraFlip").addClass('d-none');
}

function displayError(err = '', bIsShow){
  if(bIsShow) {
    if (err != '') {
      $("#errorMsg").html(err);
    }
    $("#errorMsg").removeClass("d-none");
  }else{
    $("#errorMsg").addClass("d-none");
  }
}

$('#cameraFlip').click(function() {
    webcam.flip();
    webcam.start()
    .then(result =>{ 
      webcamElement.style.transform = "";
    });
});

// 摄像头启动初始化
$("#webcam").bind("loadedmetadata", function () {
  console.log("摄像头初始化...");
  displaySize = { width:this.scrollWidth, height: this.scrollHeight }
});

// 开启面部识别
$("#detection-switch").change(function () {
  if(this.checked){
    toggleContrl("box-switch", true);
    toggleContrl("landmarks-switch", true);
    toggleContrl("expression-switch", true);
    toggleContrl("age-gender-switch", true);
    toggleContrl("auto-snapshot", true);
    toggleContrl("auto-img-processing", true);
    toggleContrl("face-similarity", true);

    $("#box-switch").prop('checked', true);
    $(".loading").removeClass('d-none');

    Promise.all([
      faceapi.nets.ssdMobilenetv1.load(modelPath),
      faceapi.nets.faceLandmark68TinyNet.load(modelPath),
    ]).then(function(){
      createCanvas();
      startDetection();
    })
  }
  else {
    toggleContrl("box-switch", false);
    toggleContrl("landmarks-switch", false);
    toggleContrl("expression-switch", false);
    toggleContrl("age-gender-switch", false);
    toggleContrl("auto-snapshot", false);
    toggleContrl("auto-img-processing",false);
    toggleContrl("face-similarity", false);

    clearInterval(faceDetection);
    clearCanvas(canvas);
  }        
});

function clearCanvas(thisCanvas){
  if(thisCanvas != null){
    setTimeout(function() {
      thisCanvas.getContext('2d').clearRect(0, 0, thisCanvas.width, thisCanvas.height)
    }, 1000);
  }
}

function createCanvas(){
  if( canvas == null )
  {
    canvas = faceapi.createCanvasFromMedia(webcamElement)
    document.getElementById('canvas-container').append(canvas)
    faceapi.matchDimensions(canvas, displaySize)
  }
}

function toggleContrl(id, show){
  if(show){
    $("#"+id).prop('disabled', false);
    $("#"+id).parent().removeClass('disabled');
  }else{
    $("#"+id).prop('checked', false).change();
    $("#"+id).prop('disabled', true);
    $("#"+id).parent().addClass('disabled');
  }
}

function startDetection(){
  faceDetection = setInterval(async () => {
    const option = new faceapi.SsdMobilenetv1Options({ minConfidence })
    const detections = await faceapi.detectAllFaces(webcamElement, option).withFaceLandmarks(true)
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    if($("#box-switch").is(":checked")){
      faceapi.draw.drawDetections(canvas, resizedDetections)
    }
    if($("#landmarks-switch").is(":checked")){
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    }

    if(bIsUpdateLogic) {
      if (detections.length == 1) {
        displayError('', false);
        var boundingBox = detections[0].alignedRect.box;
        screenshot(boundingBox, 300);
      } else if (detections.length > 1) {
        displayError("摄像头内人脸不止一个", true);
      } else {
        displayError("摄像头内没有人脸", true);
      }
    }
    
    if(!$(".loading").hasClass('d-none')){
      $(".loading").addClass('d-none')
    }
  }, 300)
}


$("#auto-snapshot").change(function () {
  if(this.checked){
    bIsUpdateLogic = true;
  }
  else {
    bIsUpdateLogic = false;
  }
})

$("#auto-img-processing").change(function () {
  if(this.checked){
    bIsAutoImgProcessing = true;
  }
  else {
    bIsAutoImgProcessing = false;
  }
})

function screenshot(boundingBox, picSize){
  var video = document.getElementById('webcam');
  var snapshotContainer = document.getElementById('snapshotContainer');
  var snapshotCanvas = document.getElementById('snapshot');
  if(snapshotCanvas == null) {
    snapshotCanvas = document.createElement("canvas");
    snapshotCanvas.setAttribute('width', '300');
    snapshotCanvas.setAttribute('height', '300');
    snapshotCanvas.setAttribute('id', 'snapshot');
    snapshotContainer.append(snapshotCanvas);
  }

  drawSnapshot(snapshotCanvas, video, boundingBox, picSize);
  grayscal(snapshotCanvas);
}

function drawSnapshot(snapshotCanvas, video, boundingBox, picSize){
  var context = snapshotCanvas.getContext('2d');
  context.fillRect(0, 0, snapshotCanvas.clientWidth, snapshotCanvas.clientHeight);
  if(boundingBox == null || !bIsAutoImgProcessing) {
    context.drawImage(video, 0, 0, snapshotCanvas.clientWidth, snapshotCanvas.clientHeight);
  }else{
    var xScale = picSize / boundingBox.width;
    var yScale = picSize / boundingBox.height;
    var scale = xScale > yScale ? yScale : xScale;
    context.drawImage(video, boundingBox.x, boundingBox.y,
        boundingBox.width, boundingBox.height,
        (snapshotCanvas.clientWidth - picSize) / 2,
        (snapshotCanvas.clientHeight - picSize) / 2,
        boundingBox.width * scale, boundingBox.height * scale);
  }
}

function grayscal(snapshotCanvas){
  if(!bIsAutoImgProcessing){
    return;
  }
  var context = snapshotCanvas.getContext('2d');
  var imageSrc = context.getImageData(0, 0, snapshotCanvas.clientWidth, snapshotCanvas.clientHeight);
  var dataSrc = imageSrc.data;
  var len = dataSrc.length;
  var i = 0;
  var luma = 0;
  for(; i < len; i += 4) {
    luma = dataSrc[i] * 0.2126 + dataSrc[i+1] * 0.7152 + dataSrc[i+2] * 0.0722;
    dataSrc[i] = dataSrc[i+1] = dataSrc[i+2] = luma;
    dataSrc[i+3] = dataSrc[i+3];
  }
  context.putImageData(imageSrc, 0, 0);
}

$("#face-similarity").change(function () {
  var snapshotCanvas = document.getElementById('snapshot');

  var similaritySrcContainer = document.getElementById('similaritySrcContainer');
  var similaritySrcCanvas = document.getElementById('similaritySrc');
  if(similaritySrcCanvas == null) {
    similaritySrcCanvas = document.createElement("canvas");
    similaritySrcCanvas.setAttribute('width', '300');
    similaritySrcCanvas.setAttribute('height', '300');
    similaritySrcCanvas.setAttribute('id', 'similaritySrc');
    similaritySrcContainer.append(similaritySrcCanvas);
  }
  var similarityDstContainer = document.getElementById('similarityDstContainer');
  var similarityDstCanvas = document.getElementById('similarityDst');
  if(similarityDstCanvas == null) {
    similarityDstCanvas = document.createElement("canvas");
    similarityDstCanvas.setAttribute('width', '300');
    similarityDstCanvas.setAttribute('height', '300');
    similarityDstCanvas.setAttribute('id', 'similarityDst');
    similarityDstContainer.append(similarityDstCanvas);
  }

  if(this.checked){
    loadImgToCanvas(similarityDstCanvas, "./image/freeknight.jpg");
    copyCanvasToCanvas(snapshotCanvas, similaritySrcCanvas);
    //var diffSorce = similarityFace(similaritySrcCanvas, similarityDstCanvas);
  }
  else {
    clearCanvas(similaritySrcCanvas);
    clearCanvas(similarityDstCanvas);
  }
})

function loadImgToCanvas(canvas, url){
  var ctx = canvas.getContext('2d');
  var img = new Image();
  img.onload = function () {
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
  };
  img.src = url;
}

function copyCanvasToCanvas(src, dst){
  var ctx = dst.getContext('2d');
  ctx.drawImage(src, 0, 0);
}

function similarityFace(canvas1, canvas2){
  var img1 = new Image();
  img1.src = canvas1.toDataURL();
  var img2 = new Image();
  img2.src = canvas2.toDataURL();
  const descriptor1 = Promise.all(faceapi.computeFaceDescriptor(img1))
  const descriptor2 = Promise.all(faceapi.computeFaceDescriptor(img2))
  const distance = faceapi.utils.round(
      faceapi.euclideanDistance(descriptor1, descriptor2)
  )
  return distance;
}