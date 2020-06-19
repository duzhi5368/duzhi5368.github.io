const webcamElement = document.getElementById('webcam');
const webcam = new Webcam(webcamElement, 'user');
const modelPath = 'models';
let displaySize;
let canvas;
let faceDetection;
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
              displayError();
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

function displayError(err = ''){
  if(err!=''){
    $("#errorMsg").html(err);
  }
  $("#errorMsg").removeClass("d-none");
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

    clearInterval(faceDetection);
    clearCanvas();
  }        
});

function clearCanvas(){
  if(typeof canvas !== "undefined"){
    setTimeout(function() {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    }, 1000);
  }
}

function createCanvas(){
  if( document.getElementsByTagName("canvas").length == 0 )
  {
    canvas = faceapi.createCanvasFromMedia(webcamElement)
    document.getElementById('webcam-container').append(canvas)
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
    if($("#expression-switch").is(":checked")){
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }
    if($("#age-gender-switch").is(":checked")){
      resizedDetections.forEach(result => {
        const { age, gender, genderProbability } = result
        new faceapi.draw.DrawTextField(
          [
            `${faceapi.round(age, 0)} years`,
            `${gender} (${faceapi.round(genderProbability)})`
          ],
          result.detection.box.bottomRight
        ).draw(canvas)
      })
    }
    
    if(!$(".loading").hasClass('d-none')){
      $(".loading").addClass('d-none')
    }
  }, 300)
}

let delayTime = 1000;
let intervalFunc = null;
$("#auto-snapshot").change(function () {
  if(this.checked){
    intervalFunc = setInterval(onTimer, delayTime);
  }
  else {
    clearInterval(intervalFunc);
  }
})

// 定时任务
function onTimer(){
  var video = document.querySelector('webcam');
  var snapshotCanvas = document.querySelector('snapshot');
  var context = snapshotCanvas.getContext('2d');
  context.fillRect(0, 0, snapshotCanvas.clientWidth, snapshotCanvas.clientHeight);
  context.drawImage(video, 0, 0, snapshotCanvas.clientWidth, snapshotCanvas.clientHeight);
}