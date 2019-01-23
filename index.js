import * as cocoSsd from "@tensorflow-models/coco-ssd";

let modelPromise;
let baseModel = "mobilenet_v2";

window.onload = () => (modelPromise = cocoSsd.load());

const video = document.getElementById("video");
const c = document.getElementById("canvas");
const context = c.getContext("2d");
const button = document.getElementById("run");

let result = null;

const runVideo = async videoElement => {
  let width = videoElement.videoWidth;
  let height = videoElement.videoHeight;

  c.width = width;
  c.height = height;
  context.drawImage(videoElement, 0, 0, width, height);
  context.font = "12px Arial";

  if (result) {
    for (let i = 0; i < result.length; i++) {
      context.beginPath();
      context.rect(...result[i].bbox);
      context.lineWidth = 3;
      context.strokeStyle = "tomato";
      context.fillStyle = "tomato";
      context.stroke();
      context.fillText(
        result[i].score.toFixed(3) + " " + result[i].class,
        result[i].bbox[0],
        result[i].bbox[1] > 10 ? result[i].bbox[1] - 5 : 10
      );
    }
  }

  if (width && height) {
    const model = await modelPromise;
    console.log("model loaded");
    console.time("predict1");
    result = await model.detect(c);
    console.timeEnd("predict1");
    console.log("number of detections: ", result.length);
  }

  window.requestAnimationFrame(() => runVideo(videoElement));
};

video.onplay = () => {
  runVideo(video);
};

// Get webcam
button.onclick = () =>
  navigator.mediaDevices
    .getUserMedia({
      video: { width: window.innerWidth, height: window.innerHeight },
      audio: false
    })
    .then(stream => {
      button.style.display = "none";
      video.srcObject = stream;
      video.play();
    })
    .catch(console.error);
