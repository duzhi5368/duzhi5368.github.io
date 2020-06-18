 const MODEL_URL = 'models'

// await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
// await faceapi.loadFaceLandmarkModel(MODEL_URL)
// await faceapi.loadFaceRecognitionModel(MODEL_URL)

// const input = document.getElementById('myImage')
// let fullFaceDescriptions = await faceapi.detectAllFaces(input).withFaceLandmarks().withFaceDescriptors()
// fullFaceDescriptions = fullFaceDescriptions.map(fd => fd.forSize(width, height))

// async function LoadModel() {
//     await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
//     // accordingly for the other models:
//     await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
//     await faceapi.loadMtcnnModel(MODEL_URL)
//     await faceapi.loadFaceLandmarkModel(MODEL_URL)
//     await faceapi.loadFaceLandmarkTinyModel(MODEL_URL)
//     await faceapi.loadFaceRecognitionModel(MODEL_URL)
//     await faceapi.loadFaceExpressionModel(MODEL_URL)
    
//     console.log(faceapi.nets)

// //     const detections2 = await faceapi.detectAllFaces(input, new faceapi.TinyFaceDetectorOptions())
// //    // const detections = await faceapi.detectAllFaces(input)
// //     console.log(detections2)
    
// //     // const detectionWithLandmarks = await faceapi.detectSingleFace(input).withFaceLandmarks()
// //     // console.log(detectionWithLandmarks)
// //     const useTinyModel = true
// // const detectionsWithLandmarks = await faceapi.detectAllFaces(input).withFaceLandmarks(useTinyModel)
// //  console.log(detectionsWithLandmarks)
// const referenceImage = document.getElementById("myImgReference");

// const results = await faceapi
//   .detectAllFaces(referenceImage)
//   .withFaceLandmarks()
//   .withFaceDescriptors()

// if (!results.length) {
//   return
// }

// // create FaceMatcher with automatically assigned labels
// // from the detection results for the reference image
// const faceMatcher = new faceapi.FaceMatcher(results)

// const input = document.getElementById('myImg')


// // const Secondresults = await faceapi
// //   .detectAllFaces(input)
// //   .withFaceLandmarks()
// //   .withFaceDescriptors()

// // Secondresults.forEach(fd => {
// //   const bestMatch = faceMatcher.findBestMatch(fd.descriptor)
// //   console.log(bestMatch.toString())
// // })

// const singleResult = await faceapi
//   .detectSingleFace(input)
//   .withFaceLandmarks()
//   .withFaceDescriptor()

// if (singleResult) {
//   const bestMatch = faceMatcher.findBestMatch(singleResult.descriptor)
//   console.log(bestMatch.toString())
// }


// }

//LoadModel();

async function LoadUserImage()
{
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
    // accordingly for the other models:
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
    await faceapi.loadMtcnnModel(MODEL_URL)
    await faceapi.loadFaceLandmarkModel(MODEL_URL)
    await faceapi.loadFaceLandmarkTinyModel(MODEL_URL)
    await faceapi.loadFaceRecognitionModel(MODEL_URL)
    await faceapi.loadFaceExpressionModel(MODEL_URL)
    
    console.log(faceapi.nets)
    const referenceImage = document.getElementById("myImgReference");
     const queryImage1 = document.getElementById('myImg');

     

    const results = await faceapi
  .detectAllFaces(referenceImage)
  .withFaceLandmarks()
  .withFaceDescriptors()
  //results = results.map(fd => fd.forSize(width, height))

if (!results.length) {
  return
}

// create FaceMatcher with automatically assigned labels
// from the detection results for the reference image
const faceMatcher = new faceapi.FaceMatcher(results)

const singleResult = await faceapi
  .detectSingleFace(queryImage1)
  .withFaceLandmarks()
  .withFaceDescriptor()

//singleResult = singleResult.map(fd=>fd.forSize(width,height))

if (singleResult) {
  const bestMatch = faceMatcher.findBestMatch(singleResult.descriptor)
  console.log(bestMatch)
}


const detections = await faceapi.detectAllFaces(queryImage1)

// resize the detected boxes in case your displayed image has a different size then the original
const detectionsForSize = faceapi.resizeResults(detections, { width: queryImage1.width, height: queryImage1.height })
// draw them into a canvas
const canvas = document.getElementById('myCanvas')
canvas.width = queryImage1.width
canvas.height = queryImage1.height
faceapi.drawDetection(canvas, detectionsForSize, { withScore: true })


// const detectionsWithLandmarks = await faceapi
//   .detectAllFaces(queryImage1)
//   .withFaceLandmarks()

// // resize the detected boxes and landmarks in case your displayed image has a different size then the original
// const detectionsWithLandmarksForSize = faceapi.resizeResults(detectionsWithLandmarks, { width: queryImage1.width, height: queryImage1.height })
// // draw them into a canvas
// canvas.width = queryImage1.width
// canvas.height = queryImage1.height
// faceapi.drawLandmarks(canvas, detectionsWithLandmarksForSize, { drawLines: true })
}

LoadUserImage();

